/**
 * quest_parity.mjs — scripted-history parity cases for the QUEST engine (checklist item 2 / "QUEST wrapper contract").
 *
 *   node tests/quest_parity.mjs > tests/quest_parity_cases.json
 *
 * For two presets (online: grain .01, no range, prior-quantile first; lab: grain .1, range .65, startVal first) and a set
 * of scripted response histories (all correct, all incorrect, alternating, seeded mixed, pinned at the .05 floor, pinned at
 * the .70 ceiling), records at every step the engine's proposal, the clamped level fed to the update, and the posterior
 * mean / sd / mode / quantile / 5-95 % width and the stop decision. tests/quest_parity_psychopy.py replays the same
 * histories through PsychoPy's QuestHandler (on a machine that has PsychoPy) and compares to a declared tolerance.
 */
import { Quest } from '../adaptive.js';

function mulberry32(a) { return function () { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const PRESETS = {
  online: { tGuess: 0.1, tGuessSd: 0.3, pThreshold: 0.82, beta: 3.5, delta: 0.01, gamma: 0.5, grain: 0.01, range: null, firstLevel: 'quantile' },
  lab:    { tGuess: 0.1, tGuessSd: 0.3, pThreshold: 0.82, beta: 3.5, delta: 0.01, gamma: 0.5, grain: 0.1,  range: 0.65, firstLevel: 'startVal' },
};
const MIN = 0.05, MAX = 0.7, N = 50, STOP = 0.15;
const rng = mulberry32(7);
const HISTORIES = {
  all_correct: Array(N).fill(1),
  all_incorrect: Array(N).fill(0),
  alternating: Array.from({ length: N }, (_, i) => i % 2),
  mixed_seeded: Array.from({ length: N }, () => (rng() < 0.75 ? 1 : 0)),
  floor_pinned: { responses: Array(N).fill(1), forceLevel: MIN },      // engine proposals ignored: level fixed at the floor
  ceiling_pinned: { responses: Array(N).fill(0), forceLevel: MAX },
};
const cases = [];
for (const [preset, P] of Object.entries(PRESETS)) {
  for (const [name, h] of Object.entries(HISTORIES)) {
    const responses = Array.isArray(h) ? h : h.responses, force = Array.isArray(h) ? null : h.forceLevel;
    const q = new Quest(P);
    const steps = []; let finished = false;
    for (let k = 0; k < responses.length && !finished; k++) {
      const proposal = (k === 0 && P.firstLevel === 'startVal') ? P.tGuess : q.quantile();
      const level = force !== null ? force : Math.min(MAX, Math.max(MIN, proposal));
      q.update(level, responses[k] === 1);
      const width = q.confidenceWidth();
      finished = k + 1 >= N || width < STOP;
      steps.push({ k: k + 1, proposal, level, response: responses[k], mean: q.mean(), sd: q.sd(), mode: q.mode(), quantile: q.quantile(), ci_lower: q.quantile(0.05), ci_upper: q.quantile(0.95), width, finished });
    }
    cases.push({ preset, params: P, history: name, minVal: MIN, maxVal: MAX, maxTrials: N, stopInterval: STOP, steps });
  }
}
process.stdout.write(JSON.stringify({ generated: new Date().toISOString(), engine: 'adaptive.js Quest', tolerance: 1e-6, cases }, null, 1));
process.stderr.write(`${cases.length} cases\n`);
