/**
 * make_space_pool.mjs — generate a saved pool of screened feature spaces (checklist item 4/5).
 *
 *   node tests/make_space_pool.mjs [count=40] [seed=2026] [minRadius=0.05] > spaces_pool.json
 *
 * Reproduces the experiment's own generator (create_subspace with the two-component norm(), D = 4) with a seeded RNG,
 * applies the same screen as the experiment's redraw rule (minimum contour radius over the six corners of the reachable
 * support >= minRadius) and writes {id, origin, u, v, min_radius, gain_u, gain_v, draws_to_accept, seed}. Also reports
 * the acceptance rate on stderr. Set CONFIG.spaces.usePool = true and ship the file next to index.html.
 */
const count = parseInt(process.argv[2] || '40', 10), seed = parseInt(process.argv[3] || '2026', 10), minRadius = parseFloat(process.argv[4] || '0.05');
const CHECK = [[-0.2, 0.05], [-0.2, 0.95], [1.2, 0.05], [1.2, 0.95], [-0.325, 0.5], [1.325, 0.5]];
const D = 4, FULL_D_NORM = false;

function mulberry32(a) { return function () { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rng = mulberry32(seed);

// --- verbatim logic of the experiment's SetupCode block (JS translation of the Builder code) ---
function norm(vec) { if (FULL_D_NORM) return Math.sqrt(vec.reduce((a, x) => a + x * x, 0)); return Math.pow(vec[0] * vec[0] + vec[1] * vec[1], 0.5); }
function ones(D) { return Array(D).fill(1); }
function random_point(D) { const p = []; for (let i = 0; i < D; i++) p.push(rng()); return p; }
function dot(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
function vector_minus(a, b) { return a.map((x, i) => x - b[i]); }
function vector_plus(a, b) { return a.map((x, i) => x + b[i]); }
function scalar_product(r, v) { return v.map(x => r * x); }
function create_subspace(D) {
  const a = random_point(D), b = random_point(D), c = random_point(D);
  const projection_ca_onto_ba = scalar_product(dot(vector_minus(c, a), vector_minus(b, a)) / (norm(vector_minus(b, a)) * norm(vector_minus(b, a))), vector_minus(b, a));
  const p = vector_plus(a, projection_ca_onto_ba);
  const u = scalar_product(1 / norm(vector_minus(b, p)), vector_minus(b, p));
  const v = scalar_product(1 / norm(vector_minus(c, p)), vector_minus(c, p));
  const O = scalar_product(0.5, ones(D));
  const maximum_distance_from_center = 0.2;
  const new_origin = vector_plus(O, scalar_product((rng() * maximum_distance_from_center) / norm(vector_minus(p, O)), vector_minus(p, O)));
  return [new_origin, u, v];
}
function min_contour_radius(subspace, coords) {
  const [o, u, v] = subspace; const N = 50; let m = 10;
  for (const [x, y] of coords) {
    const par = vector_plus(vector_plus(o, scalar_product(x, u)), scalar_product(y, v));
    for (let i = 0; i < N; i++) { let dev = 0; for (let k = 0; k < par.length; k++) dev += 0.1 * par[k] * Math.sin(k * (i - 1) * (2 * 3.14159265359 / N)); if (0.3 + dev < m) m = 0.3 + dev; }
  }
  return m;
}
const gain = vec => Math.sqrt(vec.slice(1).reduce((a, x) => a + x * x, 0));

const spaces = []; let draws = 0;
while (spaces.length < count) {
  let n = 0, sp, r;
  do { sp = create_subspace(D); r = min_contour_radius(sp, CHECK); n++; draws++; } while (!(isFinite(r) && r >= minRadius));
  spaces.push({ id: spaces.length + 1, origin: sp[0], u: sp[1], v: sp[2], min_radius: r, gain_u: gain(sp[1]), gain_v: gain(sp[2]), draws_to_accept: n });
}
process.stderr.write(`${count} spaces from ${draws} draws (acceptance ${(100 * count / draws).toFixed(1)}%), seed ${seed}, minRadius ${minRadius}, norm ${FULL_D_NORM ? 'full-D' : '2-component'}\n`);
process.stdout.write(JSON.stringify({ generated: new Date().toISOString(), seed, minRadius, checkCoords: CHECK, norm: FULL_D_NORM ? 'fullD' : '2component', spaces }, null, 1));
