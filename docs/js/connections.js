/*
 * Connections view: the whole atlas as one web (Atlas.graph, graph.js).
 *   Explore       - one thing at the center with everything linked to it; click a neighbor to
 *                   walk to it, with a trail back. This is the concept-map "focus and walk" view.
 *   How connected - pick two things and see the shortest chains of links between them.
 *   Constellation - every node at once, pulled toward its Five Phase, laid out by d3-force
 *                   (docs/vendor/d3-force-3.0.0, ISC), which loads only when this view opens.
 * In the last two, picking something shows its card beside the figure, or slides it up from
 * the bottom on a phone (Atlas.openSheet), without leaving the view.
 * Line style shows the kind of link and dot color the Five Phase, as in the Atlas web.
 */
window.Atlas = window.Atlas || {};
Atlas.views = Atlas.views || {};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => Atlas.esc(s);
  const VENDOR = new URL("../vendor/d3-force-3.0.0/", document.currentScript.src).href;
  const C = { mode: "explore", center: "p:LI4", trail: [], from: "p:LI4", to: "em:metal", routes: [], route: 0, sel: null };
  const KIND_ORDER = Object.fromEntries(Atlas.LINK_KINDS.map(([k], i) => [k, i]));
  const OPEN_LABEL = { atlas: "Open in the Atlas", kata: "Open in the Kata", anatomy: "Open in Anatomy", phases: "Open Five Phases" };
  const MAX_RING = 30;
  /* Long names are cut on the ring; the full name is in the tooltip and the list beside it. */
  const short = (t) => (t.length > 17 ? t.slice(0, 16).trimEnd() + "…" : t);

  /* ---------- Shared drawing ---------- */
  const edgePath = (d, kind) => `<path class="edge edge-${kind}" d="${d}"/>${kind === "pair" ? `<path class="edge edge-pair-gap" d="${d}"/>` : ""}`;
  const dot = (n, x, y, r = 7) => Atlas.nodeShape(n.type, x, y, r, n.col, n.hollow);
  const glyph = (n) => Atlas.nodeGlyph(n.type, n.col, n.hollow);
  const typeName = (n) => { const t = Atlas.nodeTypeName(n.type); return t[0].toUpperCase() + t.slice(1); };
  function legend() {
    const kinds = Atlas.LINK_KINDS.map(([k, t]) => `<span><svg class="web-key" viewBox="0 0 24 8" aria-hidden="true">${edgePath("M1,4 H23", k)}</svg>${t}</span>`).join("");
    const phases = Object.values(Atlas.ELEMENTS).map((e) => `<span><b class="web-dot" style="color:var(${e.color})"></b>${e.name}</span>`).join("");
    return `<div class="legend">${kinds}</div>
      <div class="legend web-phases"><span>Color = Five Phase:</span>${phases}<span><b class="web-dot" style="color:var(--extra)"></b>Du / Ren</span><span><b class="web-dot hollow"></b>No phase (kata step, muscle)</span></div>
      ${Atlas.shapeKey(Atlas.NODE_TYPES)}`;
  }
  const typeTag = (n) => Atlas.nodeTypeName(n.type);

  Atlas.views.connections = function () {
    $("#view-connections").innerHTML = `
      <p class="view-intro">Everything the atlas links together, as one web: points, channels, the Five Phases, emotions, kata steps and the muscles under the points. Start from anything and click a neighbor to walk to it; the trail takes you back. Tracing how ideas connect, rather than memorizing them one by one, is how concept maps help study.</p>
      <div class="anat-bar">
        <div class="seg" id="cx-mode" role="group" aria-label="View">
          <button data-m="explore">Explore</button><button data-m="path">How are these connected?</button><button data-m="sky">Constellation</button>
        </div>
        ${Atlas.scopeSwitch("Exam: the points the course names and the exam muscles. Everything adds the classical points and all 188 muscles.")}
      </div>
      <div id="cx-body"></div>`;
    $("#cx-mode").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) { C.mode = b.dataset.m; draw(); } });
    /* [data-ck] re-centers Explore on that node; [data-pick] shows its card in the current view. */
    $("#view-connections").addEventListener("click", (e) => {
      const b = e.target.closest("[data-ck]");
      if (b) { e.preventDefault(); walk(b.dataset.ck); }
      const k = e.target.closest("[data-pick]");
      if (k) { e.preventDefault(); C.mode === "explore" ? walk(k.dataset.pick) : pickNode(k.dataset.pick); }
      const o = e.target.closest("[data-open]");
      if (o) { const n = Atlas.graph().nodes.get(o.dataset.open); Atlas.go(n.go[0], n.go[1]); }
    });
    document.addEventListener("scopechange", () => { sky = null; C.sel = null; if ($("#cx-body")) draw(); });
    draw();
  };

  /** Open Explore centered on a node key (deep link #c-<key>). */
  Atlas.connectionsGo = (key) => {
    if (!Atlas.graph().nodes.has(key)) return;
    C.mode = "explore";
    C.center = key;
    C.trail = [];
    draw();
  };

  function walk(key) {
    if (!Atlas.graph().nodes.has(key)) return;
    if (C.mode === "explore" && key !== C.center) C.trail = [...C.trail.filter((k) => k !== C.center), C.center].slice(-8);
    C.mode = "explore";
    C.center = key;
    history.replaceState(null, "", "#c-" + encodeURIComponent(key));
    draw();
  }

  function draw() {
    if (C.sel && !Atlas.graph().nodes.has(C.sel)) C.sel = null;
    $("#cx-mode").querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === C.mode)));
    /* A node can drop out when the scope narrows; fall back to a course point. */
    if (!Atlas.graph().nodes.has(C.center)) C.center = "p:LI4";
    ({ explore, path, sky: constellation })[C.mode]();
  }

  /* ---------- Name boxes: type a name and pick it from the suggestions ---------- */
  const nameOf = (n) => `${n.label} · ${typeTag(n)}`;
  const nameList = () => `<datalist id="cx-names">${[...Atlas.graph().nodes.values()].map((n) => `<option value="${esc(nameOf(n))}"></option>`).join("")}</datalist>`;
  const nameBox = (id, key) => {
    const n = Atlas.graph().nodes.get(key);
    return `<input class="search" id="${id}" list="cx-names" value="${n ? esc(nameOf(n)) : ""}" placeholder="Point, channel, muscle…" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false">`;
  };
  /** The node a typed name means: an exact suggestion, then an exact label, then a label it starts. */
  function pickName(v) {
    const t = v.trim().toLowerCase(), all = [...Atlas.graph().nodes.values()];
    if (!t) return undefined;
    return (all.find((n) => nameOf(n).toLowerCase() === t) || all.find((n) => n.label.toLowerCase() === t) || all.find((n) => n.label.toLowerCase().startsWith(t)) || {}).key;
  }

  /* ---------- The card: what a node is and everything linked to it ---------- */
  /** The facts its home tab shows for a node, from the same shared renderers. */
  function factsHTML(n) {
    const id = n.key.slice(n.key.indexOf(":") + 1);
    switch (n.type) {
      case "point": { const p = Atlas.pointParts(Atlas.POINTS[id]); return p.head + p.location + p.course + p.actions; }
      case "muscle": return Atlas.muscleFacts(Atlas.MUSCLES.find((m) => m.id === id));
      case "kata": return Atlas.kataFacts(Number(id)) + Atlas.kataReminder;
      case "phase": return Atlas.phaseFacts(id);
      case "channel": return `<h3 class="lens-muscle">${esc(n.label)}</h3>
        <p class="muted" style="margin:0">${Atlas.channelMeta(id)}</p>${Atlas.channelFacts(id)}`;
      case "emotion": return `<span class="eyebrow">${Atlas.ELEMENTS[id].name} phase</span><h3 class="lens-muscle">${esc(n.label)}</h3>${Atlas.emotionFacts(id)}`;
    }
  }
  function cardHTML(key) {
    const { nodes, adj } = Atlas.graph();
    const c = nodes.get(key), links = adj.get(key);
    const groups = Atlas.LINK_KINDS.map(([k, t]) => {
      const es = links.filter((e) => e.kind === k)
        .sort((x, y) => nodes.get(Atlas.otherEnd(x, key)).label.localeCompare(nodes.get(Atlas.otherEnd(y, key)).label));
      return es.length ? `<div class="d-section"><h4>${t}</h4><div class="chips">${es.map((e) => {
        const nb = nodes.get(Atlas.otherEnd(e, key));
        return `<button class="chip" data-pick="${esc(nb.key)}" title="${esc(typeName(nb))}: ${esc(e.label)}">${glyph(nb)}${esc(nb.label)}${nb.type === "point" ? ` <span class="muted">${esc(nb.sub || "")}</span>` : ""}</button>`;
      }).join("")}</div></div>` : "";
    }).join("");
    const here = C.mode === "explore";
    return `${Atlas.sheetBar("Close the details")}
      <div class="cx-type">${glyph(c)}${esc(typeName(c))}</div>
      ${factsHTML(c)}
      <p class="muted" style="margin:0">${links.length} link${links.length === 1 ? "" : "s"}. ${here ? "Click any of them to make it the center." : C.mode === "sky" ? "Pick one to light it up." : "Pick one to see its links."}</p>
      <div class="chips">${here ? "" : `<button class="btn" data-ck="${esc(key)}">Explore from here</button>`}
        <button class="btn${here ? "" : " ghost"}" data-open="${esc(key)}">${OPEN_LABEL[c.go[0]]}</button>
        ${here ? `<button class="btn ghost" id="cx-from-here" type="button">Find a route from here</button>` : ""}</div>
      ${groups}`;
  }
  const EMPTY_CARD = { path: "Pick any step in the route to see its links here.", sky: "Pick a dot to light up what it touches and see its links here." };
  /** Show a node's card in the route or constellation view; on a phone it slides up. */
  function pickNode(key) {
    C.sel = key;
    const side = $("#cx-side");
    side.innerHTML = cardHTML(key);
    side.scrollTop = 0;
    document.querySelectorAll("#cx-body [data-pick].on").forEach((b) => b.classList.remove("on"));
    document.querySelectorAll(`#cx-body .cx-chain [data-pick="${CSS.escape(key)}"]`).forEach((b) => b.classList.add("on"));
    const svg = $("#cx-sky .cx-sky-svg");
    if (C.mode === "sky" && svg) focusSky(svg, key);
    Atlas.openSheet(side);
    /* On a phone the sheet covers the lower half; keep the lit constellation in view above it. */
    if (C.mode === "sky" && side.classList.contains("sheet-open")) $("#cx-sky").scrollIntoView({ block: "start" });
  }
  function clearPick() {
    C.sel = null;
    const side = $("#cx-side");
    side.classList.remove("sheet-open");
    side.innerHTML = `<p class="muted" style="margin:0">${EMPTY_CARD[C.mode]}</p>`;
  }
  const sideHTML = () => `<aside class="panel cx-card sheet" id="cx-side" aria-live="polite"></aside>`;
  function bindSide() {
    Atlas.bindSheet($("#cx-side"));
    if (C.sel) pickNode(C.sel); else clearPick();
    $("#cx-side").classList.remove("sheet-open"); // a redraw doesn't reopen the sheet
  }

  /* ---------- Explore: one node and its neighbors ---------- */
  function explore() {
    const { nodes, adj } = Atlas.graph();
    const c = nodes.get(C.center);
    const links = adj.get(C.center).slice().sort((x, y) => KIND_ORDER[x.kind] - KIND_ORDER[y.kind]
      || nodes.get(Atlas.otherEnd(x, C.center)).label.localeCompare(nodes.get(Atlas.otherEnd(y, C.center)).label));
    const shown = links.slice(0, MAX_RING), n = shown.length || 1, twoRings = n > 14;
    const ring = shown.map((e, i) => {
      const nb = nodes.get(Atlas.otherEnd(e, C.center));
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2, R = twoRings ? (i % 2 ? 168 : 112) : 132;
      const x = Math.cos(a) * R, y = Math.sin(a) * R, lx = Math.cos(a) * (R + 12), ly = Math.sin(a) * (R + 12);
      const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
      const d = `M0,0 Q${(x * 0.45).toFixed(1)},${(y * 0.45 + 10).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
      return `${edgePath(d, e.kind)}
        <g class="node" data-ck="${esc(nb.key)}" tabindex="0" role="button" aria-label="${esc(nb.label)}, ${esc(typeTag(nb))}: ${esc(e.label)}">
          <title>${esc(nb.label)} · ${esc(e.label)}</title><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="transparent" stroke="none"/>${dot(nb, x, y)}
          <text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}">${esc(short(nb.label))}</text></g>`;
    }).join("");
    const trail = C.trail.map((k) => nodes.get(k)).filter(Boolean);
    $("#cx-body").innerHTML = `
      <form class="cx-pickers cx-start" id="cx-start">
        <label>Start from ${nameBox("cx-c", "")}</label>
        <button class="btn" type="submit">Show its links</button>
      </form>
      ${nameList()}
      <p class="cx-error" id="cx-error" role="alert"></p>
      <div class="cx-explore">
        <div class="panel cx-stage">
          ${trail.length ? `<nav class="cx-trail" aria-label="Where you have been">${trail.map((t) => `<button class="chip" data-ck="${esc(t.key)}">${glyph(t)}${esc(t.label)} <span class="muted">${esc(Atlas.nodeTypeName(t.type))}</span></button>`).join('<span aria-hidden="true">›</span>')}<span aria-hidden="true">›</span><b>${glyph(c)} ${esc(c.label)}</b> <span class="muted">${esc(Atlas.nodeTypeName(c.type))}</span></nav>` : ""}
          <svg class="web cx-web" viewBox="-290 -215 580 430" role="img" aria-label="${esc(c.label)} and the ${links.length} things linked to it">${ring}
            <g class="cx-center">${dot(c, 0, 0, 16)}
              <text class="center-text halo" text-anchor="middle" y="44">${esc(c.label)}</text>
              <text class="center-type halo" text-anchor="middle" y="57">${esc(Atlas.nodeTypeName(c.type))}</text></g></svg>
          ${links.length > MAX_RING ? `<p class="muted" style="margin:0;font-size:12.5px">${links.length - MAX_RING} more links are listed beside the web.</p>` : ""}
          ${legend()}
        </div>
        <aside class="panel cx-card">${cardHTML(C.center)}</aside>
      </div>`;
    $("#cx-start").addEventListener("submit", (e) => {
      e.preventDefault();
      const k = pickName($("#cx-c").value);
      if (!k) { $("#cx-error").textContent = "Choose something from the list, such as LI4 or Liver channel."; return; }
      $("#cx-c").value = "";
      $("#cx-c").blur();
      walk(k);
    });
    $("#cx-start").addEventListener("input", () => { $("#cx-error").textContent = ""; });
    $("#cx-from-here").addEventListener("click", () => { C.from = C.center; C.mode = "path"; draw(); });
    /* Keyboard: Enter or Space on a node walks to it. */
    $("#cx-body .cx-web").addEventListener("keydown", (e) => {
      const g = e.target.closest("[data-ck]");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); walk(g.dataset.ck); }
    });
  }

  /* ---------- How are these connected? ---------- */
  function path() {
    $("#cx-body").innerHTML = `
      <div class="cx-split">
      <div class="panel cx-path">
        <p style="margin:0">Pick any two things to see the shortest chains of links between them. Each step is a link you can study, such as a point on its channel, or a channel's phase.</p>
        <form class="cx-pickers" id="cx-form">
          <label>From ${nameBox("cx-a", C.from)}</label>
          <label>To ${nameBox("cx-b", C.to)}</label>
          <button class="btn" type="submit">Show the connection</button>
        </form>
        ${nameList()}
        <p class="cx-error" id="cx-error" role="alert"></p>
        <div id="cx-route"></div>
      </div>
      ${sideHTML()}
      </div>`;
    bindSide();
    $("#cx-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const a = pickName($("#cx-a").value), b = pickName($("#cx-b").value);
      $("#cx-error").textContent = !a ? "Choose a starting point from the list." : !b ? "Choose where to end from the list." : "";
      if (!a || !b) return;
      C.from = a; C.to = b; C.route = 0;
      route();
      clearPick();
    });
    $("#cx-form").addEventListener("input", () => { $("#cx-error").textContent = ""; });
    route();
  }
  function route() {
    const { nodes } = Atlas.graph();
    C.routes = Atlas.shortestPaths(C.from, C.to);
    const box = $("#cx-route");
    if (C.from === C.to) { box.innerHTML = `<p class="muted">Pick two different things.</p>`; return; }
    if (!C.routes.length) { box.innerHTML = `<p class="muted">These two aren't linked by anything in the atlas.</p>`; return; }
    const r = C.routes[C.route % C.routes.length];
    const pill = (k) => { const n = nodes.get(k); return `<button class="cx-pill${k === C.sel ? " on" : ""}" data-pick="${esc(k)}" style="--c:${n.col}">${glyph(n)}${esc(n.label)}<small>${esc(typeTag(n))}</small></button>`; };
    const steps = r.map((s, i) => (i ? `<span class="cx-step"><svg class="web-key" viewBox="0 0 24 8" aria-hidden="true">${edgePath("M1,4 H23", s.edge.kind)}</svg>${esc(s.edge.label)}</span>` : "") + pill(s.key)).join("");
    box.innerHTML = `
      <p class="muted" style="margin:0">${r.length - 1} link${r.length === 2 ? "" : "s"} apart${C.routes.length > 1 ? ` · route ${C.route % C.routes.length + 1} of ${C.routes.length}${C.routes.length === 6 ? "+" : ""}` : ""}. Pick any step to see its links.</p>
      <div class="cx-chain">${steps}</div>
      ${C.routes.length > 1 ? `<button class="btn ghost" id="cx-next" type="button">Show another route</button>` : ""}`;
    const next = $("#cx-next");
    if (next) next.addEventListener("click", () => { C.route++; route(); });
  }

  /* ---------- Constellation: everything at once ---------- */
  let sky = null; // the laid-out nodes and links for the current scope
  let d3ready = null;
  function loadD3() {
    /* The four UMD builds attach to window.d3 and must load in dependency order. */
    const one = (f) => new Promise((ok, fail) => {
      const s = document.createElement("script");
      s.src = VENDOR + f;
      s.onload = ok;
      s.onerror = () => fail(new Error("Could not load " + f));
      document.head.appendChild(s);
    });
    d3ready ??= ["d3-dispatch.min.js", "d3-quadtree.min.js", "d3-timer.min.js", "d3-force.min.js"].reduce((p, f) => p.then(() => one(f)), Promise.resolve());
    return d3ready;
  }
  /* Phases sit on a pentagon in Sheng order; everything else is pulled toward its phase. */
  function layout() {
    const { nodes, edges, adj } = Atlas.graph();
    const anchor = {};
    Atlas.PHASES.order.forEach((k, i) => {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      anchor[k] = [Math.cos(a) * 330, Math.sin(a) * 330];
    });
    const phaseOf = (n) => {
      if (n.type === "phase" || n.type === "emotion") return n.key.split(":")[1];
      if (n.type === "channel") return Atlas.CHANNELS[n.key.slice(3)].el;
      if (n.type === "point") { const ch = Atlas.CHANNELS[Atlas.POINTS[n.key.slice(2)].ch]; return ch && ch.el; }
      return null;
    };
    /* Things with no links (an exam muscle under no course point) would only float loose. */
    const list = [...nodes.values()].filter((n) => adj.get(n.key).length).map((n) => ({ ...n, ph: phaseOf(n) }));
    const links = edges.map((e) => ({ source: e.a, target: e.b, kind: e.kind }));
    const pull = { channel: 0.5, pair: 0.25, related: 0.12, kata: 0.25, emotion: 0.3, anatomy: 0.3, cycle: 0.02 };
    const sim = d3.forceSimulation(list)
      .force("link", d3.forceLink(links).id((n) => n.key).distance(28).strength((l) => pull[l.kind]))
      .force("charge", d3.forceManyBody().strength(-38))
      .force("collide", d3.forceCollide(7))
      .force("x", d3.forceX((n) => (n.ph ? anchor[n.ph][0] : 0)).strength((n) => (n.ph ? 0.14 : 0.02)))
      .force("y", d3.forceY((n) => (n.ph ? anchor[n.ph][1] : 0)).strength((n) => (n.ph ? 0.14 : 0.02)))
      .stop();
    /* Settle once, up front: a still picture is easier to study and kinder to phone batteries. */
    for (let i = 0; i < 300; i++) sim.tick();
    return { list, links, byKey: new Map(list.map((n) => [n.key, n])) };
  }
  /* About how far across each kind is drawn; the phase circle is drawn 1.45 times this. */
  const R = { phase: 11, channel: 7, emotion: 7, point: 4.5, kata: 3.5, muscle: 3.5 };
  function constellation() {
    $("#cx-body").innerHTML = `
      <div class="cx-split">
      <div class="panel cx-sky-wrap">
        <p class="muted" style="margin:0;font-size:13px">Each point, channel and emotion is pulled toward its Five Phase; the phases sit in Sheng order. Pick a dot to see what it touches.</p>
        <div class="cx-sky" id="cx-sky"><p class="v3d-status">Laying out the web…</p></div>
        ${legend()}
      </div>
      ${sideHTML()}
      </div>`;
    bindSide();
    loadD3().then(() => {
      sky ??= layout();
      drawSky();
      if (C.sel) focusSky($("#cx-sky .cx-sky-svg"), C.sel);
    }).catch((err) => {
      console.error("Constellation layout failed", err);
      $("#cx-sky").innerHTML = `<p class="v3d-status v3d-error">The constellation couldn't load. Reload the page, or use Explore.</p>`;
    });
  }
  function drawSky() {
    const { list, links } = sky;
    const xs = list.map((n) => n.x), ys = list.map((n) => n.y), pad = 40;
    const box = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad];
    const lines = links.map((l) => `<line class="edge edge-${l.kind}" data-a="${esc(l.source.key)}" data-b="${esc(l.target.key)}" x1="${l.source.x.toFixed(1)}" y1="${l.source.y.toFixed(1)}" x2="${l.target.x.toFixed(1)}" y2="${l.target.y.toFixed(1)}"/>`).join("");
    const dots = list.map((n) => `<g class="node sky-${n.type}" data-k="${esc(n.key)}" tabindex="-1">${dot(n, n.x, n.y, R[n.type])}
      <text class="sky-label" x="${n.x.toFixed(1)}" y="${(n.y - R[n.type] * (n.type === "phase" ? 1.45 : 1.2) - 4).toFixed(1)}" text-anchor="middle">${esc(n.label)}</text></g>`).join("");
    const host = $("#cx-sky");
    host.innerHTML = `<svg class="web cx-sky-svg" viewBox="${box.join(" ")}" role="img" aria-label="Constellation of ${list.length} linked things">
      <g class="sky-lines">${lines}</g><g class="sky-dots">${dots}</g></svg>
      <div class="zoom-ctl"><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="fit" aria-label="Show everything">⤢</button></div>`;
    const svg = host.querySelector("svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    bindSky(svg, box);
    host.addEventListener("click", (e) => {
      const z = e.target.closest("[data-z]");
      if (z) svg.dispatchEvent(new CustomEvent("zoom", { detail: z.dataset.z }));
    });
  }
  /* Focus one dot: its links and neighbors stay lit, everything else fades. */
  function focusSky(svg, key) {
    const { adj } = Atlas.graph();
    svg.classList.toggle("focusing", Boolean(key));
    svg.querySelectorAll(".lit").forEach((x) => x.classList.remove("lit"));
    if (!key) return;
    const near = new Set([key, ...adj.get(key).map((e) => Atlas.otherEnd(e, key))]);
    svg.querySelectorAll(".sky-dots .node").forEach((g) => { if (near.has(g.dataset.k)) g.classList.add("lit"); });
    svg.querySelectorAll(".sky-lines line").forEach((l) => { if (l.dataset.a === key || l.dataset.b === key) l.classList.add("lit"); });
  }
  function bindSky(svg, full) {
    let box = full.slice();
    /* --k is SVG units per screen pixel, so labels stay the same size on screen at any zoom;
       channel names join the phase names once zoomed in to half the width. */
    const apply = () => {
      svg.setAttribute("viewBox", box.map((v) => v.toFixed(1)).join(" "));
      svg.style.setProperty("--k", (box[2] / (svg.clientWidth || 1)).toFixed(3));
      svg.classList.toggle("near", box[2] < full[2] * 0.55);
    };
    const zoom = (f, cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2) => {
      const w = Math.min(full[2] * 1.2, Math.max(full[2] / 12, box[2] * f)), h = w * (full[3] / full[2]);
      box = [cx - ((cx - box[0]) / box[2]) * w, cy - ((cy - box[1]) / box[3]) * h, w, h];
      apply();
    };
    const toSvg = (x, y) => { const r = svg.getBoundingClientRect(); return [box[0] + ((x - r.left) / r.width) * box[2], box[1] + ((y - r.top) / r.height) * box[3]]; };
    apply();
    svg.addEventListener("zoom", (e) => { if (e.detail === "fit") { box = full.slice(); apply(); } else zoom(e.detail === "in" ? 0.7 : 1 / 0.7); });
    svg.addEventListener("wheel", (e) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, ...toSvg(e.clientX, e.clientY)); }, { passive: false });
    /* Mouse drags pan; on a touch screen one finger scrolls the page and two fingers pan and pinch. */
    if (Atlas.coarse) Atlas.twoFingerGestures(svg, svg.parentElement, "Two fingers to move and zoom");
    const ptrs = new Map();
    /* A press that travels under 5px is a tap, not a drag. */
    let moved = false, start = null;
    svg.addEventListener("pointerdown", (e) => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = false; start = [e.clientX, e.clientY]; });
    svg.addEventListener("pointermove", (e) => {
      const prev = ptrs.get(e.pointerId);
      if (!prev) return;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      const r = svg.getBoundingClientRect(), s = box[2] / r.width;
      if (ptrs.size === 2) {
        const other = [...ptrs.entries()].find(([k]) => k !== e.pointerId)[1];
        const d0 = Math.hypot(prev[0] - other[0], prev[1] - other[1]), d1 = Math.hypot(e.clientX - other[0], e.clientY - other[1]);
        box[0] -= ((e.clientX - prev[0]) / 2) * s; box[1] -= ((e.clientY - prev[1]) / 2) * s;
        if (d0 > 0 && d1 > 0) zoom(d0 / d1, ...toSvg((e.clientX + other[0]) / 2, (e.clientY + other[1]) / 2)); else apply();
        moved = true;
        return;
      }
      if ((e.pointerType === "touch" && Atlas.coarse) || !e.buttons) return;
      moved ||= Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 5;
      if (!moved) return;
      box[0] -= (e.clientX - prev[0]) * s; box[1] -= (e.clientY - prev[1]) * s;
      apply();
    });
    const end = (e) => {
      ptrs.delete(e.pointerId);
      if (e.type !== "pointerup" || moved) return;
      const g = e.target.closest(".node");
      if (g) pickNode(g.dataset.k);
      else { focusSky(svg, null); clearPick(); }
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
  }
})();
