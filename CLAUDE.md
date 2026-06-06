# Anona — Project Workflow (read me first)

This file is the operating manual for this repo. It is auto-loaded by Claude
Code every session. **The recurring job here is: take a fresh Claude Design
download, put back the auth/backend code that the design export strips out, and
publish it to the live site (anona.tv) via Netlify.**

For the deep auth reference, see `_auth/README-AUTH.md`. This file is the
short, practical workflow.

---

## 1. The one rule: design vs. backend are separate folders

| Folder / file | What it is | Touch on a re-download? |
|---|---|---|
| `/site/` | **All design files** — HTML, CSS, fonts, images, decks | ✅ Replace freely |
| `/_auth/` | **Auth/backend** — login, page guards, analytics, Terms gate, admin | ❌ Never overwrite |
| `netlify.toml`, `package.json` | Netlify build + function deps (root) | ❌ Never overwrite |
| `netlify/functions/` | Serverless functions (config, invites, analytics, accept-terms) | ❌ Never overwrite |
| `dist/` | Auto-generated on deploy (git-ignored) | ❌ Never edit |

On deploy, Netlify merges `/site` + `/_auth` into `dist/` and serves that.

**A Claude Design download only ever changes things in `/site/`.** Everything in
`/_auth/` and the root/function files is stable and should not be re-created.

---

## 2. What the design export strips out (and what to put back)

A re-download brings pages back with their original markup. It does two harmful
things that must be undone on **every protected page**:

1. **Drops the real auth `<script>` tags.**
2. **Ships its own fake "casual" gate** — a localStorage check using the key
   `anona-auth`. This must be **removed/neutralized**, not just supplemented.
   Leaving a design sign-out handler in place races the real async sign-out and
   the session never actually clears.

All real auth edits are marked with an `AUTH (not design)` HTML comment.

### Pattern A — the login page: `site/index.html`
- **Remove** any fake-login / `ACCESS_LIST` / `anona-auth`-writing script.
- **Ensure** before `</body>`:
  ```html
  <script src="/_auth/config.js"></script>
  <script type="module" src="/_auth/auth.js"></script>
  ```
- **Confirm the form hooks** `auth.js` drives still exist (IDs):
  `#gateForm #email #password #invite` (inside `#inviteField`) `#err`
  `#enterBtn` containing `#btnLabel`, `#modeToggle`, `#formTitle`/`#gateTitle`.
  Also the spans `<span id="btnLabel">` and `<span id="toggleLead">`, and
  `class="...hide"` on `#inviteField`. If IDs changed, re-map `auth.js`.

### Pattern B — every protected page
(`site/chooser.html`, `site/TENET First Experience.html`, the TENET Live Demo
pages, the Lobby Deck, each deck's HTML, the seed plan, and any NEW page that
should require login)
- **In `<head>`** — instant bounce if not signed in:
  ```html
  <!-- AUTH (not design): instant bounce if no session token. See /_auth/README-AUTH.md -->
  <script>(function(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("sb-")===0&&k.indexOf("-auth-token")>0)return;}window.location.replace("/");}catch(e){}})();</script>
  ```
- **Before `</body>`** — the real guard:
  ```html
  <!-- AUTH (not design): session check, "signed in as", and sign-out live in /_auth/guard.js -->
  <script src="/_auth/config.js"></script>
  <script type="module" src="/_auth/guard.js"></script>
  ```
- **Remove** the design's own `anona-auth` head gate and any
  `#sessionExit` / `#signout` IIFE. `guard.js` handles "signed in as"
  (`#who`/`#sessionWho`) and sign-out (`#signout`/`#sessionExit`) for free.

> The paths are absolute (`/_auth/…`, `/`), so they work unchanged even for
> deck pages that live in subfolders.

> **The Terms of Use gate needs no per-page work** — it's enforced inside
> `guard.js`, so any page with the guard automatically gets it.

---

## 3. The workflow, step by step

1. **Drop the new design into `/site/`** (overwrite as much as you like — even
   the whole folder). Leave `/_auth/` and root files alone.
2. **See exactly what changed:**
   ```bash
   git status
   git diff --stat
   ```
   Don't rely on eyeballing — `git diff` is the source of truth for what the
   re-download altered, even if "most of the site" changed.
3. **For each changed/added HTML page**, apply Pattern A or B from §2.
   - New page that should be private? Treat it as a protected page (Pattern B).
   - New download asset (e.g. a `.pdf`/`.xlsx`)? Just commit it; it's static.
4. **Neutralize fake gates** — confirm no real `anona-auth` logic remains
   (comments are fine):
   ```bash
   grep -rn "anona-auth" site/ | grep -v "has been removed\|handler has been"
   ```
5. **Check filename case** (see §4 — this is a real production-only bug).
6. **Verify** (see §5).
7. **Publish** (see §6).

---

## 4. Case-sensitivity gotcha (bites only in production)

macOS is case-insensitive; **Netlify's Linux is case-sensitive.** A link like
`href="TENET%20First%20Experience.html"` will work locally but **404 on the live
site** if git tracks the file as `Tenet First Experience.html`.

Check every chooser/card link resolves against the real tracked filenames:
```bash
cd site
grep -o 'href="[^"]*\.html"' chooser.html | sed 's/href="//;s/"$//;s/%20/ /g' \
  | while IFS= read -r d; do [ -f "$d" ] && echo "OK   $d" || echo "MISS $d"; done
```
If a name's case is wrong in git, fix it with a two-step rename (case-only
renames need a temp name on a case-insensitive FS):
```bash
git mv "site/Wrong Case.html" "site/temp.html"
git mv "site/temp.html" "site/Right Case.html"
```

---

## 5. Verify before publishing

```bash
# (a) JS syntax-check every auth script — there is no Node here; use macOS JSC.
#     A single syntax error makes a whole module silently fail to load.
#     Path-agnostic: derives the repo root from git, so it works on any
#     machine/clone (the absolute path differs per machine). Run inside the repo.
export REPO="$(git rev-parse --show-toplevel)"
osascript -l JavaScript <<'EOF'
ObjC.import('Foundation')
var base = $.NSProcessInfo.processInfo.environment.objectForKey('REPO').js + '/'
var files=['_auth/admin.js','_auth/guard.js','_auth/analytics.js','_auth/terms.js','_auth/auth.js','_auth/supabase-client.js']
files.forEach(function(f){try{var s=$.NSString.stringWithContentsOfFileEncodingError(base+f,4,null).js;s=s.replace(/^\s*import[^\n]*\n/gm,'').replace(/export\s+/g,'').replace(/\bawait\b/g,'');new Function(s);console.log(f+': OK')}catch(e){console.log(f+': ERROR -> '+e.message)}})
EOF

# (b) Build merge check — mirrors what Netlify does.
rm -rf dist && mkdir -p dist && cp -a site/. dist/ && cp -a _auth dist/_auth && echo "build OK" && rm -rf dist
```

Optional after deploy: probe the functions are alive (401/405 = healthy):
```bash
curl -s -w " [%{http_code}]\n" "https://anona.tv/.netlify/functions/analytics-summary?days=30"
```

---

## 6. Publish

```bash
git add site/                # (and _auth/ or netlify/ only if backend changed)
git commit -m "Re-apply auth to re-downloaded design"
git push origin main         # pushing main auto-deploys to Netlify
```
- The repo deploys from **`main`**. Pushing is what makes it go live.
- If `git push` fails with a credentials error (e.g. "could not read Username
  for https://github.com" — common inside a sandbox, or on a machine that has
  never authenticated to GitHub), run it from a normal terminal at the repo
  root: `git push origin main`. The repo path differs per machine (e.g.
  `~/claude-artifacts` on one, a Dropbox CloudStorage path on another), so `cd`
  into wherever this clone lives first. First-time auth: GitHub username + a
  personal access token (not your password); the keychain caches it after.
  `gh auth login`, or switching the remote to SSH, also work.
- After deploy, sanity-check in a **private/incognito** window: the site should
  show the **login gate**; after signing in, the chooser + all cards load and
  sign-out works.

---

## 7. Things that are NOT part of a re-download (leave alone)

- `_auth/*` (login, guard, analytics, terms, admin) and `netlify/functions/*`.
- `_auth/terms.js` holds the **Terms of Use copy + `TERMS_VERSION`**. To change
  the terms, edit that one file and bump the version (re-prompts everyone).
- `netlify/functions/interpret.js` powers the TENET Live Demo's **optional**
  "idea import" (Claude-backed; verifies the caller's Supabase token so it can't
  be hit anonymously). Needs `ANTHROPIC_API_KEY` set in Netlify; the demo's core
  is deterministic and works without it. Its dep (`@anthropic-ai/sdk`) lives in
  the root `package.json`.
- Supabase tables / RLS live in `_auth/supabase/schema.sql` (already run).
- Secrets live **only** in Netlify env vars, never in the repo (Supabase keys,
  PostHog keys, Resend key, `ANTHROPIC_API_KEY`). See `_auth/README-AUTH.md §2`.

---

## 8. Hard-won gotchas (don't repeat these)

- **Duplicate/`const` redeclaration or any syntax error in a `_auth/*.js`
  module = the whole page silently sticks on "Loading…".** Always run the §5(a)
  syntax check before pushing.
- **A re-download re-introduces the fake `anona-auth` gate every time.** Always
  neutralize it (§2, §4 grep), don't just add the real tags alongside it.
- **Filename case** (§4) — fix it in git or it 404s only in production.
- **Netlify env var changes need a redeploy** to take effect.
- When debugging a blank/stuck page, make it **report its own error on-screen**
  (an inline `window.addEventListener('error', …)` in `<head>`) rather than
  guessing — that's how the "Loading…" bug was found.
