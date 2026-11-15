/*
 * 3D anatomy viewer: the Z-Anatomy bones, muscles, joints and attachment surfaces
 * (docs/models, CC BY-SA 4.0) rendered with three.js.
 *
 * This is an ES module, loaded on demand with import() so the rest of the site stays
 * classic scripts. It exposes Atlas.Viewer3D. Model layers load lazily: bones and
 * muscles first, joints and attachments only when a view needs them.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const MODELS = "models/";
const COLORS = {
  bones: 0xe9e1cf, muscles: 0xa9443c, joints: 0x8fb39a, origin: 0xd94b2b, insertion: 0x2f6fd6, focus: 0xff8a3d,
  ligament: 0x3f8f5a, spot: 0x24324d, kataLine: 0xffc266,
};
/* Flow arrows sit FLOW_GAP metres apart along each channel and travel FLOW_SPEED metres a second. */
const FLOW_GAP = 0.06, FLOW_SPEED = 0.035;
/* Point labels appear once the camera is this close to what it looks at, as the 2D figure shows them when zoomed. */
const LABEL_DIST = 1.3;

const draco = new DRACOLoader().setDecoderPath("vendor/three-0.186.1/examples/jsm/libs/draco/gltf/");
const loader = new GLTFLoader().setDRACOLoader(draco);
const cache = {};
/* Each layer file and the two JSON indexes are fetched once per page, shared by every viewer. */
function loadLayer(name) {
  if (!cache[name]) cache[name] = loader.loadAsync(MODELS + name + ".glb");
  return cache[name];
}
let mapPromise = null;
function loadMaps() {
  if (!mapPromise) {
    const json = (f) => fetch(MODELS + f).then((r) => {
      if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
      return r.json();
    });
    mapPromise = Promise.all([json("muscle-map.json"), json("layers.json")]);
  }
  return mapPromise;
}

/* GLTFLoader sanitizes node names ("Trapezius muscle.l" -> "Trapezius_musclel") and keeps the original here. */
const partName = (o) => o.userData.name ?? o.name;
/* Paired pieces are named for the client's left (".l", +x); this swaps one to the right. */
const toRight = (n) => n.replace(/\.l$/, ".r");

function material(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...opts });
}

export class Viewer3D {
  /**
   * @param {HTMLElement} host  element to render into; it should have a height
   * @param {{onPick?: (muscleId: string) => void, onPoint?: (pointId: string) => void,
   *   onBone?: (piece: string) => void, quiet?: boolean, hlLabels?: boolean}} opts
   *   quiet: no name on hover. hlLabels: name only the highlighted and selected points.
   */
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = opts;
    this.groups = {};
    this.focusParts = new Set();
    this.lit = new Set();
    this.spots = [];
    this.layerOn = { bones: true, muscles: true, joints: false };
    host.classList.add("v3d");
    host.innerHTML = `<canvas aria-label="3D model of the body. Drag to rotate, scroll or pinch to zoom."></canvas>
      <div class="v3d-labels" aria-hidden="true"></div>
      <div class="v3d-status" role="status">Loading the 3D model…</div><div class="v3d-hover" aria-hidden="true"></div>`;
    this.status = host.querySelector(".v3d-status");
    this.hover = host.querySelector(".v3d-hover");
    this.labels = host.querySelector(".v3d-labels");
    const canvas = host.querySelector("canvas");
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6257, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(0.4, 0.6, 1);
    this.camera.add(key);
    this.scene.add(this.camera);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.addEventListener("change", () => this.render());
    this.mats = {
      bones: material(COLORS.bones), muscles: material(COLORS.muscles), joints: material(COLORS.joints),
      faded: material(COLORS.muscles, { transparent: true, opacity: 0.12, depthWrite: false }),
      focus: material(COLORS.focus, { emissive: 0x5a1e00 }),
      origin: material(COLORS.origin, { emissive: 0x3a0a00, polygonOffset: true, polygonOffsetFactor: -2 }),
      insertion: material(COLORS.insertion, { emissive: 0x001a3a, polygonOffset: true, polygonOffsetFactor: -2 }),
      litBone: material(COLORS.focus, { emissive: 0x5a1e00 }),
      ligament: material(COLORS.ligament, { emissive: 0x0b2a14 }),
      capsule: material(COLORS.ligament, { transparent: true, opacity: 0.3, depthWrite: false }),
      spot: material(COLORS.spot, { emissive: 0x0a1020, roughness: 0.4 }),
    };
    new ResizeObserver(() => this.resize()).observe(host);
    this.bindPick(canvas);
    this.ready = this.init();
  }

  async init() {
    const [map, layers] = await loadMaps();
    this.map = map;
    this.superficial = new Set(layers.superficial);
    this.partToMuscle = {};
    for (const id in map) for (const p of map[id].parts) this.partToMuscle[p] ??= id;
    await Promise.all(["bones", "muscles"].map((l) => this.addLayer(l)));
    const box = new THREE.Box3().setFromObject(this.groups.bones);
    this.body = { center: box.getCenter(new THREE.Vector3()), size: box.getSize(new THREE.Vector3()) };
    this.view("front", false);
    this.status.hidden = true;
  }

  async addLayer(name) {
    if (this.groups[name]) return this.groups[name];
    const gltf = await loadLayer(name);
    const group = gltf.scene.clone(true);
    group.traverse((o) => {
      if (!o.isMesh) return;
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      o.material = name === "attach" ? this.mats.origin : this.mats[name];
      o.userData.layer = name;
    });
    this.scene.add(group);
    this.groups[name] = group;
    if (name === "joints") this.applyLit();
    return group;
  }

  /** Show or hide a whole layer (bones, muscles, joints). */
  async setLayer(name, on) {
    this.layerOn[name] = on;
    if (on) await this.addLayer(name);
    if (this.groups[name]) this.groups[name].visible = on || (name === "joints" && this.litJoints);
    this.render();
  }

  /** "all" muscles, or only the superficial ones so the deep layer shows. */
  setDepth(depth) {
    this.depth = depth;
    this.applyMuscleStyle();
  }

  /**
   * Highlight one muscle, show its origin (red) and insertion (blue), and frame it.
   * side ("front" or "back") turns the body to the side the muscle is seen from.
   */
  async focusMuscle(id, { frame = true, side = null } = {}) {
    await this.ready;
    const m = this.map[id];
    this.focusId = m ? id : null;
    this.focusParts = new Set(m ? m.parts : []);
    if (m && (m.o.length || m.i.length)) await this.addLayer("attach");
    if (this.groups.attach) {
      const o = new Set(m ? m.o : []), i = new Set(m ? m.i : []);
      this.groups.attach.traverse((x) => {
        if (!x.isMesh) return;
        const n = partName(x);
        x.visible = o.has(n) || i.has(n);
        x.material = i.has(n) ? this.mats.insertion : this.mats.origin;
      });
    }
    this.applyMuscleStyle();
    if (m && frame) this.frame(this.meshesNamed(this.groups.muscles, this.focusParts), side);
    this.render();
    return Boolean(m && m.parts.length);
  }

  applyMuscleStyle() {
    const g = this.groups.muscles;
    if (!g) return;
    const fadeRest = this.ghost || (this.focusParts.size > 0 && this.fade);
    g.traverse((o) => {
      if (!o.isMesh) return;
      const n = partName(o), isFocus = this.focusParts.has(n);
      o.visible = isFocus || this.depth !== "superficial" || this.superficial.has(n);
      o.material = isFocus ? this.mats.focus : fadeRest ? this.mats.faded : this.mats.muscles;
      o.renderOrder = isFocus ? 1 : 0;
    });
    this.render();
  }

  /** Fade the other muscles so a deep muscle shows through. */
  setFade(on) {
    this.fade = on;
    this.applyMuscleStyle();
  }

  /** Draw every muscle faded, so the bones show through them. */
  setGhost(on) {
    this.ghost = on;
    this.applyMuscleStyle();
  }

  /**
   * Light bones and ligaments, mark landmark spots on the bone, and frame them.
   * pieces: model piece names (bones layer or joints layer), named for the client's left.
   * spots: [{p: [x, y, z, nx, ny, nz], label}] on the client's left.
   * side "R" moves everything to the client's right; both lights the pieces on both sides.
   * view ("front" or "back") is where the camera looks from; a single spot is framed close.
   */
  async focusAnatomy({ pieces = [], spots = [], side = "L", both = false, view = "front" } = {}) {
    await this.ready;
    const right = side === "R";
    const names = new Set(pieces.map((n) => (right ? toRight(n) : n)));
    if (both) pieces.forEach((n) => { names.add(n); names.add(toRight(n)); });
    if ([...names].some((n) => !this.meshesNamed(this.groups.bones, new Set([n])).length)) await this.addLayer("joints");
    this.lit = names;
    this.applyLit();
    this.setSpots(spots.map(({ p, label }) => ({ p: right ? [-p[0], p[1], p[2], -p[3], p[4], p[5]] : p, label })));
    /* Frame only the chosen side's copies, so both femurs light but the camera stays on one. */
    const own = new Set(pieces.map((n) => (right ? toRight(n) : n)));
    const meshes = [this.groups.bones, this.groups.joints].filter(Boolean).flatMap((g) => this.meshesNamed(g, own));
    if (this.spots.length === 1) this.focusSpot(this.spots[0], view);
    else if (meshes.length || this.spots.length) this.frame(meshes, view, this.spots.map((s) => s.mesh.position));
    this.render();
  }

  /* Lit bones turn orange; lit ligaments show alone in green, with joint capsules see-through. */
  applyLit() {
    const lit = this.lit;
    this.groups.bones.traverse((o) => { if (o.isMesh) o.material = lit.has(partName(o)) ? this.mats.litBone : this.mats.bones; });
    const j = this.groups.joints;
    if (!j) return;
    let any = false;
    j.traverse((o) => {
      if (!o.isMesh) return;
      const n = partName(o), on = lit.has(n);
      any ||= on;
      o.material = !on ? this.mats.joints : n.startsWith("Articular capsule") ? this.mats.capsule : this.mats.ligament;
    });
    this.litJoints = any;
    j.traverse((o) => { if (o.isMesh) o.visible = !any || lit.has(partName(o)); });
    j.visible = this.layerOn.joints || any;
  }

  /** Replace the landmark dots and their labels. */
  setSpots(spots) {
    for (const s of this.spots) { this.scene.remove(s.mesh); s.el.remove(); }
    const dot = (this.spotGeo ??= new THREE.SphereGeometry(0.0055, 14, 10));
    const rim = (this.spotRim ??= new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide }));
    this.spots = spots.map(({ p, label }) => {
      const mesh = new THREE.Mesh(dot, this.mats.spot);
      const shell = new THREE.Mesh(dot, rim);
      shell.scale.setScalar(1.4);
      mesh.add(shell);
      const normal = new THREE.Vector3(p[3], p[4], p[5]);
      mesh.position.set(p[0], p[1], p[2]).addScaledVector(normal, 0.002);
      this.scene.add(mesh);
      const el = document.createElement("span");
      el.textContent = label;
      this.labels.append(el);
      return { mesh, normal, el };
    });
  }

  /* One landmark, close up: the view blends its surface normal with the front or back of the body. */
  focusSpot(spot, view) {
    const target = spot.mesh.position.clone();
    const dir = spot.normal.clone().add(new THREE.Vector3(0, 0, view === "back" ? -1.2 : 1.2));
    dir.y *= 0.4;
    this.tween(target, target.clone().add(dir.normalize().multiplyScalar(0.6)));
  }

  meshesNamed(group, names) {
    const out = [];
    group.traverse((o) => { if (o.isMesh && names.has(partName(o))) out.push(o); });
    return out;
  }

  /** Point the camera at a set of meshes (and extra points), from the given side or the current direction. */
  frame(meshes, side = null, points = []) {
    if (!meshes.length && !points.length) return;
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    points.forEach((p) => box.expandByPoint(p));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    const dir = side ? new THREE.Vector3(0, 0, side === "back" ? -1 : 1)
      : this.camera.position.clone().sub(this.controls.target).normalize();
    const dist = Math.max(size, 0.25) / (2 * Math.tan((this.camera.fov * Math.PI) / 360)) * 1.15;
    this.tween(center, center.clone().add(dir.multiplyScalar(dist)));
  }

  /** Front or back of the whole body. */
  view(side, animate = true) {
    if (!this.body) return;
    const { center, size } = this.body;
    const dist = (size.y / (2 * Math.tan((this.camera.fov * Math.PI) / 360))) * 1.08;
    const pos = center.clone().add(new THREE.Vector3(0, 0, side === "back" ? -dist : dist));
    if (animate) this.tween(center.clone(), pos);
    else { this.controls.target.copy(center); this.camera.position.copy(pos); this.controls.update(); }
  }

  tween(target, position) {
    const t0 = performance.now(), dur = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    const fromT = this.controls.target.clone(), fromP = this.camera.position.clone();
    cancelAnimationFrame(this.anim);
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      this.controls.target.lerpVectors(fromT, target, e);
      this.camera.position.lerpVectors(fromP, position, e);
      this.controls.update();
      if (k < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  /* A click that didn't drag picks the muscle under the pointer; hovering names it. */
  bindPick(canvas) {
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let down = null;
    const hit = (e) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, this.camera);
      /* Points sit on the surface, so test them first; then the muscles under them. */
      if (this.groups.points && this.groups.points.visible) {
        const p = ray.intersectObjects([this.groups.points], true).find((x) => x.object.visible);
        if (p) return { point: p.object.userData.point, mesh: p.object };
      }
      const targets = [this.groups.muscles, this.opts.onBone && this.groups.bones].filter((g) => g && g.visible);
      const h = ray.intersectObjects(targets, true).find((x) => x.object.visible && x.object.material !== this.mats.faded);
      if (h && h.object.userData.layer === "bones") return { bone: partName(h.object) };
      const id = h && this.partToMuscle[partName(h.object)];
      return id ? { muscle: id } : null;
    };
    canvas.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
    canvas.addEventListener("pointerup", (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const h = hit(e);
      if (h && h.point && this.opts.onPoint) {
        this.picked = h.mesh; // focusPoint frames this copy of a bilateral point
        this.opts.onPoint(h.point);
      }
      else if (h && h.muscle && this.opts.onPick) this.opts.onPick(h.muscle);
      else if (h && h.bone) this.opts.onBone(h.bone);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.buttons || !this.map || this.opts.quiet) return;
      const h = hit(e);
      const p = h && h.point && Atlas.POINTS[h.point];
      const m = h && h.muscle && Atlas.MUSCLES.find((x) => x.id === h.muscle);
      const b = h && h.bone && h.bone.replace(/\.[lr]$/, "");
      const pickable = (p && this.opts.onPoint) || (m && this.opts.onPick) || b;
      this.hover.textContent = p ? `${p.code || p.id} ${p.en}` : m ? m.n : b || "";
      this.hover.hidden = !(p || m || b);
      canvas.style.cursor = pickable ? "pointer" : "grab";
    });
    canvas.addEventListener("pointerleave", () => { this.hover.hidden = true; });
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.host;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  render() {
    /* Points keep a readable size on screen: they grow as the camera backs away, up to 2x. */
    if (this.groups.points) {
      const k = Math.min(2, Math.max(1, this.camera.position.distanceTo(this.controls.target) / 1.1));
      this.groups.points.children.forEach((m) => m.scale.setScalar((m.userData.base || 1) * k));
    }
    this.renderer.render(this.scene, this.camera);
    this.placeLabels();
  }

  /*
   * Labels (landmark spots, point names, kata line numbers) follow their anchors on screen, and
   * hide once the surface under the anchor turns well away from the camera; a spot on the side
   * of a bone, seen edge-on, keeps its label. A tag's want() decides whether it shows at all.
   */
  placeLabels() {
    const tags = [...this.spots, ...(this.ptTags || []), ...(this.kataTags || [])];
    if (!tags.length) return;
    const { clientWidth: w, clientHeight: h } = this.host, v = new THREE.Vector3();
    const near = this.camera.position.distanceTo(this.controls.target) < LABEL_DIST;
    for (const t of tags) {
      if (t.want && !t.want(near)) { t.el.hidden = true; continue; }
      const facing = t.normal.dot(v.copy(this.camera.position).sub(t.mesh.position).normalize()) > -0.3;
      v.copy(t.mesh.position).project(this.camera);
      t.el.hidden = !facing || v.z > 1;
      t.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    }
  }

  /** A label element in the overlay; cls styles point names and kata line numbers apart from landmarks. */
  tag(text, cls = "") {
    const el = document.createElement("span");
    el.textContent = text;
    if (cls) el.className = cls;
    this.labels.append(el);
    return el;
  }

  /* ---------- Points and channels (data from docs/js/data/body-3d.js) ---------- */

  /** Build the point and channel layers once, coloured by each channel's element. */
  showBody() {
    if (this.groups.points) return;
    const css = getComputedStyle(document.documentElement);
    const colorOf = (code) => {
      const c = Atlas.CHANNELS[code];
      const v = c && c.el ? Atlas.ELEMENTS[c.el].color : "--extra";
      return new THREE.Color(css.getPropertyValue(v).trim() || "#7a4e9e");
    };
    this.ptMats = {};
    const ptMat = (code, course) => {
      const k = code + course;
      return (this.ptMats[k] ??= material(colorOf(code), { emissive: colorOf(code).multiplyScalar(0.25), roughness: 0.4 }));
    };
    const big = new THREE.SphereGeometry(0.0062, 14, 10), small = new THREE.SphereGeometry(0.0045, 12, 8);
    this.selMat = material(0xffffff, { emissive: 0x444444, roughness: 0.3 });
    /* A slightly larger white back-face shell outlines each dot, so it reads against any muscle colour. */
    const rim = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
    const points = new THREE.Group();
    this.pointMeshes = {};
    for (const id in Atlas.P3D) {
      const p = Atlas.POINTS[id], course = Atlas.isCourse(p);
      this.pointMeshes[id] = Atlas.P3D[id].map(([x, y, z, nx, ny, nz]) => {
        const m = new THREE.Mesh(course ? big : small, ptMat(p.ch || "", course));
        const shell = new THREE.Mesh(m.geometry, rim);
        shell.scale.setScalar(1.35);
        shell.raycast = () => {}; // picking uses the dot itself
        m.add(shell);
        m.position.set(x + nx * 0.003, y + ny * 0.003, z + nz * 0.003);
        m.userData.point = id;
        m.userData.normal = new THREE.Vector3(nx, ny, nz);
        points.add(m);
        return m;
      });
    }
    /* Each copy of a point gets a name tag, shown when zoomed in or when labels are forced on. */
    this.ptTags = Object.entries(this.pointMeshes).flatMap(([id, ms]) => ms.map((mesh) => ({
      mesh, normal: mesh.userData.normal, el: this.tag(Atlas.POINTS[id].code || id, "v3d-pt"),
      want: (near) => mesh.visible && (this.labelsOn || near) && (!this.opts.hlLabels || this.hlPts.has(id) || id === this.selected),
    })));
    /* Arrowheads are wider than the 3.4 mm line and paler than it, so they stand out along it. */
    const arrow = new THREE.ConeGeometry(0.0078, 0.02, 10);
    this.flows = [];
    const channels = new THREE.Group();
    this.chMeshes = {};
    for (const code in Atlas.CH3D) {
      const color = colorOf(code);
      const thin = material(color, { emissive: color.clone().multiplyScalar(0.3) });
      const band = material(color, { transparent: true, opacity: 0.28, depthWrite: false });
      const flowMat = material(color.clone().lerp(new THREE.Color(0xffffff), 0.55), { emissive: color.clone().multiplyScalar(0.35) });
      this.chMeshes[code] = Atlas.CH3D[code].map((line) => {
        const curve = new THREE.CatmullRomCurve3(line.map((q) => new THREE.Vector3(...q)));
        const segs = Math.max(8, line.length * 2);
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.0034, 6), thin));
        const sinew = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.011, 8), band);
        sinew.userData.sinew = true;
        g.add(sinew);
        /* Arrowheads along the line show which way Qi flows; they travel when flow is on. */
        const length = curve.getLength(), n = Math.max(2, Math.floor(length / FLOW_GAP));
        const flow = new THREE.InstancedMesh(arrow, flowMat, n);
        flow.userData = { flow: true, curve, length, n, reverse: false };
        flow.raycast = () => {};
        g.add(flow);
        this.flows.push(flow);
        channels.add(g);
        return g;
      });
    }
    this.scene.add(points, channels);
    this.groups.points = points;
    this.groups.channels = channels;
    this.channelLayer = "primary";
    this.hlPts = new Set();
    this.flowOn = false;
    this.flowStart = performance.now();
    this.applyBody();
  }

  /** Move the arrowheads along their channels; t is seconds since flow started. */
  placeFlow(t) {
    const dummy = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), tan = new THREE.Vector3();
    /* A frame's timestamp can fall just before flowStart; a negative shift would put arrows off the line. */
    const shift = (Math.max(0, t) * FLOW_SPEED) % FLOW_GAP;
    for (const f of this.flows) {
      if (!f.visible) continue;
      const { curve, length, n, reverse } = f.userData;
      for (let i = 0; i < n; i++) {
        let u = ((i * FLOW_GAP + shift) % length) / length;
        if (reverse) u = 1 - u;
        curve.getPointAt(u, dummy.position);
        curve.getTangentAt(u, tan);
        if (reverse) tan.negate();
        dummy.quaternion.setFromUnitVectors(up, tan);
        dummy.updateMatrix();
        f.setMatrixAt(i, dummy.matrix);
      }
      f.instanceMatrix.needsUpdate = true;
    }
  }

  /**
   * Show the flow arrows, moving unless the reader prefers reduced motion. The model then
   * redraws every frame, so the loop pauses while the page or the viewer is hidden.
   */
  setFlow(on) {
    this.flowOn = on;
    this.applyBody();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.placeFlow(0);
    this.render();
    if (!on || still || this.flowLoop) return;
    const tick = (now) => {
      if (!this.flowOn || this.disposed) { this.flowLoop = null; return; }
      /* About 30 frames a second is smooth enough for slow arrows and spares phone batteries. */
      if (!document.hidden && this.host.offsetParent && now - (this.flowDrawn || 0) >= 32) {
        this.flowDrawn = now;
        this.placeFlow((now - this.flowStart) / 1000);
        this.render();
      }
      this.flowLoop = requestAnimationFrame(tick);
    };
    this.flowLoop = requestAnimationFrame(tick);
  }

  /** Force every visible point's name on, as the 2D "Always show labels" does. */
  setPointLabels(on) {
    this.labelsOn = on;
    this.render();
  }

  /** The three kata back lines (Atlas.KATA3D), dashed down both sides of the spine, numbered on the client's left. */
  setKataLines(on) {
    if (on && !this.kataGroup) {
      const mat = material(COLORS.kataLine, { emissive: 0x6a3a00 });
      this.kataGroup = new THREE.Group();
      this.kataTags = [];
      /* The numbers step down the lines, so the three close-set tops don't overlap. */
      Atlas.KATA3D.forEach(({ n, lines }, k) => {
        for (const line of lines) {
          /* Lines 2 and 3 run on the Bladder channel, so they sit a little further out and wider to show over it. */
          const curve = new THREE.CatmullRomCurve3(line.map(([x, y, z]) => new THREE.Vector3(x, y, z - 0.004)));
          this.kataGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, line.length * 2, 0.0045, 8), mat));
        }
        const left = lines.reduce((a, b) => (b[0][0] > a[0][0] ? b : a));
        const mesh = new THREE.Object3D();
        mesh.position.set(...left[Math.min(left.length - 1, k * 4)]);
        this.kataGroup.add(mesh);
        this.kataTags.push({ mesh, normal: new THREE.Vector3(0, 0, -1), el: this.tag(n, "v3d-kata"), want: () => this.kataGroup.visible });
      });
      this.scene.add(this.kataGroup);
    }
    if (this.kataGroup) this.kataGroup.visible = on;
    this.render();
  }

  /** Same contract as the 2D figure: which channels show, which points pass the filter, what is highlighted. */
  setBody({ channels, pointFilter, layer, highlightChs, highlightPts, selected } = {}) {
    if (channels !== undefined) this.chSet = channels;
    if (pointFilter !== undefined) this.ptFilter = pointFilter;
    if (layer !== undefined) this.channelLayer = layer;
    if (highlightChs !== undefined) this.hlChs = new Set(highlightChs);
    if (highlightPts !== undefined) this.hlPts = new Set(highlightPts);
    if (selected !== undefined) this.selected = selected;
    this.applyBody();
  }

  applyBody() {
    if (!this.groups.points) return;
    const hlCh = this.hlChs && this.hlChs.size ? this.hlChs : null;
    for (const code in this.chMeshes) {
      const on = !this.chSet || this.chSet.has(code);
      const dim = hlCh && !hlCh.has(code);
      for (const g of this.chMeshes[code]) {
        g.visible = on;
        g.children.forEach((m) => {
          if (m.userData.flow) {
            /* As in 2D: the primary and both layers flow with the primary channel, the sinew layer its own way. */
            m.visible = this.flowOn;
            m.userData.reverse = this.channelLayer === "sinew" && Boolean(Atlas.CHANNELS[code].sinewReverse);
            return;
          }
          m.visible = m.userData.sinew ? this.channelLayer !== "primary" : this.channelLayer !== "sinew";
          const transparent = m.userData.sinew || Boolean(dim);
          m.material.opacity = m.userData.sinew ? (dim ? 0.08 : 0.28) : dim ? 0.25 : 1;
          if (m.material.transparent !== transparent) { m.material.transparent = transparent; m.material.needsUpdate = true; }
        });
      }
    }
    if (this.flowOn) this.placeFlow(this.flowLoop ? (performance.now() - this.flowStart) / 1000 : 0);
    // Points live on the primary channels, so the sinew-only layer hides them, as in 2D.
    const showPts = this.channelLayer !== "sinew";
    for (const id in this.pointMeshes) {
      const pass = showPts && (!this.ptFilter || this.ptFilter(Atlas.POINTS[id]));
      const hl = this.hlPts && this.hlPts.has(id);
      for (const m of this.pointMeshes[id]) {
        m.visible = pass || id === this.selected;
        m.userData.base = id === this.selected ? 1.9 : hl ? 1.4 : 1;
        m.material = id === this.selected ? this.selMat : this.ptMats[(Atlas.POINTS[id].ch || "") + Atlas.isCourse(Atlas.POINTS[id])];
      }
    }
    this.render();
  }

  /**
   * Turn the camera toward a point: the copy just clicked on the model, otherwise the
   * client's left copy when there are two. The view direction blends the surface
   * normal with the figure the point is drawn on, so a point on the side of the hand
   * is seen from slightly behind, not edge-on.
   */
  focusPoint(id, dist = 0.85) {
    const ms = this.pointMeshes && this.pointMeshes[id];
    if (!ms || !ms.length) return;
    const m = ms.includes(this.picked) ? this.picked : ms.find((x) => x.position.x >= 0) || ms[0];
    const target = m.position.clone();
    const axis = new THREE.Vector3(0, 0, Atlas.POINTS[id].v === "back" ? -1 : 1);
    const dir = m.userData.normal.clone().add(axis.multiplyScalar(1.2));
    dir.y *= 0.4; // keep the camera near eye level instead of looking straight down
    this.tween(target, target.clone().add(dir.normalize().multiplyScalar(dist)));
  }

  /**
   * Frame a kata or atlas region: [x, height, z of the surface, radius] from Atlas.REG3D.
   * The camera looks from the front (+z) or the back (-z) of the body.
   */
  focusRegion([x, y, z, r], side) {
    const target = new THREE.Vector3(x, y, z);
    const dist = (Math.max(r, 0.12) / Math.tan((this.camera.fov * Math.PI) / 360)) * 1.1;
    this.tween(target, target.clone().add(new THREE.Vector3(0, 0, side === "back" ? -dist : dist)));
  }

  /** Release the WebGL context; browsers allow only a few at once. */
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.anim);
    cancelAnimationFrame(this.flowLoop);
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  /** Show a failure in place of the model, with the reason for the developer in the console. */
  fail(err) {
    console.error("3D viewer failed", err);
    this.status.hidden = false;
    this.status.classList.add("v3d-error");
    this.status.textContent = "The 3D model couldn't load. Check your connection and reload, or switch to the 2D view.";
  }
}

window.Atlas = window.Atlas || {};
Atlas.Viewer3D = Viewer3D;
