#!/usr/bin/env python3
"""run_headless.py — drive the self-hosted experiment end to end in headless Chromium with a simulated observer.

    python3 tests/run_headless.py --url "http://127.0.0.1:8080/index.html?method=psi&smoke=1" --participant 990001 \
        --alpha 0.15 --beta 3 --fa 0.10 --out /tmp/run_psi

The observer answers "different" with probability FA + (1 - FA - lapse) * (1 - exp(-(level/alpha)^beta)) on different
pairs and FA on identical pairs; it categorises correctly with probability --pcat. Writes console.log, pageerrors,
a few screenshots and a JSON summary into --out. Exit code 0 only if the run completed and the final CSV was saved.

Requires: pip install playwright  (and a Chromium; PLAYWRIGHT_BROWSERS_PATH or `playwright install chromium`).
"""
import argparse, asyncio, json, math, os, random, sys, time
from playwright.async_api import async_playwright

KEYMAP = {'space': 'Space', 'return': 'Enter', 'enter': 'Enter'}

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', required=True)
    ap.add_argument('--participant', default=str(random.randint(900000, 999999)))
    ap.add_argument('--session', default='001')
    ap.add_argument('--alpha', type=float, default=0.15); ap.add_argument('--beta', type=float, default=3.0)
    ap.add_argument('--fa', type=float, default=0.10); ap.add_argument('--lapse', type=float, default=0.02)
    ap.add_argument('--pcat', type=float, default=0.7, help='P(correct category response) in the game')
    ap.add_argument('--rt', type=float, default=0.35, help='seconds after the response window opens')
    ap.add_argument('--timeout', type=float, default=3600)
    ap.add_argument('--out', default='/tmp/headless_run')
    ap.add_argument('--seed', type=int, default=None)
    ap.add_argument('--screenshots', type=int, default=6)
    ap.add_argument('--headed', action='store_true')
    a = ap.parse_args()
    rng = random.Random(a.seed)
    os.makedirs(a.out, exist_ok=True)
    sep = '&' if '?' in a.url else '?'
    url = f"{a.url}{sep}session={a.session}" + (f"&participant={a.participant}" if a.participant else '')   # --participant '' leaves the id to the experiment (random, or the SONA survey code)
    console_lines, errors, events = [], [], []
    summary = dict(url=url, participant=a.participant, observer=dict(alpha=a.alpha, beta=a.beta, fa=a.fa, lapse=a.lapse), started=time.strftime('%Y-%m-%dT%H:%M:%S'))

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=not a.headed, args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        page.on('console', lambda m: console_lines.append(f'{m.type}: {m.text}'))
        page.on('pageerror', lambda e: errors.append(str(e)))
        downloads = []   # the download fallback of datasaver.js (no endpoint / single-file build) ends in a browser download
        async def on_download(d):
            path = os.path.join(a.out, d.suggested_filename); await d.save_as(path); downloads.append(path)
        page.on('download', lambda d: asyncio.ensure_future(on_download(d)))
        summary['downloads'] = downloads
        await page.goto(url)
        # --- dialog: OK is enabled once the resources are loaded
        await page.wait_for_selector('#dialogOK:visible', timeout=60000)
        await page.wait_for_function("() => { const b = document.getElementById('dialogOK'); return b && !b.classList.contains('disabled'); }", timeout=120000)
        await page.click('#dialogOK')
        events.append(('dialogOK', time.time()))
        t0 = time.time(); last_trial_key = None; last_routine_key = None; n_disc = n_cat = 0; shots = 0; finished = False
        while time.time() - t0 < a.timeout:
            st = await page.evaluate("() => { const E = window.__EXP || {}; const D = window.__DATASAVER || {}; return { routine: E.routine, routineStart: E.routineStart, now: performance.now(), trial: E.trial, lastResult: E.lastResult, responseKey: (typeof window.responseKey === 'undefined' ? null : window.responseKey), completed: !!D.completed, uploads: (D.uploads || []).length, ended: !!(E.psychoJS && E.psychoJS.experiment && E.psychoJS.experiment.experimentEnded) }; }")
            r = st['routine']; rkey = (r, st['routineStart'])
            if st['completed'] or st['ended']:
                # quit(): save -> flush log -> closing dialog with OK. Wait for that dialog (= uploads done), then click it.
                try:
                    await page.wait_for_selector('#dialogOK:visible', timeout=90000)
                    summary['closing_dialog'] = await page.evaluate("() => { const d = document.querySelector('#experiment-dialog .scrollable-container'); return d ? d.innerText : null; }")
                    await page.click('#dialogOK:visible')
                except Exception as e:
                    errors.append('closing dialog: ' + str(e))
                await asyncio.sleep(0.5)
                st2 = await page.evaluate("() => (window.__DATASAVER || {})")
                summary['datasaver'] = st2; finished = True
                break
            if r == 'Consent' and rkey != last_routine_key:
                await asyncio.sleep(0.3); await page.keyboard.press('y'); last_routine_key = rkey
            elif r in ('DiscrimInstructions_Pre', 'WelcomeToCategorizationTask', 'DiscriminationInstructions_Post') and rkey != last_routine_key:
                last_routine_key = rkey
                if r == 'DiscriminationInstructions_Post' and 'render_check' not in summary:
                    # render check: draw the last pre-test trial's two shapes side by side over the instruction page and photograph them
                    try:
                        await page.evaluate("() => { const S = window.__EXP.stims; S.Shape1.setPos([-0.35, -0.15]); S.Shape2.setPos([0.35, -0.15]); S.Shape1.setAutoDraw(true); S.Shape2.setAutoDraw(true); }")
                        await asyncio.sleep(0.6)
                        await page.screenshot(path=os.path.join(a.out, 'render_check.png'))
                        await page.evaluate("() => { const S = window.__EXP.stims; S.Shape1.setAutoDraw(false); S.Shape2.setAutoDraw(false); }")
                        summary['render_check'] = 'render_check.png'
                    except Exception as e:
                        errors.append('render check: ' + str(e))
                await asyncio.sleep(0.25)
                k = str(st['responseKey'] or 'space').strip().lower(); k = KEYMAP.get(k, k)
                await page.keyboard.press(k)
            elif r == 'DiscriminationTrial' and st['trial'] and st['trial'].get('phase') in ('PreTest', 'PostTest', 'PreRef', 'PostRef'):
                tk = (st['trial']['phase'], st['trial']['label'], st['trial']['n'], st['trial']['routineStart'])
                if tk != last_trial_key:
                    elapsed = (st['now'] - st['trial']['routineStart']) / 1000.0
                    if 'renderer' not in summary:
                        summary['renderer'] = await page.evaluate("() => { try { const r = window.__EXP.psychoJS.window._renderer; const g = r.gl ? r.gl.getContextAttributes() : null; return { type: r.constructor.name, gl_antialias: g ? g.antialias : 'no-gl', size: [r.width, r.height], resolution: r.resolution, frameRate: window.__EXP.psychoJS.window.getActualFrameRate() }; } catch (e) { return { error: String(e) }; } }")
                    if elapsed >= 1.5 + a.rt:
                        if shots < a.screenshots and n_disc in (3, 9, 15, 21):   # a few frames with the shapes (and the debug overlay, if on) visible
                            await page.screenshot(path=os.path.join(a.out, f'shot_disc_{n_disc}.png')); shots += 1
                        lvl, catch = st['trial']['level'], st['trial']['isCatch']
                        p_diff = a.fa if catch else a.fa + (1 - a.fa - a.lapse) * (1 - math.exp(-(lvl / a.alpha) ** a.beta))
                        key = 'd' if rng.random() < p_diff else 's'
                        await page.keyboard.press(key); last_trial_key = tk; n_disc += 1
                        events.append(('disc', st['trial']['phase'], st['trial']['label'], st['trial']['n'], lvl, catch, key))
            elif r == 'CategorizationTrial' and st['trial'] and st['trial'].get('phase') == 'Categorization':
                tk = ('cat', st['trial']['trial_number'], st['trial']['routineStart'])
                if tk != last_trial_key:
                    elapsed = (st['now'] - st['trial']['routineStart']) / 1000.0
                    if elapsed >= 1.0 + a.rt:
                        if shots < a.screenshots and n_cat in (2, 8, 40):
                            await page.screenshot(path=os.path.join(a.out, f'shot_cat_{n_cat}.png')); shots += 1
                        tc = st['trial']['true_category']
                        resp = tc if rng.random() < a.pcat else rng.choice([c for c in (0, 1, 2) if c != tc])
                        await page.keyboard.press(str(resp + 1)); last_trial_key = tk; n_cat += 1
            await asyncio.sleep(0.04)
        summary.update(finished=finished, n_disc_responses=n_disc, n_cat_responses=n_cat, seconds=round(time.time() - t0, 1), errors=errors, ended=time.strftime('%Y-%m-%dT%H:%M:%S'))
        try:
            summary['exp'] = await page.evaluate("() => { const E = window.__EXP || {}; const out = { method: E.method, build: E.build, subspace_redraws: E.subspace_redraws, subspace_min_radius: E.subspace_min_radius, staircases: {} }; for (const ph in E.staircases) out.staircases[ph] = E.staircases[ph].map(s => ({ label: s.label, n: s.n, nCatch: s.nCatch, finished: s.finished, reason: s.finishedReason, summary: s.summary() })); out.blocks = {}; for (const ph in (E.blocks || {})) out.blocks[ph] = { length: E.blocks[ph].length, responses: E.blocks[ph].responses.length, finished: E.blocks[ph].finished }; out.space_id = E.space_id; try { const r = E.psychoJS.window._renderer; out.gl_antialias = r && r.gl ? r.gl.getContextAttributes().antialias : 'no-gl'; out.renderer = r ? r.constructor.name : null; } catch (e) { out.gl_antialias = 'err:' + e; } return out; }")
        except Exception as e:
            summary['exp_error'] = str(e)
        await browser.close()
    open(os.path.join(a.out, 'console.log'), 'w').write('\n'.join(console_lines))
    json.dump(dict(summary, events=events), open(os.path.join(a.out, 'summary.json'), 'w'), indent=1, default=str)
    print(json.dumps({k: v for k, v in summary.items() if k not in ('datasaver',)}, indent=1, default=str)[:4000])
    ds = summary.get('datasaver') or {}
    ok = finished and any((u.get('ok') or u.get('download')) and u.get('kind') == 'csv' and u.get('completed') for u in ds.get('uploads', []))
    print('RESULT', 'OK' if ok else 'FAIL', '| errors:', len(errors))
    sys.exit(0 if ok else 1)

asyncio.run(main())
