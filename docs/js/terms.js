/*
 * Body Terms view: the Western anatomical vocabulary from the handbook worksheets,
 * tied back to the points and kata steps that use it.
 * Sections: the two anatomical positions, directions and planes on the body
 * figures, animated movements, and a searchable glossary.
 */
window.Atlas = window.Atlas || {};
Atlas.views = Atlas.views || {};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => Atlas.esc(s);
  const el = (tag, attrs, parent) => Atlas.svgEl(tag, attrs, parent);
  const GEN = `<span class="tag-outside">general knowledge</span>`;
  const TCM = `<span class="tag-outside">general TCM</span>`;
  const CX = 150;

  /* Points whose location text matches a term, plus any listed by hand. */
  function pointHits(re, extra = []) {
    const out = new Set(extra);
    if (re) for (const id in Atlas.POINTS) {
      const p = Atlas.POINTS[id];
      if (re.test(`${p.loc || ""} ${p.find || ""}`)) out.add(id);
    }
    return [...out].filter((id) => Atlas.POINTS[id]);
  }
  function kataHits(re) {
    if (!re) return [];
    return Atlas.KATA.filter((s, i) => re.test(`${s.t} ${s.note || ""}`) && Atlas.KATA.findIndex((x) => x.n === s.n) === i);
  }
  const kataChip = (s) => `<button class="chip" data-kata="${Atlas.KATA.indexOf(s)}">Step ${esc(s.n)} · ${esc(s.t)}</button>`;
  const ptList = (ids) => ids.map((id) => `${Atlas.ptLink(id)} <span class="muted">${esc(Atlas.POINTS[id].en)}</span>`).join(" · ");

  Atlas.views.terms = function () {
    const T = Atlas.TERMS;
    const root = $("#view-terms");
    root.innerHTML = `
      <div class="terms-head">
        <p class="view-intro">The Western words for directions, planes and movements. Handbook 4.5-4.7 lists these terms for you to define; this page is a study key for that worksheet. The definitions are ${GEN}. Each term also shows the everyday word this atlas uses in its point locations, and the points and kata steps it describes.</p>
        <button class="btn ghost" id="terms-quiz" type="button" aria-pressed="false">Hide definitions</button>
      </div>

      <section class="lens-section">
        <h2>Two starting positions</h2>
        <p class="muted lens-lede">Direction words always assume a standard pose. The two traditions use different ones, and the difference explains which way the channels flow.</p>
        <div class="pose-grid">${T.positions.map((p, i) => `
          <div class="panel pose">
            ${poseSVG(i === 1)}
            <div><h3>${esc(p.t)}</h3><p class="def">${esc(p.d)}</p><div class="src">${esc(p.ref)}</div>${p.gen ? GEN : ""}</div>
          </div>`).join("")}</div>
      </section>

      <section class="lens-section">
        <h2>Directions and planes</h2>
        <p class="muted lens-lede">Pick a pair of terms to see it on the body. The points that use the term in their location light up.</p>
        <div class="chips" id="dir-pick" role="group" aria-label="Directions and planes">
          ${T.directions.map((d) => `<button class="chip" data-d="${d.id}">${esc(d.a)} · ${esc(d.b)}</button>`).join("")}
          ${T.planes.map((p) => `<button class="chip chip-plane" data-d="${p.id}">${esc(p.t)}</button>`).join("")}
        </div>
        <div class="dir-map">
          <div class="figures" id="dir-figs"><div></div><div></div></div>
          <div class="panel" id="dir-card"></div>
        </div>
      </section>

      <section class="lens-section">
        <h2>Movements</h2>
        <p class="muted lens-lede">Hover over a diagram to play both movements in a loop, or press a term to hold that position. Muscles come from the handbook's muscle chart (Handbook 4.46-4.48) unless marked ${GEN}.</p>
        <div class="move-grid">${T.moves.map(moveCard).join("")}</div>
      </section>

      <section class="lens-section">
        <h2>Glossary</h2>
        <p class="muted lens-lede">Landmarks, bony features and the place words that point locations depend on. Open a count to see the points that use the term.</p>
        <div class="gloss-tools">
          <input class="search" id="gloss-q" type="search" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Search terms, like crease or ankle" aria-label="Search the glossary">
          <div class="chips" id="gloss-cats">
            <button class="chip" data-cat="" aria-pressed="true">All</button>
            ${Object.entries(T.cats).map(([k, v]) => `<button class="chip" data-cat="${k}" aria-pressed="false">${esc(v)}</button>`).join("")}
          </div>
        </div>
        <div class="gloss-grid" id="gloss"></div>
      </section>`;

    initQuiz(root);
    initDirections(T);
    initMoves(root, T);
    initGlossary(T);
  };

  /* Definitions can be hidden so the page works as a self-test; click one to reveal it. */
  function initQuiz(root) {
    const btn = $("#terms-quiz");
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Show definitions" : "Hide definitions";
      root.classList.toggle("quiz", on);
      root.querySelectorAll(".def.shown").forEach((d) => d.classList.remove("shown"));
    });
    root.addEventListener("click", (e) => {
      const d = e.target.closest(".def");
      if (d && root.classList.contains("quiz")) d.classList.toggle("shown");
    });
  }

  /* ---------- Positions ---------- */
  function poseSVG(raised) {
    const arm = raised
      ? `<path d="M48,44 L30,6 M72,44 L90,6" class="pose-limb"/>`
      : `<path d="M48,44 L38,96 M72,44 L82,96" class="pose-limb"/>`;
    const flow = raised
      ? `<path d="M112,112 L112,14" class="pose-yin"/><path d="M106,22 L112,12 L118,22" class="pose-yin"/>
         <path d="M132,14 L132,112" class="pose-yang"/><path d="M126,104 L132,114 L138,104" class="pose-yang"/>
         <text x="112" y="124" class="pose-t" text-anchor="middle">yin</text><text x="132" y="124" class="pose-t" text-anchor="middle">yang</text>`
      : `<text x="122" y="64" class="pose-t" text-anchor="middle">palms</text><text x="122" y="76" class="pose-t" text-anchor="middle">forward</text>`;
    return `<svg viewBox="0 0 150 130" class="pose-svg" role="img" aria-label="${raised ? "Figure with hands raised above the head; yin flows up, yang flows down" : "Figure standing with arms at the sides, palms forward"}">
      <circle cx="60" cy="22" r="10" class="pose-body"/><path d="M60,32 L60,82 M60,82 L48,124 M60,82 L72,124 M48,44 L72,44" class="pose-limb"/>${arm}${flow}</svg>`;
  }

  /* ---------- Directions and planes ---------- */
  function initDirections(T) {
    const hosts = $("#dir-figs").children;
    const figs = [
      new Atlas.Figure(hosts[0], "front", { zoom: false, onPoint: (id) => Atlas.go("atlas", id) }),
      new Atlas.Figure(hosts[1], "back", { zoom: false, onPoint: (id) => Atlas.go("atlas", id) }),
    ];
    figs.forEach((f) => f.svg.classList.add("hide-off"));
    const byId = Object.fromEntries([...T.directions, ...T.planes].map((d) => [d.id, d]));

    function pick(id) {
      const d = byId[id];
      $("#dir-pick").querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.d === id)));
      const pts = d.cats
        ? Object.keys(Atlas.POINTS).filter((k) => d.cats.some((c) => Atlas.POINTS[k].cats.includes(c)))
        : pointHits(d.re);
      const chs = d.ch || [];
      figs.forEach((f) => {
        f.clearOverlay();
        f.showChannels(new Set(chs));
        /* Highlighted points show their labels, which crowd the figure when a term matches many. */
        f.highlight(chs, pts.length <= 14 ? pts : []);
        f.filterPoints((p) => pts.includes(p.id));
        drawOverlay(f, id);
      });
      $("#dir-card").innerHTML = d.t ? planeCard(d) : dirCard(d, pts);
    }

    $("#dir-pick").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) pick(b.dataset.d); });
    pick("ml");
  }

  function dirCard(d, pts) {
    const kata = kataHits(d.re);
    return `
      <span class="eyebrow">Terms of relationship</span>${d.ref ? ` <span class="src">${esc(d.ref)}</span>` : ""}
      <div class="dir-pair">
        <div><h3>${esc(d.a)}${d.aAlt ? ` <span class="muted alt">(${esc(d.aAlt)})</span>` : ""}</h3><p class="def">${esc(d.da)}</p></div>
        <div><h3>${esc(d.b)}${d.bAlt ? ` <span class="muted alt">(${esc(d.bAlt)})</span>` : ""}</h3><p class="def">${esc(d.db)}</p></div>
      </div>
      <p class="plain"><span class="eyebrow">Plain words in this atlas</span> ${esc(d.plain)}</p>
      <p style="margin:0">${esc(d.ex)}</p>
      ${d.tcm ? `<p class="muted" style="margin:0">${esc(d.tcm)} ${TCM}</p>` : ""}
      ${d.id === "sd" ? layersSVG() : ""}
      <div class="d-section"><h4>${pts.length} point${pts.length === 1 ? "" : "s"} ${d.cats ? "in these groups" : "use these words"}</h4>${
        !pts.length ? `<p class="muted" style="margin:0">No point location in this atlas uses these words.</p>`
        : pts.length <= 12 ? `<div class="pt-wrap">${ptList(pts)}</div>`
        : `<details><summary>Show all ${pts.length}</summary><div class="pt-wrap">${ptList(pts)}</div></details>`}</div>
      ${kata.length ? `<div class="d-section"><h4>Kata steps that use them</h4><div class="chips">${kata.map(kataChip).join("")}</div></div>` : ""}`;
  }

  function planeCard(p) {
    return `
      <span class="eyebrow">Body plane</span> <span class="src">Handbook 4.7 (Plate 1-2)</span>
      <h3 class="lens-muscle">${esc(p.t)}</h3>
      <p class="def" style="margin:0">${esc(p.d)}</p>
      <p style="margin:0">${esc(p.ex)}</p>`;
  }

  function layersSVG() {
    const rows = [["Skin", "var(--skin)"], ["Fascia", "var(--surface-2)"], ["Muscle", "color-mix(in srgb, var(--fire) 22%, var(--surface))"], ["Bone", "var(--line)"]];
    return `<svg viewBox="0 0 320 120" class="layers-svg" role="img" aria-label="Layers from superficial skin down to deep bone">
      ${rows.map(([t, c], i) => `<rect x="0" y="${i * 28}" width="250" height="26" rx="4" fill="${c}"/><text x="12" y="${i * 28 + 17}" class="pose-t">${t}</text>`).join("")}
      <path d="M285,8 L285,104" class="ov-line"/><path d="M279,96 L285,108 L291,96" class="ov-head"/>
      <text x="285" y="4" class="pose-t" text-anchor="middle" dy="2">superficial</text><text x="285" y="119" class="pose-t" text-anchor="middle">deep</text></svg>`;
  }

  /* Arrow from (x1,y1) to (x2,y2), with a second head at the start when `both`. */
  function arrow(g, x1, y1, x2, y2, both) {
    el("path", { d: `M${x1},${y1} L${x2},${y2}`, class: "ov-line" }, g);
    const head = (fx, fy, tx, ty) => {
      const a = Math.atan2(ty - fy, tx - fx), s = 9;
      const p = (da) => `${tx - s * Math.cos(a + da)},${ty - s * Math.sin(a + da)}`;
      el("path", { d: `M${p(0.45)} L${tx},${ty} L${p(-0.45)} Z`, class: "ov-head" }, g);
    };
    head(x1, y1, x2, y2);
    if (both) head(x2, y2, x1, y1);
  }
  function label(g, x, y, text, anchor = "middle") {
    el("text", { x, y, class: "ov-label", "text-anchor": anchor }, g).textContent = text;
  }

  function drawOverlay(f, id) {
    const g = f.overlay, front = f.view === "front";
    const midline = () => el("path", { d: `M${CX},4 L${CX},636`, class: "ov-line ov-dash" }, g);
    switch (id) {
      case "si":
        arrow(g, 266, 44, 266, 596, true);
        label(g, 266, 32, "Superior"); label(g, 266, 618, "Inferior");
        break;
      case "ap":
        label(g, CX, 636, front ? "Anterior surface" : "Posterior surface");
        break;
      case "ml":
        midline();
        arrow(g, 144, 236, 24, 236); label(g, 24, 226, "Lateral", "start");
        arrow(g, 280, 236, 156, 236); label(g, 280, 226, "Medial", "end");
        break;
      case "pd":
        arrow(g, 93, 162, 64, 402, true); label(g, 62, 152, "Proximal", "end"); label(g, 64, 432, "Distal");
        arrow(g, 184, 300, 172, 604, true); label(g, 196, 294, "Proximal", "start"); label(g, 186, 634, "Distal", "start");
        break;
      case "ru":
        if (!front) { label(g, CX, 636, "Shown on the front figure"); break; }
        arrow(g, 18, 300, 61, 336); label(g, 16, 292, "Radial (thumb)", "start");
        arrow(g, 132, 380, 88, 346); label(g, 134, 392, "Ulnar", "start");
        break;
      case "pp":
        el("circle", { cx: 66, cy: 398, r: 14, class: "ov-ring" }, g);
        el("circle", { cx: 128, cy: 608, r: 14, class: "ov-ring" }, g);
        label(g, 66, 440, front ? "Palmar" : "Dorsal");
        label(g, 166, 600, front ? "Dorsal" : "Plantar", "start");
        break;
      case "mid":
        midline(); label(g, CX + 6, 300, "Midline", "start");
        break;
      case "sag":
        el("rect", { x: 0, y: 0, width: CX, height: 640, class: "ov-tint" }, g);
        midline(); label(g, CX, 636, "Divides left from right");
        break;
      case "fro":
        el("rect", { x: 0, y: 0, width: 300, height: 640, class: "ov-tint" }, g);
        label(g, CX, 636, front ? "Front of the frontal plane" : "Back of the frontal plane");
        break;
      case "tra":
        el("rect", { x: 0, y: 0, width: 300, height: 250, class: "ov-tint" }, g);
        el("path", { d: "M0,250 L300,250", class: "ov-line" }, g);
        label(g, 296, 242, "Transverse", "end");
        break;
    }
  }

  /* ---------- Movements ---------- */
  /*
   * Each demo is a small diagram with a fixed part and one or more moving parts.
   * `st` maps a state to the CSS transform of each moving part; `n` is the
   * resting pose. Transforms use `transform-origin`, so they rotate about the joint.
   */
  const DEMOS = {
    elbow: {
      fixed: `<circle cx="90" cy="14" r="6" class="d-joint"/><path d="M90,14 L90,64" class="d-seg"/><text x="186" y="124" class="pose-t" text-anchor="end">front →</text>`,
      parts: [{ o: [90, 64], svg: `<path d="M90,64 L90,110" class="d-seg d-mv"/><circle cx="90" cy="114" r="5" class="d-end"/>` }],
      st: { n: ["rotate(-50deg)"], a: ["rotate(-140deg)"], b: ["rotate(0deg)"] },
    },
    shoulder: {
      fixed: `<circle cx="130" cy="12" r="9" class="d-joint"/><rect x="110" y="22" width="40" height="80" rx="8" class="d-body"/><path d="M130,2 L130,126" class="d-mid"/>`,
      parts: [{ o: [106, 28], svg: `<path d="M106,28 L106,90" class="d-seg d-mv"/><circle cx="106" cy="94" r="5" class="d-end"/>` }],
      st: { n: ["rotate(10deg)"], a: ["rotate(85deg)"], b: ["rotate(-12deg)"] },
    },
    rotate: {
      fixed: `<ellipse cx="120" cy="40" rx="60" ry="20" class="d-body"/><circle cx="120" cy="40" r="13" class="d-joint"/><path d="M120,2 L120,126" class="d-mid"/><circle cx="60" cy="40" r="9" class="d-joint"/><text x="186" y="124" class="pose-t" text-anchor="end">front ↓</text>`,
      parts: [{ o: [60, 40], svg: `<path d="M60,40 L60,100" class="d-seg d-mv"/><circle cx="60" cy="104" r="5" class="d-end"/>` }],
      st: { n: ["rotate(0deg)"], a: ["rotate(55deg)"], b: ["rotate(-55deg)"] },
    },
    ankle: {
      fixed: `<path d="M70,8 L70,80" class="d-seg"/><path d="M20,100 L190,100" class="d-mid"/>`,
      parts: [{ o: [70, 80], svg: `<path d="M60,84 L70,80 L128,84" class="d-seg d-mv"/><circle cx="130" cy="84" r="4" class="d-end"/>` }],
      st: { n: ["rotate(0deg)"], a: ["rotate(-22deg)"], b: ["rotate(38deg)"] },
    },
    forearm: {
      fixed: `<rect x="86" y="4" width="28" height="64" rx="10" class="d-body"/>`,
      parts: [{ o: [100, 70], svg: `<rect x="84" y="68" width="32" height="38" rx="8" class="d-palm"/><rect x="68" y="72" width="14" height="26" rx="6" class="d-palm"/><path d="M90,106 L90,122 M97,106 L97,124 M104,106 L104,124 M111,106 L111,120" class="d-seg"/>` }],
      st: { n: ["scaleX(1)"], a: ["scaleX(1)"], b: ["scaleX(-1)"] },
    },
    foot: {
      fixed: `<rect x="70" y="4" width="20" height="56" rx="8" class="d-body"/><path d="M170,2 L170,126" class="d-mid"/><text x="166" y="124" class="pose-t" text-anchor="end">midline</text>`,
      parts: [{ o: [80, 62], svg: `<rect x="48" y="60" width="64" height="16" rx="6" class="d-body d-mv"/><path d="M50,76 L110,76" class="d-sole"/>` }],
      st: { n: ["rotate(0deg)"], a: ["rotate(-22deg)"], b: ["rotate(14deg)"] },
    },
    shrug: {
      fixed: `<circle cx="100" cy="18" r="11" class="d-joint"/><rect x="74" y="46" width="52" height="76" rx="8" class="d-body"/>`,
      parts: [{ o: [100, 46], svg: `<path d="M52,46 L148,46 M52,46 L46,112 M148,46 L154,112" class="d-seg d-mv"/>` }],
      st: { n: ["translateY(0px)"], a: ["translateY(-12px)"], b: ["translateY(6px)"] },
    },
    scapula: {
      fixed: `<ellipse cx="100" cy="62" rx="64" ry="28" class="d-body"/><circle cx="100" cy="62" r="14" class="d-joint"/><text x="186" y="124" class="pose-t" text-anchor="end">front ↓</text>`,
      parts: [
        { o: [70, 46], svg: `<ellipse cx="70" cy="46" rx="14" ry="6" class="d-blade"/>` },
        { o: [130, 46], svg: `<ellipse cx="130" cy="46" rx="14" ry="6" class="d-blade"/>` },
      ],
      st: { n: ["translate(0px,0px)", "translate(0px,0px)"], a: ["translate(-10px,10px)", "translate(10px,10px)"], b: ["translate(8px,-4px)", "translate(-8px,-4px)"] },
    },
    trunk: {
      fixed: `<rect x="72" y="86" width="56" height="20" rx="6" class="d-body"/><path d="M84,106 L80,128 M116,106 L120,128" class="d-seg"/><text x="10" y="16" class="pose-t">← client's right</text>`,
      parts: [{ o: [100, 88], svg: `<rect x="80" y="32" width="40" height="56" rx="8" class="d-body d-mv"/><circle cx="100" cy="18" r="10" class="d-joint"/>` }],
      st: { n: ["rotate(0deg)"], a: ["rotate(-18deg)"], b: ["rotate(18deg)"] },
    },
    circle: {
      fixed: `<circle cx="130" cy="12" r="9" class="d-joint"/><rect x="110" y="22" width="40" height="80" rx="8" class="d-body"/><ellipse cx="106" cy="92" rx="30" ry="10" class="d-mid"/>`,
      parts: [{ o: [106, 28], svg: `<path d="M106,28 L106,90" class="d-seg d-mv"/><circle cx="106" cy="94" r="5" class="d-end"/>` }],
      st: { n: ["rotate(0deg)"] },
    },
  };

  function demoSVG(m) {
    const D = DEMOS[m.demo];
    /* --tn/--ta/--tb feed the hover loop in style.css: rest, first term, rest, second term. */
    const parts = D.parts.map((p, i) => {
      const n = D.st.n[i], a = (D.st.a || D.st.n)[i], b = (D.st.b || D.st.n)[i];
      return `<g class="d-part" data-i="${i}" style="transform-origin:${p.o[0]}px ${p.o[1]}px;transform:${n};--tn:${n};--ta:${a};--tb:${b}">${p.svg}</g>`;
    }).join("");
    return `<svg viewBox="0 0 200 130" class="demo" data-demo="${m.demo}" data-st="n" tabindex="0" role="img" aria-label="${esc(m.a.t)}${m.b ? " and " + esc(m.b.t) : ""} diagram. Hover or focus to play.">${D.fixed}${parts}</svg>`;
  }

  function moveCard(m) {
    const sides = [m.a, m.b].filter(Boolean);
    return `
      <article class="panel move" data-m="${m.id}">
        ${demoSVG(m)}
        <p class="demo-view muted">${esc(m.view)}</p>
        <div class="chips">${sides.map((s) => `<button class="chip" data-st="${s.st}" aria-pressed="false">${esc(s.t)}</button>`).join("")}</div>
        ${sides.map((s) => `<div><h3>${esc(s.t)}</h3><p class="def">${esc(s.d)}</p></div>`).join("")}
        <p class="move-mus"><span class="eyebrow">Muscles</span>${m.musGen ? GEN : ""} ${esc(m.mus)}</p>
        ${m.kata.length ? `<div class="chips">${m.kata.map((n) => Atlas.KATA.find((s) => s.n === n)).filter(Boolean).map(kataChip).join("")}</div>` : ""}
        <div class="src">${esc(m.ref)}</div>
      </article>`;
  }

  function initMoves(root, T) {
    const byId = Object.fromEntries(T.moves.map((m) => [m.id, m]));
    root.querySelector(".move-grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-st]"); if (!b || b.tagName !== "BUTTON") return;
      const card = b.closest(".move"), m = byId[card.dataset.m], D = DEMOS[m.demo];
      const on = b.getAttribute("aria-pressed") !== "true";
      card.querySelectorAll("button[data-st]").forEach((x) => x.setAttribute("aria-pressed", String(x === b && on)));
      const st = on ? b.dataset.st : "n";
      const svg = card.querySelector(".demo");
      svg.dataset.st = st;
      svg.querySelectorAll(".d-part").forEach((p, i) => {
        p.classList.toggle("spin", st === "spin");
        p.style.transform = (D.st[st] || D.st.n)[i];
      });
    });
  }

  /* ---------- Glossary ---------- */
  function initGlossary(T) {
    const entries = T.glossary.map((g) => ({ ...g, hits: pointHits(g.re, g.pts) }));
    let cat = "", q = "";

    function render() {
      const ql = q.trim().toLowerCase();
      const list = entries.filter((g) => (!cat || g.cat === cat)
        && (!ql || `${g.t} ${g.alt || ""} ${g.d}`.toLowerCase().includes(ql)));
      $("#gloss").innerHTML = list.length ? list.map((g) => `
        <div class="gloss">
          <div class="gloss-top"><h3>${esc(g.t)}</h3><span class="chip">${esc(T.cats[g.cat])}</span></div>
          ${g.alt ? `<p class="plain"><span class="eyebrow">Also called</span> ${esc(g.alt)}</p>` : ""}
          <p class="def">${esc(g.d)}${g.tcm ? ` ${TCM}` : ""}</p>
          ${g.hits.length ? `<details><summary>${g.hits.length} point${g.hits.length === 1 ? "" : "s"} in this atlas</summary><div class="pt-wrap">${ptList(g.hits)}</div></details>` : ""}
          ${g.src ? `<div class="src">${esc(g.src)}</div>` : ""}
        </div>`).join("")
        : `<p class="muted">No terms match "${esc(q)}". Try a plainer word, like "ankle" or "elbow".</p>`;
    }

    $("#gloss-q").addEventListener("input", (e) => { q = e.target.value; render(); });
    $("#gloss-cats").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      cat = b.dataset.cat;
      $("#gloss-cats").querySelectorAll("[data-cat]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    });
    render();
  }
})();
