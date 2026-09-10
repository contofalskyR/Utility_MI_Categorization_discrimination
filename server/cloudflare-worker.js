/**
 * cloudflare-worker.js — data endpoint for a statically hosted experiment (GitHub Pages, Netlify, a lab web server, ...).
 * Free Cloudflare account: Workers + an R2 bucket. Nothing else to run.
 *
 *   1. Storage, one of: R2 -> create a bucket, e.g. "discrimination-data" (10 GB free, but Cloudflare wants a card on file to
 *      enable R2); or Workers KV -> create a namespace (1 GB free, no card; plenty for a study: ~1 MB per session).
 *   2. Workers -> create a Worker, paste this file. Settings -> Variables: COLLECT_TOKEN (secret, same as config.js
 *      data.token) and ADMIN_TOKEN (secret, for downloading). Settings -> Bindings: the R2 bucket as DATA, or the KV
 *      namespace as DATA_KV (either one; R2 wins if both are bound).
 *      Optional, SONA: SONA_CREDIT_URL (secret) = SONA's *server-side* completion URL with {survey_code} in place of the
 *      code, e.g. https://<school>.sona-systems.com/services/SonaAPI.svc/WebstudyCredit?experiment_id=123&credit_token=...&survey_code={survey_code}
 *      With it set, credit is granted the moment a COMPLETE csv with a survey code arrives — independent of what the
 *      participant's browser does afterwards. Every attempt is recorded under credits/<survey_code>.json.
 *   3. config.js -> data.endpoint = 'https://<your-worker>.<account>.workers.dev/collect'.
 *
 *   POST /collect                                  same JSON body as server/collect.py; stores <filename> (partial saves under partial/)
 *   GET  /collect/ping                             liveness
 *   GET  /files?admin=ADMIN_TOKEN                  list stored files (JSON, with participant / surveyCode / completed metadata)
 *   GET  /files/<name>?admin=ADMIN_TOKEN           download one file
 *   GET  /credits?admin=ADMIN_TOKEN                every SONA credit attempt: survey code, participant, file, SONA's answer
 *   GET  /credit?admin=ADMIN_TOKEN&survey_code=X   (re)try the SONA credit for one survey code by hand (after a SONA outage, say)
 *
 * Or use `wrangler deploy` with server/wrangler.toml.
 */
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const safe = s => String(s || 'unnamed').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 200);

/** the same five operations over an R2 bucket (env.DATA) or a Workers KV namespace (env.DATA_KV) */
function store(env) {
  if (env.DATA) return {
    put: (k, v, meta, ct) => env.DATA.put(k, v, { httpMetadata: { contentType: ct }, customMetadata: meta }),
    get: async k => { const o = await env.DATA.get(k); return o ? { text: () => o.text(), body: o.body, contentType: o.httpMetadata?.contentType } : null; },
    delete: k => env.DATA.delete(k),
    list: async prefix => { const out = []; let cursor; do { const l = await env.DATA.list({ prefix, cursor, limit: 1000 }); out.push(...l.objects.map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded, meta: o.customMetadata }))); cursor = l.truncated ? l.cursor : undefined; } while (cursor); return out; },
  };
  if (env.DATA_KV) return {
    put: (k, v, meta, ct) => env.DATA_KV.put(k, v, { metadata: { ...meta, contentType: ct, size: v.length } }),
    get: async k => { const r = await env.DATA_KV.getWithMetadata(k); return r.value === null || r.value === undefined ? null : { text: async () => r.value, body: r.value, contentType: r.metadata?.contentType }; },
    delete: k => env.DATA_KV.delete(k),
    list: async prefix => { const out = []; let cursor; do { const l = await env.DATA_KV.list({ prefix, cursor, limit: 1000 }); out.push(...l.keys.map(o => ({ key: o.name, size: o.metadata?.size, uploaded: o.metadata?.received, meta: o.metadata }))); cursor = l.list_complete ? undefined : l.cursor; } while (cursor); return out; },
  };
  throw new Error('no storage binding: bind an R2 bucket as DATA or a KV namespace as DATA_KV');
}

/** call SONA's server-side completion URL for one survey code and record the outcome under credits/<code>.json */
async function grantSonaCredit(env, surveyCode, info = {}) {
  const S = store(env); const code = safe(surveyCode);
  const rec = { surveyCode: code, ...info, time: new Date().toISOString(), configured: !!env.SONA_CREDIT_URL, ok: false, status: null, response: '' };
  if (env.SONA_CREDIT_URL) {
    try {
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(env.SONA_CREDIT_URL.replace('{survey_code}', encodeURIComponent(code)), { method: 'GET', signal: ctrl.signal });
      clearTimeout(timer);
      rec.status = r.status; rec.response = (await r.text()).slice(0, 1000);
      // SONA answers with XML; a granted (or already granted) credit is reported in it, an unknown code / bad token as an error
      rec.ok = r.ok && !/error|invalid|fail/i.test(rec.response.replace(/already/i, ''));
    } catch (e) { rec.status = 'error'; rec.response = String(e).slice(0, 500); }
  }
  let previous = null;
  try { const old = await S.get('credits/' + code + '.json'); if (old) previous = JSON.parse(await old.text()); } catch (e) {}
  rec.attempts = ((previous && previous.attempts) || 0) + 1;
  rec.firstAttempt = (previous && previous.firstAttempt) || rec.time;
  if (previous && previous.ok && !rec.ok) rec.ok = true;   // once granted, stays granted
  await S.put('credits/' + code + '.json', JSON.stringify(rec), { surveyCode: code, ok: String(rec.ok), received: rec.time }, 'application/json');
  return rec;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let S; try { S = store(env); } catch (e) { return json({ ok: false, error: String(e.message || e) }, 500); }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === '/collect/ping') return json({ ok: true, time: Date.now(), sona: !!env.SONA_CREDIT_URL });

    if (url.pathname === '/collect' && request.method === 'POST') {
      let payload;
      try { payload = JSON.parse(await request.text()); } catch (e) { return json({ ok: false, error: 'bad json' }, 400); }
      if (env.COLLECT_TOKEN && payload.token !== env.COLLECT_TOKEN) return json({ ok: false, error: 'bad token' }, 403);
      const kind = payload.kind, content = payload.content;
      if (!['csv', 'log'].includes(kind) || typeof content !== 'string') return json({ ok: false, error: 'kind/content' }, 400);
      if (content.length > 25e6) return json({ ok: false, error: 'too large' }, 413);
      let name = safe(payload.filename); if (!name.endsWith('.' + kind)) name += '.' + kind;
      const key = (payload.partial ? 'partial/' : '') + name;
      const meta = {};
      for (const k of ['participant', 'session', 'expName', 'method', 'buildVersion', 'surveyCode', 'completed', 'partial', 'sent']) meta[k] = String(payload[k] ?? '');
      meta.received = new Date().toISOString(); meta.ip = request.headers.get('CF-Connecting-IP') || '';
      await S.put(key, content, meta, kind === 'csv' ? 'text/csv' : 'text/plain');
      let credit = null;
      if (payload.completed && kind === 'csv') {
        try { await S.delete('partial/' + name.replace('.csv', '_PARTIAL.csv')); } catch (e) {}
        // SONA: a complete data file is the evidence of participation; grant the credit now and keep the receipt
        if (payload.surveyCode) { try { credit = await grantSonaCredit(env, payload.surveyCode, { participant: String(payload.participant ?? ''), file: key, expName: String(payload.expName ?? '') }); } catch (e) { credit = { ok: false, error: String(e) }; } }
      }
      return json({ ok: true, file: key, bytes: content.length, credit: credit && { ok: credit.ok, status: credit.status, configured: credit.configured } });
    }

    if (url.pathname.startsWith('/files') && request.method === 'GET') {
      if (!env.ADMIN_TOKEN || url.searchParams.get('admin') !== env.ADMIN_TOKEN) return json({ ok: false, error: 'forbidden' }, 403);
      const name = url.pathname.replace(/^\/files\/?/, '');
      if (!name) return json({ ok: true, storage: env.DATA ? 'r2' : 'kv', files: await S.list('') });
      const obj = await S.get(decodeURIComponent(name));
      if (!obj) return json({ ok: false, error: 'not found' }, 404);
      return new Response(obj.body, { headers: { 'Content-Type': obj.contentType || 'text/plain', 'Content-Disposition': `attachment; filename="${name.split('/').pop()}"`, ...CORS } });
    }

    if (url.pathname === '/credits' && request.method === 'GET') {
      if (!env.ADMIN_TOKEN || url.searchParams.get('admin') !== env.ADMIN_TOKEN) return json({ ok: false, error: 'forbidden' }, 403);
      const out = [];
      for (const o of await S.list('credits/')) { try { out.push(JSON.parse(await (await S.get(o.key)).text())); } catch (e) { out.push({ key: o.key, error: String(e) }); } }
      return json({ ok: true, sonaConfigured: !!env.SONA_CREDIT_URL, credits: out });
    }

    if (url.pathname === '/credit' && request.method === 'GET') {
      if (!env.ADMIN_TOKEN || url.searchParams.get('admin') !== env.ADMIN_TOKEN) return json({ ok: false, error: 'forbidden' }, 403);
      const code = url.searchParams.get('survey_code');
      if (!code) return json({ ok: false, error: 'survey_code required' }, 400);
      return json({ ok: true, credit: await grantSonaCredit(env, code, { manual: true }) });
    }
    return json({ ok: false, error: 'not found' }, 404);
  },
};
