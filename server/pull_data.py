#!/usr/bin/env python3
"""pull_data.py — download everything the Cloudflare Worker has collected (new files only) and the SONA credit receipts.

    python3 server/pull_data.py --worker https://<name>.<account>.workers.dev --admin <ADMIN_TOKEN> --out ./data
        [--partial]   also fetch the partial/ saves of sessions still running or abandoned
        [--credits]   also write credits.json (every SONA credit attempt) and print the ones that failed

Standard library only. Re-run any time: files already in --out are skipped.
"""
import argparse, json, os, sys, urllib.request, urllib.parse

ap = argparse.ArgumentParser()
ap.add_argument('--worker', required=True); ap.add_argument('--admin', required=True); ap.add_argument('--out', default='./data')
ap.add_argument('--partial', action='store_true'); ap.add_argument('--credits', action='store_true')
a = ap.parse_args()
base = a.worker.rstrip('/'); q = '?admin=' + urllib.parse.quote(a.admin)

UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'}
def get(path):
    req = urllib.request.Request(base + path, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r: return r.read()

listing = json.loads(get('/files' + q))
if not listing.get('ok'): sys.exit('listing failed: ' + json.dumps(listing))
os.makedirs(a.out, exist_ok=True)
n_new = n_skip = 0
for f in listing['files']:
    key = f['key']
    if key.startswith('credits/'): continue
    if key.startswith('partial/') and not a.partial: continue
    dest = os.path.join(a.out, key.replace('/', os.sep))
    if os.path.exists(dest): n_skip += 1; continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'wb') as fh: fh.write(get('/files/' + urllib.parse.quote(key, safe='/') + q))
    n_new += 1; print('fetched', key, f.get('size'), 'bytes', (f.get('meta') or {}).get('surveyCode', ''))
print(f'{n_new} new file(s), {n_skip} already present, storage: {listing.get("storage", "?")}')
if a.credits:
    cr = json.loads(get('/credits' + q))
    with open(os.path.join(a.out, 'credits.json'), 'w', encoding='utf-8') as fh: json.dump(cr, fh, indent=1)
    failed = [c for c in cr.get('credits', []) if not c.get('ok')]
    print(f'{len(cr.get("credits", []))} credit receipt(s), {len(failed)} not granted' + ('' if cr.get('sonaConfigured') else ' (SONA_CREDIT_URL not set on the Worker)'))
    for c in failed: print('  NOT CREDITED', c.get('surveyCode'), c.get('participant'), c.get('status'), str(c.get('response', ''))[:80])
