/**
 * engine_sim.mjs — simulated observers through the three adaptive procedures, exactly as the experiment runs them
 * (Staircase + Interleaver, forced-50% identical pairs, clamp [.05, .7], cap 50 trials per staircase, QUEST stop rule
 * 5-95% width < .15). Reports bias / RMSE / 90%-interval coverage of the alpha estimate, trials used, and placement.
 *
 * Truth is a yes/no observer: P("different" | L) = FA + (1 - FA - lapse) * (1 - exp(-(L/alpha)^beta)), identical pair
 * -> P("different") = FA. The pooled-correctness curve has the same alpha (63.2% of its rise), so QUEST and Psi
 * (pooled feed) and QUEST+ (yes/no feed) are all judged against the same alpha. QUEST's own target is the .82 point of
 * its assumed curve; it is reported against L82 of the true pooled curve when that exists (asymptote > .82).
 *
 *   node tests/engine_sim.mjs [runsPerCell=20] [seed=1]
 */
import { Staircase, Interleaver, simulateObserver, weibull } from '../adaptive.js';

function mulberry32(a) { return function () { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const runsPerCell = parseInt(process.argv[2] || '20', 10);
const seed = parseInt(process.argv[3] || '1', 10);
const METHODS = (process.argv[4] || 'quest,psi,questplus').split(',');
const CFG = {
  quest: { maxTrials: 50, stopInterval: 0.15, firstLevel: 'quantile', quest: { tGuess: 0.1, tGuessSd: 0.3, pThreshold: 0.82, beta: 3.5, delta: 0.01, gamma: 0.5, grain: 0.01, range: null } },
  psi: { maxTrials: 50 },
  questplus: { maxTrials: 50 },
};
const alphas = [0.08, 0.15, 0.25, 0.40], betas = [2, 3.5], fas = [0.05, 0.20, 0.40], lapse = 0.02;

function L82(alpha, beta, fa) {                     // level where the true pooled curve .5 + .5(1-fa-lapse)W crosses .82
  const amp = 0.5 * (1 - fa - lapse); if (0.5 + amp <= 0.82) return NaN;
  return alpha * Math.pow(-Math.log(1 - 0.32 / amp), 1 / beta);
}
function fmt(x, d = 3) { return (x === null || Number.isNaN(x)) ? '   nan' : x.toFixed(d).padStart(6); }

const results = {};
let rngSeed = seed;
for (const method of METHODS) {
  results[method] = [];
  for (const alpha of alphas) for (const beta of betas) for (const fa of fas) {
    const truth = { alpha, beta, fa, lapse };
    for (let run = 0; run < runsPerCell; run++) {
      const rng = mulberry32(rngSeed++);
      const st = [0, 1].map(i => new Staircase({ method, label: 'shape_difference' + i, featureIndex: i, catchPolicy: 'forced50', minLevel: 0.05, maxLevel: 0.7, rng, ...CFG[method] }));
      const il = new Interleaver(st, { rng });
      let t; while ((t = il.next()) !== null) {
        const said = simulateObserver(t, truth, rng);
        t.staircase.addResponse({ level: t.level, isCatch: t.isCatch, saidDifferent: said });
      }
      for (const s of st) {
        const sm = s.summary(); const levels = s.trials.map(x => x.level);
        const target = method === 'quest' ? L82(alpha, beta, fa) : alpha;
        results[method].push({ alpha, beta, fa, target, est: sm.est_alpha, lo: sm.est_ci_lower, hi: sm.est_ci_upper, estFa: sm.est_fa, n: s.n,
          reason: s.finishedReason, ceil: levels.filter(l => l >= 0.7 - 1e-9).length / levels.length, floor: levels.filter(l => l <= 0.05 + 1e-9).length / levels.length,
          medLevel: levels.slice().sort((a, b) => a - b)[Math.floor(levels.length / 2)] });
      }
    }
  }
}

function cell(rows) {
  const ok = rows.filter(r => Number.isFinite(r.target));
  const err = ok.map(r => r.est - r.target);
  const bias = err.reduce((a, b) => a + b, 0) / (err.length || 1);
  const rmse = Math.sqrt(err.reduce((a, b) => a + b * b, 0) / (err.length || 1));
  const cov = ok.filter(r => r.lo <= r.target && r.target <= r.hi).length / (ok.length || 1);
  const n = rows.reduce((a, r) => a + r.n, 0) / rows.length;
  const ceil = rows.reduce((a, r) => a + r.ceil, 0) / rows.length, floor = rows.reduce((a, r) => a + r.floor, 0) / rows.length;
  const faBias = rows.every(r => r.estFa !== undefined) ? rows.reduce((a, r) => a + (r.estFa - r.fa), 0) / rows.length : NaN;
  return { bias, rmse, cov, n, ceil, floor, faBias, nOk: ok.length, nAll: rows.length };
}

console.log(`engine simulation: ${runsPerCell} runs x 2 staircases per cell, seed ${seed}\n`);
for (const method of METHODS) {
  console.log(`== ${method.toUpperCase()}  (bias / RMSE of est_alpha vs ${method === 'quest' ? 'L82 of the true pooled curve' : 'true alpha'}; cov = 90% interval coverage; n = trials per staircase)`);
  console.log('  alpha  beta   FA  |   bias    RMSE   cov     n   ceil  floor' + (method === 'questplus' ? '  FAbias' : ''));
  for (const alpha of alphas) for (const beta of betas) for (const fa of fas) {
    const c = cell(results[method].filter(r => r.alpha === alpha && r.beta === beta && r.fa === fa));
    console.log(`  ${fmt(alpha, 2)} ${fmt(beta, 1)} ${fmt(fa, 2)}  | ${fmt(c.bias)} ${fmt(c.rmse)} ${fmt(c.cov, 2)} ${fmt(c.n, 1)} ${fmt(c.ceil, 2)} ${fmt(c.floor, 2)}` + (method === 'questplus' ? ` ${fmt(c.faBias)}` : '') + (c.nOk < c.nAll ? `   (target undefined for ${c.nAll - c.nOk} staircases: asymptote below .82)` : ''));
  }
  const all = cell(results[method]);
  console.log(`  overall: bias ${fmt(all.bias)}  RMSE ${fmt(all.rmse)}  coverage ${fmt(all.cov, 2)}  mean n ${fmt(all.n, 1)}  ceiling ${fmt(all.ceil, 2)}  floor ${fmt(all.floor, 2)}\n`);
}
