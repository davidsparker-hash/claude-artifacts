/* =====================================================================
 *  analytics.js  —  PostHog page-behavior analytics  (in _auth/)
 *  ---------------------------------------------------------------------
 *  Loaded by guard.js ONLY after a user is confirmed signed in, so every
 *  captured event is tied to a known person. Captures page views and
 *  autocaptures clicks/interactions; PostHog's dashboard then shows
 *  per-user behavior and session recordings (if enabled in PostHog).
 *
 *  Activates only when POSTHOG_KEY is set in Netlify env vars — until
 *  then this is a harmless no-op, so it's safe to ship before PostHog
 *  is configured.
 * ===================================================================== */

import posthog from 'https://esm.sh/posthog-js@1';

let started = false;

export function initAnalytics(user) {
  const cfg = window.ANONA_CONFIG || {};
  if (!cfg.posthogKey || started) return;
  started = true;

  posthog.init(cfg.posthogKey, {
    api_host: cfg.posthogHost || 'https://us.i.posthog.com',
    capture_pageview: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  });

  if (user && user.id) {
    posthog.identify(user.id, { email: user.email });
  }
}
