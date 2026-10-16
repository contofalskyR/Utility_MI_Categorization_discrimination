#!/usr/bin/env python3
"""collect.py — serve the experiment and collect its data with nothing but the Python standard library.

    python3 server/collect.py --dir . --data ./data --port 8080 --token CHANGE_ME

  GET  /...           static files of the experiment package (index.html, quest.html, psi.html, questplus.html, lib/, ...)
  POST /collect       JSON body {token, kind: 'csv'|'log', filename, content, completed, partial, participant, method, ...}
                      -> writes <data>/<filename> (partial saves go to <data>/partial/, incomplete sessions keep their
                         _INCOMPLETE suffix), appends one line to <data>/collect_index.jsonl
  GET  /collect/ping  liveness check ({"ok": true})

Set config.js -> data.endpoint to '/collect' (same origin, no CORS needed) or to 'https://host:port/collect' when the
static files are served elsewhere (GitHub Pages): CORS headers are sent on every response. Put the server behind HTTPS
(a reverse proxy such as caddy/nginx, or a tunnel) if the experiment page is served over HTTPS — browsers block
mixed content. Nothing here is Rutgers-specific; run it on any lab machine that is reachable from the participant's browser.
"""
import argparse, json, os, re, sys, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

SAFE = re.compile(r'[^A-Za-z0-9._-]+')

def make_handler(static_dir, data_dir, token, max_bytes):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=static_dir, **kw)
        def log_message(self, fmt, *args):
            sys.stderr.write('%s %s\n' % (time.strftime('%Y-%m-%d %H:%M:%S'), fmt % args))
        def _cors(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        def end_headers(self):
            self._cors()
            self.send_header('Cache-Control', 'no-store')
            super().end_headers()
        def do_OPTIONS(self):
            self.send_response(204); self.end_headers()
        def _json(self, code, obj):
            body = json.dumps(obj).encode()
            self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
        def do_GET(self):
            if self.path.split('?')[0] == '/collect/ping':
                return self._json(200, {'ok': True, 'time': time.time()})
            return super().do_GET()
        def do_POST(self):
            if self.path.split('?')[0] != '/collect':
                return self._json(404, {'ok': False, 'error': 'not found'})
            n = int(self.headers.get('Content-Length', '0') or 0)
            if n <= 0 or n > max_bytes:
                return self._json(413, {'ok': False, 'error': 'bad length %d' % n})
            try:
                payload = json.loads(self.rfile.read(n).decode('utf-8'))
            except Exception as e:
                return self._json(400, {'ok': False, 'error': 'bad json: %s' % e})
            if token and payload.get('token') != token:
                return self._json(403, {'ok': False, 'error': 'bad token'})
            kind = payload.get('kind'); content = payload.get('content')
            if kind not in ('csv', 'log') or not isinstance(content, str):
                return self._json(400, {'ok': False, 'error': 'kind/content'})
            filename = SAFE.sub('_', str(payload.get('filename') or 'unnamed'))[:200]
            if not filename.endswith('.' + kind): filename += '.' + kind
            sub = 'partial' if payload.get('partial') else ''
            folder = os.path.join(data_dir, sub) if sub else data_dir
            os.makedirs(folder, exist_ok=True)
            path = os.path.join(folder, filename)
            tmp = path + '.tmp'
            with open(tmp, 'w', encoding='utf-8', newline='') as f: f.write(content)
            os.replace(tmp, path)                                   # atomic: a reader never sees a half-written file
            rec = {k: payload.get(k) for k in ('participant', 'session', 'expName', 'method', 'buildVersion', 'surveyCode', 'completed', 'partial', 'sent')}
            rec.update(received=time.strftime('%Y-%m-%dT%H:%M:%S'), kind=kind, file=os.path.relpath(path, data_dir), bytes=len(content), ip=self.client_address[0])
            with open(os.path.join(data_dir, 'collect_index.jsonl'), 'a', encoding='utf-8') as f: f.write(json.dumps(rec) + '\n')
            if payload.get('completed') and kind == 'csv':          # final file arrived: drop the partial copy
                p = os.path.join(data_dir, 'partial', filename.replace('.csv', '_PARTIAL.csv'))
                if os.path.exists(p):
                    try: os.remove(p)
                    except OSError: pass
            self.log_message('stored %s (%d bytes) from %s', rec['file'], rec['bytes'], rec['ip'])
            return self._json(200, {'ok': True, 'file': rec['file'], 'bytes': rec['bytes']})
    return Handler

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dir', default='.', help='directory with index.html (the experiment package)')
    ap.add_argument('--data', default='./data', help='where CSV / log files are written')
    ap.add_argument('--port', type=int, default=8080)
    ap.add_argument('--host', default='0.0.0.0')
    ap.add_argument('--token', default=os.environ.get('COLLECT_TOKEN', ''), help='shared secret; must equal config.js data.token ("" = accept all)')
    ap.add_argument('--max-mb', type=float, default=25)
    a = ap.parse_args()
    os.makedirs(a.data, exist_ok=True)
    srv = ThreadingHTTPServer((a.host, a.port), make_handler(os.path.abspath(a.dir), os.path.abspath(a.data), a.token, int(a.max_mb * 1e6)))
    print('serving %s on http://%s:%d/  data -> %s  token %s' % (os.path.abspath(a.dir), a.host, a.port, os.path.abspath(a.data), 'set' if a.token else 'NOT set (accepting all uploads)'), flush=True)
    try: srv.serve_forever()
    except KeyboardInterrupt: pass

if __name__ == '__main__':
    main()
