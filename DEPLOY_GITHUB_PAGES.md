# Running the study from GitHub Pages — the whole procedure

Nothing to install. Three free accounts (GitHub, Cloudflare, your SONA researcher login), about 30 minutes, done once.
Afterwards a new version of the experiment is "replace the files on GitHub"; the data collect themselves.

What ends up where: the experiment pages sit on **GitHub Pages** (free static hosting over https); the data go to a
**Cloudflare Worker** (a 100-line script, `server/cloudflare-worker.js`) that stores each CSV in Cloudflare storage and,
if you give it SONA's server-side completion URL, grants the SONA credit the moment a complete file arrives. GitHub
Pages cannot receive uploads, which is why the Worker exists.

## A. The experiment on GitHub Pages (10 min)

1. github.com → sign in → **+ → New repository** → name `discrimination-online`, **Public** (Pages is free for public
   repositories only) → Create repository.
2. On the empty repository page click **uploading an existing file**, drag the *contents* of the unzipped
   `selfhost_package` folder (all files and sub-folders, not the folder itself) into the box, wait for the upload,
   **Commit changes**. (`.nojekyll` is among the files; it stops GitHub from post-processing the folder.)
3. **Settings → Pages → Build and deployment**: Source *Deploy from a branch*, Branch `main`, folder `/ (root)` → Save.
   After a minute the page shows your site: `https://<user>.github.io/discrimination-online/`.
4. Open `https://<user>.github.io/discrimination-online/quest.html?smoke=1`: the dialog appears, a four-minute session
   runs, the CSV downloads (no endpoint yet). `quest_sym.html` is the symmetric study; `psi*.html`, `questplus*.html`
   the other procedures.

## B. The data endpoint on Cloudflare (10 min)

1. dash.cloudflare.com → sign up (free plan).
2. Storage, one of:
   - **Workers KV** (no card needed, 1 GB free ≈ 1,000 sessions): *Storage & Databases → KV → Create namespace* →
     name `discrimination-data`.
   - **R2** (10 GB free, but Cloudflare asks for a card on file before it enables R2; a temporary $5 hold may appear
     and is released): *R2 Object Storage → Create bucket* → `discrimination-data`.
3. **Workers & Pages → Create → Create Worker** → name `discrimination-collect` → Deploy → **Edit code** → delete the
   sample, paste the whole of `server/cloudflare-worker.js` → Deploy.
4. Worker → **Settings → Variables and Secrets → Add**: `COLLECT_TOKEN` (type *Secret*; any long random string) and
   `ADMIN_TOKEN` (another one). Keep both somewhere safe.
5. Worker → **Settings → Bindings → Add**: *KV namespace*, variable name `DATA_KV`, namespace `discrimination-data`
   (or *R2 bucket*, variable name `DATA`, bucket `discrimination-data`) → Deploy.
6. Open `https://discrimination-collect.<account>.workers.dev/collect/ping` → `{"ok":true,...}`.

## C. Wire the two together (3 min)

1. On GitHub open `config.js` → pencil icon → set
   `endpoint: 'https://discrimination-collect.<account>.workers.dev/collect'` and `token: '<COLLECT_TOKEN>'` in the
   `data` block, and the lab contact in `sona.contact` → Commit changes. Pages redeploys by itself (≈ 1 min).
2. Run `quest.html?smoke=1` again, then open `https://discrimination-collect.<account>.workers.dev/files?admin=<ADMIN_TOKEN>`:
   the smoke CSV and its .log are listed. That is the whole pipeline.

## D. SONA (5 min per study)

1. SONA researcher account → **Add New Study → Online External Study**. Study URL:
   `https://<user>.github.io/discrimination-online/quest.html?survey_code=%SURVEY_CODE%`
   (`quest_sym.html` for the symmetric study — make it a second SONA study). Duration 45 min. Save.
2. The study page now shows two completion URLs.
   - **Client-side** (`…/webstudy_credit.aspx?experiment_id=…&credit_token=…&survey_code=XXXX`) → into `config.js`
     `redirect.completionUrl` with `{survey_code}` in place of `XXXX` (commit on GitHub).
   - **Server-side** (`…/services/SonaAPI.svc/WebstudyCredit?experiment_id=…&credit_token=…&survey_code=XXXX`) → Worker
     *Settings → Variables and Secrets* → secret `SONA_CREDIT_URL`, again with `{survey_code}` in place of `XXXX`.
3. Test as a participant: researcher accounts cannot sign up, so log in with a test participant account and put a
   temporary invitation code on the study so nobody else enrols. Run the study; then check
   `…workers.dev/credits?admin=<ADMIN_TOKEN>` (the receipt, `ok: true`) and SONA's timeslot page (credit granted).
   Remove the invitation code, set the timeslots, done.

## E. During and after data collection

- `python3 server/pull_data.py --worker https://discrimination-collect.<account>.workers.dev --admin <ADMIN_TOKEN> --out ./data --credits`
  downloads every new file and `credits.json`, and prints any survey code whose credit SONA did not grant — those are
  credited by hand in SONA (the survey code is the participant id, the file name and a column).
- `…/files?admin=…` in a browser lists everything; `…/files/<name>?admin=…` downloads one file;
  `…/credit?admin=…&survey_code=X` retries one credit.
- Partial files of abandoned sessions live under `partial/` (`--partial` fetches them).
- A new experiment version = upload the changed files to the repository. Keep `config.js` (it holds your endpoint).

## Costs and limits

GitHub Pages: free, 1 GB site, 100 GB/month bandwidth (a session loads ~3 MB once). Cloudflare Workers free plan:
100,000 requests/day (a session makes ~15). KV: 1 GB, 1,000 writes/day (~65 sessions/day); R2: 10 GB. Nothing
here has a monthly charge.
