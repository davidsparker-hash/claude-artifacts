/* ============================================================
   TENET — Live Demo · the one project, modeled deep.
   ------------------------------------------------------------
   The credibility lives in the recompute. We hardcode the INPUT
   data (scenes) and derive every total live, so the numbers can
   never drift and survive an unscripted poke.

   Mechanism decisions (reported back to the room):
   • Translation: pre-authored, deterministic phrasing assembled
     from the live diff. No network call. "The production system
     generates these with AI; for the demo they're pre-validated
     on this one project so it's deterministic in the room."
   • Recompute: client-side arithmetic. Instant, identical every
     time, incapable of an empty or wrong number.
   ============================================================ */
window.TENET = (function () {

  // ── The project — a brand spot the founder knows cold ──────────────
  // A 60-second film, six scenes. Totals are NEVER stored; always derived.
  const SCENES = [
    { id: 's1', n: 1, name: 'Dawn rooftop', detail: 'EXT · Dawn · the open',
      location: 'Rooftop', shots: 4, runtime: 12, cost: 96000,
      principals: ['Mara Lyne'], cuttable: true,
      tasks: [ {dept:'VFX', label:'Sky cleanup'}, {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Design'} ] },

    { id: 's2', n: 2, name: 'The workshop', detail: 'INT · Day · the craft',
      location: 'Workshop', shots: 5, runtime: 10, cost: 72000,
      principals: [], cuttable: true,
      tasks: [ {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Foley'} ] },

    { id: 's3', n: 3, name: 'Street, in motion', detail: 'EXT · Day · Steadicam',
      location: 'Downtown', shots: 6, runtime: 8, cost: 84000,
      principals: ['Mara Lyne'], cuttable: true,
      tasks: [ {dept:'VFX', label:'Plate cleanup'}, {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Design'} ] },

    { id: 's4', n: 4, name: 'Interior, the gift', detail: 'INT · Night · two-hander',
      location: 'Apartment', shots: 3, runtime: 9, cost: 58000,
      principals: ['Mara Lyne', 'Theo Ross'], cuttable: true,
      tasks: [ {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Dialogue'} ] },

    { id: 's5', n: 5, name: 'Product macro', detail: 'INT · Studio · the hero',
      location: 'Studio', shots: 4, runtime: 15, cost: 110000,
      principals: [], cuttable: false, isHero: true,
      tasks: [ {dept:'VFX', label:'Product comp', id:'hero-vfx'}, {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Mix'} ] },

    { id: 's6', n: 6, name: 'Beach, resolve', detail: 'EXT · Sunset · drone + ground',
      location: 'Beach', shots: 3, runtime: 6, cost: 60000,
      principals: ['Mara Lyne'], cuttable: true,
      tasks: [ {dept:'VFX', label:'Drone stitch'}, {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Design'} ] },
  ];

  // Optional scene — the "add a location" dial brings this in after s3.
  const TOKYO = { id: 'sT', n: 7, name: 'Second city', detail: 'EXT · Dusk · Tokyo street',
    location: 'Tokyo', shots: 5, runtime: 8, cost: 90000,
    principals: ['Mara Lyne'], cuttable: true, added: true,
    tasks: [ {dept:'VFX', label:'Plate cleanup'}, {dept:'Color', label:'Grade'}, {dept:'Sound', label:'Design'} ] };

  // Hero-macro length dial — three validated stops.
  const HERO = {
    15: { runtime: 15, cost: 110000, heroVfx: true },
    10: { runtime: 10, cost: 82000,  heroVfx: true },
    6:  { runtime: 6,  cost: 58000,  heroVfx: false },
  };

  // Director → client constraint: a VFX shot that won't land in schedule.
  // Resolving it (a second vendor) costs money and time — felt by the client.
  const SURCHARGE = { cost: 28000, days: 5 };

  // Schedule anchor — picture wraps; delivery is the post deadline.
  const WRAP = new Date(2026, 4, 30); // 30 May 2026

  const DEFAULT_STATE = { cuts: {}, heroLen: 15, addTokyo: false, flag: false };

  // ── Build the active scene list from state ─────────────────────────
  function buildScenes(state) {
    const out = [];
    SCENES.forEach(s => {
      if (state.cuts[s.id]) return;
      let sc = Object.assign({}, s, { tasks: s.tasks.slice() });
      if (s.isHero) {
        const h = HERO[state.heroLen];
        sc.runtime = h.runtime;
        sc.cost = h.cost;
        sc.tasks = sc.tasks.filter(t => t.id !== 'hero-vfx' || h.heroVfx);
        // The flagged constraint lives on the hero comp.
        if (state.flag) sc.tasks = sc.tasks.map(t => t.id === 'hero-vfx' ? Object.assign({}, t, {atRisk:true}) : t);
      }
      out.push(sc);
      if (s.id === 's3' && state.addTokyo) out.push(Object.assign({}, TOKYO, { tasks: TOKYO.tasks.slice() }));
    });
    return out;
  }

  // ── The recompute — totals derived, never stored ───────────────────
  function recompute(state) {
    const scenes = buildScenes(state);
    let cost = 0, runtime = 0, shots = 0, taskCount = 0, vfxCount = 0;
    const locSet = [], prinSet = [];
    scenes.forEach(s => {
      cost += s.cost; runtime += s.runtime; shots += s.shots;
      taskCount += s.tasks.length;
      vfxCount += s.tasks.filter(t => t.dept === 'VFX').length;
      if (locSet.indexOf(s.location) < 0) locSet.push(s.location);
      s.principals.forEach(p => { if (prinSet.indexOf(p) < 0) prinSet.push(p); });
    });
    if (state.flag) cost += SURCHARGE.cost;
    const days = 14 + scenes.length * 2 + vfxCount * 2 + (state.flag ? SURCHARGE.days : 0);
    const delivery = addDays(WRAP, days);
    return { scenes, cost, runtime, shots, taskCount, vfxCount,
             locations: locSet, principals: prinSet, days, delivery };
  }

  // ── Formatters ─────────────────────────────────────────────────────
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtMoney(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fmtDateParts(d) { return { mon: MON[d.getMonth()], day: d.getDate(), year: d.getFullYear() }; }
  function fmtRuntime(s) { const m = Math.floor(s/60), r = s%60; return m ? `${m}:${String(r).padStart(2,'0')}` : `0:${String(r).padStart(2,'0')}`; }
  function signMoney(n) { return (n >= 0 ? '+' : '−') + fmtMoney(Math.abs(n)).replace('$',''); }
  function signMoney$(n) { return (n >= 0 ? '+$' : '−$') + Math.abs(n).toLocaleString('en-US'); }
  function signDays(n) { return (n >= 0 ? '+' : '−') + Math.abs(n) + (Math.abs(n)===1?' day':' days'); }

  // ── The translation layer — one specialist's change, said in the
  //    language the next specialist speaks. Assembled from the diff. ──
  function translate(action, prev, next) {
    const dShots = prev.shots - next.shots;
    const dLoc   = prev.locations.length - next.locations.length;
    const dTasks = prev.taskCount - next.taskCount;
    const dVfx   = prev.vfxCount - next.vfxCount;
    const dPrin  = prev.principals.length - next.principals.length;
    const dRun   = prev.runtime - next.runtime;
    const dCost  = next.cost - prev.cost;
    const dDays  = next.days - prev.days;

    // Director-language items (shots, locations, tasks, cast)
    function directorItems(opts) {
      opts = opts || {};
      const items = [];
      if (dShots > 0) items.push(`${dShots} shots struck`);
      else if (dShots < 0) items.push(`${-dShots} shots added`);
      if (opts.runtime && dRun) items.push(`runtime ${dRun>0?'−':'+'}${Math.abs(dRun)}s`);
      if (dLoc > 0) items.push(`${opts.location || 'a location'} dropped`);
      else if (dLoc < 0) items.push(`${opts.location || 'a location'} added`);
      if (dVfx > 0) items.push(`${dVfx} VFX ${dVfx===1?'task':'tasks'} cleared`);
      else if (dVfx < 0) items.push(`${-dVfx} VFX ${(-dVfx)===1?'task':'tasks'} added`);
      const dOther = dTasks - dVfx;
      if (dOther > 0) items.push(`${dOther} color/sound ${dOther===1?'task':'tasks'} cleared`);
      else if (dOther < 0) items.push(`${-dOther} color/sound ${(-dOther)===1?'task':'tasks'} added`);
      if (dPrin > 0) items.push(`${opts.principal || 'a principal'} released`);
      else if (dPrin < 0) items.push(`${opts.principal || 'a principal'} added`);
      return items;
    }

    // Client-language items (cost, date)
    function clientItems() {
      const items = [];
      if (dDays) items.push(`delivery ${signDays(dDays)}`);
      if (dCost) items.push(`${signMoney$(dCost)} · second VFX vendor`);
      return items;
    }

    if (action.dir === 'up') {
      // Director hit a constraint; it travels up as cost & date.
      return {
        dir: 'up',
        fromSeat: 'Director', toSeat: 'Client',
        spokeLabel: 'Constraint',
        spoke: action.on ? 'Product comp won\u2019t land'
                         : 'Product comp back in schedule',
        received: clientItems(),
        chips: [ {k:'date', v: signDays(dDays)}, {k:'cost', v: signMoney$(dCost)} ],
      };
    }

    // Down — client spoke in budget/runtime; director receives shots/tasks.
    let spokeLabel = 'Change', spoke = '', opts = {};
    if (action.type === 'cut')      { spokeLabel = 'Cut';      spoke = action.scene.name; opts = {location: action.dropLoc ? action.scene.location : null, principal: action.dropPrin}; }
    else if (action.type === 'restore') { spokeLabel = 'Restore'; spoke = action.scene.name; opts = {location: dLoc<0 ? action.scene.location : null, principal: action.addPrin}; }
    else if (action.type === 'hero')    { spokeLabel = 'Hero macro'; spoke = `${action.len}s cut`; opts = {runtime:true}; }
    else if (action.type === 'tokyo')   { spokeLabel = action.on ? 'Add location' : 'Remove location'; spoke = 'Tokyo'; opts = {location:'Tokyo', runtime:true}; }

    return {
      dir: 'down',
      fromSeat: 'Client', toSeat: 'Director',
      spokeLabel, spoke,
      received: directorItems(opts),
      chips: [ {k:'cost', v: signMoney$(dCost)}, {k:'date', v: signDays(dDays)} ],
    };
  }

  return { SCENES, TOKYO, HERO, SURCHARGE, WRAP, DEFAULT_STATE,
           buildScenes, recompute, translate,
           fmtMoney, fmtDateParts, fmtRuntime, signMoney$, signDays };
})();
