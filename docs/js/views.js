/*
 * Secondary views: Kata walkthrough, Body Clock, Five Phases, Depth and Pain, Study.
 * Each init function renders once, the first time its tab opens.
 */
window.Atlas = window.Atlas || {};
Atlas.views = Atlas.views || {};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => Atlas.esc(s);

  /* Mirror a region box for the client's right side or a supine (front) view. */
  function regionFor(step, view) {
    const box = Atlas.REGIONS[step.r].slice();
    const flip = (view === "front") !== (step.side === "R");
    if (flip && step.side !== "both") box[0] = 300 - box[0] - box[2];
    return box;
  }

  /* ---------- Kata ---------- */
  Atlas.views.kata = function () {
    const root = $("#view-kata");
    const groups = Atlas.KATA_GROUPS.map((g) => `<h4>${esc(g.name)}</h4>` + Atlas.KATA.map((s, i) => s.g === g.id
      ? `<button data-i="${i}"><span class="n">${esc(s.n)}</span><span>${esc(s.t)}</span></button>` : "").join("")).join("");
    root.innerHTML = `
      <p class="view-intro">Walk through the 60-step kata in order. Each step zooms to where your hands are and lights up the channels and points underneath them. Use the arrow keys or the Play button. Step names follow the handbook (2.35-2.47); notes are summaries.</p>
      <div class="kata">
        <nav class="panel kata-list" id="kata-list" aria-label="Kata steps">${groups}</nav>
        <div class="kata-figure" id="kata-fig"></div>
        <aside class="panel kata-card" id="kata-card"></aside>
      </div>`;
    let i = 0, timer = null, fig = null, figView = null;

    function render() {
      const s = Atlas.KATA[i];
      const grp = Atlas.KATA_GROUPS.find((g) => g.id === s.g);
      const view = s.v || (grp.pos === "prone" ? "back" : "front");
      if (view !== figView) { fig = new Atlas.Figure($("#kata-fig"), view, { onPoint: (id) => Atlas.go("atlas", id) }); figView = view; fig.svg.classList.add("labels-hl-only"); }
      fig.clearOverlay();
      if (s.lines) fig.drawKataLines();
      fig.highlight(s.ch, s.pts);
      fig.filterPoints((p) => s.pts.includes(p.id) || s.ch.includes(p.ch));
      fig.zoomTo(regionFor(s, view));
      root.querySelectorAll("#kata-list button").forEach((b) => b.setAttribute("aria-current", Number(b.dataset.i) === i ? "true" : "false"));
      const cur = root.querySelector(`#kata-list button[data-i="${i}"]`);
      if (cur) {
        /* Scroll only the step list, never the page. */
        const list = $("#kata-list"), lr = list.getBoundingClientRect(), cr = cur.getBoundingClientRect();
        if (cr.top < lr.top || cr.bottom > lr.bottom) list.scrollTop += cr.top - lr.top - list.clientHeight / 2;
      }
      const side = { L: "Client's left side", R: "Client's right side", both: "Both sides / midline" }[s.side];
      $("#kata-card").innerHTML = `
        <div class="progress"><span style="width:${((i + 1) / Atlas.KATA.length) * 100}%"></span></div>
        <div class="eyebrow">${esc(grp.name)}</div>
        <div style="display:flex;gap:14px;align-items:end"><div class="kata-num">${esc(s.n)}</div><h2 style="font-size:22px">${esc(s.t)}</h2></div>
        <div class="chips"><span class="chip">${grp.pos === "prone" ? "Prone" : "Supine"}</span><span class="chip">${side}</span><span class="chip mono">Handbook ${esc(s.ref)}</span></div>
        <p style="margin:0">${esc(s.note)}</p>
        ${s.ch.length ? `<div class="d-section"><h4>Channels under your hands</h4><div class="chips">${s.ch.map((c) => `<span class="chip" style="color:${Atlas.elColor(c)}"><span class="dot"></span>${esc(Atlas.CHANNELS[c].name)}</span>`).join("")}</div></div>` : ""}
        ${s.pts.length ? `<div class="d-section"><h4>Points</h4><div>${s.pts.map((id) => `${Atlas.ptLink(id)} <span class="muted">${esc(Atlas.POINTS[id].en)}</span>`).join("<br>")}</div></div>` : ""}
        <div class="kata-nav">
          <button class="btn ghost" id="k-prev" ${i === 0 ? "disabled" : ""}>← Previous</button>
          <button class="btn" id="k-play">${timer ? "Pause" : "Play"}</button>
          <button class="btn ghost" id="k-next" ${i === Atlas.KATA.length - 1 ? "disabled" : ""}>Next →</button>
        </div>
        <p class="muted" style="font-size:12.5px;margin:0">Remember the pre-session interview and contraindications (2.7-2.19). For a pregnant client: no Long Life points, no deep pressure, no prone or supine after 13 weeks (2.33).</p>`;
      $("#k-prev").onclick = () => go(i - 1);
      $("#k-next").onclick = () => go(i + 1);
      $("#k-play").onclick = () => {
        if (timer) { clearInterval(timer); timer = null; }
        else timer = setInterval(() => { if (i >= Atlas.KATA.length - 1) { clearInterval(timer); timer = null; render(); } else go(i + 1); }, 3200);
        render();
      };
    }
    function go(n) {
      i = Math.max(0, Math.min(Atlas.KATA.length - 1, n));
      history.replaceState(null, "", "#kata-" + i);
      render();
    }
    Atlas.kataGo = (n) => { if (!Number.isNaN(n)) go(n); };
    $("#kata-list").addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) go(Number(b.dataset.i)); });
    document.addEventListener("keydown", (e) => {
      if (!$("#view-kata").classList.contains("active") || e.target.matches("input, textarea")) return;
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    });
    render();
  };

  /* ---------- Body clock ---------- */
  Atlas.views.clock = function () {
    const root = $("#view-clock");
    root.innerHTML = `
      <p class="view-intro">Qi and Blood circulate through the twelve primary channels once a day, two hours in each, starting in the Lung at 3am (Handbook 3.31-3.32). Each channel hands its Qi to the next, alternating Yin and Yang, arm and leg. Click a segment to follow the circuit.</p>
      <div class="two-col clock">
        <div class="panel"><svg id="clock-svg" viewBox="-210 -210 420 420" role="img" aria-label="24-hour channel clock"></svg></div>
        <div style="display:grid;gap:16px">
          <div class="panel" id="clock-card"></div>
          <div class="mini-figs"><div id="clock-front"></div><div id="clock-back"></div></div>
        </div>
      </div>`;
    const svg = $("#clock-svg");
    const figs = [new Atlas.Figure($("#clock-front"), "front", { points: false, zoom: false }), new Atlas.Figure($("#clock-back"), "back", { points: false, zoom: false })];
    const R1 = 190, R0 = 120;
    /* Hour to polar position: midnight at the top, 6am at the right, noon at the bottom. */
    const pol = (h, r) => { const a = (h / 24) * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; };
    let html = "";
    Atlas.HORARY.forEach((c, i) => {
      const ch = Atlas.CHANNELS[c];
      const a = ch.time[0], b = a + 2;
      const [x0, y0] = pol(a, R1), [x1, y1] = pol(b, R1), [x2, y2] = pol(b, R0), [x3, y3] = pol(a, R0);
      const [tx, ty] = pol(a + 1, (R0 + R1) / 2);
      html += `<g class="seg-path" data-ch="${c}" tabindex="0" role="button" aria-label="${ch.name} ${Atlas.fmtTime(ch.time)}">
        <path d="M${x0},${y0} A${R1},${R1} 0 0 1 ${x1},${y1} L${x2},${y2} A${R0},${R0} 0 0 0 ${x3},${y3}Z" fill="${Atlas.elColor(c)}" opacity="${ch.yy === "yin" ? 0.95 : 0.6}" stroke="var(--surface)" stroke-width="2"/>
        <text x="${tx}" y="${ty - 3}" text-anchor="middle" style="fill:var(--surface);font-weight:600;font-size:15px">${c}</text>
        <text x="${tx}" y="${ty + 12}" text-anchor="middle" style="fill:var(--surface);font-size:9px">${Atlas.fmtTime(ch.time)}</text></g>`;
    });
    for (let h = 0; h < 24; h += 3) {
      const [x, y] = pol(h, R1 + 12);
      html += `<text x="${x}" y="${y + 4}" text-anchor="middle" style="fill:var(--muted);font-size:10px">${h === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? h + "am" : h - 12 + "pm"}</text>`;
    }
    html += `<circle r="${R0 - 6}" fill="var(--surface-2)"/><g id="clock-center"></g><line id="clock-hand" x1="0" y1="0" x2="0" y2="-${R0 - 10}" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/><circle r="5" fill="var(--ink)"/>`;
    svg.innerHTML = html;

    function nowCh() {
      const h = new Date().getHours();
      return Atlas.HORARY.find((c) => { const [a] = Atlas.CHANNELS[c].time; return h === a || h === (a + 1) % 24; });
    }
    function setHand() {
      const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
      const [x, y] = pol(h, R0 - 10);
      $("#clock-hand").setAttribute("x2", x); $("#clock-hand").setAttribute("y2", y);
    }
    function pick(c) {
      const ch = Atlas.CHANNELS[c], idx = Atlas.HORARY.indexOf(c);
      const prev = Atlas.HORARY[(idx + 11) % 12], next = Atlas.HORARY[(idx + 1) % 12], opp = Atlas.HORARY[(idx + 6) % 12];
      svg.querySelectorAll(".seg-path").forEach((g) => g.style.opacity = g.dataset.ch === c ? 1 : 0.45);
      $("#clock-center").innerHTML = `<text y="-18" text-anchor="middle" style="font-family:var(--f-display);font-size:30px;fill:var(--ink)">${esc(ch.hz)}</text>
        <text y="10" text-anchor="middle" style="font-size:12px;fill:var(--ink)">${esc(ch.name)}</text><text y="28" text-anchor="middle" style="font-size:10px;fill:var(--muted)">${esc(ch.limb)} ${esc(ch.div)}</text>`;
      const pts = Object.values(Atlas.POINTS).filter((p) => p.ch === c);
      $("#clock-card").innerHTML = `
        <div class="eyebrow">${Atlas.fmtTime(ch.time)}${c === nowCh() ? " · active now" : ""}</div>
        <div class="big-stat" style="color:${Atlas.elColor(c)}">${esc(ch.name)} ${esc(ch.hz)}</div>
        <p style="margin:0">${esc(ch.organ)}</p>
        <div class="d-section"><h4>Where it sits in the circuit</h4>
          <ul><li>Receives Qi from <button class="chip" data-clock="${prev}">${prev} ${esc(Atlas.CHANNELS[prev].name)}</button></li>
          <li>Passes Qi to <button class="chip" data-clock="${next}">${next} ${esc(Atlas.CHANNELS[next].name)}</button></li>
          <li>Opposite on the clock (12 hours away): <button class="chip" data-clock="${opp}">${opp} ${esc(Atlas.CHANNELS[opp].name)}</button> <span class="tag-outside">general TCM</span></li>
          <li>Paired channel (same element): <button class="chip" data-clock="${ch.pair}">${ch.pair} ${esc(Atlas.CHANNELS[ch.pair].name)}</button></li></ul></div>
        <div class="d-section"><h4>Direction</h4><p style="margin:0">${direction(ch)}</p></div>
        <div class="d-section"><h4>Points on this channel</h4><div class="chips">${pts.map((p) => `<button class="chip" data-pt="${p.id}">${esc(Atlas.code(p.id))}</button>`).join("")}</div></div>`;
      figs.forEach((f) => { f.highlight([c], []); f.showChannels(new Set([c])); });
    }
    function direction(ch) {
      const arms = "With the hands raised above the head, Yin channels flow up from earth toward heaven and Yang channels flow down (3.31).";
      if (ch.limb === "Arm" && ch.yy === "yin") return "Chest to fingers. " + arms;
      if (ch.limb === "Arm") return "Fingers to face. " + arms;
      if (ch.yy === "yang") return "Face to toes. " + arms;
      return "Toes to chest. " + arms;
    }
    svg.addEventListener("click", (e) => { const g = e.target.closest(".seg-path"); if (g) pick(g.dataset.ch); });
    svg.addEventListener("keydown", (e) => { const g = e.target.closest(".seg-path"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(g.dataset.ch); } });
    root.addEventListener("click", (e) => { const b = e.target.closest("[data-clock]"); if (b) pick(b.dataset.clock); });
    setHand(); setInterval(setHand, 60000);
    pick(nowCh());
  };

  /* ---------- Five Phases ---------- */
  Atlas.views.phases = function () {
    const root = $("#view-phases");
    const P = Atlas.PHASES;
    root.innerHTML = `
      <p class="view-intro">The Five Phases describe change: each phase nourishes the next around the circle (Sheng, mother to child) and restrains the one across the star (Ko, grandmother to grandchild). Click a phase to see its organs, points, emotion, and how the class handout treats that emotion with DZRRT. Be ready to draw this diagram on the exam (3.5).</p>
      <div class="two-col phases">
        <div class="panel">
          <div class="seg" id="cycle" style="margin-bottom:8px"><button data-c="both" aria-pressed="true">Both cycles</button><button data-c="sheng" aria-pressed="false">Sheng (nourish)</button><button data-c="ko" aria-pressed="false">Ko (control)</button></div>
          <svg id="phase-svg" viewBox="-200 -195 400 390" role="img" aria-label="Five Phases diagram"></svg>
        </div>
        <div class="panel" id="phase-card"></div>
      </div>
      <div class="panel" style="margin-top:16px"><h3 style="font-size:20px;margin-bottom:8px">Correspondences</h3>
        <div class="table-wrap"><table class="phase-table" id="phase-table"></table></div><div class="src" style="margin-top:6px">${esc(P.ref)}</div></div>`;
    const R = 140, pos = {};
    P.order.forEach((k, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; pos[k] = [Math.cos(a) * R, Math.sin(a) * R]; });
    const arrow = (a, b, cls, curve) => {
      const [x0, y0] = pos[a], [x1, y1] = pos[b];
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const sx = x0 + ux * 38, sy = y0 + uy * 38, ex = x1 - ux * 42, ey = y1 - uy * 42;
      const mx = (sx + ex) / 2 + (curve ? -uy * curve : 0), my = (sy + ey) / 2 + (curve ? ux * curve : 0);
      return `<path class="arrow ${cls}" data-from="${a}" data-to="${b}" d="M${sx},${sy} Q${mx},${my} ${ex},${ey}" marker-end="url(#ah-${cls})"/>`;
    };
    let h = `<defs>${["sheng", "ko"].map((c) => `<marker id="ah-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" fill="${c === "sheng" ? "var(--ink)" : "var(--fire)"}"/></marker>`).join("")}</defs>`;
    P.order.forEach((k, i) => { h += arrow(k, P.order[(i + 1) % 5], "sheng", 30); });
    P.order.forEach((k, i) => { h += arrow(k, P.order[(i + 2) % 5], "ko", 0); });
    P.order.forEach((k) => {
      const [x, y] = pos[k], e = Atlas.ELEMENTS[k];
      h += `<g class="phase-node" data-el="${k}" tabindex="0" role="button" aria-label="${e.name}"><circle cx="${x}" cy="${y}" r="34" fill="var(${e.color})"/>
        <text x="${x}" y="${y + 2}" text-anchor="middle" style="fill:var(--surface);font-size:24px">${e.hz}</text>
        <text x="${x}" y="${y + 18}" text-anchor="middle" style="fill:var(--surface);font-size:10px;font-family:var(--f-body);font-weight:600">${e.name}</text></g>`;
    });
    $("#phase-svg").innerHTML = h + `<style>#phase-svg .sheng{stroke:var(--ink)} #phase-svg .ko{stroke:var(--fire);stroke-dasharray:5 4}</style>`;

    function setCycle(c) {
      root.querySelectorAll("#cycle button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.c === c ? "true" : "false"));
      root.querySelectorAll("#phase-svg .sheng").forEach((p) => p.style.display = c === "ko" ? "none" : "");
      root.querySelectorAll("#phase-svg .ko").forEach((p) => p.style.display = c === "sheng" ? "none" : "");
    }
    $("#cycle").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setCycle(b.dataset.c); });

    function pick(k) {
      const i = P.order.indexOf(k), e = Atlas.ELEMENTS[k], em = P.emotions[k], org = P.organs[k];
      const name = (x) => Atlas.ELEMENTS[x].name;
      root.querySelectorAll("#phase-svg .arrow").forEach((a) => a.style.opacity = a.dataset.from === k || a.dataset.to === k ? 1 : 0.18);
      root.querySelectorAll("#phase-svg .phase-node").forEach((g) => g.style.opacity = g.dataset.el === k ? 1 : 0.75);
      const chs = [org.yin, org.yang, org.yin2, org.yang2].filter(Boolean);
      const src = Object.values(Atlas.POINTS).filter((p) => chs.includes(p.ch) && p.cats.includes("source"));
      $("#phase-card").innerHTML = `
        <div class="eyebrow">Phase</div>
        <div class="big-stat" style="color:var(${e.color})">${e.hz} ${e.name}</div>
        <ul style="margin:0;padding-left:18px">
          <li>Nourishes <b>${name(P.order[(i + 1) % 5])}</b>, is nourished by <b>${name(P.order[(i + 4) % 5])}</b></li>
          <li>Controls <b>${name(P.order[(i + 2) % 5])}</b>, is controlled by <b>${name(P.order[(i + 3) % 5])}</b></li></ul>
        <div class="d-section"><h4>Organs and channels</h4><div class="chips">${chs.map((c) => `<span class="chip" style="color:var(${e.color})"><span class="dot"></span>${c} ${esc(Atlas.CHANNELS[c].name)} (${Atlas.CHANNELS[c].yy})</span>`).join("")}</div></div>
        <div class="d-section"><h4>Source points</h4><div>${src.map((p) => `${Atlas.ptLink(p.id)} <span class="muted">${esc(p.en)}</span>`).join(" · ")}</div></div>
        <div class="d-section"><h4>Emotion: ${esc(em.e)}</h4><p style="margin:0">${esc(em.effect)}</p>
          <div class="course-note"><b>DZRRT approach.</b> ${esc(em.tx)} <b>Zone:</b> ${esc(em.zone)}. <b>Points:</b> ${em.pts.map(Atlas.ptLink).join(", ")}<div class="src">Pathogens and Emotions handout; Handbook 3.55</div></div></div>
        <div class="d-section"><h4>Personality type</h4><p style="margin:0">${esc(P.types[k])}</p><div class="src">Handbook 3.94-3.95</div></div>`;
      const t = $("#phase-table");
      t.querySelectorAll("td").forEach((td) => td.classList.toggle("on", Number(td.dataset.i) === i));
    }
    const tbl = `<thead><tr><th></th>${P.order.map((k) => `<th style="color:var(${Atlas.ELEMENTS[k].color})">${Atlas.ELEMENTS[k].name}</th>`).join("")}</tr></thead><tbody>
      ${P.rows.map((r) => `<tr><th>${esc(r[0])}</th>${r.slice(1).map((v, i) => `<td data-i="${i}">${esc(v)}</td>`).join("")}</tr>`).join("")}
      <tr><th>Yin organ</th>${P.order.map((k, i) => `<td data-i="${i}">${[P.organs[k].yin, P.organs[k].yin2].filter(Boolean).map((c) => Atlas.CHANNELS[c].name).join(", ")}</td>`).join("")}</tr>
      <tr><th>Yang organ</th>${P.order.map((k, i) => `<td data-i="${i}">${[P.organs[k].yang, P.organs[k].yang2].filter(Boolean).map((c) => Atlas.CHANNELS[c].name).join(", ")}</td>`).join("")}</tr></tbody>`;
    $("#phase-table").innerHTML = tbl;
    $("#phase-svg").addEventListener("click", (e) => { const g = e.target.closest(".phase-node"); if (g) pick(g.dataset.el); });
    $("#phase-svg").addEventListener("keydown", (e) => { const g = e.target.closest(".phase-node"); if (g && e.key === "Enter") pick(g.dataset.el); });
    setCycle("both");
    pick("wood");
  };

  /* ---------- Depth and pain ---------- */
  Atlas.views.depth = function () {
    const root = $("#view-depth");
    const chOpts = Object.keys(Atlas.CHANNELS).filter((c) => Atlas.CHANNELS[c].limb !== "Trunk")
      .map((c) => `<option value="${c}">${c} ${esc(Atlas.CHANNELS[c].name)}</option>`).join("");
    root.innerHTML = `
      <p class="view-intro">The Meridian Theory slides compare a channel to an ocean: shallow at the hands and feet, diving deep through the elbows and knees toward the organs, then rising again where it meets the next channel on the face or chest. A point in the shallows sends ripples along the whole channel (LI 4 treats the face); a point in the depths moves a deep current (ST 36 treats digestion).</p>
      <div class="two-col depth">
        <div class="panel">
          <label class="eyebrow" for="depth-ch">Channel</label>
          <select id="depth-ch" class="search" style="margin:4px 0 10px">${chOpts}</select>
          <svg id="depth-svg" viewBox="0 0 600 300" role="img" aria-label="Depth profile of the selected channel"></svg>
          <p class="muted" style="font-size:12.5px;margin:6px 0 0">Points are placed by where they sit on the limb or trunk. Click one to open it in the Atlas.</p>
        </div>
        <div class="panel"><h3 style="font-size:20px;margin-bottom:10px">Layers of the channel system</h3><div class="layer-list" id="layers"></div>
          <div class="src" style="margin-top:8px">Handbook 3.26-3.36; Meridian Theory part 1</div></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <h3 style="font-size:20px">Where there is flow, there is no pain</h3>
        <p class="muted" style="margin:4px 0 12px">Pain means Qi and Blood are not flowing, from excess (more common) or deficiency (Huang Di Nei Jing, Handbook 3.16; Types of Pain handout). Six kinds of pain, and how DZRRT approaches each:</p>
        <div class="pain-grid" id="pain"></div>
        <div class="two-col" style="margin-top:14px">
          <div class="pain-card"><h4>Deficient</h4><p style="margin:0">${esc(Atlas.PRESSURE.def)}</p></div>
          <div class="pain-card"><h4>Excess</h4><p style="margin:0">${esc(Atlas.PRESSURE.exc)}</p></div>
        </div>
        <div class="table-wrap" style="margin-top:14px"><table class="phase-table"><thead><tr><th>Yin</th><th>Yang</th><th>Yin signs</th><th>Yang signs</th></tr></thead>
          <tbody>${Atlas.EIGHT.map((r) => `<tr>${r.map((c, i) => `<td${i < 2 ? ' style="font-weight:600"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
        <div class="src" style="margin-top:6px">Handbook 3.48-3.49, 3.97; Types of Pain handout</div>
      </div>`;
    const colors = ["var(--metal)", "var(--wood)", "var(--earth)", "var(--water)", "var(--fire)", "var(--extra)"];
    $("#layers").innerHTML = Atlas.LAYERS.map((l, i) => `<div class="layer-item"><i style="background:${colors[i]};opacity:${1 - i * 0.1}"></i><div><b>${esc(l.k)}</b> <span class="muted">· ${esc(l.lvl)} level · ${esc(l.ref)}</span><br>${esc(l.note)}</div></div>`).join("");
    $("#pain").innerHTML = Atlas.PAIN.map((p) => `<div class="pain-card"><h4>${esc(p.k)} pain <span class="chip">${p.col === "yin" ? "Yin column" : "Yang column"}</span></h4>
      <div><span class="k">Feels</span> ${esc(p.feel)}</div><div><span class="k">Worse</span> ${esc(p.worse)}${p.better ? ` · <span class="k">Better</span> ${esc(p.better)}` : ""}</div><div>${esc(p.tx)}</div></div>`).join("");

    function draw(c) {
      const ch = Atlas.CHANNELS[c];
      const stops = ch.limb === "Arm"
        ? (ch.yy === "yin" ? ["d", "l", "j", "p", "t"] : ["d", "l", "j", "p", "n", "h"])
        : (ch.yy === "yang" ? ["d", "l", "j", "p", "t", "n", "h"] : ["d", "l", "j", "p", "t"]);
      const X = (i) => 40 + (i / (stops.length - 1)) * 520;
      const Y = (z) => 40 + (Atlas.ZONES[z].depth / 5) * 210;
      const pts = stops.map((z, i) => [X(i), Y(z)]);
      const curve = Atlas.catmull(pts, false);
      let h = `<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--water)" stop-opacity=".15"/><stop offset="1" stop-color="var(--water)" stop-opacity=".55"/></linearGradient></defs>
        <line x1="20" y1="40" x2="580" y2="40" stroke="var(--line)"/><text x="22" y="32" style="font-size:11px;fill:var(--muted)">Surface</text>
        <path d="${curve} L${X(stops.length - 1)},40 L${X(0)},40Z" fill="url(#sea)"/>
        <path d="${curve}" fill="none" stroke="${Atlas.elColor(c)}" stroke-width="2.5"/>`;
      stops.forEach((z, i) => { h += `<text x="${X(i)}" y="290" text-anchor="middle" style="font-size:10.5px;fill:var(--muted)">${esc(Atlas.ZONES[z].name.replace(" and ", " / "))}</text>`; });
      const list = Object.values(Atlas.POINTS).filter((p) => p.ch === c);
      const byZone = {};
      list.forEach((p) => { (byZone[p.z] = byZone[p.z] || []).push(p); });
      for (const z in byZone) {
        const si = stops.indexOf(z);
        if (si < 0) continue;
        const half = ((byZone[z].length - 1) / 2) * 34;
        const base = Math.min(Math.max(X(si), 24 + half), 576 - half);
        byZone[z].forEach((p, k) => {
          const x = base + k * 34 - half, y = Y(z);
          h += `<g data-dpt="${p.id}" style="cursor:pointer;color:${Atlas.pointColor(p)}"><line x1="${x}" y1="40" x2="${x}" y2="${y}" stroke="currentColor" stroke-dasharray="2 3" opacity=".5"/>
            <circle cx="${x}" cy="${y}" r="6" fill="${Atlas.isCourse(p) ? "currentColor" : "var(--surface)"}" stroke="currentColor" stroke-width="1.5"/>
            <text x="${x}" y="${y - 10}" text-anchor="middle" style="font:600 11px var(--f-mono);fill:var(--ink)">${esc(Atlas.code(p.id))}</text></g>`;
        });
      }
      h += `<text x="580" y="270" text-anchor="end" style="font-size:11px;fill:var(--muted)">Deep (organs)</text>`;
      $("#depth-svg").innerHTML = h;
    }
    $("#depth-ch").addEventListener("change", (e) => draw(e.target.value));
    $("#depth-svg").addEventListener("click", (e) => { const g = e.target.closest("[data-dpt]"); if (g) Atlas.go("atlas", g.dataset.dpt); });
    $("#depth-ch").value = "LI";
    draw("LI");
  };
})();
