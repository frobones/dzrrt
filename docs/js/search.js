/*
 * Site search: the header box finds points, channels, kata steps, muscles, bones, landmarks
 * and joints, and opens the one picked in its own tab, selected, zoomed and highlighted, in
 * that tab's 2D or 3D figure.
 *
 * Matching runs in two passes. Every word typed must appear in an entry's names or its
 * details (actions, attachments, location...); those exact hits rank first. Then Fuse.js
 * (docs/vendor/fuse-7.5.0, Apache-2.0, loaded on first use) adds names that are close to
 * what was typed, so misspelt anatomy and pinyin still find their match. Typo matching
 * looks at names only: in long details it would match almost anything.
 */
window.Atlas = window.Atlas || {};

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => Atlas.esc(s);
  const FUSE_URL = new URL("../vendor/fuse-7.5.0/fuse.basic.min.mjs", document.currentScript.src).href;
  /* Result groups show in this order: anatomy first, then points, then the rest. */
  const KINDS = { muscle: "Muscles", bone: "Bones", point: "Points", landmark: "Landmarks", joint: "Joints", channel: "Channels", kata: "Kata steps" };
  const PER_KIND = 6;
  /* Lower case, accents dropped ("Hégǔ" -> "hegu"), so typing needs no special characters. */
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  /* Codes also match without spaces or dashes: "LI 4" and "li-4" find LI4. */
  const squash = (s) => norm(s).replace(/[\s\-]+/g, "");

  let index = null, fuse = null;

  /** One entry per searchable thing: what to show, what to match, and where it opens. */
  function build() {
    const out = [];
    const add = (kind, label, sub, names, text, onExam, go) =>
      out.push({ kind, label, sub, names: names.filter(Boolean).map(norm), text: norm(text), onExam, go });
    for (const p of Object.values(Atlas.POINTS)) {
      const ch = p.ch && Atlas.CHANNELS[p.ch];
      add("point", `${Atlas.code(p.id)} ${p.en}`, [p.py, ch && ch.name].filter(Boolean).join(" · "),
        [p.id, p.code, p.py, p.en, p.alt], [p.loc, ...(p.fx || []), ...(p.course || []).map((c) => c.t), ch && ch.name].join(" "),
        Atlas.isCourse(p), () => Atlas.go("atlas", p.id));
    }
    for (const [code, c] of Object.entries(Atlas.CHANNELS)) {
      add("channel", `${c.name} channel`, code, [c.name, code, c.alias], [c.limb, c.surface].join(" "), true,
        () => Atlas.go("atlas", { ch: code }));
    }
    Atlas.KATA.forEach((s, i) => {
      const grp = Atlas.KATA_GROUPS.find((g) => g.id === s.g);
      add("kata", `Step ${s.n} · ${s.t}`, grp.name, [s.t, `step ${s.n}`], [s.note, grp.name].join(" "), true, () => Atlas.go("kata", i));
    });
    for (const m of Atlas.MUSCLES) {
      add("muscle", m.n, m.group || m.region, [m.n, m.group], [m.o, m.i, m.a, m.nerve, m.region].join(" "), Boolean(m.exam),
        () => Atlas.go("anatomy", m.id));
    }
    const boneNames = new Set(Atlas.BONES.map((b) => b.name));
    for (const b of Atlas.BONES) {
      add("bone", b.name, b.region, [b.name], [...(b.landmarks || []), b.notes].join(" "), Atlas.boneOnExam(b.name),
        () => Atlas.go("anatomy", { bone: b.name }));
    }
    /* Landmarks off the bone list (fascia, the hyoid) have nowhere to open. */
    for (const [id, l] of Object.entries(Atlas.LANDMARKS)) {
      if (!boneNames.has(l.b)) continue;
      add("landmark", l.n, `Landmark on the ${l.b}`, [l.n], l.b, Atlas.boneOnExam(l.b), () => Atlas.go("anatomy", { lm: id }));
    }
    for (const j of Atlas.JOINTS) {
      add("joint", j.name, j.type || "Joint", [j.name], [...(j.ligaments || []), ...(j.movements || []), ...(j.bones || [])].join(" "), true,
        () => Atlas.go("anatomy", { joint: j.name }));
    }
    return out;
  }

  function loadFuse() {
    if (fuse !== null) return;
    fuse = false; // loading
    import(FUSE_URL).then(({ default: Fuse }) => {
      fuse = new Fuse(index, { keys: ["names"], threshold: 0.34, ignoreLocation: true, minMatchCharLength: 3, includeScore: true });
      if ($("#site-q").value.trim()) render();
    }).catch((err) => {
      /* Search still works without typo matching; the reason goes to the console. */
      console.error("Fuzzy search failed to load", err);
    });
  }

  /**
   * Ranked entries: exact hits (names before details), then close name matches. Words under
   * three letters ("li", "4") match names only, or "li 4" would hit every step 4 and LI mention.
   * Names also match with the spaces taken out, so "gallbladder" finds Gall Bladder.
   */
  function search(q) {
    const words = norm(q).split(/\s+/).filter(Boolean), whole = squash(q);
    const scored = [];
    for (const e of index) {
      const names = e.names.join(" ");
      const inNames = words.every((w) => names.includes(w)) || squash(names).includes(whole);
      const inAll = inNames || words.every((w) => names.includes(w) || (w.length > 2 && e.text.includes(w)));
      if (!inAll) continue;
      const code = e.names.some((n) => squash(n) === whole);
      const starts = e.names.some((n) => n.startsWith(words[0]));
      scored.push({ e, rank: code ? 0 : starts && inNames ? 1 : inNames ? 2 : 3 });
    }
    scored.sort((a, b) => a.rank - b.rank || a.e.label.length - b.e.label.length);
    const hits = scored.map((s) => ({ e: s.e, close: false }));
    /* Under four letters, nearly every name is "close"; short codes like "li4" match exactly instead. */
    if (fuse && whole.length >= 4) {
      const seen = new Set(hits.map((h) => h.e));
      for (const r of fuse.search(norm(q), { limit: 40 })) if (!seen.has(r.item)) hits.push({ e: r.item, close: true });
    }
    return hits;
  }

  let shown = [], active = -1;
  function render() {
    const q = $("#site-q").value.trim(), box = $("#site-results");
    if (q.length < 2) { close(); return; }
    const hits = search(q), groups = {};
    for (const h of hits) (groups[h.e.kind] ??= []).push(h);
    shown = [];
    const exam = Atlas.examOnly();
    const html = Object.keys(KINDS).filter((k) => groups[k]).map((k) => {
      const list = groups[k], more = list.length - PER_KIND;
      return `<div class="sr-group" role="group" aria-label="${KINDS[k]}"><h4>${KINDS[k]}</h4>${list.slice(0, PER_KIND).map((h) => {
        const i = shown.push(h) - 1;
        return `<div class="sr-item" role="option" id="sr-${i}" data-i="${i}" aria-selected="false">
          <span class="sr-label">${esc(h.e.label)}</span>
          <span class="sr-sub">${esc(h.e.sub || "")}${h.close ? ' <span class="sr-tag">close match</span>' : ""}${exam && !h.e.onExam ? ' <span class="sr-tag">Everything</span>' : ""}</span></div>`;
      }).join("")}${more > 0 ? `<p class="sr-more">${more} more; add a word to narrow it down</p>` : ""}</div>`;
    }).join("");
    box.innerHTML = html || `<p class="sr-none">Nothing matches "${esc(q)}". Try a point code like LI4, or part of a name.</p>`;
    box.hidden = false;
    $("#site-q").setAttribute("aria-expanded", "true");
    setActive(shown.length ? 0 : -1);
  }
  function setActive(i) {
    active = i;
    document.querySelectorAll("#site-results .sr-item").forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.i) === i)));
    const el = i >= 0 && document.getElementById("sr-" + i);
    $("#site-q").setAttribute("aria-activedescendant", el ? el.id : "");
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function close() {
    $("#site-results").hidden = true;
    $("#site-q").setAttribute("aria-expanded", "false");
    shown = [];
    active = -1;
  }
  function open(i) {
    const h = shown[i];
    if (!h) return;
    $("#site-q").value = "";
    close();
    $("#site-q").blur();
    h.e.go();
  }

  const input = $("#site-q");
  const ready = () => { index ??= build(); loadFuse(); };
  input.addEventListener("focus", ready);
  input.addEventListener("input", () => { ready(); render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && shown.length) { e.preventDefault(); setActive((active + 1) % shown.length); }
    else if (e.key === "ArrowUp" && shown.length) { e.preventDefault(); setActive((active - 1 + shown.length) % shown.length); }
    else if (e.key === "Enter") { e.preventDefault(); open(active); }
    else if (e.key === "Escape") { input.value = ""; close(); input.blur(); }
  });
  $("#site-results").addEventListener("mousedown", (e) => e.preventDefault()); // keep focus so the click lands
  $("#site-results").addEventListener("click", (e) => { const it = e.target.closest(".sr-item"); if (it) open(Number(it.dataset.i)); });
  input.addEventListener("blur", () => setTimeout(close, 0));
  /* "/" jumps to the search box from anywhere but a text field. */
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.target.matches("input, textarea, select, [contenteditable]")) { e.preventDefault(); input.focus(); }
  });
})();
