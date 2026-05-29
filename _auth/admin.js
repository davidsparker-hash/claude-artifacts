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

  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  btn.addEventListener('click', async () => {
    const raw = input.value || '';
    const all = [...new Set(raw.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))];
    const emails = all.filter((e) => re.test(e));
    const invalid = all.filter((e) => !re.test(e));

    if (!emails.length) {
      status.textContent = invalid.length ? 'No valid email addresses found.' : 'Enter at least one email.';
      input.focus();
      return;
    }

    btn.disabled = true;
    const { data: sess } = await supabase.auth.getSession();
    const token = sess && sess.session ? sess.session.access_token : '';

    let sent = 0;
    const failed = [];
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      status.textContent = `Sending ${i + 1} of ${emails.length}…`;
      try {
        const res = await fetch('/.netlify/functions/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ email, note: email }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok) sent++;
        else failed.push(`${email}: ${out.error || 'failed'}`);
      } catch (e) {
        failed.push(`${email}: network error`);
      }
    }

    let msg = `✓ Sent ${sent} of ${emails.length}.`;
    if (failed.length) msg += `\nFailed:\n` + failed.join('\n');
    if (invalid.length) msg += `\nSkipped (not valid emails): ${invalid.join(', ')}`;
    status.textContent = msg;
    if (!failed.length) input.value = '';
    btn.disabled = false;
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
