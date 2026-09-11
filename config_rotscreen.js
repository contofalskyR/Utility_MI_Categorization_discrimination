/* config_rotscreen.js — overlay: the ROTATION SCREEN candidate (2026-09-11). Jacob's generator + the Pavlovia rescale + the
 * fold-only redraw (config.js), plus a second redraw criterion: the plane is drawn again while the A/B or B/C category means
 * are near-rotations of each other (contour gap after the best relative rotation below minRotatedGap). Everything else —
 * categories, sigma .075, payoffs, QUEST grain 0.1, logging — is config.js unchanged. The minimum is the one number to
 * choose (Jacob): .010 rejects about a third of fold-free planes; .008 about a quarter; .012 about half.
 * Both of Robert's 2026-09-11 planes (.0061, .0093) would have been redrawn at .010. Since v1.1.5 this is the default of config.js (minRotatedGap .010); the overlay only tags the build. */
Object.assign(window.EXP_CONFIG, { buildVersion: 'selfhost_v1.1.5_2026-09-11_rotscreen' });
window.EXP_CONFIG.redraw = Object.assign({}, window.EXP_CONFIG.redraw, { minRotatedGap: 0.010 });
