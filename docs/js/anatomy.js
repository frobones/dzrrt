/*
 * Anatomy view: bones and muscles from Netter's Anatomy Coloring Book, the course's
 * anatomy text (Handbook 4.53), tied to the channels, points and kata.
 * Panels: a muscle explorer, in 3D (docs/js/viewer3d.js, loaded on demand) or as a
 * line of pull on the 2D figure,
 * bones and joints with their landmarks, the plate coloring checklist, and a quiz.
 * The Chuden exam list (Handbook 4.54-4.61) is the default; a toggle shows all 188.
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
  const S = { exam: Atlas.store.get("anatExam", true), panel: "muscles", muscle: null, dim: Atlas.dim() };
  let viewer = null, viewerRequest = 0;
  /* The panel re-renders on a deep link or a scope change; only the newest request may keep its viewer. */
  async function makeViewer(host, onPick) {
    const request = ++viewerRequest;
    if (viewer) { viewer.dispose(); viewer = null; }
    const v = await Atlas.load3D(host, { onPick });
    if (!v) return null;
    if (request !== viewerRequest) { v.dispose(); return null; }
    viewer = v;
    Atlas.viewer3d = v;
    return v;
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

  const inPool = (m) => !S.exam || m.exam;
  const examTag = (m) => m.exam ? `<span class="exam-tag" title="On the Chuden exam list, Handbook 4.54-4.61">Exam${typeof m.exam === "string" ? ` · ${esc(m.exam)}` : ""}</span>` : "";
  const muscleChip = (m) => `<button class="chip" data-muscle="${m.id}">${esc(m.n)}</button>`;
  const kataChip = (s) => `<button class="chip" data-kata="${Atlas.KATA.indexOf(s)}">Step ${esc(s.n)} · ${esc(s.t)}</button>`;

  Atlas.views.anatomy = function () {
    const root = $("#view-anatomy");
    root.innerHTML = `
      <p class="view-intro">Bones and muscles from <i>Netter's Anatomy Coloring Book</i>, the course's anatomy text (Handbook 4.53), in our own words with the book's plate numbers. The exam covers the skull, spine and limbs, the palpable landmarks, the knee, and each listed muscle's origin, insertion and action (Handbook 4.53-4.61).</p>
      <div class="anat-bar">
        <div class="seg" id="anat-panels" role="group" aria-label="Section">
          <button data-p="muscles" aria-pressed="true">Muscles</button><button data-p="bones" aria-pressed="false">Bones and joints</button>
          <button data-p="plates" aria-pressed="false">Plates</button><button data-p="quiz" aria-pressed="false">Quiz</button>
        </div>
        <div class="seg" id="anat-scope" role="group" aria-label="Which muscles">
          <button data-x="1" aria-pressed="${S.exam}">Exam list</button><button data-x="0" aria-pressed="${!S.exam}">All 188</button>
        </div>
      </div>
      <div id="anat-body"></div>`;
    $("#anat-panels").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) panel(b.dataset.p); });
    $("#anat-scope").addEventListener("click", (e) => {
      const b = e.target.closest("[data-x]"); if (!b) return;
      S.exam = b.dataset.x === "1";
      Atlas.store.set("anatExam", S.exam);
      $("#anat-scope").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      panel(S.panel);
    });
    panel("muscles");
  };

  Atlas.anatomyGo = (id) => {
    if (!byId[id]) return;
    if (S.exam && !byId[id].exam) { S.exam = false; $("#anat-scope").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.x === "0"))); }
    S.muscle = id;
    panel("muscles");
  };

  function panel(p) {
    S.panel = p;
    $("#anat-panels").querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === p)));
    $("#anat-scope").hidden = p === "bones" || p === "plates";
    ({ muscles, bones, plates, quiz })[p]();
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
    S.dim = Atlas.dim();
    const list = Atlas.MUSCLES.filter(inPool);
    if (!S.muscle || !list.some((m) => m.id === S.muscle)) S.muscle = (list.find((m) => m.v) || list[0]).id;
    $("#anat-body").innerHTML = `
      <div class="anat-grid">
        <div class="rail panel">
          <input class="search" id="mus-q" type="search" placeholder="Search muscles" aria-label="Search muscles">
          <p class="muted anat-count">${list.length} muscles${S.exam ? " on the exam list" : ""}</p>
          <div id="mus-items" class="anat-list"></div>
        </div>
        <div class="anat-figcol">
          <div class="v3d-bar">
            <div class="seg" id="mus-dim" role="group" aria-label="Figure type">
              <button data-dim="3d" aria-pressed="${S.dim === "3d"}">3D</button><button data-dim="2d" aria-pressed="${S.dim === "2d"}">2D</button>
            </div>
            <div class="v3d-tools" id="v3d-tools" ${S.dim === "3d" ? "" : "hidden"}>
              <div class="seg" role="group" aria-label="Turn the body"><button data-side="front">Front</button><button data-side="back">Back</button></div>
              <label><input type="checkbox" data-layer="bones" checked> Bones</label>
              <label><input type="checkbox" data-layer="joints"> Ligaments</label>
              <label><input type="checkbox" id="v3d-sup"> Superficial only</label>
              <label><input type="checkbox" id="v3d-fade" checked> Fade others</label>
            </div>
          </div>
          <div id="mus-3d" ${S.dim === "3d" ? "" : "hidden"}></div>
          <p class="v3d-credit" ${S.dim === "3d" ? "" : "hidden"}>3D model: <a href="https://github.com/Z-Anatomy/Models-of-human-anatomy">Z-Anatomy</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>), built on <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/">BodyParts3D</a>, © The Database Center for Life Science (CC BY 4.0). Simplified for the web; see <a href="models/README.md">models/README.md</a>.</p>
          <div class="figures" id="mus-figs" ${S.dim === "2d" ? "" : "hidden"}></div>
        </div>
        <div class="panel anat-card" id="mus-card"></div>
      </div>`;
    const figs = figures($("#mus-figs"));
    const start3d = () => makeViewer($("#mus-3d"), (id) => (list.some((m) => m.id === id) ? pick(id) : Atlas.anatomyGo(id)))
      .then((v) => v && v.loaded.then((ok) => { if (ok) { v.setFade(true); showMuscle(byId[S.muscle], figs); } }));
    if (S.dim === "3d") start3d();
    $("#mus-dim").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dim]"); if (!b || b.dataset.dim === S.dim) return;
      S.dim = b.dataset.dim;
      Atlas.setDim(S.dim);
      $("#mus-dim").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("#mus-3d").hidden = $("#v3d-tools").hidden = $(".v3d-credit").hidden = S.dim !== "3d";
      $("#mus-figs").hidden = S.dim !== "2d";
      if (S.dim === "3d" && !$("#mus-3d").childElementCount) start3d();
      showMuscle(byId[S.muscle], figs);
    });
    $("#v3d-tools").addEventListener("click", (e) => { const b = e.target.closest("[data-side]"); if (b && viewer) viewer.view(b.dataset.side); });
    $("#v3d-tools").addEventListener("change", (e) => {
      if (!viewer) return;
      const t = e.target;
      if (t.dataset.layer) viewer.setLayer(t.dataset.layer, t.checked);
      else if (t.id === "v3d-sup") viewer.setDepth(t.checked ? "superficial" : "all");
      else if (t.id === "v3d-fade") viewer.setFade(t.checked);
    });
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

  function showMuscle(m, figs) {
    const v = viewer;
    if (S.dim === "3d" && v) v.loaded.then((ok) => ok && v.focusMuscle(m.id, { side: m.v }));
    const pts = pointsOver(m);
    const chs = [...new Set(pts.map((id) => Atlas.POINTS[id].ch).filter(Boolean))];
    figs.forEach((f) => {
      f.clearOverlay();
      const on = f.view === m.v;
      f.host.classList.toggle("fig-dim", !on);
      f.showChannels(new Set(on ? chs : []));
      f.highlight(on ? chs : [], on ? pts : []);
      f.filterPoints((p) => on && pts.includes(p.id));
      if (on) drawLine(f, m); else f.zoomTo(Atlas.REGIONS.full);
    });
    const kata = kataFor(pts), moves = movesFor(m);
    const row = (k, v) => v ? `<div class="oia"><span class="eyebrow">${k}</span><p>${esc(v)}</p></div>` : "";
    $("#mus-card").innerHTML = `
      <div class="card-top"><span class="eyebrow">${esc(m.group || m.region)}</span>${examTag(m)}</div>
      <h3 class="lens-muscle">${esc(m.n)}</h3>
      <div class="src">Netter plate ${esc(m.plate)}</div>
      ${row("Origin", m.o)}${row("Insertion", m.i)}${row("Action", m.a)}${row("Nerve", m.nerve)}
      ${!m.o && !m.i ? `<p class="muted" style="margin:0">The book names this muscle without giving its attachments.</p>` : ""}
      ${m.note ? `<div class="note-box">${esc(m.note)}</div>` : ""}
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
  function bones() {
    $("#anat-body").innerHTML = `
      <div class="anat-grid">
        <div class="rail panel">
          <button class="chip" id="palp-btn" type="button" aria-pressed="false">Palpable landmarks (Handbook 4.6)</button>
          <p class="muted anat-count">The exam skips the individual carpals and tarsals (Handbook 4.53).</p>
          <div id="bone-items" class="anat-list">${BONE_REGIONS.map(([label, regs]) => {
            const bs = Atlas.BONES.filter((b) => regs.includes(b.region));
            return bs.length ? `<h4>${label}</h4>${bs.map((b) => `<button data-bone="${esc(b.name)}">${esc(b.name)}</button>`).join("")}` : "";
          }).join("")}</div>
        </div>
        <div class="figures" id="bone-figs"></div>
        <div class="panel anat-card" id="bone-card"></div>
      </div>`;
    const figs = figures($("#bone-figs"));
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
    const setPressed = (sel) => {
      $("#palp-btn").setAttribute("aria-pressed", String(sel === "palp"));
      $("#bone-items").querySelectorAll("[data-bone]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.bone === sel)));
    };
    function showPalp() {
      setPressed("palp");
      const ids = Object.keys(Atlas.LANDMARKS).filter((k) => Atlas.LANDMARKS[k].palp);
      mark(ids);
      figs.forEach((f) => f.zoomTo(Atlas.REGIONS.full));
      $("#bone-card").innerHTML = `<span class="eyebrow">Handbook 4.6</span><h3 class="lens-muscle">Palpable landmarks</h3>
        <p style="margin:0">The bony landmarks the handbook expects you to find by touch. Pick one to see what attaches to it.</p>
        <div class="anat-list">${ids.map((k) => `<button data-lm="${k}">${esc(Atlas.LANDMARKS[k].n)}</button>`).join("")}</div>
        <div id="lm-out"></div>`;
    }
    function showBone(name) {
      setPressed(name);
      const b = Atlas.BONES.find((x) => x.name === name);
      const ids = Object.keys(Atlas.LANDMARKS).filter((k) => Atlas.LANDMARKS[k].b === name);
      mark(ids);
      if (ids.length) {
        const pts = ids.map(at), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), pad = 50;
        figs.forEach((f) => f.zoomTo([Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad]));
      } else figs.forEach((f) => f.zoomTo(Atlas.REGIONS.full));
      const key = name.split(/[ (]/)[0].toLowerCase();
      const joints = Atlas.JOINTS.filter((j) => (j.bones || []).some((x) => x.toLowerCase().includes(key)));
      const attach = Atlas.MUSCLES.filter((m) => m.v && [...m.ol, ...m.il].some((id) => Atlas.LANDMARKS[id].b === name) && inPool(m));
      $("#bone-card").innerHTML = `
        <span class="eyebrow">${esc(b.region)}</span><h3 class="lens-muscle">${esc(b.name)}</h3><div class="src">Netter plate ${esc(b.plate)}</div>
        ${b.notes ? `<p style="margin:0">${esc(b.notes)}</p>` : ""}
        ${(b.landmarks || []).length ? `<div class="d-section"><h4>Landmarks</h4><div class="chips">${b.landmarks.map((l) => `<span class="chip">${esc(l)}</span>`).join("")}</div></div>` : ""}
        ${attach.length ? `<div class="d-section"><h4>Muscles that attach here${S.exam ? " (exam list)" : ""}</h4><div class="chips">${attach.map(muscleChip).join("")}</div></div>` : ""}
        ${joints.map(jointCard).join("")}`;
    }
    $("#palp-btn").addEventListener("click", showPalp);
    $("#bone-items").addEventListener("click", (e) => { const b = e.target.closest("[data-bone]"); if (b) showBone(b.dataset.bone); });
    $("#bone-card").addEventListener("click", (e) => {
      const b = e.target.closest("[data-lm]"); if (!b) return;
      const id = b.dataset.lm;
      $("#bone-card").querySelectorAll("[data-lm]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const ms = Atlas.MUSCLES.filter((m) => m.v && [...m.ol, ...m.il].includes(id));
      $("#lm-out").innerHTML = `<div class="d-section"><h4>Attaches here</h4>${ms.length ? `<div class="chips">${ms.map(muscleChip).join("")}</div>` : `<p class="muted" style="margin:0">No muscle in this atlas is placed on it.</p>`}</div>`;
      mark([id]);
    });
    showPalp();
  }

  function jointCard(j) {
    const exam = /knee \(tibiofemoral\)/i.test(j.name);
    return `<div class="joint">
      <div class="card-top"><h4>${esc(j.name)}</h4>${exam ? `<span class="exam-tag" title="Handbook 4.53">Exam: knee structure</span>` : ""}</div>
      <p class="muted" style="margin:0">${esc(j.type || "")} · plate ${esc(j.plate)}</p>
      ${(j.movements || []).length ? `<p style="margin:0"><b>Moves:</b> ${esc(j.movements.join(", "))}</p>` : ""}
      ${(j.ligaments || []).length ? `<p style="margin:0"><b>Ligaments and structures:</b> ${esc(j.ligaments.join(", "))}</p>` : ""}
      ${j.notes ? `<p style="margin:0">${esc(j.notes)}</p>` : ""}
    </div>`;
  }

  /* ---------- Plates checklist ---------- */
  function plates() {
    const done = new Set(Atlas.store.get("plates", []));
    const info = Object.fromEntries(Atlas.PLATES.map((p) => [p.id, p]));
    const assigned = new Set(Atlas.ASSIGNMENTS.flatMap((c) => c.plates.map((p) => p.id)));
    const extra = Atlas.PLATES.filter((p) => !assigned.has(p.id));
    const item = (p) => {
      const d = info[p.id], ms = Atlas.MUSCLES.filter((m) => m.plate === p.id), bs = Atlas.BONES.filter((b) => b.plate === p.id);
      const head = `<label class="plate-row"><input type="checkbox" data-plate="${p.id}" ${done.has(p.id) ? "checked" : ""}> <span class="plate-id">${p.id}</span> ${esc(p.t)}</label>`;
      if (!d) return `<li>${head}</li>`;
      return `<li><details>${`<summary>${head}</summary>`}
        <p>${esc(d.d)}</p>
        ${bs.length ? `<p class="muted" style="margin:0">Bones: ${esc(bs.map((b) => b.name).join(", "))}</p>` : ""}
        ${ms.length ? `<div class="chips">${ms.map(muscleChip).join("")}</div>` : ""}
        ${(d.clin || []).map((c) => `<div class="note-box"><b>${esc(c.t)}.</b> ${esc(c.d)}</div>`).join("")}
      </details></li>`;
    };
    const progress = (ids) => { const n = ids.filter((id) => done.has(id)).length; return `<span class="muted">${n} of ${ids.length}</span>`; };
    $("#anat-body").innerHTML = `
      <p class="muted lens-lede">The coloring assignments from Handbook 4.52, class by class. Tick a plate when you have colored it; your ticks stay in this browser. Chapter 2 and 3 plates open to a summary of what they teach.</p>
      <div class="plate-cols">${Atlas.ASSIGNMENTS.map((c) => `
        <section class="panel"><div class="card-top"><h3>${esc(c.c)}</h3>${progress(c.plates.map((p) => p.id))}</div>
          <ul class="plate-list">${c.plates.map(item).join("")}</ul></section>`).join("")}
        <section class="panel"><div class="card-top"><h3>Other chapter 2 and 3 plates</h3>${progress(extra.map((p) => p.id))}</div>
          <ul class="plate-list">${extra.map((p) => item({ id: p.id, t: p.t })).join("")}</ul></section>
      </div>`;
    /* Re-rendering replaces .plate-cols, so this listener goes with it. */
    $(".plate-cols").addEventListener("change", (e) => {
      const c = e.target.closest("[data-plate]"); if (!c) return;
      if (c.checked) done.add(c.dataset.plate); else done.delete(c.dataset.plate);
      Atlas.store.set("plates", [...done]);
      const open = [...document.querySelectorAll(".plate-list details[open] [data-plate]")].map((x) => x.dataset.plate);
      plates();
      open.forEach((id) => { const d = document.querySelector(`[data-plate="${id}"]`); if (d) d.closest("details").open = true; });
    });
  }

  /* ---------- Quiz ---------- */
  const Q = { mode: "name", right: 0, total: 0, q: null };
  function quiz() {
    $("#anat-body").innerHTML = `
      <div class="panel anat-quiz">
        <div class="card-top">
          <div class="seg" id="aq-mode" role="group" aria-label="Quiz type">
            <button data-q="name" aria-pressed="${Q.mode === "name"}">Name the muscle</button><button data-q="action" aria-pressed="${Q.mode === "action"}">Pick the action</button>
          </div>
          <span class="muted" id="aq-score">${Q.right} of ${Q.total}</span>
        </div>
        <div id="aq"></div>
      </div>`;
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
    Q.q = { m, opts, done: false };
    $("#aq").innerHTML = Q.mode === "name"
      ? `<p class="aq-prompt">Which muscle is this?</p>
         <div class="oia"><span class="eyebrow">Origin</span><p>${mask(m.o, m)}</p></div>
         <div class="oia"><span class="eyebrow">Insertion</span><p>${mask(m.i, m)}</p></div>
         <div class="oia"><span class="eyebrow">Action</span><p>${mask(m.a, m)}</p></div>
         <div class="aq-opts">${opts.map((o, k) => `<button class="btn ghost" data-opt="${k}">${esc(o.n)}</button>`).join("")}</div>`
      : `<p class="aq-prompt">What does <b>${esc(m.n)}</b> do?</p>
         <p class="muted" style="margin:0">Origin: ${esc(m.o)}. Insertion: ${esc(m.i)}.</p>
         <div class="aq-opts">${opts.map((o, k) => `<button class="btn ghost" data-opt="${k}">${esc(o.a)}</button>`).join("")}</div>`;
  }
  function answer(k) {
    const { m, opts } = Q.q, ok = opts[k] === m;
    Q.q.done = true; Q.total++; if (ok) Q.right++;
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
