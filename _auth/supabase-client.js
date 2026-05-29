/* =====================================================================
 *  supabase-client.js  —  shared Supabase browser client  (in _auth/)
 *  ---------------------------------------------------------------------
 *  Creates ONE Supabase client for the whole site, using the public
 *  config served by the Netlify `config` function (window.ANONA_CONFIG).
 *  Imported by auth.js (login/signup) and guard.js (protected pages).
 *
 *  Loads the Supabase library from a CDN so no build step is needed.
 *  Requires /_auth/config.js to have run first (it sets ANONA_CONFIG).
 * ===================================================================== */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.ANONA_CONFIG || {};

if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
  console.error(
    '[anona] Missing Supabase config. Make sure <script src="/_auth/config.js"></script> ' +
    'loads BEFORE this module, and that SUPABASE_URL / SUPABASE_ANON_KEY are set in Netlify.'
  );
}

export const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

/* Record a successful login. RLS lets a user insert only their own row,
 * so this is safe to call from the browser. Best-effort — never blocks. */
export async function logLoginEvent() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('login_events').insert({ user_id: user.id, email: user.email });
  } catch (e) {
    console.warn('[anona] could not record login event', e);
  }
}
