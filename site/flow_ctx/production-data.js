/* ============================================================
   TENET — Production Portal data model.
   ------------------------------------------------------------
   The producer's operational brain for the one project:
   the :30 brand film "A Brief History of Selling Ideas".
   Reconciles to FRAMEWORK: budget from FIN_CENTERS, shots from
   FLOW.SCENES (fin.lv complexity), scenarios from BID_SCENARIOS.
   Every line answers: what costs money, why, and what if I change it.
   ============================================================ */
window.PROD = (function () {
  var F = window.FLOW, FW = window.FRAMEWORK;
  var S0 = F.DEFAULT_STATE;
  var T = FW.finTotals(S0);

  function money(n) { return '$' + Math.round(Math.abs(n)).toLocaleString('en-US'); }
  function signed(n) { return (n < 0 ? '\u2212' : '+') + money(n); }

  var project = { title: F.TITLE, logline: F.LOGLINE, format: ':30 Brand Film', agency: 'H&W', code: '#17433', director: 'D. Parker', today: 'Jun 5, 2026' };

  // ── Dashboard ───────────────────────────────────────────────
  var dashboard = {
    budget: { approved: T.approved, actual: T.actual, forecast: T.forecast, variance: T.variance, contingency: T.contingency, reserve: T.reserve, directBudget: T.directBudget },
    health: [
      { id: 'budget',   label: 'Budget health',   score: 84, state: 'Healthy',  note: 'Forecast ' + money(T.forecast) + ' under ' + money(T.approved) + ' approved.' },
      { id: 'schedule', label: 'Schedule health', score: 88, state: 'On Track',  note: 'Shoot wrapped on schedule; post on plan.' },
      { id: 'resource', label: 'Resource health', score: 72, state: 'Tight',     note: 'Crew released; post houses at capacity.' },
      { id: 'risk',     label: 'Risk score',      score: 68, state: 'Watch',      note: 'Night overtime and the ending beat carry exposure.' },
    ],
    alerts: [
      { kind: 'OT risk',        sev: 'high', text: 'Night exterior is loading ' + money(FW.FIN_NIGHT_OT) + ' of crew overtime', tab: 'scenarios' },
      { kind: 'Location risk',  sev: 'med',  text: 'Downtown closure ran two hours long \u2014 ' + money(4000) + ' over', tab: 'budget' },
      { kind: 'Permit',         sev: 'low',  text: 'Beach permit window is tide-dependent', tab: 'schedule' },
      { kind: 'Over budget',    sev: 'ok',   text: 'No category is forecast over its approved line', tab: 'budget' },
      { kind: 'Vendor',         sev: 'ok',   text: 'All vendor POs current', tab: 'resources' },
    ],
  };

  // ── Budget — level 1 + expandable level 2 ───────────────────
  var budgetCats = FW.FIN_CENTERS.map(function (c) {
    return {
      id: c.id, name: c.name,
      budget: c.budget, actual: c.actual,
      forecast: FW.finForecast(c, S0), variance: FW.finVariance(c, S0),
      why: c.why, drivers: FW.finDrivers(c, S0),
    };
  });
  // Contingency as its own line.
  var contingency = { id: 'cont', name: 'Contingency', budget: T.reserve, actual: T.drawn, forecast: T.drawn, variance: T.drawn - T.reserve,
    why: 'A night exterior and a location overage are drawing the reserve.', drivers: FW.finContingencyDrivers(S0) };

  // ── Shots — scenes as setups, fin.lv = complexity factors ───
  var FACTORS = F.FIN_CATS; // 10, aligns to scene.fin.lv
  var maxCost = Math.max.apply(null, F.SCENES.map(function (s) { return F.costOf(s, S0); }));
  var shots = F.SCENES.map(function (s) {
    var lv = s.fin.lv;
    var complexity = Math.round(lv.reduce(function (a, b) { return a + b; }, 0) / (FACTORS.length * 7) * 100);
    var cost = F.costOf(s, S0);
    var night = F.isNight(s, S0);
    return {
      id: s.id, n: s.n, loc: F.locName(s.locId), tod: F.todOf(s, S0),
      desc: s.action[0].text,
      complexity: complexity, cost: cost, costScore: Math.round(cost / maxCost * 100),
      status: 'Wrapped',
      night: night,
      factors: FACTORS.map(function (f, i) { return { name: f, lv: lv[i] }; }),
      drivers: s.fin.drivers,
      shotCount: s.shots.length,
      scheduleRisk: lv[9],
    };
  });
  var topDrivers = [
    { label: 'Night exterior', amt: 18000 },
    { label: '75 extras \u2014 downtown', amt: 12000 },
    { label: 'Technocrane', amt: 16000 },
    { label: 'Picture vehicles', amt: 10000 },
    { label: 'Downtown closure', amt: 18000 },
  ];

  // ── Schedule ────────────────────────────────────────────────
  var schedule = {
    shootDays: 3, daysComplete: 3, daysRemaining: 0, forecastWrap: 'Apr 18',
    postPhase: 'Editorial', delivery: 'Jun 27',
    days: [
      { id: 'd1', label: 'Day 1', date: 'Apr 14', locs: ['Workshop', 'Studio'], pages: 2.4, shots: 6, crew: 17, hours: 11, risks: ['Complex setups'], state: 'done' },
      { id: 'd2', label: 'Day 2', date: 'Apr 16', locs: ['Downtown', 'Apartment'], pages: 3.1, shots: 6, crew: 19, hours: 13, risks: ['Company moves', 'Night overtime'], state: 'done' },
      { id: 'd3', label: 'Day 3', date: 'Apr 18', locs: ['Rooftop', 'Beach'], pages: 2.0, shots: 5, crew: 16, hours: 12, risks: ['Weather', 'Company moves'], state: 'done' },
    ],
    riskFactors: [
      { label: 'Company moves', count: 3, note: 'Three multi-location days' },
      { label: 'Weather', count: 1, note: 'Beach golden-hour window' },
      { label: 'Talent', count: 1, note: 'Two principals on the night' },
      { label: 'Complex setups', count: 2, note: 'Technocrane + macro rig' },
      { label: 'Client reviews', count: 1, note: 'Picture lock gate ahead' },
    ],
  };

  // ── Resources ───────────────────────────────────────────────
  var resources = [
    { group: 'People', items: [
      { name: 'Principal talent', detail: 'Mara \u00b7 Theo \u00b7 The Maker', count: 3, state: 'wrapped' },
      { name: 'Extras', detail: 'Downtown background', count: 75, state: 'wrapped' },
      { name: 'Crew', detail: 'Core + department heads', count: 19, state: 'wrapped' },
      { name: 'Vendors', detail: 'Catering, transport, rentals', count: 6, state: 'active' },
    ] },
    { group: 'Locations', items: [
      { name: 'Stages', detail: 'Studio (product table)', count: 1, state: 'wrapped' },
      { name: 'Practicals', detail: 'Rooftop \u00b7 Workshop \u00b7 Apartment \u00b7 Downtown', count: 4, state: 'wrapped' },
      { name: 'Remote', detail: 'Beach \u2014 destination coast', count: 1, state: 'wrapped' },
    ] },
    { group: 'Equipment', items: [
      { name: 'Camera', detail: 'Package + lenses', count: 1, state: 'wrapped' },
      { name: 'Grip & lighting', detail: 'Truck package', count: 1, state: 'wrapped' },
      { name: 'Vehicles', detail: 'Picture cars', count: 3, state: 'wrapped' },
      { name: 'Specialty', detail: 'Technocrane \u00b7 macro rig', count: 2, state: 'wrapped' },
    ] },
    { group: 'Post', items: [
      { name: 'Editorial', detail: 'Current cut for review', count: 1, state: 'active' },
      { name: 'Color', detail: 'Scheduled Jun 16', count: 1, state: 'pending' },
      { name: 'VFX', detail: 'Skyline cleanup', count: 1, state: 'active' },
      { name: 'Sound', detail: 'Mix + music', count: 1, state: 'pending' },
      { name: 'Delivery', detail: 'Masters + versions', count: 1, state: 'pending' },
    ] },
  ];

  // ── Risks ───────────────────────────────────────────────────
  var risks = [
    { id: 'pr1', type: 'Budget', title: 'Night exterior overtime', prob: 'Medium', exposure: money(18000), cost: 18000, days: 0, mitigation: 'Flip the apartment scene to day to clear the premium.' },
    { id: 'pr2', type: 'Weather', title: 'Beach golden-hour window', prob: 'Medium', exposure: 'One half-day', cost: 18000, days: 1, mitigation: 'Hold a contingency day; watch the tide chart.' },
    { id: 'pr3', type: 'Client', title: 'Picture lock waits on review', prob: 'Medium', exposure: '3-day slip', cost: 0, days: 3, mitigation: 'Drive the client to approve or note by Jun 9.' },
    { id: 'pr4', type: 'Technical', title: 'VFX cleanup heavier than bid', prob: 'Low', exposure: money(8000), cost: 8000, days: 1, mitigation: 'Lock the skyline plate count at picture lock.' },
    { id: 'pr5', type: 'Legal', title: 'Talent usage renews in 24 months', prob: 'Low', exposure: money(16000), cost: 16000, days: 0, mitigation: 'Renewal budgeted in licensing; flag at month 20.' },
  ];

  // ── SCENARIOS — the what-if engine (toggle + stack) ─────────
  // Negative budget = savings. crew = resource delta. risk delta −2..+2.
  var scenarios = [
    { id: 'extras',  label: 'Reduce extras',            note: '75 \u2192 40 background', budget: -12000, days: 0, crew: 0, risk: -1, res: ['Extras'] },
    { id: 'crane',   label: 'Remove the technocrane',   note: 'Crane \u2192 dolly + jib', budget: -16000, days: 0, crew: -2, risk: -1, res: ['Specialty', 'Grip'] },
    { id: 'stage',   label: 'Move the night to a stage',note: 'Drops the night exterior', budget: -22000, days: -1, crew: -8, risk: -2, res: ['Locations', 'Crew'] },
    { id: 'day',     label: 'Drop a shoot day',         note: '3 \u2192 2 shoot days', budget: -28000, days: -1, crew: -12, risk: 2, res: ['Crew', 'Schedule'] },
    { id: 'vfx',     label: 'Convert practical to VFX', note: 'Plate + comp', budget: -9000, days: 0, crew: -4, risk: 1, res: ['VFX', 'Crew'] },
    { id: 'deliv',   label: 'Reduce deliverables',      note: 'Drop the :15 cutdown', budget: -6000, days: 0, crew: 0, risk: 0, res: ['Editorial'] },
  ];

  return {
    F: F, FW: FW, S0: S0, T: T, money: money, signed: signed,
    project: project, dashboard: dashboard,
    budgetCats: budgetCats, contingency: contingency,
    FACTORS: FACTORS, shots: shots, topDrivers: topDrivers,
    schedule: schedule, resources: resources, risks: risks, scenarios: scenarios,
    bidExpected: FW.BID.expected,
    NAV: [
      { id: 'script',    label: 'Script',    phase: 'bid' },
      { id: 'dashboard', label: 'Dashboard', phase: 'budget' },
      { id: 'budget',    label: 'Budget',    phase: 'budget' },
      { id: 'bid',       label: 'Bid',       phase: 'bid' },
      { id: 'schedule',  label: 'Schedule',  phase: 'budget' },
      { id: 'scenarios', label: 'Changes',   phase: 'budget' },
    ],
  };
})();
