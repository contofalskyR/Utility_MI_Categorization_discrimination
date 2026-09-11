/* config_astramodel.js — overlay: Astra's fixed-gain stimulus model (B = 1.25, K = 1.33) with a random orthonormal frame per
 * session, on the v1.1.3 base (grain 0.1). Beta-test edition, 2026-09-10 — a design change, not the running experiment. */
Object.assign(window.EXP_CONFIG, { buildVersion: 'selfhost_v1.1.5_2026-09-11_astramodel' });
window.EXP_CONFIG.subspace = { model: 'affine', affine: { B: 1.25, K: 1.33, frame: 'random' } };
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { minRotatedGap: 0 });   // comparison edition: the v1.1.5 rotation screen is off here (the rule as it was)
