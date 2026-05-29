/* =====================================================================
 *  redeem-invite  —  Netlify Function (server-side, secure)
 *  ---------------------------------------------------------------------
 *  This is the ONLY place an invite code is ever checked. It runs on
 *  Netlify's servers using the Supabase SERVICE ROLE key, so the logic
 *  cannot be read or bypassed from the browser.
 *
 *  Flow:
 *    1. Atomically "reserve" the code (only works if it exists & is unused).
 *    2. Create the Supabase Auth user with the chosen password.
 *    3. Stamp who claimed the code.
 *    If user creation fails, the reservation is rolled back.
 *
 *  Env vars required (set in Netlify → Site settings → Environment variables):
 *    SUPABASE_URL
 *    SUPABASE_SERVICE_ROLE_KEY   (secret — never goes in the browser)
 * ===================================================================== */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Bad request.' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  const password = String(body.password || '');

  if (!email || !code || !password) {
    return json(400, { error: 'Email, invite code, and password are all required.' });
  }
  if (password.length < 8) {
    return json(400, { error: 'Password must be at least 8 characters.' });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return json(500, { error: 'Server is not configured yet.' });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Atomically reserve the code. The .eq('claimed', false) guard means
  //    two people racing on the same code can't both succeed.
  const { data: reserved, error: reserveErr } = await admin
    .from('invite_codes')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('code', code)
    .eq('claimed', false)
    .select('code')
    .maybeSingle();

  if (reserveErr) {
    return json(500, { error: 'Could not verify the invite code. Please try again.' });
  }
  if (!reserved) {
    return json(403, { error: 'That invite code is invalid or has already been used.' });
  }

  // 2. Create the user. email_confirm:true means they can sign in immediately.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !created || !created.user) {
    // Roll back the reservation so a failed signup doesn't burn the code.
    await admin
      .from('invite_codes')
      .update({ claimed: false, claimed_at: null })
      .eq('code', code);

    const already = createErr && /already.*(registered|exists)/i.test(createErr.message || '');
    return json(400, {
      error: already
        ? 'An account with that email already exists — try signing in instead.'
        : 'Could not create your account. Please try again.',
    });
  }

  // 3. Record who claimed the code.
  await admin
    .from('invite_codes')
    .update({ claimed_by: created.user.id })
    .eq('code', code);

  return json(200, { ok: true });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
