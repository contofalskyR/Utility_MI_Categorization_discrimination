# Headless end-to-end runs (tests/run_headless.py), 2026-09-06

Chromium headless (SwiftShader WebGL, 4x MSAA), `server/collect.py` as the endpoint, simulated observer alpha .15 / beta 3 / FA .10 (smoke runs) and alpha .18 / beta 3 / FA .15 (full run). `?smoke=1` = 6 trials per staircase, 12 categorization trials.

| run | method | finished | disc. trials | cat. trials | staircase end (n, reason) | CSV + log uploaded | page errors | wall time |
|---|---|---|---|---|---|---|---|---|
| smoke | quest | True | 24 | 12 | Pre 0: 6 maxTrials; Pre 1: 6 maxTrials; Pos 0: 6 maxTrials; Pos 1: 6 maxTrials | 1 csv, 1 log | 0 | 131 s |
| smoke | psi | True | 24 | 12 | Pre 0: 6 maxTrials; Pre 1: 6 maxTrials; Pos 0: 6 maxTrials; Pos 1: 6 maxTrials | 1 csv, 1 log | 0 | 140 s |
| smoke | questplus | True | 24 | 12 | Pre 0: 6 maxTrials; Pre 1: 6 maxTrials; Pos 0: 6 maxTrials; Pos 1: 6 maxTrials | 1 csv, 1 log | 0 | 132 s |
| full length | quest | True | 159 | 300 | Pre 0: 36 stopInterval; Pre 1: 50 maxTrials; Pos 0: 37 stopInterval; Pos 1: 36 stopInterval | 1 csv, 1 log | 0 | 1429 s |

Checks made on the resulting CSVs: `level_used == clamp(<phase>.intensity, .05, .70)` on every row; pass-based interleaving (AB|BA|…); `is_catch`/`correct_answer` consistent; posterior summaries and `finished_reason` present; `subspace_redraws` / `subspace_min_radius` (>= .05) logged; `gl_antialias = 1`; the analysis pipeline's `m2_psychometric_ONLINE_FIXED.load_tracks` + `fit_track` run unchanged on the files (four tracks per file). Partial autosaves (`data/partial/*_PARTIAL.csv`) appeared every 3 minutes during the full run and were removed when the final file arrived.

Anti-aliasing A/B (`?antialias=1` vs `?antialias=0`, a rotated square drawn through the experiment's own ShapeStim): edge pixels take 5 grey levels (0, 64, 128, 192, 255 — 4x MSAA) with the two lib patches, and 2 (0/255) without. With only the `antialias: true` renderer flag (and PsychoJS's gamma AdjustmentFilter left in place) the edge stayed at 2 levels: the filter routes rendering through a non-multisampled texture.

## Reference block + space pool run (2026-09-07)

`quest.html?smoke=1&space=7` with `reference.enabled = true` and `spaces.usePool = true` (test copy of config.js): the session ran
PreTest (12 adaptive trials) → PreRef (10 fixed trials: levels .1/.2/.4 once per boundary + 2 identical pairs per boundary, shuffled)
→ game → PostTest (12) → PostRef (10); reference rows carry `updates_staircase = 0`, adaptive rows `= 1`; the staircases were not
touched by the reference trials; `space_id = 7`, `space_source = pool`, and `subspace_center` in the CSV equals space 7 of
`spaces_pool.json`; gains (`subspace_gain_u/v`), window size and DPR logged. RESULT OK, 0 page errors, 166 s.

## Training sampler and payoff / delay cells (from the full-length run, 300 categorization trials)

| category | n | mean x (target) | mean y | SD x | SD y | corr |
|---|---|---|---|---|---|---|
| A | 99 | .250 (.25) | .489 | .081 | .062 | −.09 |
| B | 96 | .495 (.50) | .497 | .071 | .071 | +.20 |
| C | 105 | .752 (.75) | .498 | .070 | .071 | +.06 |

Nine category × response cells, points and measured delay (DelayedStimulus routine): +1 → 0 s (74 / 73 trials), +3 → 0 s (69),
−1 → 1.29–1.32 s mean, range 1.15–1.44 s (13 / 12 / 13 / 18 trials; programmed 1.333 s, the spread is the ~.27 s frame period
of headless SwiftShader), −3 → 7.95–7.96 s, range 7.73–8.02 s (10 / 18 trials; programmed 8 s). Unchanged from the Pavlovia build.

## v1.1.5 rotation screen (2026-09-11)

`rotscreen.html?autostart=1&method=quest&smoke=1` (config.js + `config_rotscreen.js`, minRotatedGap .010): two sessions RESULT OK,
0 page errors; `subspace_rot_gap_ab/bc` .011304/.013628 and .015607/.015075 logged and re-computed in Python (`scripts/rotation_lottery.py`)
to 6 decimals; both applied orientations 0. Loop check with minRotatedGap forced to .02: 30 redraws (21 for rotation, 9 for folds),
final gaps .0304/.0216, session completed. The in-experiment metric agrees with Python on the two reference planes (ROB_ASTRA
.006081/.014354; 932457 .009294/.022067).

## v1.1.6 derived fold-screen corners + finiteness guard (2026-09-15)

Derived corners at the shipped settings: asymmetric [[-.2,.05],[-.2,.95],[1.2,.05],[1.2,.95],[1.075,.5],[-.325,.5],[1.316,.5],[-.084,.5]];
symmetric the same with 1.325 / -.075. Against the v1.1.5 literal six: symmetric reproduces all six exactly (plus two interior
points, which cannot change an affine minimum); asymmetric reproduces five and replaces 1.325 by the true reachable extreme
1.316. Fold-screen decisions over 50 000 draws of the generator: symmetric identical (max |min-radius difference| 0);
asymmetric 24 of 50 000 differ (0.05 %; planes folding only between x = 1.316 and 1.325, which the asymmetric study cannot
show). Guard (node harness on the built script): NaN plane -> 'invalid', short vector -> 'invalid', folding plane -> 'fold',
ROB_ASTRA plane -> 'rotation', plausible plane -> accepted.

## v1.1.7 psi_marginal (2026-09-18)

New method `psi_marginal` = the `QuestPlus` engine with `interest ['alpha', 'beta']` (Prins 2013 psi-marginal on the yes/no
model: identical pairs at level 0, false-alarm rate as a nuisance parameter). Checks: (1) node, 20 seeded runs — `psi_marginal`
and `questplus` with `grid.interest = ['alpha','beta']` produce identical trial sequences and posteriors (20/20; both differ from
full-posterior `questplus`, 20/20); (2) the QUEST engine's output on `tests/quest_parity.mjs` is identical to the committed
v1.1.6 cases (12 cases, 472 steps), and `build_experiment.py` regenerates a byte-identical experiment script; (3) headless
smoke runs, all RESULT OK, 0 errors: `psi_marginal.html` (participant 990117, observer alpha .12 / FA .40; CSV method column
`psi_marginal`, `PreTest/PostTest.est_alpha, est_alpha_sd, est_beta, est_fa, est_fa_sd, est_ci_lower/upper, est_entropy`
logged, 24 discrimination + 12 categorization trials, both screens ran), `psi_marginal_sym.html` (990118, expName
discrimination2024c, centres .375/.625), the single-file `Discrimination_online_v1.1.7.html?method=psi_marginal` (990119),
and `quest.html` on the same package (990120: method quest, pThreshold .82, grain .1 — unchanged). Simulation of the
identical-pair problem: `tests/identical_pair_sim.mjs` (one observer, true threshold .10, FA 5–65 %: QUEST .14→.63, plain
Psi .10→.27, yes/no model .100–.105; figure in the autopsy's COHORT_v1.1.5_2026-09-18/identical_pair_fix/).
