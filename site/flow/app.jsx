/* global React, ReactDOM, FK, FGlyph, FLOW, FRAMEWORK, fitFlowStage,
   LaneSelect, UploadGate, ScriptPanel, TimelinePanel, SubTabBar, ScaffoldDirector, ScaffoldProducer, CreativeLane, ProductionLane, ClientPortal */

const { useState, useEffect, useRef } = React;

// Scripted, animated back-and-forth — plays once a conversation is initiated.
// Producer ↔ Director negotiate the night scene and golden hour; the trade
// (flip apartment to day, fund golden-hour OT from the savings) drives the
// shared state so the budget ripple moves as they talk.
const PROD_CONVO = [
  { from: 'producer', text: 'Schedule won\u2019t let us shoot this night scene. Can it be changed?' },
  { from: 'director', text: 'Flipping the apartment to day. That clears the night premium.' },
  { from: 'producer', text: 'Perfect \u2014 that\u2019s $18K back in contingency.' },
  { from: 'director', text: 'Hold the beach for golden hour, though. It sells the ending.' },
  { from: 'producer', text: 'Golden hour\u2019s a half-day of OT. I\u2019ll fund it from the night savings \u2014 net flat.' },
  { from: 'director', text: 'Then we\u2019re good. Locking the board.' },
];
const DIR_CONVO = [
  { from: 'director', text: 'Can we hold the beach for golden hour? It sells the ending.' },
  { from: 'producer', text: 'Golden hour is a half-day of OT \u2014 about +$18,000.' },
  { from: 'director', text: 'Can we find it somewhere?' },
  { from: 'producer', text: 'Flip the apartment to day \u2014 the night premium covers it. Net flat.' },
  { from: 'director', text: 'Do it. Day apartment, golden-hour beach.' },
  { from: 'producer', text: 'Done \u2014 variance holds. Sending the updated board.' },
];

function Workspace({ lane, state, chat, flashId, cat, subIdx, catFlash, onCat, onSub, onMode, onSend, onReset }) {
  const laneLabel = lane === 'director' ? 'Director' : 'Producer';
  const catObj = FRAMEWORK.top10(lane).find(c => c.id === cat) || FRAMEWORK.top10(lane)[0];
  return (
    <div className="work">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 20, color: FK.INK_FAINT }}>tenet</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER }}>{laneLabel}</span>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 14, color: FK.INK_MUTED, whiteSpace: 'nowrap' }}>{FLOW.TITLE}</span>
        </div>
        <button className="reset-btn" onClick={onReset}>
          <FGlyph name="arrow" size={13} style={{ transform: 'scaleX(-1)' }} /> Change lane
        </button>
      </div>

      <div className="work-top">
        <div className="work-scaffold">
          {lane === 'director'
            ? <ScaffoldDirector cat={cat} onCat={onCat} />
            : <ScaffoldProducer state={state} cat={cat} onCat={onCat} chat={chat} onSend={onSend} catFlash={catFlash} />}
        </div>
        <div className="work-right">
          <SubTabBar cat={catObj} subIdx={subIdx} onSub={onSub} />
          <div className="work-script">
            <ScriptPanel state={state} flashId={flashId} />
          </div>
        </div>
      </div>

      <div className="work-timeline">
        <TimelinePanel state={state} flashId={flashId} onMode={onMode} />
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars -- superseded by ClientPortal
function ClientReviewLegacy({ onReset }) {
  const [decision, setDecision] = useState(null);
  const CUTS = [
    { id: 'v4', name: '01_BriefHistory_HD', tag: 'Latest', date: 'Jun 4', note: 'Current cut for review' },
    { id: 'v3', name: '01_BriefHistory_HD_vb3', tag: 'v3', date: 'May 28', note: 'Revised VO timing' },
    { id: 'v2', name: '01_BriefHistory_HD_a2', tag: 'v2', date: 'May 21', note: 'Alt opening beat' },
    { id: 'v1', name: '01_BriefHistory_rough', tag: 'v1', date: 'May 14', note: 'First rough assembly' },
  ];
  const [cutId, setCutId] = useState('v4');
  const cut = CUTS.find(c => c.id === cutId);
  const icons = [['mic', 'Record'], ['phone', 'Call'], ['upload', 'Upload'], ['video', 'Video']];
  const beats = ['open', 'setup', 'turn', 'build', 'peak', 'land'];
  const btnBase = { borderRadius: 3, padding: '12px 16px', cursor: 'pointer', fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center' };
  return (
    <div style={{ position: 'absolute', inset: 0, background: FK.PAPER, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: `1px solid ${FK.BORDER}`, background: FK.PAPER, position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {icons.map(([ic, label]) => (<span key={ic} title={label} style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ic === 'upload' ? FK.AMBER : FK.INK_MUTED, cursor: 'pointer' }}><FGlyph name={ic} size={16} /></span>))}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 19, color: FK.INK_FAINT }}>tenet</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER }}>Client</span>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 13, color: FK.INK_MUTED, whiteSpace: 'nowrap' }}>{FLOW.TITLE}</span>
        </div>
        <button className="reset-btn" onClick={onReset}><FGlyph name="arrow" size={13} style={{ transform: 'scaleX(-1)' }} /> Change lane</button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 1120, display: 'flex', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {CUTS.map(c => {
                const on = c.id === cutId;
                return (
                  <button key={c.id} onClick={() => setCutId(c.id)} title={`${c.date} · ${c.note}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 10px', borderRadius: 3, whiteSpace: 'nowrap', border: `1px solid ${on ? FK.AMBER : FK.BORDER}`, background: on ? FK.AMBER_50 : 'transparent', fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.08em', color: on ? FK.AMBER_800 : FK.INK_MUTED }}>
                    {on && <span style={{ width: 5, height: 5, borderRadius: 999, background: FK.AMBER }} />}{c.tag}
                    <span style={{ color: FK.INK_FAINT }}>{c.date}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: FK.INK_FAINT, whiteSpace: 'nowrap' }}>
              <FGlyph name="film" size={14} /><span style={{ fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.1em' }}>{cut.name}</span>
              <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 12, color: FK.INK_FAINT }}>{cut.note}</span>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000', border: `1px solid ${FK.BORDER_STRONG}`, overflow: 'hidden' }}>
              <iframe src="https://player.vimeo.com/video/1198884434?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerPolicy="strict-origin-when-cross-origin" title="A Brief History of Selling Ideas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' }}></iframe>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(rgba(0,0,0,0.5),transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }}>PROGRAM · 16×9</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${beats.length},1fr)`, marginTop: 14 }}>
              {beats.map((b, i) => (<span key={b} style={{ textAlign: 'center', fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.08em', color: i === 4 ? FK.AMBER : FK.INK_FAINT, fontWeight: i === 4 ? 700 : 400 }}>{b}</span>))}
            </div>
          </div>
          <div style={{ flex: '0 0 360px' }}>
            <div style={{ fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: FK.AMBER, marginBottom: 14 }}>For your review</div>
            <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 30, lineHeight: 1.2, color: FK.INK, marginBottom: 14 }}>{FLOW.TITLE}</div>
            <div style={{ fontFamily: FK.SANS, fontSize: 15, lineHeight: 1.6, color: FK.INK_MUTED, marginBottom: 26 }}>The cut as it stands today. See the idea before it’s made — approve it, or send a note back to the room.</div>
            {!decision ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => setDecision('approved')} style={{ ...btnBase, background: FK.AMBER, color: FK.PAPER, border: 'none' }}>Approve this cut</button>
                <button onClick={() => setDecision('changes')} style={{ ...btnBase, background: 'transparent', color: FK.INK, border: `1px solid ${FK.BORDER_STRONG}` }}>Notes</button>
              </div>
            ) : (
              <div style={{ padding: '16px 18px', border: `1px solid ${decision === 'approved' ? 'rgba(31,138,91,0.4)' : FK.AMBER}`, background: decision === 'approved' ? 'rgba(31,138,91,0.08)' : FK.AMBER_50, borderRadius: 4 }}>
                <div style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: decision === 'approved' ? '#1F8A5B' : FK.AMBER_800, marginBottom: 6 }}>{decision === 'approved' ? 'Approved' : 'Notes sent'}</div>
                <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15, color: FK.INK }}>{decision === 'approved' ? 'Sent to the room. Production can lock the bid.' : 'Your note is on its way to the creative seat.'}</div>
                <button onClick={() => setDecision(null)} style={{ marginTop: 12, background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: FK.INK_FAINT, borderBottom: `1px solid ${FK.BORDER}` }}>Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState('lane');
  const [lane, setLane] = useState(null);
  const [state, setState] = useState(FLOW.DEFAULT_STATE);
  const [chat, setChat] = useState({ messages: [], typing: false, sent: false });
  const [flashId, setFlashId] = useState(null);
  const [cat, setCat] = useState(null);
  const [subIdx, setSubIdx] = useState(0);
  const [catFlash, setCatFlash] = useState(null);
  const [dirTheme, setDirTheme] = useState('dark');
  const [dirChat, setDirChat] = useState({ messages: [], typing: false, sent: false });
  const [prodView, setProdView] = useState('dash');
  const timers = useRef([]);

  useEffect(() => {
    fitFlowStage();
    const t = [setTimeout(fitFlowStage, 50), setTimeout(fitFlowStage, 200)];
    return () => t.forEach(clearTimeout);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function pickLane(l) {
    setLane(l);
    setCat(FRAMEWORK.top10(l)[0].id);
    setSubIdx(0);
    setScreen('upload');
  }
  function onUploaded() { setScreen('work'); }
  function onCat(id) { setCat(id); setSubIdx(0); }
  function onSub(i) { setSubIdx(i); }
  function onMode(m) { setState(s => Object.assign({}, s, { mode: m })); }
  function onTod(v) { setState(s => Object.assign({}, s, { tod: Object.assign({}, s.tod, { s4: v }) })); }

  // Play a scripted conversation with typing indicators. `selfRole` is the
  // window's own seat (no typing shown for their own lines). `sideEffects`
  // maps a message index → fn (e.g. flip the budget state mid-conversation).
  function playConvo(script, setChatFn, selfRole, sideEffects) {
    const T = timers.current;
    setChatFn({ messages: [script[0]], typing: false, sent: true });
    if (sideEffects && sideEffects[0]) sideEffects[0]();
    let t = 0;
    for (let i = 1; i < script.length; i++) {
      const turn = script[i], idx = i;
      const land = () => {
        setChatFn(c => ({ typing: false, sent: true, messages: c.messages.concat([turn]) }));
        if (sideEffects && sideEffects[idx]) sideEffects[idx]();
      };
      if (turn.from === selfRole) {
        t += 950;
        T.push(setTimeout(land, t));
      } else {
        t += 650;
        T.push(setTimeout(() => setChatFn(c => Object.assign({}, c, { typing: turn.from })), t));
        t += 1450;
        T.push(setTimeout(land, t));
      }
    }
  }

  function flipToDay(flashCat) {
    setState(s => Object.assign({}, s, { tod: Object.assign({}, s.tod, { s4: 'DAY' }) }));
    setFlashId('s4');
    if (flashCat) setCatFlash('crew');
    timers.current.push(setTimeout(() => { setFlashId(null); setCatFlash(null); }, 3200));
  }

  function onSend() {
    playConvo(PROD_CONVO, setChat, 'producer', { 1: () => flipToDay(true) });
  }

  function onSendDir() {
    playConvo(DIR_CONVO, setDirChat, 'director', { 3: () => flipToDay(false) });
  }
  function onToggleTheme(t) { setDirTheme(t); }

  function reset() {
    setScreen('lane'); setLane(null); setState(FLOW.DEFAULT_STATE);
    setChat({ messages: [], typing: false, sent: false });
    setFlashId(null); setCat(null); setSubIdx(0); setCatFlash(null);
    setDirChat({ messages: [], typing: false, sent: false }); setDirTheme('dark');
    setProdView('dash');
  }

  return (
    <div className="stage" id="stage">
      {(screen === 'lane' || screen === 'upload') && (
        <div style={{ position: 'absolute', top: 30, left: 70, zIndex: 30,
          fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 22, color: FK.INK_FAINT }}>tenet</div>
      )}
      {screen === 'lane' && <LaneSelect onPick={pickLane} />}
      {screen === 'upload' && <UploadGate lane={lane} onUploaded={onUploaded} />}
      {screen === 'work' && lane === 'director' && (
        <CreativeLane state={state} cat={cat} subIdx={subIdx} flashId={flashId}
          dirChat={dirChat} theme={dirTheme}
          onCat={onCat} onSub={onSub} onMode={onMode} onSendDir={onSendDir} onToggleTheme={onToggleTheme} onReset={reset} onTod={onTod} />
      )}
      {screen === 'work' && lane === 'producer' && (
        <ProductionLane state={state} cat={cat} subIdx={subIdx} chat={chat} flashId={flashId} catFlash={catFlash}
          onCat={onCat} onSub={onSub} onSend={onSend} onMode={onMode} onReset={reset} />
      )}
      {screen === 'work' && lane === 'client' && (
        <ClientPortal onReset={reset} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
