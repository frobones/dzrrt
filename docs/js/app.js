/*
 * App shell: routing between views, the Atlas view (filters + two figures), and
 * the point detail panel with its connection web. The other views live in views.js.
 */
window.Atlas = window.Atlas || {};

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  Atlas.$ = $;
  Atlas.esc = esc;

  const store = {
    get(k, d) { try { const v = localStorage.getItem("atlas:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("atlas:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable: setting is not remembered */ } },
  };
  Atlas.store = store;

  /* ---------- Exam scope ---------- */
  /*
   * One site-wide choice: Exam narrows each page to what the written exams cover, Everything
   * shows it all. Changing it anywhere updates every switch and fires "scopechange" on document.
   */
  Atlas.examOnly = () => store.get("exam", true);
  Atlas.setExam = (on) => {
    if (on === Atlas.examOnly()) return;
    store.set("exam", on);
    document.querySelectorAll("[data-scope]").forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.scope === "exam") === on)));
    document.dispatchEvent(new CustomEvent("scopechange", { detail: on }));
  };
  /** The Exam | Everything switch. tip says what Exam keeps on this page. */
  Atlas.scopeSwitch = (tip) => `<div class="seg scope-seg" role="group" aria-label="Show exam material or everything">
    <button data-scope="exam" title="${esc(tip)}" aria-pressed="${Atlas.examOnly()}">Exam</button><button data-scope="all" aria-pressed="${!Atlas.examOnly()}">Everything</button></div>`;
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-scope]"); if (b) Atlas.setExam(b.dataset.scope === "exam"); });

  const code = (id) => (Atlas.POINTS[id] && Atlas.POINTS[id].code) || id;
  Atlas.code = code;
  const ptLink = (id) => (Atlas.POINTS[id] ? `<button class="pt" data-pt="${id}">${esc(code(id))}</button>` : `<span class="mono">${esc(id)}</span>`);
  Atlas.ptLink = ptLink;
  const chName = (c) => (Atlas.CHANNELS[c] ? Atlas.CHANNELS[c].name : "Extra");

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    if (t === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    $("#theme").textContent = { system: "Theme: auto", light: "Theme: light", dark: "Theme: dark" }[t];
  }
  function initTheme() {
    let t = store.get("theme", "system");
    applyTheme(t);
    $("#theme").addEventListener("click", () => {
      t = { system: "light", light: "dark", dark: "system" }[t];
      store.set("theme", t);
      applyTheme(t);
    });
  }

  /* ---------- Routing ---------- */
  const VIEWS = ["atlas", "kata", "clock", "phases", "depth", "study", "lenses", "terms", "anatomy"];
  const inited = {};
  function show(view, arg) {
    if (!VIEWS.includes(view)) view = "atlas";
    VIEWS.forEach((v) => { $("#view-" + v).classList.toggle("active", v === view); });
    document.querySelectorAll("nav.tabs a").forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === "#" + view ? "page" : "false"));
    /* On a phone the tabs are one sideways-scrolling row; bring the current one into view. */
    const nav = $("nav.tabs"), cur = $('nav.tabs a[aria-current="page"]');
    if (cur && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = cur.offsetLeft - nav.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2;
    if (!inited[view]) { inited[view] = true; (view === "atlas" ? initAtlas : Atlas.views[view])(); }
    if (view === "atlas" && arg && arg.ch) showChannel(arg.ch);
    else if (view === "atlas" && arg && Atlas.POINTS[arg]) {
      /* A classical point only shows under Everything; a search or channel filter hiding it is cleared. */
      if (!Atlas.isCourse(Atlas.POINTS[arg])) Atlas.setExam(false);
      if (!matches(Atlas.POINTS[arg])) {
        A.q = "";
        $("#q").value = "";
        A.chans = new Set(Object.keys(Atlas.CHANNELS));
        A.cats = new Set();
        refresh();
      }
      selectPoint(arg, false, true);
    }
    if (view === "kata" && arg !== undefined && Atlas.kataGo) Atlas.kataGo(arg);
    if (view === "anatomy" && arg && Atlas.anatomyGo) Atlas.anatomyGo(arg);
  }
  /*
   * Deep links: #p-<point>, #ch-<channel>, #kata-<step>, #m-<muscle>, #bone-<name>, #lm-<landmark>,
   * #joint-<name>. The Atlas takes a point id or {ch}; Anatomy a muscle id, {bone}, {lm} or {joint}.
   */
  function hashFor(view, arg) {
    if (arg === undefined || arg === null || arg === "") return view;
    if (view === "atlas") return arg.ch ? "ch-" + arg.ch : "p-" + arg;
    if (view === "kata") return "kata-" + arg;
    if (view === "anatomy") {
      if (arg.bone) return "bone-" + encodeURIComponent(arg.bone);
      if (arg.lm) return "lm-" + arg.lm;
      if (arg.joint) return "joint-" + encodeURIComponent(arg.joint);
      return "m-" + arg;
    }
    return view;
  }
  /* On a phone the header and controls fill the first screen, so opening one thing scrolls to its figure. */
  const FIGURE_OF = { atlas: "#view-atlas .stage", kata: "#view-kata .kata-figure", anatomy: "#anat-body .anat-figcol" };
  Atlas.go = function (view, arg) {
    const hash = hashFor(view, arg);
    if (location.hash !== "#" + hash) history.replaceState(null, "", "#" + hash);
    show(view, arg);
    const narrow = window.matchMedia("(max-width: 800px)").matches;
    const fig = narrow && arg !== undefined && arg !== null && FIGURE_OF[view] && $(FIGURE_OF[view]);
    /* Instant: a smooth scroll gets cut short while the tab builds its figure. */
    if (fig) fig.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  function fromHash() {
    const h = location.hash.slice(1);
    if (h.startsWith("p-")) return show("atlas", h.slice(2));
    if (h.startsWith("kata-")) return show("kata", Number(h.slice(5)));
    if (h.startsWith("m-")) return show("anatomy", h.slice(2));
    if (h.startsWith("ch-")) return show("atlas", { ch: h.slice(3) });
    if (h.startsWith("bone-")) return show("anatomy", { bone: decodeURIComponent(h.slice(5)) });
    if (h.startsWith("lm-")) return show("anatomy", { lm: h.slice(3) });
    if (h.startsWith("joint-")) return show("anatomy", { joint: decodeURIComponent(h.slice(6)) });
    show(h || "atlas");
  }

  /* Any [data-pt] button anywhere opens that point in the Atlas. */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pt]");
    if (b) { e.preventDefault(); Atlas.go("atlas", b.dataset.pt); return; }
    const k = e.target.closest("[data-kata]");
    if (k) { e.preventDefault(); Atlas.go("kata", Number(k.dataset.kata)); }
  });

  /* ---------- Atlas view ---------- */
  const A = { figs: [], figs2d: [], fig3d: null, dim: Atlas.dim("atlas"), chans: new Set(Object.keys(Atlas.CHANNELS)), cats: new Set(), course: Atlas.examOnly(), q: "", layer: "primary", sel: null };

  function initAtlas() {
    const root = $("#view-atlas");
    const chBtns = Object.keys(Atlas.CHANNELS).map((c) => {
      const ch = Atlas.CHANNELS[c];
      return `<button class="ch-btn" data-ch="${c}" aria-pressed="true" title="${esc(ch.name)}"><span class="dot" style="width:9px;height:9px;border-radius:50%;background:${Atlas.elColor(c)}"></span><span class="code">${c}</span><span>${esc(ch.name.split(" ")[0])}</span></button>`;
    }).join("");
    const catBtns = Object.keys(Atlas.CATEGORIES).map((k) => `<button class="chip" data-cat="${k}" aria-pressed="false" title="${esc(Atlas.CATEGORIES[k].tip)}">${esc(Atlas.CATEGORIES[k].label)}</button>`).join("");
    root.innerHTML = `
      <p class="view-intro">Every point the course names, plus the classical points that tie the channels together. Click a point to see where it is, what it does, what the course says about it, and everything it connects to. Filled dots are course points; a ring marks a Long Life point. Moving dashes show the direction Qi flows.</p>
      <div class="atlas">
        <aside class="rail">
          <div class="panel"><label class="eyebrow" for="q">Search</label>
            <input id="q" class="search" type="search" placeholder="LI4, Hegu, headache, anger…" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
          <div class="panel">
            <h3>Layer</h3>
            <div class="seg" id="layer">
              <button data-layer="primary" aria-pressed="true">Primary</button><button data-layer="sinew" aria-pressed="false">Sinew</button><button data-layer="both" aria-pressed="false">Both</button>
            </div>
            <p class="muted" style="font-size:12.5px;margin:8px 0 0" id="layer-note"></p>
            <label class="toggle" style="margin-top:8px"><input type="checkbox" id="flow" checked> Animate flow</label>
            <label class="toggle"><input type="checkbox" id="labels"> Always show labels</label>
          </div>
          <div class="panel">
            <h3>Channels</h3>
            <div class="ch-list" id="chs">${chBtns}</div>
            <div class="chips" style="margin-top:8px"><button class="chip" id="ch-all">All</button><button class="chip" id="ch-none">None</button></div>
            <p class="muted" style="font-size:12px;margin:6px 0 0">Shift-click a channel to show only that one.</p>
          </div>
          <div class="panel">
            <h3>Point types</h3>
            ${Atlas.scopeSwitch("Exam: the points the course names. Everything adds the classical points that link the channels.")}
            <p class="muted" style="font-size:12.5px;margin:6px 0 8px">Exam shows the points the course names; Everything adds the classical points.</p>
            <div class="chips" id="cats">${catBtns}</div>
          </div>
        </aside>
        <section class="stage">
          <div class="stage-bar">
            <div class="region-bar" id="regions">
              ${[["full", "Whole body"], ["head", "Head"], ["upperBack", "Upper back"], ["abdomen", "Torso"], ["armL", "Arm"], ["handL", "Hand"], ["legL", "Leg"], ["footL", "Foot"]]
                .map(([k, l]) => `<button class="chip" data-region="${k}">${l}</button>`).join("")}
            </div>
            <span class="muted" id="count" style="font-size:13px"></span>
            <div class="seg" id="atlas-dim" role="group" aria-label="Figure type"><button data-dim="3d">3D</button><button data-dim="2d">2D</button></div>
          </div>
          <div class="figures" id="atlas-figs"><div id="fig-front"></div><div id="fig-back"></div></div>
          <div class="body3d" id="atlas-3d" hidden></div>
          <p class="muted" style="font-size:12.5px;margin:0" id="atlas-help"></p>
        </section>
        <aside class="detail panel" id="detail" aria-live="polite"></aside>
      </div>`;

    const onPoint = (id) => selectPoint(id, true);
    A.figs2d = [new Atlas.Figure($("#fig-front"), "front", { onPoint }), new Atlas.Figure($("#fig-back"), "back", { onPoint })];
    /* 3D shows one rotatable body in place of the two flat figures; the same filters drive both. */
    const setDim = (dim) => {
      A.dim = dim;
      Atlas.setDim("atlas", dim);
      $("#atlas-dim").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dim === dim)));
      $("#atlas-figs").hidden = dim === "3d";
      $("#atlas-3d").hidden = dim !== "3d";
      const moves = Atlas.coarse
        ? (dim === "3d" ? "Use two fingers to turn the body and pinch to zoom; one finger scrolls the page. " : "Use two fingers to pan and pinch to zoom; one finger scrolls the page. ")
        : dim === "3d" ? "Drag to turn the body, scroll or pinch to zoom, right-drag to move. " : "Scroll or pinch to zoom, drag to pan. ";
      $("#atlas-help").textContent = moves + (dim === "3d" ? "Points sit on the muscle surface. " : "") + "Positions are approximate study guides; always locate points by palpation.";
      if (dim === "3d" && !A.fig3d) {
        A.fig3d = new Atlas.Figure3D($("#atlas-3d"), { onPoint });
        A.fig3d.setFlow($("#flow").checked);
        A.fig3d.setLabels($("#labels").checked);
      }
      A.figs = dim === "3d" ? [A.fig3d] : A.figs2d;
      refresh();
      if (A.sel) selectPoint(A.sel, false);
    };
    $("#atlas-dim").addEventListener("click", (e) => { const b = e.target.closest("[data-dim]"); if (b && b.dataset.dim !== A.dim) setDim(b.dataset.dim); });

    $("#q").addEventListener("input", (e) => { A.q = e.target.value.trim().toLowerCase(); refresh(); });
    $("#layer").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      A.layer = b.dataset.layer;
      $("#layer").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      refresh();
    });
    /* Both figure types follow these, so switching between 2D and 3D keeps them. */
    const allFigs = () => [...A.figs2d, A.fig3d].filter(Boolean);
    $("#flow").addEventListener("change", (e) => allFigs().forEach((f) => f.setFlow(e.target.checked)));
    $("#labels").addEventListener("change", (e) => allFigs().forEach((f) => f.setLabels(e.target.checked)));
    $("#chs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-ch]"); if (!b) return;
      const c = b.dataset.ch;
      if (e.shiftKey) { A.chans = new Set([c]); }
      else if (A.chans.has(c)) A.chans.delete(c); else A.chans.add(c);
      refresh();
    });
    $("#ch-all").addEventListener("click", () => { A.chans = new Set(Object.keys(Atlas.CHANNELS)); refresh(); });
    $("#ch-none").addEventListener("click", () => { A.chans = new Set(); refresh(); });
    document.addEventListener("scopechange", (e) => { A.course = e.detail; refresh(); });
    $("#cats").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      const k = b.dataset.cat;
      if (A.cats.has(k)) A.cats.delete(k); else A.cats.add(k);
      refresh();
    });
    $("#regions").addEventListener("click", (e) => {
      const b = e.target.closest("[data-region]"); if (!b) return;
      A.figs.forEach((f) => f.zoomTo(Atlas.REGIONS[b.dataset.region]));
    });
    setDim(A.dim);
    bindSheet();
    if (!A.sel) renderDetail(null);
  }

  function matches(p) {
    if (p.ch && !A.chans.has(p.ch)) return false;
    if (!p.ch && A.chans.size === 0) return false;
    if (A.course && !Atlas.isCourse(p)) return false;
    if (A.cats.size && ![...A.cats].some((c) => p.cats.includes(c))) return false;
    if (A.q) {
      const hay = [p.id, p.code, p.py, p.en, p.alt, p.hz, p.ch && chName(p.ch), p.loc, ...(p.fx || []), ...(p.course || []).map((c) => c.t)]
        .filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const q = A.q.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "");
      if (!hay.replace(/\s+/g, "").includes(q) && !hay.includes(A.q)) return false;
    }
    return true;
  }

  function refresh() {
    document.querySelectorAll("#chs [data-ch]").forEach((b) => b.setAttribute("aria-pressed", A.chans.has(b.dataset.ch) ? "true" : "false"));
    document.querySelectorAll("#cats [data-cat]").forEach((b) => b.setAttribute("aria-pressed", A.cats.has(b.dataset.cat) ? "true" : "false"));
    const notes = {
      primary: "Primary channels: the organ pathways. Points live here. Dashes run in the direction of Qi flow.",
      sinew: "Sinew (myofascial) channels: the broad layer DZRRT massages directly. No points. Flow always runs from the fingers and toes toward the trunk.",
      both: "Both layers. Compare where the sinew bands run against the narrower primary lines.",
    };
    $("#layer-note").textContent = notes[A.layer];
    A.figs.forEach((f) => { f.setLayer(A.layer); f.showChannels(A.chans); f.filterPoints(matches); });
    const n = Object.values(Atlas.POINTS).filter(matches).length;
    $("#count").textContent = `${n} of ${Object.keys(Atlas.POINTS).length} points`;
  }

  /** zoom: frame the point on the flat figures too (the 3D body always turns to it). */
  function selectPoint(id, push, zoom = false) {
    if (!Atlas.POINTS[id]) return;
    if (!inited.atlas) { inited.atlas = true; initAtlas(); }
    A.sel = id;
    const p = Atlas.POINTS[id];
    A.figs.forEach((f) => { f.select(id); f.highlight(p.ch ? [p.ch] : [], [id]); });
    if (zoom && A.dim === "2d") A.figs2d.forEach((f) => f.zoomToPoint(id));
    if (push) history.replaceState(null, "", "#p-" + id);
    renderDetail(id);
    /* On a phone the details would sit two screens below the figures, so they slide up over them. */
    if ((push || zoom) && window.matchMedia("(max-width: 800px)").matches) $("#detail").classList.add("sheet-open");
  }

  /* The phone sheet closes with its X, Escape, or a downward swipe on its bar; the point stays selected. */
  function bindSheet() {
    const box = $("#detail");
    const close = () => { box.classList.remove("sheet-open"); box.style.transform = ""; };
    box.addEventListener("click", (e) => { if (e.target.closest(".sheet-close")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && box.classList.contains("sheet-open")) close(); });
    let y0 = null;
    box.addEventListener("touchstart", (e) => { if (e.target.closest(".sheet-bar")) y0 = e.touches[0].clientY; }, { passive: true });
    box.addEventListener("touchmove", (e) => {
      if (y0 === null) return;
      box.style.transform = `translateY(${Math.max(0, e.touches[0].clientY - y0)}px)`;
    }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (y0 === null) return;
      const dy = e.changedTouches[0].clientY - y0;
      y0 = null;
      if (dy > 70) close(); else box.style.transform = "";
    });
  }

  /** Show one channel alone, highlighted, on the whole body. */
  function showChannel(code) {
    if (!Atlas.CHANNELS[code]) return;
    if (!inited.atlas) { inited.atlas = true; initAtlas(); }
    A.chans = new Set([code]);
    refresh();
    A.figs.forEach((f) => { f.highlight([code], []); f.zoomTo(Atlas.REGIONS.full); });
  }
  Atlas.selectPoint = selectPoint;

  /* ---------- Detail panel ---------- */
  function kataSteps(id) { return Atlas.KATA.filter((s) => s.pts.includes(id)); }
  Atlas.kataSteps = kataSteps;

  function renderDetail(id) {
    const box = $("#detail");
    if (!id) {
      const ll = Object.values(Atlas.POINTS).filter((p) => p.cats.includes("longlife"));
      box.innerHTML = `<div class="d-section"><span class="eyebrow">Start here</span>
        <h2 style="font-size:24px">The Long Life points</h2>
        <p>The five points the kata marks as Long Life points. Click one to explore it, or pick any dot on the body.</p>
        <div class="chips">${ll.map((p) => `<button class="chip" data-pt="${p.id}"><span class="dot" style="color:${Atlas.pointColor(p)}"></span>${esc(code(p.id))} ${esc(p.en)}</button>`).join("")}</div></div>
        <div class="d-section"><h4>How to read the map</h4>
        <ul><li>Colors are the Five Phases: <span class="el-wood">Wood</span>, <span class="el-fire">Fire</span>, <span class="el-earth">Earth</span>, <span class="el-metal">Metal</span>, <span class="el-water">Water</span>, and <span class="el-none">extra points</span>.</li>
        <li>Filled dots are named in the course; hollow dots are classical points included to show how the channels connect.</li>
        <li>Text marked <span class="tag-outside">general TCM</span> comes from standard Chinese medicine, not the course material.</li></ul></div>`;
      return;
    }
    const p = Atlas.POINTS[id];
    const ch = p.ch ? Atlas.CHANNELS[p.ch] : null;
    const el = ch && ch.el ? Atlas.ELEMENTS[ch.el] : null;
    const depth = Atlas.ZONES[p.z].depth;
    const cats = p.cats.map((c) => `<span class="chip" title="${esc(Atlas.CATEGORIES[c].tip)}">${esc(Atlas.CATEGORIES[c].label)}</span>`).join("");
    const steps = kataSteps(id);
    const muscles = Atlas.musclesUnder ? Atlas.musclesUnder(id).sort((a, b) => !!b.exam - !!a.exam) : [];
    box.innerHTML = `
      <div class="sheet-bar"><span class="sheet-grip" aria-hidden="true"></span>
        <button class="sheet-close" type="button" aria-label="Close the point details">×</button></div>
      <div class="d-head">
        <div class="d-hz" style="color:${Atlas.pointColor(p)}">${esc(p.hz)}</div>
        <div class="d-code">${esc(code(id))}</div>
        <div class="d-names"><b>${esc(p.py)}</b> · ${esc(p.en)}${p.alt ? ` <span class="muted">(${esc(p.alt)})</span>` : ""}</div>
      </div>
      <div class="chips">${cats}</div>
      <div class="d-section">
        <h4>Channel</h4>
        <div>${ch ? `<button class="chip" id="solo" style="color:${Atlas.elColor(p.ch)}"><span class="dot"></span>${esc(ch.name)} ${esc(ch.hz)}</button>
          <span class="muted"> ${esc(ch.limb)} ${esc(ch.div)}${el ? ` · ${el.name} ${el.hz}` : ""}${ch.time ? ` · ${fmtTime(ch.time)}` : ""}</span>` : `<span class="muted">Extra point, not on one of the 14 channels.</span>`}</div>
      </div>
      <div class="d-section"><h4>Location</h4><p style="margin:0">${esc(p.loc)}</p><p class="muted" style="margin:0"><b>Finding it:</b> ${esc(p.find)}</p></div>
      <div class="d-section"><h4>Depth on the channel</h4>
        <div class="depth-meter" title="Shallow at the hands and feet, deep at the trunk">${[1, 2, 3, 4, 5].map((i) => `<span class="${depth >= i - 0.3 ? "on" : ""}"></span>`).join("")}</div>
        <span class="muted" style="font-size:12.5px">${esc(Atlas.ZONES[p.z].name)}: ${depth < 2 ? "in the shallows, where a ripple travels easily along the channel" : depth < 3.5 ? "where the channel starts to dive" : "in the depths, where it reaches toward the organs"} (Meridian Theory part 1).</span>
      </div>
      ${p.course && p.course.length ? `<div class="d-section"><h4>In the course</h4>${p.course.map((c) => `<div class="course-note">${esc(c.t)}<div class="src">${esc(c.ref)}</div></div>`).join("")}</div>` : ""}
      ${steps.length ? `<div class="d-section"><h4>Kata steps</h4><div class="chips">${steps.map((s) => `<button class="chip" data-kata="${Atlas.KATA.indexOf(s)}">Step ${esc(s.n)} · ${esc(s.t)}</button>`).join("")}</div></div>` : ""}
      ${muscles.length ? `<div class="d-section"><h4>Muscles under it <span class="tag-outside">approximate</span></h4><div class="chips">${muscles.map((m) => `<button class="chip" data-muscle="${m.id}">${esc(m.n)}</button>`).join("")}</div></div>` : ""}
      <div class="d-section"><h4>Traditional actions <span class="tag-outside">general TCM</span></h4><ul>${p.fx.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
      ${p.caut ? `<div class="caution"><b>Caution.</b> ${esc(p.caut)}</div>` : ""}
      ${p.combos && p.combos.length ? `<div class="d-section"><h4>Works with</h4>${p.combos.map((c) => `<div class="combo"><div>${ptLink(c.w)} <b>${esc(c.n)}</b></div><div class="muted" style="font-size:13.5px">${esc(c.t)}</div></div>`).join("")}</div>` : ""}
      <div class="d-section"><h4>Connection web</h4>${webSVG(p)}
        <div class="legend"><span><i style="background:var(--accent)"></i>Pairing</span><span><i style="background:var(--muted)"></i>Related</span><span><i style="background:var(--fire)"></i>Kata</span><span><i style="background:var(--earth)"></i>Emotion</span><span><i style="background:var(--wood)"></i>Channel / element</span></div></div>
      ${ch ? `<div class="d-section"><h4>${esc(ch.name)} channel</h4><p style="margin:0">${esc(ch.organ)}</p><p class="muted" style="margin:0">${esc(ch.surface)}.${ch.sinewStart ? ` Sinew channel: ${esc(ch.sinewStart)} to ${esc(ch.sinewEnd)}.` : ""}</p><div class="src">${esc(ch.ref)}</div></div>` : ""}`;
    const solo = $("#solo", box);
    if (solo) solo.addEventListener("click", () => { A.chans = new Set([p.ch]); refresh(); });
    box.querySelectorAll(".web .node").forEach((n) => n.addEventListener("click", () => {
      const t = n.dataset;
      if (t.wpt) selectPoint(t.wpt, true);
      else if (t.wch) { A.chans = new Set([t.wch]); refresh(); }
      else if (t.wkata) Atlas.go("kata", Number(t.wkata));
      else if (t.wview) Atlas.go(t.wview);
    }));
    box.scrollTop = 0;
  }

  function fmtTime([a, b]) {
    const f = (h) => `${((h + 11) % 12) + 1}${h < 12 || h === 24 ? "am" : "pm"}`;
    return `${f(a)}–${f(b)}`;
  }
  Atlas.fmtTime = fmtTime;

  /* Radial graph of everything a point connects to. */
  function webSVG(p) {
    const nodes = [];
    const add = (n) => { if (!nodes.some((m) => m.key === n.key) && nodes.length < 18) nodes.push(n); };
    if (p.ch) {
      const ch = Atlas.CHANNELS[p.ch];
      add({ key: "ch" + p.ch, label: `${p.ch} channel`, ch: p.ch, color: "var(--wood)", col: Atlas.elColor(p.ch) });
      if (ch.el) add({ key: "el", label: Atlas.ELEMENTS[ch.el].name, view: "phases", color: "var(--wood)", col: `var(${Atlas.ELEMENTS[ch.el].color})` });
      if (ch.pair) add({ key: "ch" + ch.pair, label: `${ch.pair} (paired)`, ch: ch.pair, color: "var(--wood)", col: Atlas.elColor(ch.pair) });
    }
    (p.combos || []).forEach((c) => Atlas.POINTS[c.w] && add({ key: c.w, label: code(c.w), sub: c.n, pt: c.w, color: "var(--accent)", col: Atlas.pointColor(Atlas.POINTS[c.w]) }));
    Object.values(Atlas.POINTS).forEach((q) => (q.combos || []).forEach((c) => c.w === p.id && add({ key: q.id, label: code(q.id), sub: c.n, pt: q.id, color: "var(--accent)", col: Atlas.pointColor(q) })));
    for (const k in Atlas.PHASES.emotions) {
      const e = Atlas.PHASES.emotions[k];
      if (e.pts.includes(p.id)) add({ key: "emo" + k, label: e.e, view: "phases", color: "var(--earth)", col: `var(${Atlas.ELEMENTS[k].color})` });
    }
    kataSteps(p.id).slice(0, 3).forEach((s) => add({ key: "k" + s.n, label: `Step ${s.n}`, kata: Atlas.KATA.indexOf(s), color: "var(--fire)", col: "var(--fire)" }));
    (p.rel || []).forEach((r) => Atlas.POINTS[r] && add({ key: r, label: code(r), pt: r, color: "var(--muted)", col: Atlas.pointColor(Atlas.POINTS[r]) }));
    if (p.cats.includes("longlife")) Object.values(Atlas.POINTS).filter((q) => q.cats.includes("longlife") && q.id !== p.id)
      .forEach((q) => add({ key: q.id, label: code(q.id), sub: "Long Life", pt: q.id, color: "var(--muted)", col: Atlas.pointColor(q) }));

    const R = 112, n = nodes.length || 1;
    const parts = nodes.map((nd, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const x = Math.cos(a) * R, y = Math.sin(a) * R;
      const lx = Math.cos(a) * (R + 14), ly = Math.sin(a) * (R + 14);
      const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
      const data = nd.pt ? `data-wpt="${nd.pt}"` : nd.ch ? `data-wch="${nd.ch}"` : nd.kata !== undefined ? `data-wkata="${nd.kata}"` : nd.view ? `data-wview="${nd.view}"` : "";
      const cx = x * 0.45, cy = y * 0.45 + 10;
      return `<path class="edge" d="M0,0 Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}" stroke="${nd.color}"/>
        <g class="node" ${data} tabindex="0"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="var(--surface)" stroke="${nd.col}"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${nd.col}"/>
        <text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}">${esc(nd.label)}</text>
        ${nd.sub ? `<text x="${lx.toFixed(1)}" y="${(ly + 13).toFixed(1)}" text-anchor="${anchor}" style="fill:var(--muted);font-size:7.5px">${esc(nd.sub)}</text>` : ""}</g>`;
    }).join("");
    return `<svg class="web" viewBox="-185 -150 370 305" role="img" aria-label="Connections of ${esc(code(p.id))}">${parts}
      <circle r="20" fill="${Atlas.pointColor(p)}"/><text class="center-text" text-anchor="middle" y="4" style="fill:var(--surface)">${esc(code(p.id))}</text></svg>`;
  }

  /* ---------- Boot ---------- */
  Atlas.views = Atlas.views || {};
  window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    window.addEventListener("hashchange", fromHash);
    fromHash();
  });
})();
