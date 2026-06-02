/* =====================================================================
 *  analytics-summary  —  Netlify Function (admin-only, secure)
 *  ---------------------------------------------------------------------
 *  Powers the "Time on site" section of the admin page. Queries PostHog
 *  (via its HogQL query API) for per-user, per-page dwell time + views,
 *  so you can see who spent how long on which part of the site — without
 *  leaving your own admin page.
 *
 *  SECURITY: identical gate to send-invite — the caller must send their
 *  Supabase access token; we verify it and require profiles.is_admin
 *  server-side. The PostHog *personal* API key never touches the browser;
 *  it lives only in this function's env.
 *
 *  Env vars (Netlify → Site config → Environment variables):
 *    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY    (already set)
 *    POSTHOG_PERSONAL_API_KEY  — a PostHog *personal* API key (starts
 *        "phx_"). Different from POSTHOG_KEY (the public "phc_" ingest
 *        key). Create at: PostHog → Settings → Personal API keys, with
 *        scope "Query: Read". SECRET.
 *    POSTHOG_PROJECT_ID        — the numeric project id (PostHog →
 *        Settings → Project → Project ID).
 *    POSTHOG_API_HOST          — optional. Defaults to POSTHOG_HOST with
 *        any "i." ingestion prefix stripped (us.i.posthog.com ->
 *        us.posthog.com), which is where the query API lives.
 *    POSTHOG_HOST              — optional, used to derive the API host.
 *
 *  If the PostHog vars are not set yet, this returns { configured:false }
 *  (HTTP 200) so the admin page shows a friendly "not set up" note rather
 *  than an error — same harmless-until-configured pattern as analytics.js.
 * ===================================================================== */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: 'Server not configured (Supabase).' });

  // --- verify the caller is a signed-in admin (mirrors send-invite.js) ---
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'Not signed in.' });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData || !userData.user) return json(401, { error: 'Invalid session.' });

  const { data: profile } = await admin
    .from('profiles').select('is_admin').eq('id', userData.user.id).maybeSingle();
  if (!profile || !profile.is_admin) return json(403, { error: 'Admins only.' });

  // --- PostHog config (graceful no-op if not set yet) ---
  const phKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!phKey || !projectId) {
    return json(200, {
      configured: false,
      reason: 'PostHog reporting is not set up yet. Add POSTHOG_PERSONAL_API_KEY and '
        + 'POSTHOG_PROJECT_ID in Netlify env vars (see _auth/README-AUTH.md §5).',
    });
  }
  const apiHost = (process.env.POSTHOG_API_HOST
    || (process.env.POSTHOG_HOST || 'https://us.posthog.com').replace('://us.i.', '://us.').replace('://eu.i.', '://eu.')
  ).replace(/\/+$/, '');

  // --- window (?days=30, capped) ---
  const params = event.queryStringParameters || {};
  let days = parseInt(params.days, 10);
  if (!Number.isFinite(days) || days < 1) days = 30;
  if (days > 365) days = 365;

  // Per user (email) + per page path: dwell seconds and pageviews.
  // Dwell is summed per session as (last - first) timestamp of that path's
  // $pageview/$pageleave events — a robust page-level approximation.
  const query = `
    SELECT email, path, sum(dwell_s) AS seconds, sum(views) AS views, max(last_seen) AS last_seen
    FROM (
      SELECT
        coalesce(person.properties.email, distinct_id) AS email,
        properties.$pathname AS path,
        properties.$session_id AS sid,
        dateDiff('second', min(timestamp), max(timestamp)) AS dwell_s,
        countIf(event = '$pageview') AS views,
        max(timestamp) AS last_seen
      FROM events
      WHERE timestamp > now() - INTERVAL ${days} DAY
        AND event IN ('$pageview', '$pageleave')
        AND notEmpty(properties.$pathname)
      GROUP BY email, path, sid
    )
    GROUP BY email, path
    ORDER BY email ASC, seconds DESC
    LIMIT 2000
  `;

  let res, payload;
  try {
    res = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${phKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    });
    payload = await res.json().catch(() => ({}));
  } catch (e) {
    return json(502, { error: 'Could not reach PostHog.' });
  }

  if (!res.ok) {
    const detail = (payload && (payload.detail || payload.error)) || `HTTP ${res.status}`;
    return json(502, { error: 'PostHog query failed: ' + String(detail).slice(0, 300) });
  }

  // payload.results = [[email, path, seconds, views, last_seen], ...]
  const rows = (payload.results || []).map((r) => ({
    email: r[0],
    path: r[1],
    seconds: Number(r[2]) || 0,
    views: Number(r[3]) || 0,
    lastSeen: r[4] || null,
  }));

  return json(200, { configured: true, days, rows });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(obj),
  };
}
