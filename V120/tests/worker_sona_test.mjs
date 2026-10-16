/** worker_sona_test.mjs — exercises server/cloudflare-worker.js in Node with an in-memory R2 and a fake SONA:
 *  a complete upload with a survey code grants credit and leaves a receipt; a partial upload does not; /credits lists it;
 *  /credit retries by hand; a SONA failure is recorded and can be retried.   node tests/worker_sona_test.mjs [r2|kv] */
import worker from '../server/cloudflare-worker.js';
import assert from 'node:assert/strict';
class Bucket { constructor() { this.m = new Map(); }
  async put(k, v, o) { this.m.set(k, { v, o }); } async get(k) { const e = this.m.get(k); return e ? { body: e.v, text: async () => e.v, httpMetadata: e.o?.httpMetadata } : null; }
  async delete(k) { this.m.delete(k); }
  async list({ prefix = '' } = {}) { return { objects: [...this.m.keys()].filter(k => k.startsWith(prefix)).map(k => ({ key: k, size: this.m.get(k).v.length, customMetadata: this.m.get(k).o?.customMetadata })), truncated: false }; } }
const sonaCalls = []; let sonaMode = 'ok';
globalThis.fetch = async (u) => { sonaCalls.push(String(u)); if (sonaMode === 'down') throw new Error('ECONNREFUSED');
  return sonaMode === 'ok' ? new Response('<Credit granted for survey code ABC123>', { status: 200 }) : new Response('<Error>Invalid survey code</Error>', { status: 200 }); };
class KV { constructor() { this.m = new Map(); }
  async put(k, v, o) { this.m.set(k, { v, metadata: o?.metadata }); } async getWithMetadata(k) { const e = this.m.get(k); return e ? { value: e.v, metadata: e.metadata } : { value: null, metadata: null }; }
  async delete(k) { this.m.delete(k); }
  async list({ prefix = '' } = {}) { return { keys: [...this.m.keys()].filter(k => k.startsWith(prefix)).map(k => ({ name: k, metadata: this.m.get(k).metadata })), list_complete: true }; } }
const STORAGE = process.argv[2] === 'kv' ? { DATA_KV: new KV() } : { DATA: new Bucket() };
const env = { COLLECT_TOKEN: 't', ADMIN_TOKEN: 'a', ...STORAGE, SONA_CREDIT_URL: 'https://school.sona-systems.com/services/SonaAPI.svc/WebstudyCredit?experiment_id=1&credit_token=x&survey_code={survey_code}' };
const req = (path, body, method = 'POST') => new Request('https://w.test' + path, { method, body: body && JSON.stringify(body) });
const post = (o) => worker.fetch(req('/collect', { token: 't', kind: 'csv', filename: 'ABC123_exp_quest_d.csv', content: 'a,b\n1,2', participant: 'ABC123', surveyCode: 'ABC123', ...o }), env).then(r => r.json());
// 1. partial upload: stored, no credit
let r = await post({ partial: true, completed: false }); assert.equal(r.ok, true); assert.equal(r.credit, null); assert.equal(sonaCalls.length, 0);
// 2. complete upload: credit granted, receipt stored, partial removed
r = await post({ completed: true }); assert.equal(r.credit.ok, true); assert.equal(sonaCalls.length, 1); assert.ok(sonaCalls[0].endsWith('survey_code=ABC123'));
assert.ok(!(env.DATA || env.DATA_KV).m.has('partial/ABC123_exp_quest_d_PARTIAL.csv'));
const receipts = async () => (await worker.fetch(req('/credits?admin=a', null, 'GET'), env).then(r => r.json())).credits;
let c = (await receipts()).find(x => x.surveyCode === 'ABC123'); assert.equal(c.ok, true); assert.equal(c.attempts, 1); assert.equal(c.participant, 'ABC123');
// 3. SONA down for the next participant: recorded as failed, then retried by hand and granted
sonaMode = 'down'; r = await post({ completed: true, surveyCode: 'DEF456', participant: 'DEF456', filename: 'DEF456.csv' }); assert.equal(r.ok, true); assert.equal(r.credit.ok, false);
c = (await receipts()).find(x => x.surveyCode === 'DEF456'); assert.equal(c.ok, false); assert.equal(c.status, 'error');
sonaMode = 'ok'; r = await (await worker.fetch(req('/credit?admin=a&survey_code=DEF456', null, 'GET'), env)).json(); assert.equal(r.credit.ok, true); assert.equal(r.credit.attempts, 2);
// 4. SONA rejects a code: not ok, visible in /credits
sonaMode = 'reject'; r = await post({ completed: true, surveyCode: 'BAD', participant: 'BAD', filename: 'BAD.csv' }); assert.equal(r.credit.ok, false);
const list = await (await worker.fetch(req('/credits?admin=a', null, 'GET'), env)).json();
assert.deepEqual(list.credits.map(x => [x.surveyCode, x.ok]).sort(), [['ABC123', true], ['BAD', false], ['DEF456', true]]);
// 5. admin token required; /files carries surveyCode metadata
assert.equal((await worker.fetch(req('/credits?admin=wrong', null, 'GET'), env)).status, 403);
const files = await (await worker.fetch(req('/files?admin=a', null, 'GET'), env)).json(); assert.equal(files.files.find(f => f.key === 'ABC123_exp_quest_d.csv').meta.surveyCode, 'ABC123');
console.log('WORKER SONA TEST OK (' + (env.DATA ? 'R2' : 'KV') + ') —', sonaCalls.length, 'SONA calls,', list.credits.length, 'receipts');
