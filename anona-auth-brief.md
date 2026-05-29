# Brief: Add real authentication, invite codes, and admin analytics to anona.tv

## Context
I have an existing front-end site (designed in Claude Design, published via GitHub) with a working-looking login page at https://anona.tv/. Right now the login is **fake security**: emails and a single shared password are hardcoded into the page, so the credentials are visible in browser dev tools and everyone shares one password. I want to replace this with real authentication.

Scale: under 50 invited users, private.

## Hosting / pipeline (already set up — do not change)
The site is hosted on **Netlify**, auto-deployed from GitHub. My workflow: I design pages in Claude Design, download the project, drop/replace files in my master folder, push to GitHub, and Netlify deploys automatically.

Use this to our advantage:
- Put the secure invite-code redemption logic in a **Netlify Function** (`netlify/functions/`), since that's free and already available on my host. Do NOT do invite validation in client-side JS that users can bypass.
- Put Supabase and PostHog keys in **Netlify environment variables** (Site settings → Environment variables), read at runtime by the functions. Never commit keys to the repo.
- Add a `netlify.toml` if needed for build/functions config.
- IMPORTANT: the auth files you add (functions, config, Supabase JS) are permanent repo files that do NOT come from Claude Design. Please clearly tell me which files you added and which folders are "yours" vs. design files, so that when I re-download from Claude Design and replace design files in future, I don't accidentally delete the auth work.
- FOLDER CONVENTION I WANT: put as much non-design code as possible into a SINGLE clearly-named folder (e.g. `/_backend` or `/_auth`) that I will know to never touch. This should include the Supabase setup, the auth logic JS, and anything else non-design.
- Keep auth logic in a SEPARATE `.js` file inside that protected folder — do NOT put Supabase/auth JavaScript inline inside the designed login/signup page. The designed page should just link to that script. This way, when I re-download the page design from Claude Design, the look updates but the auth script it references stays untouched.
- I understand a few files MUST live at the repo root and can't go in the folder (`netlify.toml`, possibly `package.json`/dependency files, and the Netlify functions folder which Netlify expects at a conventional path). For those, please list them explicitly, tell me they're set-once/never-touch, and keep them minimal.

## What I want built

### 1. Real authentication (Supabase)
- Remove all hardcoded emails/passwords from the front end.
- Use Supabase Auth for email + password accounts (passwords hashed/managed by Supabase, never stored in my code).
- Sessions handled by Supabase so people stay logged in appropriately.

### 2. Invite-gated signup (one-time codes)
- New users cannot self-register freely. To create an account they must enter: email + a valid **one-time invite code** + a password they choose.
- Store invite codes in a Supabase table; each code is single-use and marked claimed (with who claimed it and when) once redeemed.
- I want to be able to generate/add new invite codes easily.
- Validate and redeem the invite code securely server-side (Supabase Row Level Security policies, and a serverless function for redemption if needed) — not in client-side JS that users can bypass.

### 3. Login + activity logging
- On each successful login, write a row to a Supabase table: user, timestamp.
- I want to see, per user: when they logged in and how often.

### 4. Page-behavior analytics (PostHog)
- Integrate PostHog (free tier) to capture: which pages each user viewed, time on page / session duration, and ideally session-level behavior.
- Identify PostHog events with the logged-in user so I can see behavior per person.

### 5. Admin portal (just me)
- Mark my own account as admin via an `is_admin` flag in the database.
- Build an admin-only page (access gated by the `is_admin` flag) that shows the login log — who logged in, when, how often.
- For deep "what did they look at and for how long," I'll use the PostHog dashboard; just make sure events are tied to user identity. (Optional: embed or link key PostHog views from my admin page.)

## Constraints / preferences
- I'm not going to manage the plumbing myself — set it up end to end and tell me what I need to create accounts for (Supabase, PostHog) and exactly which env vars/keys to paste into Netlify.
- Keep the existing front-end design intact as much as possible; just swap the fake login for real auth.
- Never put secrets or service keys in client-side code or in the repo. Use Netlify environment variables.
- Walk me through any manual steps (creating the Supabase project, setting RLS policies, adding Netlify env vars) in plain language.

## Suggested build order
1. Audit current repo + propose a folder convention that keeps Claude Design files separate from auth files.
2. Stand up Supabase: tables for users (auth handles most), `invite_codes`, `login_events`; add `is_admin`.
3. Configure RLS policies + a Netlify Function for invite redemption.
4. Replace hardcoded login with Supabase Auth + invite-gated signup.
5. Add login-event logging.
6. Integrate PostHog with user identification.
7. Build admin-only page reading the login log.
8. Give me a short runbook: which files are auth vs. design, how to generate invite codes, how to make someone admin, where to view analytics, and **how to set up the project on a new computer** (clone from GitHub, `npm install` if needed, and how to recreate a local env file from my Netlify env vars for local testing — noting that the live site keeps running via Netlify regardless).
