/* ============================================================
   TENET — Client Portal data model.
   ------------------------------------------------------------
   Everything the client sees, derived from the one project:
   the :30 brand film "A Brief History of Selling Ideas".
   Budget figures reconcile to FRAMEWORK.finTotals(DEFAULT_STATE):
     Approved 500,000 · Actual 330,000 · Forecast 472,000
     Variance −28,000 (under) · Contingency 28,000 remaining.
   The Decisions engine is the centerpiece — each candidate change
   carries its real budget / schedule / resource / risk consequence.
   ============================================================ */
window.CLIENT = (function () {
  var F = window.FLOW, FW = window.FRAMEWORK;
  var S0 = F.DEFAULT_STATE;
  var T = FW.finTotals(S0);   // approved/actual/forecast/variance/reserve/drawn/contingency/directBudget

  function money(n) { return '$' + Math.round(Math.abs(n)).toLocaleString('en-US'); }
  function signed(n) { return (n < 0 ? '\u2212' : '+') + money(n); }
  function money0(n) { return (n < 0 ? '\u2212' : '') + money(n); }

  // ── Project meta ────────────────────────────────────────────
  var project = {
    title: F.TITLE,
    logline: F.LOGLINE,
    format: ':30 Brand Film',
    advertiser: 'Meridian',
    agency: 'H&W',
    code: '#17433',
    director: 'D. Parker',
    today: 'Jun 5, 2026',
  };

  // ── Status + health ─────────────────────────────────────────
  var status = {
    overall: 'On Track',          // On Track | At Risk | Delayed
    score: 82,
    health: [
      { id: 'budget',   label: 'Budget',   score: 86, state: 'Healthy',  note: 'Forecast ' + money(T.forecast) + ' against ' + money(T.approved) + ' approved.' },
      { id: 'schedule', label: 'Schedule', score: 78, state: 'On Track',  note: 'Editorial on track; picture lock waits on this review.' },
      { id: 'creative', label: 'Creative', score: 73, state: 'In Review', note: 'Latest cut with the client. Ending beat still open.' },
    ],
  };

  // ── Budget summary (reconciles to finTotals) ────────────────
  var budget = {
    approved: T.approved,
    actual: T.actual,
    forecast: T.forecast,
    variance: T.variance,          // −28,000 (under)
    contingency: T.contingency,    // 28,000
    reserve: T.reserve,            // 50,000
    // Allocation = the film's true cost centers, by forecast.
    allocation: FW.FIN_CENTERS.map(function (c) {
      return { id: c.id, name: c.name, amount: FW.finForecast(c, S0), why: c.why };
    }),
    // What changed since approval — cause, not bookkeeping.
    changed: [
      { label: 'Night exterior retained', detail: 'Apartment scene kept at night — crew overtime.', amt: 18000, when: 'Apr 9', kind: 'up' },
      { label: 'Downtown location overage', detail: 'Extended street lockup by two hours.', amt: 4000, when: 'Apr 17', kind: 'up' },
      { label: '1:1 social format added', detail: 'New deliverable approved in editorial.', amt: 6000, when: 'May 2', kind: 'up' },
    ],
    forecastBands: [
      { id: 'best',  label: 'Best case',     amount: 454000, note: 'Apartment flips to day — overtime clears.' },
      { id: 'exp',   label: 'Expected case', amount: T.forecast, note: 'Current plan, night exterior held.' },
      { id: 'worst', label: 'Worst case',    amount: 498000, note: 'Ending reshoot + full contingency draw.' },
    ],
  };

  // ── Timeline / schedule ─────────────────────────────────────
  var timeline = {
    currentPhase: 'Editorial',
    daysRemaining: 22,
    delivery: 'Jun 27, 2026',
    confidence: 'High',
    stages: [
      { id: 'creative', name: 'Creative Development', state: 'done',     range: 'Mar 3 \u2013 Mar 21' },
      { id: 'preprod',  name: 'Preproduction',        state: 'done',     range: 'Mar 24 \u2013 Apr 11' },
      { id: 'prod',     name: 'Production',           state: 'done',     range: 'Apr 14 \u2013 Apr 18' },
      { id: 'edit',     name: 'Editorial',            state: 'current',  range: 'Apr 21 \u2013 Jun 13' },
      { id: 'color',    name: 'Color',                state: 'upcoming', range: 'Jun 16 \u2013 Jun 20' },
      { id: 'audio',    name: 'Audio',                state: 'upcoming', range: 'Jun 16 \u2013 Jun 24' },
      { id: 'delivery', name: 'Delivery',             state: 'upcoming', range: 'Jun 27' },
    ],
    milestones: [
      { id: 'wrap',    name: 'Shoot wrap',     date: 'Apr 18', state: 'done' },
      { id: 'assembly',name: 'Assembly cut',   date: 'May 14', state: 'done' },
      { id: 'review',  name: 'Client review',  date: 'Jun 5',  state: 'current' },
      { id: 'lock',    name: 'Picture lock',   date: 'Jun 13', state: 'upcoming' },
      { id: 'colorrev',name: 'Color review',   date: 'Jun 19', state: 'upcoming' },
      { id: 'final',   name: 'Final delivery', date: 'Jun 27', state: 'upcoming' },
    ],
    delays: [
      { label: 'Picture lock depends on this review', detail: 'A note instead of an approval moves lock by ~3 days.', risk: 'medium' },
    ],
  };

  // ── Scope ───────────────────────────────────────────────────
  var scope = {
    original: [
      { label: 'Deliverables', value: '1 \u00d7 :30 master' },
      { label: 'Versions',     value: ':30 \u00b7 :15 cutdown' },
      { label: 'Formats',      value: '16:9 broadcast \u00b7 1:1 social' },
      { label: 'Languages',    value: 'English' },
      { label: 'Platforms',    value: 'Broadcast \u00b7 Online' },
    ],
    current: {
      approved: [':30 master (16:9)', ':15 cutdown', '1:1 social cut', 'Online master'],
      added: ['1:1 social cut'],
      removed: [],
    },
    changes: [
      { label: '1:1 social format', date: 'May 2',  cost: 6000,  days: 1, state: 'approved' },
      { label: 'Night exterior retained', date: 'Apr 9', cost: 18000, days: 0, state: 'approved' },
      { label: ':15 cutdown confirmed', date: 'Apr 2', cost: 0, days: 0, state: 'approved' },
    ],
  };

  // ── Risks (kept to four — only meaningful ones) ─────────────
  var risks = [
    { id: 'r1', type: 'Schedule', title: 'Picture lock waits on this review',
      prob: 'Medium', impact: 'Medium', owner: 'Producer',
      plan: 'Approve or send notes by Jun 9 to protect the Jun 27 delivery.' },
    { id: 'r2', type: 'Creative', title: 'Ending beat still soft',
      prob: 'Medium', impact: 'Medium', owner: 'Director',
      plan: 'Golden-hour reshoot of the beach scene is held as an option.' },
    { id: 'r3', type: 'Budget', title: 'Night overtime drawing contingency',
      prob: 'Low', impact: 'Low', owner: 'Producer',
      plan: 'Flipping the apartment scene to day clears the ' + money(18000) + ' premium.' },
    { id: 'r4', type: 'Legal', title: 'Talent usage renews in 24 months',
      prob: 'Low', impact: 'Medium', owner: 'Legal',
      plan: 'Renewal already budgeted in licensing; flag at month 20.' },
  ];

  // ── Reviews — assets, versions, feedback ────────────────────
  var reviews = {
    assets: [
      { id: 'edits',   name: 'Edits',                  count: 4, active: true },
      { id: 'boards',  name: 'Boards',                 count: 12 },
      { id: 'anim',    name: 'Animatics',              count: 3 },
      { id: 'stills',  name: 'Stills',                 count: 28 },
      { id: 'gen',     name: 'Generative explorations',count: 9 },
      { id: 'graphics',name: 'Brand assets',             count: 6 },
    ],
    cuts: [
      { id: 'v4', name: '01_BriefHistory_HD', tag: 'Latest', date: 'Jun 4', note: 'Current cut for review' },
      { id: 'v3', name: '01_BriefHistory_HD_vb3', tag: 'v3', date: 'May 28', note: 'Revised VO timing' },
      { id: 'v2', name: '01_BriefHistory_HD_a2', tag: 'v2', date: 'May 21', note: 'Alt opening beat' },
      { id: 'v1', name: '01_BriefHistory_rough', tag: 'v1', date: 'May 14', note: 'First rough assembly' },
    ],
    beats: ['open', 'setup', 'turn', 'build', 'peak', 'land'],
    comments: [
      { at: '0:06', author: 'You', text: 'Love the boom up — hold one more beat before the cut.', state: 'open' },
      { at: '0:18', author: 'You', text: 'VO lands a touch early over the stamp.', state: 'addressed' },
      { at: '0:24', author: 'D. Parker', text: 'Ending is the open question — beach vs. studio resolve.', state: 'open' },
    ],
  };

  // ── Priorities + activity (Overview) ────────────────────────
  var priorities = {
    needsApproval: [
      { id: 'edit',  label: 'Edit review',       sub: 'Latest cut, ' + reviews.cuts[0].date, tab: 'reviews', urgent: true },
      { id: 'music', label: 'Music selection',   sub: 'Two directions to choose', tab: 'reviews' },
      { id: 'endcard', label: 'End card',        sub: 'Logo resolve, 3 options', tab: 'reviews' },
      { id: 'legal', label: 'Legal approval',    sub: 'Talent usage term', tab: 'scope' },
    ],
    milestones: [
      { label: 'Client review', date: 'Jun 5',  state: 'current' },
      { label: 'Picture lock',  date: 'Jun 13', state: 'upcoming' },
      { label: 'Color review',  date: 'Jun 19', state: 'upcoming' },
      { label: 'Final delivery',date: 'Jun 27', state: 'upcoming' },
    ],
    costDrivers: [
      { label: 'Additional deliverables', amt: 6000 },
      { label: 'Night overtime', amt: 18000 },
      { label: 'Location overage', amt: 4000 },
    ],
    activity: [
      { icon: 'film',   text: 'Latest edit uploaded', meta: '01_BriefHistory_HD \u00b7 Jun 4', tone: 'amber' },
      { icon: 'chat',   text: '2 new comments added', meta: 'On the current cut \u00b7 Jun 4' },
      { icon: 'clock',  text: 'Budget forecast updated', meta: money(T.forecast) + ' \u00b7 Jun 3' },
      { icon: 'plus',   text: 'Scope change requested', meta: ':15 cutdown \u00b7 Jun 2' },
    ],
  };

  // ── Notifications (global) ──────────────────────────────────
  var notifications = [
    { kind: 'Approval', text: 'Edit review is waiting on you', tab: 'reviews' },
    { kind: 'Budget',   text: 'Forecast updated to ' + money(T.forecast), tab: 'budget' },
    { kind: 'Schedule', text: 'Picture lock set for Jun 13', tab: 'timeline' },
    { kind: 'Scope',    text: ':15 cutdown change requested', tab: 'decisions' },
  ];

  // ── DECISIONS — the simulator. Each candidate change carries
  //    its real consequence across budget / schedule / resources / risk.
  var RESOURCE_SET = ['Editorial', 'Graphics', 'Sound', 'Locations', 'Travel', 'Crew', 'Talent', 'Legal', 'Schedule'];

  var decisions = [
    { id: 'cutdown', kind: 'add', label: 'Add a :15 cutdown',
      sub: 'A second deliverable from the approved cut',
      budget: 4500, days: 2, risk: 'Low',
      resources: ['Editorial', 'Graphics', 'Sound'],
      deliverable: '1 additional asset',
      detail: 'Pulls from the scenes already inside the :15 set. No new footage — an editorial pass, a graphics conform, and a sound mix.' },

    { id: 'social', kind: 'add', label: 'Add a social campaign',
      sub: 'Six platform-native assets',
      budget: 18000, days: 3, risk: 'Medium',
      resources: ['Editorial', 'Graphics'],
      deliverable: '6 additional assets',
      detail: 'Vertical cutdowns and motion stills built from existing footage. No reshoot — editorial and graphics time only.' },

    { id: 'version', kind: 'add', label: 'Add a market version',
      sub: 'Localized :30 master for one region',
      budget: 9000, days: 2, risk: 'Low',
      resources: ['Editorial', 'Legal'],
      deliverable: '1 localized master',
      detail: 'A language pass over the existing cut plus re-clearance of talent usage in the new market.' },

    { id: 'location', kind: 'add', label: 'Move the ending to a destination coast',
      sub: 'Relocate the beach scene',
      budget: 72000, days: 4, risk: 'High',
      resources: ['Locations', 'Travel', 'Crew', 'Talent'],
      deliverable: null,
      detail: 'Reopens a wrapped scene. A full company move — travel, a new permit, crew days, and talent availability all reactivate.' },

    { id: 'talent', kind: 'add', label: 'Recast the partner role',
      sub: 'Replace THEO in the apartment scene',
      budget: 26000, days: 5, risk: 'High',
      resources: ['Talent', 'Crew', 'Editorial'],
      deliverable: null,
      detail: 'A reshoot of the apartment scene with new casting, then a re-cut. The single most disruptive change on the board.' },

    { id: 'flipday', kind: 'reduce', label: 'Flip the apartment scene to day',
      sub: 'Remove the night premium',
      budget: -18000, days: 0, risk: 'Low',
      resources: ['Crew', 'Schedule'],
      deliverable: null,
      detail: 'Clears the crew overtime currently drawing against contingency. The ending plays the same; the budget breathes.' },
  ];

  return {
    F: F, FW: FW, S0: S0, T: T,
    money: money, signed: signed, money0: money0,
    project: project, status: status, budget: budget, timeline: timeline,
    scope: scope, risks: risks, reviews: reviews, priorities: priorities,
    notifications: notifications, decisions: decisions, RESOURCE_SET: RESOURCE_SET,
    NAV: [
      { id: 'overview',  label: 'Overview' },
      { id: 'reviews',   label: 'Reviews' },
      { id: 'timeline',  label: 'Timeline' },
      { id: 'budget',    label: 'Budget' },
      { id: 'scope',     label: 'Scope' },
      { id: 'risks',     label: 'Risks' },
      { id: 'decisions', label: 'Decisions' },
    ],
  };
})();
