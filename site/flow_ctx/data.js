/* ============================================================
   TENET — Script-to-Scaffold Flow · the one project, modeled.
   ------------------------------------------------------------
   A :30 brand film. The script is the input. Everything else —
   the scaffold outline, the cost sheet, the shot timeline — is
   derived from it. Two seats read the same project:
     • Director — locations, characters, craft
     • Producer — cost, schedule, the line
   The producer→director chat is the bidirectional ripple:
   a constraint travels up, the script changes, money moves.
   ============================================================ */
window.FLOW = (function () {

  const CHARS = [
    { id: 'mara',  name: 'MARA',      note: 'Lead' },
    { id: 'theo',  name: 'THEO',      note: 'Partner' },
    { id: 'maker', name: 'THE MAKER', note: 'Hands' },
  ];

  const LOCS = [
    { id: 'rooftop',   name: 'Rooftop',         kind: 'EXT' },
    { id: 'workshop',  name: 'Workshop',        kind: 'INT' },
    { id: 'downtown',  name: 'Downtown street', kind: 'EXT' },
    { id: 'apartment', name: 'Apartment',       kind: 'INT' },
    { id: 'studio',    name: 'Studio',          kind: 'INT' },
    { id: 'beach',     name: 'Beach',           kind: 'EXT' },
  ];

  // Finance categories (order matters — drives the cost-profile popup).
  // Each scene carries `fin.lv` = a 1\u20137 spend level per category, plus the
  // primary cost drivers behind it. Shots inherit their scene's profile.
  const FIN_CATS = ['Location', 'Talent', 'Crowd', 'Camera', 'Environment', 'Art Dept', 'Vehicles', 'Practical FX', 'VFX', 'Schedule Risk'];

  // Each scene: slug parts, time-of-day (s4 is dynamic via state),
  // cost (day base + night premium), :15-cutdown membership, characters,
  // action paragraphs (with character tags), and shots (the timeline boxes).
  const SCENES = [
    {
      id: 's1', n: 1, locId: 'rooftop', tod: 'DAWN', todDynamic: false,
      costDay: 85000, nightPremium: 0, in15: true, chars: ['mara'],
      fin: { lv: [5, 3, 1, 5, 4, 2, 1, 2, 4, 6], drivers: ['Rooftop permit + safety', 'Crane / jib package', 'Dawn light window', 'Skyline VFX cleanup'] },
      action: [
        { text: 'A city still blue with sleep. MARA stands at the rail.', chars: ['mara'] },
        { text: 'A watch catches the first light.', chars: [] },
      ],
      shots: [
        { id: 's1a', dur: 2,   chars: [],      desc: 'City, blue hour' },
        { id: 's1b', dur: 2,   chars: ['mara'], desc: 'Mara at the rail' },
        { id: 's1c', dur: 2,   chars: ['mara'], desc: 'Watch, first light' },
      ],
    },
    {
      id: 's2', n: 2, locId: 'workshop', tod: 'DAY', todDynamic: false,
      costDay: 70000, nightPremium: 0, in15: false, chars: ['maker'],
      fin: { lv: [2, 3, 1, 5, 1, 5, 1, 3, 2, 2], drivers: ['Macro / probe lens package', 'Specialty watchmaker talent', 'Detailed set dressing'] },
      action: [
        { text: 'Hands at a bench. THE MAKER sets a movement turning.', chars: ['maker'] },
        { text: 'Tiny gears, deliberate.', chars: [] },
      ],
      shots: [
        { id: 's2a', dur: 2, chars: [],       desc: 'Bench, tools' },
        { id: 's2b', dur: 2, chars: ['maker'], desc: 'The movement' },
        { id: 's2c', dur: 1, chars: ['maker'], desc: 'Maker\u2019s hands' },
      ],
    },
    {
      id: 's3', n: 3, locId: 'downtown', tod: 'DAY', todDynamic: false,
      costDay: 80000, nightPremium: 0, in15: false, chars: ['mara'],
      fin: { lv: [6, 3, 6, 4, 3, 3, 4, 2, 3, 4], drivers: ['Street closure permit', 'Background extras', 'Steadicam operator', 'Picture vehicles'] },
      action: [
        { text: 'MARA moves through the city, unhurried.', chars: ['mara'] },
        { text: 'The crowd blurs; she does not.', chars: [] },
      ],
      shots: [
        { id: 's3a', dur: 2,   chars: ['mara'], desc: 'Mara, walking' },
        { id: 's3b', dur: 1.5, chars: [],       desc: 'Crowd blur' },
        { id: 's3c', dur: 1.5, chars: ['mara'], desc: 'Reflection in glass' },
      ],
    },
    {
      // The night scene — the producer's constraint target.
      id: 's4', n: 4, locId: 'apartment', tod: 'NIGHT', todDynamic: true,
      costDay: 60000, nightPremium: 50000, in15: false, chars: ['mara', 'theo'],
      fin: { lv: [3, 5, 1, 3, 2, 4, 1, 2, 1, 5], drivers: ['Night premium + OT', 'Two principal cast', 'Practical interior lighting'] },
      action: [
        { text: 'THEO fastens the watch on MARA\u2019s wrist.', chars: ['mara', 'theo'] },
        { text: 'A held look. The day, given.', chars: [] },
      ],
      shots: [
        { id: 's4a', dur: 2, chars: ['theo', 'mara'], desc: 'The gift' },
        { id: 's4b', dur: 2, chars: ['mara', 'theo'], desc: 'Faces' },
        { id: 's4c', dur: 1, chars: ['mara'],         desc: 'Wrist clasp' },
      ],
    },
    {
      id: 's5', n: 5, locId: 'studio', tod: '\u2014', todDynamic: false,
      costDay: 110000, nightPremium: 0, in15: true, chars: [],
      fin: { lv: [4, 1, 1, 6, 1, 3, 1, 2, 5, 3], drivers: ['Motion-control rig', 'Macro / probe lens', 'Product handling + comp'] },
      action: [
        { text: 'The product, alone. Light moves across the dial like weather.', chars: [] },
      ],
      shots: [
        { id: 's5a', dur: 2.5, chars: [], desc: 'Macro, dial' },
        { id: 's5b', dur: 2,   chars: [], desc: 'Macro, strap' },
        { id: 's5c', dur: 1.5, chars: [], desc: 'Logo resolve' },
      ],
    },
    {
      id: 's6', n: 6, locId: 'beach', tod: 'SUNSET', todDynamic: false,
      costDay: 45000, nightPremium: 0, in15: true, chars: ['mara'],
      fin: { lv: [5, 3, 1, 4, 5, 2, 3, 1, 2, 7], drivers: ['Golden-hour window', 'Location travel + permit', 'Weather contingency', 'Tide timing'] },
      action: [
        { text: 'MARA at the shoreline. The watch, the light, the long now.', chars: ['mara'] },
      ],
      shots: [
        { id: 's6a', dur: 1.5, chars: ['mara'], desc: 'Mara at shore' },
        { id: 's6b', dur: 1.5, chars: ['mara'], desc: 'Wide beach' },
      ],
    },
  ];

  const TITLE = 'A Brief History of Selling Ideas';
  const LOGLINE = 'One watch. One day. A life held in the light.';

  // ── The script, AV format (VISUAL / VO) — matches the writer's doc ──
  // k: 'v' = VISUAL (stage direction) · 'vo' = voiceover line ·
  //    'card' = title/cut card · 'q' = transition question
  const FILM = {
    title: TITLE,
    file: 'A_Brief_History_v3.fdx',
    parts: [
      {
        id: 'p1', n: 1, label: 'The Old Way',
        blocks: [
          { k: 'card', text: 'Title over black', note: 'A Brief History of Selling Ideas' },
          { k: 'v', text: 'Open on Times Square. Camera BOOMS UP the face of an 80th-floor office building. Inside, rows of frantic executives type furiously. Cigarette smoke hangs in the air. A man leaps to his feet holding a script above his head — equal parts fear and triumph.' },
          { k: 'vo', text: 'Once upon a time, making something great meant\u2026 guessing.' },
          { k: 'v', text: 'Rapid cuts. Script changes hands. Elevator UP button pressed. Dark boardroom. A massive executive slams a stamp \u2014 FAIL. Exterior: a man is thrown out a window.' },
          { k: 'vo', text: 'Months of writing. Rewriting. Pitching. Waiting. More waiting.' },
          { k: 'v', text: 'Rapid cuts. A new man is dumped into an empty seat. A hand shoots up with a new script. Feet walking down a hall. Giant rubber stamp hits paper \u2014 APPROVED.' },
          { k: 'vo', text: 'Then boards. Notes. New boards. Different notes. Same notes.' },
          { k: 'v', text: 'Elevator DOWN button. An artist furiously draws storyboards. Elevator UP button. Giant rubber stamp \u2014 APPROVED. A giant check is signed. Millions are committed.' },
          { k: 'vo', text: 'An idea is approved. Millions committed. Still no one\u2019s seen it.' },
          { k: 'v', text: 'Clapperboard snaps. Sets constructed. Crew scrambling. Chaos energy.' },
          { k: 'vo', text: 'Production begins.' },
          { k: 'v', text: 'Martini glasses clink. Exhausted smiles.' },
          { k: 'vo', text: 'Production wraps.' },
          { k: 'v', text: 'Boardroom gathered around an old square TV. A dramatic pause as the screen flickers on.' },
          { k: 'vo', text: 'And finally\u2026 the first real version.' },
          { k: 'card', text: 'Cut to black' },
          { k: 'vo', text: 'And sometimes\u2026 it\u2019s not what anyone pictured.' },
          { k: 'v', text: 'Silence. Faces freeze. Someone is thrown out the window.' },
          { k: 'vo', text: 'Sometimes? Magic.' },
          { k: 'v', text: 'Smash cut to a family watching TV. They jump up and run out of the house. Cars pull up to a store parking lot. Cars leave loaded with product.' },
        ],
      },
      {
        id: 'tr', transition: true, label: 'Transition',
        blocks: [
          { k: 'q', text: 'A lot has changed since the good old days.' },
          { k: 'q', text: 'But we still sell ideas the same way.' },
          { k: 'q', text: 'What if you could actually see the idea\u2026 before you make it?' },
          { k: 'q', text: 'What if changing one thing didn\u2019t mean starting over?' },
          { k: 'q', text: 'What if the best idea won \u2014 not just the safest one?' },
        ],
      },
      {
        id: 'p2', n: 2, label: 'The New Way',
        blocks: [
          { k: 'v', text: 'Camera BOOMS UP Times Square again \u2014 this time into a warm apartment window. A young creative sits cross-legged with a laptop. Calm. Cat in lap.' },
          { k: 'vo', text: 'What if every revision came to life instantly?' },
          { k: 'v', text: 'On the laptop screen, script text auto-transforms into rough storyboard frames on a timeline.' },
          { k: 'vo', text: 'Try this.' },
          { k: 'v', text: 'The character on screen transforms into a squirrel. The creative bursts out laughing.' },
          { k: 'vo', text: 'No more imagining. Just reacting.' },
          { k: 'v', text: 'Split screen. A remote collaborator types notes. The change happens in real time.' },
          { k: 'vo', text: 'If it doesn\u2019t work? You\u2019ll know fast.' },
          { k: 'v', text: 'Rapid iterations. The character cycles through different looks, styles, tones.' },
          { k: 'vo', text: 'So you can try again. And again. And again.' },
          { k: 'v', text: 'Cut to a relaxed boardroom. Pizza boxes. The screen plays a polished animatic version. Confident nods.' },
          { k: 'vo', text: 'When you finally hit \u2018approve\u2019\u2026 you mean it.' },
          { k: 'v', text: 'Transition seamlessly from animatic to a real production set that matches the storyboard exactly.' },
          { k: 'vo', text: 'Better ideas. Fewer heart attacks.' },
          { k: 'v', text: 'Return to the exterior of the office building. A window cleaner drops dramatically two inches. Calmly continues cleaning.' },
          { k: 'vo', text: 'Stop guessing. Start seeing.' },
        ],
      },
    ],
  };

  // ── Derivations (pure; depend on state) ────────────────────────────
  // state: { mode: 30|15, tod: { s4:'NIGHT'|'DAY' } }
  function todOf(scene, state) {
    if (scene.todDynamic) return (state.tod && state.tod[scene.id]) || scene.tod;
    return scene.tod;
  }
  function isNight(scene, state) { return todOf(scene, state) === 'NIGHT'; }
  function costOf(scene, state) { return scene.costDay + (isNight(scene, state) ? scene.nightPremium : 0); }
  function activeScenes(state) {
    return SCENES.filter(s => state.mode === 15 ? s.in15 : true);
  }
  function totalCost(state) { return activeScenes(state).reduce((a, s) => a + costOf(s, state), 0); }
  function totalLength(state) {
    return activeScenes(state).reduce((a, s) => a + s.shots.reduce((b, sh) => b + sh.dur, 0), 0);
  }
  function allShots(state) {
    const out = [];
    activeScenes(state).forEach(s => s.shots.forEach(sh => out.push(Object.assign({ sceneId: s.id, locId: s.locId, n: s.n }, sh))));
    return out;
  }
  function locUsed(locId, state) { return activeScenes(state).some(s => s.locId === locId); }
  function charUsed(charId, state) { return activeScenes(state).some(s => s.chars.includes(charId)); }
  function locName(id) { const l = LOCS.find(x => x.id === id); return l ? l.name : id; }
  function charName(id) { const c = CHARS.find(x => x.id === id); return c ? c.name : id; }

  function fmtMoney(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fmtClock(sec) {
    const s = Math.round(sec);
    return '0:' + String(s).padStart(2, '0');
  }

  return {
    CHARS, LOCS, SCENES, TITLE, LOGLINE, FILM, FIN_CATS,
    todOf, isNight, costOf, activeScenes, totalCost, totalLength, allShots,
    locUsed, charUsed, locName, charName, fmtMoney, fmtClock,
    DEFAULT_STATE: { mode: 30, tod: { s4: 'NIGHT' } },
  };
})();
