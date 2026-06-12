/* =====================================================================
 *  guard.js  —  protect a page  (in _auth/)
 *  ---------------------------------------------------------------------
 *  Drop this on any page that should require a login:
 *    <script src="/_auth/config.js"></script>
 *    <script type="module" src="/_auth/guard.js"></script>
 *
 *  It checks for a valid Supabase session. If there isn't one, it sends
 *  the visitor back to the gate (/). If there is, it fills in any
 *  "signed in as" label, wires any sign-out control, and enforces the
 *  Terms of Use acceptance gate (see terms.js).
 *
 *  Recognised, optional UI hooks (it just skips any that aren't present):
 *    user label   : #who, #sessionWho, or [data-anona-user]
 *    sign-out btn : #signout, #sessionExit, or [data-anona-signout]
 *
 *  TERMS GATE: after login, if the user has not accepted the CURRENT
 *  terms version, a full-screen modal blocks all content until they
 *  click "I Agree". The click records an acceptance via the accept-terms
 *  function (which captures their IP server-side) and fires a PostHog
 *  "terms_accepted" event. Bump TERMS_VERSION in terms.js to re-prompt.
 *
 *  NOTE: a tiny inline pre-check in each protected page's <head> bounces
 *  visitors with no token instantly (avoids a flash of content). This
 *  module is the authoritative check (validates/expires the session).
 * ===================================================================== */

import { supabase, logLoginEvent } from '/_auth/supabase-client.js';
import { TERMS_VERSION, TERMS_HTML, TERMS_UPDATED_LABEL } from '/_auth/terms.js';

const LOGIN = '/';

const { data } = await supabase.auth.getSession();

if (!data || !data.session) {
  window.location.replace(LOGIN);
} else {
  const session = data.session;
  const user = session.user;
  const email = (user && user.email) || '';

  document.querySelectorAll('#who, #sessionWho, [data-anona-user]').forEach((el) => {
    el.textContent = email;
  });

  const signOut = async (e) => {
    if (e) e.preventDefault();
    try { await supabase.auth.signOut(); } catch (_) {}
    window.location.replace(LOGIN);
  };
  document.querySelectorAll('#signout, #sessionExit, [data-anona-signout]').forEach((el) => {
    el.addEventListener('click', signOut);
  });

  // Visit log — the admin "Login log" only captured PASSWORD logins, but
  // Supabase sessions persist, so returning visitors never re-typed one and
  // the log sat frozen. Record a visit when a signed-in session lands on a
  // guarded page, throttled to once per day per browser. Best-effort.
  try {
    const day = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('anona-visit-day') !== day) {
      localStorage.setItem('anona-visit-day', day);
      logLoginEvent();
    }
  } catch (_) { /* visit log is best-effort */ }

  // Analytics — only for signed-in users, so events are tied to identity.
  let track = () => {};
  try {
    const m = await import('/_auth/analytics.js');
    m.initAnalytics({ id: user.id, email });
    if (typeof m.track === 'function') track = m.track;
  } catch (_) { /* analytics is best-effort */ }

  // Terms of Use acceptance gate.
  await enforceTerms(user, session.access_token, track);
}

/* ── Terms of Use gate ───────────────────────────────────────────────── */

// Per-device cache of "already accepted version X", so repeat navigations
// don't re-query and don't flash the modal. The DB row stays authoritative;
// this is only a UX cache (cleared/bumped naturally when TERMS_VERSION changes).
const TERMS_OK_KEY = 'anona-terms-ok';

async function enforceTerms(user, accessToken, track) {
  // Fast path: this device already confirmed acceptance of the current
  // version — skip entirely. No query, no overlay, no flash.
  try {
    if (localStorage.getItem(TERMS_OK_KEY) === TERMS_VERSION) return;
  } catch (_) {}

  // Otherwise ask the server FIRST, without showing any UI — so a user who
  // has already accepted never sees the modal flash. We only build/show the
  // gate if they genuinely haven't accepted.
  let accepted = false;
  try {
    const { data: rows, error } = await supabase
      .from('terms_acceptances')
      .select('id')
      .eq('user_id', user.id)
      .eq('terms_version', TERMS_VERSION)
      .limit(1);
    if (!error && rows && rows.length) accepted = true;
  } catch (_) {
    // On a transient read error, fall through to showing the gate.
    // Accepting is idempotent, so a prior accepter just clicks once more.
  }

  if (accepted) {
    try { localStorage.setItem(TERMS_OK_KEY, TERMS_VERSION); } catch (_) {}
    return;
  }

  // Not accepted — NOW show the blocking gate.
  const gate = buildGate();
  document.body.appendChild(gate.root);
  lockScroll(true);
  gate.showTerms();

  gate.agree.addEventListener('click', async () => {
    gate.setBusy(true);
    gate.setError('');
    try {
      const res = await fetch('/.netlify/functions/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + accessToken },
        body: JSON.stringify({ terms_version: TERMS_VERSION }),
      });
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        gate.setError(out.error || 'Could not record your acceptance. Please try again.');
        gate.setBusy(false);
        return;
      }
    } catch (_) {
      gate.setError('Network error. Please try again.');
      gate.setBusy(false);
      return;
    }
    // Remember on this device so we don't re-check / re-flash on every nav.
    try { localStorage.setItem(TERMS_OK_KEY, TERMS_VERSION); } catch (_) {}
    // Analytics: no IP, no PII — just the version.
    try { track('terms_accepted', { terms_version: TERMS_VERSION }); } catch (_) {}
    teardown(gate);
  });
}

function buildGate() {
  const root = document.createElement('div');
  root.id = 'anonaTermsGate';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Terms of Use');
  root.innerHTML = `
    <style>
      #anonaTermsGate {
        position: fixed; inset: 0; z-index: 2147483647;
        background: #f6f4ef; color: #1a1a1a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; overflow: auto; -webkit-overflow-scrolling: touch;
      }
      #anonaTermsGate * { box-sizing: border-box; }
      #anonaTermsGate .tg-card {
        background: #fff; border: 1px solid rgba(0,0,0,0.10); border-radius: 12px;
        max-width: 640px; width: 100%; max-height: calc(100vh - 48px);
        display: flex; flex-direction: column; overflow: hidden;
        box-shadow: 0 18px 50px rgba(0,0,0,0.14);
      }
      #anonaTermsGate .tg-head { padding: 28px 32px 14px; border-bottom: 1px solid rgba(0,0,0,0.08); }
      #anonaTermsGate .tg-title { margin: 0; font-weight: 300; font-size: 26px; letter-spacing: -0.01em; }
      #anonaTermsGate .tg-updated {
        margin: 6px 0 0; font-family: ui-monospace, Menlo, monospace;
        font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #6b6b6b;
      }
      #anonaTermsGate .tg-body { padding: 20px 32px; overflow-y: auto; line-height: 1.6; font-size: 15px; }
      #anonaTermsGate .tg-body h3 { font-weight: 500; font-size: 15px; margin: 22px 0 6px; }
      #anonaTermsGate .tg-body p { margin: 0 0 12px; color: #2a2a2a; }
      #anonaTermsGate .tg-body .terms-lede { color: #1a1a1a; }
      #anonaTermsGate .tg-body .terms-confirm { margin-top: 18px; font-weight: 500; color: #1a1a1a; }
      #anonaTermsGate .tg-loading { padding: 36px 32px; color: #6b6b6b; font-size: 14px; }
      #anonaTermsGate .tg-foot {
        padding: 16px 32px 24px; border-top: 1px solid rgba(0,0,0,0.08);
        display: flex; align-items: center; justify-content: flex-end; gap: 16px; flex-wrap: wrap;
      }
      #anonaTermsGate .tg-error { margin: 0; margin-right: auto; color: #b00020; font-size: 13px; min-height: 16px; }
      #anonaTermsGate .tg-agree {
        appearance: none; border: 0; cursor: pointer;
        background: #BA7517; color: #fff; font: inherit; font-size: 15px;
        padding: 12px 28px; border-radius: 8px; transition: opacity 140ms ease, transform 140ms ease;
      }
      #anonaTermsGate .tg-agree:hover { opacity: 0.92; }
      #anonaTermsGate .tg-agree:active { transform: translateY(1px); }
      #anonaTermsGate .tg-agree:disabled { opacity: 0.5; cursor: progress; }
    </style>
    <div class="tg-card">
      <div class="tg-head">
        <h2 class="tg-title">Terms of Use</h2>
        <p class="tg-updated"></p>
      </div>
      <div class="tg-body"><p class="tg-loading">Loading…</p></div>
      <div class="tg-foot" style="display:none">
        <p class="tg-error" role="alert"></p>
        <button type="button" class="tg-agree">I Agree</button>
      </div>
    </div>`;

  const updated = root.querySelector('.tg-updated');
  const body = root.querySelector('.tg-body');
  const foot = root.querySelector('.tg-foot');
  const error = root.querySelector('.tg-error');
  const agree = root.querySelector('.tg-agree');
  updated.textContent = TERMS_UPDATED_LABEL || '';

  return {
    root, agree,
    showTerms() {
      body.innerHTML = TERMS_HTML;
      body.scrollTop = 0;
      foot.style.display = '';
      try { agree.focus(); } catch (_) {}
    },
    setBusy(b) { agree.disabled = !!b; agree.textContent = b ? 'Saving…' : 'I Agree'; },
    setError(msg) { error.textContent = msg || ''; },
  };
}

function teardown(gate) {
  try { gate.root.remove(); } catch (_) {}
  lockScroll(false);
}

function lockScroll(on) {
  try {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
  } catch (_) {}
}
