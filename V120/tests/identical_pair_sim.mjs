/**
 * identical_pair_sim.mjs — one observer, several false-alarm rates, three ways of feeding the staircase.
 * Same engine code as the experiment (Staircase + Interleaver, forced-50% identical pairs, clamp [.05, .7], 50 trials cap).
 *   quest      : identical pair scored right/wrong at the nominal level (the live v1.1.5 setting)
 *   psi        : same feed; pooled-correctness model with a free asymptote (the package's Psi)
 *   questplus  : identical pair entered at level 0 as a "different"/"same" answer; false-alarm rate is a model parameter
 *                (= "Psi with the identical-pair fix": same Bayesian machinery, yes/no model)
 *   node tests/identical_pair_sim.mjs [runsPerCell=60] [seed=7] > out.json
 */
import { Staircase, Interleaver, simulateObserver } from '../adaptive.js';
function mulberry32(a) { return function () { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const runsPerCell = parseInt(process.argv[2] || '60', 10), seed = parseInt(process.argv[3] || '7', 10);
const CFG = {
  quest: { maxTrials: 50, stopInterval: 0.15, firstLevel: 'quantile', quest: { tGuess: 0.1, tGuessSd: 0.3, pThreshold: 0.82, beta: 3.5, delta: 0.01, gamma: 0.5, grain: 0.1, range: null } },
  psi: { maxTrials: 50 }, questplus: { maxTrials: 50 } };
const ALPHA = 0.10, BETA = 3.5, LAPSE = 0.02, FAS = [0.05, 0.20, 0.35, 0.50, 0.65];
const out = { alpha: ALPHA, beta: BETA, lapse: LAPSE, fas: FAS, runs: runsPerCell, cells: [] };
let s = seed;
for (const method of ['quest', 'psi', 'questplus']) for (const fa of FAS) {
  const cell = { method, fa, est: [], ceil: [], n: [], estFa: [], tracks: [] };
  for (let run = 0; run < runsPerCell; run++) {
    const rng = mulberry32(s++);
    const st = [0, 1].map(i => new Staircase({ method, label: 'shape_difference' + i, featureIndex: i, catchPolicy: 'forced50', minLevel: 0.05, maxLevel: 0.7, rng, ...CFG[method] }));
    const il = new Interleaver(st, { rng }); let t;
    while ((t = il.next()) !== null) { const said = simulateObserver(t, { alpha: ALPHA, beta: BETA, fa, lapse: LAPSE }, rng); t.staircase.addResponse({ level: t.level, isCatch: t.isCatch, saidDifferent: said }); }
    for (const sc of st) {
      const sm = sc.summary(); const lv = sc.trials.map(x => x.level);
      cell.est.push(sm.est_alpha); cell.n.push(sc.n); cell.ceil.push(lv.filter(l => l >= 0.7 - 1e-9).length / lv.length); cell.estFa.push(sm.est_fa === undefined ? null : sm.est_fa);
      if (run === 0 && sc.featureIndex === 0) cell.tracks.push(sc.trials.map(x => ({ level: x.level, catch: x.isCatch ? 1 : 0, said: x.saidDifferent ? 1 : 0, correct: x.correct ? 1 : 0, est: x.est_alpha })));
    }
  }
  out.cells.push(cell); process.stderr.write(`${method} fa ${fa} done\n`);
}
process.stdout.write(JSON.stringify(out));
