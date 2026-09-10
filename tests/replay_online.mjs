/**
 * replay_online.mjs — fidelity check of the Quest port: replay every staircase of the collected online CSVs (jsQUEST,
 * grain .01, no range) through adaptive.js's Quest and compare its proposal on every trial with the logged
 * <phase>.intensity (the raw jsQUEST proposal). Exact agreement (< 1e-9) means the self-hosted QUEST variant is the
 * same engine the cohort ran on.
 *
 *   node tests/replay_online.mjs <folder with the online CSVs>
 */
import fs from 'node:fs';
import path from 'node:path';
import { Quest } from '../adaptive.js';

function parseCsv(text) {
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map(h => h.replace(/^﻿/, ''));
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(header.map((h, k) => [h, r[k]])));
}

const dir = process.argv[2];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv') && fs.statSync(path.join(dir, f)).size > 0).sort();
let nTracks = 0, nTrials = 0, maxErr = 0, worst = null;
const summary = [];
for (const f of files) {
  const rows = parseCsv(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const phase of ['PreTest', 'PostTest']) {
    const icol = phase + '.intensity', rcol = phase + '.response', lcol = phase + '.label';
    if (!(icol in rows[0])) continue;
    const grain = parseFloat((rows.find(r => r[phase + '.grain']) || {})[phase + '.grain'] || '0.01');
    const byLabel = {};
    for (const r of rows) { if (r[rcol] === '' || r[rcol] === undefined) continue; (byLabel[r[lcol]] = byLabel[r[lcol]] || []).push(r); }
    for (const [label, tr] of Object.entries(byLabel)) {
      const q = new Quest({ tGuess: 0.1, tGuessSd: 0.3, pThreshold: 0.82, beta: 3.5, delta: 0.01, gamma: 0.5, grain, range: null });
      let errs = [];
      for (const r of tr) {
        const logged = parseFloat(r[icol]);
        const prop = q.quantile();
        errs.push(Math.abs(prop - logged));
        const used = r.level_used !== '' && r.level_used !== undefined ? parseFloat(r.level_used) : Math.min(0.7, Math.max(0.05, logged));
        q.update(used, r[rcol] === '1' || r[rcol] === '1.0');
      }
      const e = Math.max(...errs); nTracks++; nTrials += tr.length;
      if (e > maxErr) { maxErr = e; worst = { f, phase, label }; }
      summary.push({ f, phase, label, n: tr.length, maxErr: e, ciWidthLast: q.confidenceWidth(), grain });
    }
  }
}
console.log(`${files.length} files, ${nTracks} staircases, ${nTrials} trials; max |port proposal - logged intensity| = ${maxErr.toExponential(3)}`, worst || '');
const early = summary.filter(s => s.n < 50);
console.log(`stopped before 50: ${early.length}/${nTracks}; of those, port's 5-95% width < .15 at the last trial: ${early.filter(s => s.ciWidthLast < 0.15).length}`);
console.log(`ran to 50 with width still >= .15: ${summary.filter(s => s.n === 50 && s.ciWidthLast >= 0.15).length}`);
if (maxErr > 1e-9) { console.error('REPLAY MISMATCH'); process.exit(1); }
console.log('REPLAY OK');
