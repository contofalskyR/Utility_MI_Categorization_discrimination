#!/usr/bin/env python3
"""identical_pair_fig.py — what the 'identical-pair fix' changes, on simulated observers run through the experiment's own
adaptive code (tests/identical_pair_sim.mjs). One observer (true threshold .10, slope 3.5) with five false-alarm rates.
    python3 identical_pair_fig.py <sim.json> <out.png>"""
import sys, json, numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
d = json.load(open(sys.argv[1])); out = sys.argv[2]
FAS = d['fas']; ALPHA = d['alpha']
METH = [('quest', 'QUEST as it runs now\n(identical pair scored right/wrong at the level it was "shown at")', '#c0392b'),
        ('psi', 'Psi as it is in the package\n(same feed; asymptote of the curve left free)', '#e08a1e'),
        ('questplus', 'the identical-pair fix (QUEST+ / yes-no Psi)\n(identical pair = level 0; false-alarm rate is a parameter)', '#2a6fdb')]
cells = {(c['method'], c['fa']): c for c in d['cells']}
fig, axes = plt.subplots(3, 3, figsize=(19, 12), gridspec_kw={'width_ratios': [1.35, 1.35, 1]})
for i, (m, title, col) in enumerate(METH):
    for j, fa in enumerate((0.05, 0.50)):
        ax = axes[i, j]; tr = cells[(m, fa)]['tracks'][0]
        L = np.array([t['level'] for t in tr]); catch = np.array([t['catch'] for t in tr]); corr = np.array([t['correct'] for t in tr]); est = np.array([t['est'] for t in tr], float)
        n = np.arange(1, len(L) + 1)
        ax.plot(n, L, '-', color=col, lw=1.1, zorder=2); ax.plot(n, est, '--', color='k', lw=1.1, zorder=3, label='running estimate')
        for k in range(len(L)):
            mk = 's' if catch[k] else 'o'; fc = col if corr[k] else 'white'
            ax.plot(n[k], L[k], mk, ms=6.5, mfc=fc, mec=col, mew=1.3, zorder=4)
        ax.axhline(ALPHA, color='grey', lw=.9, ls=':'); ax.axhline(.7, color='grey', lw=.8); ax.axhline(.05, color='grey', lw=.8)
        ceil = (L >= .699).mean(); ax.text(.01, .98, f'false-alarm rate {fa:.0%} · {len(L)} trials · {int(catch.sum())} identical pairs (squares) · {ceil:.0%} of trials at the .70 ceiling\nfinal estimate {est[-1]:.3f} (true .100)', transform=ax.transAxes, va='top', fontsize=8.5)
        ax.set_ylim(0, .75); ax.set_xlim(0, 51); ax.grid(alpha=.25)
        if j == 0: ax.set_ylabel(title, fontsize=8.5)
        if i == 0: ax.set_title(f'one example staircase — observer with false-alarm rate {fa:.0%}', fontsize=10)
        if i == 2: ax.set_xlabel('trial within the staircase')
    ax = axes[i, 2]; rng = np.random.default_rng(3)
    for j, fa in enumerate(FAS):
        e = np.array(cells[(m, fa)]['est']); ce = np.mean(cells[(m, fa)]['ceil'])
        ax.scatter(j + rng.uniform(-.22, .22, len(e)), e, s=9, color=col, alpha=.4, lw=0)
        ax.plot([j - .3, j + .3], [np.median(e)] * 2, color='k', lw=2)
        ax.text(j, .735, f'{np.median(e):.3f}\n{ce:.0%} ceil.', ha='center', fontsize=7.5)
    ax.axhline(ALPHA, color='grey', lw=1, ls=':'); ax.text(4.45, ALPHA + .008, 'true .10', fontsize=7.5, color='grey', ha='right')
    ax.set_xticks(range(len(FAS))); ax.set_xticklabels([f'{f:.0%}' for f in FAS]); ax.set_ylim(0, .8); ax.grid(axis='y', alpha=.25)
    ax.set_xlabel('false-alarm rate of the observer\n(true threshold .10 in every column)'); ax.set_ylabel('threshold the staircase reports')
    if i == 0: ax.set_title(f'{2 * d["runs"]} simulated staircases per column\n(median above; share of trials at the ceiling)', fontsize=10)
axes[0, 0].legend(loc='lower right', fontsize=8, frameon=False)
fig.suptitle('The identical-pair fix — the same observer (true threshold .10) run through the experiment\'s own staircase code, only the false-alarm rate varies.\n'
             'Rows: how the identical pair is fed to the staircase. Filled = answered correctly, open = wrong; squares are identical pairs; dotted line = true threshold; solid lines = .05 floor and .70 ceiling.', fontsize=10.5)
fig.tight_layout(rect=(0, 0, 1, .94)); fig.savefig(out, dpi=140, facecolor='white'); print('wrote', out)
