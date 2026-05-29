# Anona — Auth Runbook (READ ME)

Everything in this `_auth/` folder, plus a few required root files, is the
**authentication / backend system**. It does **NOT** come from Claude Design.
This file is your operating manual.

---

## 1. Which files are AUTH vs DESIGN

### 🔒 AUTH — never delete, do not edit unless you mean to
- **`_auth/`** (this whole folder)
  - `supabase-client.js` — shared Supabase connection
  - `auth.js` — login + invite-gated signup (used by `index.html`)
  - `guard.js` — protects pages; fills "signed in as"; sign-out; loads analytics
  - `analytics.js` — PostHog (per-user behavior)
  - `admin.js` + `admin.html` — your admin login-log page
  - `supabase/schema.sql` — the database tables + security (already run)
  - `README-AUTH.md` — this file
- **Root files Netlify requires** (cannot live in `_auth/`):
  - `netlify.toml` — build/functions config
  - `package.json` (+ `package-lock.json` if present) — function dependencies
  - `netlify/functions/redeem-invite.js` — secure invite check
  - `netlify/functions/config.js` — serves public keys to the browser

### 🎨 DESIGN — safe to overwrite from Claude Design
**Everything in `/site/`**: `index.html`, `chooser.html`,
`Tenet First Experience.html`, the `tenet-deck/`, CSS, fonts, images, etc.
You can replace the whole `/site/` folder wholesale — `_auth/` and the root
config files are separate and untouched.

**The only edits made to design files** are small AUTH script tags, each marked
with an `AUTH (not design)` HTML comment. See section 6 for what to re-add after
a Claude Design re-download.

### How it's served
Netlify runs a build (see `netlify.toml`) that merges `/site` + `/_auth` into a
`dist/` folder and serves that, so `anona.tv/` loads `/site/index.html` and
`/_auth/*` scripts are reachable. `dist/` is generated automatically and
git-ignored — never edit it.

---

## 2. Environment variables (set in Netlify → Site config → Environment variables)

| Variable | Secret? | Value |
|---|---|---|
| `SUPABASE_URL` | no | your Supabase Project URL |
| `SUPABASE_ANON_KEY` | no | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | Supabase service_role/secret key |
| `POSTHOG_KEY` | no | PostHog Project API key (starts `phc_…`) |
| `POSTHOG_HOST` | no | e.g. `https://us.i.posthog.com` (or EU host) |
| `RESEND_API_KEY` | **yes** | Resend API key (starts `re_…`) — for auto-invite emails |
| `INVITE_FROM_EMAIL` | no | verified sender, e.g. `Anona <invites@anona.tv>` |
| `SITE_URL` | no | optional, defaults to `https://anona.tv` |

Keys live **only** in Netlify — never in the repo.

### Auto-invite by email (admin page)
The "Invite someone" box on the admin page generates a code and emails it
automatically via Resend. It needs `RESEND_API_KEY` + `INVITE_FROM_EMAIL` set,
and the sending domain verified in Resend. Until then, use the SQL method (§3).
The function (`netlify/functions/send-invite.js`) checks `is_admin` server-side,
so only you can send invites.

---

## 3. Generate invite codes

Supabase dashboard → **SQL Editor** → run:

**Invite ONE new person** (change the email to theirs; the `note` is just your
label so you can see who each code is for):
```sql
insert into invite_codes (code, note)
values (replace(gen_random_uuid()::text,'-',''), 'newperson@example.com')
returning code;
```
Copy the returned `code` and send it to them with the signup steps (§ below).

**Invite several at once** — one line per person:
```sql
insert into invite_codes (code, note)
values
  (replace(gen_random_uuid()::text,'-',''), 'alice@example.com'),
  (replace(gen_random_uuid()::text,'-',''), 'bob@example.com')
returning note, code;
```

⚠️ Each code is single-use — give every person a DIFFERENT code. Don't send the
same code to a group.

Prefer your own friendlier codes? Insert them directly:
```sql
insert into invite_codes (code, note) values ('welcome-justin', 'Justin');
```

**Signup steps to send each person:**
1. Go to https://anona.tv
2. Click "Have an invite code? Create account"
3. Enter your email, the code, and choose a password.

See which codes are used / unused:
```sql
select code, claimed, claimed_at, claimed_by
from invite_codes order by created_at desc;
```

---

## 4. Make someone an admin

```sql
update profiles set is_admin = true
where email = 'david.s.parker@gmail.com';
```

(The person must have signed up at least once so a profile row exists.)
Admins can open the admin page; non-admins can't read the log at all (enforced
by database security, not just the page).

---

## 5. Where to view analytics

- **Login log (who/when/how often):** `https://anona.tv/_auth/admin.html`
  (admin-only).
- **Page behavior (what they viewed, how long, recordings):** the **PostHog**
  dashboard. Events are tied to each user's email, so you can filter per person.

---

## 6. Re-downloading the design from Claude Design (IMPORTANT)

Put the Claude Design download into **`/site/`** (you can replace the whole
folder — `_auth/` and the root config files are separate). The re-downloaded
pages come back with their original markup and may lose the AUTH script tags
(and `index.html` will bring back the old fake-login script). After replacing,
re-apply the tags below (all paths stay the same — they're absolute `/_auth/…`):

**`site/index.html`** — delete any `ACCESS_LIST` / fake-login `<script>` block,
and ensure these are before `</body>`:
```html
<script src="/_auth/config.js"></script>
<script type="module" src="/_auth/auth.js"></script>
```
Also confirm the form still has: `#email`, `#password`, `#invite` (inside
`#inviteField`), `#enterBtn` (with `#btnLabel` span), `#modeToggle`, `#gateTitle`.

**Any protected page** (`site/chooser.html`,
`site/tenet-deck/TENET Investor Deck.html`, `site/Tenet First Experience.html`)
— re-add the instant bounce in `<head>`:
```html
<script>(function(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("sb-")===0&&k.indexOf("-auth-token")>0)return;}window.location.replace("/");}catch(e){}})();</script>
```
and the guard before `</body>`:
```html
<script src="/_auth/config.js"></script>
<script type="module" src="/_auth/guard.js"></script>
```

Nothing in `_auth/` or the root Netlify files needs to change on a re-download.

---

## 7. Set up on a NEW computer

The live site keeps running on Netlify no matter what — this is only for editing
locally.

1. Install **Node.js** (https://nodejs.org, LTS).
2. Clone your repo:
   ```bash
   git clone <your-github-repo-url>
   cd "Anona Design System"
   ```
3. Install function dependencies:
   ```bash
   npm install
   ```
4. (Optional) Test functions + env locally with the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify link            # connect this folder to your Netlify site
   netlify env:pull .env   # recreate a local .env from your Netlify env vars
   netlify dev             # serves the site + functions at http://localhost:8888
   ```
   `.env` is git-ignored — never commit it.

Pushing to GitHub auto-deploys to Netlify as usual; local setup is not required
for the live site to work.

---

## 8. How it all fits (1-paragraph mental model)

The browser loads public keys from the `config` function, talks to **Supabase
Auth** for login/sessions, and for signup posts the invite code to the
**`redeem-invite`** function — the only place codes are checked, using the secret
service-role key so it can't be bypassed. Successful logins write a row to
`login_events`; **Row Level Security** lets each user write only their own and
lets only admins read them. The admin page reads that log; **PostHog** captures
per-user page behavior.
