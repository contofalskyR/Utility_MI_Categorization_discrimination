# Asymmetric_Utility_discrimination_2025 — self-hosted build (no Pavlovia)

This folder is the online experiment exactly as it ran on Pavlovia (PsychoJS 2024.2.4, the same routines, instructions,
timing, stimuli, categorization game and data columns), repackaged so that it runs from any web host and sends its data
to an endpoint you control. jsQUEST and Pavlovia's server are gone; the adaptive procedure lives in `adaptive.js` and
comes in three variants that you choose per link:

| entry page | adaptive method | what it is |
|---|---|---|
| `quest.html` (or `index.html?method=quest`) | **QUEST** | the current design's engine, reproduced bit-for-bit (verified against all 7,382 trials of the 2026-09-02 cohort) |
| `psi.html` | **Psi** (Psi-marginal) | same feed and same estimand as QUEST, Bayesian placement over (alpha, beta, lambda) with lambda treated as nuisance |
| `questplus.html` | **QUEST+** | yes/no model with the false-alarm rate as a parameter: identical pairs are level 0; sensitivity and criterion are estimated separately, online |

Everything the three variants share (trial structure, 50 % identical pairs, clamp to [.05, .70], two interleaved
staircases per phase, 50-trial cap, categorization game in between) is unchanged from the online build. The method is
recorded in every data row (`adaptive_method`) and in the file name.

## Contents

```
index.html / quest.html / psi.html / questplus.html   entry pages (vendored jQuery, jQuery-UI, PreloadJS; no CDN); *_sym.html = symmetric study
Asymmetric_Utility_discrimination_selfhost.js         the experiment (generated from the Pavlovia script by build/build_experiment.py)
adaptive.js                                           Quest / Psi / QuestPlus / Staircase / Interleaver  (ES module, no dependencies)
datasaver.js                                          upload of CSV + log to your endpoint, autosave, download fallback, local backup
config.js                                             everything you may want to change (method parameters, endpoint, redirects, geometry)
config_symmetric.js                                   overlay for the symmetric study (expName, BC boundary .625, QUEST grain .1)
debughud.js                                           live overlay of the internal state (?debug=1 or the DEBUG single-file edition)
lib/psychojs-2024.2.4.js (+ .css)                     Pavlovia's PsychoJS bundle with two small patches (anti-aliasing, see below)
vendor/                                               jquery 3.6.0, jquery-ui 1.12.1, preloadjs 1.0.1
*.xlsx, *.png                                         instruction pages, categorization instructions, feedback squares (unchanged)
recover.html                                          lists CSVs kept in the browser's localStorage, for a failed upload
spaces_pool.json                                      40 screened feature spaces (tests/make_space_pool.mjs, seed 2026), used when config.spaces.usePool
server/collect.py                                     zero-dependency Python server: serves the experiment AND collects data
server/cloudflare-worker.js + wrangler.toml           free serverless endpoint (Cloudflare Worker + KV or R2) for static hosting (GitHub Pages)
server/pull_data.py                                   downloads new data files and SONA credit receipts from the Worker
DEPLOY_GITHUB_PAGES.md                                the hosting + SONA procedure, click by click
tests/                                                replay of the online cohort, engine simulations, headless end-to-end driver
build/                                                build_experiment.py, the Pavlovia source it patches, experiment.diff, build_singlefile.py
reference/quest_conditions_pavlovia.xlsx              the Pavlovia conditions file (parameters now live in config.js)
```

## Quick start

Locally, on any computer with Python 3 (no packages needed):

```
cd selfhost_package
python3 server/collect.py --dir . --data ./data --port 8080 --token pickasecret
```

then set `data.endpoint: '/collect'` and `data.token: 'pickasecret'` in `config.js` and open
`http://localhost:8080/quest.html` (or `psi.html`, `questplus.html`). Finished sessions appear in `./data/` as
`<participant>_Asymmetric_Utility_discrimination_2025_<method>_<date>.csv` plus the `.log` (the same log Pavlovia wrote).
Add `?smoke=1` to any link for a six-trials-per-staircase, twelve-categorization-trials dry run.

With `data.endpoint` left empty the experiment offers the CSV as a download at the end instead (PsychoJS's local mode);
that is enough for a lab computer but not for online participants.

### Single-file build (double-click, no server)

`python3 build/build_singlefile.py . Discrimination_online_v1.1.2.html` (needs node and esbuild: `npm i esbuild`) packs
the whole package into one .html that runs from `file://`: the PsychoJS bundle, the vendored libraries, config.js,
adaptive.js, datasaver.js, the experiment and the six resources are inlined (the resources are handed to PsychoJS as
embedded data through `window.EXP_EMBEDDED_RESOURCES`, because a file:// page cannot fetch anything). A launcher page
selects the adaptive method, full session vs short demo, and antialiasing, and also re-downloads CSVs kept in the
browser. The data path is the download fallback only (CSV to the Downloads folder + localStorage; `build_version` ends
in `_single`), so use it for demos, reviewers and lab checks, and host the folder for real data collection. All three
variants were run end to end from `file://` with `tests/run_headless.py` (`?autostart=1&method=psi&smoke=1` skips the
launcher).

### The symmetric study

`config_symmetric.js` is an overlay loaded after `config.js` that changes only what differs: `expName`
`discrimination2024c` (the name both symmetric cohorts were collected under), the BC probe centre `.625` instead of
`.616`, `build_version` ending in `_sym`, and QUEST `grain: 0.1` (what the symmetric Pavlovia build runs; the Quest port
replays Robert's 2026-08-23 symmetric session to 5e-10 at that grain — set `0.01` for the asymmetric cohort's grid).
Entry pages `quest_sym.html`, `psi_sym.html`, `questplus_sym.html`; single file:
`python3 build/build_singlefile.py . Discrimination_online_v1.1.2_SYMMETRIC.html --overlay config_symmetric.js`. Both
conditions can be hosted from the same folder (SONA gets the `_sym` link for the symmetric study).

## Hosting online

**Option A — one lab machine or any VPS.** `server/collect.py` serves the static files and receives the uploads on the
same origin, so no CORS setup is needed. Put it behind HTTPS (caddy, nginx, or a Cloudflare tunnel): browsers refuse
`fetch` from an https page to an http endpoint, and SONA links are https. Uploads carry `token`; keep it out of the
public repository (it is only a nuisance filter, not real security — the page is public anyway).

**Option B — GitHub Pages (or any static host) + a Cloudflare Worker.** Step by step in `DEPLOY_GITHUB_PAGES.md`.
Push this folder to a public repository and enable Pages; participants open `https://<user>.github.io/<repo>/quest.html`.
GitHub Pages cannot receive POSTs, so the data endpoint is `server/cloudflare-worker.js` (free tier: create the Worker,
paste the file, set the `COLLECT_TOKEN` and `ADMIN_TOKEN` secrets, bind storage — a Workers KV namespace as `DATA_KV`
(1 GB free, no card) or an R2 bucket as `DATA` (10 GB free, card on file required) — or `npx wrangler deploy` with
`server/wrangler.toml`). Point `config.js -> data.endpoint` at `https://<worker>.<account>.workers.dev/collect`.
`server/pull_data.py` downloads every new file (and the SONA credit receipts); `GET /files?admin=…` lists,
`GET /files/<name>?admin=…` downloads one. Uploads are `text/plain` POSTs with a JSON body, which is a "simple" request —
no CORS preflight, and the Worker answers with `Access-Control-Allow-Origin: *`.

**SONA.** Create the study in SONA as an *Online External Study* with the link
`https://…/quest.html?survey_code=%SURVEY_CODE%` (`quest_sym.html` for the symmetric study — one SONA study per
condition). SONA replaces the placeholder with a one-time anonymous code per participation and then shows two completion
URLs on the study page. Credit is granted in three independent ways, any one of which is enough:

1. *Server-side, from the data.* Put SONA's **server-side** completion URL
   (`…/services/SonaAPI.svc/WebstudyCredit?experiment_id=NNN&credit_token=TOKEN&survey_code={survey_code}`) in the
   Worker secret `SONA_CREDIT_URL`. The moment a **complete** CSV with a survey code arrives, the Worker calls it and
   stores the receipt under `credits/<code>.json` (`GET /credits?admin=…` lists them; `GET /credit?admin=…&survey_code=X`
   retries one by hand, e.g. after a SONA outage). Credit therefore follows the data, not the participant's browser, and
   opening the completion link without doing the task grants nothing.
2. *Client-side, from the browser.* Put SONA's **client-side** completion URL
   (`…/webstudy_credit.aspx?experiment_id=NNN&credit_token=TOKEN&survey_code={survey_code}`) in
   `config.js -> redirect.completionUrl`; after the closing dialog the page goes there. SONA ignores the duplicate when
   (1) already granted.
3. *By hand.* With `sona.participantFromSurveyCode` (default on) the survey code *is* the participant id — dialog field,
   file name, every row — so there is one identity, not a random number plus a code; `survey_code` and `completion_code`
   are columns, the code is in the upload index / `/files` metadata, and the participant sees it on the Thanks screen and
   in the closing dialog with `sona.completionNote` (put the lab contact in `sona.contact`). If SONA credits nothing, the
   list of complete files by survey code is the list of people to credit in SONA's timeslot view.

Testing: researcher accounts cannot sign up for their own study, so log in as a fake participant with a temporary
invitation code on the study. Someone who quits early leaves `_INCOMPLETE` / `_PARTIAL` files and no automatic credit —
that case stays manual, as on Pavlovia. `?participant=…&session=…` in a link still pre-fill (and hide) the dialog fields.

**Robustness.** A partial CSV is uploaded every `autosaveMinutes` (default 3) and when the tab is closed
(`*_PARTIAL.csv`, replaced by the final file). A session ended with Escape uploads `*_INCOMPLETE.csv`. Every upload also
leaves a copy in the browser's localStorage, recoverable on that computer through `recover.html`.

## The three adaptive procedures

All three drive the same trial: the staircase proposes a nominal level `L` (half-separation from the boundary centre
along the feature vector), the level is clamped to `[.05, .70]` before it is shown and before the posterior is updated,
and a coin flip decides whether the pair is different (`centre ± L·vector`) or identical (both at the centre). Two
staircases per phase (`shape_difference0` at .375, `shape_difference1` at .616) are interleaved the way PsychoJS's
`MultiStairHandler` does it: each pass shuffles the unfinished staircases and gives each one trial (`AB|BA|AB|…`).
Parameters are in `config.js -> methods`.

**QUEST** is a port of Watson & Pelli's QUEST as jsQUEST / PsychoPy compute it (posterior on a threshold grid, table
lookup at the tested level rounded to the grain, index clamping at the table edge, King–Smith/Pelli quantile placement,
first trial at the prior's quantile, stop when the 5–95 % posterior width drops below .15, cap 50). Fed, as in the current
design, with the correctness of every trial including identical pairs. `tests/replay_online.mjs` replays the 46
collected online sessions (184 staircases) through it: the largest difference between its proposal and the logged
`PreTest.intensity` is 5e-10 (CSV rounding), and all 160 early stops fall exactly where its stop rule fires. The default
block reproduces the collected cohort (grain .01, no `range`); lab parity is `grain: 0.1, range: 0.65, firstLevel:
'startVal'` — a decision for Jacob, one line in `config.js`.

**Psi** keeps QUEST's feed and estimand (the pooled "all trials correct" curve, `.5 + (.5 − λ)·Weibull(L; α, β)`, the
pipeline's weibull50) but replaces the one-parameter grid with a joint posterior on (α, β, λ) and chooses the level that
minimises the expected entropy of the (α, β) marginal (Prins 2013, Psi-marginal); λ is free so that a high false-alarm
rate lowers the asymptote instead of inflating α. It runs to the trial cap (or `stopAlphaSd`). `est_alpha` is the 63.2 %
point of the rise, the pipeline's convention.

**QUEST+** models what the observer actually does: `P("different" | L) = FA + (1 − FA − λ)·Weibull(L; α, β)` with the
false-alarm rate FA on the grid and identical pairs as `L = 0`. Every trial — catch trials included — updates the same
posterior, so sensitivity (α, β) and criterion (FA) are estimated jointly and online; placement minimises the expected
entropy of the full posterior (Watson 2017). With `catchPolicy: 'forced50'` (default) the design's 50 % identical pairs
are kept; `'adaptive'` lets the posterior request an identical pair when that is the most informative trial (floor
`catchMin`).

`tests/engine_sim.mjs` runs simulated yes/no observers (α ∈ {.08, .15, .25, .40}, β ∈ {2, 3.5}, FA ∈ {.05, .20, .40},
lapse .02; 20 runs × 2 staircases per cell) through the three procedures exactly as the experiment does
(`tests/engine_sim_results.txt`). Overall, with 50 trials per staircase:

| method | bias of α̂ | RMSE | 90 % interval coverage | trials used | trials at the .70 ceiling |
|---|---|---|---|---|---|
| QUEST (vs the .82 point of the true pooled curve) | +.021 | .082 | .77 | 41 (stops early) | 3 % — 8–22 % when FA = .40, where its target does not exist |
| Psi | +.007 | .071 | .97 | 50 | 1 % |
| QUEST+ | +.011 | .047 | .94 | 50 | 1 % (FA recovered to ±.03) |

QUEST's estimate is undefined for an observer whose pooled asymptote is below .82 (FA ≳ .34): the staircase then climbs
toward the ceiling, which is the mechanism behind the ceiling trials in the collected cohort. Psi and QUEST+ have no such
limit. The three methods are not interchangeable estimands: QUEST and Psi report the pooled curve, QUEST+ the yes/no
curve; the offline pipeline fits whichever curve it fits from the logged trials regardless of the method.

## What changed relative to the Pavlovia script

`build/build_experiment.py` derives the experiment from `build/Asymmetric_Utility_discrimination_2025_pavlovia.js` (the
project deployed 2026-08-23, i.e. the 2026-08-20 fixes: clamp, per-row logging, fixed-length training) with 20
anchored patches; `build/experiment.diff` is the complete diff. In words:

1. `MultiStairHandler` / jsQUEST are replaced by a plain `TrialHandler` per phase driven by `adaptive.js`; the loop ends
   when both staircases are finished. `quest_conditions.xlsx` is no longer read; parameters come from `config.js`.
2. Resources are all local (`jsQUEST.min.js` and Pavlovia's `default.png` removed; the feedback square starts on
   `green_square.png`, it is replaced on every feedback anyway).
3. Feature subspace: the redraw rule — the subspace is redrawn until the contour radius `0.3 + deviation` stays above
   `.05` at the six corners of everything the experiment can show (training support ± 6 σ, discrimination pairs up to
   level .70 at either centre); `subspace_redraws` and `subspace_min_radius` are logged on every trial row. This
   replaces the `maxVal > 1.5` rescaling of u/v, which did not prevent folded shapes. `CONFIG.redraw.enabled = false`
   restores the old behaviour. The two-component `norm()` is kept as the design; `CONFIG.normFullD = true` switches to
   the full-D norm (Jacob's call, not made here).
4. Identical pairs are logged truthfully: `coord1` / `coord2` are the centre on catch trials (the old build wrote centre
   ± level there), and `is_catch`, `said_different` are explicit columns.
5. Data: `datasaver.js` replaces the Pavlovia upload (see Robustness above); redirects for SONA; the method and build in
   every row; the file name carries the method.
6. Anti-aliasing, two patches in `lib/`: the PIXI renderer is created with `antialias: true`, and the gamma/contrast
   `AdjustmentFilter` that PsychoJS attaches to its root container is left off when gamma and contrast are 1 (they are).
   The second patch is the one that matters: this PIXI build renders a filtered container through a non-multisampled
   texture, so `antialias: true` alone changes nothing — the earlier suggestion to flip only that flag on Pavlovia would
   have had no visible effect. Verified in headless Chromium: shape edges go from two grey levels (0/255) to a 4× MSAA
   ramp. `?antialias=0` in the link switches it off for A/B checks; `gl_antialias` is logged.
7. `?smoke=1` for short test runs; `window.__EXP` exposes state for the headless driver (harmless in production).
9. **Escape no longer ends a session on one press** (`config.escape`, default `'confirm'`: a second press within 3 s
   quits; `'quit'` restores the Pavlovia behaviour). The first human session on this build ended with an `_INCOMPLETE`
   file because a single Escape — used to close another application's overlay — reached the page; the Pavlovia build
   has the same failure mode, which is worth remembering when counting its 27 partial files.
10. **Each session measures its own anti-aliasing**: at start-up the experiment draws a tilted square with its own
   ShapeStim for one hidden frame, reads the pixels across the edge and logs `aa_gray_levels` (2 = aliased, 3 or more =
   multisampled), `aa_intermediate_px` and `gl_samples` on every row — so the rendering on each participant's machine is
   on record, not assumed. Headless check: 5 levels / 49 intermediate px with multisampling, 2 / 0 without.
8. Optional, off by default (flags in `config.js`): a saved pool of screened spaces with `?space=<id>` / per-participant
   assignment (`spaces`), and a fixed-level reference block after each adaptive phase that updates nothing
   (`reference`). Both were run end to end in the headless test.

Nothing in the trial timing, instructions, categorization game, utility matrix, feedback or delays was touched.

## Data columns

Everything the Pavlovia CSV had is still there under the same names (`level_used`, `staircase_label`, `feature_center`,
`correct_answer`, `Resp_s_or_d.*`, `<phase>.intensity` (the raw proposal), `<phase>.label`, `<phase>.response`,
`<phase>.CI_lower/upper/width`, the categorization columns …), so the analysis scripts load these files unchanged
(`m2_psychometric_ONLINE_FIXED.load_tracks` was run on a test file: four tracks, fits). New or changed:

- `adaptive_method`, `build_version`, `method` (from expInfo), `antialias_requested`, `gl_antialias`,
  `aa_gray_levels`, `aa_intermediate_px`, `gl_samples` (measured at start-up), `escape_pressed_t` (a single Escape press)
- `is_catch`, `said_different`, `<phase>.trial_n` (trial number within the staircase), `<phase>.feature_index`
- `<phase>.est_alpha`, `.est_alpha_sd`, `.est_ci_lower`, `.est_ci_upper` (5–95 %), and per method: QUEST `.est_mode`,
  `.est_quantile`, `.est_ci_width`; Psi `.est_beta`, `.est_lambda`, `.est_log_alpha(_sd)`, `.est_entropy`; QUEST+
  `.est_beta`, `.est_fa`, `.est_fa_sd`, `.est_entropy` — all after the row's response
- `<phase>.staircase_finished`, `<phase>.finished_reason` (`maxTrials` / `stopInterval` / `stopAlphaSd`)
- staircase parameters as before under `<phase>.*` (QUEST: `startVal … grain, range, stopInterval, grid_dim,
  quantileOrder`; grid methods: `stopAlphaSd, grid_params, grid_levels, lambda`), plus `minVal, maxVal, maxTrials,
  nTrials (= minTrials), catchPolicy, firstLevel, method`
- `subspace_redraws`, `subspace_min_radius`, `subspace_gain_u` / `subspace_gain_v` (norm of the visible components
  k ≥ 1), `space_id` / `space_source` (`pool` or `drawn`), `window_size_px`, `device_pixel_ratio`,
  `shape_size_height_units`, and `subspace_center/vector1/vector2` on discrimination rows too
- reference block rows (when enabled): `PreRef.*` / `PostRef.*` (`response`, `trial_n`, `block_index`, `block_length`),
  `updates_staircase = 0` (1 on adaptive rows), `level_used` 0 for identical pairs

## Tests

- `node tests/replay_online.mjs <folder of online CSVs>` — engine fidelity (expects the 2026-09-02 cohort files).
- `node tests/engine_sim.mjs [runs] [seed] [methods]` — simulated observers, bias / RMSE / coverage / placement.
- `node tests/quest_parity.mjs > tests/quest_parity_cases.json` then `python3 tests/quest_parity_psychopy.py` — scripted
  histories (all correct, all incorrect, alternating, seeded mixed, pinned at .05, pinned at .70) × two presets (online
  grid, lab grid) with proposals, posterior mean/sd/mode/quantile, 5–95 % width and stop decision at every step. On the
  lab machine the Python side is PsychoPy's own `QuestHandler` (open the script in the Coder and run it); elsewhere a
  pure-Python QUEST.m port. Current result: 12 cases, 472 steps, worst difference 3e-15.
- `node tests/make_space_pool.mjs 40 2026 > spaces_pool.json` — the saved pool (acceptance 25.8 %, 3.9 draws per space).
- `node tests/worker_sona_test.mjs` — the Worker's SONA path in Node with an in-memory bucket and a fake SONA (grant, outage + manual retry, rejected code, listings).
- `python3 tests/run_headless.py --url "http://127.0.0.1:8080/psi.html?smoke=1" --alpha .15 --beta 3 --fa .1 --out /tmp/r`
  — a complete session in headless Chromium with a simulated observer (consent, instructions, pre-test, game, post-test,
  upload, closing dialog), a screenshot of two shapes over the post-test instructions (`render_check.png`), the renderer's
  MSAA state, console and page errors, and a JSON summary; exit 0 only if the final CSV reached the endpoint (or, without
  an endpoint / single-file build, was downloaded — the driver saves the download next to the summary). Needs
  `pip install playwright` and a Chromium. All three variants pass; a full-length QUEST session (2 × 50 + 300 + 2 × 50
  trials) was run the same way.

## Configuration reference (`config.js`)

`method` (default variant), `methods.{quest,psi,questplus}` (per-variant `maxTrials`, `minTrials`, `stopInterval` /
`stopAlphaSd`, `catchPolicy`, `catchMin`, `firstLevel`, `quest` / `grid` parameters), `interleave`, `levelRange`,
`boundaries`, `discriminationParameters` (asymmetric `[.375, .5, 1, 0], [.616, .5, 1, 0]`; symmetric `.625`),
`reference` (fixed-level block, off by default), `redraw` (`enabled: false` = the Pavlovia behaviour), `spaces` (saved
pool, off by default), `normFullD`, `antialias`, `escape` (`confirm` / `quit` / `ignore`), `data` (endpoint, token, autosave, unload beacon, download fallback,
local backup), `redirect`, `smoke`. URL parameters: `method`, `participant`, `session`, `survey_code`, `smoke`, `space`,
`antialias`, `__noOutput`.

## Relation to the NEXT_BUILD_CHECKLIST (Astra, 2026-09-06)

| checklist item | state in this package |
|---|---|
| 1 lab boundary assignment | lab side: the v2 Python builds (`feature_index = int(condition['feature_index'])`, verified from screen recordings). Here: the plan object carries boundary, level, pair identity and the receiving staircase together, so they cannot disagree; `staircase_label`, `feature_center`, `coord1/2`, `updates_staircase` are on every row. |
| 2 one QUEST specification, scripted parity, explicit minimum, fixed budget | `config.js` is the single specification for the browser; `tests/quest_parity.*` exports scripted histories for PsychoPy's `QuestHandler` (run on the lab machine); `minTrials` is an explicit counter (default 0 = the online build); a fixed budget is `stopInterval: null`; grain/range/first level are one line each. Choosing them is Jacob's decision — the simulations in `tests/engine_sim_results.txt` are the first input. |
| 3 training distribution and exposure | unchanged code path (σ .075 on both axes, 300 trials, no points exit). Verified from the full headless run: category means .250/.495/.752, per-axis SD .062–.081 (n ≈ 100 per category), correlation ≈ 0; all nine category × response cells observed with delays 8.0 s (−3), 1.3 s (−1), 0 s (+1, +3). The lab σ fix is in the v2 Python build. |
| 4–5 screened pool, one space per session, gain logging | runtime screen (redraw rule, same six-corner support, same acceptance ≈ 25.8 %) by default; `spaces_pool.json` + `spaces.usePool` for a saved, assignable pool; `subspace_gain_u/v`, `space_id`, window size and DPR logged. One space per session already holds (training and both tests share `feature_space`). |
| 6 fixed-level reference block | `reference` flag (levels/counts are placeholders until chosen by simulation); rows marked `updates_staircase = 0`. |
| 7 threshold definition, fit rules | analysis side, not this package; the CSV keeps the three estimands separable (`is_catch`, `said_different`, `<phase>.response`) and logs the engine's own posterior next to them. |
| 8 reconstructable sessions | every row: build, method, phase, boundary, staircase, requested/actual coordinates, pair identity, proposal, displayed level, key, correctness, RT, which staircase was updated, stop reason, space/geometry, renderer state; `.log` with keypress timestamps as on Pavlovia. |
| 9 reliability pilot | the same participant id maps to the same pool space (`assignment: 'participant'`), `?space=` forces one; the rest is study design. |

## Notes

- Serve the folder over http(s); opening `index.html` as a file does not work (ES-module imports are blocked on
  `file://`). `python3 server/collect.py` or `python3 -m http.server` is enough for a look.
- PsychoJS behaves as on Pavlovia in every respect that matters here (fullscreen request, keyboard timing, frame loop);
  the bundle is Pavlovia's own file, so a browser that ran the Pavlovia version runs this one.
- Rebuild after editing the Pavlovia source: `python3 build/build_experiment.py build/Asymmetric_Utility_discrimination_2025_pavlovia.js .`
  (every anchor must still match exactly once; the script stops otherwise).
- The symmetric condition is the same package with `discriminationParameters` changed (and the categorization
  parameters, which live in the experiment script's `CategorizationParameters` block, as before).
