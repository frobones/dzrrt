/*
 * Study view: four quiz modes built from the same point data.
 *   locate   - click where the point is on the body
 *   name     - name the highlighted point
 *   function - which point matches this description
 *   channel  - which channel a point belongs to
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

  Atlas.views.study = function () {
    const root = $("#view-study");
    const S = { mode: "locate", course: true, q: null, right: 0, total: 0, streak: 0, best: Atlas.store.get("best", 0), answered: false };
    root.innerHTML = `
      <p class="view-intro">Practice until the points feel obvious. Locate builds the map in your hands, Name and Channel build recall, and Function connects each point to what it does. Your best streak is saved in this browser.</p>
      <div class="study">
        <div class="stage">
          <div class="stage-bar">
            <div class="seg" id="mode">
              <button data-m="locate" aria-pressed="true">Locate</button><button data-m="name" aria-pressed="false">Name</button>
              <button data-m="function" aria-pressed="false">Function</button><button data-m="channel" aria-pressed="false">Channel</button>
            </div>
            <label class="toggle"><input type="checkbox" id="study-course" checked> Course points only</label>
          </div>
          <div class="figures" id="study-figs"><div id="sf-front"></div><div id="sf-back"></div></div>
        </div>
        <aside class="panel quiz-card" id="quiz"></aside>
      </div>`;
    const onBg = (x, y, fig) => answerLocate(x, y, fig);
    const figs = [new Atlas.Figure($("#sf-front"), "front", { onBackground: onBg }), new Atlas.Figure($("#sf-back"), "back", { onBackground: onBg })];

    const pool = () => Object.values(Atlas.POINTS).filter((p) => !S.course || Atlas.isCourse(p));
    function distractors(p, n, key) {
      const others = shuffle(pool().filter((q) => q.id !== p.id && key(q) !== key(p)));
      const seen = new Set([key(p)]), out = [];
      for (const q of others) { if (!seen.has(key(q))) { seen.add(key(q)); out.push(q); } if (out.length === n) break; }
      return out;
    }

    function next() {
      const ps = pool();
      let p = ps[Math.floor(Math.random() * ps.length)];
      if (S.q && ps.length > 1) while (p.id === S.q.p.id) p = ps[Math.floor(Math.random() * ps.length)];
      S.answered = false;
      const q = { p };
      figs.forEach((f) => f.svg.querySelectorAll(".pt-label").forEach((t) => (t.style.display = "")));
      figs.forEach((f) => { f.clearOverlay(); f.select(null); f.highlight([], []); f.zoomTo(Atlas.REGIONS.full, false); });
      $("#study-figs").hidden = false;
      figs.forEach((f) => f.svg.classList.toggle("hide-off", S.mode === "locate"));
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
        q.opts = shuffle([p, ...distractors(p, 3, (x) => x.id)]).map((o) => ({ ok: o.id === p.id, label: `${Atlas.code(o.id)} · ${o.en}` }));
      } else if (S.mode === "function") {
        $("#study-figs").hidden = true;
        const clues = [...(p.course || []).map((c) => c.t), ...p.fx].filter((t) => t.length > 18);
        q.prompt = "Which point is this?";
        q.sub = `“${esc(mask(clues[Math.floor(Math.random() * clues.length)] || p.fx[0], p))}”`;
        q.opts = shuffle([p, ...distractors(p, 3, (x) => x.id)]).map((o) => ({ ok: o.id === p.id, label: `${Atlas.code(o.id)} · ${o.en}` }));
      } else {
        $("#study-figs").hidden = true;
        if (!p.ch) return next();
        q.prompt = `Which channel is <b class="mono">${esc(Atlas.code(p.id))}</b> (${esc(p.en)}) on?`;
        const chs = shuffle(Object.keys(Atlas.CHANNELS).filter((c) => c !== p.ch)).slice(0, 3);
        q.opts = shuffle([p.ch, ...chs]).map((c) => ({ ok: c === p.ch, label: `${Atlas.CHANNELS[c].name}${Atlas.CHANNELS[c].el ? ` (${Atlas.ELEMENTS[Atlas.CHANNELS[c].el].name})` : ""}` }));
      }
      S.q = q;
      renderCard();
    }

    function score(ok) {
      S.total++; if (ok) { S.right++; S.streak++; } else S.streak = 0;
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

    function answerOpt(i) {
      if (S.answered) return;
      const o = S.q.opts[i];
      score(o.ok);
      S.q.picked = i;
      S.q.fb = { ok: o.ok, t: o.ok ? "Correct." : `It was ${S.q.opts.find((x) => x.ok).label}.` };
      if (S.mode === "name") figs.forEach((f) => f.ptGroups && f.ptGroups[S.q.p.id] && f.ptGroups[S.q.p.id].querySelectorAll(".pt-label").forEach((t) => t.style.display = ""));
      renderCard();
    }

    function renderCard() {
      const q = S.q, p = q.p;
      const opts = q.opts ? `<div class="options">${q.opts.map((o, i) => {
        const cls = S.answered ? (o.ok ? "right" : q.picked === i ? "wrong" : "") : "";
        return `<button data-o="${i}" class="${cls}" ${S.answered ? "disabled" : ""}>${esc(o.label)}</button>`;
      }).join("")}</div>` : "";
      $("#quiz").innerHTML = `
        <div class="score"><div><b>${S.right}/${S.total}</b><span class="muted">correct</span></div><div><b>${S.streak}</b><span class="muted">streak</span></div><div><b>${S.best}</b><span class="muted">best</span></div></div>
        <div class="quiz-q">${q.prompt}</div>
        ${q.sub ? `<p style="margin:0">${q.sub}</p>` : ""}
        ${opts}
        ${S.answered ? `<div class="feedback ${q.fb.ok ? "ok" : "no"}">${esc(q.fb.t)}</div>
          <div class="d-section"><h4>${esc(Atlas.code(p.id))} ${esc(p.py)} · ${esc(p.en)}</h4><p style="margin:0">${esc(p.loc)}</p>
          ${p.course && p.course[0] ? `<div class="course-note">${esc(p.course[0].t)}<div class="src">${esc(p.course[0].ref)}</div></div>` : ""}
          <div><button class="pt" data-pt="${p.id}">Open ${esc(Atlas.code(p.id))} in the Atlas</button></div></div>` : ""}
        <div class="kata-nav"><button class="btn" id="q-next">${S.answered ? "Next question" : "Skip"}</button></div>`;
      $("#quiz").querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => answerOpt(Number(b.dataset.o))));
      $("#q-next").addEventListener("click", next);
    }

    $("#mode").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      S.mode = b.dataset.m;
      $("#mode").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      next();
    });
    $("#study-course").addEventListener("change", (e) => { S.course = e.target.checked; next(); });
    document.addEventListener("keydown", (e) => {
      if (!$("#view-study").classList.contains("active") || e.target.matches("input")) return;
      if (e.key === "Enter" && S.answered) next();
      if (S.q && S.q.opts && !S.answered && /^[1-4]$/.test(e.key)) answerOpt(Number(e.key) - 1);
    });
    next();
  };
})();
