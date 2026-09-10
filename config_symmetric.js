/**
 * config_symmetric.js — the SYMMETRIC study. Loaded after config.js (quest_sym.html, psi_sym.html, questplus_sym.html, or the
 * single-file build with --overlay config_symmetric.js); it overrides only what differs from the asymmetric study.
 * Everything else — task, stimuli, categories (A .25, B .5, C .75, sigma .075), utility matrix, feedback, delays, QUEST
 * parameters other than the grain, redraw screen, logging — is config.js unchanged.
 */
Object.assign(window.EXP_CONFIG, {
  buildVersion: 'selfhost_v1.1.2_2026-09-09_sym',
  expName: 'discrimination2024c',                 // the name both symmetric cohorts (lab Nov-Dec 2025, online Aug 2026) were collected under
  condition: 'symmetric',
  // BC probes at the midpoint between B (.5) and C (.75) instead of the utility-shifted .616 of the asymmetric study
  discriminationParameters: [[0.375, 0.5, 1, 0], [0.625, 0.5, 1, 0]],
});
// The symmetric online build (Pavlovia, Aug 2026) runs QUEST at grain .1 with no range (jsQUEST's 500-point grid); the
// collected asymmetric cohort ran grain .01. Replayed on Robert's 2026-08-23 symmetric session: 4 staircases, 200 trials,
// max |proposal difference| 5e-10. Set 0.01 to match the asymmetric self-hosted default instead — Jacob's call (see README).
window.EXP_CONFIG.methods.quest.quest.grain = 0.1;
