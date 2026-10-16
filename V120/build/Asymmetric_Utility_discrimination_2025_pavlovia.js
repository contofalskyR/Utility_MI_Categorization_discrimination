/*********************************************** 
 * Asymmetric_Utility_Discrimination_2025 *
 ***********************************************/

import { core, data, sound, util, visual, hardware } from './lib/psychojs-2024.2.4.js';
const { PsychoJS } = core;
const { TrialHandler, MultiStairHandler } = data;
const { Scheduler } = util;
//some handy aliases as in the psychopy scripts;
const { abs, sin, cos, PI: pi, sqrt } = Math;
const { round } = util;


// store info about the experiment session:
let expName = 'Asymmetric_Utility_discrimination_2025';  // from the Builder filename that created this script
let expInfo = {
    'participant': `${util.pad(Number.parseFloat(util.randint(0, 999999)).toFixed(0), 6)}`,
    'session': '001',
};

// Start code blocks for 'Before Experiment'
// init psychoJS:
const psychoJS = new PsychoJS({
  debug: true
});

// open window:
psychoJS.openWindow({
  fullscr: true,
  color: new util.Color([-1,-1,-1]),
  units: 'height',
  waitBlanking: true,
  backgroundImage: '',
  backgroundFit: 'none',
});
// schedule the experiment:
psychoJS.schedule(psychoJS.gui.DlgFromDict({
  dictionary: expInfo,
  title: expName
}));

const flowScheduler = new Scheduler(psychoJS);
const dialogCancelScheduler = new Scheduler(psychoJS);
psychoJS.scheduleCondition(function() { return (psychoJS.gui.dialogComponent.button === 'OK'); },flowScheduler, dialogCancelScheduler);

// flowScheduler gets run if the participants presses OK
flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);
flowScheduler.add(ConsentRoutineBegin());
flowScheduler.add(ConsentRoutineEachFrame());
flowScheduler.add(ConsentRoutineEnd());
flowScheduler.add(SetupExperimentRoutineBegin());
flowScheduler.add(SetupExperimentRoutineEachFrame());
flowScheduler.add(SetupExperimentRoutineEnd());
const DiscirminationInstructionsLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(DiscirminationInstructionsLoopBegin(DiscirminationInstructionsLoopScheduler));
flowScheduler.add(DiscirminationInstructionsLoopScheduler);
flowScheduler.add(DiscirminationInstructionsLoopEnd);


const PreTestLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PreTestLoopBegin(PreTestLoopScheduler));
flowScheduler.add(PreTestLoopScheduler);
flowScheduler.add(PreTestLoopEnd);


const CatInstructionsLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(CatInstructionsLoopBegin(CatInstructionsLoopScheduler));
flowScheduler.add(CatInstructionsLoopScheduler);
flowScheduler.add(CatInstructionsLoopEnd);


const TrialLoopLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(TrialLoopLoopBegin(TrialLoopLoopScheduler));
flowScheduler.add(TrialLoopLoopScheduler);
flowScheduler.add(TrialLoopLoopEnd);




const PostTestInstructionsLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PostTestInstructionsLoopBegin(PostTestInstructionsLoopScheduler));
flowScheduler.add(PostTestInstructionsLoopScheduler);
flowScheduler.add(PostTestInstructionsLoopEnd);


const PostTestLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(PostTestLoopBegin(PostTestLoopScheduler));
flowScheduler.add(PostTestLoopScheduler);
flowScheduler.add(PostTestLoopEnd);


flowScheduler.add(ThanksRoutineBegin());
flowScheduler.add(ThanksRoutineEachFrame());
flowScheduler.add(ThanksRoutineEnd());
flowScheduler.add(quitPsychoJS, 'Thank you for your patience.', true);

// quit if user presses Cancel in dialog box:
dialogCancelScheduler.add(quitPsychoJS, 'Thank you for your patience.', false);

psychoJS.start({
  expName: expName,
  expInfo: expInfo,
  resources: [
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
});

psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.INFO);


var currentLoop;
var frameDur;
async function updateInfo() {
  currentLoop = psychoJS.experiment;  // right now there are no loops
  expInfo['date'] = util.MonotonicClock.getDateStr();  // add a simple timestamp
  expInfo['expName'] = expName;
  expInfo['psychopyVersion'] = '2024.2.4';
  expInfo['OS'] = window.navigator.platform;


  // store frame rate of monitor if we can measure it successfully
  expInfo['frameRate'] = psychoJS.window.getActualFrameRate();
  if (typeof expInfo['frameRate'] !== 'undefined')
    frameDur = 1.0 / Math.round(expInfo['frameRate']);
  else
    frameDur = 1.0 / 60.0; // couldn't get a reliable measure so guess

  // add info from the URL:
  util.addInfoFromUrl(expInfo);
  

  
  psychoJS.experiment.dataFileName = (("." + "/") + `data/${expInfo["participant"]}_${expName}_${expInfo["date"]}`);
  psychoJS.experiment.field_separator = '\t';


  return Scheduler.Event.NEXT;
}


var ConsentClock;
var text;
var key_resp;
var SetupExperimentClock;
var delayIndicatorText;
var pointChangeText;
var pointChangeColor;
var cumulative_points;
var trial_number;
var true_category_list;
var shape_list;
var mixture_index_list;
var this_true_category;
var mixture_index;
var x_list;
var y_list;
var coord1x;
var coord1y;
var coord2x;
var coord2y;
var x;
var y;
var shape;
var shape_rot;
var shape1;
var shape2;
var feature_index;
var feature_center;
var feature_vector;
var coord0;
var coord1;
var coord2;
var subspace_center;
var subspace_u;
var subspace_v;
var fillcolor;
var numeric_response;
var delay_duration;
var respAifA;
var respAifB;
var respAifC;
var respBifA;
var respBifB;
var respBifC;
var respCifA;
var respCifB;
var respCifC;
var prior;
var D;
var muAx;
var muAy;
var muBx;
var muBy;
var muCx;
var muCy;
var sigmaA;
var sigmaB;
var sigmaC;
var Aprior;
var Bprior;
var Cprior;
var utilitymatrix;
var maxTrials;
var proportionToFinish;
var Req_points;
var points;
var red;
var green;
var blue;
var feature_space;
var discrimination_parameters;
var weight_vectorA;
var weight_vectorB;
var weight_vectorC;
var A_mixture;
var B_mixture;
var C_mixture;
var subspace;
var DiscrimInstructions_PreClock;
var PretestInstructions;
var KeyboardResponse;
var DiscriminationTrialClock;
var Shape1;
var Shape2;
var Resp_s_or_d;
var WelcomeToCategorizationTaskClock;
var CategoryInstructions;
var PressAnyKey3;
var CategorizationTrialClock;
var Stimulus;
var Respond_1or2or3;
var FeedbackClock;
var Ray;
var Square;
var RepeatStimulus;
var FeedbackText;
var PointChange;
var DelayedStimulusClock;
var StimDelay;
var DiscriminationInstructions_PostClock;
var text_4;
var key_resp_2;
var ThanksClock;
var text_3;
var globalClock;
var routineTimer;
async function experimentInit() {
  // Initialize components for Routine "Consent"
  ConsentClock = new util.Clock();
  text = new visual.TextStim({
    win: psychoJS.window,
    name: 'text',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.02,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('white'),  opacity: undefined,
    depth: 0.0 
  });
  
  key_resp = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "SetupExperiment"
  SetupExperimentClock = new util.Clock();
  // Run 'Begin Experiment' code from SetupCode
  function norm(vec) {
      var x, y;
      x = vec[0];
      y = vec[1];
      return Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5);
  }
  function ones(D) {
      var ones;
      ones = [];
      for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          ones.push(1);
      }
      return ones;
  }
  function coinflip(x) {
      var p;
      [p] = x;
      return (Math.random() <= p);
  }
  function choose_from_distribution(p) {
      var N, choice, cumprob, i_plus_1, r;
      cumprob = cumsum(p);
      N = p.length;
      r = Math.random();
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          i_plus_1 = (i + 1);
          if (((r >= cumprob[i]) && (r < cumprob[i_plus_1]))) {
              choice = i;
          }
      }
      return choice;
  }
  function cumsum(p) {
      var N, cum;
      N = p.length;
      cum = [0];
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          cum.push((cum.slice((- 1))[0] + p[i]));
      }
      return cum;
  }
  class Gaussian_mixture {
      constructor(components, weights) {
          this.components = components;
          this.weights = weights;
      }
  }
  class Gaussian_mixture_component {
      constructor(mu, sigma) {
          this.mu = mu;
          this.sigma = sigma;
      }
  }
  function random_point(D) {
      var p, x;
      p = [];
      for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          x = Math.random();
          p.push(x);
      }
      return p;
  }
  function dot(v1, v2) {
      var D, sum_;
      D = v1.length;
      sum_ = 0;
      for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          sum_ = (sum_ + (v1[i] * v2[i]));
      }
      return sum_;
  }
  function vector_minus(v1, v2) {
      var D, diff;
      D = v1.length;
      diff = [];
      for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          diff.push((v1[i] - v2[i]));
      }
      return diff;
  }
  function vector_plus(v1, v2) {
      var D, sum_;
      D = v1.length;
      sum_ = [];
      for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          sum_.push((v1[i] + v2[i]));
      }
      return sum_;
  }
  function scalar_product(r, v) {
      var D, rv;
      D = v.length;
      rv = [];
      for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          rv.push((r * v[i]));
      }
      return rv;
  }
  function create_subspace(D) {
      var O, a, b, c, maximum_distance_from_center, new_origin, p, projection_ca_onto_ba, subspace, u, v;
      a = random_point(D);
      b = random_point(D);
      c = random_point(D);
      projection_ca_onto_ba = scalar_product((dot(vector_minus(c, a), vector_minus(b, a)) / (norm(vector_minus(b, a)) * norm(vector_minus(b, a)))), vector_minus(b, a));
      p = vector_plus(a, projection_ca_onto_ba);
      u = scalar_product((1 / norm(vector_minus(b, p))), vector_minus(b, p));
      v = scalar_product((1 / norm(vector_minus(c, p))), vector_minus(c, p));
      O = scalar_product(0.5, ones(D));
      maximum_distance_from_center = 0.2;
      new_origin = vector_plus(O, scalar_product(((Math.random() * maximum_distance_from_center) / norm(vector_minus(p, O))), vector_minus(p, O)));
      subspace = [new_origin, u, v];
      return subspace;
  }
  function dot2(mat2x2, matNx2) {
      var N, a, b, c, d, p, product;
      N = matNx2.length;
      a = mat2x2[0][0];
      b = mat2x2[0][1];
      c = mat2x2[1][0];
      d = mat2x2[1][1];
      product = [];
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          p = [[((a * matNx2[i][0]) + (b * matNx2[i][1]))], [((c * matNx2[i][0]) + (d * matNx2[i][1]))]];
          product.push(p);
      }
      return product;
  }
  function shape_from_coordinates(coordinates, subspace, shape_spacing) {
      var D, N, angle_increment, center, default_radius, deviation, height, maximum_excursion, parameters, points, px, py, subspace_center, this_component, u, v;
      N = 50;
      angle_increment = ((2 * 3.14159265359) / N);
      [subspace_center, u, v] = subspace;
      D = u.length;
      center = [0, 0];
      height = 1;
      maximum_excursion = 0.1;
      default_radius = 0.3;
      points = [];
      parameters = vector_plus(vector_plus(subspace_center, scalar_product(coordinates[0], u)), scalar_product(coordinates[1], v));
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          deviation = 0;
          for (var k, _pj_f = 0, _pj_d = util.range(0, D), _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
              k = _pj_d[_pj_f];
              this_component = ((maximum_excursion * parameters[k]) * Math.sin(((k * (i - 1)) * ((2 * 3.14159265359) / N))));
              deviation = (deviation + this_component);
          }
          px = (center[0] + ((default_radius + deviation) * Math.cos((i * angle_increment))));
          py = (center[1] + ((default_radius + deviation) * Math.sin((i * angle_increment))));
          points.push([px, py]);
      }
      return points;
  }
  function sigma2Sigma(sigma) {
      return [[Math.pow(sigma, 2), 0], [0, Math.pow(sigma, 2)]];
  }
  function draw_shape_from_mixture(mixture, subspace) {
      var i, ps, shape, x, y;
      ps = mixture.weights;
      i = 0;
      [shape, x, y] = draw_shape_from_mixture_component(mixture.components[i], subspace);
      return [shape, i, x, y];
  }
  function bivariate_normal(mu, sigma) {
      var mux, muy, theta, vx, vy, z;
      mux = mu[0];
      muy = mu[1];
      z = normal_deviate();
      theta = ((Math.random() * 2) * 3.14159265359);
      vx = (mux + (z * sigma));
      vy = (muy + (normal_deviate() * sigma));
      return [vx, vy];
  }
  function randomly_rotate_shape(shape) {
      var N, angle, rot_matrix, rotated_shape, rotated_shape_xy, shape_xy, x, y;
      N = shape.length;
      shape_xy = [];
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          [x, y] = shape[i];
          shape_xy.push([x, y]);
      }
      angle = ((Math.random() * 2) * 3.14159265359);
      rot_matrix = [[Math.cos(angle), (- Math.sin(angle))], [Math.sin(angle), Math.cos(angle)]];
      rotated_shape = dot2(rot_matrix, shape);
      rotated_shape_xy = [];
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          rotated_shape_xy.push([rotated_shape[i][0][0], rotated_shape[i][1][0]]);
      }
      return rotated_shape_xy;
  }
  function normal_deviate() {
      var N, sum_, z;
      N = 12;
      sum_ = 0;
      for (var i, _pj_c = 0, _pj_a = util.range(N), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
          i = _pj_a[_pj_c];
          sum_ = (sum_ + Math.random());
      }
      z = ((sum_ - (N / 2)));
      return z;
  }
  function draw_shape_from_mixture_component(mixture_component, subspace) {
      var mu, shape, shape_spacing, sigma, x;
      mu = mixture_component.mu;
      sigma = mixture_component.sigma;
      x = bivariate_normal(mu, sigma);
      shape_spacing = 10;
      shape = shape_from_coordinates(x, subspace, shape_spacing);
      return [shape, x[0], x[1]];
  }
  
  // Run 'Begin Experiment' code from InitiateExperiment
  delayIndicatorText = "DELAY: 0s";
  pointChangeText = "+0";
  pointChangeColor = "white";
  cumulative_points = 0;
  trial_number = 0;
  true_category_list = [];
  shape_list = [];
  mixture_index_list = [];
  this_true_category = 0;
  mixture_index = 0;
  x_list = [];
  y_list = [];
  coord1x = 0;
  coord1y = 0;
  coord2x = 0;
  coord2y = 0;
  x = 0;
  y = 0;
  shape = [];
  shape_rot = [];
  shape1 = [[0, 0]];
  shape2 = [[0, 0]];
  feature_index = 0;
  feature_center = [0, 0];
  feature_vector = [0, 0];
  coord0 = [0, 0];
  coord1 = [0, 0];
  coord2 = [0, 0];
  subspace_center = [0, 0];
  subspace_u = [0, 0];
  subspace_v = [0, 0];
  fillcolor = [255, 255, 255];
  numeric_response = 0;
  delay_duration = 0;  
  respAifA = 0;
  respAifB = 0;
  respAifC = 0;
  respBifA = 0;
  respBifB = 0;
  respBifC = 0;
  respCifA = 0;
  respCifB = 0;
  respCifC = 0;
  prior = [];
  
  // Run 'Begin Experiment' code from CategorizationParameters
  D = 4;
  muAx = 0.25;
  muAy = 0.5;
  muBx = 0.5;
  muBy = 0.5;
  muCx = 0.75;
  muCy = 0.5;
  sigmaA = 0.075;
  sigmaB = 0.075;
  sigmaC = 0.075;
  Aprior = (1 / 3);
  Bprior = (1 / 3);
  Cprior = ((1 - Aprior) - Bprior);
  prior = [Aprior, Bprior, Cprior];
  respAifA = 1;
  respAifB = (- 1);
  respBifA = (- 1);
  respBifB = 1;
  respCifC = 3;
  respCifB = (- 3);
  respBifC = (- 3);
  respAifC = (- 1);
  respCifA = (- 1);
  utilitymatrix = [[respAifA, respBifA, respCifA], [respAifB, respBifB, respCifB], [respAifC, respBifC, respCifC]];
  maxTrials = 300;
  proportionToFinish = 0.5;
  Req_points = (proportionToFinish * maxTrials);
  points = 0;
  red = [1, (- 1), (- 1)];
  green = [(- 1), 1, (- 1)];
  blue = [(- 1), (- 1), 1];
  
  // Run 'Begin Experiment' code from DiscrimParameters
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
  // Run 'Begin Experiment' code from SetupCategorizationTask
  weight_vectorA = [1];
  weight_vectorB = [1];
  weight_vectorC = [1];
  A_mixture = new Gaussian_mixture([new Gaussian_mixture_component([muAx, muAy], sigmaA)], weight_vectorA);
  B_mixture = new Gaussian_mixture([new Gaussian_mixture_component([muBx, muBy], sigmaB)], weight_vectorB);
  C_mixture = new Gaussian_mixture([new Gaussian_mixture_component([muCx, muCy], sigmaC)], weight_vectorC);
  // FIX 2026-08-20b: share ONE space between categorization and discrimination (matches the symmetric build; the old independent create_subspace(D) made discrimination probes live in a different random subspace than the categories)
  subspace = feature_space;
  x_list = [];
  y_list = [];
  for (var i, _pj_c = 0, _pj_a = util.range(maxTrials), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
      i = _pj_a[_pj_c];
      this_true_category = choose_from_distribution(prior);
      true_category_list.push(this_true_category);
      if ((this_true_category === 0)) {
          [shape, mixture_index, x, y] = draw_shape_from_mixture(A_mixture, subspace);
      } else {
          if ((this_true_category === 1)) {
              [shape, mixture_index, x, y] = draw_shape_from_mixture(B_mixture, subspace);
          } else {
              [shape, mixture_index, x, y] = draw_shape_from_mixture(C_mixture, subspace);
          }
      }
      shape_rot = randomly_rotate_shape(shape);
      shape_list.push(shape_rot);
      mixture_index_list.push(mixture_index);
      x_list.push(x);
      y_list.push(y);
  }
  trial_number = (- 1);
  
  // Initialize components for Routine "DiscrimInstructions_Pre"
  DiscrimInstructions_PreClock = new util.Clock();
  PretestInstructions = new visual.TextStim({
    win: psychoJS.window,
    name: 'PretestInstructions',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.08,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color("#d0d0d0" ),  opacity: undefined,
    depth: 0.0 
  });
  
  KeyboardResponse = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "DiscriminationTrial"
  DiscriminationTrialClock = new util.Clock();
  Shape1 = new visual.ShapeStim({
    win: psychoJS.window, name: 'Shape1', units : 'height', 
    vertices: [[(- 0.5), (- 0.5)], [(- 0.5), 0.5], [0.5, 0.5], [0.5, (- 0.5)]], size: [0.25, 0.25],
    ori: orientation1, 
    pos: [0, 0], 
    draggable: false, 
    anchor: 'center', 
    lineWidth: 1.0, 
    lineColor: new util.Color('white'), 
    fillColor: new util.Color('white'), 
    colorSpace: 'rgb', 
    opacity: undefined, 
    depth: -1, 
    interpolate: true, 
  });
  
  Shape2 = new visual.ShapeStim({
    win: psychoJS.window, name: 'Shape2', units : 'height', 
    vertices: [[(- 0.5), (- 0.5)], [(- 0.5), 0.5], [0.5, 0.5], [0.5, (- 0.5)]], size: [0.25, 0.25],
    ori: orientation2, 
    pos: [0, 0], 
    draggable: false, 
    anchor: 'center', 
    lineWidth: 1.0, 
    lineColor: new util.Color('white'), 
    fillColor: new util.Color('white'), 
    colorSpace: 'rgb', 
    opacity: undefined, 
    depth: -2, 
    interpolate: true, 
  });
  
  Resp_s_or_d = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "WelcomeToCategorizationTask"
  WelcomeToCategorizationTaskClock = new util.Clock();
  CategoryInstructions = new visual.TextStim({
    win: psychoJS.window,
    name: 'CategoryInstructions',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.08,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color("#d0d0d0"  ),  opacity: undefined,
    depth: 0.0 
  });
  
  PressAnyKey3 = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "CategorizationTrial"
  CategorizationTrialClock = new util.Clock();
  Stimulus = new visual.ShapeStim({
    win: psychoJS.window, name: 'Stimulus', 
    vertices: [[(- 0.5), (- 0.5)], [(- 0.5), 0.5], [0.5, 0.5], [0.5, (- 0.5)]], size: [0.25, 0.25],
    ori: 0.0, 
    pos: [0, 0], 
    draggable: false, 
    anchor: 'center', 
    lineWidth: 1.0, 
    lineColor: new util.Color('white'), 
    fillColor: new util.Color('white'), 
    colorSpace: 'rgb', 
    opacity: undefined, 
    depth: -1, 
    interpolate: true, 
  });
  
  Respond_1or2or3 = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "Feedback"
  FeedbackClock = new util.Clock();
  Ray = new visual.ShapeStim ({
    win: psychoJS.window, name: 'Ray', 
    vertices: [[-[1, 1][0]/2.0, 0], [+[1, 1][0]/2.0, 0]],
    ori: 90.0, 
    pos: [0, 0], 
    draggable: false, 
    anchor: 'center', 
    lineWidth: 1.0, 
    lineColor: new util.Color('white'), 
    fillColor: new util.Color('white'), 
    colorSpace: 'rgb', 
    opacity: undefined, 
    depth: -1, 
    interpolate: true, 
  });
  
  Square = new visual.ImageStim({
    win : psychoJS.window,
    name : 'Square', units : undefined, 
    image : 'default.png', mask : undefined,
    anchor : 'center',
    ori : 0.0, 
    pos : [0, 0], 
    draggable: false,
    size : [0.5, 0.5],
    color : new util.Color([1,1,1]), opacity : undefined,
    flipHoriz : false, flipVert : false,
    texRes : 128.0, interpolate : true, depth : -2.0 
  });
  RepeatStimulus = new visual.ShapeStim({
    win: psychoJS.window, name: 'RepeatStimulus', 
    vertices: [[(- 0.5), (- 0.5)], [(- 0.5), 0.5], [0.5, 0.5], [0.5, (- 0.5)]], size: [0.4, 0.4],
    ori: 0.0, 
    pos: [0, 0], 
    draggable: false, 
    anchor: 'center', 
    lineWidth: 1.0, 
    lineColor: new util.Color('white'), 
    fillColor: new util.Color('white'), 
    colorSpace: 'rgb', 
    opacity: undefined, 
    depth: -3, 
    interpolate: true, 
  });
  
  FeedbackText = new visual.TextStim({
    win: psychoJS.window,
    name: 'FeedbackText',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0.45, 0.4], draggable: false, height: 0.05,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('white'),  opacity: undefined,
    depth: -4.0 
  });
  
  PointChange = new visual.TextStim({
    win: psychoJS.window,
    name: 'PointChange',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.05,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('white'),  opacity: undefined,
    depth: -6.0 
  });
  
  // Initialize components for Routine "DelayedStimulus"
  DelayedStimulusClock = new util.Clock();
  StimDelay = new visual.TextStim({
    win: psychoJS.window,
    name: 'StimDelay',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.05,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('white'),  opacity: undefined,
    depth: 0.0 
  });
  
  // Initialize components for Routine "DiscriminationInstructions_Post"
  DiscriminationInstructions_PostClock = new util.Clock();
  text_4 = new visual.TextStim({
    win: psychoJS.window,
    name: 'text_4',
    text: '',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.08,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color("#d0d0d0"  ),  opacity: undefined,
    depth: 0.0 
  });
  
  key_resp_2 = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "Thanks"
  ThanksClock = new util.Clock();
  text_3 = new visual.TextStim({
    win: psychoJS.window,
    name: 'text_3',
    text: 'Thank you for participating in the experiment!',
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 0.05,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('white'),  opacity: undefined,
    depth: 0.0 
  });
  
  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine
  
  return Scheduler.Event.NEXT;
}


var t;
var frameN;
var continueRoutine;
var ConsentMaxDurationReached;
var _key_resp_allKeys;
var ConsentMaxDuration;
var ConsentComponents;
function ConsentRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'Consent' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    ConsentClock.reset();
    routineTimer.reset();
    ConsentMaxDurationReached = false;
    // update component parameters for each repeat
    text.setText('The experiment requires you to sit in front of the computer screen, view a series of images, and make responses by pressing keys on your keyboard. The task will be described in more detail before the experimental session begins.\n\nData drawn from your session will be stored with your initials only. Since we are interested in general trends, your data may be pooled with that of others.\n\nThere are no risks to your health of any kind. You can stop the experiment at any time.\n\nResponses in psychology experiments are sometimes altered if the subject is aware of the hypotheses under consideration. Hence, we cannot explain the precise purpose of the experiment until after the session is over. However, afterwards the experimenter will be happy to answer any questions you might have about the procedure or underlying scientiﬁc project.\n\nYour participation is entirely voluntary and you may leave at any time. If for any reason you would like to discontinue the experiment, please let the experimenter know and we will end the session. If you do decide to terminate the session before it is complete you will be paid or credited for the time you have spent on a prorated basis.\n\nThis research is confidential. Confidential means that the research records will include some information about you, such as your gender and age. The experimenters will keep this information confidential by limiting individual’s access to the research data and keeping it in a secure location. The research team and the Institutional Review Board at Rutgers University are the only parties that will be allowed to see the data, except as may be required by law. If a report of this study is published, or the results are presented at a professional conference, all results will be anonymous. All study data will be kept for at least three years.\n\nAlthough there are no direct beneﬁts to you by your participation in this study, others in the future may beneﬁt from the results of this research. At the end of the experimental session you will receive copies of this form and the experimental instructions if you want them. If you have any questions about your rights as a research subject, please contact the IRB Administrator at Rutgers University at: Rutgers University, the State University of New Jersey, Institutional Review Board for the Protection of Human Subjects, Ofﬁce of Research and Sponsored Programs, 3 Rutgers Plaza, New Brunswick, NJ 08901-8559, Tel: 732-932-0150 ext. 2104, Email: humansubjects@orsp.rutgers.edu.\n\nJacob Feldman, Ph.D. (Principal Investigator) Phone: (848) 445-6158 Campus Address: Psychology A125, Busch Campus, Rutgers University. Email: jacob@ruccs.rutgers.edu\n\nPress ‘y’ if you agree and want to start. Press ‘esc’ if you disagree and want to quit.');
    key_resp.keys = undefined;
    key_resp.rt = undefined;
    _key_resp_allKeys = [];
    psychoJS.experiment.addData('Consent.started', globalClock.getTime());
    ConsentMaxDuration = null
    // keep track of which components have finished
    ConsentComponents = [];
    ConsentComponents.push(text);
    ConsentComponents.push(key_resp);
    
    for (const thisComponent of ConsentComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function ConsentRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'Consent' ---
    // get current time
    t = ConsentClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *text* updates
    if (t >= 0.0 && text.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text.tStart = t;  // (not accounting for frame time here)
      text.frameNStart = frameN;  // exact frame index
      
      text.setAutoDraw(true);
    }
    
    
    // *key_resp* updates
    if (t >= 0.0 && key_resp.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp.tStart = t;  // (not accounting for frame time here)
      key_resp.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { key_resp.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { key_resp.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { key_resp.clearEvents(); });
    }
    
    if (key_resp.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp.getKeys({keyList: ['y', 'n'], waitRelease: false});
      _key_resp_allKeys = _key_resp_allKeys.concat(theseKeys);
      if (_key_resp_allKeys.length > 0) {
        key_resp.keys = _key_resp_allKeys[_key_resp_allKeys.length - 1].name;  // just the last key pressed
        key_resp.rt = _key_resp_allKeys[_key_resp_allKeys.length - 1].rt;
        key_resp.duration = _key_resp_allKeys[_key_resp_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of ConsentComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function ConsentRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'Consent' ---
    for (const thisComponent of ConsentComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('Consent.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(key_resp.corr, level);
    }
    psychoJS.experiment.addData('key_resp.keys', key_resp.keys);
    if (typeof key_resp.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('key_resp.rt', key_resp.rt);
        psychoJS.experiment.addData('key_resp.duration', key_resp.duration);
        routineTimer.reset();
        }
    
    key_resp.stop();
    // the Routine "Consent" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var SetupExperimentMaxDurationReached;
var SetupExperimentMaxDuration;
var SetupExperimentComponents;
function SetupExperimentRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'SetupExperiment' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    SetupExperimentClock.reset();
    routineTimer.reset();
    SetupExperimentMaxDurationReached = false;
    // update component parameters for each repeat
    psychoJS.experiment.addData('SetupExperiment.started', globalClock.getTime());
    SetupExperimentMaxDuration = null
    // keep track of which components have finished
    SetupExperimentComponents = [];
    
    for (const thisComponent of SetupExperimentComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function SetupExperimentRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'SetupExperiment' ---
    // get current time
    t = SetupExperimentClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of SetupExperimentComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function SetupExperimentRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'SetupExperiment' ---
    for (const thisComponent of SetupExperimentComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('SetupExperiment.stopped', globalClock.getTime());
    // the Routine "SetupExperiment" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var DiscirminationInstructions;
function DiscirminationInstructionsLoopBegin(DiscirminationInstructionsLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    DiscirminationInstructions = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: 'PRETEST_INSTRUCTIONS-new.xlsx',
      seed: undefined, name: 'DiscirminationInstructions'
    });
    psychoJS.experiment.addLoop(DiscirminationInstructions); // add the loop to the experiment
    currentLoop = DiscirminationInstructions;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    for (const thisDiscirminationInstruction of DiscirminationInstructions) {
      snapshot = DiscirminationInstructions.getSnapshot();
      DiscirminationInstructionsLoopScheduler.add(importConditions(snapshot));
      DiscirminationInstructionsLoopScheduler.add(DiscrimInstructions_PreRoutineBegin(snapshot));
      DiscirminationInstructionsLoopScheduler.add(DiscrimInstructions_PreRoutineEachFrame());
      DiscirminationInstructionsLoopScheduler.add(DiscrimInstructions_PreRoutineEnd(snapshot));
      DiscirminationInstructionsLoopScheduler.add(DiscirminationInstructionsLoopEndIteration(DiscirminationInstructionsLoopScheduler, snapshot));
    }
    
    return Scheduler.Event.NEXT;
  }
}


async function DiscirminationInstructionsLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(DiscirminationInstructions);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function DiscirminationInstructionsLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var PreTestConditions;
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


async function PreTestLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(PreTest);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function PreTestLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var CatInstructions;
function CatInstructionsLoopBegin(CatInstructionsLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    CatInstructions = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: 'Categorization.xlsx',
      seed: undefined, name: 'CatInstructions'
    });
    psychoJS.experiment.addLoop(CatInstructions); // add the loop to the experiment
    currentLoop = CatInstructions;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    for (const thisCatInstruction of CatInstructions) {
      snapshot = CatInstructions.getSnapshot();
      CatInstructionsLoopScheduler.add(importConditions(snapshot));
      CatInstructionsLoopScheduler.add(WelcomeToCategorizationTaskRoutineBegin(snapshot));
      CatInstructionsLoopScheduler.add(WelcomeToCategorizationTaskRoutineEachFrame());
      CatInstructionsLoopScheduler.add(WelcomeToCategorizationTaskRoutineEnd(snapshot));
      CatInstructionsLoopScheduler.add(CatInstructionsLoopEndIteration(CatInstructionsLoopScheduler, snapshot));
    }
    
    return Scheduler.Event.NEXT;
  }
}


async function CatInstructionsLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(CatInstructions);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function CatInstructionsLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var TrialLoop;
function TrialLoopLoopBegin(TrialLoopLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    TrialLoop = new TrialHandler({
      psychoJS: psychoJS,
      nReps: maxTrials, method: TrialHandler.Method.RANDOM,
      extraInfo: expInfo, originPath: undefined,
      trialList: undefined,
      seed: undefined, name: 'TrialLoop'
    });
    psychoJS.experiment.addLoop(TrialLoop); // add the loop to the experiment
    currentLoop = TrialLoop;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    for (const thisTrialLoop of TrialLoop) {
      snapshot = TrialLoop.getSnapshot();
      TrialLoopLoopScheduler.add(importConditions(snapshot));
      TrialLoopLoopScheduler.add(CategorizationTrialRoutineBegin(snapshot));
      TrialLoopLoopScheduler.add(CategorizationTrialRoutineEachFrame());
      TrialLoopLoopScheduler.add(CategorizationTrialRoutineEnd(snapshot));
      TrialLoopLoopScheduler.add(FeedbackRoutineBegin(snapshot));
      TrialLoopLoopScheduler.add(FeedbackRoutineEachFrame());
      TrialLoopLoopScheduler.add(FeedbackRoutineEnd(snapshot));
      TrialLoopLoopScheduler.add(DelayedStimulusRoutineBegin(snapshot));
      TrialLoopLoopScheduler.add(DelayedStimulusRoutineEachFrame());
      TrialLoopLoopScheduler.add(DelayedStimulusRoutineEnd(snapshot));
      TrialLoopLoopScheduler.add(TrialLoopLoopEndIteration(TrialLoopLoopScheduler, snapshot));
    }
    
    return Scheduler.Event.NEXT;
  }
}


async function TrialLoopLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(TrialLoop);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function TrialLoopLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var PostTestInstructions;
function PostTestInstructionsLoopBegin(PostTestInstructionsLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    PostTestInstructions = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: 'POSTTEST_INSTRUCTIONS-new.xlsx',
      seed: undefined, name: 'PostTestInstructions'
    });
    psychoJS.experiment.addLoop(PostTestInstructions); // add the loop to the experiment
    currentLoop = PostTestInstructions;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    for (const thisPostTestInstruction of PostTestInstructions) {
      snapshot = PostTestInstructions.getSnapshot();
      PostTestInstructionsLoopScheduler.add(importConditions(snapshot));
      PostTestInstructionsLoopScheduler.add(DiscriminationInstructions_PostRoutineBegin(snapshot));
      PostTestInstructionsLoopScheduler.add(DiscriminationInstructions_PostRoutineEachFrame());
      PostTestInstructionsLoopScheduler.add(DiscriminationInstructions_PostRoutineEnd(snapshot));
      PostTestInstructionsLoopScheduler.add(PostTestInstructionsLoopEndIteration(PostTestInstructionsLoopScheduler, snapshot));
    }
    
    return Scheduler.Event.NEXT;
  }
}


async function PostTestInstructionsLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(PostTestInstructions);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function PostTestInstructionsLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var PostTestConditions;
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


async function PostTestLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(PostTest);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function PostTestLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var DiscrimInstructions_PreMaxDurationReached;
var _KeyboardResponse_allKeys;
var header;
var promptText;
var DiscrimInstructions_PreMaxDuration;
var DiscrimInstructions_PreComponents;
function DiscrimInstructions_PreRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'DiscrimInstructions_Pre' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    DiscrimInstructions_PreClock.reset();
    routineTimer.reset();
    DiscrimInstructions_PreMaxDurationReached = false;
    // update component parameters for each repeat
    PretestInstructions.setText((paragraph + "\n\nPress spacebar to continue"));
    KeyboardResponse.keys = undefined;
    KeyboardResponse.rt = undefined;
    _KeyboardResponse_allKeys = [];
    // Run 'Begin Routine' code from code_3
    // Add this at the beginning of your JS code
    console.log("Header:", header);
    console.log("Paragraph:", paragraph);
    console.log("Full text:", header + paragraph + promptText);
    
    header = "PRE-TEST INSTRUCTIONS\n\n";
    if ((responseKey === "s")) {
        promptText = "\n\nPress 'S' to continue";
    } else {
        if ((responseKey === "d")) {
            promptText = "\n\nPress 'D' to continue";
        } else {
            promptText = "\n\nPress spacebar to continue";
        }
    }
    PretestInstructions.text = ((header + paragraph) + promptText);
    key_resp.keys = [];
    key_resp.allowedKeys = [responseKey];
    psychoJS.experiment.addData('DiscrimInstructions_Pre.started', globalClock.getTime());
    DiscrimInstructions_PreMaxDuration = null
    // keep track of which components have finished
    DiscrimInstructions_PreComponents = [];
    DiscrimInstructions_PreComponents.push(PretestInstructions);
    DiscrimInstructions_PreComponents.push(KeyboardResponse);
    
    for (const thisComponent of DiscrimInstructions_PreComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function DiscrimInstructions_PreRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'DiscrimInstructions_Pre' ---
    // get current time
    t = DiscrimInstructions_PreClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *PretestInstructions* updates
    if (t >= 0.0 && PretestInstructions.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      PretestInstructions.tStart = t;  // (not accounting for frame time here)
      PretestInstructions.frameNStart = frameN;  // exact frame index
      
      PretestInstructions.setAutoDraw(true);
    }
    
    
    // *KeyboardResponse* updates
    if (t >= 0.0 && KeyboardResponse.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      KeyboardResponse.tStart = t;  // (not accounting for frame time here)
      KeyboardResponse.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { KeyboardResponse.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { KeyboardResponse.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { KeyboardResponse.clearEvents(); });
    }
    
    if (KeyboardResponse.status === PsychoJS.Status.STARTED) {
      let theseKeys = KeyboardResponse.getKeys({keyList: [], waitRelease: false});
      _KeyboardResponse_allKeys = _KeyboardResponse_allKeys.concat(theseKeys);
      if (_KeyboardResponse_allKeys.length > 0) {
        KeyboardResponse.keys = _KeyboardResponse_allKeys[_KeyboardResponse_allKeys.length - 1].name;  // just the last key pressed
        KeyboardResponse.rt = _KeyboardResponse_allKeys[_KeyboardResponse_allKeys.length - 1].rt;
        KeyboardResponse.duration = _KeyboardResponse_allKeys[_KeyboardResponse_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of DiscrimInstructions_PreComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function DiscrimInstructions_PreRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'DiscrimInstructions_Pre' ---
    for (const thisComponent of DiscrimInstructions_PreComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('DiscrimInstructions_Pre.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(KeyboardResponse.corr, level);
    }
    psychoJS.experiment.addData('KeyboardResponse.keys', KeyboardResponse.keys);
    if (typeof KeyboardResponse.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('KeyboardResponse.rt', KeyboardResponse.rt);
        psychoJS.experiment.addData('KeyboardResponse.duration', KeyboardResponse.duration);
        routineTimer.reset();
        }
    
    KeyboardResponse.stop();
    // the Routine "DiscrimInstructions_Pre" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var DiscriminationTrialMaxDurationReached;
var feature;
var correct_answer;
var excursion;
var position0x;
var position0y;
var radius;
var deviation;
var position1x;
var position1y;
var position2x;
var position2y;
var orientation1;
var orientation2;
var linecolor;
var _Resp_s_or_d_allKeys;
var DiscriminationTrialMaxDuration;
var DiscriminationTrialComponents;
function DiscriminationTrialRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'DiscriminationTrial' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    DiscriminationTrialClock.reset();
    routineTimer.reset();
    DiscriminationTrialMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from SetupTrial
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
    
    function shape_from_coordinates(coordinates, subspace, shape_spacing) {
        // Define constants and initialize variables
        var N = 50; // number of points in shape
        var angle_increment = (2 * Math.PI) / N;
        var [subspace_center, u, v] = subspace;
        var D = u.length; // Dimension of the embedding space
        var center = [0, 0]; // midpoint of shape
        var maximum_excursion = 0.1; // maximum amplitude of sine wave
        var default_radius = 0.3;
        var points = []; // Will store Nx2 list of points
    
        // Calculate parameters based on coordinates and subspace
        var parameters = vector_plus(
            vector_plus(subspace_center, scalar_product(coordinates[0], u)),
            scalar_product(coordinates[1], v)
        );
    
        // Loop through each point to create the Fourier shape
        for (var i = 0; i < N; i++) {
            var deviation = 0;
            
            // Calculate the deviation for each dimension
            for (var k = 0; k < D; k++) {
                var this_component = maximum_excursion * parameters[k] * Math.sin((k * (i - 1) * (2 * Math.PI / N)));
                deviation += this_component;
            }
            
            // Calculate the x and y coordinates for the point
            var px = center[0] + (default_radius + deviation) * Math.cos(i * angle_increment);
            var py = center[1] + (default_radius + deviation) * Math.sin(i * angle_increment);
            
            // Add the point to the list of points
            points.push([px, py]);
        }
    
        return points;
    }
    
    function draw_shape_from_mixture_component(mixture_component, subspace) {
        var mu, shape, shape_spacing, sigma, x;
        mu = mixture_component.mu;
        sigma = mixture_component.sigma;
        x = bivariate_normal(mu, sigma);
        shape_spacing = 10;
        shape = shape_from_coordinates(x, subspace, shape_spacing);
        return [shape, x[0], x[1]];
    }
    function vector_minus(v1, v2) {
        var D, diff;
        D = v1.length;
        diff = [];
        for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            i = _pj_a[_pj_c];
            diff.push((v1[i] - v2[i]));
        }
        return diff;
    }
    
    function vector_plus(v1, v2) {
        var D, sum_;
        D = v1.length;
        sum_ = [];
        for (var i, _pj_c = 0, _pj_a = util.range(D), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            i = _pj_a[_pj_c];
            sum_.push((v1[i] + v2[i]));
        }
        return sum_;
    }
    
    function scalar_product(r, v) {
        var D = v.length;
        var rv = [];
        for (var i = 0; i < D; i++) {
            rv.push(r * v[i]);
        }
        return rv;
    }
    
    
    feature = discrimination_parameters[feature_index];
    feature_center = [feature[0], feature[1]];
    feature_vector = [feature[2], feature[3]];
    coord1 = vector_plus(feature_center, scalar_product(level, feature_vector));
    coord2 = vector_minus(feature_center, scalar_product(level, feature_vector));
    
    if ((Math.random() < 0.5)) {
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
    excursion = 0.25;
    position0x = (excursion * Math.random());
    position0y = (excursion * Math.random());
    radius = 0.15;
    deviation = ((Math.random() * 2) * 3.14159);
    position1x = (position0x + (radius * Math.cos(deviation)));
    position1y = (position0y + (radius * Math.sin(deviation)));
    position2x = (position0x - (radius * Math.cos(deviation)));
    position2y = (position0y - (radius * Math.sin(deviation)));
    orientation1 = (Math.random() * 360);
    orientation2 = (Math.random() * 360);
    fillcolor = [0.5, 0, 0];
    linecolor = [2, 2, 2];
    
    
    console.log("=== Verification ===");
    console.log("Level used in calculations:", level);
    console.log("Coord1:", coord1);
    console.log("Coord2:", coord2);
    console.log("Are coords identical?", JSON.stringify(coord1) === JSON.stringify(coord2));
    
    
    
    Shape1.setPos([position1x, position1y]);
    Shape1.setVertices(shape1);
    Shape2.setPos([position2x, position2y]);
    Shape2.setVertices(shape2);
    Resp_s_or_d.keys = undefined;
    Resp_s_or_d.rt = undefined;
    _Resp_s_or_d_allKeys = [];
    psychoJS.experiment.addData('DiscriminationTrial.started', globalClock.getTime());
    DiscriminationTrialMaxDuration = null
    // keep track of which components have finished
    DiscriminationTrialComponents = [];
    DiscriminationTrialComponents.push(Shape1);
    DiscriminationTrialComponents.push(Shape2);
    DiscriminationTrialComponents.push(Resp_s_or_d);
    
    for (const thisComponent of DiscriminationTrialComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


var frameRemains;
function DiscriminationTrialRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'DiscriminationTrial' ---
    // get current time
    t = DiscriminationTrialClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *Shape1* updates
    if (t >= 0.5 && Shape1.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Shape1.tStart = t;  // (not accounting for frame time here)
      Shape1.frameNStart = frameN;  // exact frame index
      
      Shape1.setAutoDraw(true);
    }
    
    frameRemains = 0.5 + 0.5 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (Shape1.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      Shape1.setAutoDraw(false);
    }
    
    
    // *Shape2* updates
    if (t >= 1.5 && Shape2.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Shape2.tStart = t;  // (not accounting for frame time here)
      Shape2.frameNStart = frameN;  // exact frame index
      
      Shape2.setAutoDraw(true);
    }
    
    frameRemains = 1.5 + 0.5 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (Shape2.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      Shape2.setAutoDraw(false);
    }
    
    
    // *Resp_s_or_d* updates
    if (t >= 1.5 && Resp_s_or_d.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Resp_s_or_d.tStart = t;  // (not accounting for frame time here)
      Resp_s_or_d.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { Resp_s_or_d.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { Resp_s_or_d.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { Resp_s_or_d.clearEvents(); });
    }
    
    if (Resp_s_or_d.status === PsychoJS.Status.STARTED) {
      let theseKeys = Resp_s_or_d.getKeys({keyList: ['s', 'd'], waitRelease: false});
      _Resp_s_or_d_allKeys = _Resp_s_or_d_allKeys.concat(theseKeys);
      if (_Resp_s_or_d_allKeys.length > 0) {
        Resp_s_or_d.keys = _Resp_s_or_d_allKeys[_Resp_s_or_d_allKeys.length - 1].name;  // just the last key pressed
        Resp_s_or_d.rt = _Resp_s_or_d_allKeys[_Resp_s_or_d_allKeys.length - 1].rt;
        Resp_s_or_d.duration = _Resp_s_or_d_allKeys[_Resp_s_or_d_allKeys.length - 1].duration;
        // was this correct?
        if (Resp_s_or_d.keys == correct_answer) {
            Resp_s_or_d.corr = 1;
        } else {
            Resp_s_or_d.corr = 0;
        }
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of DiscriminationTrialComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function DiscriminationTrialRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'DiscriminationTrial' ---
    for (const thisComponent of DiscriminationTrialComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('DiscriminationTrial.stopped', globalClock.getTime());
    // was no response the correct answer?!
    if (Resp_s_or_d.keys === undefined) {
      if (['None','none',undefined].includes(correct_answer)) {
         Resp_s_or_d.corr = 1;  // correct non-response
      } else {
         Resp_s_or_d.corr = 0;  // failed to respond (incorrectly)
      }
    }
    // store data for current loop
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(Resp_s_or_d.corr, level);
    }
    psychoJS.experiment.addData('Resp_s_or_d.keys', Resp_s_or_d.keys);
    psychoJS.experiment.addData('Resp_s_or_d.corr', Resp_s_or_d.corr);
    if (typeof Resp_s_or_d.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('Resp_s_or_d.rt', Resp_s_or_d.rt);
        psychoJS.experiment.addData('Resp_s_or_d.duration', Resp_s_or_d.duration);
        routineTimer.reset();
        }
    
    Resp_s_or_d.stop();
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
    // the Routine "DiscriminationTrial" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var WelcomeToCategorizationTaskMaxDurationReached;
var _PressAnyKey3_allKeys;
var WelcomeToCategorizationTaskMaxDuration;
var WelcomeToCategorizationTaskComponents;
function WelcomeToCategorizationTaskRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'WelcomeToCategorizationTask' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    WelcomeToCategorizationTaskClock.reset();
    routineTimer.reset();
    WelcomeToCategorizationTaskMaxDurationReached = false;
    // update component parameters for each repeat
    CategoryInstructions.setText((paragraph + "\n\nPress spacebar to continue"));
    PressAnyKey3.keys = undefined;
    PressAnyKey3.rt = undefined;
    _PressAnyKey3_allKeys = [];
    // Run 'Begin Routine' code from Instructions_2
    if ((responseKey === "1")) {
        promptText = "\n\nPress '1' to continue";
    } else {
        if ((responseKey === "2")) {
            promptText = "\n\nPress '2' to continue";
        } else {
            if ((responseKey === "3")) {
                promptText = "\n\nPress '3' to continue";
            } else {
                promptText = "\n\nPress spacebar to continue";
            }
        }
    }
    CategoryInstructions.text = (paragraph + promptText);
    PressAnyKey3.keys = [];
    PressAnyKey3.allowedKeys = [responseKey];
    
    psychoJS.experiment.addData('WelcomeToCategorizationTask.started', globalClock.getTime());
    WelcomeToCategorizationTaskMaxDuration = null
    // keep track of which components have finished
    WelcomeToCategorizationTaskComponents = [];
    WelcomeToCategorizationTaskComponents.push(CategoryInstructions);
    WelcomeToCategorizationTaskComponents.push(PressAnyKey3);
    
    for (const thisComponent of WelcomeToCategorizationTaskComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function WelcomeToCategorizationTaskRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'WelcomeToCategorizationTask' ---
    // get current time
    t = WelcomeToCategorizationTaskClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *CategoryInstructions* updates
    if (t >= 0.0 && CategoryInstructions.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      CategoryInstructions.tStart = t;  // (not accounting for frame time here)
      CategoryInstructions.frameNStart = frameN;  // exact frame index
      
      CategoryInstructions.setAutoDraw(true);
    }
    
    
    // *PressAnyKey3* updates
    if (t >= 0.0 && PressAnyKey3.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      PressAnyKey3.tStart = t;  // (not accounting for frame time here)
      PressAnyKey3.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { PressAnyKey3.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { PressAnyKey3.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { PressAnyKey3.clearEvents(); });
    }
    
    if (PressAnyKey3.status === PsychoJS.Status.STARTED) {
      let theseKeys = PressAnyKey3.getKeys({keyList: [], waitRelease: false});
      _PressAnyKey3_allKeys = _PressAnyKey3_allKeys.concat(theseKeys);
      if (_PressAnyKey3_allKeys.length > 0) {
        PressAnyKey3.keys = _PressAnyKey3_allKeys[_PressAnyKey3_allKeys.length - 1].name;  // just the last key pressed
        PressAnyKey3.rt = _PressAnyKey3_allKeys[_PressAnyKey3_allKeys.length - 1].rt;
        PressAnyKey3.duration = _PressAnyKey3_allKeys[_PressAnyKey3_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of WelcomeToCategorizationTaskComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function WelcomeToCategorizationTaskRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'WelcomeToCategorizationTask' ---
    for (const thisComponent of WelcomeToCategorizationTaskComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('WelcomeToCategorizationTask.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(PressAnyKey3.corr, level);
    }
    psychoJS.experiment.addData('PressAnyKey3.keys', PressAnyKey3.keys);
    if (typeof PressAnyKey3.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('PressAnyKey3.rt', PressAnyKey3.rt);
        psychoJS.experiment.addData('PressAnyKey3.duration', PressAnyKey3.duration);
        routineTimer.reset();
        }
    
    PressAnyKey3.stop();
    // the Routine "WelcomeToCategorizationTask" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var CategorizationTrialMaxDurationReached;
var true_category;
var rx;
var ry;
var xpos;
var ypos;
var _Respond_1or2or3_allKeys;
var CategorizationTrialMaxDuration;
var CategorizationTrialComponents;
function CategorizationTrialRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'CategorizationTrial' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    CategorizationTrialClock.reset();
    routineTimer.reset();
    CategorizationTrialMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from SetupTrial_2
    trial_number += 1;
    true_category = true_category_list[trial_number];
    excursion = 0.25;
    rx = Math.random();
    ry = Math.random();
    xpos = ((- excursion) + ((rx * 2) * excursion));
    ypos = ((- excursion) + ((ry * 2) * excursion));
    
    // Create shape coordinate object for logging
    var shapeCoord = [x_list[trial_number], y_list[trial_number]];
    
    // Log shape parameters
    psychoJS.experiment.addData('shape_coordinates', JSON.stringify(shapeCoord));
    
    // Log category-specific parameters
    if (true_category === 0) {
        psychoJS.experiment.addData('category_center', JSON.stringify([muAx, muAy]));
        psychoJS.experiment.addData('category_sigma', sigmaA);
    } else if (true_category === 1) {
        psychoJS.experiment.addData('category_center', JSON.stringify([muBx, muBy]));
        psychoJS.experiment.addData('category_sigma', sigmaB);
    } else if (true_category === 2) {
        psychoJS.experiment.addData('category_center', JSON.stringify([muCx, muCy]));
        psychoJS.experiment.addData('category_sigma', sigmaC);
    }
    
    // Log subspace information
    psychoJS.experiment.addData('subspace_center', JSON.stringify(subspace[0]));
    psychoJS.experiment.addData('subspace_vector1', JSON.stringify(subspace[1]));
    psychoJS.experiment.addData('subspace_vector2', JSON.stringify(subspace[2]));
    
    Stimulus.setPos([xpos, ypos]);
    Stimulus.setVertices(shape_list[trial_number]);
    Respond_1or2or3.keys = undefined;
    Respond_1or2or3.rt = undefined;
    _Respond_1or2or3_allKeys = [];
    psychoJS.experiment.addData('CategorizationTrial.started', globalClock.getTime());
    CategorizationTrialMaxDuration = null
    // keep track of which components have finished
    CategorizationTrialComponents = [];
    CategorizationTrialComponents.push(Stimulus);
    CategorizationTrialComponents.push(Respond_1or2or3);
    
    for (const thisComponent of CategorizationTrialComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function CategorizationTrialRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'CategorizationTrial' ---
    // get current time
    t = CategorizationTrialClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *Stimulus* updates
    if (t >= 1 && Stimulus.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Stimulus.tStart = t;  // (not accounting for frame time here)
      Stimulus.frameNStart = frameN;  // exact frame index
      
      Stimulus.setAutoDraw(true);
    }
    
    
    // *Respond_1or2or3* updates
    if (t >= 0.0 && Respond_1or2or3.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Respond_1or2or3.tStart = t;  // (not accounting for frame time here)
      Respond_1or2or3.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { Respond_1or2or3.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { Respond_1or2or3.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { Respond_1or2or3.clearEvents(); });
    }
    
    if (Respond_1or2or3.status === PsychoJS.Status.STARTED) {
      let theseKeys = Respond_1or2or3.getKeys({keyList: ['1', '2', '3'], waitRelease: false});
      _Respond_1or2or3_allKeys = _Respond_1or2or3_allKeys.concat(theseKeys);
      if (_Respond_1or2or3_allKeys.length > 0) {
        Respond_1or2or3.keys = _Respond_1or2or3_allKeys[_Respond_1or2or3_allKeys.length - 1].name;  // just the last key pressed
        Respond_1or2or3.rt = _Respond_1or2or3_allKeys[_Respond_1or2or3_allKeys.length - 1].rt;
        Respond_1or2or3.duration = _Respond_1or2or3_allKeys[_Respond_1or2or3_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of CategorizationTrialComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function CategorizationTrialRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'CategorizationTrial' ---
    for (const thisComponent of CategorizationTrialComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('CategorizationTrial.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(Respond_1or2or3.corr, level);
    }
    psychoJS.experiment.addData('Respond_1or2or3.keys', Respond_1or2or3.keys);
    if (typeof Respond_1or2or3.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('Respond_1or2or3.rt', Respond_1or2or3.rt);
        psychoJS.experiment.addData('Respond_1or2or3.duration', Respond_1or2or3.duration);
        routineTimer.reset();
        }
    
    Respond_1or2or3.stop();
    // the Routine "CategorizationTrial" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var FeedbackMaxDurationReached;
var numeric_response_minus1;
var ray_color;
var feedback_image;
var correctness;
var point_value;
var FeedbackMaxDuration;
var FeedbackComponents;
function FeedbackRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'Feedback' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    FeedbackClock.reset(routineTimer.getTime());
    routineTimer.add(1.000000);
    FeedbackMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from code
    // FeedbackText code: + "\nDelay: " + str(round(delay_duration, 1)) + "s"
    // Delay indicator text: $"DELAY: " + delay_duration.toFixed(1) + " s"
    
    if ((Respond_1or2or3.keys === "1")) {
        numeric_response_minus1 = 0;
        ray_color = "green";
    } else {
        if ((Respond_1or2or3.keys === "2")) {
            numeric_response_minus1 = 1;
            ray_color = "red";
        } else {
            if ((Respond_1or2or3.keys === "3")) {
                numeric_response_minus1 = 2;
                ray_color = "blue";
            } else {
                numeric_response_minus1 = null;
            }
        }
    }
    if ((true_category_list[trial_number] === 0)) {
        feedback_image = "green_square.png";
    } else {
        if ((true_category_list[trial_number] === 1)) {
            feedback_image = "red_square.png";
        } else {
            if ((true_category_list[trial_number] === 2)) {
                feedback_image = "blue_square.png";
            } else {
                feedback_image = "default_image.png";
            }
        }
    }
    if ((numeric_response_minus1 !== null)) {
        if (((utilitymatrix && (true_category < utilitymatrix.length)) && (numeric_response_minus1 < utilitymatrix[true_category].length))) {
            points += utilitymatrix[true_category][numeric_response_minus1];
        }
        if ((numeric_response_minus1 === true_category_list[trial_number])) {
            correctness = 1;
        } else {
            correctness = 0;
        }
    } else {
        correctness = null;
    }
    
    
    /*
    // UTILITY-BASED DELAY CALCULATION
    var C = 4;
    var k = 1;  // Change to 2 for longer delays
    
    if (numeric_response_minus1 !== null) {
        var utility = utilitymatrix[true_category][numeric_response_minus1];
        var positive_utility = utility + 4;
        delay_duration = k * (C - positive_utility);
        delay_duration = Math.max(0, delay_duration);
        
        console.log("Utility: " + utility + ", Delay: " + delay_duration + "s");
    } else {
        delay_duration = k * C;
    }
    
    // Add timing mark
    performance.mark('delay_start');
    */ 
    
    // Calculate offset dynamically
    var offset = 3;  // For a -3 minimum, this gives offset = 3
    
    // exponential delay calculation 
    var k = 10;  // Scaling factor – can be adjusted to whatever. 
    if (numeric_response_minus1 !== null) {
        var utility = utilitymatrix[true_category][numeric_response_minus1];
        var positive_utility = utility + offset + 1;  // +1 to make minimum 1 instead of 0
        var delay_duration_raw = 1 / positive_utility;  // Exponential relationship
        var min_delay = 1 / (offset + 2);  // Minimum possible delay (for best response)
        var delay_duration_normalized = delay_duration_raw - min_delay;  // Range from 0 to max
        delay_duration = k * delay_duration_normalized;
        delay_duration = Math.max(0, delay_duration);
        
        console.log("Utility: " + utility + ", Exponential Delay: " + delay_duration.toFixed(3) + "s");
    }
    
    
    // Calculate delay indicator text
    // DelayIndicator.text = "DELAY: " + delay_duration.toFixed(1) + " s";
    // DelayIndicator.pos = [xpos, ypos + 0.4];  // Above the point indicator
    
    // Calculate point change text and color
    // Set the point change text and color
    point_value = utilitymatrix[true_category][numeric_response_minus1];
    //PointChange.text = ((point_value > 0) ? "+" : "") + point_value.toString();
    if (point_value > 0) {
        PointChange.setColor("green");
    } else {
        PointChange.setColor("red");
    }
    PointChange.pos = [xpos, ypos + 0.3];
    Ray.setFillColor(new util.Color(ray_color));
    Ray.setPos([xpos, (ypos - 0.5)]);
    Ray.setLineColor(new util.Color(ray_color));
    Square.setPos([xpos, ypos]);
    Square.setImage(feedback_image);
    RepeatStimulus.setPos([xpos, ypos]);
    RepeatStimulus.setVertices(shape_list[trial_number]);
    FeedbackText.setText(("Total Points: " + points.toString()));
    PointChange.setColor(new util.Color('white'));
    PointChange.setText((((utilitymatrix[true_category][numeric_response_minus1] > 0) ? "+" : "") + utilitymatrix[true_category][numeric_response_minus1].toString()));
    psychoJS.experiment.addData('Feedback.started', globalClock.getTime());
    FeedbackMaxDuration = null
    // keep track of which components have finished
    FeedbackComponents = [];
    FeedbackComponents.push(Ray);
    FeedbackComponents.push(Square);
    FeedbackComponents.push(RepeatStimulus);
    FeedbackComponents.push(FeedbackText);
    FeedbackComponents.push(PointChange);
    
    for (const thisComponent of FeedbackComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function FeedbackRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'Feedback' ---
    // get current time
    t = FeedbackClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *Ray* updates
    if (t >= 0.0 && Ray.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Ray.tStart = t;  // (not accounting for frame time here)
      Ray.frameNStart = frameN;  // exact frame index
      
      Ray.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + 1.0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (Ray.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      Ray.setAutoDraw(false);
    }
    
    
    // *Square* updates
    if (t >= 0.0 && Square.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      Square.tStart = t;  // (not accounting for frame time here)
      Square.frameNStart = frameN;  // exact frame index
      
      Square.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + 1.0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (Square.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      Square.setAutoDraw(false);
    }
    
    
    // *RepeatStimulus* updates
    if (t >= 0.0 && RepeatStimulus.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      RepeatStimulus.tStart = t;  // (not accounting for frame time here)
      RepeatStimulus.frameNStart = frameN;  // exact frame index
      
      RepeatStimulus.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + 1.0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (RepeatStimulus.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      RepeatStimulus.setAutoDraw(false);
    }
    
    
    // *FeedbackText* updates
    if (t >= 0.0 && FeedbackText.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      FeedbackText.tStart = t;  // (not accounting for frame time here)
      FeedbackText.frameNStart = frameN;  // exact frame index
      
      FeedbackText.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + 1.0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (FeedbackText.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      FeedbackText.setAutoDraw(false);
    }
    
    
    // *PointChange* updates
    if (t >= 0.0 && PointChange.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      PointChange.tStart = t;  // (not accounting for frame time here)
      PointChange.frameNStart = frameN;  // exact frame index
      
      PointChange.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + 1.0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (PointChange.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      PointChange.setAutoDraw(false);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of FeedbackComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine && routineTimer.getTime() > 0) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function FeedbackRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'Feedback' ---
    for (const thisComponent of FeedbackComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('Feedback.stopped', globalClock.getTime());
    // Run 'End Routine' code from code_2
    psychoJS.experiment.addData("xcoord", x_list[trial_number]);
    psychoJS.experiment.addData("ycoord", y_list[trial_number]);
    psychoJS.experiment.addData("shape_coord", JSON.stringify([x_list[trial_number], y_list[trial_number]]));
    psychoJS.experiment.addData("numeric_response_minus1", numeric_response_minus1);
    psychoJS.experiment.addData("correctness", correctness);
    psychoJS.experiment.addData("truecategory", Number.parseInt(true_category_list[trial_number]));
    psychoJS.experiment.addData("mixture_index", mixture_index_list[trial_number]);
    psychoJS.experiment.addData("respAifA", utilitymatrix[0][0]);
    psychoJS.experiment.addData("respBifA", utilitymatrix[0][1]);
    psychoJS.experiment.addData("respCifA", utilitymatrix[0][2]);
    psychoJS.experiment.addData("respAifB", utilitymatrix[1][0]);
    psychoJS.experiment.addData("respBifB", utilitymatrix[1][1]);
    psychoJS.experiment.addData("respCifB", utilitymatrix[1][2]);
    psychoJS.experiment.addData("respAifC", utilitymatrix[2][0]);
    psychoJS.experiment.addData("respBifC", utilitymatrix[2][1]);
    psychoJS.experiment.addData("respCifC", utilitymatrix[2][2]);
    psychoJS.experiment.addData("trial_number", trial_number);
    psychoJS.experiment.addData("D", D);
    psychoJS.experiment.addData("muAx", muAx);
    psychoJS.experiment.addData("muAy", muAy);
    psychoJS.experiment.addData("muBx", muBx);
    psychoJS.experiment.addData("muBy", muBy);
    psychoJS.experiment.addData("muCx", muCx);
    psychoJS.experiment.addData("muCy", muCy);
    psychoJS.experiment.addData("sigmaA", sigmaA);
    psychoJS.experiment.addData("sigmaB", sigmaB);
    psychoJS.experiment.addData("sigmaC", sigmaC);
    psychoJS.experiment.addData("priorA", prior[0]);
    psychoJS.experiment.addData("priorB", prior[1]);
    psychoJS.experiment.addData("priorC", prior[2]);
    // FIX 2026-08-20c: fixed-length training -- every participant runs all maxTrials (300)
    // categorization trials. Removed the points-based early exit (points >= Req_points);
    // the loop ends via nReps = maxTrials. Points still accumulate and show in feedback.
    
    if (FeedbackMaxDurationReached) {
        FeedbackClock.add(FeedbackMaxDuration);
    } else {
        FeedbackClock.add(1.000000);
    }
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var DelayedStimulusMaxDurationReached;
var DelayedStimulusMaxDuration;
var DelayedStimulusComponents;
function DelayedStimulusRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'DelayedStimulus' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    DelayedStimulusClock.reset();
    routineTimer.reset();
    DelayedStimulusMaxDurationReached = false;
    // update component parameters for each repeat
    StimDelay.setText('');
    // Mark when this delay routine actually starts
    performance.mark('delay_routine_start');
    // Mark the start of the delay period
    performance.mark('delay_start');
    psychoJS.experiment.addData('DelayedStimulus.started', globalClock.getTime());
    DelayedStimulusMaxDuration = null
    // keep track of which components have finished
    DelayedStimulusComponents = [];
    DelayedStimulusComponents.push(StimDelay);
    
    for (const thisComponent of DelayedStimulusComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function DelayedStimulusRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'DelayedStimulus' ---
    // get current time
    t = DelayedStimulusClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *StimDelay* updates
    if (t >= 0.0 && StimDelay.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      StimDelay.tStart = t;  // (not accounting for frame time here)
      StimDelay.frameNStart = frameN;  // exact frame index
      
      StimDelay.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + delay_duration - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (StimDelay.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      StimDelay.setAutoDraw(false);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of DelayedStimulusComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function DelayedStimulusRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'DelayedStimulus' ---
    for (const thisComponent of DelayedStimulusComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('DelayedStimulus.stopped', globalClock.getTime());
    // Mark the end and measure
    performance.mark('delay_end');
    performance.measure('delay_duration', 'delay_start', 'delay_end');
    const measure = performance.getEntriesByName('delay_duration')[0];
    console.log(`Trial: Delay set to ${delay_duration}s, Actual: ${measure.duration.toFixed(3)}ms`);
    performance.clearMarks();
    performance.clearMeasures();
    
    
    // the Routine "DelayedStimulus" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var DiscriminationInstructions_PostMaxDurationReached;
var _key_resp_2_allKeys;
var DiscriminationInstructions_PostMaxDuration;
var DiscriminationInstructions_PostComponents;
function DiscriminationInstructions_PostRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'DiscriminationInstructions_Post' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    DiscriminationInstructions_PostClock.reset();
    routineTimer.reset();
    DiscriminationInstructions_PostMaxDurationReached = false;
    // update component parameters for each repeat
    text_4.setText((paragraph + "\n\nPress spacebar to continue"));
    key_resp_2.keys = undefined;
    key_resp_2.rt = undefined;
    _key_resp_2_allKeys = [];
    // Run 'Begin Routine' code from Instructions
    header = "POST-TEST INSTRUCTIONS\n\n";
    if ((responseKey === "s")) {
        promptText = "\n\nPress 'S' to continue";
    } else {
        if ((responseKey === "d")) {
            promptText = "\n\nPress 'D' to continue";
        } else {
            promptText = "\n\nPress spacebar to continue";
        }
    }
    PretestInstructions.text = ((header + paragraph) + promptText);
    key_resp.keys = [];
    key_resp.allowedKeys = [responseKey];
    psychoJS.experiment.addData('DiscriminationInstructions_Post.started', globalClock.getTime());
    DiscriminationInstructions_PostMaxDuration = null
    // keep track of which components have finished
    DiscriminationInstructions_PostComponents = [];
    DiscriminationInstructions_PostComponents.push(text_4);
    DiscriminationInstructions_PostComponents.push(key_resp_2);
    
    for (const thisComponent of DiscriminationInstructions_PostComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function DiscriminationInstructions_PostRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'DiscriminationInstructions_Post' ---
    // get current time
    t = DiscriminationInstructions_PostClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *text_4* updates
    if (t >= 0.0 && text_4.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text_4.tStart = t;  // (not accounting for frame time here)
      text_4.frameNStart = frameN;  // exact frame index
      
      text_4.setAutoDraw(true);
    }
    
    
    // *key_resp_2* updates
    if (t >= 0.0 && key_resp_2.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp_2.tStart = t;  // (not accounting for frame time here)
      key_resp_2.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { key_resp_2.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { key_resp_2.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { key_resp_2.clearEvents(); });
    }
    
    if (key_resp_2.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp_2.getKeys({keyList: [], waitRelease: false});
      _key_resp_2_allKeys = _key_resp_2_allKeys.concat(theseKeys);
      if (_key_resp_2_allKeys.length > 0) {
        key_resp_2.keys = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].name;  // just the last key pressed
        key_resp_2.rt = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].rt;
        key_resp_2.duration = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of DiscriminationInstructions_PostComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function DiscriminationInstructions_PostRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'DiscriminationInstructions_Post' ---
    for (const thisComponent of DiscriminationInstructions_PostComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('DiscriminationInstructions_Post.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(key_resp_2.corr, level);
    }
    psychoJS.experiment.addData('key_resp_2.keys', key_resp_2.keys);
    if (typeof key_resp_2.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('key_resp_2.rt', key_resp_2.rt);
        psychoJS.experiment.addData('key_resp_2.duration', key_resp_2.duration);
        routineTimer.reset();
        }
    
    key_resp_2.stop();
    // the Routine "DiscriminationInstructions_Post" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var ThanksMaxDurationReached;
var ThanksMaxDuration;
var ThanksComponents;
function ThanksRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'Thanks' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    ThanksClock.reset(routineTimer.getTime());
    routineTimer.add(3.000000);
    ThanksMaxDurationReached = false;
    // update component parameters for each repeat
    psychoJS.experiment.addData('Thanks.started', globalClock.getTime());
    ThanksMaxDuration = null
    // keep track of which components have finished
    ThanksComponents = [];
    ThanksComponents.push(text_3);
    
    for (const thisComponent of ThanksComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function ThanksRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'Thanks' ---
    // get current time
    t = ThanksClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *text_3* updates
    if (t >= 0.0 && text_3.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text_3.tStart = t;  // (not accounting for frame time here)
      text_3.frameNStart = frameN;  // exact frame index
      
      text_3.setAutoDraw(true);
    }
    
    frameRemains = 0.0 + 3 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (text_3.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      text_3.setAutoDraw(false);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of ThanksComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine && routineTimer.getTime() > 0) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function ThanksRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'Thanks' ---
    for (const thisComponent of ThanksComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('Thanks.stopped', globalClock.getTime());
    if (ThanksMaxDurationReached) {
        ThanksClock.add(ThanksMaxDuration);
    } else {
        ThanksClock.add(3.000000);
    }
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


function importConditions(currentLoop) {
  return async function () {
    psychoJS.importAttributes(currentLoop.getCurrentTrial());
    return Scheduler.Event.NEXT;
    };
}


async function quitPsychoJS(message, isCompleted) {
  // Check for and save orphaned data
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }
  psychoJS.window.close();
  psychoJS.quit({message: message, isCompleted: isCompleted});
  
  return Scheduler.Event.QUIT;
}
