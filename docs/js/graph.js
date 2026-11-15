/*
 * The connection graph behind the Connections page: every point, channel, Five Phase,
 * emotion, kata step and muscle as a node, and every link the site's data records
 * between them. Built from the data files at first use and again when the Exam |
 * Everything scope changes, so it never drifts from what the other tabs show.
 *
 * Atlas.graph() returns { nodes: Map(key -> node), edges: [...], adj: Map(key -> [edge]) }.
 * A node is { key, type, label, sub, col, hollow, go: [view, arg] } and an edge is
 * { a, b, kind, label }, undirected; kind picks its line style (Atlas.LINK_KINDS).
 */
window.Atlas = window.Atlas || {};

(function () {
  /* Kinds of link, in legend order, each drawn in its own line style. */
  Atlas.LINK_KINDS = [
    ["channel", "Channel / element"], ["pair", "Point pairing"], ["related", "Related"], ["kata", "Kata"],
    ["emotion", "Emotion"], ["anatomy", "Muscle under point"], ["cycle", "Sheng / Ko cycle"],
  ];
  const TYPE_NAMES = { point: "point", channel: "channel", phase: "Five Phase", emotion: "emotion", kata: "kata step", muscle: "muscle" };
  Atlas.nodeTypeName = (t) => TYPE_NAMES[t];

  /*
   * Each kind of node has its own shape, so a web of mixed things reads at a glance; color
   * stays the Five Phase, and a hollow shape has no phase. Each entry opens the outline's tag.
   */
  const f = (v) => v.toFixed(1);
  const SHAPES = {
    point: (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"`,
    phase: (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.45)}"`,
    muscle: (x, y, r) => `<rect x="${f(x - r * 0.85)}" y="${f(y - r * 0.85)}" width="${f(r * 1.7)}" height="${f(r * 1.7)}"`,
    kata: (x, y, r) => `<polygon points="${f(x)},${f(y - r * 1.2)} ${f(x + r * 1.2)},${f(y)} ${f(x)},${f(y + r * 1.2)} ${f(x - r * 1.2)},${f(y)}"`,
    channel: (x, y, r) => `<rect x="${f(x - r * 1.2)}" y="${f(y - r * 0.65)}" width="${f(r * 2.4)}" height="${f(r * 1.3)}" rx="${f(r * 0.65)}"`,
    emotion: (x, y, r) => `<polygon points="${f(x)},${f(y - r * 1.25)} ${f(x + r * 1.15)},${f(y + r * 0.75)} ${f(x - r * 1.15)},${f(y + r * 0.75)}"`,
  };
  Atlas.NODE_TYPES = Object.keys(SHAPES);
  /** A node's shape at (x, y), about r across: an outline, with a filled core unless hollow. */
  Atlas.nodeShape = (type, x, y, r, col, hollow) =>
    `${SHAPES[type](x, y, r)} class="shape" fill="var(--surface)" stroke="${col}"${type === "phase" ? ' style="stroke-width:2"' : ""}/>`
    + (hollow ? "" : `${SHAPES[type](x, y, r * 0.43)} fill="${col}" stroke="none"/>`);
  /** A small inline icon of a node's shape, for chips and keys. */
  Atlas.nodeGlyph = (type, col = "var(--muted)", hollow = false) =>
    `<svg class="web-glyph" viewBox="-9 -9 18 18" aria-hidden="true">${Atlas.nodeShape(type, 0, 0, 5, col, hollow)}</svg>`;
  /** The key to the shapes, for the given node types. */
  Atlas.shapeKey = (types) => `<div class="legend web-phases"><span>Shape = kind:</span>${types.map((t) =>
    `<span>${Atlas.nodeGlyph(t, "var(--muted)", t === "muscle" || t === "kata")}${TYPE_NAMES[t][0].toUpperCase() + TYPE_NAMES[t].slice(1)}</span>`).join("")}</div>`;

  let cache = null, cacheScope = null;
  document.addEventListener("scopechange", () => { cache = null; });

  Atlas.graph = function () {
    if (cache && cacheScope === Atlas.examOnly()) return cache;
    const exam = Atlas.examOnly();
    const nodes = new Map(), edges = [];
    const node = (n) => { nodes.set(n.key, n); return n.key; };
    const link = (a, b, kind, label) => { if (nodes.has(a) && nodes.has(b) && a !== b) edges.push({ a, b, kind, label }); };
    const phaseCol = (el) => `var(${Atlas.ELEMENTS[el].color})`;

    for (const k of Atlas.PHASES.order) {
      node({ key: "ph:" + k, type: "phase", label: Atlas.ELEMENTS[k].name, col: phaseCol(k), go: ["phases"] });
    }
    for (const [code, c] of Object.entries(Atlas.CHANNELS)) {
      node({ key: "ch:" + code, type: "channel", label: `${c.name} channel`, sub: code, col: Atlas.elColor(code), go: ["atlas", { ch: code }] });
    }
    for (const p of Object.values(Atlas.POINTS)) {
      if (exam && !Atlas.isCourse(p)) continue;
      node({ key: "p:" + p.id, type: "point", label: Atlas.code(p.id), sub: p.en, col: Atlas.pointColor(p), go: ["atlas", p.id] });
    }
    for (const [k, e] of Object.entries(Atlas.PHASES.emotions)) {
      node({ key: "em:" + k, type: "emotion", label: e.e, col: phaseCol(k), go: ["phases"] });
    }
    /* The "Repeat steps" entries only repeat the steps before them on the other side. */
    Atlas.KATA.forEach((s, i) => {
      if (s.pts.length && !/^Repeat/.test(s.t)) node({ key: "k:" + i, type: "kata", label: `Step ${s.n}`, sub: s.t, col: "var(--muted)", hollow: true, go: ["kata", i] });
    });
    for (const m of Atlas.MUSCLES) {
      if (exam && !m.exam) continue;
      node({ key: "m:" + m.id, type: "muscle", label: m.n, col: "var(--muted)", hollow: true, go: ["anatomy", m.id] });
    }

    /* Five Phases: Sheng nourishes the next phase, Ko restrains the one across the star (Handbook 3.5). */
    const order = Atlas.PHASES.order;
    order.forEach((k, i) => {
      link("ph:" + k, "ph:" + order[(i + 1) % 5], "cycle", "Sheng (nourishes)");
      link("ph:" + k, "ph:" + order[(i + 2) % 5], "cycle", "Ko (restrains)");
    });
    for (const [code, c] of Object.entries(Atlas.CHANNELS)) {
      if (c.el) link("ch:" + code, "ph:" + c.el, "channel", "phase");
      if (c.pair && code < c.pair) link("ch:" + code, "ch:" + c.pair, "channel", "partner channel");
    }
    for (const p of Object.values(Atlas.POINTS)) {
      const k = "p:" + p.id;
      if (p.ch) link(k, "ch:" + p.ch, "channel", "on the channel");
      (p.combos || []).forEach((c) => link(k, "p:" + c.w, "pair", c.n || "point pairing"));
      (p.rel || []).forEach((r) => link(k, "p:" + r, "related", "related point"));
    }
    for (const [el, e] of Object.entries(Atlas.PHASES.emotions)) {
      link("em:" + el, "ph:" + el, "emotion", "emotion of the phase");
      e.pts.forEach((id) => link("em:" + el, "p:" + id, "emotion", "treats the emotion"));
    }
    Atlas.KATA.forEach((s, i) => s.pts.forEach((id) => link("k:" + i, "p:" + id, "kata", "worked in the step")));
    if (Atlas.musclesUnder) {
      for (const p of Object.values(Atlas.POINTS)) Atlas.musclesUnder(p.id).forEach((m) => link("p:" + p.id, "m:" + m.id, "anatomy", "muscle under the point"));
    }

    /* Two records of the same link (A pairs with B and B with A) count once. */
    const seen = new Set(), unique = [];
    for (const e of edges) {
      const id = [e.a, e.b].sort().join("|") + "|" + e.kind;
      if (!seen.has(id)) { seen.add(id); unique.push(e); }
    }
    const adj = new Map([...nodes.keys()].map((k) => [k, []]));
    for (const e of unique) { adj.get(e.a).push(e); adj.get(e.b).push(e); }
    cache = { nodes, edges: unique, adj };
    cacheScope = exam;
    return cache;
  };

  /** The node at the other end of an edge. */
  Atlas.otherEnd = (e, key) => (e.a === key ? e.b : e.a);

  /**
   * Every shortest chain of links from a to b (up to max), found breadth-first.
   * Each path is an array of { key, edge } steps, the first with edge null.
   */
  Atlas.shortestPaths = function (a, b, max = 6) {
    const { adj } = Atlas.graph();
    if (!adj.has(a) || !adj.has(b)) return [];
    const dist = new Map([[a, 0]]), parents = new Map([[a, []]]);
    const queue = [a];
    while (queue.length) {
      const k = queue.shift();
      if (k === b) break;
      for (const e of adj.get(k)) {
        const n = Atlas.otherEnd(e, k);
        if (!dist.has(n)) { dist.set(n, dist.get(k) + 1); parents.set(n, [{ from: k, edge: e }]); queue.push(n); }
        else if (dist.get(n) === dist.get(k) + 1) parents.get(n).push({ from: k, edge: e });
      }
    }
    if (!dist.has(b)) return [];
    const out = [];
    const walk = (k, tail) => {
      if (out.length >= max) return;
      if (k === a) { out.push([{ key: a, edge: null }, ...tail]); return; }
      for (const p of parents.get(k)) walk(p.from, [{ key: k, edge: p.edge }, ...tail]);
    };
    walk(b, []);
    return out;
  };
})();
