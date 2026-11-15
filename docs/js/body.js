/*
 * Body figure: draws a front or back view with channels and points, and handles
 * zoom, pan, hover and selection. Several figures can exist at once (atlas, kata,
 * clock, study); each is an independent Atlas.Figure.
 */
window.Atlas = window.Atlas || {};

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 300, H = 640, CX = 150;

  /* Left half of the silhouette, viewer's left, from the crown down and back up to the crotch. */
  const HALF = [
    [150, 16], [134, 20], [123, 34], [119, 56], [120, 78], [126, 94], [136, 104], [141, 116], [139, 125], [118, 131],
    [99, 137], [89, 149], [84, 175], [80, 215], [76, 255], [72, 292], [68, 330], [64, 354], [60, 372], [58, 395],
    [62, 412], [70, 411], [74, 393], [77, 372], [80, 356], [86, 320], [92, 280], [96, 240], [100, 207], [104, 192],
    [106, 216], [108, 256], [110, 290], [106, 326], [104, 362], [106, 402], [110, 442], [114, 482], [116, 522],
    [118, 562], [121, 591], [114, 609], [116, 622], [140, 624], [142, 610], [138, 592], [136, 560], [134, 520],
    [136, 482], [140, 442], [144, 402], [148, 380], [150, 378],
  ];

  function catmull(pts, closed) {
    if (pts.length < 2) return "";
    const p = pts.slice();
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    const n = p.length;
    const get = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + (closed ? "Z" : "");
  }
  Atlas.catmull = catmull;

  function silhouette() {
    const right = HALF.slice(1, -1).reverse().map(([x, y]) => [2 * CX - x, y]);
    return catmull(HALF.concat(right), true);
  }

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  Atlas.svgEl = el;

  /* Faint landmark lines that help orient the eye. */
  function details(view, g) {
    const line = (pts) => el("path", { d: catmull(pts, false), class: "body-detail" }, g);
    const mirror = (pts) => { line(pts); line(pts.map(([x, y]) => [2 * CX - x, y])); };
    if (view === "front") {
      mirror([[142, 128], [128, 132], [110, 136]]); // clavicle
      mirror([[122, 238], [134, 252], [146, 258]]); // rib margin
      el("circle", { cx: CX, cy: 300, r: 2, class: "body-detail" }, g); // navel
      mirror([[136, 92], [146, 97]]);
      mirror([[128, 486], [126, 474], [128, 464], [134, 466], [134, 482], [128, 486]]); // patella
      mirror([[132, 58], [140, 58]]); // eyes
      line([[146, 76], [150, 78], [154, 76]]); // nose
      line([[143, 87], [150, 88], [157, 87]]); // mouth
      mirror([[121, 54], [118, 64], [121, 72]]); // ear
    } else {
      line([[150, 108], [150, 370]]); // spine
      mirror([[136, 146], [118, 150], [112, 178], [120, 204], [138, 160]]); // scapula
      mirror([[150, 372], [138, 384], [116, 380]]); // gluteal crease
      mirror([[116, 480], [134, 480]]); // popliteal crease
      mirror([[121, 54], [118, 64], [121, 72]]); // ear
      line([[132, 98], [150, 102], [168, 98]]); // skull base
    }
  }

  function elColor(code) {
    const c = Atlas.CHANNELS[code];
    return c && c.el ? `var(${Atlas.ELEMENTS[c.el].color})` : "var(--extra)";
  }
  Atlas.elColor = elColor;
  Atlas.pointColor = (p) => (p.ch ? elColor(p.ch) : "var(--extra)");

  function isCourse(p) { return p.cats.some((c) => Atlas.CATEGORIES[c] && Atlas.CATEGORIES[c].course); }
  Atlas.isCourse = isCourse;

  /* All [x, y] positions where a point is drawn in a given view. */
  function positions(p, view) {
    const out = [];
    const add = (o) => {
      if (o.v !== view) return;
      out.push([CX + o.dx, o.y]);
      if (p.bilateral && o.dx !== 0) out.push([CX - o.dx, o.y]);
    };
    add(p);
    (p.also || []).forEach(add);
    return out;
  }
  Atlas.positions = positions;

  /* Touch screens: one finger scrolls the page, two fingers move the figures (body.js, viewer3d.js). */
  Atlas.coarse = window.matchMedia("(pointer: coarse)").matches;
  /**
   * Keep a two-finger gesture on el for the figure, and leave one finger to scroll the page; show
   * a hint until the first two-finger move. Returns nothing; el's touch-action allows page panning.
   */
  Atlas.twoFingerGestures = (el, host, hint) => {
    el.style.touchAction = "pan-x pan-y";
    const tip = document.createElement("div");
    tip.className = "touch-hint";
    tip.textContent = hint;
    host.appendChild(tip);
    const hold = (e) => {
      if (e.touches.length < 2) return;
      e.preventDefault(); // a two-finger gesture moves the figure, not the page
      tip.hidden = true;
    };
    el.addEventListener("touchstart", hold, { passive: false });
    el.addEventListener("touchmove", hold, { passive: false });
  };

  class Figure {
    constructor(host, view, opts = {}) {
      this.view = view;
      this.opts = opts;
      this.box = Atlas.REGIONS.full.slice();
      this.host = host;
      host.classList.add("figure");
      host.innerHTML = "";
      if (opts.label !== false) {
        const lab = document.createElement("div");
        lab.className = "fig-label";
        lab.textContent = view === "front" ? "Front (supine)" : "Back (prone)";
        host.appendChild(lab);
      }
      this.svg = el("svg", { viewBox: this.box.join(" "), role: "img", "aria-label": `${view} view of the body with channels and points` });
      host.appendChild(this.svg);
      if (opts.zoom !== false) this.addZoomControls();
      this.root = el("g", { class: "layer-primary" }, this.svg);
      el("path", { d: silhouette(), class: "body-fill" }, this.root);
      details(view, el("g", {}, this.root));
      this.chLayer = el("g", {}, this.root);
      this.overlay = el("g", {}, this.root);
      this.ptLayer = el("g", {}, this.root);
      this.drawChannels();
      if (opts.points !== false) this.drawPoints();
      this.bindPan();
      if (Atlas.coarse && opts.zoom !== false) Atlas.twoFingerGestures(this.svg, host, "Two fingers to move and zoom");
    }

    drawChannels() {
      this.chGroups = {};
      for (const code in Atlas.CHANNELS) {
        const c = Atlas.CHANNELS[code];
        const g = el("g", { class: "ch-g", "data-ch": code, style: `color:${elColor(code)}` }, this.chLayer);
        this.chGroups[code] = g;
        for (const key in c.paths) {
          if (key.replace(/\d+$/, "") !== this.view) continue;
          const sides = c.paths[key].some(([dx]) => dx !== 0) ? [1, -1] : [1];
          for (const s of sides) {
            const pts = c.paths[key].map(([dx, y]) => [CX + s * dx, y]);
            const d = catmull(pts, false);
            el("path", { d, class: "ch-path ch-sinew", stroke: "currentColor" }, g);
            el("path", { d, class: "ch-path ch-base", stroke: "currentColor" }, g);
            el("path", { d, class: "ch-path ch-flow primary", stroke: "currentColor" }, g);
            el("path", { d, class: "ch-path ch-flow sinew" + (c.sinewReverse ? " rev" : ""), stroke: "currentColor" }, g);
          }
        }
      }
    }

    drawPoints() {
      this.ptGroups = {};
      for (const id in Atlas.POINTS) {
        const p = Atlas.POINTS[id];
        const pos = positions(p, this.view);
        if (!pos.length) continue;
        const cls = ["pt-g"];
        if (isCourse(p)) cls.push("course");
        if (p.cats.includes("longlife")) cls.push("longlife");
        const g = el("g", { class: cls.join(" "), "data-id": id, style: `color:${Atlas.pointColor(p)}`, tabindex: "0", role: "button", "aria-label": `${p.code || id} ${p.en}` }, this.ptLayer);
        this.ptGroups[id] = g;
        /* Points close to the midline label their left copy, so they don't collide with the outer lines. */
        const labelAt = pos.length > 1 && p.v === this.view && p.dx > 0 && p.dx < 16 ? 1 : 0;
        pos.forEach(([x, y], i) => {
          el("circle", { cx: x, cy: y, r: 6.5, class: "pt-ring" }, g);
          el("circle", { cx: x, cy: y, r: 3.2, class: "pt-dot", stroke: "currentColor" }, g);
          if (i === labelAt) {
            const t = el("text", { x: x + (x >= CX ? 6 : -6), y: y - 5, class: "pt-label", "text-anchor": x >= CX ? "start" : "end" }, g);
            t.textContent = p.code || id;
          }
        });
        g.addEventListener("click", (e) => { e.stopPropagation(); if (this.opts.onPoint) this.opts.onPoint(id); });
        g.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && this.opts.onPoint) { e.preventDefault(); this.opts.onPoint(id); } });
        g.addEventListener("pointerenter", (e) => Atlas.tooltip.show(e, p));
        g.addEventListener("pointermove", (e) => Atlas.tooltip.move(e));
        g.addEventListener("pointerleave", () => Atlas.tooltip.hide());
      }
    }

    setLayer(mode) { this.root.setAttribute("class", `layer-${mode}`); }
    setFlow(on) { this.svg.classList.toggle("no-flow", !on); }
    setLabels(on) { this.forceLabels = on; this.applyBox(); }

    /* Highlight channels/points; empty lists clear the highlight. */
    highlight(chs = [], pts = []) {
      this.chLayer.classList.toggle("dim", chs.length > 0);
      for (const code in this.chGroups) this.chGroups[code].classList.toggle("hl", chs.includes(code));
      if (!this.ptGroups) return;
      for (const id in this.ptGroups) this.ptGroups[id].classList.toggle("hl", pts.includes(id));
    }

    /* Hide channels not in the set (null = all). */
    showChannels(set) {
      for (const code in this.chGroups) this.chGroups[code].style.display = !set || set.has(code) ? "" : "none";
    }

    filterPoints(pred) {
      if (!this.ptGroups) return;
      for (const id in this.ptGroups) this.ptGroups[id].classList.toggle("off", !pred(Atlas.POINTS[id]));
    }

    select(id) {
      if (!this.ptGroups) return;
      for (const k in this.ptGroups) this.ptGroups[k].classList.toggle("sel", k === id);
    }

    clearOverlay() { this.overlay.innerHTML = ""; }

    /** Frame a point drawn on this figure; a point not drawn here leaves the view alone. */
    zoomToPoint(id, size = 110) {
      const dot = this.ptGroups && this.ptGroups[id] && this.ptGroups[id].querySelector(".pt-dot");
      if (!dot) return;
      const x = Number(dot.getAttribute("cx")), y = Number(dot.getAttribute("cy"));
      this.zoomTo([x - size / 2, y - size / 2, size, size]);
    }

    /* Kata back lines: Line 1 Hua Tuo Jia Ji, Line 2 inner Bladder, Line 3 outer Bladder. */
    drawKataLines() {
      for (const { n, path } of Atlas.KATA_LINES) {
        const [[dx, y0], [, y1]] = path;
        for (const s of [1, -1]) {
          el("path", { d: `M${CX + s * dx},${y0} L${CX + s * dx},${y1}`, class: "kata-line" }, this.overlay);
        }
        const t = el("text", { x: CX - dx - 2, y: y0 - 4, class: "kata-line-label", "text-anchor": "middle" }, this.overlay);
        t.textContent = n;
      }
    }

    mark(x, y, color) {
      el("circle", { cx: x, cy: y, r: 8, class: "quiz-mark", stroke: color }, this.overlay);
    }

    addZoomControls() {
      const ctl = document.createElement("div");
      ctl.className = "zoom-ctl";
      const mk = (txt, label, fn) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = txt; b.setAttribute("aria-label", label);
        b.addEventListener("click", fn); ctl.appendChild(b);
      };
      mk("+", "Zoom in", () => this.zoomBy(0.7));
      mk("−", "Zoom out", () => this.zoomBy(1 / 0.7));
      mk("⤢", "Show whole body", () => this.zoomTo(Atlas.REGIONS.full));
      this.host.appendChild(ctl);
    }

    applyBox() {
      this.svg.setAttribute("viewBox", this.box.map((n) => n.toFixed(1)).join(" "));
      const scale = W / this.box[2];
      /* Shrink dots and labels as we zoom in so close-set points stay readable. */
      this.svg.style.setProperty("--k", Math.max(0.3, Math.min(1, 1.25 / scale)).toFixed(3));
      this.svg.classList.toggle("show-labels", this.forceLabels || scale > 2.2);
    }

    /* Animate the viewBox to a target box, keeping the figure's aspect ratio. */
    zoomTo(target, animate = true) {
      let [x, y, w, h] = target;
      const ar = W / H;
      if (w / h > ar) { const nh = w / ar; y -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x -= (nw - w) / 2; w = nw; }
      const from = this.box.slice(), to = [x, y, w, h];
      if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { this.box = to; this.applyBox(); return; }
      const t0 = performance.now(), dur = 420;
      cancelAnimationFrame(this.anim);
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        this.box = from.map((v, i) => v + (to[i] - v) * e);
        this.applyBox();
        if (k < 1) this.anim = requestAnimationFrame(step);
      };
      this.anim = requestAnimationFrame(step);
    }

    zoomBy(f, cx, cy) {
      const [x, y, w, h] = this.box;
      const nw = Math.min(W * 1.05, Math.max(40, w * f)), nh = nw * (H / W);
      const px = cx === undefined ? x + w / 2 : cx, py = cy === undefined ? y + h / 2 : cy;
      const rx = (px - x) / w, ry = (py - y) / h;
      this.box = [px - rx * nw, py - ry * nh, nw, nh];
      this.applyBox();
    }

    /* Convert a client (screen) coordinate to figure coordinates. */
    toFig(clientX, clientY) {
      const r = this.svg.getBoundingClientRect();
      const s = Math.max(this.box[2] / r.width, this.box[3] / r.height);
      const ox = (r.width * s - this.box[2]) / 2, oy = (r.height * s - this.box[3]) / 2;
      return [this.box[0] + (clientX - r.left) * s - ox, this.box[1] + (clientY - r.top) * s - oy];
    }

    bindPan() {
      let start = null;
      const ptrs = new Map();
      this.svg.addEventListener("wheel", (e) => {
        if (this.opts.zoom === false) return;
        e.preventDefault();
        const [fx, fy] = this.toFig(e.clientX, e.clientY);
        this.zoomBy(e.deltaY > 0 ? 1.12 : 1 / 1.12, fx, fy);
      }, { passive: false });
      this.svg.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".pt-g")) return;
        ptrs.set(e.pointerId, [e.clientX, e.clientY]);
        start = { x: e.clientX, y: e.clientY, box: this.box.slice(), moved: false };
        this.svg.setPointerCapture(e.pointerId);
      });
      this.svg.addEventListener("pointermove", (e) => {
        if (!start || !ptrs.has(e.pointerId)) return;
        const prev = ptrs.get(e.pointerId);
        ptrs.set(e.pointerId, [e.clientX, e.clientY]);
        if (ptrs.size === 2 && this.opts.zoom !== false) {
          const [a, b] = [...ptrs.values()];
          const other = [...ptrs.entries()].find(([k]) => k !== e.pointerId)[1];
          const d0 = Math.hypot(prev[0] - other[0], prev[1] - other[1]), d1 = Math.hypot(a[0] - b[0], a[1] - b[1]);
          /* Two fingers pan with their midpoint and pinch to zoom around it. */
          const r = this.svg.getBoundingClientRect(), s = this.box[2] / r.width;
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const dx = (mx - (prev[0] + other[0]) / 2) * s, dy = (my - (prev[1] + other[1]) / 2) * s;
          this.box = [this.box[0] - dx, this.box[1] - dy, this.box[2], this.box[3]];
          if (d0 > 0) { const [fx, fy] = this.toFig(mx, my); this.zoomBy(d0 / d1, fx, fy); } else this.applyBox();
          start.moved = true;
          return;
        }
        /* On a touch screen one finger scrolls the page, so a single touch never pans. */
        if (e.pointerType === "touch" && Atlas.coarse) return;
        const r = this.svg.getBoundingClientRect();
        const s = this.box[2] / r.width;
        const dx = (e.clientX - start.x) * s, dy = (e.clientY - start.y) * s;
        if (Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) > 4) start.moved = true;
        if (!start.moved || this.opts.zoom === false) return;
        this.svg.classList.add("dragging");
        this.box = [start.box[0] - dx, start.box[1] - dy, start.box[2], start.box[3]];
        this.applyBox();
      });
      const end = (e) => {
        ptrs.delete(e.pointerId);
        if (!start) return;
        const wasClick = !start.moved;
        this.svg.classList.remove("dragging");
        if (wasClick && this.opts.onBackground && e.type === "pointerup") {
          const [fx, fy] = this.toFig(e.clientX, e.clientY);
          this.opts.onBackground(fx, fy, this);
        }
        if (!ptrs.size) start = null;
      };
      this.svg.addEventListener("pointerup", end);
      this.svg.addEventListener("pointercancel", end);
    }
  }
  Atlas.Figure = Figure;

  /* Shared hover tooltip. */
  Atlas.tooltip = {
    node: null,
    show(e, p) {
      if (!this.node) { this.node = document.createElement("div"); this.node.className = "tooltip"; document.body.appendChild(this.node); }
      const ch = p.ch ? Atlas.CHANNELS[p.ch].name : "Extra point";
      this.node.innerHTML = `<b>${p.code || p.id}</b> ${p.py} · ${p.en}<br><span style="opacity:.75">${ch}</span>`;
      this.node.hidden = false;
      this.move(e);
    },
    move(e) {
      if (!this.node) return;
      const x = Math.min(window.innerWidth - 270, e.clientX + 14);
      this.node.style.left = x + "px";
      this.node.style.top = e.clientY + 16 + "px";
    },
    hide() { if (this.node) this.node.hidden = true; },
  };
})();
