/**
 * datasaver.js — replaces Pavlovia's data upload. Installed once the ExperimentHandler exists (see updateInfo in the
 * experiment script). Overrides psychoJS.experiment.save() and psychoJS.experimentLogger.flush() so that
 *   - the CSV (same content PsychoJS would write) is POSTed to EXP_CONFIG.data.endpoint,
 *   - the experiment log (same lines as the Pavlovia .log file) is POSTed alongside,
 *   - partial CSVs are uploaded every autosaveMinutes and on tab close (sendBeacon),
 *   - on failure (or with no endpoint) the CSV is offered as a download and kept in localStorage.
 * Uploads are text/plain POSTs with a JSON body so that a cross-origin endpoint needs no CORS preflight.
 */

const state = { installed: false, uploads: [], lastError: null, completed: false, endpoint: '', token: '' };

function nowIso() { return new Date().toISOString(); }

function downloadFile(filename, text, type) {
  try {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    return true;
  } catch (e) { console.error('[datasaver] download failed', e); return false; }
}

function backupKey(filename) { return 'expdata:' + filename; }
function localBackup(filename, text) {
  try { localStorage.setItem(backupKey(filename), text); localStorage.setItem(backupKey(filename) + ':t', nowIso()); return true; } catch (e) { return false; }
}
export function listBackups() {
  const out = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('expdata:') && !k.endsWith(':t')) out.push({ filename: k.slice(8), saved: localStorage.getItem(k + ':t'), bytes: (localStorage.getItem(k) || '').length }); } } catch (e) { /* storage unavailable */ }
  return out;
}
export function downloadBackup(filename) { try { const t = localStorage.getItem(backupKey(filename)); if (t !== null) return downloadFile(filename, t, filename.endsWith('.csv') ? 'text/csv' : 'text/plain'); } catch (e) {} return false; }
export function deleteBackup(filename) { try { localStorage.removeItem(backupKey(filename)); localStorage.removeItem(backupKey(filename) + ':t'); } catch (e) {} }

/** experiment log text, formatted as Logger.flush() formats the Pavlovia .log file */
function logText(psychoJS) {
  const logs = (psychoJS.experimentLogger && psychoJS.experimentLogger._serverLogs) || [];
  let out = '';
  for (const l of logs) {
    let line = String(l.time) + '\t' + (typeof l.level === 'symbol' ? Symbol.keyFor(l.level) : String(l.level)) + '\t' + l.msg;
    if (typeof l.obj !== 'undefined' && l.obj !== 'undefined') line += '\t' + l.obj;
    out += line + '\n';
  }
  return out;
}

async function postJson(url, payload, { timeoutMs = 20000, beacon = false } = {}) {
  const body = JSON.stringify(payload);
  if (beacon && navigator.sendBeacon) {
    const ok = navigator.sendBeacon(url, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
    return { ok, status: ok ? 'beacon' : 'beacon-refused' };
  }
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'omit', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body, signal: ctrl.signal, keepalive: body.length < 60000 });
    let text = ''; try { text = await r.text(); } catch (e) {}
    return { ok: r.ok, status: r.status, text };
  } catch (e) { return { ok: false, status: 'error', text: String(e) }; }
  finally { clearTimeout(timer); }
}

export function installDataSaver(psychoJS, cfg, meta) {
  if (state.installed) return state;
  const exp = psychoJS.experiment;
  const dcfg = Object.assign({ endpoint: '', token: '', autosaveMinutes: 0, saveOnUnload: true, fallbackDownload: true, localBackup: true }, cfg.data || {});
  state.installed = true; state.endpoint = dcfg.endpoint; state.token = dcfg.token; state.meta = meta;
  const noOutput = psychoJS._serverMsg && psychoJS._serverMsg.has && psychoJS._serverMsg.has('__noOutput');
  const baseName = () => String(exp._dataFileName).split(/[\\/]/).pop();

  async function upload(kind, filename, content, { completed = false, partial = false, beacon = false } = {}) {
    const rec = { t: nowIso(), kind, filename, completed, partial, bytes: content.length, ok: false, status: 'skipped' };
    state.uploads.push(rec);
    if (noOutput) { rec.status = 'noOutput'; return rec; }
    if (dcfg.localBackup && kind === 'csv') localBackup(filename, content);
    if (dcfg.endpoint) {
      const payload = { token: dcfg.token, kind, filename, completed, partial, content, sent: rec.t,
                        participant: meta.participant, session: meta.session, expName: meta.expName, method: meta.method, buildVersion: meta.buildVersion, surveyCode: meta.surveyCode || '' };
      const r = await postJson(dcfg.endpoint, payload, { beacon });
      rec.ok = r.ok; rec.status = r.status; rec.text = r.text;
      if (!r.ok) { state.lastError = r; console.error('[datasaver] upload failed', kind, filename, r); }
      else console.log('[datasaver] uploaded', kind, filename, r.status);
    }
    if (!rec.ok && !partial && dcfg.fallbackDownload && kind === 'csv') { rec.download = downloadFile(filename, content, 'text/csv'); rec.status += '+download'; }
    return rec;
  }

  // --- the two methods PsychoJS.quit() awaits ---------------------------------------------------------------
  exp.save = async function ({ attributes = [], sync = false, tag = '', clear = false } = {}) {
    psychoJS.logger.info('[datasaver] save experiment results' + (tag ? ' ' + tag : ''));
    const csv = exp.getResultAsCsv();
    const completed = !!exp.isCompleted;
    const partial = !completed && !exp.experimentEnded;   // autosave / unload while still running
    const suffix = completed ? '' : (partial ? '_PARTIAL' : '_INCOMPLETE');   // _INCOMPLETE = ended early (escape)
    const name = baseName() + suffix + tag + '.csv';
    if (completed) state.completed = true;
    return upload('csv', name, csv, { completed, partial, beacon: sync });
  };
  psychoJS.experimentLogger.flush = async function () {
    const text = logText(psychoJS);
    if (!text) return;
    return upload('log', baseName() + '.log', text, { completed: !!exp.isCompleted, partial: false });
  };

  // --- partial saves while running ------------------------------------------------------------------------------
  if (dcfg.autosaveMinutes > 0 && dcfg.endpoint) {
    state.autosaveId = setInterval(() => { if (!exp.experimentEnded) exp.save({ tag: '' }); }, dcfg.autosaveMinutes * 60 * 1000);
  }
  if (dcfg.saveOnUnload && dcfg.endpoint) {
    const onHide = () => { if (!exp.experimentEnded && exp._trialsData && exp._trialsData.length > 0) exp.save({ sync: true }); };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') onHide(); });
  }
  window.__DATASAVER = state;
  return state;
}

/** substitute {survey_code} / {participant} / {session} and return '' when a required value is missing */
export function fillUrl(template, values) {
  if (!template) return '';
  let missing = false;
  const out = template.replace(/\{(\w+)\}/g, (m, k) => { const v = values[k]; if (v === undefined || v === null || v === '') { missing = true; return ''; } return encodeURIComponent(String(v)); });
  return missing ? '' : out;
}
