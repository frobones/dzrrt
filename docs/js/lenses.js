/*
 * Two Lenses view: a bridge for people trained in Western medicine.
 * Sections: ground rules, frame shifts, translate a complaint (interactive),
 * muscles mapped to channels, and false-friend vocabulary.
 */
window.Atlas = window.Atlas || {};
Atlas.views = Atlas.views || {};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => Atlas.esc(s);
  const GEN = `<span class="tag-outside">general knowledge</span>`;
  const kataIndex = (n) => Atlas.KATA.findIndex((s) => s.n === n);

  Atlas.views.lenses = function () {
    const L = Atlas.LENSES;
    const root = $("#view-lenses");
    root.innerHTML = `
      <p class="view-intro">For anyone who learned the body through Western anatomy and medicine. This page doesn't ask you to give that up. It shows which habits of thought change, which familiar words mean something else, and how to ask the questions this system asks. Western statements the course doesn't make are marked ${GEN}.</p>

      <section class="lens-section">
        <h2>Before you start</h2>
        <div class="rule-grid">${L.rules.map((r) => `<div class="rule"><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p><div class="src">${esc(r.ref)}</div></div>`).join("")}</div>
      </section>

      <section class="lens-section">
        <h2>How the frame shifts</h2>
        <p class="muted lens-lede">Each card shows a habit of Western thinking and how the Eastern lens sees the same thing.</p>
        <div class="shift-list">${L.shifts.map((s) => `
          <article class="shift">
            <h3>${esc(s.k)}</h3>
            <div class="shift-cols">
              <div class="lens-w"><span class="eyebrow">Western habit</span>${s.wGen ? GEN : ""}<p>${esc(s.w)}</p></div>
              <div class="lens-arrow" aria-hidden="true">→</div>
              <div class="lens-e"><span class="eyebrow">Eastern lens</span><p>${esc(s.e)}</p><div class="src">${esc(s.ref)}</div></div>
            </div>
            <p class="shift-why">${esc(s.why)}</p>
          </article>`).join("")}</div>
      </section>

      <section class="lens-section">
        <h2>Translate a complaint</h2>
        <p class="muted lens-lede">Pick a common complaint. See how each lens describes it, then answer the questions an Eastern practitioner asks. The answers build a pattern that shapes the session. It is not a diagnosis.</p>
        <div class="chips" id="cmp-pick">${L.complaints.map((c, i) => `<button class="chip" data-c="${i}" aria-pressed="${i === 0}">${esc(c.name)}</button>`).join("")}</div>
        <div class="translate" id="cmp"></div>
      </section>

      <section class="lens-section">
        <h2>Muscles you know, channels that run over them</h2>
        <p class="muted lens-lede">The sinew channels follow real groups of muscles, so Western anatomy is a good way in. Pick a muscle to see which channels and points sit on it.</p>
        <div class="muscle-map">
          <div class="muscle-list" id="mus-list">${L.muscles.map((m, i) => `<button data-m="${i}" aria-pressed="${i === 0}">${esc(m.m)}</button>`).join("")}</div>
          <div id="mus-fig"></div>
          <div class="panel" id="mus-card"></div>
        </div>
      </section>

      <section class="lens-section">
        <h2>False friends</h2>
        <p class="muted lens-lede">Words you already know that mean something else here. The Western meanings are ${GEN}; the Eastern meanings cite the handbook.</p>
        <div class="term-grid">${L.terms.map((t) => `
          <div class="term"><h3>${esc(t.t)}</h3>
            <div><span class="eyebrow">Western</span><p>${esc(t.w)}</p></div>
            <div><span class="eyebrow">Eastern</span><p>${esc(t.e)}</p><div class="src">Handbook ${esc(t.ref)}</div></div></div>`).join("")}</div>
      </section>`;

    initComplaints(L);
    initMuscles(L);
  };

  /* ---------- Translate a complaint ---------- */
  function initComplaints(L) {
    let ci = 0, answers = {}, fig = null, figView = null;

    function render() {
      const c = L.complaints[ci];
      $("#cmp").innerHTML = `
        <div class="panel lens-views">
          <div><span class="eyebrow">Western lens</span>${c.westGen ? GEN : ""}<p>${esc(c.west)}</p><div class="src">${esc(c.westRef)}</div></div>
          <div><span class="eyebrow">Eastern lens</span><p>${esc(c.east)}</p><div class="src">${esc(c.eastRef)}</div></div>
        </div>
        <div class="panel lens-qs">
          <span class="eyebrow">Ask the client</span>
          ${c.qs.map((q, qi) => `<fieldset><legend>${esc(q.q)}</legend><div class="chips">${q.a.map((a, ai) =>
            `<button class="chip" data-q="${qi}" data-a="${ai}" aria-pressed="${answers[qi] === ai}">${esc(a.l)}</button>`).join("")}</div></fieldset>`).join("")}
          <button class="btn ghost" id="cmp-clear" type="button">Clear answers</button>
        </div>
        <div class="lens-result">
          <div id="cmp-fig"></div>
          <div class="panel" id="cmp-out"></div>
        </div>`;
      if (!fig || figView !== c.v || !$("#cmp-fig").childElementCount) {
        fig = new Atlas.Figure($("#cmp-fig"), c.v, { onPoint: (id) => Atlas.go("atlas", id) });
        figView = c.v;
        fig.svg.classList.add("hide-off");
      }
      const chs = [...new Set(c.pts.map((id) => Atlas.POINTS[id].ch).filter(Boolean))];
      fig.showChannels(new Set(chs));
      fig.filterPoints((p) => c.pts.includes(p.id));
      fig.highlight(chs, c.pts);
      fig.setLabels(true);
      fig.zoomTo(c.r);
      renderResult();
    }

    function renderResult() {
      const c = L.complaints[ci];
      const tags = Object.keys(answers).map((qi) => c.qs[qi].a[answers[qi]].tag).filter(Boolean);
      const found = tags.map((t) => L.tags[t]);
      $("#cmp-out").innerHTML = `
        <span class="eyebrow">The pattern so far</span>
        ${found.length
          ? `<ul class="pattern">${found.map((f) => `<li><b>${esc(f.k)}.</b> ${esc(f.d)}</li>`).join("")}</ul>`
          : `<p class="muted" style="margin:0">Answer the questions to build a picture. Each answer adds one piece and shows how it changes your approach.</p>`}
        <div class="d-section"><h4>Kata steps that address it</h4><div class="chips">${c.kata.map((n) => {
          const i = kataIndex(n); return i < 0 ? "" : `<button class="chip" data-kata="${i}">Step ${n} · ${esc(Atlas.KATA[i].t)}</button>`; }).join("")}</div></div>
        <div class="d-section"><h4>Points</h4><div>${c.pts.map((id) => `${Atlas.ptLink(id)} <span class="muted">${esc(Atlas.POINTS[id].en)}</span>`).join(" · ")}</div></div>
        <div class="caution"><b>When to refer or adapt.</b><ul>${c.refer.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
        <p class="muted" style="font-size:12.5px;margin:0">This pattern guides how you shape a session. A DZRRT bodyworker does not diagnose disease (Handbook 5.8).</p>`;
    }

    $("#cmp-pick").addEventListener("click", (e) => {
      const b = e.target.closest("[data-c]"); if (!b) return;
      ci = Number(b.dataset.c); answers = {};
      $("#cmp-pick").querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      render();
    });
    $("#cmp").addEventListener("click", (e) => {
      if (e.target.closest("#cmp-clear")) { answers = {}; render(); return; }
      const b = e.target.closest("[data-q]"); if (!b) return;
      const qi = Number(b.dataset.q), ai = Number(b.dataset.a);
      if (answers[qi] === ai) delete answers[qi]; else answers[qi] = ai;
      b.parentElement.querySelectorAll("[data-q]").forEach((x) => x.setAttribute("aria-pressed", answers[qi] === Number(x.dataset.a) ? "true" : "false"));
      renderResult();
    });
    render();
  }

  /* ---------- Muscles to channels ---------- */
  function initMuscles(L) {
    let fig = null, figView = null;
    function pick(i) {
      const m = L.muscles[i];
      $("#mus-list").querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.m) === i ? "true" : "false"));
      if (!fig || figView !== m.v) {
        fig = new Atlas.Figure($("#mus-fig"), m.v, { onPoint: (id) => Atlas.go("atlas", id) });
        figView = m.v;
        fig.svg.classList.add("hide-off");
      }
      fig.showChannels(new Set(m.ch));
      fig.filterPoints((p) => m.pts.includes(p.id));
      fig.highlight(m.ch, m.pts);
      fig.setLabels(true);
      fig.zoomTo(m.r);
      $("#mus-card").innerHTML = `
        <span class="eyebrow">Western structure</span>
        <h3 class="lens-muscle">${esc(m.m)}</h3>
        <p style="margin:0">${esc(m.d)}</p>
        <div class="src">${esc(m.ref)}</div>
        <div class="d-section"><h4>Channels</h4><div class="chips">${m.ch.map((c) => `<span class="chip" style="color:${Atlas.elColor(c)}"><span class="dot"></span>${esc(Atlas.CHANNELS[c].name)}</span>`).join("")}</div></div>
        <div class="d-section"><h4>Points</h4><div>${m.pts.map((id) => `${Atlas.ptLink(id)} <span class="muted">${esc(Atlas.POINTS[id].en)}</span>`).join("<br>")}</div></div>`;
    }
    $("#mus-list").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) pick(Number(b.dataset.m)); });
    pick(0);
  }
})();
