/* global React, ReactDOM, TK, Glyph, BreathingDot, ClientSeat, DirectorSeat */
// One source of truth, two reactive views, one translation wire between them.

const { useState, useMemo, useRef, useEffect } = React;

// ── The translation band — the wire between the two languages ───────
function MathChip({ k, v }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 11px', borderRadius: 2, background: TK.PAPER_SOFT,
      border: `1px solid ${TK.BORDER}`, fontFamily: TK.MONO, fontSize: 12, color: TK.INK, whiteSpace: 'nowrap' }}>
      <span style={{ color: TK.INK_FAINT, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k === 'cost' ? 'Cost' : 'Date'}</span>
      {v}
    </span>
  );
}

function RecvChip({ children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center',
      padding: '6px 11px', borderRadius: 2, background: TK.PAPER,
      border: `1px solid ${TK.BORDER}`, fontFamily: TK.SANS, fontSize: 13, color: TK.INK_MUTED,
      whiteSpace: 'nowrap' }}>{children}</span>
  );
}

function Translation({ tr }) {
  return (
    <div key={tr.id} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 28 }}>
      {/* Source — spoken in its own language */}
      <div style={{ flex: '0 0 auto', minWidth: 0, maxWidth: 380 }}>
        <div style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: TK.INK_FAINT, marginBottom: 6 }}>{tr.fromSeat} said</div>
        <div style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 20, color: TK.INK,
          lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: TK.AMBER }}>{tr.spokeLabel}</span> · {tr.spoke}
        </div>
      </div>

      {/* The translation arrow */}
      <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: TK.AMBER }}>
          <BreathingDot />
          <Glyph name="arrow" size={26} />
        </div>
        <div style={{ fontFamily: TK.MONO, fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: TK.INK_FAINT }}>
          {tr.dir === 'up' ? 'Upstream' : 'Downstream'}
        </div>
      </div>

      {/* Target — received in its language */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: TK.INK_FAINT, marginBottom: 6 }}>{tr.toSeat} received</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tr.received.length ? tr.received.map((r, i) => <RecvChip key={i}>{r}</RecvChip>)
            : <RecvChip>no change</RecvChip>}
        </div>
      </div>

      {/* The mathematics — always shown */}
      <div style={{ flex: '0 0 auto', display: 'flex', gap: 8 }}>
        {tr.chips.map((c, i) => <MathChip key={i} k={c.k} v={c.v} />)}
      </div>
    </div>
  );
}

function IdleBand() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', width: '100%', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BreathingDot />
        <span style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: TK.AMBER }}>The coordination layer · bidirectional</span>
      </div>
      <span style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 20, color: TK.INK }}>
        Opacity, replaced with mathematics. Turn a dial — one event, two languages.
      </span>
    </div>
  );
}

// ── The app ─────────────────────────────────────────────────────────
function App() {
  const M = window.TENET;
  const [state, setState] = useState(M.DEFAULT_STATE);
  const [revealed, setRevealed] = useState(false);
  const [translation, setTranslation] = useState(null);
  const trId = useRef(0);

  const derived = useMemo(() => M.recompute(state), [state]);

  useEffect(() => {
    fitStage();
    const t1 = setTimeout(fitStage, 50);
    const t2 = setTimeout(fitStage, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function commit(nextState, action) {
    const next = M.recompute(nextState);
    const tr = M.translate(action, derived, next);
    tr.id = ++trId.current;
    setState(nextState);
    setTranslation(tr);
    setRevealed(true);
  }

  function toggleScene(id) {
    const scene = M.SCENES.find(s => s.id === id);
    const wasCut = !!state.cuts[id];
    const cuts = Object.assign({}, state.cuts);
    if (wasCut) delete cuts[id]; else cuts[id] = true;
    const nextState = Object.assign({}, state, { cuts });
    const next = M.recompute(nextState);
    const dropLoc = !wasCut && derived.locations.includes(scene.location) && !next.locations.includes(scene.location);
    const dropPrin = !wasCut && scene.principals.find(p => derived.principals.includes(p) && !next.principals.includes(p));
    const addPrin = wasCut && scene.principals.find(p => !derived.principals.includes(p) && next.principals.includes(p));
    commit(nextState, { dir:'down', type: wasCut ? 'restore' : 'cut', scene, dropLoc, dropPrin, addPrin });
  }
  function setHero(len) {
    if (len === state.heroLen) return;
    commit(Object.assign({}, state, { heroLen: len }), { dir:'down', type:'hero', len });
  }
  function toggleTokyo() {
    const on = !state.addTokyo;
    commit(Object.assign({}, state, { addTokyo: on }), { dir:'down', type:'tokyo', on });
  }
  function toggleFlag() {
    const on = !state.flag;
    commit(Object.assign({}, state, { flag: on }), { dir:'up', on });
  }
  function reset() {
    setState(M.DEFAULT_STATE); setTranslation(null); setRevealed(false);
  }

  return (
    <div className="stage" id="stage">
      {/* Wordmark */}
      <div style={{ position: 'absolute', top: 30, left: 70, zIndex: 20,
        fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 22, color: TK.INK_FAINT,
        letterSpacing: '0.02em' }}>tenet</div>

      {revealed && (
        <button onClick={reset} title="Reset the demo" style={{
          position: 'absolute', top: 26, right: 64, zIndex: 20,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: `1px solid ${TK.BORDER}`, borderRadius: 2,
          padding: '7px 13px', cursor: 'pointer', color: TK.INK_MUTED,
          fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          <Glyph name="reset" size={14} /> Reset
        </button>
      )}

      {/* Two seats, one state */}
      <div className={'panels' + (revealed ? ' revealed' : '')}>
        <div className="panel panel-client">
        <div className="client-wrap">
          <ClientSeat state={state} derived={derived}
              onToggleScene={toggleScene} onHero={setHero} onTokyo={toggleTokyo} />
          </div>
        </div>
        <div className="panel panel-director">
          <div className="director-inner">
            <DirectorSeat state={state} derived={derived} onFlag={toggleFlag} />
          </div>
        </div>
      </div>

      {/* The translation wire */}
      <div className="seam-band">
        {translation ? <Translation tr={translation} /> : <IdleBand />}
      </div>
    </div>
  );
}

// ── Scale the fixed 1920×1080 stage to fit the viewport ─────────────
function fitStage() {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', fitStage);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
