# Anona / Tenet site — maintenance README

The live site is **anona.tv**, hosted on **Netlify**, deploying automatically from
the **`main`** branch. The design comes from **Claude Design** downloads; the
login/backend is hand-maintained.

This README is the human orientation + change log. For the detailed step-by-step
of re-applying auth after a fresh design download, see **`CLAUDE.md`** (the
operating manual, auto-loaded each session). This file is internal only — it
lives at the repo root, not in `/site/`, so it is never published to anona.tv.

---

## The one rule (see CLAUDE.md for detail)

| Folder / file | What it is | On a design re-download |
|---|---|---|
| `/site/` | All design — HTML, CSS, JS/JSX, fonts, images, decks | ✅ Replace freely |
| `/_auth/` | Login, page guard, Terms gate, analytics, admin | ❌ Never overwrite |
| `netlify.toml`, `package.json`, `netlify/functions/` | Netlify build + serverless functions | ❌ Never overwrite |

A Claude Design download **only ever changes `/site/`**. Everything it ships
strips out the real auth and a few hand-added affordances — those must be
re-applied (see "Re-apply after every re-download" below).

---

## What we did in this session (June 2026)

In commit order (`b3a1db7` was the prior baseline):

1. **`66e7c95` — Applied the v2 Claude Design download.** Re-applied auth
   (Pattern A to `index.html`, Pattern B to all protected pages), added the new
   v2 pages — **TENET Live Demo**, **TENET Live Demo (two-seat)**, **Lobby
   Deck** — and shipped the Live Demo's optional "idea import" backend
   (`netlify/functions/interpret.js`, the `/api/interpret` redirect, the
   `@anthropic-ai/sdk` dep).
2. **`a5b6302` — CLAUDE.md upkeep.** Made the verify/publish commands
   path-agnostic (was a hardcoded `/Users/davidparker/claude-artifacts` path
   that only worked on one machine) and documented `interpret.js`.
3. **`3a0612b` — Post-login now lands on the Lobby intro deck.** Changed
   `DEST` in `/_auth/auth.js` from `/chooser.html` to
   `/lobby_deck/TENET%20Lobby%20Deck.html`. Flow is now:
   **login → Terms gate → Lobby deck (auto-advances from slide 1) → "Skip
   intro" / "Enter the deep dive" → chooser.**
4. **`282e159` — Lobby deck slide 12 "The first product" card** now links to the
   TENET Live Demo (it was a dead `<div>`).
5. **`01f08eb` — Added a uniform "↩ overview" back-to-menu link** to every gated
   page that lacked one (Lobby deck, both Live Demo pages, both Story pages).
6. **`2fd3ca0` — Restyled the overview pill** to a solid near-black chip (cream
   text, hairline light border, soft shadow) so it's legible against any
   background — it used to be a translucent light chip that vanished on the
   light/paper pages. Also converted the cap table & seed plan's header
   text-link to the same pill. Now uniform across all gated pages.

---

## Re-apply after every Claude Design re-download

A fresh download overwrites `/site/`, so it **wipes these hand-added items**.
Re-apply them each time (use `git diff` to see exactly what the download changed):

1. **Auth (the big one).** Pattern A on `index.html`, Pattern B on every
   protected page; neutralize the design's fake `anona-auth` gate. Full
   procedure in **`CLAUDE.md` §2–§3**.
2. **The "↩ overview" pill.** It is design markup *we* add, not part of the
   Claude Design source, so a re-download removes it from any page it touches.
   - HTML, right after `<body>` (outside any scaled `deck-stage`):
     ```html
     <a class="session-nav session-overview" href="../chooser.html" title="Back to overview">
       <span class="arrow">↩ overview</span>
     </a>
     ```
     Use `href="chooser.html"` on root-level pages, `../chooser.html` in subfolders.
   - CSS (inline, near the page's other styles) — the dark pill:
     ```css
     .session-nav { position: fixed; top: 14px; z-index: 1000; display: flex;
       align-items: center; gap: 10px; font-family: "JetBrains Mono", monospace;
       font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
       color: rgba(246,244,239,0.82); background: rgba(14,14,14,0.9);
       backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
       padding: 6px 10px; border: 1px solid rgba(255,255,255,0.16);
       box-shadow: 0 1px 12px rgba(0,0,0,0.4); cursor: pointer;
       text-decoration: none; transition: color 120ms ease, border-color 120ms ease; }
     .session-nav:hover { color: var(--fg-accent,#BA7517); border-color: var(--fg-accent,#BA7517); }
     .session-overview { left: 16px; }
     .session-nav .arrow { color: inherit; }
     @media print { .session-nav { display: none !important; } }
     ```
   - The decks ship their own `.session-nav` already; just make sure it's the
     **dark** version above, not a translucent light one.
3. **Slide-12 "first product" link** on the Lobby deck → `../TENET%20Live%20Demo.html`
   (the design ships it as a non-linking card).

> Post-login routing does **not** need re-applying — `DEST` lives in
> `/_auth/auth.js`, which a re-download never touches.

---

## Standalone gotchas (not stripped, but bite-y)

- **Vimeo demo won't play?** The clip (`vimeo.com/1198884434`, "A Brief History
  of Selling Ideas") is unlisted/domain-restricted. **anona.tv must be on its
  allowed-embed domains** in the video's Vimeo Privacy settings. The embed lives
  in `site/flow/app.jsx` and `site/flow/client-tabs1.jsx` (plus `flow_ctx/`
  copies and `_ds_bundle.js`). If domain-whitelisting isn't available, add the
  privacy hash to the iframe `src`: `?h=ec86a6b7e7`.
- **Live Demo "idea import"** (`interpret.js`) needs `ANTHROPIC_API_KEY` set in
  Netlify env vars. The demo's core is deterministic and works without it.
- **Filename case** — macOS is case-insensitive, Netlify's Linux is not. A
  wrong-case `href` 404s only in production. See `CLAUDE.md §4`.
- **Secrets** live only in Netlify env vars (Supabase, PostHog, Resend,
  `ANTHROPIC_API_KEY`) — never in the repo.

---

## Publishing

```bash
git add site/                 # (+ _auth/ or netlify/ only if backend changed)
git commit -m "…"
git push origin main          # pushing main auto-deploys to Netlify
```
First push from a machine prompts for a GitHub **username + personal access
token** (not your password); the keychain caches it after. Then sanity-check in
an **incognito** window: login gate → Terms → Lobby deck → chooser, and the
"↩ overview" pill returns to the menu from any page.

---

## Not published yet — the Portal pages (WIP)

`site/TENET Portals.html`, `TENET Client Portal.html`, `TENET Creative
Portal.html`, `TENET Production Portal.html`, and `site/portals/*.jsx` are
**untracked work in progress** — do **not** publish them as-is:

- `TENET Portals.html` and `TENET Production Portal.html` have **no auth gate**
  (they'd be publicly viewable).
- The Client/Creative portals have `guard.js` but are **missing the instant
  head-bounce**.
- The chooser doesn't link to any of them yet.

Before publishing: apply Pattern B (head-bounce + guard) to all four, add the
overview pill, wire them into the chooser, then verify and push.
