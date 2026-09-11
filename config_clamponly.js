/* config_clamponly.js — overlay: the Pavlovia sampling exactly as it was (create_subspace + the maxVal > 1.5 rescale of u/v,
 * NO fold screen, folded shapes included). Everything else (grain 0.1, condition, logging) is config.js unchanged.
 * Comparison edition, 2026-09-10: Astra fold-only rule = config.js; old .05 screen = v1.1.2; this = original. */
Object.assign(window.EXP_CONFIG, { buildVersion: 'selfhost_v1.1.5_2026-09-11_clamponly' });
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { enabled: false });
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { minRotatedGap: 0 });   // comparison edition: the v1.1.5 rotation screen is off here (the rule as it was)
