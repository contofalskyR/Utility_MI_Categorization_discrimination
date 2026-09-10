#!/usr/bin/env python3
"""build_singlefile.py — pack the self-hosted experiment into ONE .html file that runs by double-click (file://).

    python3 build/build_singlefile.py <package dir> <out.html> [--esbuild <path>]

Everything is inlined: the (patched) PsychoJS 2024.2.4 bundle, jQuery / jQuery UI / PreloadJS, config.js, adaptive.js,
datasaver.js, the experiment script (bundled with esbuild into one IIFE) and the six resources (three .xlsx, three .png),
which are embedded as base64 and handed to PsychoJS through window.EXP_EMBEDDED_RESOURCES, so that the page never fetches
anything (Chrome does not allow fetch/XHR from file:// pages). A small launcher chooses the adaptive method (QUEST,
QUEST+, Psi), the session length (full / short demo) and antialiasing, then starts the experiment; ?autostart=1 with
?method=..&smoke=.. in the URL skips the launcher (used by tests/run_headless.py). The data path is the download
fallback of datasaver.js (no endpoint): the CSV is offered as a download at the end of the session (or after a
double Escape) and also kept in localStorage, from where the launcher can re-download it.

Requires node + esbuild (`npm i esbuild`; or npx). Nothing else.
"""
import argparse, base64, html, os, re, shutil, subprocess, sys, tempfile

ap = argparse.ArgumentParser()
ap.add_argument('package'); ap.add_argument('out')
ap.add_argument('--esbuild', default=None, help='path to the esbuild binary (default: esbuild on PATH, else npx esbuild)')
ap.add_argument('--debug', action='store_true', help='DEBUG edition: the live overlay of the internal state (debughud.js) is switched on')
ap.add_argument('--overlay', default=None, help='a config overlay inlined after config.js, e.g. config_symmetric.js (the symmetric study)')
a = ap.parse_args()
pkg = os.path.abspath(a.package)

def read(rel, mode='r'):
    with open(os.path.join(pkg, rel), mode, **({'encoding': 'utf-8'} if mode == 'r' else {})) as f:
        return f.read()

def b64(rel):
    return base64.b64encode(read(rel, 'rb')).decode('ascii')

# ------------------------------------------------------------------------------------------------ 1. bundle the experiment (ESM -> one IIFE)
esbuild = a.esbuild or shutil.which('esbuild')
cmd = [esbuild] if esbuild else ['npx', '--yes', 'esbuild@0.23.1']
tmp = tempfile.mkdtemp()
bundle_path = os.path.join(tmp, 'experiment.bundle.js')
r = subprocess.run(cmd + [os.path.join(pkg, 'Asymmetric_Utility_discrimination_selfhost.js'), '--bundle', '--format=iife',
                          '--target=es2020', '--minify-whitespace', '--log-level=warning', '--outfile=' + bundle_path], capture_output=True, text=True)
if r.returncode != 0:
    sys.exit('esbuild failed:\n' + r.stderr)
bundle = open(bundle_path, encoding='utf-8').read()
bundle = re.sub(r'//# sourceMappingURL=\S+', '', bundle)
assert '</script' not in bundle, 'the bundle contains "</script" — it cannot be inlined verbatim'

# ------------------------------------------------------------------------------------------------ 2. vendored libraries + styles
vendor_js = ''.join(read(f'vendor/{n}') + '\n' for n in ['jquery.min.js', 'jquery-ui.min.js', 'preloadjs.min.js'])
assert '</script' not in vendor_js
config_js = read('config.js')
if a.overlay:
    config_js += '\n' + read(a.overlay)
assert '</script' not in config_js

def inline_css_images(css):
    def repl(m):
        name = m.group(1)
        return 'url("data:image/png;base64,' + b64('vendor/images/' + name) + '")'
    css = re.sub(r'url\("images/(ui-icons_[0-9a-f]+_256x240\.png)"\)', repl, css)
    css = re.sub(r'url\(%22images%2F(ui-icons_[0-9a-f]+_256x240\.png)%22\)', repl, css)
    return css
css = inline_css_images(read('vendor/jquery-ui.min.css')) + '\n' + read('lib/psychojs-2024.2.4.css')
assert not re.search(r'url\((?!"?data:)', css), 'a stylesheet still references an external file'
assert '</style' not in css

# ------------------------------------------------------------------------------------------------ 3. resources
resources = {n: ('application/octet-stream', b64(n)) for n in ['PRETEST_INSTRUCTIONS-new.xlsx', 'Categorization.xlsx', 'POSTTEST_INSTRUCTIONS-new.xlsx']}
resources.update({n: ('image/png', b64(n)) for n in ['green_square.png', 'blue_square.png', 'red_square.png']})
res_js = 'var EXP_RESOURCE_B64 = ' + '{' + ','.join(f'"{n}":["{t}","{d}"]' for n, (t, d) in resources.items()) + '};'

version = re.findall(r"buildVersion:\s*'([^']+)'", config_js)[-1]          # the overlay's version wins when present
expname = re.findall(r"expName:\s*'([^']+)'", config_js)[-1]
condition = (re.findall(r"condition:\s*'([^']+)'", config_js) or ['asymmetric'])[-1]
bounds = re.findall(r'discriminationParameters:\s*\[\[([0-9.]+),\s*[0-9.]+,\s*[0-9.-]+,\s*[0-9.-]+\],\s*\[([0-9.]+),', config_js)[-1]
cond_line = f'{condition.upper()} condition — discrimination boundaries at x = {bounds[0]} and x = {bounds[1]}' + (' (BC at the midpoint between B .5 and C .75)' if condition == 'symmetric' else ' (BC at the utility-shifted boundary)')
edition = ' — DEBUG EDITION' if a.debug else ''
version_suffix = '_single_debug' if a.debug else '_single'
debug_js = 'window.EXP_DEBUG_HUD = true;' if a.debug else ''
debug_note = ('<p><b>Debug edition.</b> A panel in the top-left corner shows, live, what the experiment is doing: the feature space, '
              'the (x, y) coordinates and 4-D parameters of the shapes on screen, the staircase level and whether the pair is identical, '
              'your response and the updated threshold estimate, a map of the feature plane with every categorization sample, the '
              'staircase tracks and the posterior. It reads the state only; timing, keys, stimuli and data are those of the participant '
              'edition (build_version ends in _single_debug).</p>' if a.debug else '')

# ------------------------------------------------------------------------------------------------ 4. the page
page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>{html.escape(expname)} — self-hosted single-file build ({html.escape(version)}){edition}</title>
<!-- Single-file build of the self-hosted experiment package ({html.escape(version)}), made by build/build_singlefile.py.
     Double-click to run: no server, no Pavlovia, nothing to install. The CSV downloads at the end of the session. -->
<style>
{css}
#launcher {{ position: fixed; inset: 0; background: #111; color: #eee; font: 15px/1.45 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; overflow: auto; z-index: 5; }}
#launcher .box {{ max-width: 640px; margin: 6vh auto; padding: 0 24px 40px; }}
#launcher h1 {{ font-size: 20px; font-weight: 600; margin: 0 0 4px; }}
#launcher .sub {{ color: #9a9a9a; margin: 0 0 22px; font-size: 13px; }}
#launcher fieldset {{ border: 1px solid #333; border-radius: 6px; padding: 10px 14px 6px; margin: 0 0 14px; }}
#launcher legend {{ color: #bbb; padding: 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }}
#launcher label.opt {{ display: block; padding: 5px 0; cursor: pointer; }}
#launcher label.opt span.d {{ color: #9a9a9a; font-size: 13px; }}
#launcher button {{ font: inherit; font-size: 16px; padding: 10px 26px; border-radius: 6px; border: 0; background: #2f7ddb; color: #fff; cursor: pointer; }}
#launcher button:hover {{ background: #3b8ae8; }}
#launcher button.small {{ font-size: 13px; padding: 4px 10px; background: #333; margin-left: 8px; }}
#launcher .notes {{ color: #9a9a9a; font-size: 13px; margin-top: 22px; }}
#launcher .notes b {{ color: #ddd; font-weight: 600; }}
#backups li {{ margin: 4px 0; font-size: 13px; }}
#backups code {{ color: #ddd; }}
</style>
</head>
<body>
<div id="root"></div>
<div id="launcher">
  <div class="box">
    <h1>Discrimination experiment — online version, single file{edition}</h1>
    <p class="sub">{html.escape(expname)} · self-hosted build {html.escape(version)} · same task as Pavlovia, adaptive procedure selectable below<br><b style="color:#ddd">{html.escape(cond_line)}</b></p>
    <fieldset>
      <legend>Adaptive procedure</legend>
      <label class="opt"><input type="radio" name="method" value="quest" checked> <b>QUEST</b> <span class="d">— as run online (Watson &amp; Pelli; pThreshold .82, stop when the 5–95% posterior width &lt; .15, cap 50 trials per boundary)</span></label>
      <label class="opt"><input type="radio" name="method" value="questplus"> <b>QUEST+</b> <span class="d">— joint posterior on threshold, slope and false-alarm rate; identical pairs estimate the false-alarm rate (Watson 2017)</span></label>
      <label class="opt"><input type="radio" name="method" value="psi"> <b>Psi</b> <span class="d">— Kontsevich &amp; Tyler 1999, marginal version (threshold + slope), entropy-minimising placement</span></label>
    </fieldset>
    <fieldset>
      <legend>Session length</legend>
      <label class="opt"><input type="radio" name="length" value="full" checked> <b>Full session</b> <span class="d">— what a participant gets: pre-test (2 staircases, up to 50 trials each), 300 categorization trials, post-test; about 35–40 min</span></label>
      <label class="opt"><input type="radio" name="length" value="smoke"> <b>Short demo</b> <span class="d">— same flow, 6 trials per staircase and 12 categorization trials; about 4 min</span></label>
    </fieldset>
    <fieldset>
      <legend>Rendering</legend>
      <label class="opt"><input type="checkbox" id="aa" checked> <b>Anti-aliased shape edges</b> <span class="d">— WebGL multisampling (the Pavlovia build renders jagged edges); untick to see the old rendering</span></label>
    </fieldset>
    <p><button id="start">Start</button> <span class="d" style="color:#9a9a9a;font-size:13px;margin-left:10px">opens the participant dialog, then goes full screen</span></p>
    <div id="backups"></div>
    <div class="notes">
      {debug_note}
      <p><b>Data.</b> At the end of the session (or after quitting) the results file <code>&lt;participant&gt;_…_&lt;method&gt;_&lt;date&gt;.csv</code> is downloaded to your Downloads folder; a copy stays in this browser and is listed above for re-download. Nothing is sent anywhere.</p>
      <p><b>Keys.</b> Same as the participant version. <b>Escape twice within 3 s</b> quits (a single press is ignored, so leaving full screen does not end the session); the data collected so far are then saved with the suffix <code>_INCOMPLETE</code>.</p>
      <p><b>Browser.</b> Tested in Chrome; Firefox works too. If the page opened in Safari, drag the file onto Chrome instead.</p>
    </div>
  </div>
</div>

<script>
{vendor_js}
</script>
<script>
{config_js}
</script>
<script>
{res_js}
</script>
<script type="text/plain" id="expbundle">
{bundle}
</script>
<script>
(function () {{
  window.EXP_CONFIG.buildVersion = window.EXP_CONFIG.buildVersion + '{version_suffix}';   // logged as build_version in the CSV
  {debug_js}
  var q = new URLSearchParams(location.search);
  function listBackups() {{
    var out = [];
    try {{ for (var i = 0; i < localStorage.length; i++) {{ var k = localStorage.key(i); if (k.indexOf('expdata:') === 0 && k.slice(-2) !== ':t') out.push({{ filename: k.slice(8), saved: localStorage.getItem(k + ':t') }}); }} }} catch (e) {{}}
    out.sort(function (x, y) {{ return (y.saved || '').localeCompare(x.saved || ''); }});
    return out;
  }}
  function download(filename) {{
    try {{
      var t = localStorage.getItem('expdata:' + filename); if (t === null) return;
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], {{ type: 'text/csv' }})); a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }} catch (e) {{ alert('could not download ' + filename + ': ' + e); }}
  }}
  function renderBackups() {{
    var b = listBackups(), el = document.getElementById('backups');
    if (!b.length) {{ el.innerHTML = ''; return; }}
    var h = '<fieldset><legend>Results saved in this browser</legend><ul style="padding-left:18px;margin:6px 0">';
    b.forEach(function (x) {{ h += '<li><code>' + x.filename + '</code> <span style="color:#9a9a9a">' + (x.saved || '').replace('T', ' ').slice(0, 19) + '</span> <button class="small" data-f="' + x.filename + '">download</button></li>'; }});
    el.innerHTML = h + '</ul></fieldset>';
    el.querySelectorAll('button[data-f]').forEach(function (btn) {{ btn.onclick = function () {{ download(btn.getAttribute('data-f')); }}; }});
  }}
  // decode the embedded resources into what PsychoJS's ServerManager would have produced (ArrayBuffer for the
  // spreadsheets = PreloadJS BINARY, HTMLImageElement for the images), then hand them to the experiment
  function decodeResources() {{
    var out = {{}}, pending = [];
    Object.keys(EXP_RESOURCE_B64).forEach(function (name) {{
      var type = EXP_RESOURCE_B64[name][0], data = EXP_RESOURCE_B64[name][1];
      if (type === 'image/png') {{
        var img = new Image();
        pending.push(new Promise(function (res, rej) {{ img.onload = function () {{ res(); }}; img.onerror = function (e) {{ rej(new Error('embedded image ' + name + ' failed to decode')); }}; }}));
        img.src = 'data:image/png;base64,' + data; out[name] = img;
      }} else {{
        var bin = atob(data), buf = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        out[name] = buf.buffer;
      }}
    }});
    return Promise.all(pending).then(function () {{ return out; }});
  }}
  function start(method, smoke, antialias) {{
    window.EXP_METHOD = method; window.EXP_SMOKE = smoke ? '1' : ''; window.PSYCHOJS_ANTIALIAS = antialias;
    document.getElementById('launcher').style.display = 'none';
    decodeResources().then(function (res) {{
      window.EXP_EMBEDDED_RESOURCES = res;
      var s = document.createElement('script'); s.textContent = document.getElementById('expbundle').textContent; document.body.appendChild(s);
    }}).catch(function (e) {{ document.getElementById('launcher').style.display = ''; alert(String(e)); }});
  }}
  renderBackups();
  document.getElementById('start').onclick = function () {{
    var method = document.querySelector('input[name=method]:checked').value;
    var smoke = document.querySelector('input[name=length]:checked').value === 'smoke';
    start(method, smoke, document.getElementById('aa').checked);
  }};
  if (q.get('autostart') === '1') {{   // tests: ?autostart=1&method=..&smoke=1&antialias=0
    var aa = q.get('antialias');
    start((q.get('method') || window.EXP_CONFIG.method).toLowerCase(), ['1', 'true', 'yes'].indexOf(String(q.get('smoke') || '').toLowerCase()) >= 0,
          aa === null ? window.EXP_CONFIG.antialias : ['0', 'false', 'no'].indexOf(aa.toLowerCase()) < 0);
  }}
}})();
</script>
</body>
</html>
"""
with open(a.out, 'w', encoding='utf-8') as f:
    f.write(page)
shutil.rmtree(tmp, ignore_errors=True)
print(f'wrote {a.out}: {os.path.getsize(a.out) / 1e6:.2f} MB (bundle {len(bundle) / 1e6:.2f} MB, {len(resources)} embedded resources)')
