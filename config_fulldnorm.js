/* config_fulldnorm.js — overlay: Jacob's generator with the full-D norm() (normFullD: true, what the commented-out
 * np.linalg.norm line did) + the Astra fold-only rule, on the v1.1.3 base (grain 0.1). Comparison edition, 2026-09-10. */
Object.assign(window.EXP_CONFIG, { buildVersion: 'selfhost_v1.1.5_2026-09-11_fulldnorm', normFullD: true });
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { minRotatedGap: 0 });   // comparison edition: the v1.1.5 rotation screen is off here (the rule as it was)
