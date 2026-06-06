/* global React */
// TENET Creative lane — ONE dark cockpit. The edit bay is the landing (tab 1);
// the Creative Portal views are projections over the same Decision/Asset graph.
// Nav: Edit Bay │ Project · Script · Boards · Edit · Assets · Collaboration.
// `theme` drives the shared DK palette across the whole lane.
const { FK: LFK, FGlyph: LGl, CREATIVE: LC } = window;
const LUse = React.useState, LRef = React.useRef;

// Message · Producer — the director's line to the producer. Persistent across
// every Creative tab (the edit bay embeds its own copy of this conversation).
const CRLANE_DRAFT = 'Can we hold the beach for golden hour? It sells the ending.';
function CreativeMessagePanel({ ck, chat, onSend }) {
  const bub = (mine) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '90%',
    background: mine ? ck.amber : ck.bg3, color: mine ? ck.bg0 : ck.txt,
    border: mine ? 'none' : `1px solid ${ck.line2}`, borderRadius: 8, padding: '8px 11px',
    fontFamily: LFK.SANS, fontSize: 12.5, lineHeight: 1.4, marginBottom: 8 });
  const who = (mine) => ({ fontFamily: LFK.MONO, fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: mine ? 'rgba(0,0,0,0.5)' : ck.txt3, marginBottom: 3 });
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: `1px solid ${ck.line}` }}>
        <LGl name="chat" size={13} style={{ color: ck.amber }} />
        <span style={{ fontFamily: LFK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: ck.amber }}>Message · Producer</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
        {chat.messages.map((m, i) => (
          <div key={i} style={bub(m.from === 'director')}>
            <div style={who(m.from === 'director')}>{m.from === 'director' ? 'You · Director' : 'Producer'}</div>
            {m.text}
          </div>
        ))}
        {chat.typing && <div style={{ fontFamily: LFK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: ck.txt3, marginBottom: 7 }}>Producer is checking the numbers…</div>}
        {chat.messages.length === 0 && !chat.sent && (
          <div style={{ fontFamily: LFK.SERIF, fontStyle: 'italic', fontSize: 13, color: ck.txt3, lineHeight: 1.5, marginBottom: 'auto' }}>A direct line to the producer. Send a question and watch it land in the budget.</div>
        )}
      </div>
      {!chat.sent && (
        <div style={{ flex: '0 0 auto', borderTop: `1px solid ${ck.line}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontFamily: LFK.SANS, fontSize: 12.5, color: ck.txt, lineHeight: 1.4, padding: '9px 11px', background: ck.bg2, border: `1px solid ${ck.line2}`, borderRadius: 8 }}>{CRLANE_DRAFT}</div>
          <button onClick={onSend} style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: ck.amber, color: ck.bg0, border: 'none', borderRadius: 2, padding: '8px 15px', fontFamily: LFK.MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}><LGl name="send" size={13} /> Send</button>
        </div>
      )}
    </div>
  );
}

function CreativeLane(props) {
  const { state, cat, subIdx, flashId, dirChat, theme, onCat, onSub, onMode, onSendDir, onToggleTheme, onReset, onTod } = props;
  const [tab, setTab] = LUse('bay');
  const scrollRef = LRef(null);
  const ck = theme === 'light' ? window.DK_LIGHT : window.DK_DARK;

  function goTab(t) { setTab(t); if (scrollRef.current) scrollRef.current.scrollTop = 0; }

  const tod = (state.tod && state.tod.s4) || 'NIGHT';
  const ctx = { goTab, tod, setTod: onTod, theme };

  const VIEWS = {
    project: window.CProject, edit: window.CEdit, assets: window.CAssets,
  };
  const View = VIEWS[tab] || function () { return null; };
  const EditBay = window.EditBay;
  const WritersRoom = window.WritersRoom;
  const fullBleed = tab === 'bay' || tab === 'writers';

  const priorities = LC.decisions.filter(d => d.status === 'OPEN' || d.status === 'PROPOSED').length;
  const curPhase = (LC.NAV.find(n => n.id === tab) || {}).phase;

  return (
    <div style={{ position: 'absolute', inset: 0, background: ck.bg0, display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ flex: '0 0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', borderBottom: `1px solid ${ck.line}`, background: ck.bg1, position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 13 }}>
          <span style={{ fontFamily: LFK.SERIF, fontStyle: 'italic', fontSize: 21, color: ck.txt, letterSpacing: '0.01em' }}>tenet</span>
          <span style={{ fontFamily: LFK.MONO, fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: ck.amber, whiteSpace: 'nowrap' }}>Creative</span>
          <span style={{ width: 1, height: 16, background: ck.line2, display: 'inline-block', alignSelf: 'center' }} />
          <span style={{ fontFamily: LFK.SERIF, fontStyle: 'italic', fontSize: 14, color: ck.txt, whiteSpace: 'nowrap' }}>{LC.project.title}</span>
          <span style={{ fontFamily: LFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: ck.txt3 }}>{LC.project.format} · {LC.project.code}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button onClick={() => goTab('project')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 0, cursor: 'pointer', padding: 0, color: ck.txt2 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: ck.amber }} />
            <span style={{ fontFamily: LFK.MONO, fontSize: 11, letterSpacing: '0.08em' }}>{priorities} open</span>
          </button>
          <div style={{ display: 'inline-flex', border: `1px solid ${ck.line2}`, borderRadius: 3, overflow: 'hidden' }}>
            {['dark', 'light'].map((t, i) => (
              <div key={t} onClick={() => onToggleTheme(t)} style={{ padding: '5px 11px', cursor: 'pointer', fontFamily: LFK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: i ? `1px solid ${ck.line2}` : 'none', background: theme === t ? ck.amber : ck.bg2, color: theme === t ? ck.bg0 : ck.txt2 }}>{t}</div>
            ))}
          </div>
          <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: `1px solid ${ck.line2}`, borderRadius: 3, padding: '6px 12px', cursor: 'pointer', color: ck.txt2, fontFamily: LFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <LGl name="arrow" size={12} style={{ transform: 'scaleX(-1)' }} /> Change lane
          </button>
        </div>
      </div>

      {/* ── Nav — one bar, phase-grouped ───────────────────── */}
      <div style={{ flex: '0 0 auto', height: 48, display: 'flex', alignItems: 'stretch', padding: '0 22px', borderBottom: `1px solid ${ck.line}`, background: ck.bg1, position: 'relative', zIndex: 10 }}>
        {LC.NAV.map((n, idx) => {
          const on = n.id === tab;
          const prev = LC.NAV[idx - 1];
          const newPhase = prev && prev.phase !== n.phase;
          return (
            <React.Fragment key={n.id}>
              {newPhase && <span style={{ alignSelf: 'center', width: 1, height: 16, background: ck.line2, margin: '0 14px' }} />}
              <button onClick={() => goTab(n.id)} style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'none', border: 0, borderBottom: on ? `2px solid ${ck.amber}` : '2px solid transparent', cursor: 'pointer', padding: '0 14px', marginBottom: -1,
                fontFamily: LFK.MONO, fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase', color: on ? ck.txt : ck.txt3 }}>
                {n.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Body ────────────────────────────────────────────────
          Edit Bay: the timeline is a full-width footer band, so the
          Message·Producer rail rides INSIDE the bay's upper region and
          never extends below the timeline. Every other tab keeps the
          rail as a persistent full-height left column. */}
      {tab === 'bay' ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {EditBay ? <EditBay state={state} cat={cat} subIdx={subIdx} flashId={flashId} theme={theme} onCat={onCat} onSub={onSub} onMode={onMode}
            messageRail={<CreativeMessagePanel ck={ck} chat={dirChat} onSend={onSendDir} />} /> : null}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <div style={{ flex: '0 0 340px', minWidth: 0, minHeight: 0, borderRight: `1px solid ${ck.line}`, background: ck.bg1, display: 'flex', flexDirection: 'column' }}>
            <CreativeMessagePanel ck={ck} chat={dirChat} onSend={onSendDir} />
          </div>
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {tab === 'writers' ? (
              WritersRoom ? <WritersRoom ctx={ctx} ck={ck} /> : null
            ) : (
              <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', background: ck.bg0 }}>
                <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 44px 64px' }}>
                  <View ctx={ctx} ck={ck} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

window.CreativeLane = CreativeLane;
