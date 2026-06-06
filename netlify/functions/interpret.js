/* =====================================================================
 *  interpret  —  Netlify Function (TENET demo: script -> framework)
 *  ---------------------------------------------------------------------
 *  Powers the OPTIONAL "idea import" pre-roll on the TENET demo page.
 *  Reads a screenplay with Claude Opus 4.8 and returns a structured
 *  production framework. The investor demo's core is deterministic and
 *  does NOT depend on this — this is the on-rails intake only.
 *
 *  SECURITY: the page is gated, and this verifies the caller's Supabase
 *  access token server-side (same pattern as accept-terms.js) so the AI
 *  endpoint can't be hit anonymously and run up cost.
 *
 *  Env vars: ANTHROPIC_API_KEY  (add in Netlify),
 *            SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (already set).
 * ===================================================================== */

const { createClient } = require('@supabase/supabase-js');
const AnthropicPkg = require('@anthropic-ai/sdk');
const Anthropic = AnthropicPkg.default || AnthropicPkg;

const MODEL = 'claude-opus-4-8';

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    title: { type: 'string' },
    logline: { type: 'string' },
    characters: { type: 'array', items: { type: 'string' } },
    scenes: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          scene: { type: 'string' },
          slug: { type: 'string' },
          line: { type: 'string' },
          craft: { type: 'string', enum: ['hero', 'standard'] },
          reason: { type: 'string' },
          baseDays: { type: 'number' },
        },
        required: ['scene', 'slug', 'line', 'craft', 'reason', 'baseDays'],
      },
    },
  },
  required: ['title', 'logline', 'characters', 'scenes'],
};

const SYSTEM = `You are the reading engine inside TENET, a production pipeline that takes a script from first read to a costed plan.

Given a screenplay, break it down into a production framework. Work only from what is on the page — never invent scenes, characters, or beats that are not there.

For each scene:
- Identify the scene heading (slug) and assign a sequential scene number.
- Pull the single most evocative line (action or dialogue) that captures the scene.
- Decide craft: "hero" for scenes that carry the film's signature visual or emotional weight — spectacle, magic-hour exteriors, a pivotal story beat, the shots a film is sold on. "standard" for dialogue and coverage scenes. Most scripts are mostly standard with a few heroes; do not inflate the hero count.
- Give a short, concrete reason for the call (what in the scene earns it).
- Estimate baseDays of craft: hero shots ~2 to 3, standard ~1.

Also extract the title, a one-sentence logline, and the named speaking characters in order of first appearance.

Be precise and restrained. This breakdown drives a real budget — every call should be defensible.`;

function json(status, body) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  // --- verify the caller is signed in (page is gated; protect the AI cost) ---
  const supaUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !serviceKey) return json(500, { error: 'Server not configured (Supabase).' });
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'Not signed in.' });
  const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData || !userData.user) return json(401, { error: 'Invalid session.' });

  // --- read the script with Claude ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, { error: 'Server not configured (set ANTHROPIC_API_KEY in Netlify).' });

  let script = '';
  try { script = (JSON.parse(event.body || '{}').script || '').toString(); } catch (e) {}
  if (!script.trim()) return json(400, { error: 'Empty script.' });

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `Read this screenplay and return its production framework.\n\n${script}` }],
    });
    const textBlock = res.content.find((b) => b.type === 'text');
    if (!textBlock) throw new Error('Claude returned no text block.');
    const data = JSON.parse(textBlock.text);

    data.scenes = (data.scenes || []).map((s, i) => ({
      id: 's' + (i + 1),
      scene: String(s.scene != null ? s.scene : i + 1).padStart(2, '0'),
      slug: s.slug || '',
      line: s.line || '',
      craft: s.craft === 'hero' ? 'hero' : 'standard',
      reason: s.reason || '',
      baseDays: typeof s.baseDays === 'number' ? s.baseDays : s.craft === 'hero' ? 2.5 : 1,
    }));
    data.characters = Array.isArray(data.characters) ? data.characters : [];
    data.title = data.title || 'Untitled';
    data.logline = data.logline || '';

    return json(200, data);
  } catch (e) {
    return json(500, { error: e.message || String(e) });
  }
};
