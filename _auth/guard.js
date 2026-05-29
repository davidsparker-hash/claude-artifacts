/* =====================================================================
 *  guard.js  —  protect a page  (in _auth/)
 *  ---------------------------------------------------------------------
 *  Drop this on any page that should require a login:
 *    <script src="/_auth/config.js"></script>
 *    <script type="module" src="/_auth/guard.js"></script>
 *
 *  It checks for a valid Supabase session. If there isn't one, it sends
 *  the visitor back to the gate (/). If there is, it fills in any
 *  "signed in as" label and wires any sign-out control.
 *
 *  Recognised, optional UI hooks (it just skips any that aren't present):
 *    user label   : #who, #sessionWho, or [data-anona-user]
 *    sign-out btn : #signout, #sessionExit, or [data-anona-signout]
 *
 *  NOTE: a tiny inline pre-check in each protected page's <head> bounces
 *  visitors with no token instantly (avoids a flash of content). This
 *  module is the authoritative check (validates/expires the session).
 * ===================================================================== */

import { supabase } from '/_auth/supabase-client.js';

const LOGIN = '/';

const { data } = await supabase.auth.getSession();

if (!data || !data.session) {
  window.location.replace(LOGIN);
} else {
  const email = (data.session.user && data.session.user.email) || '';

  document.querySelectorAll('#who, #sessionWho, [data-anona-user]').forEach((el) => {
    el.textContent = email;
  });

  const signOut = async (e) => {
    if (e) e.preventDefault();
    try { await supabase.auth.signOut(); } catch (_) {}
    window.location.replace(LOGIN);
  };
  document.querySelectorAll('#signout, #sessionExit, [data-anona-signout]').forEach((el) => {
    el.addEventListener('click', signOut);
  });

  // Analytics — only for signed-in users, so events are tied to identity.
  import('/_auth/analytics.js')
    .then((m) => m.initAnalytics({ id: data.session.user.id, email }))
    .catch(() => {});
}
