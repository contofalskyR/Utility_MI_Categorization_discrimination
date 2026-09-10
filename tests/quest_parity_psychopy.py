#!/usr/bin/env python3
"""quest_parity_psychopy.py — replay tests/quest_parity_cases.json (written by quest_parity.mjs from adaptive.js) through
PsychoPy's own QuestHandler and compare proposals, posterior summaries and stop decisions step by step.

    python3 tests/quest_parity_psychopy.py [tests/quest_parity_cases.json] [--tol 1e-6]

Run it on the lab machine (PsychoPy 2024.2.4 installed) for the real cross-language check — e.g. open it in the PsychoPy
Coder and press Run (no arguments needed), or `/Applications/PsychoPy.app/Contents/MacOS/python tests/quest_parity_psychopy.py`.
Without PsychoPy it falls back
to a pure-Python port of QUEST.m (the same arithmetic PsychoPy's contrib.quest implements), which still checks the JSON.

Known, documented difference: PsychoPy's QuestHandler tests startVal on trial 1, jsQUEST / the 'online' preset tests the
prior's quantile. The comparison therefore skips the trial-1 proposal for the online preset; every posterior summary and
every later proposal must agree.
"""
import json, math, os, sys

path = next((a for a in sys.argv[1:] if not a.startswith('--')), os.path.join(os.path.dirname(os.path.abspath(__file__)), 'quest_parity_cases.json'))
tol = float(sys.argv[sys.argv.index('--tol') + 1]) if '--tol' in sys.argv else 1e-6
data = json.load(open(path))

try:
    from psychopy.data import QuestHandler
    HAVE_PSYCHOPY = True
except Exception:
    HAVE_PSYCHOPY = False
    try:
        import numpy as np
    except ImportError:
        sys.exit('needs psychopy or numpy')

    class QuestTable:
        """Watson-Pelli QUEST as QUEST.m / PsychoPy contrib.quest / jsQUEST compute it."""
        def __init__(self, tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range_=None):
            dim = 500 if (range_ is None or not math.isfinite(range_)) else int(2 * math.ceil(range_ / grain / 2))
            self.tGuess, self.grain, self.dim = tGuess, grain, dim
            self.i = np.arange(-dim // 2, dim // 2 + 1); self.x = self.i * grain
            self.pdf = np.exp(-0.5 * (self.x / tGuessSd) ** 2); self.pdf = self.pdf / self.pdf.sum()
            i2 = np.arange(-dim, dim + 1); self.x2 = i2 * grain
            p2 = delta * gamma + (1 - delta) * (1 - (1 - gamma) * np.exp(-10 ** (beta * self.x2)))
            idx = np.nonzero(np.diff(p2))[0]
            self.xThreshold = np.interp(pThreshold, p2[idx], self.x2[idx])
            p2 = delta * gamma + (1 - delta) * (1 - (1 - gamma) * np.exp(-10 ** (beta * (self.x2 + self.xThreshold))))
            self.s2 = np.array([(1 - p2)[::-1], p2[::-1]])
            pL, pH, eps = p2[0], p2[-1], 1e-14
            pE = pH * math.log(pH + eps) - pL * math.log(pL + eps) + (1 - pH + eps) * math.log(1 - pH + eps) - (1 - pL + eps) * math.log(1 - pL + eps)
            pE = 1 / (1 + math.exp(pE / (pL - pH)))
            self.quantileOrder = (pE - pL) / (pH - pL)
        def update(self, intensity, response):
            inten = max(-1e10, min(1e10, float(intensity)))
            ii = self.dim + self.i - int(round((inten - self.tGuess) / self.grain))
            if ii[0] < 0: ii = ii - ii[0]
            if ii[-1] > 2 * self.dim: ii = ii + 2 * self.dim - ii[-1]
            self.pdf = self.pdf * self.s2[int(bool(response)), ii]
        def mean(self): return float(self.tGuess + (self.pdf * self.x).sum() / self.pdf.sum())
        def mode(self): return float(self.tGuess + self.x[np.argmax(self.pdf)])
        def sd(self):
            m = (self.pdf * self.x).sum() / self.pdf.sum(); return float(np.sqrt((self.pdf * (self.x - m) ** 2).sum() / self.pdf.sum()))
        def quantile(self, q=None):
            if q is None: q = self.quantileOrder
            p = np.cumsum(self.pdf); m1p = np.concatenate(([-1.0], p)); idx = np.nonzero(m1p[1:] - m1p[:-1])[0]
            return float(self.tGuess + np.interp(q * p[-1], p[idx], self.x[idx]))

worst = 0.0; n_steps = 0; failures = []
for case in data['cases']:
    P = case['params']; steps = case['steps']
    if HAVE_PSYCHOPY:
        h = QuestHandler(startVal=P['tGuess'], startValSd=P['tGuessSd'], pThreshold=P['pThreshold'], gamma=P['gamma'], delta=P['delta'], beta=P['beta'],
                         grain=P['grain'], range=P['range'], minVal=case['minVal'], maxVal=case['maxVal'], nTrials=case['maxTrials'], stopInterval=case['stopInterval'], method='quantile')
        it = iter(h)
    else:
        q = QuestTable(P['tGuess'], P['tGuessSd'], P['pThreshold'], P['beta'], P['delta'], P['gamma'], P['grain'], P['range'])
    for st in steps:
        k = st['k']
        if HAVE_PSYCHOPY:
            try: proposal_py = next(it)
            except StopIteration: proposal_py = None
            # PsychoPy clamps its own proposal to [minVal, maxVal]; the JSON records the raw engine proposal, compare the clamped value
            prop_js = min(case['maxVal'], max(case['minVal'], st['proposal']))
            if not (k == 1 and P['firstLevel'] == 'quantile') and proposal_py is not None:
                d = abs(proposal_py - prop_js); worst = max(worst, d)
                if d > tol: failures.append((case['preset'], case['history'], k, 'proposal', proposal_py, prop_js))
            h.addResponse(st['response'], intensity=st['level'])
            got = dict(mean=h.mean(), sd=h.sd(), mode=h.mode(), quantile=h.quantile(), width=h.confInterval(True))
            fin = h.finished
        else:
            if not (k == 1 and P['firstLevel'] == 'quantile') or True:
                prop_py = P['tGuess'] if (k == 1 and P['firstLevel'] == 'startVal') else q.quantile()
                d = abs(prop_py - st['proposal']); worst = max(worst, d)
                if d > tol: failures.append((case['preset'], case['history'], k, 'proposal', prop_py, st['proposal']))
            q.update(st['level'], st['response'])
            got = dict(mean=q.mean(), sd=q.sd(), mode=q.mode(), quantile=q.quantile(), width=q.quantile(0.95) - q.quantile(0.05))
            fin = (k >= case['maxTrials']) or (got['width'] < case['stopInterval'])
        for key in ('mean', 'sd', 'mode', 'quantile', 'width'):
            d = abs(got[key] - st[key]); worst = max(worst, d)
            if d > tol: failures.append((case['preset'], case['history'], k, key, got[key], st[key]))
        if bool(fin) != bool(st['finished']): failures.append((case['preset'], case['history'], k, 'finished', fin, st['finished']))
        n_steps += 1

print(f"engine: {'psychopy.data.QuestHandler' if HAVE_PSYCHOPY else 'pure-Python QUEST.m port (psychopy not installed)'}; {len(data['cases'])} cases, {n_steps} steps, worst |diff| = {worst:.3e}, tolerance {tol:g}")
for f in failures[:20]: print('  MISMATCH', f)
print('PARITY OK' if not failures else f'PARITY FAILED ({len(failures)} mismatches)')
sys.exit(0 if not failures else 1)
