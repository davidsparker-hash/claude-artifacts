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

  // ---- time-on-site (PostHog) ----
  setupBehavior();
}

/* ── Time on site: per-user, per-page dwell from PostHog ──────────────── */
let behaviorDays = 30;

function setupBehavior() {
  const range = document.getElementById('range');
  if (range) {
    range.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-days]');
      if (!btn) return;
      behaviorDays = parseInt(btn.dataset.days, 10) || 30;
      [...range.querySelectorAll('button')].forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn)));
      loadBehavior();
    });
  }
  loadBehavior();
}

function toggleBehaviorTables(show) {
  ['rollupHead', 'rollupTable', 'byUserHead', 'behaviorTable'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  });
}

async function loadBehavior() {
  const body = document.getElementById('behavior');
  const rollup = document.getElementById('rollup');
  const note = document.getElementById('behaviorNote');
  if (!body) return;
  body.innerHTML = '';
  if (rollup) rollup.innerHTML = '';
  toggleBehaviorTables(false);
  note.textContent = 'Loading…';

  const { data: sess } = await supabase.auth.getSession();
  const token = sess && sess.session ? sess.session.access_token : '';

  let out;
  try {
    const res = await fetch('/.netlify/functions/analytics-summary?days=' + behaviorDays, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    out = await res.json().catch(() => ({}));
    if (!res.ok) { note.textContent = out.error || 'Could not load analytics.'; return; }
  } catch (e) {
    note.textContent = 'Could not reach the analytics service.';
    return;
  }

  if (out.configured === false) { note.textContent = out.reason || 'PostHog reporting is not set up yet.'; return; }
  if (!out.rows || !out.rows.length) { note.textContent = `No page activity recorded in the last ${behaviorDays} days.`; return; }

  // group rows by user, and roll up by section (page) across all users
  const byUser = new Map();
  const bySection = new Map();
  for (const r of out.rows) {
    const u = byUser.get(r.email) || { email: r.email, total: 0, pages: [] };
    u.total += r.seconds;
    u.pages.push(r);
    byUser.set(r.email, u);

    const label = pageLabel(r.path);
    const s = bySection.get(label) || { label, seconds: 0, views: 0, visitors: new Set() };
    s.seconds += r.seconds;
    s.views += r.views;
    if (r.email) s.visitors.add(r.email);
    bySection.set(label, s);
  }
  const users = [...byUser.values()].sort((a, b) => b.total - a.total);
  const sections = [...bySection.values()].sort((a, b) => b.seconds - a.seconds);

  note.textContent = '';
  toggleBehaviorTables(true);

  // ---- most-viewed sections (rollup across all users) ----
  const rollup = document.getElementById('rollup');
  if (rollup) {
    rollup.innerHTML = sections.map((s) =>
      `<tr>
        <td class="lbl">${escapeHtml(s.label)}</td>
        <td class="num">${escapeHtml(fmtDur(s.seconds))}</td>
        <td class="num">${s.views}</td>
        <td class="num">${s.visitors.size}</td>
      </tr>`
    ).join('');
  }

  // ---- by user ----
  body.innerHTML = users.map((u) => {
    const pages = u.pages
      .sort((a, b) => b.seconds - a.seconds)
      .map((p) =>
        `<li><span class="lbl">${escapeHtml(pageLabel(p.path))}</span>` +
        `<span class="num">${escapeHtml(fmtDur(p.seconds))} · ${p.views}×</span></li>`
      ).join('');
    return `<tr>
      <td class="usr">${escapeHtml(u.email)}</td>
      <td><ul class="pages">${pages}</ul></td>
      <td class="total">${escapeHtml(fmtDur(u.total))}</td>
    </tr>`;
  }).join('');
}

// Map a URL path to a friendly section name.
function pageLabel(path) {
  if (!path) return '(unknown)';
  let p = path;
  try { p = decodeURIComponent(path); } catch (_) {}
  const map = {
    '/': 'Login / Home',
    '/index.html': 'Login / Home',
    '/chooser.html': 'Chooser',
    '/ANONA_seed_plan.html': 'Seed Investment Plan',
    '/TENET First Experience.html': 'TENET First Experience',
    '/ANONA_investor_deck/ANONA Investor Deck.html': 'ANONA Investor Deck',
    '/TENET_product_deck/TENET Product Deck.html': 'TENET Product Deck',
    '/_auth/admin.html': 'Admin',
  };
  if (map[p]) return map[p];
  // fall back to the file name without extension
  const name = p.split('/').filter(Boolean).pop() || p;
  return name.replace(/\.html$/i, '');
}

// Seconds -> "1h 4m" / "3m 12s" / "45s".
function fmtDur(s) {
  s = Math.round(Number(s) || 0);
  if (s < 60) return s + 's';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
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
