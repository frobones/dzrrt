/*
 * Bridge between the classic-script views and the 3D viewer module (viewer3d.js).
 *
 * Atlas.load3D(host, opts) loads the module on first use and builds a viewer in host,
 * showing a message in place when it can't. Atlas.Figure3D wraps that viewer in the
 * same methods as the 2D Atlas.Figure (showChannels, filterPoints, highlight, select,
 * zoomTo...), so a view can swap one for the other. Calls made while the model is
 * still loading are remembered and applied once it is ready.
 * Atlas.dim(tab) is that tab's 2D/3D choice; Atlas.setDim(tab, d) saves it and fires "dimchange".
 */
window.Atlas = window.Atlas || {};

(function () {
  const VIEWER_URL = new URL("viewer3d.js", document.currentScript.src).href;

  /*
   * Each tab remembers its own figure type. Atlas and Kata start flat: the 2D figures show front
   * and back at once, with flow dashes, labels and kata lines that 3D lacks. Anatomy starts in 3D.
   */
  const DEFAULT_DIM = { atlas: "2d", kata: "2d", anatomy: "3d" };
  Atlas.dim = (tab) => Atlas.store.get("dim:" + tab, DEFAULT_DIM[tab]);
  /** Save a tab's choice; "dimchange" on document carries {tab, dim}. */
  Atlas.setDim = (tab, d) => {
    if (d === Atlas.dim(tab)) return;
    Atlas.store.set("dim:" + tab, d);
    document.dispatchEvent(new CustomEvent("dimchange", { detail: { tab, dim: d } }));
  };

  /** Resolves to a viewer, or to null after showing why it couldn't load. viewer.loaded resolves true or false. */
  Atlas.load3D = async function (host, opts = {}) {
    let Viewer3D;
    try {
      ({ Viewer3D } = await import(VIEWER_URL));
    } catch (err) {
      console.error("3D viewer module failed to load", err);
      host.innerHTML = `<p class="v3d-status v3d-error">The 3D viewer couldn't load. Reload the page, or switch to the 2D view.</p>`;
      return null;
    }
    if (!host.isConnected) return null;
    const v = new Viewer3D(host, opts);
    v.loaded = v.ready.then(() => true, (err) => { v.fail(err); return false; });
    return v;
  };

  /* Region keys that are seen from behind; the rest frame the front of the body. */
  const BACK_REGIONS = new Set(["back", "upperBack"]);

  class Figure3D {
    /**
     * @param {HTMLElement} host
     * @param {{onPoint?: (id: string) => void, hlLabels?: boolean}} opts  hlLabels: name only highlighted points
     */
    constructor(host, opts = {}) {
      this.host = host;
      this.state = {
        layer: "primary", chans: null, pred: null, hlChs: [], hlPts: [], sel: null, focus: null,
        flow: true, labels: false, kataLines: false,
      };
      this.v = null;
      this.ready = Atlas.load3D(host, { onPoint: opts.onPoint, hlLabels: opts.hlLabels }).then((v) => {
        if (!v) return false;
        return v.loaded.then((ok) => {
          if (!ok) return false;
          this.v = v;
          v.showBody();
          this.flush();
          return true;
        });
      });
    }

    flush() {
      const v = this.v, s = this.state;
      if (!v) return;
      v.setBody({ channels: s.chans, pointFilter: s.pred, layer: s.layer, highlightChs: s.hlChs, highlightPts: s.hlPts, selected: s.sel });
      if (v.flowOn !== s.flow) v.setFlow(s.flow);
      v.setPointLabels(s.labels);
      v.setKataLines(s.kataLines);
      const f = s.focus;
      s.focus = null;
      if (!f) return;
      if (f.point) v.focusPoint(f.point);
      else if (f.full) v.view(f.full);
      else if (f.region) v.focusRegion(f.region, f.view);
    }

    setLayer(layer) { this.state.layer = layer; this.flush(); }
    showChannels(set) { this.state.chans = set ? new Set(set) : null; this.flush(); }
    filterPoints(pred) { this.state.pred = pred; this.flush(); }
    highlight(chs = [], pts = []) { this.state.hlChs = chs; this.state.hlPts = pts; this.flush(); }
    /** Selecting a point also turns the body to face it. */
    select(id) { this.state.sel = id; if (id) this.state.focus = { point: id }; this.flush(); }

    /** Accepts an Atlas.REGIONS box, as the 2D figure does. */
    zoomTo(box) {
      const key = Object.keys(Atlas.REGIONS).find((k) => Atlas.REGIONS[k] === box);
      if (!key || key === "full") this.state.focus = { full: "front" };
      else {
        const view = BACK_REGIONS.has(key) ? "back" : "front";
        this.state.focus = { region: Atlas.REG3D[key][view], view };
      }
      this.flush();
    }

    /**
     * Frame a kata step's region. Kata regions are drawn for the client's left side and
     * mirrored for the right (views.js regionFor); in 3D the client's left is +x.
     */
    focusKata(key, view, side) {
      const r = Atlas.REG3D[key];
      if (!r) return;
      const [x, y, z, rad] = r[view];
      const leftX = view === "back" ? x : -x;
      this.state.focus = { region: [side === "R" ? -leftX : side === "both" ? x : leftX, y, z, rad], view };
      this.flush();
    }

    setFlow(on) { this.state.flow = on; this.flush(); }
    setLabels(on) { this.state.labels = on; this.flush(); }
    /* The only overlay the 3D figure draws is the kata back lines. */
    clearOverlay() { this.state.kataLines = false; this.flush(); }
    drawKataLines() { this.state.kataLines = true; this.flush(); }

    dispose() { if (this.v) this.v.dispose(); }
  }
  Atlas.Figure3D = Figure3D;
})();
