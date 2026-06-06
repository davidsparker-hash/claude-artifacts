/* ============================================================
   TENET — Creative Portal data model (v3: the Decision core).
   ------------------------------------------------------------
   Everything attaches to one Decision. Assets are evidence,
   Approvals are authority, CostDrivers are consequence — the
   bridge into the v2 money graph (FRAMEWORK / PROD).

   Governing principle, enforced structurally:
   • No field stores a system-generated creative judgment / score / rank.
   • AI output is only ever an Asset with origin HUMAN_DIRECTED_GENERATION.
   • The role enum holds people only — the AI can never hold a verb.
   • Analysis describes present state; it never advises.
   ============================================================ */
window.CREATIVE = (function () {
  var F = window.FLOW, FW = window.FRAMEWORK;

  function money(n) { return '$' + Math.round(Math.abs(n)).toLocaleString('en-US'); }
  function signed(n) { return (n < 0 ? '\u2212' : '+') + money(n); }

  var project = { title: F.TITLE, logline: F.LOGLINE, format: ':30 Brand Film', code: '#17433',
    director: 'D. Parker', cd: 'A. Wells', client: 'H&W', today: 'Jun 5, 2026' };

  // ── The five master questions (the Master Model spine) ──────
  var MASTER = {
    WHY:        { label: 'Why',        gloss: 'Purpose' },
    WHAT:       { label: 'What',       gloss: 'Story' },
    FEEL:       { label: 'Feel',       gloss: 'Emotion' },
    HOW:        { label: 'How',        gloss: 'Craft' },
    EXPERIENCE: { label: 'Experience', gloss: 'Delivery' },
  };

  // ── The cost ripple — one Decision, two lenses ──────────────
  // The apartment night exterior is the live cross-vertical link:
  // the FEEL decision carries a CostDriver; flip it and the
  // producer's forecast/variance move. Computed against FRAMEWORK,
  // never stored as truth.
  var S0 = F.DEFAULT_STATE;
  var stateNight = { mode: S0.mode, tod: { s4: 'NIGHT' } };
  var stateDay = { mode: S0.mode, tod: { s4: 'DAY' } };
  var tNight = FW ? FW.finTotals(stateNight) : { forecast: 472000, variance: -28000, approved: 500000 };
  var tDay = FW ? FW.finTotals(stateDay) : { forecast: 454000, variance: -46000, approved: 500000 };
  var ripple = {
    approved: tNight.approved,
    night: { tod: 'NIGHT', forecast: tNight.forecast, variance: tNight.variance },
    day:   { tod: 'DAY',   forecast: tDay.forecast,   variance: tDay.variance },
    otDelta: tNight.forecast - tDay.forecast,   // the cost the FEEL choice carries
  };

  // ── Decisions (the keystone) ────────────────────────────────
  // facets = the same decision re-summarized in each role's language.
  var decisions = [
    { id: 'd1', master: 'WHY', title: 'Three-part structure', status: 'DECIDED',
      desc: 'The Old Way / The Shift / The Promise. The film argues by contrast.',
      by: 'Director',
      facets: { Director: ['Structure', 'Rhythm'], Producer: ['Locked scope'] },
      assets: ['a-scr4', 'a-scr3'],
      approvals: [
        { role: 'DIRECTOR', verb: 'DECIDE', state: 'GRANTED', who: 'D. Parker', when: 'Mar 6' },
        { role: 'CREATIVE_DIRECTOR', verb: 'APPROVE', state: 'GRANTED', who: 'A. Wells', when: 'Mar 7' },
      ], cost: null },

    { id: 'd2', master: 'WHAT', title: 'The ending beat', status: 'OPEN',
      desc: 'How the promise lands. The final image is still soft — the room has not converged.',
      by: 'Director',
      facets: { Director: ['Emotion', 'World'], Producer: ['Risk', 'Reshoot exposure'] },
      assets: ['a-bd-end1', 'a-bd-end2', 'a-anim1'],
      approvals: [
        { role: 'DIRECTOR', verb: 'PROPOSE', state: 'PENDING', who: 'D. Parker', when: '\u2014' },
      ], cost: null, flag: 'Client risk: ending beat still soft' },

    { id: 'd3', master: 'FEEL', title: 'Apartment \u2014 night exterior vs. day', status: 'PROPOSED',
      desc: 'The gift scene. Night sells the intimacy; day clears the overtime premium.',
      by: 'Director',
      facets: { Director: ['World', 'Frame', 'Mood'], Producer: ['Money', 'Time'] },
      assets: ['a-bd-apt1', 'a-bd-apt2', 'a-ref-apt'],
      approvals: [
        { role: 'DIRECTOR', verb: 'PROPOSE', state: 'GRANTED', who: 'D. Parker', when: 'May 28' },
        { role: 'PRODUCER', verb: 'DECIDE', state: 'PENDING', who: 'M. Hall', when: '\u2014' },
      ],
      cost: { driver: 'Night exterior \u2014 crew OT', amt: ripple.otDelta, removable: true, ripple: true } },

    { id: 'd4', master: 'FEEL', title: 'Hold the beach for golden hour', status: 'PROPOSED',
      desc: 'The closing image. Golden hour is a half-day of OT but it sells the ending.',
      by: 'Director',
      facets: { Director: ['Emotion', 'Frame'], Producer: ['Money'] },
      assets: ['a-bd-beach1', 'a-ref-beach'],
      approvals: [
        { role: 'DIRECTOR', verb: 'PROPOSE', state: 'GRANTED', who: 'D. Parker', when: 'May 30' },
        { role: 'PRODUCER', verb: 'DECIDE', state: 'PENDING', who: 'M. Hall', when: '\u2014' },
      ],
      cost: { driver: 'Golden-hour half-day OT', amt: 18000, removable: true } },

    { id: 'd5', master: 'HOW', title: 'Opening technocrane move', status: 'DECIDED',
      desc: 'Booms up the face of the building into Times Square. Sets the scale.',
      by: 'Director',
      facets: { Director: ['Frame', 'Scale'], Producer: ['Money', 'Risk'] },
      assets: ['a-bd-open1'],
      approvals: [
        { role: 'DIRECTOR', verb: 'DECIDE', state: 'GRANTED', who: 'D. Parker', when: 'Apr 2' },
        { role: 'CINEMATOGRAPHER', verb: 'APPROVE', state: 'GRANTED', who: 'L. Cho', when: 'Apr 3' },
      ],
      cost: { driver: 'Technocrane package', amt: 16000, removable: true } },

    { id: 'd6', master: 'FEEL', title: 'Cast the lead \u2014 Mara', status: 'DECIDED',
      desc: 'The face the whole film rests on. Carries the watch, carries the day.',
      by: 'Director',
      facets: { Director: ['Character', 'Emotion'], Producer: ['Money'] },
      assets: ['a-ref-cast'],
      approvals: [
        { role: 'DIRECTOR', verb: 'DECIDE', state: 'GRANTED', who: 'D. Parker', when: 'Mar 24' },
        { role: 'CREATIVE_DIRECTOR', verb: 'APPROVE', state: 'GRANTED', who: 'A. Wells', when: 'Mar 25' },
      ],
      cost: { driver: 'O/C principal buyout \u2014 2yr', amt: 38000, removable: false } },

    { id: 'd7', master: 'EXPERIENCE', title: 'Approve final creative', status: 'PROPOSED',
      desc: 'The gate before the bid locks. The client sees the idea before a frame is spent.',
      by: 'Creative Director',
      facets: { Director: ['\u2014'], Producer: ['Lock the bid'] },
      assets: ['a-scr4', 'a-anim1'],
      approvals: [
        { role: 'CREATIVE_DIRECTOR', verb: 'PROPOSE', state: 'GRANTED', who: 'A. Wells', when: 'Jun 4' },
        { role: 'CLIENT', verb: 'APPROVE', state: 'PENDING', who: 'S. Metnick', when: '\u2014' },
      ], cost: null },
  ];

  // ── Assets (the evidence) ───────────────────────────────────
  // origin: HUMAN_UPLOAD | HUMAN_DIRECTED_GENERATION (no autonomous origin).
  var assets = [
    { id: 'a-scr4', d: 'd1', type: 'SCRIPT', origin: 'HUMAN_UPLOAD', v: 4, parent: 'a-scr3',
      label: 'A_Brief_History_v3.fdx', by: 'Director', state: 'GRANTED', scene: '\u2014' },
    { id: 'a-scr3', d: 'd1', type: 'SCRIPT', origin: 'HUMAN_UPLOAD', v: 3, parent: 'a-scr2',
      label: 'A_Brief_History_v2.fdx', by: 'Director', state: 'GRANTED', scene: '\u2014' },
    { id: 'a-scr2', d: 'd1', type: 'SCRIPT', origin: 'HUMAN_UPLOAD', v: 2, parent: 'a-scr1',
      label: 'A_Brief_History_v1b.fdx', by: 'Writer', state: 'GRANTED', scene: '\u2014' },
    { id: 'a-scr1', d: 'd1', type: 'SCRIPT', origin: 'HUMAN_UPLOAD', v: 1, parent: null,
      label: 'A_Brief_History_rough.fdx', by: 'Writer', state: 'GRANTED', scene: '\u2014' },

    { id: 'a-bd-open1', d: 'd5', type: 'BOARD', origin: 'HUMAN_DIRECTED_GENERATION', v: 2, parent: null,
      label: 'Opening crane \u2014 Times Sq', by: 'Director', state: 'GRANTED', scene: 'Rooftop',
      prompt: 'boom up 80th-floor glass into Times Square, dawn' },
    { id: 'a-bd-apt1', d: 'd3', type: 'FRAME', origin: 'HUMAN_DIRECTED_GENERATION', v: 3, parent: 'a-bd-apt0',
      label: 'Apartment \u2014 night, the gift', by: 'Director', state: 'PENDING', scene: 'Apartment',
      prompt: 'warm practical interior, night, two figures, intimate' },
    { id: 'a-bd-apt2', d: 'd3', type: 'FRAME', origin: 'HUMAN_DIRECTED_GENERATION', v: 1, parent: null,
      label: 'Apartment \u2014 day alt', by: 'Director', state: 'PENDING', scene: 'Apartment',
      prompt: 'soft daylight interior, two figures, window light' },
    { id: 'a-ref-apt', d: 'd3', type: 'REFERENCE', origin: 'HUMAN_UPLOAD', v: 1, parent: null,
      label: 'Lighting ref \u2014 In the Mood for Love', by: 'Cinematographer', state: 'GRANTED', scene: 'Apartment' },
    { id: 'a-bd-beach1', d: 'd4', type: 'FRAME', origin: 'HUMAN_DIRECTED_GENERATION', v: 2, parent: null,
      label: 'Beach \u2014 golden hour close', by: 'Director', state: 'PENDING', scene: 'Beach',
      prompt: 'wide beach, low sun, single figure at the shore' },
    { id: 'a-ref-beach', d: 'd4', type: 'MOODBOARD', origin: 'HUMAN_UPLOAD', v: 1, parent: null,
      label: 'Endings moodboard', by: 'Director', state: 'GRANTED', scene: 'Beach' },
    { id: 'a-bd-end1', d: 'd2', type: 'FRAME', origin: 'HUMAN_DIRECTED_GENERATION', v: 4, parent: 'a-bd-end0',
      label: 'Final image \u2014 option A', by: 'Director', state: 'PENDING', scene: 'Beach',
      prompt: 'watch face resolves to logo, warm' },
    { id: 'a-bd-end2', d: 'd2', type: 'FRAME', origin: 'HUMAN_DIRECTED_GENERATION', v: 2, parent: null,
      label: 'Final image \u2014 option B', by: 'Director', state: 'PENDING', scene: 'Studio',
      prompt: 'macro strap, light bloom, resolve' },
    { id: 'a-anim1', d: 'd2', type: 'ANIMATIC', origin: 'HUMAN_DIRECTED_GENERATION', v: 1, parent: null,
      label: 'Ending animatic \u2014 cutdown', by: 'Editor', state: 'PENDING', scene: '\u2014',
      prompt: 'assemble option A over VO, 6s' },
    { id: 'a-ref-cast', d: 'd6', type: 'REFERENCE', origin: 'HUMAN_UPLOAD', v: 1, parent: null,
      label: 'Casting selects \u2014 Mara', by: 'Director', state: 'GRANTED', scene: '\u2014' },
  ];

  // ── Script breakdown (Assets of type SCRIPT, versioned) ─────
  var scenesCount = F.SCENES.length;
  var locsCount = F.LOCS.length;
  var charsCount = F.CHARS.length;
  var scriptVersions = assets.filter(function (a) { return a.type === 'SCRIPT'; });
  var breakdown = {
    scenes: scenesCount, locations: locsCount, characters: charsCount,
    pages: 3, runtime: F.fmtClock(F.totalLength(S0)),
    scenes_list: F.SCENES.map(function (s) {
      return { n: s.n, loc: F.locName(s.locId), tod: s.tod,
        chars: s.chars.map(function (c) { return F.charName(c); }),
        dynamic: !!s.todDynamic };
    }),
  };

  // ── Boards (FRAME / BOARD / MOODBOARD / ANIMATIC for FEEL) ───
  var boards = assets.filter(function (a) {
    return ['FRAME', 'BOARD', 'MOODBOARD', 'ANIMATIC'].indexOf(a.type) >= 0;
  });

  // ── Edit — sequence + state-describing analysis (never advice) ─
  var seq = F.allShots(S0).map(function (sh, i) {
    var scene = F.SCENES.find(function (s) { return s.id === sh.sceneId; });
    return { n: i + 1, loc: F.locName(sh.locId), desc: sh.desc, dur: sh.dur,
      tod: F.todOf(scene, S0) };
  });
  var beats = [
    { key: 'open', t: 0.22 }, { key: 'setup', t: 0.42 }, { key: 'turn', t: 0.24 },
    { key: 'build', t: 0.52 }, { key: 'peak', t: 0.92 }, { key: 'land', t: 0.50 },
  ];
  // Descriptions of present state only. No "needs", "should", "better".
  var analysis = [
    { kind: 'Runtime', text: F.fmtClock(F.totalLength(S0)) + ' assembled across ' + seq.length + ' shots.' },
    { kind: 'Pacing', text: 'Tension peaks at the ending beat; the turn at part two is the shortest hold.' },
    { kind: 'Coverage', text: 'Scene 04 (Apartment) has no coverage of the hero product.' },
    { kind: 'Coverage', text: 'Studio macro carries the only logo resolve in the cut.' },
    { kind: 'VO', text: 'Six voiceover lines present; longest gap sits over the downtown sequence.' },
  ];

  // ── Approvals / Collaboration (authority across roles) ──────
  var approvals = [];
  decisions.forEach(function (d) {
    d.approvals.forEach(function (ap) {
      approvals.push({ decision: d.title, decision_id: d.id, master: d.master,
        role: ap.role, verb: ap.verb, state: ap.state, who: ap.who, when: ap.when });
    });
  });
  var comments = [
    { who: 'M. Hall', role: 'PRODUCER', when: '2h', decision: 'Apartment \u2014 night exterior vs. day',
      text: 'Night is +$18K of crew OT. Day clears it. Your call on the room \u2014 I just hold the line.' },
    { who: 'A. Wells', role: 'CREATIVE_DIRECTOR', when: '5h', decision: 'The ending beat',
      text: 'Option A lands the watch better. Want the client eyes before we lock anything.' },
    { who: 'L. Cho', role: 'CINEMATOGRAPHER', when: '1d', decision: 'Opening technocrane move',
      text: 'Crane is booked. Dawn window is tight but the move is worth it.' },
  ];

  // role display
  var ROLE_LABEL = {
    CLIENT: 'Client', CREATIVE_DIRECTOR: 'Creative Dir.', DIRECTOR: 'Director',
    PRODUCER: 'Producer', EDITOR: 'Editor', CINEMATOGRAPHER: 'DP',
    PRODUCTION_DESIGNER: 'Prod. Designer', VFX_SUPERVISOR: 'VFX Sup.', WRITER: 'Writer',
  };

  function decAssets(d) { return assets.filter(function (a) { return a.d === d.id; }); }

  // ── Writers Room — script versions, scene-by-scene, timeline-linked ─
  // Sections are the production scenes (so selecting one highlights its
  // clip on the cut). Each version reads a section from `base`, unless it
  // overrides the wording, or omits the scene entirely (not yet written).
  var VO = {
    s1: 'Every morning, the same quiet promise.',
    s2: 'Someone made this, by hand.',
    s3: 'The world hurries. You don\u2019t have to.',
    s4: 'Some gifts are really just time.',
    s5: null,
    s6: 'A life, held in the light.',
  };
  var wSections = F.SCENES.map(function (s) {
    var loc = F.LOCS.find(function (l) { return l.id === s.locId; }) || {};
    var slug = (loc.kind || 'EXT') + '. ' + F.locName(s.locId).toUpperCase() + (s.tod && s.tod !== '\u2014' ? ' \u2014 ' + s.tod : '');
    return { sceneId: s.id, n: s.n, loc: F.locName(s.locId), slug: slug,
      dur: s.shots.reduce(function (a, sh) { return a + sh.dur; }, 0) };
  });
  var wBase = {};
  F.SCENES.forEach(function (s) {
    var lines = s.action.map(function (a) { return { k: 'action', text: a.text }; });
    if (VO[s.id]) lines.push({ k: 'vo', text: VO[s.id] });
    wBase[s.id] = lines;
  });
  // earlier-draft wording (v2) and the rough pass (v1)
  var wOverrides = {
    v2: {
      s1: [{ k: 'action', text: 'A city still blue with sleep. MARA stands at the rail.' }, { k: 'action', text: 'A watch catches the light.' }, { k: 'vo', text: 'Each morning, the same promise.' }],
      s4: [{ k: 'action', text: 'THEO fastens the watch on MARA\u2019s wrist.' }, { k: 'action', text: 'A held look.' }, { k: 'vo', text: 'A gift of time.' }],
      s6: [{ k: 'action', text: 'MARA at the shoreline. The watch, the light.' }, { k: 'vo', text: 'A life in the light.' }],
    },
    v1: {
      s1: [{ k: 'action', text: 'Rooftop. A woman, a watch, first light.' }],
      s3: [{ k: 'action', text: 'She walks the city.' }],
      s4: [{ k: 'action', text: 'He gives her the watch.' }],
    },
  };
  var writers = {
    versions: [
      { id: 'v4', tag: 'Current', file: 'A_Brief_History_v3.fdx',   date: 'Jun 4',  by: 'Director', scenes: ['s1', 's2', 's3', 's4', 's5', 's6'] },
      { id: 'v3', tag: 'v3',      file: 'A_Brief_History_v2.fdx',   date: 'May 28', by: 'Director', scenes: ['s1', 's2', 's3', 's4', 's6'] },
      { id: 'v2', tag: 'v2',      file: 'A_Brief_History_v1b.fdx',  date: 'May 21', by: 'Writer',   scenes: ['s1', 's2', 's3', 's4', 's6'] },
      { id: 'v1', tag: 'v1',      file: 'A_Brief_History_rough.fdx', date: 'May 14', by: 'Writer',   scenes: ['s1', 's3', 's4'] },
    ],
    sections: wSections,
    // resolve a version's lines for a scene, or null if not in that version
    resolve: function (versionId, sceneId) {
      var v = writers.versions.find(function (x) { return x.id === versionId; });
      if (!v || v.scenes.indexOf(sceneId) < 0) return null;
      return (wOverrides[versionId] && wOverrides[versionId][sceneId]) || wBase[sceneId];
    },
  };

  return {
    project: project, MASTER: MASTER, decisions: decisions, assets: assets,
    breakdown: breakdown, scriptVersions: scriptVersions, boards: boards,
    seq: seq, beats: beats, analysis: analysis, writers: writers,
    approvals: approvals, comments: comments, ripple: ripple,
    ROLE_LABEL: ROLE_LABEL, decAssets: decAssets, money: money, signed: signed,
    NAV: [
      { id: 'bay',     label: 'Edit Bay',     phase: 'work' },
      { id: 'writers', label: 'Writers Room', phase: 'work' },
      { id: 'project', label: 'Project',      phase: 'graph' },
      { id: 'edit',    label: 'Edit',         phase: 'graph' },
      { id: 'assets',  label: 'Assets',       phase: 'graph' },
    ],
  };
})();
