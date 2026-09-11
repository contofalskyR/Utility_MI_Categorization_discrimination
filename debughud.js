/**
 * debughud.js — a live overlay of the experiment's internal state, for the DEBUG edition only
 * (installed by the experiment when window.EXP_DEBUG_HUD is set or the URL has ?debug=1; never on participant pages).
 *
 * It only READS window.__EXP (trial, lastResult, staircases, feature_space, ...) and draws a DOM panel with
 * pointer-events: none, so it changes nothing about timing, keys, stimuli or data. Panels:
 *   - session: method, build, routine, feature space (origin, u, v, gains, pool id, redraws)
 *   - current trial: boundary, level, catch, feature-space coordinates of both shapes, their 4-D parameters, screen
 *     positions and orientations (discrimination); true category, (x, y), parameters, points (categorization)
 *   - last response: key, RT, correct, the staircase's estimate after the update
 *   - staircases of the current phase: n, catch count, level, alpha +/- sd, 90 % CI, stop state
 *   - feature-plane map: category clouds (1 and 2 sigma), boundaries, all categorization samples so far (hollow = wrong),
 *     the current pair (yellow), the current categorization sample (white ring)
 *   - staircase chart: level per trial (filled = correct, hollow = wrong, square = identical pair), alpha estimate (dotted)
 *   - posterior over the threshold for each staircase (QUEST pdf or the alpha marginal of Psi / QUEST+)
 */
const COL = { A: '#3fb950', B: '#f85149', C: '#58a6ff', s0: '#ffa657', s1: '#79c0ff', pair: '#ffd33d', text: '#d0d7de', dim: '#8b949e', grid: '#30363d' };
const f = (v, d = 3) => (typeof v === 'number' && isFinite(v)) ? v.toFixed(d) : (v === null || v === undefined ? '–' : String(v));
const vec = (v, d = 3) => Array.isArray(v) ? '[' + v.map(x => f(x, d)).join(' ') + ']' : '–';

export function installDebugHud(psychoJS, CONFIG) {
  if (document.getElementById('debughud')) return;
  const box = document.createElement('div');
  box.id = 'debughud';
  box.style.cssText = 'position:fixed;top:6px;left:6px;width:600px;max-height:calc(100vh - 12px);overflow:hidden;z-index:2147483000;pointer-events:none;' +
    'background:rgba(13,17,23,.78);color:' + COL.text + ';font:11.5px/1.35 ui-monospace,Menlo,Consolas,monospace;padding:7px 9px;border:1px solid #444c56;border-radius:6px;white-space:pre-wrap;';
  // header bar: the only part that takes the mouse (drag to move; buttons switch side, collapse the plots, hide the panel).
  // Keys are never touched: the buttons blur themselves so the experiment's keyboard input is unchanged.
  const bar = document.createElement('div');
  bar.style.cssText = 'pointer-events:auto;cursor:move;display:flex;gap:8px;align-items:center;margin:-3px -5px 5px;padding:2px 6px;background:rgba(255,255,255,.07);border-radius:4px;user-select:none;color:' + COL.dim + ';';
  bar.innerHTML = '<span style="flex:1">debug overlay — drag to move if it covers a shape</span>' +
    ['side', 'compact', 'hide'].map(a => `<button data-a="${a}" style="pointer-events:auto;font:inherit;font-size:11px;padding:1px 7px;border-radius:3px;border:1px solid #444c56;background:#21262d;color:${COL.text};cursor:pointer">${{ side: '⇄ side', compact: '▭ compact', hide: '× hide' }[a]}</button>`).join('');
  const chip = document.createElement('div');   // brings the panel back after "hide"
  chip.textContent = 'debug ▸'; chip.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:2147483000;pointer-events:auto;cursor:pointer;display:none;background:rgba(13,17,23,.85);color:' + COL.dim + ';font:11px ui-monospace,Menlo,monospace;padding:3px 8px;border:1px solid #444c56;border-radius:4px;user-select:none';
  chip.onmousedown = e => { e.preventDefault(); box.style.display = ''; chip.style.display = 'none'; };
  document.body.appendChild(chip);
  let compact = false, drag = null;
  bar.addEventListener('mousedown', e => {
    e.preventDefault();
    const a = e.target.getAttribute && e.target.getAttribute('data-a');
    if (a === 'side') { const r = box.style.right === '6px'; box.style.right = r ? '' : '6px'; box.style.left = r ? '6px' : ''; box.style.top = '6px'; return; }
    if (a === 'compact') { compact = !compact; for (const c of [map, chart, post]) c.style.display = compact ? 'none' : 'block'; return; }
    if (a === 'hide') { box.style.display = 'none'; chip.style.display = ''; return; }
    const rc = box.getBoundingClientRect(); drag = { dx: e.clientX - rc.left, dy: e.clientY - rc.top };
  });
  window.addEventListener('mousemove', e => { if (!drag) return; box.style.right = ''; box.style.left = Math.max(0, e.clientX - drag.dx) + 'px'; box.style.top = Math.max(0, e.clientY - drag.dy) + 'px'; });
  window.addEventListener('mouseup', () => { drag = null; });
  const text = document.createElement('div');
  const map = document.createElement('canvas'); map.width = 580; map.height = 200;
  const chart = document.createElement('canvas'); chart.width = 580; chart.height = 130;
  const post = document.createElement('canvas'); post.width = 580; post.height = 70;
  for (const c of [map, chart, post]) { c.style.cssText = 'display:block;margin-top:5px;background:rgba(0,0,0,.35);border-radius:4px'; }
  box.appendChild(bar); box.appendChild(text); box.appendChild(map); box.appendChild(chart); box.appendChild(post);
  document.body.appendChild(box);

  const catHist = [];            // categorization samples with their outcomes, from trial + lastResult
  const seenTrial = {};          // trial_number -> {x, y, cat}
  let lastCatResult = -1;
  const t0 = performance.now();

  function catLetter(c) { return ['A', 'B', 'C'][c] || '–'; }
  function boundaryName(fi) {
    const b = (CONFIG.boundaries || [])[fi]; const p = (CONFIG.discriminationParameters || [])[fi];
    return (b ? b.label : 'feature ' + fi) + (p ? ' centre (' + f(p[0], 3) + ', ' + f(p[1], 3) + ') along (' + f(p[2], 0) + ', ' + f(p[3], 0) + ')' : '');
  }

  function render() {
    const E = window.__EXP || {}; const tr = E.trial || {}; const lr = E.lastResult || {};
    const fs = E.feature_space; const lines = [];
    lines.push(`DEBUG OVERLAY   method=${E.method}   routine=${E.routine || '–'}   t=${((performance.now() - t0) / 1000).toFixed(1)} s   ${E.smoke ? 'SHORT DEMO' : 'full session'}`);
    lines.push(`build=${E.build}`);
    if (fs) {
      lines.push(`space: ${E.space_id !== undefined && E.space_id !== null ? '#' + E.space_id + ' (pool)' : 'fresh draw'}   redraws=${f(E.subspace_redraws, 0)}   min radius=${f(E.subspace_min_radius)}   visible gain u=${f(gain(fs[1]), 3)} v=${f(gain(fs[2]), 3)}`);
      if (E.subspace_rot_gap_ab !== undefined) lines.push(`rotated category gaps: A/B=${f(E.subspace_rot_gap_ab, 4)}  B/C=${f(E.subspace_rot_gap_bc, 4)}   (cohort median .0138; min required ${E.min_rotated_gap > 0 ? f(E.min_rotated_gap, 3) : 'off'}; redraws for rotation=${f(E.subspace_redraws_rotation, 0)})`);
      lines.push(`  origin ${vec(fs[0])}   u ${vec(fs[1])}`);
      lines.push(`  v      ${vec(fs[2])}   shape params = origin + x·u + y·v`);
    } else lines.push('space: not drawn yet');
    lines.push('');
    if (tr.phase === 'Categorization') {
      if (tr.trial_number !== undefined && !seenTrial[tr.trial_number]) seenTrial[tr.trial_number] = { x: tr.x, y: tr.y, cat: tr.true_category };
      lines.push(`CATEGORIZATION  trial ${tr.trial_number + 1}   true category ${catLetter(tr.true_category)} (${['green', 'red', 'blue'][tr.true_category]})   x=${f(tr.x)}  y=${f(tr.y)}`);
      lines.push(`  drawn from N(${vec(tr.category_center, 2)}, σ ${f(tr.sigma)})   params ${vec(tr.params)}`);
      lines.push(`  screen pos ${vec(tr.pos, 2)} (rotation random)   points before this trial ${f(tr.points_before, 0)}`);
    } else if (tr.phase) {
      const stair = (E.staircases && E.staircases[tr.phase] || []).find(s => s.label === tr.label);
      lines.push(`${tr.phase}${tr.reference ? ' (reference block, no staircase update)' : ''}   boundary ${boundaryName(tr.feature_index)}   trial ${tr.n !== null && tr.n !== undefined ? tr.n + 1 : '–'}${stair ? '/' + stair.maxTrials : ''}`);
      lines.push(`  level ${f(tr.level, 4)} (raw ${f(tr.rawLevel, 4)})   ${tr.isCatch ? 'IDENTICAL PAIR (catch) → correct key "s"' : 'different pair → correct key "d"'}`);
      lines.push(`  coord1 ${vec(tr.coord1)}   coord2 ${vec(tr.coord2)}   = centre ± level·vector, separation ${f(2 * tr.level, 3)}`);
      lines.push(`  params1 ${vec(tr.params1)}   params2 ${vec(tr.params2)}   |Δ| ${f(dist(tr.params1, tr.params2), 3)}`);
      lines.push(`  screen: shape1 pos ${vec(tr.position1, 2)} ori ${f(tr.orientation1, 0)}° applied   shape2 pos ${vec(tr.position2, 2)} ori ${f(tr.orientation2, 0)}° applied   (random orientations are sampled but never applied — original behaviour)`);
    } else lines.push('no trial yet');
    lines.push('');
    if (lr.phase === 'Categorization') {
      if (lr.trial_number !== lastCatResult && lr.trial_number !== undefined) {
        lastCatResult = lr.trial_number; const s = seenTrial[lr.trial_number] || {};
        catHist.push({ x: s.x, y: s.y, cat: lr.true_category, resp: lr.response, correct: lr.correct });
      }
      lines.push(`last: trial ${lr.trial_number + 1}  true ${catLetter(lr.true_category)} → key ${lr.key || 'none'} (${catLetter(lr.response)})  ${lr.correct === 1 ? 'CORRECT' : lr.correct === 0 ? 'WRONG' : 'no response'}   rt ${f(lr.rt, 3)} s`);
      lines.push(`  ${lr.point_value > 0 ? '+' : ''}${f(lr.point_value, 0)} pts → total ${f(lr.points, 0)}   delay ${f(lr.delay, 2)} s`);
      const n = catHist.length, nc = catHist.filter(h => h.correct === 1).length;
      const per = [0, 1, 2].map(c => { const h = catHist.filter(x => x.cat === c); return catLetter(c) + ' ' + h.filter(x => x.correct === 1).length + '/' + h.length; });
      const resp = [0, 1, 2].map(c => catLetter(c) + '×' + catHist.filter(x => x.resp === c).length);
      lines.push(`  running: ${n} trials, ${n ? Math.round(100 * nc / n) : 0}% correct   by category ${per.join('  ')}   responses ${resp.join(' ')}`);
    } else if (lr.phase) {
      const e = lr.est || {};
      lines.push(`last: ${lr.phase} ${lr.label} n=${lr.n}  level ${f(lr.level, 3)} ${lr.isCatch ? 'identical' : 'different'} → said ${lr.saidDifferent ? 'DIFFERENT' : 'SAME'}  ${lr.correct ? 'CORRECT' : 'WRONG'}`);
      lines.push(`  key ${lr.key || '–'}, rt ${f(lr.rt, 3)} s` + (lr.reference ? '  (reference trial: no update)' : ''));
      if (!lr.reference) lines.push(`  after update: α ${f(e.est_alpha)} ± ${f(e.est_alpha_sd)}  90% CI [${f(e.est_ci_lower)}, ${f(e.est_ci_upper)}]` +
                 (e.est_ci_width !== undefined ? ` width ${f(e.est_ci_width)} (stop < ${f(CONFIG.methods.quest.stopInterval, 2)})` : '') +
                 (e.est_beta !== undefined ? `   β ${f(e.est_beta, 2)}` : '') + (e.est_fa !== undefined ? `   FA ${f(e.est_fa, 3)}` : '') + (e.est_lambda !== undefined ? `   λ ${f(e.est_lambda, 3)}` : '') +
                 (e.est_quantile !== undefined ? `   next level (quantile) ${f(e.est_quantile)}` : '') + (lr.finished ? '   FINISHED' : ''));
    }
    // staircases of the current / latest phase
    const phases = Object.keys(E.staircases || {}); const phase = (tr.phase && E.staircases && E.staircases[tr.phase]) ? tr.phase : phases[phases.length - 1];
    const stairs = phase ? E.staircases[phase] : [];
    if (stairs.length) {
      lines.push('');
      lines.push(`${phase} staircases (${E.method}):`);
      for (const s of stairs) {
        const sm = s.summary(); const last = s.trials[s.trials.length - 1];
        lines.push(`  ${s.label}  n ${String(s.n).padStart(2)}  catch ${String(s.nCatch).padStart(2)}  level ${last ? f(last.level, 3) : '–'}  α ${f(sm.est_alpha)}±${f(sm.est_alpha_sd)}  CI [${f(sm.est_ci_lower)},${f(sm.est_ci_upper)}]` +
                   (sm.est_ci_width !== undefined ? ` w ${f(sm.est_ci_width)}` : '') + `  ${s.finished ? 'finished (' + s.finishedReason + ')' : 'running'}`);
      }
    }
    text.textContent = lines.join('\n');
    drawMap(tr, catHist); drawChart(stairs, phase); drawPosterior(stairs);
  }

  function gain(u) { let s = 0; for (let k = 1; k < u.length; k++) s += u[k] * u[k]; return Math.sqrt(s); }
  function dist(a, b) { if (!a || !b) return NaN; let s = 0; for (let k = 0; k < a.length; k++) s += (a[k] - b[k]) ** 2; return Math.sqrt(s); }

  // ---------------------------------------------------------------- feature-plane map
  function drawMap(tr, hist) {
    const g = map.getContext('2d'); const W = map.width, H = map.height; g.clearRect(0, 0, W, H);
    const x0 = -0.15, x1 = 1.15, y0 = 0.15, y1 = 0.85, L = 26, R = 8, T = 8, B = 16;
    const sx = x => L + (x - x0) / (x1 - x0) * (W - L - R), sy = y => T + (y1 - y) / (y1 - y0) * (H - T - B);
    g.strokeStyle = COL.grid; g.lineWidth = 1; g.fillStyle = COL.dim; g.font = '10px ui-monospace,Menlo,monospace';
    for (const x of [0, .25, .5, .75, 1]) { g.beginPath(); g.moveTo(sx(x), T); g.lineTo(sx(x), H - B); g.stroke(); g.fillText(f(x, 2), sx(x) - 10, H - 4); }
    for (const y of [.25, .5, .75]) { g.beginPath(); g.moveTo(L, sy(y)); g.lineTo(W - R, sy(y)); g.stroke(); g.fillText(f(y, 2), 0, sy(y) + 3); }
    // category clouds
    const cs = [[0.25, 0.5, 0.075, COL.A], [0.5, 0.5, 0.075, COL.B], [0.75, 0.5, 0.075, COL.C]];
    for (const [cx, cy, sg, col] of cs) {
      for (const k of [1, 2]) { g.beginPath(); g.ellipse(sx(cx), sy(cy), k * sg * (W - L - R) / (x1 - x0), k * sg * (H - T - B) / (y1 - y0), 0, 0, 2 * Math.PI); g.strokeStyle = col; g.globalAlpha = k === 1 ? .8 : .35; g.stroke(); }
      g.globalAlpha = 1; g.fillStyle = col; g.fillText(['A', 'B', 'C'][cs.findIndex(c => c[0] === cx)], sx(cx) - 3, sy(cy) - 2 * sg * (H - T - B) / (y1 - y0) - 3);
    }
    // boundaries
    for (let i = 0; i < (CONFIG.discriminationParameters || []).length; i++) {
      const p = CONFIG.discriminationParameters[i]; const n = Math.hypot(p[2], p[3]) || 1; const px = -p[3] / n, py = p[2] / n;   // perpendicular to the vector
      g.strokeStyle = i === 0 ? COL.s0 : COL.s1; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(sx(p[0] - .3 * px), sy(p[1] - .3 * py)); g.lineTo(sx(p[0] + .3 * px), sy(p[1] + .3 * py)); g.stroke(); g.setLineDash([]);
      g.fillStyle = g.strokeStyle; g.fillText('f' + i + ' @' + f(p[0], 3), sx(p[0]) + 3, H - B - 4);
    }
    // categorization samples
    for (const h of hist) {
      if (h.x === undefined) continue;
      g.beginPath(); g.arc(sx(h.x), sy(h.y), 2.5, 0, 2 * Math.PI); g.fillStyle = g.strokeStyle = [COL.A, COL.B, COL.C][h.cat] || COL.dim;
      if (h.correct === 1) g.fill(); else g.stroke();
    }
    if (tr.phase === 'Categorization' && tr.x !== undefined) { g.beginPath(); g.arc(sx(tr.x), sy(tr.y), 5, 0, 2 * Math.PI); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); g.lineWidth = 1; }
    // current discrimination pair
    if (tr.coord1 && tr.coord2) {
      g.strokeStyle = g.fillStyle = COL.pair; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(sx(tr.coord1[0]), sy(tr.coord1[1])); g.lineTo(sx(tr.coord2[0]), sy(tr.coord2[1])); g.stroke();
      for (const [c, lab] of [[tr.coord1, '1'], [tr.coord2, '2']]) { g.beginPath(); g.arc(sx(c[0]), sy(c[1]), 4, 0, 2 * Math.PI); g.fill(); g.fillText(lab, sx(c[0]) + 5, sy(c[1]) - 5); }
      if (tr.isCatch) { g.beginPath(); g.arc(sx(tr.coord1[0]), sy(tr.coord1[1]), 8, 0, 2 * Math.PI); g.stroke(); g.fillText('identical', sx(tr.coord1[0]) + 10, sy(tr.coord1[1]) + 12); }
      g.lineWidth = 1;
    }
    g.fillStyle = COL.dim; g.fillText('feature plane: category clouds 1σ/2σ · boundaries f0/f1 · categorization samples (hollow = wrong) · yellow = current pair', L + 4, T + 10);
  }

  // ---------------------------------------------------------------- staircase chart
  function drawChart(stairs, phase) {
    const g = chart.getContext('2d'); const W = chart.width, H = chart.height; g.clearRect(0, 0, W, H);
    if (!stairs.length) return;
    const maxN = Math.max(10, ...stairs.map(s => s.maxTrials)); const yMax = Math.max(...stairs.map(s => s.maxLevel), 0.7);
    const L = 30, R = 8, T = 6, B = 14; const sx = n => L + (n - 1) / (maxN - 1) * (W - L - R), sy = v => T + (1 - v / yMax) * (H - T - B);
    g.strokeStyle = COL.grid; g.fillStyle = COL.dim; g.font = '10px ui-monospace,Menlo,monospace';
    for (const v of [0, .2, .4, .6]) { g.beginPath(); g.moveTo(L, sy(v)); g.lineTo(W - R, sy(v)); g.stroke(); g.fillText(f(v, 1), 4, sy(v) + 3); }
    for (const n of [10, 20, 30, 40, 50]) if (n <= maxN) { g.fillText(String(n), sx(n) - 6, H - 3); }
    stairs.forEach((s, i) => {
      const col = i === 0 ? COL.s0 : COL.s1; g.strokeStyle = col; g.fillStyle = col;
      g.beginPath(); s.trials.forEach((t, k) => { k ? g.lineTo(sx(t.n), sy(t.level)) : g.moveTo(sx(t.n), sy(t.level)); }); g.stroke();
      g.setLineDash([2, 3]); g.beginPath(); s.trials.forEach((t, k) => { k ? g.lineTo(sx(t.n), sy(t.est_alpha)) : g.moveTo(sx(t.n), sy(t.est_alpha)); }); g.stroke(); g.setLineDash([]);
      for (const t of s.trials) {
        g.beginPath();
        if (t.isCatch) g.rect(sx(t.n) - 3, sy(t.level) - 3, 6, 6); else g.arc(sx(t.n), sy(t.level), 3, 0, 2 * Math.PI);
        if (t.correct) g.fill(); else { g.fillStyle = 'rgba(0,0,0,.6)'; g.fill(); g.fillStyle = col; g.stroke(); }
      }
      g.fillText(`${s.label}${s.finished ? ' ✓' : ''}`, W - R - 130, H - B - 30 + 11 * i);
    });
    g.fillStyle = COL.dim; g.fillText(`${phase}: level per trial  (● correct  ○ wrong  ■ identical pair  ┈ α estimate)`, L + 4, T + 10);
  }

  // ---------------------------------------------------------------- posterior over the threshold
  function drawPosterior(stairs) {
    const g = post.getContext('2d'); const W = post.width, H = post.height; g.clearRect(0, 0, W, H);
    if (!stairs.length) return;
    const L = 30, R = 8, T = 4, B = 12; const xMax = 0.8; const sx = v => L + v / xMax * (W - L - R);
    g.strokeStyle = COL.grid; g.fillStyle = COL.dim; g.font = '10px ui-monospace,Menlo,monospace';
    for (const v of [0, .2, .4, .6, .8]) { g.beginPath(); g.moveTo(sx(v), T); g.lineTo(sx(v), H - B); g.stroke(); g.fillText(f(v, 1), sx(v) - 6, H - 2); }
    stairs.forEach((s, i) => {
      let pts = [];
      const e = s.engine;
      if (e && e.pdf && e.x) pts = e.x.map((x, k) => [x + e.tGuess, e.pdf[k]]);                                   // QUEST: pdf over threshold offsets
      else if (e && e.gp && e.gp.marginal) pts = Array.from(e.gp.marginal('alpha').entries()).sort((a, b) => a[0] - b[0]);   // Psi / QUEST+: alpha marginal
      if (!pts.length) return;
      const pm = Math.max(...pts.map(p => p[1])) || 1; const sy = p => T + (1 - p / pm) * (H - T - B);
      g.strokeStyle = i === 0 ? COL.s0 : COL.s1; g.beginPath(); pts.forEach((p, k) => { k ? g.lineTo(sx(p[0]), sy(p[1])) : g.moveTo(sx(p[0]), sy(p[1])); }); g.stroke();
    });
    g.fillStyle = COL.dim; g.fillText('posterior over the threshold (' + (stairs[0].method === 'quest' ? 'QUEST pdf' : 'α marginal') + ')', L + 4, T + 10);
  }

  const timer = setInterval(() => { try { render(); } catch (e) { text.textContent = 'debug overlay error: ' + e; } }, 100);
  window.__EXP.debugHud = { box, stop: () => clearInterval(timer), catHist };
  return window.__EXP.debugHud;
}
