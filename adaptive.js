/**
 * adaptive.js — three adaptive procedures for the same/different discrimination task, self-contained (no jsQUEST,
 * no Pavlovia). ES module; imported by the experiment script and by the Node tests.
 *
 *   Quest      Watson & Pelli (1983) QUEST exactly as PsychoPy's QuestHandler / jsQUEST compute it: posterior on a
 *              threshold grid (tGuess + i*grain), likelihood applied through the lookup table at the tested level
 *              rounded to the grain, index clamping at the table edge, placement at the King-Smith/Pelli quantile.
 *              Fed with the correctness of every trial, identical pairs included (the current design). With
 *              range = null the grid is jsQUEST's default 501-point grid (the online build); range = 0.65 reproduces
 *              the lab's 9-point grid.
 *   Psi        Kontsevich & Tyler (1999): joint posterior on (alpha, beta, lambda) of the pooled-correctness Weibull
 *              P(correct | L) = .5 + (.5 - lambda) * (1 - exp(-(L/alpha)^beta)); the next level minimises the expected
 *              posterior entropy. Same feed and same estimand as Quest (the pipeline's pooled "weibull50" curve),
 *              better placement, and a free asymptote so a high false-alarm rate does not push alpha up.
 *   QuestPlus  Watson (2017): joint posterior on (alpha, beta, FA) of the yes/no model
 *              P("different" | L) = FA + (1 - FA - lambda) * (1 - exp(-(L/alpha)^beta)); an identical pair is L = 0,
 *              so catch trials measure the false-alarm rate and different pairs measure sensitivity, both online.
 *              Placement by expected entropy over the full posterior.
 *
 * Conventions: alpha is the 63.2% point of the Weibull rise (the pipeline's convention). Levels are the half-separation
 * from the boundary centre in feature units, as in the original experiment. Every method returns a nominal level that
 * the Staircase clamps to [minLevel, maxLevel] before it is shown and before the posterior is updated (the 2026-08-20
 * clamp fix of the online build).
 */

const EPS = 1e-300;

export function linspace(a, b, n) { const out = new Float64Array(n); for (let i = 0; i < n; i++) out[i] = a + (b - a) * i / (n - 1); return out; }
export function logspace(a, b, n) { const la = Math.log(a), lb = Math.log(b); const out = new Float64Array(n); for (let i = 0; i < n; i++) out[i] = Math.exp(la + (lb - la) * i / (n - 1)); return out; }
export function weibull(L, alpha, beta) { return L <= 0 ? 0 : 1 - Math.exp(-Math.pow(L / alpha, beta)); }

/** Fisher-Yates shuffle with an injectable RNG (same algorithm family as PsychoJS's util.shuffle). */
export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ------------------------------------------------------------------------------------------------ QUEST (Watson-Pelli)
export class Quest {
  constructor({ tGuess = 0.1, tGuessSd = 0.3, pThreshold = 0.82, beta = 3.5, delta = 0.01, gamma = 0.5, grain = 0.1, range = null } = {}) {
    const dim = (range === null || range === undefined || !isFinite(range)) ? 500 : 2 * Math.ceil(range / grain / 2);
    Object.assign(this, { tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range, dim });
    this.i = []; for (let k = -Math.floor(dim / 2); k <= Math.floor(dim / 2); k++) this.i.push(k);
    this.x = this.i.map(k => k * grain);
    this.pdf = this.x.map(x => Math.exp(-0.5 * (x / tGuessSd) ** 2)); this._normalise();
    const i2 = []; for (let k = -dim; k <= dim; k++) i2.push(k);
    this.x2 = i2.map(k => k * grain);
    const psy = x => delta * gamma + (1 - delta) * (1 - (1 - gamma) * Math.exp(-Math.pow(10, beta * x)));
    let p2 = this.x2.map(psy);
    // xThreshold: interpolate pThreshold on the strictly increasing part of p2 (as QuestCreate)
    const xs = [], ps = []; for (let k = 0; k < p2.length - 1; k++) if (p2[k + 1] !== p2[k]) { xs.push(this.x2[k]); ps.push(p2[k]); }
    this.xThreshold = Quest._interp(pThreshold, ps, xs);
    p2 = this.x2.map(x => psy(x + this.xThreshold));
    this.s2 = [p2.map(p => 1 - p).reverse(), p2.slice().reverse()];
    const pL = p2[0], pH = p2[p2.length - 1], eps = 1e-14;
    let pE = pH * Math.log(pH + eps) - pL * Math.log(pL + eps) + (1 - pH + eps) * Math.log(1 - pH + eps) - (1 - pL + eps) * Math.log(1 - pL + eps);
    pE = 1 / (1 + Math.exp(pE / (pL - pH)));
    this.quantileOrder = (pE - pL) / (pH - pL);
    this.nTrials = 0;
    this.intensities = []; this.responses = [];
  }
  static _interp(v, xs, ys) {   // linear interpolation of v on (xs -> ys), xs increasing
    if (v <= xs[0]) return ys[0]; if (v >= xs[xs.length - 1]) return ys[ys.length - 1];
    let k = 0; while (xs[k + 1] < v) k++;
    return ys[k] + (ys[k + 1] - ys[k]) * (v - xs[k]) / (xs[k + 1] - xs[k]);
  }
  _normalise() { const s = this.pdf.reduce((a, b) => a + b, 0); this.pdf = this.pdf.map(p => p / s); }
  update(intensity, correct) {
    const inten = Math.max(-1e10, Math.min(1e10, intensity));
    let ii = this.i.map(k => this.dim + k - Math.round((inten - this.tGuess) / this.grain));
    if (ii[0] < 0) { const s = ii[0]; ii = ii.map(k => k - s); }
    if (ii[ii.length - 1] > 2 * this.dim) { const s = 2 * this.dim - ii[ii.length - 1]; ii = ii.map(k => k + s); }
    const row = this.s2[correct ? 1 : 0];
    this.pdf = this.pdf.map((p, k) => p * row[ii[k]]);
    this.nTrials++; this.intensities.push(intensity); this.responses.push(correct ? 1 : 0);
  }
  mean() { let s = 0, m = 0; for (let k = 0; k < this.pdf.length; k++) { s += this.pdf[k]; m += this.pdf[k] * this.x[k]; } return this.tGuess + m / s; }
  mode() { let b = 0; for (let k = 1; k < this.pdf.length; k++) if (this.pdf[k] > this.pdf[b]) b = k; return this.tGuess + this.x[b]; }
  sd() { let s = 0, m = 0; for (let k = 0; k < this.pdf.length; k++) { s += this.pdf[k]; m += this.pdf[k] * this.x[k]; } m /= s; let v = 0; for (let k = 0; k < this.pdf.length; k++) v += this.pdf[k] * (this.x[k] - m) ** 2; return Math.sqrt(v / s); }
  quantile(q = null) {
    if (q === null) q = this.quantileOrder;
    const p = []; let c = 0; for (const v of this.pdf) { c += v; p.push(c); }
    const xs = [], ys = []; let prev = -1; for (let k = 0; k < p.length; k++) { if (p[k] !== prev) { xs.push(p[k]); ys.push(this.x[k]); } prev = p[k]; }
    return this.tGuess + Quest._interp(q * p[p.length - 1], xs, ys);
  }
  /** width of the central 5-95% interval: what PsychoPy and PsychoJS compare with stopInterval */
  confidenceWidth() { return this.quantile(0.95) - this.quantile(0.05); }
  summary() {
    return { est_alpha: this.mean(), est_alpha_sd: this.sd(), est_mode: this.mode(), est_quantile: this.quantile(),
             est_ci_lower: this.quantile(0.05), est_ci_upper: this.quantile(0.95), est_ci_width: this.confidenceWidth() };
  }
}

// ------------------------------------------------------------------------------------ grid posteriors (Psi, QUEST+)
export class GridPosterior {
  /** stimuli: array of levels; params: array of objects; likFn(stimulus, params) = P(outcome = 1 | stimulus, params) */
  constructor(stimuli, params, likFn) {
    this.stimuli = stimuli; this.params = params; this.nS = stimuli.length; this.nP = params.length;
    this.lik = new Float64Array(this.nS * this.nP);
    this.ent = new Float64Array(this.nS * this.nP);           // binary entropy of each likelihood, precomputed
    for (let s = 0; s < this.nS; s++) for (let p = 0; p < this.nP; p++) {
      const l = Math.min(1 - 1e-9, Math.max(1e-9, likFn(stimuli[s], params[p])));
      this.lik[s * this.nP + p] = l; this.ent[s * this.nP + p] = GridPosterior.h2(l);
    }
    this.post = new Float64Array(this.nP).fill(1 / this.nP);
    this.history = [];
  }
  static h2(x) { return (x <= 0 || x >= 1) ? 0 : -(x * Math.log(x) + (1 - x) * Math.log(1 - x)); }
  update(stimIndex, outcome) {
    const base = stimIndex * this.nP; let s = 0;
    for (let p = 0; p < this.nP; p++) { const l = this.lik[base + p]; this.post[p] *= outcome ? l : 1 - l; s += this.post[p]; }
    for (let p = 0; p < this.nP; p++) this.post[p] /= s;
    this.history.push([stimIndex, outcome]);
  }
  entropy(v) { let h = 0; for (let p = 0; p < v.length; p++) if (v[p] > 0) h -= v[p] * Math.log(v[p]); return h; }
  /**
   * Expected posterior entropy after one trial at stimulus s. Identity used (exact, no per-stimulus renormalisation):
   *   E[H(post | outcome)] = H(post) - [ h2(P1) - sum_p post_p h2(lik_sp) ]   where P1 = sum_p post_p lik_sp
   * i.e. current entropy minus the mutual information between the outcome and the parameters.
   */
  expectedEntropy(stimIndex, hPost = null) {
    return (hPost === null ? this.entropy(this.post) : hPost) - this.infoGain(stimIndex);
  }
  infoGain(stimIndex) {
    const base = stimIndex * this.nP; let p1 = 0, eh = 0;
    for (let p = 0; p < this.nP; p++) { const w = this.post[p]; p1 += w * this.lik[base + p]; eh += w * this.ent[base + p]; }
    return GridPosterior.h2(p1) - eh;
  }
  /** stimulus with the smallest expected posterior entropy (= largest information gain) */
  bestStimulus(allowed = null) {
    let best = -1, bestG = -Infinity;
    for (let s = 0; s < this.nS; s++) { if (allowed && !allowed(this.stimuli[s])) continue; const g = this.infoGain(s); if (g > bestG) { bestG = g; best = s; } }
    return best;
  }
  /**
   * Psi-marginal (Prins 2013): expected entropy of the posterior MARGINALISED over nuisance parameters. groups[p] = index of
   * the marginal cell of parameter combination p (e.g. the (alpha, beta) cell, summing over lambda). Returns the stimulus
   * with the largest expected reduction of the marginal entropy.
   */
  bestStimulusMarginal(groups, nGroups, allowed = null) {
    const post = this.post, nP = this.nP;
    const m1 = new Float64Array(nGroups), m0 = new Float64Array(nGroups);
    let hNow = 0; { m1.fill(0); for (let p = 0; p < nP; p++) m1[groups[p]] += post[p]; hNow = this.entropy(m1); }
    let best = -1, bestG = -Infinity;
    for (let s = 0; s < this.nS; s++) {
      if (allowed && !allowed(this.stimuli[s])) continue;
      const base = s * nP; let p1 = 0; m1.fill(0); m0.fill(0);
      for (let p = 0; p < nP; p++) { const a = post[p] * this.lik[base + p]; m1[groups[p]] += a; m0[groups[p]] += post[p] - a; p1 += a; }
      const p0 = 1 - p1;
      let h1 = 0, h0 = 0;
      for (let g = 0; g < nGroups; g++) { const a = m1[g] / (p1 + EPS), b = m0[g] / (p0 + EPS); if (a > 0) h1 -= a * Math.log(a); if (b > 0) h0 -= b * Math.log(b); }
      const gain = hNow - (p1 * h1 + p0 * h0);
      if (gain > bestG) { bestG = gain; best = s; }
    }
    return best;
  }
  /** group index (marginal cell) of every parameter combination for the given keys */
  groupsFor(keys) {
    const map = new Map(); const groups = new Int32Array(this.nP);
    for (let p = 0; p < this.nP; p++) { const k = keys.map(key => this.params[p][key]).join('|'); if (!map.has(k)) map.set(k, map.size); groups[p] = map.get(k); }
    return { groups, nGroups: map.size };
  }
  marginal(key) {
    const m = new Map(); for (let p = 0; p < this.nP; p++) { const v = this.params[p][key]; m.set(v, (m.get(v) || 0) + this.post[p]); }
    return m;
  }
  meanSd(key, log = false) {
    let m = 0, m2 = 0; for (let p = 0; p < this.nP; p++) { const v = log ? Math.log(this.params[p][key]) : this.params[p][key]; m += this.post[p] * v; m2 += this.post[p] * v * v; }
    return [m, Math.sqrt(Math.max(0, m2 - m * m))];
  }
  /** central credible interval of a parameter from its marginal (q in (0,1)) */
  quantile(key, q) {
    const m = Array.from(this.marginal(key).entries()).sort((a, b) => a[0] - b[0]);
    let c = 0; for (const [v, p] of m) { c += p; if (c >= q) return v; }
    return m[m.length - 1][0];
  }
  posteriorEntropy() { return this.entropy(this.post); }
}

export const DEFAULT_GRID = {
  alpha: logspace(0.02, 0.8, 50),        // threshold grid, log-spaced (log-uniform prior)
  beta: logspace(0.7, 8, 8),             // slope grid
  lambda: linspace(0, 0.3, 7),           // Psi: free asymptote of the pooled curve (1 - lambda); covers FA up to ~.6
  lambdaFixed: 0.02,                     // QUEST+: true lapse rate, fixed
  fa: linspace(0, 0.6, 13),              // QUEST+: false-alarm grid
  levels: linspace(0.05, 0.70, 66),      // candidate levels, step .01
};

// ------------------------------------------------------------------------------------------------------ Psi
export class Psi {
  /** interest: parameters whose marginal posterior entropy is minimised (Psi-marginal, Prins 2013); the others are nuisance.
   *  null = full-posterior entropy (Kontsevich & Tyler 1999). Default ['alpha', 'beta']: lambda is a nuisance parameter. */
  constructor({ alpha = DEFAULT_GRID.alpha, beta = DEFAULT_GRID.beta, lambda = DEFAULT_GRID.lambda, levels = DEFAULT_GRID.levels, interest = ['alpha', 'beta'] } = {}) {
    const lambdas = (typeof lambda === 'number') ? [lambda] : Array.from(lambda);
    const params = []; for (const a of alpha) for (const b of beta) for (const l of lambdas) params.push({ alpha: a, beta: b, lambda: l });
    this.levels = Array.from(levels);
    this.gp = new GridPosterior(this.levels, params, (L, p) => 0.5 + (0.5 - p.lambda) * weibull(L, p.alpha, p.beta));
    this.interest = interest; this.marg = interest ? this.gp.groupsFor(interest) : null;
    this.nTrials = 0;
  }
  nextLevel() { return this.levels[this.marg ? this.gp.bestStimulusMarginal(this.marg.groups, this.marg.nGroups) : this.gp.bestStimulus()]; }
  /** correctness of any trial (identical pairs included, as the design feeds the staircase) at the nominal level */
  update(level, correct) { this.gp.update(this._index(level), correct ? 1 : 0); this.nTrials++; }
  _index(level) { let b = 0; for (let s = 1; s < this.levels.length; s++) if (Math.abs(this.levels[s] - level) < Math.abs(this.levels[b] - level)) b = s; return b; }
  summary() {
    const [la, lsd] = this.gp.meanSd('alpha', true), [a, asd] = this.gp.meanSd('alpha'), [b] = this.gp.meanSd('beta', true), [l] = this.gp.meanSd('lambda');
    return { est_alpha: a, est_alpha_sd: asd, est_log_alpha: la, est_log_alpha_sd: lsd, est_beta: Math.exp(b), est_lambda: l,
             est_ci_lower: this.gp.quantile('alpha', 0.05), est_ci_upper: this.gp.quantile('alpha', 0.95), est_entropy: this.gp.posteriorEntropy() };
  }
}

// -------------------------------------------------------------------------------------------------- QUEST+
export class QuestPlus {
  /** interest: null = full-posterior entropy over (alpha, beta, FA) (Watson 2017, default); e.g. ['alpha', 'beta'] treats FA as nuisance. */
  constructor({ alpha = DEFAULT_GRID.alpha, beta = DEFAULT_GRID.beta, fa = DEFAULT_GRID.fa, lambda = DEFAULT_GRID.lambdaFixed, levels = DEFAULT_GRID.levels, interest = null } = {}) {
    const params = []; for (const a of alpha) for (const b of beta) for (const f of fa) params.push({ alpha: a, beta: b, fa: f });
    this.lambda = lambda; this.levels = [0, ...Array.from(levels)];          // stimulus 0 = an identical pair
    this.gp = new GridPosterior(this.levels, params, (L, p) => p.fa + (1 - p.fa - lambda) * weibull(L, p.alpha, p.beta));
    this.interest = interest; this.marg = interest ? this.gp.groupsFor(interest) : null;
    this.nTrials = 0;
  }
  _best(allowed) { return this.marg ? this.gp.bestStimulusMarginal(this.marg.groups, this.marg.nGroups, allowed) : this.gp.bestStimulus(allowed); }
  /** best DIFFERENT-pair level (L > 0) by expected entropy */
  nextLevel() { return this.levels[this._best(L => L > 0)]; }
  /** does the posterior want an identical pair next? (used only under the 'adaptive' catch policy) */
  wantsCatch() { return this._best(null) === 0; }
  /** outcome = did the observer say "different"; level = 0 for an identical pair */
  update(level, saidDifferent) { this.gp.update(this._index(level), saidDifferent ? 1 : 0); this.nTrials++; }
  _index(level) { if (level <= 0) return 0; let b = 1; for (let s = 2; s < this.levels.length; s++) if (Math.abs(this.levels[s] - level) < Math.abs(this.levels[b] - level)) b = s; return b; }
  summary() {
    const [la, lsd] = this.gp.meanSd('alpha', true), [a, asd] = this.gp.meanSd('alpha'), [b] = this.gp.meanSd('beta', true), [f, fsd] = this.gp.meanSd('fa');
    return { est_alpha: a, est_alpha_sd: asd, est_log_alpha: la, est_log_alpha_sd: lsd, est_beta: Math.exp(b), est_fa: f, est_fa_sd: fsd,
             est_ci_lower: this.gp.quantile('alpha', 0.05), est_ci_upper: this.gp.quantile('alpha', 0.95), est_entropy: this.gp.posteriorEntropy() };
  }
}

// --------------------------------------------------------------------------------------------- one staircase
export class Staircase {
  /**
   * method: 'quest' | 'psi' | 'questplus'; label / featureIndex identify the boundary.
   * maxTrials: hard cap per staircase (the online build: 50).
   * stopInterval: Quest only — stop once the 5-95% posterior width is below it (the online build: .15; null = never).
   * stopAlphaSd: Psi / QUEST+ — stop once the posterior SD of alpha is below it (null = run to maxTrials).
   * minTrials: no stop-rule stop before this many trials (the online build enforces none: 0).
   * firstLevel: 'quantile' = first trial at the prior's quantile (jsQUEST / the online build) | 'startVal' = tGuess first (PsychoPy lab).
   * catchPolicy: 'forced50' (design: identical pair with p = .5 on every trial) | 'adaptive' (QUEST+ only: identical pair when it is
   *   the most informative stimulus, with a floor of catchMin) | 'none'.
   */
  constructor({ method, label, featureIndex, maxTrials = 50, minTrials = 0, stopInterval = null, stopAlphaSd = null, minLevel = 0.05, maxLevel = 0.7,
                catchPolicy = 'forced50', catchMin = 0.3, quest = {}, grid = {}, firstLevel = 'quantile', rng = Math.random } = {}) {
    Object.assign(this, { method, label, featureIndex, maxTrials, minTrials, stopInterval, stopAlphaSd, minLevel, maxLevel, catchPolicy, catchMin, firstLevel, rng });
    if (method === 'quest') this.engine = new Quest(quest);
    else if (method === 'psi') this.engine = new Psi(grid);
    else if (method === 'questplus') this.engine = new QuestPlus(grid);
    else if (method === 'psi_marginal') this.engine = new QuestPlus({ interest: ['alpha', 'beta'], ...grid });
    else throw new Error('unknown method ' + method);
    this.yesNo = (method === 'questplus' || method === 'psi_marginal');   // identical pairs enter at level 0 as a same/different answer
    this.n = 0; this.nCatch = 0; this.finished = false; this.finishedReason = null; this.trials = []; this.pending = null;
  }
  /** the engine's raw proposal for the next trial (before clamping) */
  proposal() {
    if (this.method === 'quest') return (this.n === 0 && this.firstLevel === 'startVal') ? this.engine.tGuess : this.engine.quantile();
    return this.engine.nextLevel();
  }
  /** decide the next trial: {level, rawLevel, isCatch}; level is the clamped nominal level (identical pairs are drawn at the centre) */
  nextTrial() {
    let isCatch;
    if (this.catchPolicy === 'none') isCatch = false;
    else if (this.catchPolicy === 'adaptive' && this.yesNo) {
      const need = this.n > 0 && this.nCatch / this.n < this.catchMin;   // keep enough identical pairs for the FA estimate
      isCatch = need || this.engine.wantsCatch();
      if (this.n === 0) isCatch = this.rng() < 0.5;
    } else isCatch = this.rng() < 0.5;
    const rawLevel = this.proposal();
    const level = Math.min(this.maxLevel, Math.max(this.minLevel, rawLevel));
    this.pending = { level, rawLevel, isCatch };
    return { level, rawLevel, isCatch };
  }
  /** record the response. saidDifferent: boolean; level / isCatch as returned by nextTrial */
  addResponse({ level, isCatch, saidDifferent, rt = null }) {
    const correct = isCatch ? !saidDifferent : saidDifferent;
    if (this.yesNo) this.engine.update(isCatch ? 0 : level, saidDifferent);   // QUEST+ / psi_marginal: identical pair = level 0, outcome = said "different"
    else this.engine.update(level, correct);                       // Quest and Psi: correctness at the nominal (clamped) level, identical pairs included
    this.n++; if (isCatch) this.nCatch++;
    const s = this.engine.summary();
    const rawLevel = this.pending ? this.pending.rawLevel : level;
    this.trials.push({ n: this.n, level, rawLevel, isCatch, saidDifferent, correct, rt, ...s });
    this.pending = null;
    if (this.n >= this.maxTrials) { this.finished = true; this.finishedReason = 'maxTrials'; }
    else if (this.n >= this.minTrials) {
      if (this.method === 'quest' && this.stopInterval !== null && s.est_ci_width < this.stopInterval) { this.finished = true; this.finishedReason = 'stopInterval'; }
      if (this.method !== 'quest' && this.stopAlphaSd !== null && s.est_alpha_sd < this.stopAlphaSd) { this.finished = true; this.finishedReason = 'stopAlphaSd'; }
    }
    return { correct, ...s };
  }
  summary() { return this.engine.summary(); }
}

// ------------------------------------------------------------------------------ two boundaries, interleaved
export class Interleaver {
  /**
   * order: 'random' = PsychoPy/PsychoJS MultiStairHandler 'random': every pass shuffles the unfinished staircases and gives each
   * one trial (so with two staircases the sequence is AB|BA|AB|...); 'fullRandom' = an unfinished staircase drawn at random on
   * every trial; 'sequential' = fixed order each pass.
   */
  constructor(staircases, { order = 'random', rng = Math.random } = {}) { this.staircases = staircases; this.order = order; this.rng = rng; this.current = null; this.pass = []; this.nTrials = 0; }
  get finished() { return this.staircases.every(s => s.finished); }
  next() {
    if (this.pass.length === 0) {
      const open = this.staircases.filter(s => !s.finished);
      if (open.length === 0) return null;
      if (this.order === 'random') this.pass = shuffle(open, this.rng);
      else if (this.order === 'fullRandom') this.pass = [open[Math.floor(this.rng() * open.length)]];
      else this.pass = open.slice();
    }
    this.current = this.pass.shift();
    if (this.current.finished) return this.next();                // finished during the pass: skip it
    const t = this.current.nextTrial();
    this.nTrials++;
    return { staircase: this.current, label: this.current.label, featureIndex: this.current.featureIndex, ...t };
  }
}

// ------------------------------------------------------------------ fixed-level reference block (does not update anything)
/**
 * A fixed list of trials in the same trial format as the staircases, for a reference block that measures false alarms,
 * easy-trial misses and curve coverage independently of the adaptive sampler. next() returns plans with staircase = null,
 * so the experiment shows and logs the trial but updates no posterior.
 */
export class FixedBlock {
  /** spec: {boundaries: [{label, featureIndex}], levels: [..], repeats: n, identicalPairs: n} */
  constructor(spec, { rng = Math.random, order = 'shuffle', phaseLabel = 'ref' } = {}) {
    const trials = [];
    for (const b of spec.boundaries) {
      for (const L of spec.levels) for (let r = 0; r < spec.repeats; r++) trials.push({ label: b.label, featureIndex: b.featureIndex, level: L, isCatch: false });
      for (let r = 0; r < (spec.identicalPairs || 0); r++) trials.push({ label: b.label, featureIndex: b.featureIndex, level: 0, isCatch: true });
    }
    this.trials = order === 'shuffle' ? shuffle(trials, rng) : trials;
    this.i = 0; this.phaseLabel = phaseLabel; this.responses = [];
  }
  get length() { return this.trials.length; }
  get finished() { return this.i >= this.trials.length; }
  next() {
    if (this.finished) return null;
    const t = this.trials[this.i++];
    return { staircase: null, block: this.phaseLabel, label: t.label, featureIndex: t.featureIndex, level: t.level, rawLevel: t.level, isCatch: t.isCatch, index: this.i };
  }
  addResponse(plan, saidDifferent, rt = null) { this.responses.push({ ...plan, saidDifferent, correct: plan.isCatch ? !saidDifferent : saidDifferent, rt }); }
}

/** simulated observer for tests: returns saidDifferent for a trial, given a yes/no truth (alpha63, beta, fa, lapse) */
export function simulateObserver({ level, isCatch }, { alpha, beta, fa = 0.1, lapse = 0.02 }, rng = Math.random) {
  const pDiff = isCatch ? fa : fa + (1 - fa - lapse) * weibull(level, alpha, beta);
  return rng() < pDiff;
}

export const GRID = DEFAULT_GRID;
