#!/usr/bin/env python3
"""build_experiment.py — derive the self-hosted experiment script from the deployed Pavlovia script by anchored,
exact-match patches (each anchor must occur exactly once). Also writes a unified diff for review.

usage: python3 build_experiment.py <deployed Asymmetric_Utility_discrimination_2025.js> <out dir>
"""
import re, sys, difflib, os

src_path, out_dir = sys.argv[1], sys.argv[2]
src = open(src_path, encoding='utf-8').read()
src = re.sub(r'[ \t]+\n', '\n', src)      # the Builder export has trailing whitespace on blank lines; normalise so anchors match
s = src
n_patches = 0

def patch(old, new, count=1):
    global s, n_patches
    c = s.count(old)
    if c != count:
        raise SystemExit(f'anchor found {c} times (expected {count}):\n{old[:300]}')
    s = s.replace(old, new)
    n_patches += 1

# ----------------------------------------------------------------------------------------------- 1. header / imports
patch("""import { core, data, sound, util, visual, hardware } from './lib/psychojs-2024.2.4.js';
const { PsychoJS } = core;
const { TrialHandler, MultiStairHandler } = data;
const { Scheduler } = util;
""", """import { core, data, sound, util, visual, hardware } from './lib/psychojs-2024.2.4.js';
import { Staircase, Interleaver, FixedBlock } from './adaptive.js';
import { installDataSaver, fillUrl } from './datasaver.js';
const { PsychoJS } = core;
const { TrialHandler, MultiStairHandler } = data;
const { Scheduler } = util;

// ---- self-hosted build (2026-09-07): configuration from config.js, adaptive method from the URL / entry page ----------
const CONFIG = window.EXP_CONFIG;
const URL_PARAMS = new URLSearchParams(window.location.search);
const ADAPTIVE_METHOD = (URL_PARAMS.get('method') || window.EXP_METHOD || CONFIG.method || 'quest').toLowerCase();
if (!CONFIG.methods[ADAPTIVE_METHOD]) throw new Error('unknown adaptive method: ' + ADAPTIVE_METHOD);
const SMOKE = ['1', 'true', 'yes'].includes(String(URL_PARAMS.get('smoke') || window.EXP_SMOKE || '').toLowerCase());   // ?smoke=1 or the single-file launcher
const BUILD_VERSION = CONFIG.buildVersion + (SMOKE ? '_SMOKE' : '');
window.__EXP = { method: ADAPTIVE_METHOD, smoke: SMOKE, build: BUILD_VERSION, routine: null, trial: null, staircases: {} };   // debug / test-driver state
""")

# ----------------------------------------------------------------------------------------------- 1b. expose psychoJS for the test driver
patch("""const psychoJS = new PsychoJS({
  debug: true
});
""", """const psychoJS = new PsychoJS({
  debug: true
});
window.__EXP.psychoJS = psychoJS;   // for the headless test driver / console debugging
// single-file build (build/build_singlefile.py): the resources are embedded in the page and handed over here, so that
// nothing is fetched (file:// pages cannot fetch). Harmless when window.EXP_EMBEDDED_RESOURCES is absent.
if (window.EXP_EMBEDDED_RESOURCES) {
  for (const [name, data] of Object.entries(window.EXP_EMBEDDED_RESOURCES))
    psychoJS.serverManager._resources.set(name, { status: core.ServerManager.ResourceStatus.DOWNLOADED, path: name, data: data });
}
""")

# ----------------------------------------------------------------------------------------------- 1c. expose the shape stimuli for the render check
patch("""  Resp_s_or_d = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
""", """  Resp_s_or_d = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  window.__EXP.stims = { Shape1: Shape1, Shape2: Shape2 };   // for the headless render check (tests/run_headless.py)
""")

# ----------------------------------------------------------------------------------------------- 1d. flow: fixed-level reference blocks after each adaptive phase
patch("""const PreTestLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PreTestLoopBegin(PreTestLoopScheduler));
flowScheduler.add(PreTestLoopScheduler);
flowScheduler.add(PreTestLoopEnd);
""", """const PreTestLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PreTestLoopBegin(PreTestLoopScheduler));
flowScheduler.add(PreTestLoopScheduler);
flowScheduler.add(PreTestLoopEnd);
// self-hosted build: optional fixed-level reference block (CONFIG.reference), does not update any staircase
const PreRefLoopScheduler = new Scheduler(psychoJS);
if (CONFIG.reference && CONFIG.reference.enabled) {
  flowScheduler.add(RefLoopBegin('PreRef', PreRefLoopScheduler));
  flowScheduler.add(PreRefLoopScheduler);
  flowScheduler.add(RefLoopEnd('PreRef'));
}
""")
patch("""const PostTestLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PostTestLoopBegin(PostTestLoopScheduler));
flowScheduler.add(PostTestLoopScheduler);
flowScheduler.add(PostTestLoopEnd);
""", """const PostTestLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PostTestLoopBegin(PostTestLoopScheduler));
flowScheduler.add(PostTestLoopScheduler);
flowScheduler.add(PostTestLoopEnd);
const PostRefLoopScheduler = new Scheduler(psychoJS);
if (CONFIG.reference && CONFIG.reference.enabled) {
  flowScheduler.add(RefLoopBegin('PostRef', PostRefLoopScheduler));
  flowScheduler.add(PostRefLoopScheduler);
  flowScheduler.add(RefLoopEnd('PostRef'));
}
""")

# ----------------------------------------------------------------------------------------------- 2. resources
patch("""  resources: [
    // resources:
    {'name': 'PRETEST_INSTRUCTIONS-new.xlsx', 'path': 'PRETEST_INSTRUCTIONS-new.xlsx'},
    {'name': 'quest_conditions.xlsx', 'path': 'quest_conditions.xlsx'},
    {'name': 'Categorization.xlsx', 'path': 'Categorization.xlsx'},
    {'name': 'POSTTEST_INSTRUCTIONS-new.xlsx', 'path': 'POSTTEST_INSTRUCTIONS-new.xlsx'},
    {'name': 'quest_conditions.xlsx', 'path': 'quest_conditions.xlsx'},
    {'name': 'https://lib.pavlovia.org/vendors/jsQUEST.min.js', 'path': 'https://lib.pavlovia.org/vendors/jsQUEST.min.js'},
    {'name': 'default.png', 'path': 'https://pavlovia.org/assets/default/default.png'},
    {'name': 'https://lib.pavlovia.org/vendors/jsQUEST.min.js', 'path': 'https://lib.pavlovia.org/vendors/jsQUEST.min.js'},
    {'name': 'green_square.png', 'path': 'green_square.png'},
    {'name': 'blue_square.png', 'path': 'blue_square.png'},
    {'name': 'red_square.png', 'path': 'red_square.png'},
  ]
""", """  resources: [
    // resources (all local; jsQUEST and pavlovia's default.png are no longer needed)
    {'name': 'PRETEST_INSTRUCTIONS-new.xlsx', 'path': 'PRETEST_INSTRUCTIONS-new.xlsx'},
    {'name': 'Categorization.xlsx', 'path': 'Categorization.xlsx'},
    {'name': 'POSTTEST_INSTRUCTIONS-new.xlsx', 'path': 'POSTTEST_INSTRUCTIONS-new.xlsx'},
    {'name': 'green_square.png', 'path': 'green_square.png'},
    {'name': 'blue_square.png', 'path': 'blue_square.png'},
    {'name': 'red_square.png', 'path': 'red_square.png'},
  ]
""")

# ----------------------------------------------------------------------------------------------- 3. updateInfo: method, data saver, redirects
patch("""  // add info from the URL:
  util.addInfoFromUrl(expInfo);



  psychoJS.experiment.dataFileName = (("." + "/") + `data/${expInfo["participant"]}_${expName}_${expInfo["date"]}`);
  psychoJS.experiment.field_separator = '\\t';
""", """  // add info from the URL:
  util.addInfoFromUrl(expInfo);
  // self-hosted build: record the adaptive method and build in every row, name the file after the method as well
  expInfo['method'] = ADAPTIVE_METHOD;
  expInfo['build_version'] = BUILD_VERSION;
  expInfo['antialias_requested'] = String(window.PSYCHOJS_ANTIALIAS !== false);

  psychoJS.experiment.dataFileName = (("." + "/") + `data/${expInfo["participant"]}_${expName}_${ADAPTIVE_METHOD}_${expInfo["date"]}`);
  psychoJS.experiment.field_separator = '\\t';
  // self-hosted build: uploads (or downloads) replace pavlovia's data handling; SONA-style redirects after completion
  installDataSaver(psychoJS, CONFIG, { participant: expInfo['participant'], session: expInfo['session'], expName: expName, method: ADAPTIVE_METHOD, buildVersion: BUILD_VERSION });
  const urlValues = { survey_code: URL_PARAMS.get('survey_code') || expInfo['survey_code'] || '', participant: expInfo['participant'], session: expInfo['session'] };
  psychoJS.setRedirectUrls(fillUrl(CONFIG.redirect.completionUrl, urlValues) || undefined, fillUrl(CONFIG.redirect.cancellationUrl, urlValues) || undefined);
""")

# ----------------------------------------------------------------------------------------------- 4. module-level declarations
patch("""var feature_space;
var discrimination_parameters;
""", """var feature_space;
var subspace_redraws;
var subspace_redraws_rotation;
var subspace_rot_gap_ab;
var subspace_rot_gap_bc;
var subspace_min_radius;
var subspace_gain_u;
var subspace_gain_v;
var space_id;
var space_source;
var CHECK_COORDS;
var is_catch;
var currentBlock;
var discrimination_parameters;
""")

# ----------------------------------------------------------------------------------------------- 5. norm(): optional full-D
patch("""  function norm(vec) {
      var x, y;
      x = vec[0];
      y = vec[1];
      return Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5);
  }
""", """  function norm(vec) {
      // original build: two-component norm (kept as the design; CONFIG.normFullD = true switches to the full-D norm — Jacob's call)
      if (CONFIG.normFullD) { var s = 0; for (var q = 0; q < vec.length; q++) s = s + vec[q] * vec[q]; return Math.pow(s, 0.5); }
      var x, y;
      x = vec[0];
      y = vec[1];
      return Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5);
  }
""")

# ----------------------------------------------------------------------------------------------- 6. categorization length (smoke mode)
patch("""  maxTrials = 300;
  proportionToFinish = 0.5;
""", """  maxTrials = SMOKE ? CONFIG.smoke.catTrials : 300;
  proportionToFinish = 0.5;
""")

# ----------------------------------------------------------------------------------------------- 7. subspace: redraw rule replaces the maxVal rescaling
patch("""  // Run 'Begin Experiment' code from DiscrimParameters
  D = 4;
  feature_space = create_subspace(D);
  discrimination_parameters = [];
  discrimination_parameters.push([0.375, 0.5, 1, 0]);
  discrimination_parameters.push([0.616, 0.5, 1, 0]);

  for (let i = 1; i < feature_space.length; i++) {
    let vec = feature_space[i];
    let maxVal = Math.max(...vec.map(Math.abs));
    if (maxVal > 1.5) {
        console.log("Normalizing extreme feature vector", i, "with max value", maxVal);
        feature_space[i] = vec.map(v => v / maxVal);
    }
  }
  console.log("Final feature_space:", JSON.stringify(feature_space));


  console.log("=== FEATURE_SPACE CREATION ===");
  console.log("feature_space created:", JSON.stringify(feature_space));
  console.log("Window exists?", typeof psychoJS.window);
  console.log("Window size:", psychoJS.window ? psychoJS.window.size : "undefined");
""", """  // Run 'Begin Experiment' code from DiscrimParameters
  D = 4;
  // self-hosted build: fold screen — the feature subspace is drawn exactly as the Pavlovia build drew it (create_subspace,
  // then u / v rescaled when a component exceeds 1.5) and drawn again when the contour radius (0.3 + deviation) at the 50
  // rendered angles falls below CONFIG.redraw.minRadius (a small tolerance above 0) at any corner of the region the
  // experiment can show (the radius is affine in x, y, so the six corners bound it). Accepted subspaces are untouched, so
  // every shape shown is one the old build could have shown; only the folded ones are excluded.
  function min_contour_radius(subspace, coords_list) {
      var o = subspace[0], u = subspace[1], v = subspace[2];
      var N = 50, m = 10.0;
      for (var c = 0; c < coords_list.length; c++) {
          var x = coords_list[c][0], y = coords_list[c][1];
          var par = vector_plus(vector_plus(o, scalar_product(x, u)), scalar_product(y, v));
          for (var i = 0; i < N; i++) {
              var dev = 0;
              for (var k = 0; k < par.length; k++) dev = dev + 0.1 * par[k] * Math.sin(k * (i - 1) * (2 * 3.14159265359 / N));
              if (0.3 + dev < m) m = 0.3 + dev;
          }
      }
      return m;
  }
  CHECK_COORDS = CONFIG.redraw.checkCoords;
  subspace_redraws = 0;
  space_id = null; space_source = 'drawn';
  feature_space = null;
  // (a) a saved, screened pool of spaces (CONFIG.spaces): ?space=<id>, or by participant hash, or random
  if (CONFIG.spaces && CONFIG.spaces.usePool) {
      try {
          const pool = await (await fetch(CONFIG.spaces.poolFile, { cache: 'no-cache' })).json();
          const list = Array.isArray(pool) ? pool : pool.spaces;
          let pick = null;
          const wanted = URL_PARAMS.get('space');
          if (wanted !== null) pick = list.find(function (sp) { return String(sp.id) === String(wanted); }) || null;
          else if (CONFIG.spaces.assignment === 'participant') { let h = 0; const pid = String(expInfo['participant']); for (let c = 0; c < pid.length; c++) h = (h * 31 + pid.charCodeAt(c)) >>> 0; pick = list[h % list.length]; }
          else if (CONFIG.spaces.assignment === 'random') pick = list[Math.floor(Math.random() * list.length)];
          if (pick) { feature_space = [pick.origin.slice(), pick.u.slice(), pick.v.slice()]; space_id = pick.id; space_source = 'pool'; }
      } catch (e) { console.error('space pool unavailable, drawing a fresh space instead', e); }
  }
  // Astra's centred affine model (2026-09-10, CONFIG.subspace.model = 'affine'): p(x, y) = B·n + K[(x − .5)·e_x + (y − .5)·e_y]
  // with n, e_x, e_y an orthonormal frame in the three visible harmonics — the fixed frame n = (1,1,1)/√3, e_x = (1,0,−1)/√2,
  // e_y = (1,−2,1)/√6, or a uniformly random orthonormal frame per session (frame: 'random'). Visible gain exactly K on both
  // axes, axes orthogonal, and the contour radius stays ≥ .0548 everywhere the task can show for B = 1.25, K = 1.33
  // (analytic certificate, any frame) — no fold, no rescale, no redraw. The k = 0 component is 0 (it never moves the contour).
  function create_subspace_affine(D) {
      if (D !== 4) throw new Error('the affine subspace model needs D = 4');
      var cfg = (CONFIG.subspace && CONFIG.subspace.affine) || {};
      var B = (cfg.B !== undefined) ? cfg.B : 1.25, K = (cfg.K !== undefined) ? cfg.K : 1.33;
      var n, ex, ey;
      if (cfg.frame === 'random') {
          function gauss() { var u1 = Math.random() || 1e-12, u2 = Math.random(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
          function nrm(w) { var l = Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]); return [w[0] / l, w[1] / l, w[2] / l]; }
          function d3(p, q) { return p[0] * q[0] + p[1] * q[1] + p[2] * q[2]; }
          var a = [gauss(), gauss(), gauss()], b = [gauss(), gauss(), gauss()], c = [gauss(), gauss(), gauss()];
          n = nrm(a);                                                                   // Gram–Schmidt: a uniformly random orthonormal frame
          var t = d3(b, n); ex = nrm([b[0] - t * n[0], b[1] - t * n[1], b[2] - t * n[2]]);
          var t1 = d3(c, n), t2 = d3(c, ex); ey = nrm([c[0] - t1 * n[0] - t2 * ex[0], c[1] - t1 * n[1] - t2 * ex[1], c[2] - t1 * n[2] - t2 * ex[2]]);
      } else {
          n = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)]; ex = [1 / Math.sqrt(2), 0, -1 / Math.sqrt(2)]; ey = [1 / Math.sqrt(6), -2 / Math.sqrt(6), 1 / Math.sqrt(6)];
      }
      var u = [0, K * ex[0], K * ex[1], K * ex[2]], v = [0, K * ey[0], K * ey[1], K * ey[2]], base = [0, B * n[0], B * n[1], B * n[2]];
      var origin = base.map(function (x, i) { return x - 0.5 * (u[i] + v[i]); });      // so that p = origin + x·u + y·v as everywhere else
      return [origin, u, v];
  }
  // (b) the Pavlovia generator: create_subspace, then u / v rescaled when a component exceeds 1.5 (CONFIG.redraw.rescale)
  function draw_feature_space() {
      if (CONFIG.subspace && CONFIG.subspace.model === 'affine') return create_subspace_affine(D);
      var fs = create_subspace(D);
      if (CONFIG.redraw.rescale !== false) {
          for (let i = 1; i < fs.length; i++) {
              let vec = fs[i];
              let maxVal = Math.max(...vec.map(Math.abs));
              if (maxVal > 1.5) { fs[i] = vec.map(v => v / maxVal); }
          }
      }
      return fs;
  }
  // (c') the rotation screen (candidate design change, 2026-09-11; CONFIG.redraw.minRotatedGap > 0 switches it on, default 0 = off).
  // Astra's finding on run 932457: when a harmonic coefficient changes sign between two category means, the two means differ
  // in that harmonic only by a rotation (flipping the sign of harmonic k is a rotation by 180/k degrees), and the training
  // phase rotates every exemplar at random — so A and B can be near-identical for the participant. The criterion is the
  // contour gap between the category means after the best relative rotation (the metric of scripts/rotation_lottery.py:
  // arc-length-resampled polygons, centroid removed, symmetric closest-point RMS, rotation searched on a 36-angle grid with a
  // golden-section refinement); the plane is drawn again while the smaller of the A/B and B/C gaps is below minRotatedGap.
  function contour_polygon(par) {                                                   // the 50-vertex polygon the experiment draws
      var N = 50, pts = [];
      for (var i = 0; i < N; i++) {
          var dev = 0;
          for (var k = 0; k < par.length; k++) dev = dev + 0.1 * par[k] * Math.sin(k * (i - 1) * (2 * Math.PI / N));
          pts.push([(0.3 + dev) * Math.cos(i * 2 * Math.PI / N), (0.3 + dev) * Math.sin(i * 2 * Math.PI / N)]);
      }
      return pts;
  }
  function resample_centred(P, M) {                                                 // closed polygon -> M points equally spaced along the perimeter, centroid removed
      var Q = P.concat([P[0]]), s = [0];
      for (var i = 1; i < Q.length; i++) s.push(s[i - 1] + Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]));
      var L = s[s.length - 1], out = [], j = 0, cx = 0, cy = 0;
      for (var m = 0; m < M; m++) {
          var t = L * m / M;
          while (j < s.length - 2 && s[j + 1] < t) j++;
          var f = (t - s[j]) / ((s[j + 1] - s[j]) || 1e-12);
          var x = Q[j][0] + f * (Q[j + 1][0] - Q[j][0]), y = Q[j][1] + f * (Q[j + 1][1] - Q[j][1]);
          out.push([x, y]); cx += x; cy += y;
      }
      cx /= M; cy /= M;
      return out.map(function (q) { return [q[0] - cx, q[1] - cy]; });
  }
  function pt_seg_rms(P, Q) {                                                       // RMS over the points of P of the distance to the closed polyline Q
      var tot = 0, n = Q.length;
      for (var a = 0; a < P.length; a++) {
          var best = Infinity, px = P[a][0], py = P[a][1];
          for (var b = 0; b < n; b++) {
              var ax = Q[b][0], ay = Q[b][1], bx = Q[(b + 1) % n][0], by = Q[(b + 1) % n][1];
              var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy + 1e-12;
              var t = ((px - ax) * dx + (py - ay) * dy) / l2; t = t < 0 ? 0 : (t > 1 ? 1 : t);
              var ex = px - (ax + t * dx), ey = py - (ay + t * dy), d2 = ex * ex + ey * ey;
              if (d2 < best) best = d2;
          }
          tot += best;
      }
      return Math.sqrt(tot / P.length);
  }
  function rotate_pts(Q, phi) { var c = Math.cos(phi), s = Math.sin(phi); return Q.map(function (q) { return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; }); }
  function rotated_gap(par1, par2) {                                                // contour gap after the best relative rotation
      var P = resample_centred(contour_polygon(par1), 160), Q = resample_centred(contour_polygon(par2), 160);
      var g = function (phi) { var R = rotate_pts(Q, phi); return 0.5 * (pt_seg_rms(P, R) + pt_seg_rms(R, P)); };
      var NR = 36, vals = [], best = 0;
      for (var i = 0; i < NR; i++) { vals.push(g(2 * Math.PI * i / NR)); if (vals[i] < vals[best]) best = i; }
      var lo = 2 * Math.PI * best / NR - 2 * Math.PI / NR, hi = 2 * Math.PI * best / NR + 2 * Math.PI / NR;
      for (var it = 0; it < 10; it++) {
          var a = hi - 0.618 * (hi - lo), b = lo + 0.618 * (hi - lo);
          if (g(a) < g(b)) hi = b; else lo = a;
      }
      return Math.min(vals[best], g(0.5 * (lo + hi)));
  }
  function category_gaps(subspace) {                                                // [A/B gap, B/C gap] between the category means (.25,.5), (.5,.5), (.75,.5)
      var o = subspace[0], u = subspace[1], v = subspace[2];
      var par = function (x, y) { return vector_plus(vector_plus(o, scalar_product(x, u)), scalar_product(y, v)); };
      var A = par(0.25, 0.5), B = par(0.5, 0.5), C = par(0.75, 0.5);
      return [rotated_gap(A, B), rotated_gap(B, C)];
  }
  var MIN_ROT_GAP = (CONFIG.redraw.minRotatedGap > 0) ? CONFIG.redraw.minRotatedGap : 0;
  subspace_redraws_rotation = 0;
  function plane_rejected(fs) {
      if (CONFIG.redraw.enabled && min_contour_radius(fs, CHECK_COORDS) < CONFIG.redraw.minRadius) return 'fold';
      if (MIN_ROT_GAP > 0) { var gg = category_gaps(fs); if (Math.min(gg[0], gg[1]) < MIN_ROT_GAP) return 'rotation'; }
      return null;
  }
  // (c) the screens: draw again while the contour would fold anywhere the experiment can show (CONFIG.redraw.enabled), or, when
  // the rotation screen is on, while the category means are near-rotations of each other
  if (feature_space === null) {
      feature_space = draw_feature_space();
      var why = plane_rejected(feature_space);
      while (why !== null && subspace_redraws < CONFIG.redraw.maxRedraws) {
          feature_space = draw_feature_space();
          subspace_redraws = subspace_redraws + 1;
          if (why === 'rotation') subspace_redraws_rotation = subspace_redraws_rotation + 1;
          why = plane_rejected(feature_space);
      }
  }
  subspace_min_radius = min_contour_radius(feature_space, CHECK_COORDS);
  var _gaps = category_gaps(feature_space); subspace_rot_gap_ab = _gaps[0]; subspace_rot_gap_bc = _gaps[1];
  // visible gain of each direction: the k = 0 harmonic does not move the contour (sin(0) = 0), so only components 1..D-1 count
  subspace_gain_u = Math.sqrt(feature_space[1].slice(1).reduce(function (a, x) { return a + x * x; }, 0));
  subspace_gain_v = Math.sqrt(feature_space[2].slice(1).reduce(function (a, x) { return a + x * x; }, 0));
  discrimination_parameters = CONFIG.discriminationParameters.map(function (r) { return r.slice(); });
  console.log("feature_space:", JSON.stringify(feature_space), "source:", space_source, space_id, "redraws:", subspace_redraws, "(rotation:", subspace_redraws_rotation, ") min contour radius:", subspace_min_radius, "gain u/v:", subspace_gain_u, subspace_gain_v, "rotated gaps A/B, B/C:", subspace_rot_gap_ab, subspace_rot_gap_bc, "min required:", MIN_ROT_GAP);
  window.__EXP.feature_space = feature_space; window.__EXP.subspace_redraws = subspace_redraws; window.__EXP.subspace_min_radius = subspace_min_radius; window.__EXP.space_id = space_id;
  window.__EXP.subspace_rot_gap_ab = subspace_rot_gap_ab; window.__EXP.subspace_rot_gap_bc = subspace_rot_gap_bc; window.__EXP.subspace_redraws_rotation = subspace_redraws_rotation; window.__EXP.min_rotated_gap = MIN_ROT_GAP;
""")

# ----------------------------------------------------------------------------------------------- 8. feedback image placeholder
patch("""    image : 'default.png', mask : undefined,""", """    image : 'green_square.png', mask : undefined,""")

# ----------------------------------------------------------------------------------------------- 9. PreTest loop: TrialHandler + Interleaver
patch("""var PreTestConditions;
var PreTest;
function PreTestLoopBegin(PreTestLoopScheduler, snapshot) {
  return async function() {
    // setup a MultiStairTrialHandler
    PreTestConditions = TrialHandler.importConditions(psychoJS.serverManager, 'quest_conditions.xlsx');
    PreTest = new data.MultiStairHandler({stairType:MultiStairHandler.StaircaseType.QUEST,
      psychoJS: psychoJS,
      name: 'PreTest',
      varName: 'intensity',
      nTrials: 30, maxTrials: 200,
      conditions: PreTestConditions,
      method: TrialHandler.Method.RANDOM
    });
    psychoJS.experiment.addLoop(PreTest); // add the loop to the experiment
    currentLoop = PreTest;  // we're now the current loop
    // Schedule all the trials in the trialList:
    for (const thisQuestLoop of PreTest) {
      PreTestLoopScheduler.add(PreTestLoopBeginIteration(snapshot));
      snapshot = PreTest.getSnapshot();
      PreTestLoopScheduler.add(importConditions(snapshot));
      PreTestLoopScheduler.add(DiscriminationTrialRoutineBegin(snapshot));
      PreTestLoopScheduler.add(DiscriminationTrialRoutineEachFrame());
      PreTestLoopScheduler.add(DiscriminationTrialRoutineEnd());
    // then iterate over this loop (PreTest)
    PreTestLoopScheduler.add(PreTestLoopEndIteration(PreTestLoopScheduler, snapshot));
    }

    return Scheduler.Event.NEXT;
  }
}


var level;
function PreTestLoopBeginIteration(snapshot) {
  return async function() {
    // ------Prepare for next entry------
    level = PreTest.intensity;

    return Scheduler.Event.NEXT;
  }
}
""", """var PreTestConditions;
var PreTest;
var PreTestStaircases;
var PostTestStaircases;
var currentInterleaver;
var currentPlan;
var currentPhaseName;
/** self-hosted build: one Staircase (adaptive.js) per boundary, parameters from config.js */
function makeStaircases(phaseName) {
  const mcfg = CONFIG.methods[ADAPTIVE_METHOD];
  const maxTrials = SMOKE ? CONFIG.smoke.discTrials : mcfg.maxTrials;
  const stairs = CONFIG.boundaries.map(function (b) {
    return new Staircase({
      method: ADAPTIVE_METHOD, label: b.label, featureIndex: b.featureIndex,
      maxTrials: maxTrials, minTrials: mcfg.minTrials || 0,
      stopInterval: (typeof mcfg.stopInterval === 'undefined') ? null : mcfg.stopInterval,
      stopAlphaSd: (typeof mcfg.stopAlphaSd === 'undefined') ? null : mcfg.stopAlphaSd,
      minLevel: CONFIG.levelRange[0], maxLevel: CONFIG.levelRange[1],
      catchPolicy: mcfg.catchPolicy || 'forced50', catchMin: (typeof mcfg.catchMin === 'undefined') ? 0.3 : mcfg.catchMin,
      quest: mcfg.quest || {}, grid: mcfg.grid || {}, firstLevel: mcfg.firstLevel || 'quantile',
    });
  });
  window.__EXP.staircases[phaseName] = stairs;
  return stairs;
}
/** columns written on every trial row of the self-hosted build */
function logSessionColumns() {
  psychoJS.experiment.addData('build_version', BUILD_VERSION);
  psychoJS.experiment.addData('adaptive_method', ADAPTIVE_METHOD);
  psychoJS.experiment.addData('subspace_redraws', subspace_redraws);
  psychoJS.experiment.addData('subspace_min_radius', subspace_min_radius);
  psychoJS.experiment.addData('subspace_rot_gap_ab', subspace_rot_gap_ab); psychoJS.experiment.addData('subspace_rot_gap_bc', subspace_rot_gap_bc);   // category-mean contour gaps after the best rotation (rotation screen, 2026-09-11)
  psychoJS.experiment.addData('subspace_redraws_rotation', subspace_redraws_rotation); psychoJS.experiment.addData('subspace_min_rotated_gap', (CONFIG.redraw.minRotatedGap > 0) ? CONFIG.redraw.minRotatedGap : 0);
  psychoJS.experiment.addData('subspace_center', JSON.stringify(feature_space[0]));
  psychoJS.experiment.addData('subspace_vector1', JSON.stringify(feature_space[1]));
  psychoJS.experiment.addData('subspace_vector2', JSON.stringify(feature_space[2]));
  psychoJS.experiment.addData('gl_antialias', glAntialias());
  psychoJS.experiment.addData('subspace_gain_u', subspace_gain_u);
  psychoJS.experiment.addData('subspace_gain_v', subspace_gain_v);
  psychoJS.experiment.addData('space_id', (space_id === null) ? '' : space_id);
  psychoJS.experiment.addData('space_source', space_source);
  psychoJS.experiment.addData('subspace_model', (CONFIG.subspace && CONFIG.subspace.model === 'affine') ? ('affine_' + ((CONFIG.subspace.affine && CONFIG.subspace.affine.frame) || 'fixed') + '_B' + ((CONFIG.subspace.affine && CONFIG.subspace.affine.B) || 1.25) + '_K' + ((CONFIG.subspace.affine && CONFIG.subspace.affine.K) || 1.33)) : 'legacy');
  psychoJS.experiment.addData('shape_size_height_units', 0.25);
  try { psychoJS.experiment.addData('window_size_px', JSON.stringify(psychoJS.window.size)); psychoJS.experiment.addData('device_pixel_ratio', window.devicePixelRatio); } catch (e) {}
}
function glAntialias() {
  try { const r = psychoJS.window._renderer; if (r && r.gl) return r.gl.getContextAttributes().antialias ? 1 : 0; return 'canvas'; } catch (e) { return 'unknown'; }
}
/** staircase parameters, logged under <phase>.<name> as PsychoJS's MultiStairHandler did */
function logStaircaseParams(phase, st) {
  const add = function (k, v) { psychoJS.experiment.addData(phase + '.' + k, (v === null || typeof v === 'undefined') ? '' : v); };
  add('minVal', st.minLevel); add('maxVal', st.maxLevel); add('maxTrials', st.maxTrials); add('nTrials', st.minTrials);
  add('catchPolicy', st.catchPolicy); add('firstLevel', st.firstLevel); add('method', st.method);
  if (st.method === 'quest') {
    const q = st.engine;
    add('startVal', q.tGuess); add('startValSd', q.tGuessSd); add('pThreshold', q.pThreshold); add('beta', q.beta); add('delta', q.delta);
    add('gamma', q.gamma); add('grain', q.grain); add('range', q.range); add('stopInterval', st.stopInterval); add('grid_dim', q.dim); add('quantileOrder', q.quantileOrder);
  } else {
    add('stopAlphaSd', st.stopAlphaSd); add('grid_params', st.engine.gp.nP); add('grid_levels', st.engine.gp.nS); add('lambda', (typeof st.engine.lambda === 'number') ? st.engine.lambda : '');
  }
}
function PreTestLoopBegin(PreTestLoopScheduler, snapshot) {
  return async function() {
    // self-hosted build: the staircases live in adaptive.js (Staircase / Interleaver); a plain TrialHandler drives the
    // loop and is ended early (PreTest.finished = true) once every staircase has finished.
    PreTestStaircases = makeStaircases('PreTest');
    currentInterleaver = new Interleaver(PreTestStaircases, { order: CONFIG.interleave || 'random' });
    currentPhaseName = 'PreTest';
    PreTest = new TrialHandler({
      psychoJS: psychoJS,
      nReps: PreTestStaircases.reduce(function (a, st) { return a + st.maxTrials; }, 0), method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: undefined,
      seed: undefined, name: 'PreTest'
    });
    psychoJS.experiment.addLoop(PreTest); // add the loop to the experiment
    currentLoop = PreTest;  // we're now the current loop
    // Schedule all the trials in the trialList:
    for (const thisQuestLoop of PreTest) {
      snapshot = PreTest.getSnapshot();
      PreTestLoopScheduler.add(PreTestLoopBeginIteration(snapshot));
      PreTestLoopScheduler.add(importConditions(snapshot));
      PreTestLoopScheduler.add(DiscriminationTrialRoutineBegin(snapshot));
      PreTestLoopScheduler.add(DiscriminationTrialRoutineEachFrame());
      PreTestLoopScheduler.add(DiscriminationTrialRoutineEnd(snapshot));
      // then iterate over this loop (PreTest)
      PreTestLoopScheduler.add(PreTestLoopEndIteration(PreTestLoopScheduler, snapshot));
    }

    return Scheduler.Event.NEXT;
  }
}


var level;
function PreTestLoopBeginIteration(snapshot) {
  return async function() {
    // ------Prepare for next entry------
    currentPlan = currentInterleaver.next();          // {staircase, label, featureIndex, level (clamped), rawLevel, isCatch} or null
    if (currentPlan === null) { PreTest.finished = true; return Scheduler.Event.NEXT; }
    level = currentPlan.level;

    return Scheduler.Event.NEXT;
  }
}
""")

# ----------------------------------------------------------------------------------------------- 10. PostTest loop
patch("""var PostTestConditions;
var PostTest;
function PostTestLoopBegin(PostTestLoopScheduler, snapshot) {
  return async function() {
    // setup a MultiStairTrialHandler
    PostTestConditions = TrialHandler.importConditions(psychoJS.serverManager, 'quest_conditions.xlsx');
    PostTest = new data.MultiStairHandler({stairType:MultiStairHandler.StaircaseType.QUEST,
      psychoJS: psychoJS,
      name: 'PostTest',
      varName: 'intensity',
      nTrials: 30, maxTrials: 200,
      conditions: PostTestConditions,
      method: TrialHandler.Method.RANDOM
    });
    psychoJS.experiment.addLoop(PostTest); // add the loop to the experiment
    currentLoop = PostTest;  // we're now the current loop
    // Schedule all the trials in the trialList:
    for (const thisQuestLoop of PostTest) {
      PostTestLoopScheduler.add(PostTestLoopBeginIteration(snapshot));
      snapshot = PostTest.getSnapshot();
      PostTestLoopScheduler.add(importConditions(snapshot));
      PostTestLoopScheduler.add(DiscriminationTrialRoutineBegin(snapshot));
      PostTestLoopScheduler.add(DiscriminationTrialRoutineEachFrame());
      PostTestLoopScheduler.add(DiscriminationTrialRoutineEnd());
    // then iterate over this loop (PostTest)
    PostTestLoopScheduler.add(PostTestLoopEndIteration(PostTestLoopScheduler, snapshot));
    }

    return Scheduler.Event.NEXT;
  }
}


function PostTestLoopBeginIteration(snapshot) {
  return async function() {
    // ------Prepare for next entry------
    level = PostTest.intensity;

    return Scheduler.Event.NEXT;
  }
}
""", """var PostTestConditions;
var PostTest;
function PostTestLoopBegin(PostTestLoopScheduler, snapshot) {
  return async function() {
    // self-hosted build: fresh staircases for the post-test (same parameters), see PreTestLoopBegin
    PostTestStaircases = makeStaircases('PostTest');
    currentInterleaver = new Interleaver(PostTestStaircases, { order: CONFIG.interleave || 'random' });
    currentPhaseName = 'PostTest';
    PostTest = new TrialHandler({
      psychoJS: psychoJS,
      nReps: PostTestStaircases.reduce(function (a, st) { return a + st.maxTrials; }, 0), method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: undefined,
      seed: undefined, name: 'PostTest'
    });
    psychoJS.experiment.addLoop(PostTest); // add the loop to the experiment
    currentLoop = PostTest;  // we're now the current loop
    // Schedule all the trials in the trialList:
    for (const thisQuestLoop of PostTest) {
      snapshot = PostTest.getSnapshot();
      PostTestLoopScheduler.add(PostTestLoopBeginIteration(snapshot));
      PostTestLoopScheduler.add(importConditions(snapshot));
      PostTestLoopScheduler.add(DiscriminationTrialRoutineBegin(snapshot));
      PostTestLoopScheduler.add(DiscriminationTrialRoutineEachFrame());
      PostTestLoopScheduler.add(DiscriminationTrialRoutineEnd(snapshot));
      // then iterate over this loop (PostTest)
      PostTestLoopScheduler.add(PostTestLoopEndIteration(PostTestLoopScheduler, snapshot));
    }

    return Scheduler.Event.NEXT;
  }
}


function PostTestLoopBeginIteration(snapshot) {
  return async function() {
    // ------Prepare for next entry------
    currentPlan = currentInterleaver.next();
    if (currentPlan === null) { PostTest.finished = true; return Scheduler.Event.NEXT; }
    level = currentPlan.level;

    return Scheduler.Event.NEXT;
  }
}


// self-hosted build: fixed-level reference block (PreRef / PostRef) — same DiscriminationTrial routine, no posterior update
var RefLoops = {};
function RefLoopBegin(phaseName, scheduler) {
  return async function() {
    const rc = CONFIG.reference;
    currentBlock = new FixedBlock({ boundaries: CONFIG.boundaries, levels: rc.levels, repeats: SMOKE ? CONFIG.smoke.refRepeats : rc.repeats, identicalPairs: SMOKE ? CONFIG.smoke.refIdenticalPairs : rc.identicalPairs }, { phaseLabel: phaseName });
    currentPhaseName = phaseName;
    window.__EXP.blocks = window.__EXP.blocks || {}; window.__EXP.blocks[phaseName] = currentBlock;
    const loop = new TrialHandler({
      psychoJS: psychoJS,
      nReps: currentBlock.length, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: undefined,
      seed: undefined, name: phaseName
    });
    RefLoops[phaseName] = loop;
    psychoJS.experiment.addLoop(loop);
    currentLoop = loop;
    for (const thisTrial of loop) {
      const snapshot = loop.getSnapshot();
      scheduler.add(RefLoopBeginIteration(loop, snapshot));
      scheduler.add(importConditions(snapshot));
      scheduler.add(DiscriminationTrialRoutineBegin(snapshot));
      scheduler.add(DiscriminationTrialRoutineEachFrame());
      scheduler.add(DiscriminationTrialRoutineEnd(snapshot));
      scheduler.add(PreTestLoopEndIteration(scheduler, snapshot));   // same end-of-iteration logic as the adaptive loops
    }
    return Scheduler.Event.NEXT;
  }
}
function RefLoopBeginIteration(loop, snapshot) {
  return async function() {
    currentPlan = currentBlock.next();
    if (currentPlan === null) { loop.finished = true; return Scheduler.Event.NEXT; }
    level = currentPlan.level;
    return Scheduler.Event.NEXT;
  }
}
function RefLoopEnd(phaseName) {
  return async function() {
    psychoJS.experiment.removeLoop(RefLoops[phaseName]);
    if (psychoJS.experiment._unfinishedLoops.length>0)
      currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
    else
      currentLoop = psychoJS.experiment;
    return Scheduler.Event.NEXT;
  }
}
""")

# ----------------------------------------------------------------------------------------------- 11. DiscriminationTrial Begin: plan instead of MultiStair state
patch("""    // Run 'Begin Routine' code from SetupTrial
    // Debug staircase loading
    if (typeof currentLoop !== 'undefined' && currentLoop.currentStaircase) {
        console.log("=== STAIRCASE DEBUG ===");
        console.log("_stopInterval:", currentLoop.currentStaircase._stopInterval);
        console.log("stopInterval:", currentLoop.currentStaircase.stopInterval);

        // Check if conditions were loaded
        if (currentLoop._conditions) {
            console.log("Loop conditions:", JSON.stringify(currentLoop._conditions));
        }

        // Check the original parameters
        if (currentLoop.currentStaircase._trialList) {
            console.log("Trial list:", JSON.stringify(currentLoop.currentStaircase._trialList));
        }
    }

    // FIX 2026-08-20: clamp QUEST proposals to the configured [minVal, maxVal].
    // psychojs never applies minVal/maxVal on real trials (only in simulate());
    // see AUDIT_PAVLOVIA_QUEST.md. Clamped BEFORE display and BEFORE addResponse.
    level = Math.min(0.7, Math.max(0.05, level));
    console.log("Quest Level (clamped to [0.05, 0.7]):", level);
    // FIX 2026-08-20: derive this trial's staircase identity HERE (Begin Routine);
    // the old End-Routine code ran after the handler had advanced to the next trial.
    if (typeof currentLoop !== "undefined" && currentLoop.currentStaircase) {
        feature_index = currentLoop.currentStaircase._name.includes("shape_difference1") ? 1 : 0;
    }

""", """    // Run 'Begin Routine' code from SetupTrial
    // self-hosted build: this trial's plan comes from the Interleaver (adaptive.js): which staircase, the level already
    // clamped to CONFIG.levelRange (before display and before the update), and whether it is an identical pair.
    if (currentPlan === null || typeof currentPlan === 'undefined') { continueRoutine = false; }
    feature_index = currentPlan ? currentPlan.featureIndex : 0;
    level = currentPlan ? currentPlan.level : level;
    is_catch = currentPlan ? currentPlan.isCatch : false;

""")

patch("""    if ((Math.random() < 0.5)) {
        correct_answer = "d";
        shape1 = shape_from_coordinates(coord1, feature_space, 10);
        shape2 = shape_from_coordinates(coord2, feature_space, 10);
    } else {
        correct_answer = "s";
        shape1 = shape_from_coordinates(feature_center, feature_space, 10);
        shape2 = shape_from_coordinates(feature_center, feature_space, 10);
    }
    // FIX 2026-08-20: log AFTER assignment -- these columns used to describe the previous trial
    psychoJS.experiment.addData('feature_index', feature_index);
    psychoJS.experiment.addData('feature_center', feature_center);
    psychoJS.experiment.addData('feature_vector', feature_vector);
    psychoJS.experiment.addData('correct_answer', correct_answer);
    psychoJS.experiment.addData('coord1', JSON.stringify(coord1));
    psychoJS.experiment.addData('coord2', JSON.stringify(coord2));
    psychoJS.experiment.addData('level_used', level);
    psychoJS.experiment.addData('staircase_label', (currentLoop.currentStaircase ? currentLoop.currentStaircase._name : ""));
""", """    if (!is_catch) {
        correct_answer = "d";
        shape1 = shape_from_coordinates(coord1, feature_space, 10);
        shape2 = shape_from_coordinates(coord2, feature_space, 10);
    } else {
        correct_answer = "s";
        coord1 = feature_center.slice();      // identical pair: both shapes at the centre (logged truthfully; the old build logged centre +/- level here)
        coord2 = feature_center.slice();
        shape1 = shape_from_coordinates(feature_center, feature_space, 10);
        shape2 = shape_from_coordinates(feature_center, feature_space, 10);
    }
    // FIX 2026-08-20: log AFTER assignment -- these columns used to describe the previous trial
    psychoJS.experiment.addData('feature_index', feature_index);
    psychoJS.experiment.addData('feature_center', feature_center);
    psychoJS.experiment.addData('feature_vector', feature_vector);
    psychoJS.experiment.addData('correct_answer', correct_answer);
    psychoJS.experiment.addData('coord1', JSON.stringify(coord1));
    psychoJS.experiment.addData('coord2', JSON.stringify(coord2));
    psychoJS.experiment.addData('level_used', level);
    psychoJS.experiment.addData('staircase_label', (currentPlan ? currentPlan.label : ""));
    psychoJS.experiment.addData('is_catch', is_catch ? 1 : 0);
    psychoJS.experiment.addData(currentPhaseName + '.intensity', (currentPlan ? currentPlan.rawLevel : ""));   // the engine's raw proposal (pre-clamp), the column PsychoJS wrote
    psychoJS.experiment.addData(currentPhaseName + '.label', (currentPlan ? currentPlan.label : ""));
    psychoJS.experiment.addData(currentPhaseName + '.trial_n', (currentPlan && currentPlan.staircase ? currentPlan.staircase.n + 1 : (currentPlan ? currentPlan.index : "")));
    psychoJS.experiment.addData(currentPhaseName + '.feature_index', feature_index);
    logSessionColumns();
    window.__EXP.trial = { phase: currentPhaseName, label: (currentPlan ? currentPlan.label : null), level: level, rawLevel: (currentPlan ? currentPlan.rawLevel : null), isCatch: is_catch, correct_answer: correct_answer, n: (currentPlan && currentPlan.staircase ? currentPlan.staircase.n : (currentPlan ? currentPlan.index : null)), reference: !!(currentPlan && currentPlan.staircase === null), routineStart: performance.now() };
""")

# ----------------------------------------------------------------------------------------------- 12. DiscriminationTrial End: feed the staircase, log its estimate
patch("""    // store data for current loop
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(Resp_s_or_d.corr, level);
    }
""", """    // store data for current loop
    // self-hosted build: feed the response to this trial's staircase (adaptive.js) and log its posterior summary
    if (currentPlan && currentPlan.staircase === null) {
      // reference block: log the response, update nothing
      var saidDifferentRef = (Resp_s_or_d.keys === 'd');
      currentBlock.addResponse(currentPlan, saidDifferentRef, Resp_s_or_d.rt);
      psychoJS.experiment.addData(currentPhaseName + '.response', Resp_s_or_d.corr);
      psychoJS.experiment.addData('said_different', saidDifferentRef ? 1 : 0);
      psychoJS.experiment.addData(currentPhaseName + '.block_index', currentPlan.index);
      psychoJS.experiment.addData(currentPhaseName + '.block_length', currentBlock.length);
      psychoJS.experiment.addData('updates_staircase', 0);
      window.__EXP.lastResult = { phase: currentPhaseName, label: currentPlan.label, level: level, isCatch: is_catch, saidDifferent: saidDifferentRef, reference: true, allFinished: currentBlock.finished };
      if (currentBlock.finished) { currentLoop.finished = true; }
    }
    if (currentPlan && currentPlan.staircase) {
      psychoJS.experiment.addData('updates_staircase', 1);
      var saidDifferent = (Resp_s_or_d.keys === 'd');
      var stairResult = currentPlan.staircase.addResponse({ level: level, isCatch: is_catch, saidDifferent: saidDifferent, rt: Resp_s_or_d.rt });
      psychoJS.experiment.addData(currentPhaseName + '.response', Resp_s_or_d.corr);
      psychoJS.experiment.addData('said_different', saidDifferent ? 1 : 0);
      for (var key in stairResult) { if (key !== 'correct' && stairResult.hasOwnProperty(key)) psychoJS.experiment.addData(currentPhaseName + '.' + key, stairResult[key]); }
      if (typeof stairResult.est_ci_lower !== 'undefined') {
        psychoJS.experiment.addData(currentPhaseName + '.CI_lower', stairResult.est_ci_lower);
        psychoJS.experiment.addData(currentPhaseName + '.CI_upper', stairResult.est_ci_upper);
        psychoJS.experiment.addData(currentPhaseName + '.CI_width', (typeof stairResult.est_ci_width !== 'undefined') ? stairResult.est_ci_width : (stairResult.est_ci_upper - stairResult.est_ci_lower));
      }
      psychoJS.experiment.addData(currentPhaseName + '.staircase_finished', currentPlan.staircase.finished ? 1 : 0);
      psychoJS.experiment.addData(currentPhaseName + '.finished_reason', currentPlan.staircase.finishedReason || '');
      logStaircaseParams(currentPhaseName, currentPlan.staircase);
      window.__EXP.lastResult = { phase: currentPhaseName, label: currentPlan.label, n: currentPlan.staircase.n, level: level, isCatch: is_catch, saidDifferent: saidDifferent, correct: stairResult.correct, est_alpha: stairResult.est_alpha, finished: currentPlan.staircase.finished, allFinished: currentInterleaver.finished };
      if (currentInterleaver.finished) { currentLoop.finished = true; }   // ends the TrialHandler loop after this row
    }
""")

patch("""    Resp_s_or_d.stop();
    if (typeof currentLoop !== 'undefined' && currentLoop !== null && currentLoop.name) {
        // FIX 2026-08-20: after addResponse the handler has already advanced to the
        // NEXT trial; look up THIS trial's staircase by name so the CI
        // columns describe the trial on this row (old code logged the next one).
        var _thisTrialStaircase = (currentLoop._staircases || []).find(function (s) { return s._name === ("shape_difference" + feature_index); }) || currentLoop.currentStaircase;
        if (_thisTrialStaircase && !currentLoop._finished) {
            try {
                // Get the confidence interval
                const confInt = _thisTrialStaircase.confInterval(false); // Get the array [5%, 95%]
                const confIntWidth = _thisTrialStaircase.confInterval(true); // Get the width

                // Log to console (keep your existing logging)
                console.log("Current staircase:", _thisTrialStaircase.name);
                console.log("StopInterval value:", _thisTrialStaircase._stopInterval);
                console.log("Confidence interval:", confIntWidth);
                console.log("Should stop?", confIntWidth < _thisTrialStaircase._stopInterval);
                console.log("Is finished?", _thisTrialStaircase._finished);

                // Add data to the experiment's data file
                psychoJS.experiment.addData(currentLoop.name + '.CI_lower', confInt[0]);
                psychoJS.experiment.addData(currentLoop.name + '.CI_upper', confInt[1]);
                psychoJS.experiment.addData(currentLoop.name + '.CI_width', confIntWidth);
            } catch (error) {
                console.error("Error calculating confidence interval:", error);
            }
        }
    }
    // FIX 2026-08-20: removed the End-Routine feature reassignment/logging block.
    // It wrote the NEXT trial's staircase values (and a hardcoded location
    // table) onto this row; Begin Routine now sets and logs everything.
""", """    Resp_s_or_d.stop();
    // (the MultiStairHandler CI block of the pavlovia build is replaced by the staircase summary logged above)
""")

# ----------------------------------------------------------------------------------------------- 13. dead MultiStairHandler hooks in the other routines
s, k = re.subn(r"\n    // update the trial handler\n    if \(currentLoop instanceof MultiStairHandler\) \{\n      currentLoop\.addResponse\(\w+\.corr, level\);\n    \}\n", "\n", s)
assert k == 5, k
n_patches += 1

# ----------------------------------------------------------------------------------------------- 14. categorization rows: session columns + driver state
patch("""    psychoJS.experiment.addData('subspace_vector2', JSON.stringify(subspace[2]));

    Stimulus.setPos([xpos, ypos]);
""", """    psychoJS.experiment.addData('subspace_vector2', JSON.stringify(subspace[2]));
    logSessionColumns();
    window.__EXP.trial = { phase: 'Categorization', trial_number: trial_number, true_category: true_category, routineStart: performance.now() };

    Stimulus.setPos([xpos, ypos]);
""")

# ----------------------------------------------------------------------------------------------- 15. routine name for the test driver
s, k = re.subn(r"(    //--- Prepare to start Routine '(\w+)' ---\n)", r"\1    window.__EXP.routine = '\2'; window.__EXP.routineStart = performance.now();\n", s)
assert k >= 10, k
n_patches += 1

# ----------------------------------------------------------------------------------------------- 16. header comment
patch("""/***********************************************
 * Asymmetric_Utility_Discrimination_2025 *
 ***********************************************/
""", """/***********************************************
 * Asymmetric_Utility_Discrimination_2025 *
 * self-hosted build (2026-09-07): derived from the pavlovia script
 * Asymmetric_Utility_discrimination_2025.js (project deployed 2026-08-23)
 * by build/build_experiment.py — see build/experiment.diff for every change.
 ***********************************************/
""")

# ----------------------------------------------------------------------------------------------- 16. anti-aliasing self-measurement
patch("""  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine

  return Scheduler.Event.NEXT;
}
""", """  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine

  // self-hosted build: measure the anti-aliasing this browser/GPU actually delivers (one hidden frame, see measureAntialias)
  AA_MEASURE = measureAntialias();
  console.log("anti-aliasing measurement:", JSON.stringify(AA_MEASURE));
  window.__EXP.aa = AA_MEASURE;

  return Scheduler.Event.NEXT;
}

/**
 * self-hosted build: draw a tilted square with the experiment's own ShapeStim, render one frame, read the pixels across one
 * of its edges and count the grey levels: 2 = aliased (the pavlovia rendering), 3 or more = multisampled. Logged as
 * aa_gray_levels / aa_intermediate_px / gl_samples on every trial row, so each session records what its display did.
 */
var AA_MEASURE = null;
function measureAntialias() {
  try {
    const win = psychoJS.window, r = win._renderer, gl = r ? r.gl : null;
    if (!gl) return { gray_levels: 'no-gl', intermediate_px: '', samples: '' };
    const ori0 = Shape1.ori, pos0 = Shape1.pos;                       // v1.1.4: the probe must leave the stimulus exactly as it found it (v1.1.0–v1.1.3 left Shape1 at 20 deg for the whole session — Astra's audit, 2026-09-11)
    Shape1.setOri(20); Shape1.setPos([0, 0]); Shape1.setAutoDraw(true);
    win.render();
    const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
    const half = 0.125 * H, th = 20 * Math.PI / 180;                 // the square is .25 height units wide, rotated 20 deg
    const cx = Math.round(W / 2 + half * Math.cos(th)), cy = Math.round(H / 2 - half * Math.sin(th));   // right-edge midpoint (ori is clockwise; GL y is up)
    const box = 60, buf = new Uint8Array(box * box * 4);
    gl.readPixels(cx - box / 2, cy - box / 2, box, box, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    const levels = new Set(); let inter = 0;
    for (let i = 0; i < box * box; i++) { const v = buf[i * 4]; if (v > 12 && v < 243) inter++; levels.add(v >> 3); }
    Shape1.setAutoDraw(false); Shape1.setOri(ori0 || 0); Shape1.setPos(pos0 || [0, 0]); win.render();
    return { gray_levels: levels.size, intermediate_px: inter, samples: gl.getParameter(gl.SAMPLES), dpr: window.devicePixelRatio, buffer: [W, H] };
  } catch (e) { try { Shape1.setAutoDraw(false); Shape1.setOri(0); } catch (e2) {} return { gray_levels: 'error', intermediate_px: '', samples: '', error: String(e) }; }
}
""")
patch("""  psychoJS.experiment.addData('gl_antialias', glAntialias());
  psychoJS.experiment.addData('subspace_gain_u', subspace_gain_u);""", """  psychoJS.experiment.addData('gl_antialias', glAntialias());
  if (AA_MEASURE) { psychoJS.experiment.addData('aa_gray_levels', AA_MEASURE.gray_levels); psychoJS.experiment.addData('aa_intermediate_px', AA_MEASURE.intermediate_px); psychoJS.experiment.addData('gl_samples', AA_MEASURE.samples); }
  psychoJS.experiment.addData('subspace_gain_u', subspace_gain_u);""")

# ----------------------------------------------------------------------------------------------- 17. Escape policy (every routine's escape check)
_old_esc = """    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }"""
_new_esc = """    if (psychoJS.experiment.experimentEnded || escapeQuitRequested()) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }"""
_n_esc = s.count(_old_esc)
assert _n_esc >= 10, _n_esc
s = s.replace(_old_esc, _new_esc)
n_patches += 1
patch("""function importConditions(currentLoop) {""", """/**
 * self-hosted build: what an Escape press does (CONFIG.escape). 'confirm' (default): the first press is logged and ignored, a
 * second press within 3 s quits — one stray Escape (leaving fullscreen, closing another app's overlay) no longer ends the
 * session. 'quit' = the pavlovia behaviour; 'ignore' = Escape never quits (close the tab instead; partial data are beaconed).
 */
var _escapeFirstPress = -1;
var _escapePressCount = 0;
function escapeQuitRequested() {
  const n = psychoJS.eventManager.getKeys({keyList: ['escape']}).length;
  if (n === 0) return false;
  _escapePressCount += n;
  const policy = (CONFIG.escape || 'confirm');
  if (policy === 'ignore') { console.log('[escape] ignored (CONFIG.escape = ignore)'); return false; }
  if (policy === 'quit') return true;
  const now = performance.now();
  if (_escapeFirstPress > 0 && now - _escapeFirstPress < 3000) return true;
  _escapeFirstPress = now;
  psychoJS.experiment.addData('escape_pressed_t', globalClock.getTime());
  console.log('[escape] pressed once - press again within 3 s to quit');
  return false;
}

function importConditions(currentLoop) {""")

# ----------------------------------------------------------------------------------------------- 27. debug overlay hooks (debughud.js; ?debug=1 or the DEBUG single-file edition)
patch("""import { installDataSaver, fillUrl } from './datasaver.js';
""", """import { installDataSaver, fillUrl } from './datasaver.js';
import { installDebugHud } from './debughud.js';
""")
patch("""psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.INFO);
""", """psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.INFO);
if (window.EXP_DEBUG_HUD || URL_PARAMS.get('debug') === '1') installDebugHud(psychoJS, CONFIG);   // debug edition: live overlay of the internal state (never in the participant pages)
""")
patch("""    Shape1.setPos([position1x, position1y]);
    Shape1.setVertices(shape1);
    Shape2.setPos([position2x, position2y]);
    Shape2.setVertices(shape2);
""", """    Shape1.setPos([position1x, position1y]);
    Shape1.setVertices(shape1);
    Shape2.setPos([position2x, position2y]);
    Shape2.setVertices(shape2);
    psychoJS.experiment.addData('shape1_ori_applied', Shape1.ori); psychoJS.experiment.addData('shape2_ori_applied', Shape2.ori);   // v1.1.4: the orientations actually drawn (both 0, as in the original builds)
    Object.assign(window.__EXP.trial, {   // debug overlay: everything this trial is made of
      feature_index: feature_index, feature_center: feature_center.slice(), feature_vector: feature_vector.slice(), coord1: coord1.slice(), coord2: coord2.slice(),
      params1: vector_plus(vector_plus(feature_space[0], scalar_product(coord1[0], feature_space[1])), scalar_product(coord1[1], feature_space[2])),
      params2: vector_plus(vector_plus(feature_space[0], scalar_product(coord2[0], feature_space[1])), scalar_product(coord2[1], feature_space[2])),
      position1: [position1x, position1y], position2: [position2x, position2y], orientation1: Shape1.ori, orientation2: Shape2.ori, orientation_sampled_unused: [orientation1, orientation2], vertices1: shape1, vertices2: shape2 });
    // note (2026-09-11): orientation1/2 are sampled by the original code but never applied — the original lab and Pavlovia builds
    // show both discrimination shapes at 0 deg (only position and vertices are set). Kept as is; orientation1/2 above are the applied values.
""")
patch("""      window.__EXP.lastResult = { phase: currentPhaseName, label: currentPlan.label, n: currentPlan.staircase.n, level: level, isCatch: is_catch, saidDifferent: saidDifferent, correct: stairResult.correct, est_alpha: stairResult.est_alpha, finished: currentPlan.staircase.finished, allFinished: currentInterleaver.finished };
""", """      window.__EXP.lastResult = { phase: currentPhaseName, label: currentPlan.label, n: currentPlan.staircase.n, level: level, isCatch: is_catch, saidDifferent: saidDifferent, correct: stairResult.correct, est_alpha: stairResult.est_alpha, finished: currentPlan.staircase.finished, allFinished: currentInterleaver.finished, key: Resp_s_or_d.keys, rt: Resp_s_or_d.rt, est: stairResult };
""")
patch("""    window.__EXP.trial = { phase: 'Categorization', trial_number: trial_number, true_category: true_category, routineStart: performance.now() };
""", """    window.__EXP.trial = { phase: 'Categorization', trial_number: trial_number, true_category: true_category, routineStart: performance.now(),
      x: x_list[trial_number], y: y_list[trial_number], pos: [xpos, ypos], points_before: points,   // debug overlay
      category_center: [[muAx, muAy], [muBx, muBy], [muCx, muCy]][true_category], sigma: [sigmaA, sigmaB, sigmaC][true_category],
      params: subspace[0].map(function (o, k) { return o + x_list[trial_number] * subspace[1][k] + y_list[trial_number] * subspace[2][k]; }) };
""")
patch("""    point_value = utilitymatrix[true_category][numeric_response_minus1];
""", """    point_value = utilitymatrix[true_category][numeric_response_minus1];
    window.__EXP.lastResult = { phase: 'Categorization', trial_number: trial_number, true_category: true_category_list[trial_number], key: Respond_1or2or3.keys, rt: Respond_1or2or3.rt, response: numeric_response_minus1, correct: correctness, point_value: point_value, points: points, delay: delay_duration };   // debug overlay
""")

# ----------------------------------------------------------------------------------------------- 28. experiment name from config (symmetric study = discrimination2024c)
patch("""let expName = 'Asymmetric_Utility_discrimination_2025';  // from the Builder filename that created this script
""", """let expName = CONFIG.expName || 'Asymmetric_Utility_discrimination_2025';  // from config.js (config_symmetric.js overrides it); Builder default kept as fallback
""")

# ----------------------------------------------------------------------------------------------- 29. SONA fallback: survey code as participant id, completion code shown to the participant
patch("""let expInfo = {
    'participant': `${util.pad(Number.parseFloat(util.randint(0, 999999)).toFixed(0), 6)}`,
    'session': '001',
};
""", """let expInfo = {
    'participant': `${util.pad(Number.parseFloat(util.randint(0, 999999)).toFixed(0), 6)}`,
    'session': '001',
};
// SONA (config.sona): one identity instead of a random number plus a code — the survey code in the link becomes the
// participant id (dialog field, file name, every row). ?participant=... in the link still wins.
if (CONFIG.sona && CONFIG.sona.participantFromSurveyCode && URL_PARAMS.get('survey_code') && !URL_PARAMS.get('participant')) expInfo['participant'] = URL_PARAMS.get('survey_code');
function completionCode() {
  const p = String(expInfo['participant'] || ''), s = String(URL_PARAMS.get('survey_code') || expInfo['survey_code'] || '');
  return (s && s !== p) ? p + ' / ' + s : p;
}
function completionCodeHtml() {
  const c = CONFIG.sona || {};
  const viaSona = !!(URL_PARAMS.get('survey_code') || expInfo['survey_code']);   // the SONA note only makes sense for a SONA session
  const note = viaSona ? String(c.completionNote || '').replace('{contact}', c.contact || 'the experimenter') : '';
  return `<br><br>Your completion code: <b style="font-size:1.3em;letter-spacing:.05em">${completionCode()}</b>` + (note ? `<br><span style="font-size:.9em">${note}</span>` : '');
}
""")
patch("""  expInfo['antialias_requested'] = String(window.PSYCHOJS_ANTIALIAS !== false);
""", """  expInfo['antialias_requested'] = String(window.PSYCHOJS_ANTIALIAS !== false);
  expInfo['survey_code'] = URL_PARAMS.get('survey_code') || expInfo['survey_code'] || '';   // SONA's per-participation code (blank outside SONA)
  expInfo['completion_code'] = completionCode();
""")
patch("""  installDataSaver(psychoJS, CONFIG, { participant: expInfo['participant'], session: expInfo['session'], expName: expName, method: ADAPTIVE_METHOD, buildVersion: BUILD_VERSION });
""", """  installDataSaver(psychoJS, CONFIG, { participant: expInfo['participant'], session: expInfo['session'], expName: expName, method: ADAPTIVE_METHOD, buildVersion: BUILD_VERSION, surveyCode: expInfo['survey_code'] });
""")
patch("""    window.__EXP.routine = 'Thanks'; window.__EXP.routineStart = performance.now();
""", """    window.__EXP.routine = 'Thanks'; window.__EXP.routineStart = performance.now();
    if (CONFIG.sona && CONFIG.sona.showCompletionCode) text_3.setText('Thank you for participating in the experiment!\\n\\nYour completion code: ' + completionCode());
""")
patch("""async function quitPsychoJS(message, isCompleted) {
  // Check for and save orphaned data
""", """async function quitPsychoJS(message, isCompleted) {
  if (isCompleted && CONFIG.sona && CONFIG.sona.showCompletionCode) message = message + completionCodeHtml();   // the closing dialog stays until OK: the code is readable and copyable
  // Check for and save orphaned data
""")

# ----------------------------------------------------------------------------------------------- 30. utility matrix from config (symmetric study: respCifC = 1)
patch("""  utilitymatrix = [[respAifA, respBifA, respCifA], [respAifB, respBifB, respCifB], [respAifC, respBifC, respCifC]];
""", """  // config.utility overrides the payoff entries (the symmetric study sets respCifC = 1; everything else is the Builder default)
  if (CONFIG.utility) {
    if (CONFIG.utility.respAifA !== undefined) respAifA = CONFIG.utility.respAifA;
    if (CONFIG.utility.respAifB !== undefined) respAifB = CONFIG.utility.respAifB;
    if (CONFIG.utility.respAifC !== undefined) respAifC = CONFIG.utility.respAifC;
    if (CONFIG.utility.respBifA !== undefined) respBifA = CONFIG.utility.respBifA;
    if (CONFIG.utility.respBifB !== undefined) respBifB = CONFIG.utility.respBifB;
    if (CONFIG.utility.respBifC !== undefined) respBifC = CONFIG.utility.respBifC;
    if (CONFIG.utility.respCifA !== undefined) respCifA = CONFIG.utility.respCifA;
    if (CONFIG.utility.respCifB !== undefined) respCifB = CONFIG.utility.respCifB;
    if (CONFIG.utility.respCifC !== undefined) respCifC = CONFIG.utility.respCifC;
  }
  utilitymatrix = [[respAifA, respBifA, respCifA], [respAifB, respBifB, respCifB], [respAifC, respBifC, respCifC]];
  window.__EXP.utilitymatrix = utilitymatrix;
""")

os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'Asymmetric_Utility_discrimination_selfhost.js')
open(out_path, 'w', encoding='utf-8').write(s)
diff = difflib.unified_diff(src.splitlines(keepends=True), s.splitlines(keepends=True), fromfile='pavlovia/Asymmetric_Utility_discrimination_2025.js', tofile='selfhost/Asymmetric_Utility_discrimination_selfhost.js', n=2)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'experiment.diff'), 'w', encoding='utf-8').write(''.join(diff))
print(f'wrote {out_path}: {n_patches} patches, {len(s.splitlines())} lines (source {len(src.splitlines())})')
