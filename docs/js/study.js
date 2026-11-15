/*
 * Study view: four quiz modes built from the same point data.
 *   locate   - click where the point is on the body
 *   name     - name the highlighted point
 *   function - which point matches this description
 *   channel  - which channel a point belongs to
 *
 * Questions are random by default. Deck mode instead deals every point in the pool
 * once, in shuffled order, and ends the round with a score and the points missed.
 */
window.Atlas = window.Atlas || {};
Atlas.views = Atlas.views || {};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => Atlas.esc(s);
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const HIT = 12; // figure units: about one thumb-width on the drawing

  /* Hide the point's own names so a description doesn't give the answer away. */
  function mask(text, p) {
    const ch = p.ch && Atlas.CHANNELS[p.ch];
    const num = (p.code || p.id).replace(/^[A-Z]+/, "");
    const words = [p.code, p.id, p.py, p.en, p.alt, ch && num && `${ch.name} ${num}`, ch && num && `${p.ch} ${num}`]
      .filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return words.reduce((t, w) => t.replace(new RegExp(`\\b${w}\\b`, "gi"), "____"), text);
  }

  /* Hide a channel's names too, for Channel questions. */
  function maskChannel(text, code) {
    const ch = Atlas.CHANNELS[code];
    const words = [ch.name, code, ...(ch.alias || "").split(/[\/,]/), ...ch.name.split(" ").filter((w) => w.length > 4)]
      .map((w) => w.trim()).filter(Boolean).sort((a, b) => b.length - a.length)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return words.reduce((t, w) => t.replace(new RegExp(`\\b${w}\\b`, "gi"), "____"), text);
  }

  Atlas.views.study = function () {
    const root = $("#view-study");
    const S = {
      mode: "locate", course: Atlas.examOnly(), q: null, right: 0, total: 0, streak: 0, best: Atlas.store.get("best", 0), answered: false,
      deckMode: Atlas.store.get("deck", false), deck: [], deckSize: 0, round: { right: 0, missed: [] }, done: false,
    };
    root.innerHTML = `
      <p class="view-intro">Practice until the points feel obvious. Locate builds the map in your hands, Name and Channel build recall, and Function connects each point to what it does. Turn on <b>Every point once</b> to work through the whole pool without repeats. Your best streak is saved in this browser.</p>
      <div class="study">
        <div class="stage">
          <div class="stage-bar">
            <div class="seg" id="mode">
              <button data-m="locate" aria-pressed="true">Locate</button><button data-m="name" aria-pressed="false">Name</button>
              <button data-m="function" aria-pressed="false">Function</button><button data-m="channel" aria-pressed="false">Channel</button>
            </div>
            <div class="chips" style="align-items:center;gap:14px">
              ${Atlas.scopeSwitch("Exam: quiz on the points the course names. Everything adds the classical points.")}
              <label class="toggle"><input type="checkbox" id="study-deck"> Every point once</label>
              <button class="btn ghost" id="study-reset" type="button">Reset score</button>
            </div>
          </div>
          <div class="figures" id="study-figs"><div id="sf-front"></div><div id="sf-back"></div></div>
        </div>
        <aside class="panel quiz-card" id="quiz"></aside>
      </div>`;
    const onBg = (x, y, fig) => answerLocate(x, y, fig);
    const figs = [new Atlas.Figure($("#sf-front"), "front", { onBackground: onBg, onPoint: (id) => answerPoint(id) }),
      new Atlas.Figure($("#sf-back"), "back", { onBackground: onBg, onPoint: (id) => answerPoint(id) })];

    /* Channel questions need a channel, so extra points sit that mode out. */
    const pool = () => Object.values(Atlas.POINTS).filter((p) => (!S.course || Atlas.isCourse(p)) && (S.mode !== "channel" || p.ch));

    /* Start a fresh deck from the current pool, or from a given list of point ids. */
    function newRound(ids) {
      S.deck = shuffle(ids ? ids.slice() : pool().map((p) => p.id));
      S.deckSize = S.deck.length;
      S.round = { right: 0, missed: [] };
      S.done = false;
      S.q = null;
    }
    function distractors(p, n, key) {
      const others = shuffle(pool().filter((q) => q.id !== p.id && key(q) !== key(p)));
      const seen = new Set([key(p)]), out = [];
      for (const q of others) { if (!seen.has(key(q))) { seen.add(key(q)); out.push(q); } if (out.length === n) break; }
      return out;
    }

    function pick() {
      if (S.deckMode) {
        /* A skipped point goes to the back of the deck so the round still covers it. */
        if (S.q && !S.answered) S.deck.push(S.q.p.id);
        return S.deck.length ? Atlas.POINTS[S.deck.shift()] : null;
      }
      const ps = pool();
      let p = ps[Math.floor(Math.random() * ps.length)];
      if (S.q && ps.length > 1) while (p.id === S.q.p.id) p = ps[Math.floor(Math.random() * ps.length)];
      return p;
    }

    function next() {
      const p = pick();
      if (!p) return renderSummary();
      S.answered = false;
      const q = { p };
      figs.forEach((f) => f.svg.querySelectorAll(".pt-label").forEach((t) => (t.style.display = "")));
      figs.forEach((f) => { f.clearOverlay(); f.select(null); f.highlight([], []); f.zoomTo(Atlas.REGIONS.full, false); });
      $("#study-figs").hidden = false;
      figs.forEach((f) => {
        f.setLabels(false);
        f.svg.classList.toggle("hide-off", S.mode !== "name");
        /* In Channel questions the dot's element color would hint at the answer, so it stays neutral until answered. */
        f.svg.classList.toggle("neutral-pts", S.mode === "channel");
      });
      if (S.mode === "locate") {
        figs.forEach((f) => { f.filterPoints(() => false); f.setLayer("primary"); f.showChannels(new Set()); });
        q.prompt = `Where is <b class="mono">${esc(Atlas.code(p.id))}</b>?`;
        q.sub = `${esc(p.py)} · ${esc(p.en)}${p.ch ? ` · ${esc(Atlas.CHANNELS[p.ch].name)} channel` : ""}. Click the spot on the front or back figure. Bilateral points count on either side.`;
      } else if (S.mode === "name") {
        const view = p.v, f = figs[view === "front" ? 0 : 1];
        figs.forEach((g) => { g.filterPoints((x) => x.id === p.id); g.showChannels(new Set(p.ch ? [p.ch] : [])); g.setLabels(false); });
        f.select(p.id);
        f.svg.classList.remove("show-labels");
        f.ptGroups[p.id].querySelectorAll(".pt-label").forEach((t) => t.style.display = "none");
        const [x, y] = Atlas.positions(p, view)[0];
        f.zoomTo([x - 45, y - 60, 90, 120]);
        q.prompt = "Which point is highlighted?";
        q.opts = shuffle([p, ...distractors(p, 3, (x) => x.id)]).map((o) => ({ ok: o.id === p.id, id: o.id, label: `${Atlas.code(o.id)} · ${o.en}` }));
      } else if (S.mode === "function") {
        /* Clues: course notes and actions in random order, then the location as the strongest hint. */
        const notes = shuffle([...(p.course || []).map((c) => c.t), ...p.fx].filter((t) => t.length > 18));
        q.clues = [...notes, `Location: ${p.loc}`].map((t) => mask(t, p));
        q.shown = Math.min(2, q.clues.length);
        q.prompt = "Which point is this?";
        q.sub = "Its four candidates are marked on the body. Hover an answer to see where it is.";
        q.opts = shuffle([p, ...distractors(p, 3, (x) => x.id)]).map((o) => ({ ok: o.id === p.id, id: o.id, label: `${Atlas.code(o.id)} · ${o.en}` }));
        const ids = q.opts.map((o) => o.id);
        const chs = [...new Set(ids.map((id) => Atlas.POINTS[id].ch).filter(Boolean))];
        figs.forEach((g) => { g.filterPoints((x) => ids.includes(x.id)); g.showChannels(new Set(chs)); g.setLabels(true); });
      } else {
        /* The point's code names its channel, so the question uses its pinyin and English names instead. */
        q.prompt = `Which channel is <b>${esc(p.py)}</b> (${esc(p.en)}) on?`;
        const chs = shuffle(Object.keys(Atlas.CHANNELS).filter((c) => c !== p.ch)).slice(0, 3);
        q.opts = shuffle([p.ch, ...chs]).map((c) => ({ ok: c === p.ch, ch: c, label: `${Atlas.CHANNELS[c].name}${Atlas.CHANNELS[c].el ? ` (${Atlas.ELEMENTS[Atlas.CHANNELS[c].el].name})` : ""}` }));
        const notes = shuffle([...(p.course || []).map((c) => c.t), ...p.fx].filter((t) => t.length > 18));
        q.clues = [`Location: ${p.loc}`, ...notes].map((t) => maskChannel(mask(t, p), p.ch));
        q.shown = Math.min(2, q.clues.length);
        q.sub = "The point is marked on the body with the four candidate channels drawn. Hover an answer to trace that channel.";
        figs.forEach((g) => {
          g.filterPoints((x) => x.id === p.id);
          g.showChannels(new Set(q.opts.map((o) => o.ch)));
          if (g.ptGroups[p.id]) g.ptGroups[p.id].querySelectorAll(".pt-label").forEach((t) => (t.style.display = "none"));
        });
      }
      S.q = q;
      renderCard();
    }

    function score(ok) {
      S.total++; if (ok) { S.right++; S.streak++; } else S.streak = 0;
      if (ok) S.round.right++; else S.round.missed.push(S.q.p.id);
      if (S.streak > S.best) { S.best = S.streak; Atlas.store.set("best", S.best); }
      S.answered = true;
    }

    function answerLocate(x, y, fig) {
      if (S.mode !== "locate" || S.answered) return;
      const p = S.q.p;
      const pos = Atlas.positions(p, fig.view);
      const d = pos.length ? Math.min(...pos.map(([px, py]) => Math.hypot(px - x, py - y))) : Infinity;
      const ok = d <= HIT;
      score(ok);
      fig.mark(x, y, ok ? "var(--good)" : "var(--bad)");
      figs.forEach((f) => {
        f.svg.classList.remove("hide-off");
        f.showChannels(new Set(p.ch ? [p.ch] : []));
        f.filterPoints((q) => q.id === p.id);
        f.select(p.id);
        f.highlight(p.ch ? [p.ch] : [], [p.id]);
      });
      S.q.fb = ok ? { ok, t: "Right on it." }
        : { ok, t: pos.length ? `About ${Math.max(1, Math.round(d * 0.27))} cm off at life size. It is the ringed dot.` : `This point is on the ${p.v} view. It is the ringed dot.` };
      renderCard();
    }

    /* Clicking a candidate point on the body answers a Function question. */
    function answerPoint(id) {
      if (S.mode !== "function" || S.answered || !S.q || !S.q.opts) return;
      const i = S.q.opts.findIndex((o) => o.id === id);
      if (i >= 0) answerOpt(i);
    }

    function answerOpt(i) {
      if (S.answered) return;
      const o = S.q.opts[i];
      score(o.ok);
      S.q.picked = i;
      S.q.fb = { ok: o.ok, t: o.ok ? "Correct." : `It was ${S.q.opts.find((x) => x.ok).label}.` };
      figs.forEach((f) => f.svg.classList.remove("neutral-pts"));
      if (S.mode === "function" || S.mode === "channel") figs.forEach((f) => { f.select(S.q.p.id); f.highlight(S.q.p.ch ? [S.q.p.ch] : [], [S.q.p.id]); });
      if (S.mode === "name" || S.mode === "channel") figs.forEach((f) => f.ptGroups && f.ptGroups[S.q.p.id] && f.ptGroups[S.q.p.id].querySelectorAll(".pt-label").forEach((t) => t.style.display = ""));
      renderCard();
    }

    function renderCard() {
      const q = S.q, p = q.p;
      const opts = q.opts ? `<div class="options">${q.opts.map((o, i) => {
        const cls = S.answered ? (o.ok ? "right" : q.picked === i ? "wrong" : "") : "";
        return `<button data-o="${i}" class="${cls}" ${S.answered ? "disabled" : ""}>${esc(o.label)}</button>`;
      }).join("")}</div>` : "";
      const seen = S.deckSize - S.deck.length;
      $("#quiz").innerHTML = `
        ${scoreHTML()}
        ${S.deckMode ? `<div class="d-section"><span class="eyebrow">Point ${seen} of ${S.deckSize}</span>
          <div class="progress"><span style="width:${(seen / S.deckSize) * 100}%"></span></div></div>` : ""}
        <div class="quiz-q">${q.prompt}</div>
        ${q.clues ? `<ol class="clues">${q.clues.slice(0, S.answered ? q.clues.length : q.shown).map((c) => `<li>${esc(c)}</li>`).join("")}</ol>
          ${!S.answered && q.shown < q.clues.length ? `<div><button class="btn ghost" id="q-clue" type="button">Show another clue</button></div>` : ""}` : ""}
        ${q.sub ? `<p style="margin:0"${q.clues ? ' class="muted"' : ""}>${q.sub}</p>` : ""}
        ${opts}
        ${S.answered ? `<div class="feedback ${q.fb.ok ? "ok" : "no"}">${esc(q.fb.t)}</div>
          <div class="d-section"><h4>${esc(Atlas.code(p.id))} ${esc(p.py)} · ${esc(p.en)}</h4><p style="margin:0">${esc(p.loc)}</p>
          ${p.course && p.course[0] ? `<div class="course-note">${esc(p.course[0].t)}<div class="src">${esc(p.course[0].ref)}</div></div>` : ""}
          <div><button class="pt" data-pt="${p.id}">Open ${esc(Atlas.code(p.id))} in the Atlas</button></div></div>` : ""}
        <div class="kata-nav"><button class="btn" id="q-next">${S.answered ? "Next question" : "Skip"}</button></div>`;
      $("#quiz").querySelectorAll("[data-o]").forEach((b) => {
        b.addEventListener("click", () => answerOpt(Number(b.dataset.o)));
        const o = q.opts[Number(b.dataset.o)];
        if (S.answered || !(o.id || o.ch)) return;
        /* Function answers light up a candidate point; Channel answers trace a candidate channel. */
        const on = () => figs.forEach((f) => (o.id ? f.highlight([], [o.id]) : f.highlight([o.ch], [q.p.id])));
        b.addEventListener("mouseenter", on);
        b.addEventListener("focus", on);
        b.addEventListener("mouseleave", () => figs.forEach((f) => f.highlight([], [])));
      });
      const clue = $("#q-clue");
      if (clue) clue.addEventListener("click", () => { q.shown++; renderCard(); });
      $("#q-next").addEventListener("click", next);
    }

    function scoreHTML() {
      return `<div class="score"><div><b>${S.right}/${S.total}</b><span class="muted">correct</span></div><div><b>${S.streak}</b><span class="muted">streak</span></div><div><b>${S.best}</b><span class="muted">best</span></div></div>`;
    }

    /* End of a deck round: score, the points missed, and what to do next. */
    function renderSummary() {
      S.done = true;
      S.q = null;
      figs.forEach((f) => { f.clearOverlay(); f.select(null); f.highlight([], []); f.filterPoints(() => true); f.showChannels(null); f.svg.classList.remove("hide-off"); });
      const missed = [...new Set(S.round.missed)];
      const pct = S.deckSize ? Math.round((S.round.right / S.deckSize) * 100) : 0;
      $("#quiz").innerHTML = `
        ${scoreHTML()}
        <div class="eyebrow">Round complete</div>
        <div class="quiz-q">${S.round.right} of ${S.deckSize} right (${pct}%)</div>
        ${missed.length
          ? `<div class="d-section"><h4>Missed (${missed.length})</h4><div class="chips">${missed.map((id) => `<button class="chip" data-pt="${id}">${esc(Atlas.code(id))} ${esc(Atlas.POINTS[id].en)}</button>`).join("")}</div></div>`
          : `<div class="feedback ok">A clean round. Every point right.</div>`}
        <div class="kata-nav">
          ${missed.length ? `<button class="btn" id="q-missed">Practice the ${missed.length} missed</button>` : ""}
          <button class="btn ${missed.length ? "ghost" : ""}" id="q-round">Start a new round</button>
        </div>`;
      const m = $("#q-missed");
      if (m) m.addEventListener("click", () => { newRound(missed); next(); });
      $("#q-round").addEventListener("click", () => { newRound(); next(); });
    }

    /* Clear the session counts and the saved best streak, and restart any deck. */
    function reset() {
      Object.assign(S, { right: 0, total: 0, streak: 0, best: 0 });
      Atlas.store.set("best", 0);
      if (S.deckMode) newRound();
      S.q = null;
      next();
    }

    $("#mode").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      S.mode = b.dataset.m;
      $("#mode").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      if (S.deckMode) newRound();
      next();
    });
    document.addEventListener("scopechange", (e) => { S.course = e.detail; if (S.deckMode) newRound(); next(); });
    $("#study-deck").checked = S.deckMode;
    $("#study-deck").addEventListener("change", (e) => {
      S.deckMode = e.target.checked;
      Atlas.store.set("deck", S.deckMode);
      if (S.deckMode) newRound();
      next();
    });
    $("#study-reset").addEventListener("click", reset);
    document.addEventListener("keydown", (e) => {
      if (!$("#view-study").classList.contains("active") || e.target.matches("input")) return;
      if (e.key === "Enter" && S.answered && !S.done) next();
      if (S.q && S.q.opts && !S.answered && /^[1-4]$/.test(e.key)) answerOpt(Number(e.key) - 1);
    });
    if (S.deckMode) newRound();
    next();
  };
})();
