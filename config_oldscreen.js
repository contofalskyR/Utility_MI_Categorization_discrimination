/* config_oldscreen.js — overlay: the v1.1.2 fold screen (contour radius must stay above .05, no Pavlovia rescale) on the
 * v1.1.3 base, so that grain 0.1 and everything else match the other comparison editions. 2026-09-10. */
Object.assign(window.EXP_CONFIG, { buildVersion: 'selfhost_v1.1.5_2026-09-11_oldscreen' });
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { enabled: true, rescale: false, minRadius: 0.05 });
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { minRotatedGap: 0 });   // comparison edition: the v1.1.5 rotation screen is off here (the rule as it was)
