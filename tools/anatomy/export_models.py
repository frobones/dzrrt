"""
Export web-ready 3D anatomy models from the Z-Anatomy Blender file.

Run inside Blender (5.x), with scripts in the .blend disabled:

    blender -b --disable-autoexec temp/zanatomy/x/Z-Anatomy/Startup.blend \
        --python tools/anatomy/export_models.py -- <layer> <out_dir>

<layer> is one of: bones, muscles, joints, attach. Each run writes <layer>.glb
(Draco-compressed, simplified) and <layer>.json (one record per exported part).

Z-Anatomy is CC BY-SA 4.0 and built on BodyParts3D (CC BY 4.0); see the license
exception in AGENTS.md. Its non-commercial parts (inner ear, kidney) are never in
these collections, and the nervous-system collection is excluded outright.
"""

import json
import re
import sys

import bpy

SKELETAL = "1: Skeletal system"
MUSCULAR = "4: Muscular system"
JOINTS = "3: Joints"
INSERTIONS = "2: Muscular insertions"
NERVOUS = "7: Nervous system & Sense organs"
SUPERFICIAL = "Superficial muscles"

# Collections that also sit inside the muscular system but are not muscle.
MUSCLE_SKIP_COLS = {"Bursae", "Tendon sheaths", "Fascia", NERVOUS}
# The iliotibial tract lives in Fascia but matters for the Gall Bladder channel, so it is kept.
MUSCLE_KEEP_NAMES = ("iliotibial tract",)

# Target triangle budget per layer; every part is simplified by the same ratio,
# but small parts keep at least MIN_TRIS so they don't collapse.
BUDGET = {"bones": 160_000, "muscles": 320_000, "joints": 40_000, "attach": 30_000}
MIN_TRIS = 240

MAIN = re.compile(r"\.(l|r|j)$")  # whole structures: left, right, or midline (joined)
ATTACH = re.compile(r"\.([oe])\d*([lr])$")  # origin (o) and insertion/end (e) surfaces
SUFFIX = re.compile(r"\.\w+$")  # any other suffix marks labels and helper meshes


def cols(o: "bpy.types.Object") -> set[str]:
    """Names of the collections an object belongs to."""
    return {c.name for c in o.users_collection}


def tris(o: "bpy.types.Object") -> int:
    """Triangle count of a mesh object."""
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def select(layer: str) -> list[tuple["bpy.types.Object", dict]]:
    """Return (object, record) pairs for one layer."""
    out = []
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        c, n = cols(o), o.name
        if NERVOUS in c:
            continue
        if layer == "attach":
            m = ATTACH.search(n)
            if INSERTIONS in c and m:
                out.append((o, {"kind": "origin" if m.group(1) == "o" else "insertion", "side": m.group(2)}))
            continue
        # Midline structures (spine, sternum, skull, diaphragm) carry no suffix at all.
        m = MAIN.search(n)
        if m:
            side = m.group(1)
        elif not SUFFIX.search(n):
            side = "m"
        else:
            continue
        rec = {"side": side}
        if layer == "bones" and SKELETAL in c:
            out.append((o, rec))
        elif layer == "joints" and JOINTS in c:
            out.append((o, rec))
        elif layer == "muscles" and MUSCULAR in c:
            keep = any(k in n.lower() for k in MUSCLE_KEEP_NAMES)
            if c & MUSCLE_SKIP_COLS and not keep:
                continue
            rec["superficial"] = SUPERFICIAL in c
            out.append((o, rec))
    return out


def main() -> None:
    """Export one layer, chosen on the command line, to <out_dir>/<layer>.glb and .json."""
    layer, out_dir = sys.argv[-2], sys.argv[-1]
    if layer not in BUDGET:
        raise SystemExit(f"unknown layer {layer!r}; expected one of {sorted(BUDGET)}")
    picked = select(layer)
    keep = {o.name for o, _ in picked}
    # Remove everything else so the exporter sees only this layer.
    for o in list(bpy.data.objects):
        if o.name not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    total = sum(tris(o) for o, _ in picked)
    ratio = min(1.0, BUDGET[layer] / total) if total else 1.0
    records = []
    for o, rec in picked:
        t = tris(o)
        r = 1.0 if t <= MIN_TRIS else max(ratio, MIN_TRIS / t)
        if r < 1.0:
            o.modifiers.new("simplify", "DECIMATE").ratio = r
        o.hide_set(False)
        o.hide_viewport = False
        o.select_set(True)
        records.append({"name": o.name, "tris": t, "ratio": round(r, 4), **rec})
    bpy.ops.export_scene.gltf(
        filepath=f"{out_dir}/{layer}.glb",
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,
        export_materials="NONE",
        export_normals=False,
        export_texcoords=False,
    )
    with open(f"{out_dir}/{layer}.json", "w") as fh:
        json.dump(records, fh, indent=0)
    print(f"EXPORTED {layer}: {len(records)} parts, {total} source triangles, ratio {ratio:.3f}")


if __name__ == "__main__":
    main()
