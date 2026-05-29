/* =====================================================================
 *  config  —  Netlify Function
 *  ---------------------------------------------------------------------
 *  Serves the PUBLIC front-end config as a tiny JavaScript file, read
 *  from Netlify environment variables at runtime. This is how we keep
 *  ZERO keys committed to the repo — the browser fetches them from here.
 *
 *  Only public/safe values are exposed (the anon key and PostHog project
 *  key are designed to live in the browser). The SERVICE ROLE key is
 *  NEVER included here.
 *
 *  Loaded by pages as:  <script src="/_auth/config.js"></script>
 *  (a redirect in netlify.toml maps that nice path to this function),
 *  which sets window.ANONA_CONFIG for auth.js / analytics.js to read.
 *
 *  Env vars (set in Netlify → Site settings → Environment variables):
 *    SUPABASE_URL
 *    SUPABASE_ANON_KEY
 *    POSTHOG_KEY    (optional, added in the PostHog step)
 *    POSTHOG_HOST   (optional, defaults to US cloud)
 * ===================================================================== */

exports.handler = async () => {
  const cfg = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    posthogKey: process.env.POSTHOG_KEY || '',
    posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
  };

  const js = 'window.ANONA_CONFIG = ' + JSON.stringify(cfg) + ';';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      // cache briefly so we don't hit the function on every page nav
      'Cache-Control': 'public, max-age=300',
    },
    body: js,
  };
};
