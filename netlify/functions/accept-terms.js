/* =====================================================================
 *  accept-terms  —  Netlify Function (records Terms of Use acceptance)
 *  ---------------------------------------------------------------------
 *  Called by guard.js when a signed-in user clicks "I Agree". Records one
 *  row in public.terms_acceptances with their user id, the terms version,
 *  and — crucially — the IP address captured SERVER-SIDE from the request
 *  headers. The client never sends its own IP, so it can't be spoofed.
 *
 *  SECURITY: the caller must send their Supabase access token; we verify
 *  it server-side and only record an acceptance for that authenticated
 *  user. The write uses the service-role key (bypasses RLS) so the IP is
 *  set by us, not the browser.
 *
 *  Idempotent: the UNIQUE (user_id, terms_version) constraint + upsert
 *  mean re-clicking "I Agree" for the same version is a harmless no-op.
 *
 *  Env vars (already set): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * ===================================================================== */

const { createClient } = require('@supabase/supabase-js');

// Versions look like a date stamp, e.g. "2026-06-02".
const VERSION_RE = /^\d{4}-\d{2}-\d{2}$/;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: 'Server not configured (Supabase).' });

  // --- verify the caller is signed in ---
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'Not signed in.' });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData || !userData.user) return json(401, { error: 'Invalid session.' });

  // --- input: terms_version (validated; never the IP) ---
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request.' }); }
  const termsVersion = String(body.terms_version || '').trim();
  if (!VERSION_RE.test(termsVersion)) return json(400, { error: 'Invalid terms version.' });

  // --- capture the IP SERVER-SIDE (do not trust any client-sent value) ---
  const h = event.headers || {};
  const ip =
    h['x-nf-client-connection-ip'] ||
    (h['x-forwarded-for'] || '').split(',')[0].trim() ||
    h['client-ip'] ||
    null;

  // --- record acceptance (idempotent on user_id + terms_version) ---
  const { error: insErr } = await admin
    .from('terms_acceptances')
    .upsert(
      { user_id: userData.user.id, terms_version: termsVersion, ip_address: ip },
      { onConflict: 'user_id,terms_version', ignoreDuplicates: true }
    );

  if (insErr) return json(500, { error: 'Could not record acceptance.' });

  return json(200, { ok: true });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(obj),
  };
}
