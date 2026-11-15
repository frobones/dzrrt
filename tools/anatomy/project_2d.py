"""
Lift the 2D figure's points, channel paths and kata regions onto the 3D body.

Run inside Blender (5.x) on the Z-Anatomy file, scripts in the .blend disabled:

    node tools/anatomy/dump_2d.mjs > temp/proj/input.json
    blender -b --disable-autoexec temp/zanatomy/x/Z-Anatomy/Startup.blend \
        --python tools/anatomy/project_2d.py -- temp/proj/input.json docs/js/data/body-3d.js [render_prefix]

How it works: the 2D figure (300 x 640, midline at x = 150) and the 3D body share
about twenty landmarks (crown, acromion, epicondyles, styloids, trochanter, patella,
malleoli...). A thin-plate spline fitted on those pairs warps any 2D position to a
height and side-to-side position on the 3D body, separately for the front and back
figures. A ray cast from in front of (or behind) the body at that position finds the
muscle or bone surface. Positions are approximate, like the 2D ones they come from.

Output coordinates are glTF's (y up, metres), matching docs/models: Blender's
(x, y, z) becomes (x, z, -y).
"""

import json
import math
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from export_models import select  # importable once the line above puts this folder on the path

CX = 150
STEP = 3  # 2D units between channel samples (about 8 mm on the body)
LIFT = 0.002  # metres a channel line floats above the surface so it isn't hidden in it


def verts(name: str) -> np.ndarray:
    """World-space vertices of one object, as an (n, 3) array."""
    o = bpy.data.objects[name]
    m = np.array(o.matrix_world)
    co = np.array([v.co for v in o.data.vertices])
    return co @ m[:3, :3].T + m[:3, 3]


def pick(name: str, key: str) -> np.ndarray:
    """One landmark vertex: the extreme of a bone along an axis, or its centroid."""
    v = verts(name)
    side = -1 if name.endswith(".r") else 1  # the client's right side lies at -x
    if key == "centroid":
        return v.mean(0)
    if key == "top":
        return v[v[:, 2].argmax()]
    if key == "bottom":
        return v[v[:, 2].argmin()]
    if key == "front":
        return v[v[:, 1].argmin()]
    if key == "back":
        return v[v[:, 1].argmax()]
    band = {
        "top-lateral": v[v[:, 2] > v[:, 2].max() - 0.05],
        "bottom-lateral": v[v[:, 2] < v[:, 2].min() + 0.04],
        "bottom-medial": v[v[:, 2] < v[:, 2].min() + 0.04],
        "top-front": v[v[:, 2] > v[:, 2].max() - 0.08],
        "top-back": v[v[:, 2] > v[:, 2].max() - 0.08],
    }[key]
    if key.endswith("lateral"):
        return band[(band[:, 0] * side).argmax()]
    if key.endswith("medial"):
        return band[(band[:, 0] * side).argmin()]
    return band[band[:, 1].argmin()] if key == "top-front" else band[band[:, 1].argmax()]


# (2D dx, 2D y, bone, which vertex). Paired bones are listed by stem and sampled on both sides.
SHARED = [
    (56, 140, "Scapula", "top-lateral"),  # acromion
    (76, 268, "Humerus", "bottom-lateral"),  # lateral epicondyle
    (58, 268, "Humerus", "bottom-medial"),  # medial epicondyle
    (84, 352, "Radius", "bottom"),  # radial styloid
    (70, 352, "Ulna", "bottom"),  # ulnar styloid
    (82, 410, "Distal phalanx of third finger of hand", "bottom"),  # middle fingertip
    (44, 360, "Femur", "top-lateral"),  # greater trochanter
    (43, 303, "Hip bone", "top"),  # iliac crest
    (40, 500, "Fibula", "top"),  # head of fibula
    (12, 596, "Tibia", "bottom"),  # medial malleolus
    (34, 598, "Fibula", "bottom"),  # lateral malleolus
]
FRONT = [
    (38, 330, "Hip bone", "top-front"),  # ASIS
    (28, 474, "Patella", "centroid"),
    (14, 621, "Distal phalanx of first finger of foot", "centroid"),  # big toe
]
BACK = [
    (24, 204, "Scapula", "bottom"),  # inferior angle
    (14, 322, "Hip bone", "top-back"),  # PSIS
    (24, 622, "Calcaneus", "bottom"),  # heel
]
MID_FRONT = [
    (16, "Parietal bone.r", "top"),
    (104, "Mandible", "bottom"),
    (126, "Manubrium of sternum", "top"),
    (226, "Xiphoid process", "bottom"),
    (300, "Vertebra L4", "top"),
    (366, "Pubic symphysis", "centroid"),
]
MID_BACK = [
    (16, "Parietal bone.r", "top"),
    (128, "Vertebra C7", "back"),
    (290, "Vertebra L3", "back"),
    (342, "Sacrum", "back"),
]


def pairs(view: str) -> tuple[np.ndarray, np.ndarray]:
    """2D (x, y) and 3D (x, z) landmark pairs for one figure."""
    src, dst = [], []
    for dx, y, stem, key in SHARED + (FRONT if view == "front" else BACK):
        for suffix in (".r", ".l"):
            p = pick(stem + suffix, key)
            # Front figure: the client's right is on the viewer's left. Back figure: the reverse.
            on_left = (suffix == ".r") == (view == "front")
            src.append((CX - dx if on_left else CX + dx, y))
            dst.append((p[0], p[2]))
    for y, name, key in MID_FRONT if view == "front" else MID_BACK:
        p = pick(name, key)
        src.append((CX, y))
        dst.append((0.0, p[2]))
    return np.array(src, float), np.array(dst, float)


class TPS:
    """Thin-plate spline from 2D figure coordinates to 3D (x, z)."""

    def __init__(self, src: np.ndarray, dst: np.ndarray, smooth: float = 1e-4) -> None:
        self.src = src / 640.0
        n = len(src)
        k = self.kernel(self.src, self.src) + smooth * np.eye(n)
        p = np.hstack([np.ones((n, 1)), self.src])
        a = np.zeros((n + 3, n + 3))
        a[:n, :n], a[:n, n:], a[n:, :n] = k, p, p.T
        b = np.vstack([dst, np.zeros((3, 2))])
        self.coef = np.linalg.solve(a, b)

    @staticmethod
    def kernel(a: np.ndarray, b: np.ndarray) -> np.ndarray:
        r2 = ((a[:, None, :] - b[None, :, :]) ** 2).sum(-1)
        with np.errstate(divide="ignore", invalid="ignore"):
            return np.nan_to_num(r2 * np.log(np.sqrt(r2)))

    def __call__(self, xy: np.ndarray) -> np.ndarray:
        q = np.atleast_2d(xy) / 640.0
        n = len(self.src)
        return self.kernel(q, self.src) @ self.coef[:n] + np.hstack([np.ones((len(q), 1)), q]) @ self.coef[n:]


def build_bvh() -> BVHTree:
    """One ray-cast tree over the bones and muscles the web models show."""
    co, faces = [], []
    for layer in ("bones", "muscles"):
        for o, _ in select(layer):
            base = len(co)
            m = o.matrix_world
            co.extend(m @ v.co for v in o.data.vertices)
            faces.extend([base + i for i in p.vertices] for p in o.data.polygons)
    return BVHTree.FromPolygons(co, faces)


def cast(bvh: BVHTree, view: str, xz: np.ndarray) -> tuple[Vector, Vector] | None:
    """Surface point and outward normal at (x, z), seen from the front or back.

    Points near the body's outline can land just off the 3D silhouette, so a miss
    retries at growing offsets in every direction, up to 4.5 cm.
    """
    sign = -1 if view == "front" else 1
    offsets = [(0.0, 0.0)] + [
        (r * math.cos(a), r * math.sin(a))
        for r in (0.005, 0.01, 0.02, 0.03, 0.045)
        for a in np.linspace(0, 2 * math.pi, 12, endpoint=False)
    ]
    for ox, oz in offsets:
        origin = Vector((xz[0] + ox, sign * 3.0, xz[1] + oz))
        hit, normal, _, _ = bvh.ray_cast(origin, Vector((0, -sign, 0)))
        if hit is not None:
            if normal.y * sign < 0:
                normal = -normal
            return hit, normal
    return None


def gl(v: Vector) -> list[float]:
    """Blender (x, y, z) to glTF (x, z, -y), rounded to a millimetre."""
    return [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]


def sample(path: list[list[float]]) -> list[tuple[float, float]]:
    """Points every STEP units along a 2D polyline."""
    out = []
    for (x0, y0), (x1, y1) in zip(path, path[1:]):
        n = max(1, int(np.hypot(x1 - x0, y1 - y0) // STEP))
        out.extend((x0 + (x1 - x0) * t / n, y0 + (y1 - y0) * t / n) for t in range(n))
    out.append(tuple(path[-1]))
    return out


def main() -> None:
    """Project everything in the input JSON and write the site data file."""
    args = sys.argv[sys.argv.index("--") + 1 :]
    data = json.loads(Path(args[0]).read_text())
    tps = {v: TPS(*pairs(v)) for v in ("front", "back")}
    bvh = build_bvh()
    misses = []

    def lift(view: str, x2d: float, y: float) -> tuple[Vector, Vector] | None:
        return cast(bvh, view, tps[view](np.array([x2d, y]))[0])

    points = {}
    for p in data["points"]:
        sides = (1, -1) if p["bilateral"] and p["dx"] else (1,)
        out = []
        for s in sides:
            r = lift(p["v"], CX + s * p["dx"], p["y"])
            if r is None:
                misses.append(f"{p['id']} side {s}")
                continue
            out.append(gl(r[0]) + [round(c, 3) for c in gl(r[1])])
        points[p["id"]] = out

    channels = {}
    for code, paths in data["channels"].items():
        lines = []
        for key, path in paths.items():
            view = key.rstrip("0123456789")
            for s in (1, -1) if any(dx for dx, _ in path) else (1,):
                # A sample that misses the body breaks the line, so it never cuts across a gap.
                line = []
                for dx, y in sample(path):
                    r = lift(view, CX + s * dx, y)
                    if r is not None:
                        line.append(gl(r[0] + r[1] * LIFT))
                    else:
                        if len(line) > 1:
                            lines.append(line)
                        line = []
                if len(line) > 1:
                    lines.append(line)
        channels[code] = lines

    regions = {}
    for key, (x, y, w, h) in data["regions"].items():
        regions[key] = {}
        for view in ("front", "back"):
            c = tps[view](np.array([x + w / 2, y + h / 2]))[0]
            corner = tps[view](np.array([x, y]))[0]
            hit = cast(bvh, view, c)
            depth = -hit[0].y if hit else 0.0
            regions[key][view] = [
                round(c[0], 3),
                round(c[1], 3),
                round(depth, 3),
                round(float(np.hypot(*(c - corner))), 3),
            ]

    Path(args[1]).write_text(
        "/*\n * 3D positions for the 2D figure's points, channel paths and kata regions, generated by\n"
        " * tools/anatomy/project_2d.py. Coordinates are glTF (y up, metres), matching docs/models.\n"
        " * P3D: point id -> [[x, y, z, nx, ny, nz], ...] (one entry per side; n is the outward normal).\n"
        " * CH3D: channel code -> list of polylines, in the direction of primary flow.\n"
        " * REG3D: region key -> {front, back: [x, y, z, radius]} for framing the camera.\n */\n"
        "window.Atlas = window.Atlas || {};\n"
        f"Atlas.P3D = {json.dumps(points, separators=(',', ':'))};\n"
        f"Atlas.CH3D = {json.dumps(channels, separators=(',', ':'))};\n"
        f"Atlas.REG3D = {json.dumps(regions, separators=(',', ':'))};\n"
    )
    print(
        f"PROJECTED {sum(len(v) for v in points.values())} point positions, "
        f"{sum(len(v) for v in channels.values())} channel lines, {len(regions)} regions; misses: {misses}"
    )
    if len(args) > 2:
        render(args[2], points, channels)


def render(prefix: str, points: dict, channels: dict) -> None:
    """Check renders: muscles and bones, with points as dots and channels as lines."""
    keep = {o.name for layer in ("bones", "muscles") for o, _ in select(layer)}
    scn = bpy.data.scenes.new("check")
    for name in keep:
        o = bpy.data.objects[name]
        o.color = (
            (0.93, 0.89, 0.8, 1)
            if "1: Skeletal system" in {c.name for c in o.users_collection}
            else (0.72, 0.3, 0.27, 1)
        )
        o.hide_render = False
        scn.collection.objects.link(o)
    mesh = bpy.data.meshes.new("pts")
    co = [Vector((p[0], -p[2], p[1])) for entries in points.values() for p in entries]
    mesh.from_pydata(co, [], [])
    dots = bpy.data.objects.new("pts", mesh)
    scn.collection.objects.link(dots)
    sph = bpy.data.meshes.new("s")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=0.011)
    bm.to_mesh(sph)
    inst = bpy.data.objects.new("s", sph)
    inst.color = (0.1, 0.2, 0.9, 1)
    scn.collection.objects.link(inst)
    inst.parent = dots
    dots.instance_type = "VERTS"
    for code, lines in channels.items():
        for i, line in enumerate(lines):
            cu = bpy.data.curves.new(f"{code}{i}", "CURVE")
            cu.dimensions, cu.bevel_depth = "3D", 0.0018
            sp = cu.splines.new("POLY")
            sp.points.add(len(line) - 1)
            for j, q in enumerate(line):
                sp.points[j].co = (q[0], -q[2], q[1], 1)
            ob = bpy.data.objects.new(f"{code}{i}", cu)
            ob.color = (0.15, 0.75, 0.3, 1)
            scn.collection.objects.link(ob)
    cd = bpy.data.cameras.new("c")
    cd.type, cd.ortho_scale, cd.clip_end = "ORTHO", 1.85, 100
    cam = bpy.data.objects.new("cam", cd)
    scn.collection.objects.link(cam)
    scn.camera = cam
    r = scn.render
    r.engine, r.resolution_x, r.resolution_y = "BLENDER_WORKBENCH", 700, 1400
    scn.display.shading.light, scn.display.shading.color_type = "STUDIO", "OBJECT"
    for view, sign in (("front", -1), ("back", 1)):
        cam.location = (0, sign * 10, 0.86)
        cam.rotation_euler = (math.radians(90), 0, math.radians(0 if sign < 0 else 180))
        r.filepath = f"{prefix}_{view}.png"
        bpy.ops.render.render(write_still=True, scene=scn.name)


if __name__ == "__main__":
    main()
