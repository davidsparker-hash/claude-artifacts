/* ============================================================
   TENET — Commercial Development Framework.
   Each seat tracks a TOP 10; each variable holds six subs.
   Producer's ten carry dollars; director's ten are creative.
   ============================================================ */
window.FRAMEWORK = (function () {

  // Producer day-base costs sum to $450,000. The night scene adds a
  // $50,000 overtime premium under Crew — cleared when it flips to day.
  const CREW_NIGHT_PREMIUM = 50000;

  const PRODUCER = [
    { id: 'scope',   n: 1,  name: 'Scope',              cost: 35000,
      subs: ['Scope of work', 'Campaign size', 'Number of spots', 'Required assets', 'Client expectations', 'Change orders'] },
    { id: 'deliv',   n: 2,  name: 'Deliverables',       cost: 40000,
      subs: ['Broadcast masters', 'Social versions', 'Aspect ratios', 'Market versions', 'Language versions', 'Cutdowns'] },
    { id: 'sched',   n: 3,  name: 'Schedule',           cost: 30000,
      subs: ['Pre-production timeline', 'Shoot days', 'Post schedule', 'Delivery deadlines', 'Approval timelines', 'Critical path items'] },
    { id: 'talent',  n: 4,  name: 'Talent',             cost: 70000,
      subs: ['Casting', 'Talent fees', 'Usage rights', 'Availability', 'Union requirements', 'Renewals'] },
    { id: 'crew',    n: 5,  name: 'Crew',               cost: 60000, nightVar: true,
      subs: ['Crew size', 'Department heads', 'Overtime', 'Travel', 'Specialty crew', 'Labor costs'] },
    { id: 'locs',    n: 6,  name: 'Locations',          cost: 55000,
      subs: ['Scouting', 'Permits', 'Parking', 'Weather', 'Site restrictions', 'Logistics'] },
    { id: 'design',  n: 7,  name: 'Production Design',  cost: 45000,
      subs: ['Sets', 'Props', 'Wardrobe', 'Hair', 'Makeup', 'Vehicles'] },
    { id: 'post',    n: 8,  name: 'Post Production',    cost: 80000,
      subs: ['Editorial', 'Color', 'Sound', 'Music', 'VFX', 'Localization'] },
    { id: 'rights',  n: 9,  name: 'Rights & Legal',    cost: 20000,
      subs: ['Talent rights', 'Music rights', 'Territory', 'Term length', 'Exclusivity', 'Clearances'] },
    { id: 'risk',    n: 10, name: 'Risk & Contingency', cost: 15000,
      subs: ['Weather risk', 'Schedule risk', 'Budget risk', 'Talent risk', 'Vendor risk', 'Delivery risk'] },
  ];

  const DIRECTOR = [
    { id: 'story',   n: 1,  name: 'Story',
      subs: ['Narrative clarity', 'Structure', 'Character motivation', 'Beginning', 'Middle', 'End'] },
    { id: 'concept', n: 2,  name: 'Concept',
      subs: ['Core idea', 'Originality', 'Simplicity', 'Memorability', 'Brand fit', 'Strategic intent'] },
    { id: 'perf',    n: 3,  name: 'Performance',
      subs: ['Acting', 'Authenticity', 'Behavior', 'Timing', 'Improvisation', 'Chemistry'] },
    { id: 'visual',  n: 4,  name: 'Visual Language',
      subs: ['Style', 'Imagery', 'Symbolism', 'References', 'Visual motifs', 'World building'] },
    { id: 'cast',    n: 5,  name: 'Casting',
      subs: ['Lead talent', 'Supporting talent', 'Character fit', 'Diversity', 'Presence', 'Credibility'] },
    { id: 'pdesign', n: 6,  name: 'Production Design',
      subs: ['Sets', 'Locations', 'Props', 'Wardrobe', 'Color palette', 'Environment'] },
    { id: 'camera',  n: 7,  name: 'Camera & Composition',
      subs: ['Framing', 'Lens choice', 'Camera movement', 'Blocking', 'Scale', 'Perspective'] },
    { id: 'edit',    n: 8,  name: 'Editorial Rhythm',
      subs: ['Pacing', 'Shot selection', 'Transitions', 'Momentum', 'Timing', 'Flow'] },
    { id: 'impact',  n: 9, name: 'Emotional Impact',
      subs: ['Audience reaction', 'Empathy', 'Surprise', 'Tension', 'Delight', 'Recall'] },
  ];

  function nightActive(state) {
    return window.FLOW.activeScenes(state).some(s => window.FLOW.isNight(s, state));
  }
  function categoryCost(cat, state) {
    return cat.cost + (cat.nightVar && nightActive(state) ? CREW_NIGHT_PREMIUM : 0);
  }
  function producerTotal(state) {
    return PRODUCER.reduce((a, c) => a + categoryCost(c, state), 0);
  }
  function top10(lane) { return lane === 'producer' ? PRODUCER : DIRECTOR; }

  // ══ Producer financial model ════════════════════════════════════
  // Built for cause-and-effect, not bookkeeping. Each cost center holds
  // Budget / Actual / Forecast and the WHY drivers behind the number.
  // A night exterior is the live variable: it loads crew overtime, which
  // draws against contingency — clearing it ripples through every figure.
  const CONTINGENCY_RESERVE = 50000;     // held inside the approved budget
  const FIN_NIGHT_OT = 18000;            // crew OT premium when night is live

  // center.base = forecast at day rates. budget = approved line. actual = committed-to-date.
  const FIN_CENTERS = [
    { id: 'talent', name: 'Talent', budget: 72000, actual: 58000, base: 74000,
      why: 'Two principals carrying national usage drive most of talent.',
      drivers: [
        { label: 'Principal cast (×2)', amt: 38000 },
        { label: 'Usage & renewals', amt: 16000 },
        { label: 'Supporting cast', amt: 12000 },
        { label: 'Wardrobe + hair/makeup', amt: 8000 },
      ] },
    { id: 'crew', name: 'Crew', budget: 95000, actual: 74000, base: 95000, nightVar: true,
      why: 'A night exterior pushes the whole crew into overtime.',
      drivers: [
        { label: 'Core crew — day rates', amt: 62000 },
        { label: 'Department heads', amt: 18000 },
        { label: 'Night overtime premium', amt: FIN_NIGHT_OT, night: true },
        { label: 'Travel + kit fees', amt: 15000 },
      ] },
    { id: 'locs', name: 'Locations', budget: 50000, actual: 47000, base: 55000,
      why: 'Downtown, at night, with picture cars — that is the $55k.',
      drivers: [
        { label: 'Downtown street closure', amt: 18000 },
        { label: 'Police lockup', amt: 15000 },
        { label: 'Picture-vehicle staging', amt: 12000 },
        { label: 'Parking + company moves', amt: 10000 },
      ] },
    { id: 'equip', name: 'Equipment', budget: 62000, actual: 51000, base: 64000,
      why: 'The technocrane and picture vehicles carry the package.',
      drivers: [
        { label: 'Camera package + lenses', amt: 24000 },
        { label: 'Technocrane', amt: 16000 },
        { label: 'Lighting + grip', amt: 14000 },
        { label: 'Picture vehicles', amt: 10000 },
      ] },
    { id: 'design', name: 'Production Design', budget: 46000, actual: 40000, base: 45000,
      why: 'A single build, lightly dressed — running efficient.',
      drivers: [
        { label: 'Set construction', amt: 18000 },
        { label: 'Set dressing + props', amt: 14000 },
        { label: 'Fabrication', amt: 8000 },
        { label: 'Strike', amt: 5000 },
      ] },
    { id: 'post', name: 'Post Production', budget: 90000, actual: 32000, base: 88000,
      why: 'VFX cleanup is the heaviest line in post.',
      drivers: [
        { label: 'VFX cleanup', amt: 28000 },
        { label: 'Editorial', amt: 24000 },
        { label: 'Color + online', amt: 18000 },
        { label: 'Sound + music', amt: 18000 },
      ] },
    { id: 'legal', name: 'Legal', budget: 35000, actual: 28000, base: 33000,
      why: 'Usage and music licensing dominate legal.',
      drivers: [
        { label: 'Talent usage rights', amt: 14000 },
        { label: 'Music licensing', amt: 11000 },
        { label: 'Clearances', amt: 8000 },
      ] },
  ];

  function finForecast(c, state) { return c.base + (c.nightVar && nightActive(state) ? FIN_NIGHT_OT : 0); }
  function finVariance(c, state) { return finForecast(c, state) - c.budget; }
  function finDrivers(c, state) { const n = nightActive(state); return c.drivers.filter(d => !d.night || n); }
  function finTotals(state) {
    const directBudget = FIN_CENTERS.reduce((a, c) => a + c.budget, 0);   // 450,000
    const actual = FIN_CENTERS.reduce((a, c) => a + c.actual, 0);
    const forecast = FIN_CENTERS.reduce((a, c) => a + finForecast(c, state), 0);
    const overrun = Math.max(0, forecast - directBudget);
    const approved = directBudget + CONTINGENCY_RESERVE;                  // 500,000
    return { approved, actual, forecast, variance: forecast - approved,
      reserve: CONTINGENCY_RESERVE, drawn: overrun, contingency: CONTINGENCY_RESERVE - overrun, directBudget };
  }
  // What is eating the contingency reserve (cause-and-effect).
  function finContingencyDrivers(state) {
    const n = nightActive(state);
    const d = [{ label: 'Location overage', amt: 4000 }];
    if (n) d.unshift({ label: 'Night overtime — crew', amt: FIN_NIGHT_OT });
    return d;
  }

  // ══ Bid build-up (AICP bid model) ══════════════════════════════
  // The producer's deeper view: direct costs roll up by section, then the
  // deal-term levers (markup, production fee, insurance) load on top.
  // Nothing is stored as a total — every number is recomputed from inputs,
  // so a slid fee ripples straight to the grand total and reconciles to
  // the expected (printed) figure within tolerance.
  const BID = {
    client: window.FLOW.TITLE, agency: 'H&W', project: '#17433', status: 'BALLPARK',
    system: 'AICP v2.6.1', director: 'D. Parker',
    expected: 500000, markupPct: 15, feePct: 12, insurancePct: 3.5,
    sections: [
      { code: 'A', name: 'Talent Labor', lines: [
        { desc: 'O/C Principals — buyout', qty: 2, days: 1, rate: 19000, unit: 'FLAT' },
        { desc: 'Supporting cast', qty: 4, days: 2, rate: 1500, unit: 'DAY' },
        { desc: 'Usage & renewals — 2yr', qty: 1, days: 1, rate: 10000, unit: 'FLAT' },
        { desc: 'Wardrobe + hair/makeup', qty: 1, days: 1, rate: 4000, unit: 'FLAT' },
      ] },
      { code: 'B', name: 'Crew Labor', lines: [
        { desc: 'Core crew — day rates', qty: 12, days: 3, rate: 1500, unit: 'DAY' },
        { desc: 'Department heads', qty: 5, days: 3, rate: 1000, unit: 'DAY' },
        { desc: 'Travel + kit fees', qty: 1, days: 1, rate: 13000, unit: 'FLAT' },
      ] },
      { code: 'C', name: 'Locations', lines: [
        { desc: 'Downtown street closure', qty: 1, days: 1, rate: 16000, unit: 'FLAT' },
        { desc: 'Police lockup', qty: 6, days: 1, rate: 2000, unit: 'HOUR' },
        { desc: 'Picture-vehicle staging', qty: 1, days: 1, rate: 10000, unit: 'FLAT' },
        { desc: 'Parking + company moves', qty: 1, days: 1, rate: 8000, unit: 'FLAT' },
      ] },
      { code: 'D', name: 'Equipment', lines: [
        { desc: 'Camera package + lenses', qty: 1, days: 3, rate: 7000, unit: 'DAY' },
        { desc: 'Technocrane', qty: 1, days: 2, rate: 8000, unit: 'DAY' },
        { desc: 'Lighting + grip', qty: 1, days: 3, rate: 4000, unit: 'DAY' },
        { desc: 'Picture vehicles', qty: 1, days: 1, rate: 9000, unit: 'FLAT' },
      ] },
      { code: 'E', name: 'Production Design', lines: [
        { desc: 'Set construction', qty: 1, days: 1, rate: 16000, unit: 'FLAT' },
        { desc: 'Set dressing + props', qty: 1, days: 1, rate: 12000, unit: 'FLAT' },
        { desc: 'Fabrication', qty: 1, days: 1, rate: 6000, unit: 'FLAT' },
        { desc: 'Strike', qty: 1, days: 1, rate: 4000, unit: 'FLAT' },
      ] },
      { code: 'F', name: 'Post Production', lines: [
        { desc: 'VFX cleanup', qty: 1, days: 1, rate: 26000, unit: 'FLAT' },
        { desc: 'Editorial', qty: 1, days: 1, rate: 22000, unit: 'FLAT' },
        { desc: 'Color + online', qty: 1, days: 1, rate: 14000, unit: 'FLAT' },
        { desc: 'Sound + music', qty: 1, days: 1, rate: 10000, unit: 'FLAT' },
      ] },
      { code: 'G', name: 'Travel (CS17)', travel: true, handlingPct: 10, lines: [
        { desc: 'Directors', ctype: 'HOTEL', qty: 2, days: 14, rate: 350, unit: 'DAY' },
        { desc: 'Talent', ctype: 'TRANSPORT', qty: 1, days: 1, rate: 8000, unit: 'FLAT' },
        { desc: 'Director of Photography', ctype: 'PER DIEM', qty: 1, days: 14, rate: 100, unit: 'DAY' },
        { desc: 'Producer', ctype: 'FLIGHT', qty: 1, days: 1, rate: 1800, unit: 'EACH' },
      ] },
    ],
  };

  // Scenario levers — the "what if" engine. Each is a direct-cost saving
  // plus its schedule / crew / risk consequence. risk: <0 lowers, >0 raises.
  const BID_SCENARIOS = [
    { id: 'extras', label: 'Reduce extras', note: '120 \u2192 60 background', save: 12000, days: 0, crew: 0, risk: -1 },
    { id: 'crane', label: 'Remove technocrane', note: 'Crane \u2192 dolly + jib', save: 16000, days: 0, crew: -2, risk: -1 },
    { id: 'stage', label: 'Move to stage', note: 'Drops the night exterior', save: 22000, days: -1, crew: -8, risk: -2 },
    { id: 'day', label: 'Drop a shoot day', note: '3 \u2192 2 shoot days', save: 28000, days: -1, crew: -12, risk: 2 },
    { id: 'vfx', label: 'Convert to VFX plates', note: 'Practical \u2192 plate + comp', save: 9000, days: 0, crew: -4, risk: 1 },
  ];

  return { PRODUCER, DIRECTOR, CREW_NIGHT_PREMIUM, nightActive, categoryCost, producerTotal, top10,
    FIN_CENTERS, CONTINGENCY_RESERVE, FIN_NIGHT_OT,
    finForecast, finVariance, finDrivers, finTotals, finContingencyDrivers, BID, BID_SCENARIOS };
})();
