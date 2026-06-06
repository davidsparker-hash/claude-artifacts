/* global React */
// TENET Production lane — ONE cockpit, ONE nav. The script intake is the
// landing (tab 1); every other view is a projection over the same money object.
// Nav is lifecycle-ordered: THE BID (Script · Bid) → THE BUDGET (the rest),
// straight from the schema — "the bid is the budget before the project starts."
const { FK: PFK, FGlyph: PG, PROD: PC } = window;
const { CPHead: PHead, cpKickerFaint: PKickF, cpSerif: PSerif } = window;
const PUse = React.useState, PRef = React.useRef;

const SEV_COLOR = { high: '#B23A2E', med: PFK.AMBER, low: PFK.INK_MUTED, ok: '#1F8A5B' };

// Message · Director — persistent on every production tab (the script cockpit
// embeds its own copy of this same conversation).
const PROD_MSG_DRAFT = 'Schedule won\u2019t let us shoot this night scene. Can it be changed?';
function ProductionMessagePanel({ chat, onSend }) {
  const bub = (mine) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '90%',
    background: mine ? PFK.INK : PFK.PAPER, color: mine ? PFK.PAPER : PFK.INK,
    border: mine ? 'none' : `1px solid ${PFK.BORDER}`, borderRadius: 8, padding: '8px 11px',
    fontFamily: PFK.SANS, fontSize: 12.5, lineHeight: 1.4, marginBottom: 8 });
  const who = (mine) => ({ fontFamily: PFK.MONO, fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: mine ? 'rgba(255,255,255,0.6)' : PFK.INK_FAINT, marginBottom: 3 });
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: `1px solid ${PFK.BORDER}` }}>
        <PG name="chat" size={13} style={{ color: PFK.AMBER }} />
        <span style={{ fontFamily: PFK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: PFK.AMBER }}>Message · Director</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
        {chat.messages.map((m, i) => (
          <div key={i} style={bub(m.from === 'producer')}>
            <div style={who(m.from === 'producer')}>{m.from === 'producer' ? 'You · Producer' : 'D. Parker · Director'}</div>
            {m.text}
          </div>
        ))}
        {chat.typing && <div style={{ fontFamily: PFK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: PFK.INK_FAINT, marginBottom: 7 }}>Director is editing the script…</div>}
        {chat.messages.length === 0 && !chat.sent && (
          <div style={{ fontFamily: PFK.SERIF, fontStyle: 'italic', fontSize: 13, color: PFK.INK_FAINT, lineHeight: 1.5, marginBottom: 'auto' }}>A direct line to the director. Send a question and watch the cut respond.</div>
        )}
      </div>
      {!chat.sent && (
        <div style={{ flex: '0 0 auto', borderTop: `1px solid ${PFK.BORDER}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontFamily: PFK.SANS, fontSize: 12.5, color: PFK.INK, lineHeight: 1.4, padding: '9px 11px', background: PFK.PAPER_SOFT, border: `1px solid ${PFK.BORDER_STRONG}`, borderRadius: 8 }}>{PROD_MSG_DRAFT}</div>
          <button onClick={onSend} style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: PFK.AMBER, color: PFK.PAPER, border: 'none', borderRadius: 2, padding: '8px 15px', fontFamily: PFK.MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}><PG name="send" size={13} /> Send</button>
        </div>
      )}
    </div>
  );
}

function ProductionLane(props) {
  const { state, chat, flashId, onSend, onMode, onReset } = props;
  const [tab, setTab] = PUse('script');
  const [active, setActive] = PUse([]);          // active scenario ids
  const [alertsOpen, setAlertsOpen] = PUse(false);
  const scrollRef = PRef(null);

  const act = PC.scenarios.filter(s => active.indexOf(s.id) >= 0);
  const savings = act.reduce((a, s) => a + s.budget, 0);   // negative
  const daysDelta = act.reduce((a, s) => a + s.days, 0);
  const crewDelta = act.reduce((a, s) => a + s.crew, 0);
  const riskDelta = act.reduce((a, s) => a + s.risk, 0);

  function goTab(t) { setTab(t); setAlertsOpen(false); if (scrollRef.current) scrollRef.current.scrollTop = 0; }
  const ctx = { active, setActive, savings, daysDelta, crewDelta, riskDelta, goTab };

  // Pulled from window at render — these modules load after this one.
  const ScriptCockpit = window.ScriptCockpit;
  const BiddingView = window.BiddingView;
  const VIEWS = {
    dashboard: window.PDashboard, budget: window.PBudget,
    schedule: window.PSchedule, scenarios: window.PScenarios,
  };
  const View = VIEWS[tab] || function () { return null; };
  const liveAlerts = PC.dashboard.alerts.filter(a => a.sev !== 'ok');
  const onScript = tab === 'script';

  // Lifecycle phase of the current tab → status read in the header.
  const curPhase = (PC.NAV.find(n => n.id === tab) || {}).phase;
  const phaseLabel = curPhase === 'bid' ? 'Bidding' : 'In production';

  return (
    <div style={{ position: 'absolute', inset: 0, background: PFK.PAPER_SOFT, display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ flex: '0 0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: `1px solid ${PFK.BORDER}`, background: PFK.PAPER, position: 'relative', zIndex: 20, boxShadow: '0 1px 0 rgba(38,28,12,0.035)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: PFK.SERIF, fontStyle: 'italic', fontSize: 22, color: PFK.INK, letterSpacing: '0.01em' }}>tenet</span>
          <span style={{ fontFamily: PFK.MONO, fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: PFK.AMBER, whiteSpace: 'nowrap' }}>Production</span>
          <span style={{ width: 1, height: 17, background: PFK.BORDER_STRONG, display: 'inline-block', alignSelf: 'center' }} />
          <span style={Object.assign({}, PSerif, { fontSize: 15, color: PFK.INK, whiteSpace: 'nowrap' })}>{PC.project.title}</span>
          <span style={{ fontFamily: PFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: PFK.INK_FAINT }}>{PC.project.format} · {PC.project.code}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {/* lifecycle status */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: PFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: PFK.INK_MUTED }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: curPhase === 'bid' ? PFK.AMBER : '#1F8A5B' }} />{phaseLabel}
          </span>
          {/* cut length — only relevant on the script cockpit */}
          {onScript && (
            <div style={{ display: 'inline-flex', border: `1px solid ${PFK.BORDER_STRONG}`, borderRadius: 3, overflow: 'hidden' }}>
              {[30, 15].map((m, i) => (
                <div key={m} onClick={() => onMode && onMode(m)} style={{ padding: '5px 12px', cursor: 'pointer', fontFamily: PFK.MONO, fontSize: 11, borderLeft: i ? `1px solid ${PFK.BORDER_STRONG}` : 'none', background: state.mode === m ? PFK.AMBER : PFK.PAPER, color: state.mode === m ? PFK.PAPER : PFK.INK_MUTED }}>:{m}</div>
              ))}
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setAlertsOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, cursor: 'pointer', padding: 0, color: alertsOpen ? PFK.AMBER : PFK.INK_MUTED }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#B23A2E' }} />
              <span style={{ fontFamily: PFK.MONO, fontSize: 11, letterSpacing: '0.08em', color: 'inherit' }}>{liveAlerts.length} alerts</span>
            </button>
            {alertsOpen && (
              <div style={{ position: 'absolute', top: 30, right: 0, width: 340, background: PFK.PAPER, border: `1px solid ${PFK.BORDER_STRONG}`, borderRadius: 6, boxShadow: '0 18px 48px rgba(0,0,0,0.14)', padding: 8, zIndex: 40 }}>
                <div style={Object.assign({}, PKickF, { padding: '8px 10px 10px' })}>Active alerts</div>
                {liveAlerts.map((a, i) => (
                  <button key={i} onClick={() => goTab(a.tab)} style={{ display: 'flex', alignItems: 'baseline', gap: 12, width: '100%', textAlign: 'left', background: 'none', border: 0, borderTop: `1px solid ${PFK.BORDER}`, padding: '12px 10px', cursor: 'pointer' }}>
                    <span style={{ fontFamily: PFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: SEV_COLOR[a.sev], flex: '0 0 70px' }}>{a.kind}</span>
                    <span style={{ fontFamily: PFK.SANS, fontSize: 13, color: PFK.INK, lineHeight: 1.4 }}>{a.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="reset-btn" onClick={onReset}><PG name="arrow" size={13} style={{ transform: 'scaleX(-1)' }} /> Change lane</button>
        </div>
      </div>

      {/* ── Nav — one bar, phase-grouped ───────────────────── */}
      <div style={{ flex: '0 0 auto', height: 52, display: 'flex', alignItems: 'stretch', padding: '0 30px', borderBottom: `1px solid ${PFK.BORDER}`, background: PFK.PAPER, position: 'relative', zIndex: 10 }}>
        {PC.NAV.map((n, idx) => {
          const on = n.id === tab;
          const prev = PC.NAV[idx - 1];
          const newPhase = prev && prev.phase !== n.phase;
          return (
            <React.Fragment key={n.id}>
              <button onClick={() => goTab(n.id)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, borderBottom: on ? `2px solid ${PFK.AMBER}` : '2px solid transparent', cursor: 'pointer', padding: '0 15px', marginBottom: -1,
                fontFamily: PFK.MONO, fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase', color: on ? PFK.INK : PFK.INK_FAINT }}>
                {n.label}
                {n.id === 'scenarios' && active.length > 0 && <span style={{ fontFamily: PFK.MONO, fontSize: 9, color: PFK.PAPER, background: PFK.AMBER, borderRadius: 999, padding: '1px 6px' }}>{active.length}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      {onScript ? (
        ScriptCockpit ? <ScriptCockpit state={state} chat={chat} flashId={flashId} onSend={onSend} goTab={goTab} /> : null
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <div style={{ flex: '0 0 340px', minWidth: 0, minHeight: 0, borderRight: `1px solid ${PFK.BORDER}`, background: PFK.PAPER, display: 'flex', flexDirection: 'column' }}>
            <ProductionMessagePanel chat={chat} onSend={onSend} />
          </div>
          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', background: PFK.PAPER_SOFT }}>
            <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 44px 64px' }}>
              {tab === 'bid' ? <BidView BiddingView={BiddingView} /> : <View ctx={ctx} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bid tab — approved bids on top; toggle the working bid below.
function BidView({ BiddingView }) {
  const [mode, setMode] = PUse('post');  // 'post' | 'overages' | 'new'
  const segBtn = (id, label) => (
    <div key={id} onClick={() => setMode(id)} style={{ padding: '7px 15px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: PFK.MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      borderLeft: id !== 'post' ? `1px solid ${PFK.BORDER_STRONG}` : 'none', background: mode === id ? PFK.AMBER : PFK.PAPER, color: mode === id ? PFK.PAPER : PFK.INK_MUTED }}>{label}</div>
  );
  const empty = (title, line) => (
    <div style={{ border: `1px dashed ${PFK.BORDER_STRONG}`, borderRadius: 6, background: PFK.PAPER, padding: '64px 32px', textAlign: 'center' }}>
      <div style={{ fontFamily: PFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: PFK.INK_FAINT, marginBottom: 12 }}>{title}</div>
      <div style={{ fontFamily: PFK.SERIF, fontStyle: 'italic', fontSize: 18, color: PFK.INK_MUTED, maxWidth: 460, margin: '0 auto', lineHeight: 1.5 }}>{line}</div>
    </div>
  );
  return (
    <div>
      <PHead kicker="Bid"
        lede="Every flagged driver lands on a line. Slide the deal terms and the grand total moves — this is the bid before the project starts." />

      {/* Approved bids */}
      <div style={{ marginBottom: 22 }}>
        <div style={Object.assign({}, PKickF, { marginBottom: 12 })}>Approved bids</div>
        <div style={{ border: `1px solid ${PFK.BORDER}`, borderRadius: 6, background: PFK.PAPER, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
            <span style={Object.assign({}, PSerif, { fontSize: 17, color: PFK.INK })}>Master bid</span>
            <span style={{ fontFamily: PFK.MONO, fontSize: 10.5, color: PFK.INK_FAINT }}>{PC.project.agency} · {PC.project.code}</span>
            <span style={{ fontFamily: PFK.MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1F8A5B', border: '1px solid rgba(31,138,91,0.4)', background: 'rgba(31,138,91,0.08)', borderRadius: 2, padding: '2px 8px' }}>Approved</span>
          </div>
          <span style={{ fontFamily: PFK.SANS, fontWeight: 300, fontSize: 24, color: PFK.INK, fontVariantNumeric: 'tabular-nums' }}>{PC.money(PC.dashboard.budget.approved)}</span>
        </div>
      </div>

      {/* mode toggle + greyed running-overage tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', border: `1px solid ${PFK.BORDER_STRONG}`, borderRadius: 3, overflow: 'hidden' }}>
          {segBtn('post', 'Post bid')}{segBtn('overages', 'Overages')}{segBtn('new', 'New bid')}
        </div>
        {['Running overage', 'Running overage'].map((t, i) => (
          <span key={i} style={{ padding: '7px 14px', borderRadius: 3, border: `1px dashed ${PFK.BORDER}`, fontFamily: PFK.MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: PFK.INK_FAINT, opacity: 0.5, cursor: 'not-allowed', whiteSpace: 'nowrap' }}>{t}</span>
        ))}
      </div>

      {/* content */}
      {mode === 'post' ? (
        <div style={{ border: `1px solid ${PFK.BORDER}`, borderRadius: 6, background: PFK.PAPER, overflow: 'hidden' }}>
          {BiddingView ? <BiddingView /> : null}
        </div>
      ) : mode === 'overages' ? (
        empty('Overages', 'No overages logged yet. Once the project is in production, every line that runs over its approved figure surfaces here.')
      ) : (
        empty('New bid', 'Start a fresh bid from this project\u2019s scope — or branch the approved master to model a different cut.')
      )}
    </div>
  );
}

// Kept for back-compat with any external reference.
const ProductionPortal = ProductionLane;
Object.assign(window, { ProductionLane, ProductionPortal, SEV_COLOR });
