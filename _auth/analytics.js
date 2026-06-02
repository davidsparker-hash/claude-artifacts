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
    // Record when a user LEAVES a page too, so "time on page" is measured
    // accurately (the admin "Time on site" report derives dwell time from
    // the gap between $pageview and $pageleave within a session).
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  });

  if (user && user.id) {
    posthog.identify(user.id, { email: user.email });
  }
}

/* Fire a custom event (e.g. "terms_accepted"). No-op until analytics is
 * initialized. Keep PROPS free of PII — pass only safe values like a
 * version string. */
export function track(eventName, props) {
  if (!started) return;
  try { posthog.capture(eventName, props || {}); } catch (_) {}
}
