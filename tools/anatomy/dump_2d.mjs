/*
 * Dump the 2D figure data that project_2d.py lifts onto the 3D body.
 *
 *     node tools/anatomy/dump_2d.mjs > temp/proj/input.json
 *
 * Loads the site's classic data scripts in a sandbox and prints the point
 * positions, channel paths, kata zoom regions and kata back lines as JSON, plus the anatomy landmarks,
 * bones and joints that anatomy_3d.py places on the model.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../../docs/js/data/", import.meta.url));
const sandbox = { window: {} };
sandbox.window.Atlas = {};
sandbox.Atlas = sandbox.window.Atlas;
vm.createContext(sandbox);
for (const f of ["channels", "points-1", "points-2", "kata", "anatomy-bones"]) {
  vm.runInContext(readFileSync(root + f + ".js", "utf8"), sandbox, { filename: f + ".js" });
}
const A = sandbox.Atlas;

/* Each point once, from its primary view: `also` entries are the same spot seen from the other figure. */
const points = Object.values(A.POINTS).map((p) => ({ id: p.id, v: p.v, dx: p.dx, y: p.y, bilateral: Boolean(p.bilateral) }));
const channels = Object.fromEntries(Object.entries(A.CHANNELS).map(([code, c]) => [code, c.paths]));
const landmarks = Object.entries(A.LANDMARKS).map(([id, l]) => ({ id, dx: l.at[0], y: l.at[1] }));
process.stdout.write(JSON.stringify({
  points, channels, regions: A.REGIONS, kataLines: A.KATA_LINES,
  landmarks, bones: A.BONES.map((b) => b.name), joints: A.JOINTS.map((j) => j.name),
}));
