/*
 * Anatomy view: bones and muscles from Netter's Anatomy Coloring Book, the course's
 * anatomy text (Handbook 4.54), tied to the channels, points and kata.
 * Panels: a muscle explorer, bones and joints with their landmarks, and a quiz, each
 * showing the body in 3D (docs/js/viewer3d.js, loaded on demand) or on the 2D figure.
 * Muscle and bone cards carry the book's plate summaries and clinical notes.
 * The site-wide Exam | Everything switch (Atlas.examOnly) scopes the muscles, quiz and bones
 * to what the anatomy study guide covers (Handbook 4.54); Exam is the default.
 */
window.Atlas = window.Atlas || {};
Atlas.views = Atlas.views || {};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => Atlas.esc(s);
  const el = (tag, attrs, parent) => Atlas.svgEl(tag, attrs, parent);
  const CX = 150, NEAR = 13;
  const REGIONS = [
    ["Head and neck", ["face", "eye", "jaw", "tongue", "pharynx", "larynx", "neck"]],
    ["Back", ["back"]], ["Chest and abdomen", ["thorax", "abdomen", "pelvis", "perineum"]],
    ["Shoulder and arm", ["shoulder", "arm"]], ["Forearm and hand", ["forearm", "hand"]],
    ["Hip and thigh", ["hip", "thigh"]], ["Leg and foot", ["leg", "foot"]],
  ];
  const BONE_REGIONS = [
    ["Skull", ["head"]], ["Spine", ["spine"]], ["Thorax", ["thorax"]], ["Shoulder and arm", ["shoulder", "arm"]],
    ["Forearm and hand", ["forearm", "hand"]], ["Pelvis and thigh", ["pelvis", "thigh"]], ["Leg and foot", ["leg", "foot"]],
  ];
  /* Action words linked to the Body Terms movement cards. */
  const MOVES = [
    [/dorsiflex|plantar ?flex/i, "dorsi", "Dorsiflexion · plantarflexion"], [/pronat|supinat/i, "pro", "Pronation · supination"],
    [/invert|evert|inversion|eversion/i, "inv", "Inversion · eversion"], [/abduct|adduct/i, "abd", "Abduction · adduction"],
    [/rotat/i, "rot", "Rotation"], [/elevat|depress/i, "elev", "Elevation · depression"],
    [/protract|retract/i, "prot", "Protraction · retraction"], [/lateral(ly)? flex|bends? .*side/i, "lat", "Lateral flexion"],
    [/flex|extend|extension/i, "flex", "Flexion · extension"],
  ];
  const byId = Object.fromEntries(Atlas.MUSCLES.map((m) => [m.id, m]));
  const PLATE = Object.fromEntries(Atlas.PLATES.map((p) => [p.id, p]));
  /*
   * Overview plates no single muscle or bone is drawn on, shown on the cards they explain:
   * the vertebral column and the inside of the skull, the inguinal region, pronation and supination.
   */
  const SPINE = ["Atlas (C1)", "Axis (C2)", "Cervical vertebrae (C3–C7)", "Thoracic vertebrae (T1–T12)", "Lumbar vertebrae (L1–L5)", "Sacrum", "Coccyx"];
  const RELATED_PLATES = {
    ...Object.fromEntries(SPINE.map((b) => [b, ["2-5"]])),
    ...Object.fromEntries(Atlas.BONES.filter((b) => b.region === "head").map((b) => [b.name, ["2-3"]])),
    ...Object.fromEntries(["external-abdominal-oblique", "internal-abdominal-oblique", "transversus-abdominis"].map((id) => [id, ["3-13"]])),
    ...Object.fromEntries(["pronator-teres", "pronator-quadratus", "supinator", "biceps-brachii"].map((id) => [id, ["3-20"]])),
  };
  /** The book's summary of each plate, folded away, and its clinical notes. */
  function fromPlates(ids) {
    const ps = [...new Set(ids)].map((id) => PLATE[id]).filter(Boolean);
    return ps.length ? `<div class="d-section"><h4>From the book</h4>${ps.map((p) => `
      <details class="plate-more"><summary>Plate ${esc(p.id)}: ${esc(p.t)}</summary><p>${esc(p.d)}</p></details>
      ${(p.clin || []).map((c) => `<div class="note-box"><b>${esc(c.t)}.</b> ${esc(c.d)}</div>`).join("")}`).join("")}</div>` : "";
  }
  const S = { panel: "muscles", muscle: null, dim: Atlas.dim("anatomy") };
  let viewer = null, viewerRequest = 0;
  /* The panel re-renders on a deep link or a scope change; only the newest request may keep its viewer. */
  async function makeViewer(host, opts) {
    const request = ++viewerRequest;
    dropViewer();
    const v = await Atlas.load3D(host, opts);
    if (!v) return null;
    if (request !== viewerRequest) { v.dispose(); return null; }
    viewer = v;
    Atlas.viewer3d = v;
    return v;
  }
  /* Browsers allow only a few WebGL contexts, so a panel's viewer goes when the panel does. */
  function dropViewer() {
    if (viewer) { viewer.dispose(); viewer = Atlas.viewer3d = null; }
  }
  /* Runs fn once v has loaded, unless a panel change dropped v (and its panel) while the model loaded. */
  function whenLoaded(v, fn) {
    if (v) v.loaded.then((ok) => { if (ok && v === viewer) fn(v); });
  }

  const CREDIT = `3D model: <a href="https://github.com/Z-Anatomy/Models-of-human-anatomy">Z-Anatomy</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>), built on <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/">BodyParts3D</a>, © The Database Center for Life Science (CC BY 4.0). Simplified for the web; see <a href="models/README.md">models/README.md</a>.`;
  const TURN = `<div class="seg" role="group" aria-label="Turn the body"><button data-side="front">Front</button><button data-side="back">Back</button></div>`;
  /*
   * The 3D/2D switch, the 3D toolbar and both figure hosts, for every panel that shows the body.
   * both: controls that apply to either figure type, so they stay visible in 2D.
   */
  function figColumn(id, tools, both = "") {
    const d3 = S.dim === "3d";
    return `<div class="anat-figcol">
      <div class="v3d-bar">
        <div class="seg" id="${id}-dim" role="group" aria-label="Figure type">
          <button data-dim="3d" aria-pressed="${d3}">3D</button><button data-dim="2d" aria-pressed="${!d3}">2D</button>
        </div>
        <div class="v3d-tools" id="${id}-tools" ${d3 ? "" : "hidden"}>${TURN}${tools}</div>
        ${both}
      </div>
      <div class="v3d-host" id="${id}-3d" ${d3 ? "" : "hidden"}></div>
      <p class="v3d-credit" id="${id}-credit" ${d3 ? "" : "hidden"}>${CREDIT}</p>
      <div class="figures" id="${id}-figs" ${d3 ? "hidden" : ""}></div>
    </div>`;
  }
  /**
   * Wire a figure column: start3d builds the viewer the first time 3D shows, and redraw
   * shows the current selection after the figure type changes. The toolbar turns the
   * body, toggles layers (data-layer) and sets viewer options (data-opt).
   */
  function bindFigures(id, start3d, redraw) {
    $(`#${id}-dim`).addEventListener("click", (e) => {
      const b = e.target.closest("[data-dim]"); if (!b || b.dataset.dim === S.dim) return;
      S.dim = b.dataset.dim;
      Atlas.setDim("anatomy", S.dim);
      $(`#${id}-dim`).querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const d3 = S.dim === "3d";
      $(`#${id}-3d`).hidden = $(`#${id}-tools`).hidden = $(`#${id}-credit`).hidden = !d3;
      $(`#${id}-figs`).hidden = d3;
      if (d3 && !$(`#${id}-3d`).childElementCount) start3d();
      redraw();
    });
    $(`#${id}-tools`).addEventListener("click", (e) => { const b = e.target.closest("[data-side]"); if (b && viewer) viewer.view(b.dataset.side); });
    $(`#${id}-tools`).addEventListener("change", (e) => {
      if (!viewer) return;
      const t = e.target;
      if (t.dataset.layer) viewer.setLayer(t.dataset.layer, t.checked);
      else if (t.dataset.opt === "sup") viewer.setDepth(t.checked ? "superficial" : "all");
      else if (t.dataset.opt === "fade") viewer.setFade(t.checked);
    });
    if (S.dim === "3d") start3d();
  }

  /* ---------- Geometry: lines of pull and what lies under them ---------- */
  const at = (id) => { const [dx, y] = Atlas.LANDMARKS[id].at; return [CX - dx, y]; };
  const mean = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  function segDist([px, py], [ax, ay], [bx, by]) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  /* Every origin-to-insertion segment, so a fan-shaped muscle covers its whole spread. */
  const segments = (m) => m.ol.flatMap((o) => m.il.map((i) => [at(o), at(i)]));

  const nearCache = {};
  /* Points on the surface over a muscle's line of pull, in the view it is drawn on. */
  function pointsOver(m) {
    if (!m.v) return [];
    if (nearCache[m.id]) return nearCache[m.id];
    const segs = segments(m);
    const out = Object.values(Atlas.POINTS).filter((p) =>
      Atlas.positions(p, m.v).some((xy) => segs.some(([a, b]) => segDist(xy, a, b) <= NEAR))).map((p) => p.id);
    return (nearCache[m.id] = out);
  }
  /* Muscles whose line of pull passes under a point; used by the Atlas detail panel. */
  Atlas.musclesUnder = (pid) => Atlas.MUSCLES.filter((m) => pointsOver(m).includes(pid));
  const kataFor = (pts) => Atlas.KATA.filter((s, i) => s.pts.some((p) => pts.includes(p)) && Atlas.KATA.findIndex((x) => x.n === s.n) === i);
  const movesFor = (m) => { const seen = new Set(); return MOVES.filter(([re, id]) => re.test(m.a || "") && !seen.has(id) && seen.add(id)); };

  const inPool = (m) => !Atlas.examOnly() || m.exam;
  const examTag = (m) => m.exam ? `<span class="exam-tag" title="On the Chuden exam list, Handbook 4.55-4.61">Exam${typeof m.exam === "string" ? ` · ${esc(m.exam)}` : ""}</span>` : "";
  const muscleChip = (m) => `<button class="chip" data-muscle="${m.id}">${esc(m.n)}</button>`;
  const kataChip = (s) => `<button class="chip" data-kata="${Atlas.KATA.indexOf(s)}">Step ${esc(s.n)} · ${esc(s.t)}</button>`;

  Atlas.views.anatomy = function () {
    const root = $("#view-anatomy");
    root.innerHTML = `
      <p class="view-intro">Bones and muscles from <i>Netter's Anatomy Coloring Book</i>, the course's anatomy text (Handbook 4.54), in our own words with the book's plate numbers. The exam covers the skull, spine and limbs, the palpable landmarks, the knee, and each listed muscle's origin, insertion and action (Handbook 4.54, muscle list 4.55-4.61). <b>Exam</b> shows just that; <b>Everything</b> adds the rest of the book's chapters 2 and 3.</p>
      <div class="anat-bar">
        <div class="seg" id="anat-panels" role="group" aria-label="Section">
          <button data-p="muscles" aria-pressed="true">Muscles</button><button data-p="bones" aria-pressed="false">Bones and joints</button>
          <button data-p="quiz" aria-pressed="false">Quiz</button>
        </div>
        ${Atlas.scopeSwitch("Exam: the anatomy study guide's muscles and bones (Handbook 4.54). Everything: all 188 muscles and 55 bones.")}
      </div>
      <div id="anat-body"></div>`;
    $("#anat-panels").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) panel(b.dataset.p); });
    document.addEventListener("scopechange", () => panel(S.panel));
    panel("muscles");
  };

  Atlas.anatomyGo = (id) => {
    if (!byId[id]) return;
    S.muscle = id;
    /* A muscle off the exam list only shows under Everything. */
    if (!byId[id].exam) Atlas.setExam(false);
    panel("muscles");
  };

  function panel(p) {
    S.panel = p;
    $("#anat-panels").querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === p)));
    viewerRequest++;
    dropViewer();
    ({ muscles, bones, quiz })[p]();
  }

  /* ---------- Figures ---------- */
  function figures(host) {
    host.innerHTML = "<div></div><div></div>";
    const figs = ["front", "back"].map((v, i) => new Atlas.Figure(host.children[i], v, { onPoint: (id) => Atlas.go("atlas", id) }));
    figs.forEach((f) => f.svg.classList.add("hide-off"));
    return figs;
  }
  function drawLine(f, m) {
    const g = f.overlay, o = m.ol.map(at), i = m.il.map(at), co = mean(o), ci = mean(i);
    o.forEach((p) => el("path", { d: `M${p[0]},${p[1]} L${co[0]},${co[1]}`, class: "pull-fan" }, g));
    i.forEach((p) => el("path", { d: `M${p[0]},${p[1]} L${ci[0]},${ci[1]}`, class: "pull-fan" }, g));
    el("path", { d: `M${co[0]},${co[1]} L${ci[0]},${ci[1]}`, class: "pull-band" }, g);
    const dot = (p, id, cls, letter) => {
      const d = el("g", { class: cls }, g);
      el("circle", { cx: p[0], cy: p[1], r: 5 }, d);
      el("text", { x: p[0], y: p[1] + 3, "text-anchor": "middle" }, d).textContent = letter;
      el("title", {}, d).textContent = `${letter === "O" ? "Origin" : "Insertion"}: ${Atlas.LANDMARKS[id].n}`;
    };
    m.ol.forEach((id, k) => dot(o[k], id, "pull-o", "O"));
    m.il.forEach((id, k) => dot(i[k], id, "pull-i", "I"));
    const all = o.concat(i), xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const pad = 40, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
    f.zoomTo([x0, y0, Math.max(...xs) + pad - x0, Math.max(...ys) + pad - y0]);
  }

  /* ---------- Muscles ---------- */
  function muscles() {
    S.dim = Atlas.dim("anatomy");
    const list = Atlas.MUSCLES.filter(inPool);
    if (!S.muscle || !list.some((m) => m.id === S.muscle)) S.muscle = (list.find((m) => m.v) || list[0]).id;
    $("#anat-body").innerHTML = `
      <div class="anat-grid">
        <div class="rail panel">
          <input class="search" id="mus-q" type="search" placeholder="Search muscles" aria-label="Search muscles">
          <p class="muted anat-count">${list.length} muscles${Atlas.examOnly() ? " on the exam list" : ""}</p>
          <div id="mus-items" class="anat-list"></div>
        </div>
        ${figColumn("mus", `
          <label><input type="checkbox" data-layer="bones" checked> Bones</label>
          <label><input type="checkbox" data-layer="joints"> Ligaments</label>
          <label><input type="checkbox" data-opt="sup"> Superficial only</label>
          <label><input type="checkbox" data-opt="fade" checked> Fade others</label>`)}
        <div class="panel anat-card" id="mus-card"></div>
      </div>`;
    const figs = figures($("#mus-figs"));
    const onPick = (id) => (list.some((m) => m.id === id) ? pick(id) : Atlas.anatomyGo(id));
    const start3d = () => makeViewer($("#mus-3d"), { onPick })
      .then((v) => whenLoaded(v, () => { v.setFade(true); showMuscle(byId[S.muscle], figs); }));
    bindFigures("mus", start3d, () => showMuscle(byId[S.muscle], figs));
    const renderList = (q = "") => {
      const ql = q.trim().toLowerCase();
      $("#mus-items").innerHTML = REGIONS.map(([label, regs]) => {
        const ms = list.filter((m) => regs.includes(m.region) && (!ql || `${m.n} ${m.group || ""}`.toLowerCase().includes(ql)));
        return ms.length ? `<h4>${label}</h4>${ms.map((m) => `<button data-mid="${m.id}" aria-pressed="${m.id === S.muscle}">${esc(m.n)}${m.v ? "" : ' <span class="muted">·</span>'}</button>`).join("")}` : "";
      }).join("") || `<p class="muted">No muscles match "${esc(q)}".</p>`;
    };
    const pick = (id) => {
      S.muscle = id;
      $("#mus-items").querySelectorAll("[data-mid]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mid === id)));
      showMuscle(byId[id], figs);
    };
    renderList();
    $("#mus-q").addEventListener("input", (e) => renderList(e.target.value));
    $("#mus-items").addEventListener("click", (e) => { const b = e.target.closest("[data-mid]"); if (b) pick(b.dataset.mid); });
    pick(S.muscle);
  }

  /* A muscle's line of pull, and the points and channels over it, on the 2D figure it is drawn on; null clears them. */
  function drawFigures(m, figs) {
    const pts = m ? pointsOver(m) : [];
    const chs = [...new Set(pts.map((id) => Atlas.POINTS[id].ch).filter(Boolean))];
    figs.forEach((f) => {
      f.clearOverlay();
      const on = Boolean(m) && f.view === m.v;
      f.host.classList.toggle("fig-dim", Boolean(m) && !on);
      f.showChannels(new Set(on ? chs : []));
      f.highlight(on ? chs : [], on ? pts : []);
      f.filterPoints((p) => on && pts.includes(p.id));
      if (on) drawLine(f, m); else f.zoomTo(Atlas.REGIONS.full);
    });
    return { pts, chs };
  }

  function showMuscle(m, figs) {
    const v = viewer;
    if (S.dim === "3d" && v) v.loaded.then((ok) => ok && v.focusMuscle(m.id, { side: m.v }));
    const { pts, chs } = drawFigures(m, figs);
    const kata = kataFor(pts), moves = movesFor(m);
    const row = (k, v) => v ? `<div class="oia"><span class="eyebrow">${k}</span><p>${esc(v)}</p></div>` : "";
    $("#mus-card").innerHTML = `
      <div class="card-top"><span class="eyebrow">${esc(m.group || m.region)}</span>${examTag(m)}</div>
      <h3 class="lens-muscle">${esc(m.n)}</h3>
      <div class="src">Netter plate ${esc(m.plate)}</div>
      ${row("Origin", m.o)}${row("Insertion", m.i)}${row("Action", m.a)}${row("Nerve", m.nerve)}
      ${!m.o && !m.i ? `<p class="muted" style="margin:0">The book names this muscle without giving its attachments.</p>` : ""}
      ${m.note ? `<div class="note-box">${esc(m.note)}</div>` : ""}
      ${fromPlates([m.plate, ...(RELATED_PLATES[m.id] || [])])}
      ${S.dim === "3d" ? pull3d(m)
        : m.v ? `<p class="muted pull-why">A muscle pulls its insertion (I) toward its origin (O). The band on the ${m.v} figure shows that line of pull.</p>`
        : `<p class="muted pull-why">Not drawn on the figure: it is internal or too small to place.</p>`}
      ${moves.length ? `<div class="d-section"><h4>See the movement</h4><div class="chips">${moves.map(([, id, t]) => `<button class="chip" data-move="${id}">${t}</button>`).join("")}</div></div>` : ""}
      ${chs.length ? `<div class="d-section"><h4>Channels over it</h4><div class="chips">${chs.map((c) => `<span class="chip" style="color:${Atlas.elColor(c)}"><span class="dot"></span>${esc(Atlas.CHANNELS[c].name)}</span>`).join("")}</div></div>` : ""}
      ${pts.length ? `<div class="d-section"><h4>Points over its line of pull</h4><div class="pt-wrap">${pts.map((id) => `${Atlas.ptLink(id)} <span class="muted">${esc(Atlas.POINTS[id].en)}</span>`).join(" · ")}</div></div>` : ""}
      ${kata.length ? `<div class="d-section"><h4>Kata steps that work these points</h4><div class="chips">${kata.map(kataChip).join("")}</div></div>` : ""}
      ${m.v ? `<p class="muted" style="font-size:12.5px;margin:0">Landmark positions, and so the points and kata listed, are approximate.</p>` : ""}`;
  }

  /* What the 3D view shows for a muscle, read from the model's muscle map once it has loaded. */
  function pull3d(m) {
    const map = viewer && viewer.map && viewer.map[m.id];
    if (viewer && viewer.map && !map) return `<p class="muted pull-why">This muscle isn't in the 3D model; switch to 2D for its line of pull.</p>`;
    const ends = map ? [map.o.length ? '<span class="v3d-key o">origin</span>' : "", map.i.length ? '<span class="v3d-key i">insertion</span>' : ""].filter(Boolean) : [];
    return `<p class="muted pull-why">Highlighted in orange on the 3D body${ends.length ? `, with its ${ends.join(" and ")} on the bone` : ""}. A muscle pulls its insertion toward its origin.</p>`;
  }

  /* ---------- Bones and joints ---------- */
  /* The study guide leaves out the individual bones of the hands and feet (Handbook 4.54). */
  const NOT_ON_EXAM = new Set(["Scaphoid", "Lunate", "Triquetrum", "Pisiform", "Trapezium", "Trapezoid", "Capitate", "Hamate",
    "Sesamoid bones of the hand", "Talus", "Calcaneus", "Navicular", "Cuboid", "Cuneiforms (medial, intermediate, lateral)",
    "Sesamoid bones of the foot"]);
  /* Joints seen from behind; the rest are framed from the front. */
  const BACK_JOINTS = /sacro-iliac|zygapophysial|costovertebral|lumbosacral|sacrococcygeal|atlanto/i;
  /**
   * What the 3D body shows for some landmarks: a dot on the bone for each spot, the
   * bones or ligaments for each landmark that spans them, and the side to look from
   * (whichever side most of them face).
   */
  function landmarks3d(ids) {
    const spots = [], pieces = [], back = [];
    ids.forEach((id) => {
      const l = Atlas.LM3D[id];
      if (!l) return;
      if (l.p) spots.push({ p: l.p, label: Atlas.LANDMARKS[id].n });
      else pieces.push(...l.parts);
      back.push(l.p ? l.p[5] < 0 : l.v === "back");
    });
    return { spots, pieces, view: back.filter(Boolean).length * 2 > back.length ? "back" : "front" };
  }

  function bones() {
    S.dim = Atlas.dim("anatomy");
    /* Hiding the dots lets you find a landmark on the bare bone first; one picked from the card still shows. */
    let marks = Atlas.store.get("anatMarks", true);
    $("#anat-body").innerHTML = `
      <div class="anat-grid">
        <div class="rail panel">
          <button class="chip" id="palp-btn" type="button" aria-pressed="false">Palpable landmarks (Handbook 4.64)</button>
          <p class="muted anat-count">${Atlas.examOnly()
            ? `${Atlas.BONES.length - NOT_ON_EXAM.size} bones. The exam leaves out the individual carpals, tarsals and sesamoids (Handbook 4.54).`
            : `All ${Atlas.BONES.length} bones, including the carpals, tarsals and sesamoids the exam leaves out (Handbook 4.54).`}</p>
          <div id="bone-items" class="anat-list">${BONE_REGIONS.map(([label, regs]) => {
            const bs = Atlas.BONES.filter((b) => regs.includes(b.region) && !(Atlas.examOnly() && NOT_ON_EXAM.has(b.name)));
            return bs.length ? `<h4>${label}</h4>${bs.map((b) => `<button data-bone="${esc(b.name)}">${esc(b.name)}</button>`).join("")}` : "";
          }).join("")}</div>
        </div>
        ${figColumn("bone", `
          <label><input type="checkbox" data-layer="muscles"> Muscles</label>
          <label><input type="checkbox" data-layer="joints"> Ligaments</label>`,
          `<label class="v3d-opt"><input type="checkbox" id="bone-marks" ${marks ? "checked" : ""}> Landmarks</label>`)}
        <div class="panel anat-card" id="bone-card"></div>
      </div>`;
    const figs = figures($("#bone-figs"));
    /* What is on show, so a switch between 3D and 2D redraws it: palp, a bone, a landmark or a joint. */
    let sel = { kind: "palp" };
    /* Labels sit on the side of each dot away from the group's center, so pairs like the condyles don't collide. */
    const mark = (ids) => figs.forEach((f) => {
      f.clearOverlay(); f.showChannels(new Set()); f.filterPoints(() => false); f.host.classList.remove("fig-dim");
      const cx = ids.length ? mean(ids.map(at))[0] : CX;
      ids.forEach((id) => {
        const [x, y] = at(id), lm = Atlas.LANDMARKS[id], left = x <= cx;
        const g = el("g", { class: "lm" + (lm.palp ? " palp" : "") }, f.overlay);
        el("circle", { cx: x, cy: y, r: 4.5 }, g);
        el("text", { x: x + (left ? -8 : 8), y: y + 3, "text-anchor": left ? "end" : "start" }, g).textContent = lm.n;
      });
    });
    const zoom2d = (ids) => {
      if (!ids.length) { figs.forEach((f) => f.zoomTo(Atlas.REGIONS.full)); return; }
      const pts = ids.map(at), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), pad = 50;
      figs.forEach((f) => f.zoomTo([Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad]));
    };
    const palpIds = Object.keys(Atlas.LANDMARKS).filter((k) => Atlas.LANDMARKS[k].palp);
    const boneIds = (name) => Object.keys(Atlas.LANDMARKS).filter((k) => Atlas.LANDMARKS[k].b === name);
    function draw() {
      const side = sel.side || "L";
      const shown = (ids) => (marks || sel.kind === "lm" ? ids : []);
      if (S.dim === "2d") {
        const ids = sel.kind === "palp" ? palpIds : sel.kind === "bone" ? boneIds(sel.name) : sel.kind === "lm" ? [sel.id] : [];
        mark(shown(ids));
        if (sel.kind === "palp") zoom2d([]); else if (sel.kind === "bone") zoom2d(ids);
        return;
      }
      const v = viewer;
      if (!v) return;
      let spec;
      if (sel.kind === "palp") spec = { spots: shown(landmarks3d(palpIds).spots) };
      else if (sel.kind === "bone") {
        const { spots, view } = landmarks3d(boneIds(sel.name));
        spec = { pieces: Atlas.BONE3D[sel.name], spots: shown(spots), both: true, side, view };
      } else if (sel.kind === "lm") {
        const { spots, pieces, view } = landmarks3d([sel.id]);
        /* Every landmark the panel lists sits on a listed bone; soft tissue (fascia, retinacula) never appears here. */
        spec = { pieces: pieces.length ? pieces : Atlas.BONE3D[Atlas.LANDMARKS[sel.id].b], spots, side, view };
      } else {
        const j = Atlas.JOINT3D[sel.name], view = BACK_JOINTS.test(sel.name) ? "back" : "front";
        /* A joint shows its ligaments; the cranial sutures and others with none in the model light their bones. */
        spec = { pieces: j.parts.length ? j.parts : j.bones, side, view };
      }
      v.loaded.then((ok) => { if (!ok) return; v.focusAnatomy(spec); if (sel.kind === "palp") v.view("front"); });
    }
    const start3d = () => makeViewer($("#bone-3d"), { onBone: pickPiece })
      .then((v) => whenLoaded(v, () => { v.setGhost(true); v.setLayer("muscles", false); draw(); }));
    bindFigures("bone", start3d, draw);
    $("#bone-marks").addEventListener("change", (e) => {
      marks = e.target.checked;
      Atlas.store.set("anatMarks", marks);
      draw();
    });

    const setPressed = (key) => {
      $("#palp-btn").setAttribute("aria-pressed", String(key === "palp"));
      $("#bone-items").querySelectorAll("[data-bone]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.bone === key)));
    };
    function showPalp() {
      setPressed("palp");
      sel = { kind: "palp" };
      draw();
      $("#bone-card").innerHTML = `<span class="eyebrow">Handbook 4.64</span><h3 class="lens-muscle">Palpable landmarks</h3>
        <p style="margin:0">The bony landmarks the handbook expects you to find by touch. Pick one to see what attaches to it.</p>
        <p class="muted" style="margin:0">The handbook's list also names a calcaneal spur, which is an abnormal growth, and the maxillary sinus, an air space beside the nose; neither is marked here.</p>
        <div class="anat-list">${palpIds.map((k) => `<button data-lm="${k}">${esc(Atlas.LANDMARKS[k].n)}</button>`).join("")}</div>
        <div id="lm-out"></div>`;
    }
    function showBone(name, side = "L") {
      setPressed(name);
      sel = { kind: "bone", name, side };
      draw();
      const b = Atlas.BONES.find((x) => x.name === name);
      const ids = boneIds(name);
      const key = name.split(/[ (]/)[0].toLowerCase();
      const joints = Atlas.JOINTS.filter((j) => (j.bones || []).some((x) => x.toLowerCase().includes(key)));
      const attach = Atlas.MUSCLES.filter((m) => m.v && [...m.ol, ...m.il].some((id) => Atlas.LANDMARKS[id].b === name) && inPool(m));
      const shared = Atlas.BONE3D[name].includes("Hip bone.l") && name !== "Coxal (hip) bone";
      $("#bone-card").innerHTML = `
        <span class="eyebrow">${esc(b.region)}</span><h3 class="lens-muscle">${esc(b.name)}</h3><div class="src">Netter plate ${esc(b.plate)}</div>
        ${b.notes ? `<p style="margin:0">${esc(b.notes)}</p>` : ""}
        ${shared ? `<p class="muted" style="margin:0">The 3D model's hip bone is one piece, so the whole hip bone lights; the dots mark this part.</p>` : ""}
        ${!Atlas.BONE3D[name].length ? `<p class="muted" style="margin:0">Not in the 3D model.</p>` : ""}
        ${(b.landmarks || []).length ? `<div class="d-section"><h4>Landmarks</h4><div class="chips">${b.landmarks.map((l) => `<span class="chip">${esc(l)}</span>`).join("")}</div></div>` : ""}
        ${ids.length ? `<div class="d-section"><h4>Find on the body</h4><div class="chips">${ids.map((k) => `<button class="chip" data-lm="${k}">${esc(Atlas.LANDMARKS[k].n)}</button>`).join("")}</div><div id="lm-out"></div></div>` : ""}
        ${attach.length ? `<div class="d-section"><h4>Muscles that attach here${Atlas.examOnly() ? " (exam list)" : ""}</h4><div class="chips">${attach.map(muscleChip).join("")}</div></div>` : ""}
        ${joints.map(jointCard).join("")}
        ${fromPlates([b.plate, ...(RELATED_PLATES[name] || []), ...joints.map((j) => j.plate)])}`;
    }
    /* A click on the 3D skeleton picks that bone, on the side clicked. Teeth and cartilages have no entry. */
    function pickPiece(piece) {
      const left = piece.replace(/\.r$/, ".l");
      const name = Object.keys(Atlas.BONE3D).find((k) => Atlas.BONE3D[k].includes(left));
      if (!name) return;
      showBone(name, piece.endsWith(".r") ? "R" : "L");
      const b = $("#bone-items").querySelector(`[data-bone="${CSS.escape(name)}"]`);
      if (b) b.scrollIntoView({ block: "nearest" });
    }
    $("#palp-btn").addEventListener("click", showPalp);
    $("#bone-items").addEventListener("click", (e) => { const b = e.target.closest("[data-bone]"); if (b) showBone(b.dataset.bone); });
    $("#bone-card").addEventListener("click", (e) => {
      const jb = e.target.closest("[data-joint]");
      if (jb) {
        sel = { kind: "joint", name: jb.dataset.joint, side: sel.side };
        if (S.dim === "2d") $("#bone-dim [data-dim='3d']").click(); else draw();
        return;
      }
      const b = e.target.closest("[data-lm]"); if (!b) return;
      const id = b.dataset.lm;
      $("#bone-card").querySelectorAll("[data-lm]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const ms = Atlas.MUSCLES.filter((m) => m.v && [...m.ol, ...m.il].includes(id));
      $("#lm-out").innerHTML = `<div class="d-section"><h4>Attaches here</h4>${ms.length ? `<div class="chips">${ms.map(muscleChip).join("")}</div>` : `<p class="muted" style="margin:0">No muscle in this atlas is placed on it.</p>`}</div>`;
      sel = { kind: "lm", id, side: sel.side };
      draw();
    });
    showPalp();
  }

  function jointCard(j) {
    const exam = /knee \(tibiofemoral\)/i.test(j.name);
    return `<div class="joint">
      <div class="card-top"><h4>${esc(j.name)}</h4>${exam ? `<span class="exam-tag" title="Handbook 4.54">Exam: knee structure</span>` : ""}</div>
      <p class="muted" style="margin:0">${esc(j.type || "")} · plate ${esc(j.plate)}</p>
      ${(j.movements || []).length ? `<p style="margin:0"><b>Moves:</b> ${esc(j.movements.join(", "))}</p>` : ""}
      ${(j.ligaments || []).length ? `<p style="margin:0"><b>Ligaments and structures:</b> ${esc(j.ligaments.join(", "))}</p>` : ""}
      ${j.notes ? `<p style="margin:0">${esc(j.notes)}</p>` : ""}
      <div><button class="chip" data-joint="${esc(j.name)}">Show on the 3D body</button></div>
    </div>`;
  }

  /* ---------- Quiz ---------- */
  const Q = { mode: "name", right: 0, total: 0, q: null, figs: [] };
  function quiz() {
    S.dim = Atlas.dim("anatomy");
    $("#anat-body").innerHTML = `
      <div class="anat-quiz-grid">
      <div class="panel anat-quiz">
        <div class="card-top">
          <div class="seg" id="aq-mode" role="group" aria-label="Quiz type">
            <button data-q="name" aria-pressed="${Q.mode === "name"}">Name the muscle</button><button data-q="action" aria-pressed="${Q.mode === "action"}">Pick the action</button>
          </div>
          <span class="muted" id="aq-score">${Q.right} of ${Q.total}</span>
        </div>
        <div id="aq"></div>
      </div>
      ${figColumn("aq", "")}
      </div>`;
    Q.figs = figures($("#aq-figs"));
    /* quiet: hovering must not name the muscle the question is about. */
    bindFigures("aq", () => makeViewer($("#aq-3d"), { quiet: true })
      .then((v) => whenLoaded(v, () => { v.setFade(true); showQ(); })), showQ);
    $("#aq-mode").addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]"); if (!b) return;
      Q.mode = b.dataset.q; Q.right = Q.total = 0;
      $("#aq-mode").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      next();
    });
    $("#aq").addEventListener("click", (e) => {
      const b = e.target.closest("[data-opt]");
      if (b && !Q.q.done) answer(Number(b.dataset.opt));
      if (e.target.closest("#aq-next")) next();
      if (e.target.closest("#aq-hint")) { Q.q.shown = true; showQ(); }
    });
    next();
  }
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* Hide the muscle's own name inside its clues, such as "psoas major tendon" in iliacus. */
  const mask = (text, m) => esc(text).replace(new RegExp(m.n.split(/[ ,()]+/).filter((w) => w.length > 3).join("|") || "^$", "gi"), "▢▢▢");
  function next() {
    const pool = Atlas.MUSCLES.filter((m) => inPool(m) && m.o && m.i && m.a);
    const m = pool[Math.floor(Math.random() * pool.length)];
    const same = pool.filter((x) => x !== m && x.region === m.region && (Q.mode === "name" || x.a !== m.a));
    /* In action mode, muscles that share an action (infraspinatus, teres minor) would give duplicate choices. */
    const used = new Set([m.a]);
    const others = shuffle(same.length >= 3 ? same : pool.filter((x) => x !== m))
      .filter((x) => Q.mode === "name" || (!used.has(x.a) && used.add(x.a))).slice(0, 3);
    const opts = shuffle([m, ...others]);
    /* Naming the muscle from its picture would be too easy, so that mode keeps it hidden until asked. */
    Q.q = { m, opts, done: false, shown: Q.mode === "action" };
    $("#aq").innerHTML = Q.mode === "name"
      ? `<p class="aq-prompt">Which muscle is this?</p>
         <div class="oia"><span class="eyebrow">Origin</span><p>${mask(m.o, m)}</p></div>
         <div class="oia"><span class="eyebrow">Insertion</span><p>${mask(m.i, m)}</p></div>
         <div class="oia"><span class="eyebrow">Action</span><p>${mask(m.a, m)}</p></div>
         <div class="aq-opts">${opts.map((o, k) => `<button class="btn ghost" data-opt="${k}">${esc(o.n)}</button>`).join("")}</div>
         <div><button class="chip" id="aq-hint" type="button">Show on the body</button></div>`
      : `<p class="aq-prompt">What does <b>${esc(m.n)}</b> do?</p>
         <p class="muted" style="margin:0">Origin: ${esc(m.o)}. Insertion: ${esc(m.i)}.</p>
         <div class="aq-opts">${opts.map((o, k) => `<button class="btn ghost" data-opt="${k}">${esc(o.a)}</button>`).join("")}</div>`;
    $("#aq").insertAdjacentHTML("beforeend", `<p class="muted aq-where" id="aq-where"></p>`);
    showQ();
  }
  /* The figure beside the question: blank until the muscle is shown, then the muscle and its attachments. */
  function showQ() {
    const q = Q.q;
    if (!q) return;
    const m = q.shown ? q.m : null, hint = $("#aq-hint"), where = $("#aq-where");
    if (hint) hint.hidden = q.shown;
    if (S.dim === "2d") {
      drawFigures(m, Q.figs);
      where.textContent = m && !m.v ? "This muscle isn't drawn on the 2D figure; switch to 3D." : "";
      return;
    }
    const v = viewer;
    if (!v) return;
    v.loaded.then((ok) => {
      if (!ok || Q.q !== q) return;
      v.focusMuscle(m ? m.id : null, { side: m && m.v });
      if (!m) v.view("front");
      where.textContent = m && !v.map[m.id] ? "This muscle isn't in the 3D model; switch to 2D." : m ? "Orange: the muscle. Red: origin. Blue: insertion." : "";
    });
  }
  function answer(k) {
    const { m, opts } = Q.q, ok = opts[k] === m;
    Q.q.done = true; Q.total++; if (ok) Q.right++;
    Q.q.shown = true;
    showQ();
    $("#aq-score").textContent = `${Q.right} of ${Q.total}`;
    $("#aq").querySelectorAll("[data-opt]").forEach((b) => {
      const o = opts[Number(b.dataset.opt)];
      b.classList.toggle("ok", o === m); b.classList.toggle("no", Number(b.dataset.opt) === k && !ok); b.disabled = true;
    });
    $("#aq").insertAdjacentHTML("beforeend", `
      <p class="aq-result ${ok ? "good" : "bad"}">${ok ? "Correct." : `Not quite. It's ${esc(m.n)}.`} <span class="muted">Netter plate ${esc(m.plate)}</span></p>
      <div class="chips">${muscleChip(m)}<button class="btn" id="aq-next" type="button">Next question</button></div>`);
  }

  /* Muscle chips anywhere open the explorer; movement chips open Body Terms at that card. */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-muscle]");
    if (b) { e.preventDefault(); Atlas.go("anatomy", b.dataset.muscle); return; }
    const mv = e.target.closest("[data-move]");
    if (mv) {
      Atlas.go("terms");
      const card = document.querySelector(`.move[data-m="${mv.dataset.move}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
