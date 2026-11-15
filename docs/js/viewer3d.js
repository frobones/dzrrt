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
const COLORS = { bones: 0xe9e1cf, muscles: 0xa9443c, joints: 0x8fb39a, origin: 0xd94b2b, insertion: 0x2f6fd6, focus: 0xff8a3d };

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

function material(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...opts });
}

export class Viewer3D {
  /**
   * @param {HTMLElement} host  element to render into; it should have a height
   * @param {{onPick?: (muscleId: string) => void, onPoint?: (pointId: string) => void}} opts
   */
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = opts;
    this.groups = {};
    this.focusParts = new Set();
    host.classList.add("v3d");
    host.innerHTML = `<canvas aria-label="3D model of the body. Drag to rotate, scroll or pinch to zoom."></canvas>
      <div class="v3d-status" role="status">Loading the 3D model…</div><div class="v3d-hover" aria-hidden="true"></div>`;
    this.status = host.querySelector(".v3d-status");
    this.hover = host.querySelector(".v3d-hover");
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
    return group;
  }

  /** Show or hide a whole layer (bones, muscles, joints). */
  async setLayer(name, on) {
    if (on) await this.addLayer(name);
    if (this.groups[name]) this.groups[name].visible = on;
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
    const focusing = this.focusParts.size > 0;
    g.traverse((o) => {
      if (!o.isMesh) return;
      const n = partName(o), isFocus = this.focusParts.has(n);
      o.visible = isFocus || this.depth !== "superficial" || this.superficial.has(n);
      o.material = isFocus ? this.mats.focus : focusing && this.fade ? this.mats.faded : this.mats.muscles;
      o.renderOrder = isFocus ? 1 : 0;
    });
    this.render();
  }

  /** Fade the other muscles so a deep muscle shows through. */
  setFade(on) {
    this.fade = on;
    this.applyMuscleStyle();
  }

  meshesNamed(group, names) {
    const out = [];
    group.traverse((o) => { if (o.isMesh && names.has(partName(o))) out.push(o); });
    return out;
  }

  /** Point the camera at a set of meshes, from the given side or the current direction. */
  frame(meshes, side = null) {
    if (!meshes.length) return;
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
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
      const targets = this.groups.muscles && this.groups.muscles.visible ? [this.groups.muscles] : [];
      const h = ray.intersectObjects(targets, true).find((x) => x.object.visible && x.object.material !== this.mats.faded);
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
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.buttons || !this.map) return;
      const h = hit(e);
      const p = h && h.point && Atlas.POINTS[h.point];
      const m = h && h.muscle && Atlas.MUSCLES.find((x) => x.id === h.muscle);
      const pickable = (p && this.opts.onPoint) || (m && this.opts.onPick);
      this.hover.textContent = p ? `${p.code || p.id} ${p.en}` : m ? m.n : "";
      this.hover.hidden = !(p || m);
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
    const channels = new THREE.Group();
    this.chMeshes = {};
    for (const code in Atlas.CH3D) {
      const color = colorOf(code);
      const thin = material(color, { emissive: color.clone().multiplyScalar(0.3) });
      const band = material(color, { transparent: true, opacity: 0.28, depthWrite: false });
      this.chMeshes[code] = Atlas.CH3D[code].map((line) => {
        const curve = new THREE.CatmullRomCurve3(line.map((q) => new THREE.Vector3(...q)));
        const segs = Math.max(8, line.length * 2);
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.0034, 6), thin));
        const sinew = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.011, 8), band);
        sinew.userData.sinew = true;
        g.add(sinew);
        channels.add(g);
        return g;
      });
    }
    this.scene.add(points, channels);
    this.groups.points = points;
    this.groups.channels = channels;
    this.channelLayer = "primary";
    this.applyBody();
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
          m.visible = m.userData.sinew ? this.channelLayer !== "primary" : this.channelLayer !== "sinew";
          const transparent = m.userData.sinew || Boolean(dim);
          m.material.opacity = m.userData.sinew ? (dim ? 0.08 : 0.28) : dim ? 0.25 : 1;
          if (m.material.transparent !== transparent) { m.material.transparent = transparent; m.material.needsUpdate = true; }
        });
      }
    }
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
    cancelAnimationFrame(this.anim);
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
