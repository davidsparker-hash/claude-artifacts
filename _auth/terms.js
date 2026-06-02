/* =====================================================================
 *  terms.js  —  SINGLE SOURCE for the Terms of Use  (in _auth/)
 *  ---------------------------------------------------------------------
 *  This is the one file you edit to change the Terms of Use. guard.js
 *  imports it, shows the acceptance gate on protected pages, and records
 *  the version the user accepts.
 *
 *  HOW TO UPDATE THE TERMS
 *  -----------------------
 *  1. Edit the copy inside the EDITABLE TERMS COPY block below.
 *  2. Bump TERMS_VERSION (use the date you changed it, e.g. "2026-07-15").
 *     Changing the version RE-PROMPTS everyone the next time they load a
 *     protected page — they must click "I Agree" again, and a fresh row is
 *     recorded against the new version.
 *
 *  No secrets / no PII live here — it's plain front-end content.
 * ===================================================================== */

/* Bump this whenever the terms text changes (re-prompts everyone). */
export const TERMS_VERSION = '2026-06-02';

/* Short label shown under the title. Optional — edit freely. */
export const TERMS_UPDATED_LABEL = 'Last updated: June 2, 2026';

/* =====================================================================
 *  ░░░  EDITABLE TERMS COPY — START  ░░░
 *  Replace everything between START and END with your finalized copy.
 *  It's a single HTML string; headings/paragraphs/lists are all fine.
 *  Remember to bump TERMS_VERSION above when you change this.
 * ===================================================================== */
export const TERMS_HTML = `
  <p class="terms-lede">By accessing this site and the materials available through it, you agree to the following terms. Please read them before continuing.</p>

  <h3>1. Access</h3>
  <p>This is a private site. Access is limited to people who have been granted login credentials. Your credentials are personal to you and should not be shared with anyone else.</p>

  <h3>2. Confidential material</h3>
  <p>The content on this site, including text, video, images, designs, concepts, and related materials, is confidential and proprietary. By accessing it, you agree to keep it confidential and to use it only for the purpose for which access was granted. You agree not to disclose it to anyone outside of that purpose without prior written permission.</p>

  <h3>3. No copying or redistribution</h3>
  <p>You may view the materials for your own reference. You agree not to copy, download, reproduce, distribute, publish, or share the materials, in whole or in part, by any means, without prior written permission. You also agree not to create derivative works from the materials or to use them to develop competing products or services.</p>

  <h3>4. Ownership</h3>
  <p>All materials on this site remain the property of their owner. Nothing here grants you any ownership, license, or other rights in the materials beyond permission to view them under these terms.</p>

  <h3>5. Term</h3>
  <p>Your confidentiality obligations continue even after your access to the site ends.</p>

  <h3>6. General</h3>
  <p>These terms are governed by the laws of the State of California. If any part of these terms is found unenforceable, the rest remains in effect. We may update these terms from time to time, and continued access means you accept the current version.</p>

  <p class="terms-confirm">By clicking "I Agree," you confirm that you have read and accept these Terms of Use.</p>
`;
/* =====================================================================
 *  ░░░  EDITABLE TERMS COPY — END  ░░░
 * ===================================================================== */
