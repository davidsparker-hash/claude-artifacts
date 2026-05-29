/* =====================================================================
 *  admin.js  —  admin-only login log  (in _auth/)
 *  ---------------------------------------------------------------------
 *  Gates on the is_admin flag in the profiles table. Even if someone
 *  bypassed this client check, RLS on login_events only returns rows to
 *  admins — so a non-admin sees nothing either way (defense in depth).
 *
 *  Shows two views of public.login_events:
 *    • Per-user summary: login count + last seen
 *    • Recent activity:  most recent logins
 * ===================================================================== */

import { supabase } from '/_auth/supabase-client.js';

const LOGIN = '/';
const elStatus = () => document.getElementById('status');
const elSummary = () => document.getElementById('summary');
const elRecent = () => document.getElementById('recent');

function fmt(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

async function main() {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess || !sess.session) { window.location.replace(LOGIN); return; }

  const uid = sess.session.user.id;

  // Are we an admin?
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', uid)
    .maybeSingle();

  if (pErr || !profile || !profile.is_admin) {
    elStatus().textContent = 'Not authorized. This page is for admins only.';
    return;
  }

  elStatus().textContent = '';
  setupInvite();

  const { data: events, error } = await supabase
    .from('login_events')
    .select('email, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    elStatus().textContent = 'Could not load the login log: ' + error.message;
    return;
  }
  if (!events || events.length === 0) {
    elStatus().textContent = 'No logins recorded yet.';
    return;
  }

  // ---- per-user summary ----
  const byUser = new Map();
  for (const ev of events) {
    const key = ev.email || ev.user_id;
    const cur = byUser.get(key) || { email: key, count: 0, last: ev.created_at };
    cur.count += 1;
    if (new Date(ev.created_at) > new Date(cur.last)) cur.last = ev.created_at;
    byUser.set(key, cur);
  }
  const rows = [...byUser.values()].sort((a, b) => new Date(b.last) - new Date(a.last));

  const summary = elSummary();
  summary.innerHTML =
    '<tr><th>User</th><th>Logins</th><th>Last seen</th></tr>' +
    rows.map((r) =>
      `<tr><td>${escapeHtml(r.email)}</td><td>${r.count}</td><td>${escapeHtml(fmt(r.last))}</td></tr>`
    ).join('');

  // ---- recent activity (latest 100) ----
  const recent = elRecent();
  recent.innerHTML =
    '<tr><th>User</th><th>When</th></tr>' +
    events.slice(0, 100).map((ev) =>
      `<tr><td>${escapeHtml(ev.email || ev.user_id)}</td><td>${escapeHtml(fmt(ev.created_at))}</td></tr>`
    ).join('');
}

function setupInvite() {
  const box = document.getElementById('inviteBox');
  const input = document.getElementById('inviteEmail');
  const btn = document.getElementById('inviteBtn');
  const status = document.getElementById('inviteStatus');
  if (!box || !btn) return;
  box.style.display = '';

  btn.addEventListener('click', async () => {
    const email = (input.value || '').trim().toLowerCase();
    if (!email) { status.textContent = 'Enter an email first.'; input.focus(); return; }

    btn.disabled = true;
    status.textContent = 'Sending…';
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess && sess.session ? sess.session.access_token : '';
      const res = await fetch('/.netlify/functions/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ email, note: email }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        status.textContent = `✓ Invite sent to ${email}.`;
        input.value = '';
      } else if (out.code) {
        status.textContent = `Email didn't send, but the code was created — copy it: ${out.code}`;
      } else {
        status.textContent = out.error || 'Could not send the invite.';
      }
    } catch (e) {
      status.textContent = 'Something went wrong. Please try again.';
    } finally {
      btn.disabled = false;
    }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// sign-out hook (optional button on the page)
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'signout') {
    e.preventDefault();
    try { await supabase.auth.signOut(); } catch (_) {}
    window.location.replace(LOGIN);
  }
});

main();
