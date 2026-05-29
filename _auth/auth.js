/* =====================================================================
 *  auth.js  —  login + invite-gated signup controller  (in _auth/)
 *  ---------------------------------------------------------------------
 *  Drives the gate page (index.html). Two modes:
 *    • Sign in  → Supabase email + password
 *    • Create account → posts email + invite code + password to the
 *      secure Netlify function, which validates the code server-side,
 *      then signs the new user in.
 *
 *  This file is referenced by index.html as:
 *    <script src="/_auth/config.js"></script>
 *    <script type="module" src="/_auth/auth.js"></script>
 *  No auth logic lives in the design page itself.
 *
 *  Expected element IDs on the page:
 *    #gateForm  #email  #password  #invite  #inviteField
 *    #err  #enterBtn  #btnLabel  #modeToggle  #gateTitle
 * ===================================================================== */

import { supabase, logLoginEvent } from '/_auth/supabase-client.js';

const DEST = '/chooser.html';

const form       = document.getElementById('gateForm');
const emailEl    = document.getElementById('email');
const pwEl       = document.getElementById('password');
const inviteEl   = document.getElementById('invite');
const inviteWrap = document.getElementById('inviteField');
const errEl      = document.getElementById('err');
const btn        = document.getElementById('enterBtn');
const btnLabel   = document.getElementById('btnLabel');
const toggle     = document.getElementById('modeToggle');
const titleEl    = document.getElementById('gateTitle') || document.getElementById('formTitle');
const kickerEl   = document.getElementById('formKicker');
const leadEl     = document.getElementById('toggleLead');

let mode = 'login'; // 'login' | 'signup'

// Already signed in? Skip straight to the app.
supabase.auth.getSession().then(({ data }) => {
  if (data && data.session) window.location.replace(DEST);
});

function showError(msg) { if (errEl) errEl.textContent = msg; }
function clearError()   { if (errEl) errEl.innerHTML = '&nbsp;'; }

function setMode(next) {
  mode = next;
  const signup = mode === 'signup';
  if (inviteWrap) {
    inviteWrap.classList.toggle('hide', !signup); // works with the design's .hide class
    inviteWrap.style.display = signup ? 'flex' : 'none'; // and as a fallback
  }
  if (inviteEl)   inviteEl.required = signup;
  if (titleEl)    titleEl.textContent = signup ? 'Create your account.' : 'Sign in to view the preview.';
  if (kickerEl)   kickerEl.textContent = signup ? 'Request access' : 'Access';
  if (btnLabel)   btnLabel.textContent = signup ? 'Create account' : 'Enter';
  if (leadEl)     leadEl.textContent = signup ? 'Already have access?' : 'Have an invite code?';
  if (toggle)     toggle.textContent = signup ? 'Sign in' : 'Create account';
  clearError();
}

if (toggle) {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    setMode(mode === 'login' ? 'signup' : 'login');
  });
}

[emailEl, pwEl, inviteEl].forEach((el) => el && el.addEventListener('input', clearError));

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const email = (emailEl.value || '').trim().toLowerCase();
    const password = pwEl.value || '';
    const code = inviteEl ? (inviteEl.value || '').trim() : '';

    if (!email)    { showError('Email required.'); emailEl.focus(); return; }
    if (!password) { showError('Password required.'); pwEl.focus(); return; }
    if (mode === 'signup' && !code) { showError('Invite code required.'); inviteEl.focus(); return; }

    btn.disabled = true;
    try {
      if (mode === 'signup') {
        const res = await fetch('/.netlify/functions/redeem-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code, password }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) {
          showError(out.error || 'Could not create your account.');
          btn.disabled = false;
          return;
        }
        // account created server-side — fall through to sign in
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showError(
          mode === 'signup'
            ? 'Account created, but automatic sign-in failed. Try signing in.'
            : 'Email or password is incorrect.'
        );
        btn.disabled = false;
        return;
      }

      await logLoginEvent();
      window.location.assign(DEST);
    } catch (err) {
      console.error(err);
      showError('Something went wrong. Please try again.');
      btn.disabled = false;
    }
  });
}

setMode('login');
