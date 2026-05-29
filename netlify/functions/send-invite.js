/* =====================================================================
 *  send-invite  —  Netlify Function (admin-only, secure)
 *  ---------------------------------------------------------------------
 *  Called from the admin page. Generates a one-time invite code, stores
 *  it, and emails it to the invitee via Resend.
 *
 *  SECURITY: the caller must send their Supabase access token. The
 *  function verifies it and checks profiles.is_admin server-side, so
 *  only YOU can generate/send invites — never a normal logged-in user.
 *
 *  Env vars (Netlify → Site config → Environment variables):
 *    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (already set)
 *    RESEND_API_KEY      — from resend.com  (secret)
 *    INVITE_FROM_EMAIL   — verified sender, e.g. "Anona <invites@anona.tv>"
 *    SITE_URL            — optional, defaults to https://anona.tv
 * ===================================================================== */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.INVITE_FROM_EMAIL;
  const siteUrl = process.env.SITE_URL || 'https://anona.tv';

  if (!url || !serviceKey) return json(500, { error: 'Server not configured (Supabase).' });
  const missing = [];
  if (!resendKey) missing.push('RESEND_API_KEY');
  if (!fromEmail) missing.push('INVITE_FROM_EMAIL');
  if (missing.length) return json(500, { error: 'Email not configured — missing env var(s): ' + missing.join(', ') });

  // --- verify the caller is a signed-in admin ---
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'Not signed in.' });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData || !userData.user) return json(401, { error: 'Invalid session.' });

  const { data: profile } = await admin
    .from('profiles').select('is_admin').eq('id', userData.user.id).maybeSingle();
  if (!profile || !profile.is_admin) return json(403, { error: 'Admins only.' });

  // --- input ---
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request.' }); }
  const email = String(body.email || '').trim().toLowerCase();
  const note = String(body.note || email).trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { error: 'Please enter a valid email address.' });
  }

  // --- generate + store the code ---
  const code = crypto.randomUUID().replace(/-/g, '');
  const { error: insErr } = await admin.from('invite_codes').insert({ code, note });
  if (insErr) return json(500, { error: 'Could not create the invite code.' });

  // --- send the email via Resend ---
  const subject = 'Your access to anona.tv';
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">
      <p>Hi,</p>
      <p>You're invited to the Anona private preview. To set up your account:</p>
      <ol>
        <li>Go to <a href="${siteUrl}">${siteUrl}</a></li>
        <li>Click <strong>"Have an invite code? Create account"</strong></li>
        <li>Enter your email, the code below, and choose a password.</li>
      </ol>
      <p style="font-size:18px;margin:24px 0">
        Invite code: <strong style="font-family:ui-monospace,Menlo,monospace">${code}</strong>
      </p>
      <p style="color:#6b6b6b;font-size:13px">This code works once and is just for you.</p>
    </div>`;

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [email], subject, html }),
    });
  } catch (e) {
    // code already created — let the admin know they can still copy it manually
    return json(502, { error: 'Code was created but the email failed to send.', code });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return json(502, { error: 'Code created, but email sending failed: ' + detail.slice(0, 200), code });
  }

  return json(200, { ok: true, code });
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
