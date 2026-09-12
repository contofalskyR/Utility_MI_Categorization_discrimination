/**
 * config.js — everything you may want to change without touching the experiment script.
 * Loaded as a classic script before the experiment module; the experiment reads window.EXP_CONFIG.
 *
 * URL parameters understood by the experiment (all optional):
 *   ?method=quest | questplus | psi   adaptive procedure (default: EXP_CONFIG.method)
 *   ?participant=123&session=001      pre-fill the dialog (SONA can pass these)
 *   ?survey_code=XXXX                 SONA survey code, substituted into the redirect URLs as {survey_code}
 *   ?smoke=1                          short run for testing (EXP_CONFIG.smoke)
 *   ?space=<id>                       use feature space <id> of spaces_pool.json (EXP_CONFIG.spaces)
 *   ?antialias=0                      switch the WebGL multisampling off (A/B checks)
 *   ?__noOutput=1                     PsychoJS convention: do not save anything
 */
window.EXP_CONFIG = {
  buildVersion: 'selfhost_v1.1.5_2026-09-11',   // v1.1.5 = v1.1.4 + the rotation screen (minRotatedGap .010) + its four logging columns
  expName: 'Asymmetric_Utility_discrimination_2025',
  condition: 'asymmetric',                      // label only (launcher page, README); the symmetric study loads config_symmetric.js on top

  // ---------------------------------------------------------------- adaptive procedure
  method: 'quest',                              // default when the URL has no ?method=
  methods: {
    // QUEST as the online build runs it: jsQUEST default 501-point grid (range null), first trial at the prior quantile
    // (.1631), stop when the 5-95% posterior width < .15, cap 50. Grain: 0.1 = the symmetric online build and the lab
    // (v1.1.3, Robert's choice); the collected asymmetric cohort of 2026-09-02 ran 0.01 (v1.1.2 and earlier).
    quest: {
      maxTrials: 50, minTrials: 0, stopInterval: 0.15, firstLevel: 'quantile', catchPolicy: 'forced50',
      quest: { tGuess: 0.1, tGuessSd: 0.3, pThreshold: 0.82, beta: 3.5, delta: 0.01, gamma: 0.5, grain: 0.1, range: null },
    },
    // Psi (Kontsevich & Tyler 1999) on the same feed as QUEST (correctness of every trial, identical pairs included):
    // joint posterior on (alpha, beta, lambda) of the pooled curve .5 + (.5 - lambda) * Weibull; entropy-minimising placement.
    psi: {
      maxTrials: 50, minTrials: 0, stopAlphaSd: null, catchPolicy: 'forced50',
      grid: {},                                  // {alpha, beta, lambda, levels} arrays; defaults in adaptive.js DEFAULT_GRID
    },
    // QUEST+ (Watson 2017) on the yes/no model: joint posterior on (alpha, beta, FA); identical pairs are level 0 and
    // estimate FA; different pairs estimate sensitivity. catchPolicy 'forced50' keeps the design's 50% identical pairs;
    // 'adaptive' lets the posterior ask for an identical pair when that is the most informative trial (floor catchMin).
    questplus: {
      maxTrials: 50, minTrials: 0, stopAlphaSd: null, catchPolicy: 'forced50', catchMin: 0.3,
      grid: {},                                  // {alpha, beta, fa, lambda (fixed number), levels}
    },
  },
  interleave: 'random',                          // 'random' = PsychoJS MultiStairHandler passes (AB|BA|..), 'fullRandom', 'sequential'
  levelRange: [0.05, 0.70],                      // minVal / maxVal of the online build (clamp applied before display and before the update)

  // ---------------------------------------------------------------- boundaries (quest_conditions.xlsx, feature_index 0 / 1)
  boundaries: [
    { label: 'shape_difference0', featureIndex: 0 },
    { label: 'shape_difference1', featureIndex: 1 },
  ],
  // Payoff matrix of the categorization game (points; the delays derive from them): resp<given>if<true>. The asymmetric
  // study rewards a correct C with 3; the symmetric study (config_symmetric.js) with 1. B/C confusions cost 3 in both.
  utility: { respAifA: 1, respAifB: -1, respAifC: -1, respBifA: -1, respBifB: 1, respBifC: -3, respCifA: -1, respCifB: -3, respCifC: 3 },
  // discrimination_parameters rows: [centre_x, centre_y, vector_x, vector_y] — asymmetric build (AB at .375, BC at .616).
  // The symmetric build ([[0.375, 0.5, 1, 0], [0.625, 0.5, 1, 0]]) is config_symmetric.js, loaded after this file.
  discriminationParameters: [[0.375, 0.5, 1, 0], [0.616, 0.5, 1, 0]],

  // ---------------------------------------------------------------- fixed-level reference block (checklist item 5/6)
  // A block of fixed trials after each adaptive phase (PreRef after the pre-test, PostRef after the post-test) that does NOT
  // update any staircase: per boundary, `repeats` different pairs at each of `levels` plus `identicalPairs` identical pairs,
  // shuffled. Rows carry PreRef.* / PostRef.* columns and staircase_label. Levels and counts are placeholders to be chosen
  // by recovery simulation before a pilot (Astra's checklist); off by default because it lengthens the session.
  reference: { enabled: false, levels: [0.10, 0.20, 0.40], repeats: 4, identicalPairs: 12 },

  // ---------------------------------------------------------------- stimulus geometry
  redraw: {
    enabled: true,                               // fold screen: draw the feature subspace again while its contour would fold anywhere the experiment can show
    rescale: true,                               // the Pavlovia generator as it was: u / v divided by their largest component when it exceeds 1.5 (before the screen)
    minRadius: 0.005,                            // the contour radius (0.3 + deviation) at the 50 rendered angles must stay above this = no fold, plus a small tolerance
                                                 // (v1.1.2 used 0.05, which also rejected ~40% of the fold-free subspaces and made the shapes rounder on average)
    // corners of everything the experiment can show: training support (+/- 6 sigma) and discrimination pairs up to level .7 at either centre
    checkCoords: [[-0.2, 0.05], [-0.2, 0.95], [1.2, 0.05], [1.2, 0.95], [-0.325, 0.5], [1.325, 0.5]],
    maxRedraws: 10000,
    // Rotation screen (v1.1.5, 2026-09-11 — Astra's finding on run 932457; Robert's decision, to be confirmed with Jacob): the
    // training phase rotates every exemplar at random, so two category means that are near-rotations of each other (a harmonic
    // coefficient changing sign between them) are indistinguishable for the participant. minRotatedGap > 0 draws the plane
    // again while the smaller of the A/B and B/C category-mean contour gaps after the best relative rotation is below it
    // (same metric as scripts/rotation_lottery.py). 0 = off (v1.1.4 behaviour). Reference: old online cohort A/B gap 10/50/90 %
    // .0067/.0138/.0202; of fold-free planes .008 rejects ~26 %, .010 ~35 %, .012 ~49 %. Logged on every row:
    // subspace_rot_gap_ab / _bc, subspace_redraws_rotation, subspace_min_rotated_gap.
    minRotatedGap: 0.010,
    // enabled: false restores the Pavlovia behaviour exactly (no screen, folded shapes included); logged per session:
    // subspace_redraws, subspace_min_radius, subspace_gain_u / v, subspace_vector1 / 2
  },
  // Saved, screened pool of feature spaces instead of a fresh draw per session (checklist item 4/5). Generate the pool with
  // `node tests/make_space_pool.mjs 40 > spaces_pool.json` (every space passes the redraw screen above). Assignment:
  // 'url' = ?space=<id> only (fall back to a fresh screened draw when absent), 'participant' = hash of the participant id
  // (same participant -> same space; good for reliability repeats), 'random' = random pool member. space_id is logged.
  spaces: { usePool: false, poolFile: 'spaces_pool.json', assignment: 'participant' },
  // Stimulus model (design decision for Jacob, 2026-09-10; default = the experiment as it has always run):
  //   'legacy' = Jacob's random plane through the 4-cube (create_subspace + rescale + fold screen above)
  //   'affine' = Astra's centred affine plane in the three visible harmonics: gain exactly K on both axes, axes orthogonal,
  //              contour radius ≥ .0548 everywhere the task can show (B = 1.25, K = 1.33) — no folds by construction.
  //              frame: 'fixed' = the same plane for every participant; 'random' = a random orthonormal frame per session
  //              (keeps "every participant gets a different plane"). Logged as subspace_model on every row.
  subspace: { model: 'legacy', affine: { B: 1.25, K: 1.33, frame: 'random' } },
  normFullD: false,                              // false = the original 2-component norm() (current design); true = full-D norm (raise with Jacob)
  antialias: true,                               // WebGL multisampling for the shape edges (requires the patched lib/ shipped here)
  // What the Escape key does. 'confirm' (default): a first press is logged and ignored, a second press within 3 s quits, so a
  // stray Escape (leaving fullscreen, closing another app's overlay) no longer ends the session with an _INCOMPLETE file.
  // 'quit' = the pavlovia behaviour (any Escape quits); 'ignore' = Escape never quits (close the tab; partial data are beaconed).
  escape: 'confirm',

  // ---------------------------------------------------------------- data
  data: {
    endpoint: 'https://discrimination-collect.robert-contofalsky.workers.dev/collect',                                // e.g. 'https://your-worker.workers.dev/collect' or '/collect' when served by server/collect.py; '' = download only
    token: 'Rs7mABxtLoO8YQS/duWhs999624Jr+aRtxMiFA5pYJ4=',                                   // must match the endpoint's token (COLLECT_TOKEN)
    autosaveMinutes: 3,                          // partial uploads while the session runs (0 = off)
    saveOnUnload: true,                          // beacon the partial data if the tab is closed early
    fallbackDownload: true,                      // offer the CSV as a download if the upload fails (or no endpoint)
    localBackup: true,                           // keep the last CSV in localStorage (recover.html lists them)
  },

  // ---------------------------------------------------------------- SONA / redirects ({survey_code} and {participant} are substituted)
  // Credit is granted three ways, any one of which is enough (README "SONA"): (1) the Worker calls SONA's server-side
  // completion URL the moment a COMPLETE file arrives (secret SONA_CREDIT_URL on the Worker); (2) the browser is sent to
  // the client-side completion URL below after the closing dialog; (3) the participant sees a completion code (below)
  // and survey_code is in every row, the file name and the upload index, so credit can be granted by hand in SONA.
  redirect: {
    completionUrl: 'https://rutgers-researchpool.sona-systems.com/webstudy_credit.aspx?experiment_id=1241&credit_token=321faaa19dc1453bb70cec3acb7332fc&survey_code={survey_code}',
    cancellationUrl: '',
  },
  sona: {
    participantFromSurveyCode: true,             // ?survey_code=... in the link becomes the participant id (dialog, file name, rows): one identity, not a random number plus a code
    showCompletionCode: true,                    // Thanks screen and closing dialog show "<participant> / <survey code>" (or just the participant id outside SONA)
    completionNote: 'Please keep this code. If your SONA credit has not appeared within 24 hours, contact {contact} and quote it.',
    contact: '',                                 // e.g. 'the Visual Cognition Lab (vcl@ruccs.rutgers.edu)'; '' = "the experimenter"
  },

  // ---------------------------------------------------------------- testing
  smoke: { discTrials: 6, catTrials: 12, refRepeats: 1, refIdenticalPairs: 2 },   // ?smoke=1: trials per staircase, categorization trials, reference block size
};
