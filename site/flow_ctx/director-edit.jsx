/* global React, FK, FLOW, FRAMEWORK, FGlyph */
// Director page — a dark edit-bay layout (Flame-style):
//   left  = scaffold + variables   (the "pink" zone)
//   center= program monitor
//   right = live script            (the "blue" zone)
//   below = transport + multi-track timeline.

const DK_DARK = {
  bg0: '#0E0F12', bg1: '#16181d', bg2: '#1f2228', bg3: '#2a2e36',
  line: 'rgba(255,255,255,0.06)', line2: 'rgba(255,255,255,0.13)',
  txt: '#dfe2e6', txt2: '#8c929b', txt3: '#5b616a',
  amber: '#E3A155', amberDim: 'rgba(227,161,85,0.16)',
  clip: '#33414f', clipBlue: '#34465c', clipGray: '#3a4048', wave: '#69727e',
  read: '#7fd6a6', clipEdge: '#4a5a6c', clipText: 'rgba(255,255,255,0.85)', clipSub: 'rgba(255,255,255,0.4)',
  pink: '#f0909f',
  lift: '0 1px 0 rgba(255,255,255,0.04), 0 18px 44px -20px rgba(0,0,0,0.8)',
};
const DK_LIGHT = {
  bg0: '#ECECEA', bg1: '#FFFFFF', bg2: '#FBFBFA', bg3: '#F4F4F2',
  line: 'rgba(0,0,0,0.10)', line2: 'rgba(0,0,0,0.16)',
  txt: '#1A1A1A', txt2: '#6B6B6B', txt3: '#9A9A9A',
  amber: '#BA7517', amberDim: 'rgba(186,117,23,0.10)',
  clip: '#c9d3dd', clipBlue: '#c0d0e0', clipGray: '#dad6cd', wave: '#a6aeb8',
  read: '#1F7A52', clipEdge: '#a6b4c2', clipText: 'rgba(33,28,21,0.82)', clipSub: 'rgba(33,28,21,0.42)',
  pink: '#C75B74',
  lift: '0 1px 0 rgba(33,28,22,0.015), 0 12px 34px -16px rgba(64,44,16,0.24)',
};
let DK = DK_DARK;

// ── Left: scaffold + variables (pink zone) ──────────────────────────
const DIR_DRAFT = 'Can we hold the beach for golden hour? It sells the ending.';
function ChatProducer({ chat, onSend }) {
  const bub = (mine) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%',
    background: mine ? DK.amber : DK.bg3, color: mine ? DK.bg0 : DK.txt,
    border: mine ? 'none' : `1px solid ${DK.line2}`, borderRadius: 8, padding: '8px 11px',
    fontFamily: FK.SANS, fontSize: 12.5, lineHeight: 1.4, marginBottom: 7 });
  const who = (mine) => ({ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: mine ? 'rgba(0,0,0,0.5)' : DK.txt3, marginBottom: 3 });
  return (
    <div style={{ borderTop: `1px solid ${DK.line}`, background: DK.bg2, padding: '12px 18px 14px', flexShrink: 0 }}>
      <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: DK.amber, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <FGlyph name="chat" size={13} /> Message · Producer</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {chat.messages.map((m, i) => (
          <div key={i} style={bub(m.from === 'director')}>
            <div style={who(m.from === 'director')}>{m.from === 'director' ? 'You · Director' : 'Producer'}</div>
            {m.text}
          </div>
        ))}
        {chat.typing && <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: DK.txt3, marginBottom: 7 }}>Producer is checking the numbers…</div>}
      </div>
      {!chat.sent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontFamily: FK.SANS, fontSize: 12.5, color: DK.txt, lineHeight: 1.4, padding: '9px 11px', background: DK.bg1, border: `1px solid ${DK.line2}`, borderRadius: 8 }}>{DIR_DRAFT}</div>
          <button onClick={onSend} style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: DK.amber, color: DK.bg0, border: 'none', borderRadius: 2, padding: '8px 15px', fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}><FGlyph name="send" size={13} /> Send</button>
        </div>
      )}
    </div>
  );
}

function EditScaffold({ cat, subIdx, onCat, onSub, open, onToggle }) {
  const catObj = FRAMEWORK.DIRECTOR.find(c => c.id === cat) || FRAMEWORK.DIRECTOR[0];
  const subs = catObj.subs;
  const go = d => onSub((subIdx + d + subs.length) % subs.length);

  if (!open) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: DK.bg1, borderRight: `1px solid ${DK.line}`, padding: '12px 0' }}>
        <span onClick={onToggle} title="Open reference library" style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DK.txt2, border: `1px solid ${DK.line2}` }}>
          <FGlyph name="arrow" size={13} />
        </span>
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginTop: 18, fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: DK.txt3 }}>Reference library</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: DK.bg1,
      borderRight: `1px solid ${DK.line}`, minHeight: 0 }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: `1px solid ${DK.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: DK.amber }}>Director · scaffold</div>
          <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 19, color: DK.txt, marginTop: 5 }}>Reference library</div>
        </div>
        <span onClick={onToggle} title="Collapse" style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DK.txt2, border: `1px solid ${DK.line2}`, flexShrink: 0 }}>
          <FGlyph name="arrow" size={12} style={{ transform: 'scaleX(-1)' }} />
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {FRAMEWORK.DIRECTOR.map(c => {
          const on = c.id === cat;
          return (
            <div key={c.id} onClick={() => onCat(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 18px', cursor: 'pointer', background: on ? DK.amberDim : 'transparent',
              boxShadow: on ? `inset 3px 0 0 ${DK.amber}` : 'none' }}>
              <span style={{ fontFamily: FK.MONO, fontSize: 10, color: on ? DK.amber : DK.txt3, width: 18 }}>{String(c.n).padStart(2, '0')}</span>
              <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 16, color: on ? DK.amber : DK.txt, flex: 1 }}>{c.name}</span>
              <span style={{ fontFamily: FK.MONO, fontSize: 9, color: DK.txt3 }}>6</span>
            </div>
          );
        })}
      </div>
      {/* Variables — subcategory tabs you cycle through */}
      <div style={{ borderTop: `1px solid ${DK.line}`, background: DK.bg2, padding: '12px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: DK.amber }}>
            {String(catObj.n).padStart(2, '0')} · {catObj.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, border: `1px solid ${DK.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DK.txt2 }} onClick={() => go(-1)}><FGlyph name="arrow" size={12} style={{ transform: 'scaleX(-1)' }} /></span>
            <span style={{ fontFamily: FK.MONO, fontSize: 10, color: DK.txt2, width: 30, textAlign: 'center' }}>{subIdx + 1}/{subs.length}</span>
            <span style={{ width: 22, height: 22, borderRadius: 999, border: `1px solid ${DK.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DK.txt2 }} onClick={() => go(1)}><FGlyph name="arrow" size={12} /></span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {subs.map((s, i) => (
            <div key={i} onClick={() => onSub(i)} style={{ padding: '6px 10px', cursor: 'pointer',
              fontFamily: FK.MONO, fontSize: 10.5, letterSpacing: '0.02em', whiteSpace: 'nowrap',
              color: i === subIdx ? DK.bg0 : DK.txt2, background: i === subIdx ? DK.amber : DK.bg3,
              borderRadius: 2 }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Center: program monitor ─────────────────────────────────────────
function ProgramMonitor({ state }) {
  const len = FLOW.totalLength(state);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: DK.bg0, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', color: DK.txt2 }}>
        <FGlyph name="film" size={14} style={{ color: DK.txt3 }} />
        <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: DK.txt3 }}>Versions</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {['01_BriefHistory_HD', '01_BriefHistory_HD_vb3', '01_BriefHistory_HD_a2'].map(v => {
            const active = v === '01_BriefHistory_HD';
            return <span key={v} style={{ fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.1em', color: active ? DK.amber : DK.txt3, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>{active && <span style={{ width: 5, height: 5, borderRadius: 999, background: DK.amber }} />}{v}</span>;
          })}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 8px', minHeight: 0 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 912, aspectRatio: '16 / 9', background: '#000',
          border: `1px solid ${DK.line2}`, overflow: 'hidden' }}>
          <img src="assets/creative-thumbnail.png" alt="Program" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {/* legibility scrims for overlay metadata */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: 'linear-gradient(rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)' }}>PROGRAM · 16×9</div>
          <div style={{ position: 'absolute', left: 14, bottom: 12, fontFamily: FK.MONO, fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>01:00:00:00</div>
          <div style={{ position: 'absolute', right: 14, bottom: 12, fontFamily: FK.MONO, fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{FLOW.fmtClock(len)} · 1920×1080</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px', borderTop: `1px solid ${DK.line}`, color: DK.txt3, fontFamily: FK.MONO, fontSize: 10 }}>
        <span>SRC 00:00:02:01</span><span>CONTRAST 1.00 · GAMMA 1.00</span><span>1920 × 1080 (1.778)</span>
      </div>
    </div>
  );
}

// ── Right: live script (AV format — VISUAL / VO) ────────────────────
function EditScript({ state, flashId }) {
  const film = FLOW.FILM;
  const Block = ({ b }) => {
    if (b.k === 'card') {
      return (
        <div style={{ margin: '18px 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1, height: 1, background: DK.line2 }} />
            <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: DK.txt2, whiteSpace: 'nowrap' }}>{b.text}</span>
            <span style={{ flex: 1, height: 1, background: DK.line2 }} />
          </div>
          {b.note && <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 14, color: DK.txt3, marginTop: 7 }}>{b.note}</div>}
        </div>
      );
    }
    if (b.k === 'q') {
      return (
        <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.4, color: DK.txt, textAlign: 'center', margin: '0 8px 13px' }}>{b.text}</div>
      );
    }
    const vo = b.k === 'vo';
    return (
      <div style={{ display: 'flex', gap: 14, marginBottom: 13 }}>
        <div style={{ flex: '0 0 46px', textAlign: 'right', paddingTop: 3 }}>
          <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: vo ? DK.amber : DK.txt3 }}>{vo ? 'VO' : 'Visual'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, borderLeft: vo ? `2px solid ${DK.amber}` : 'none', paddingLeft: vo ? 12 : 0 }}>
          <span style={{ fontFamily: FK.SCRIPT, fontSize: 13.5, lineHeight: 1.5, color: vo ? DK.txt : DK.txt2, fontWeight: vo ? 500 : 400 }}>{b.text}</span>
        </div>
      </div>
    );
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: DK.bg1,
      borderLeft: `1px solid ${DK.line}`, minWidth: 0 }}>
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${DK.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: DK.amber }}>Live script</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, color: DK.txt3 }}>{film.file}</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px 26px', minHeight: 0 }}>
        {film.parts.map((part, pi) => (
          <div key={part.id} style={{ marginTop: pi === 0 ? 0 : 24 }}>
            {part.transition ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 16px' }}>
                <span style={{ flex: 1, height: 1, background: DK.line }} />
                <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: DK.txt3 }}>Transition</span>
                <span style={{ flex: 1, height: 1, background: DK.line }} />
              </div>
            ) : (
              <div style={{ marginBottom: 15 }}>
                <div style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: DK.amber }}>
                  Part {part.n} · {part.label}</div>
                <div style={{ height: 1, background: DK.line, marginTop: 8 }} />
              </div>
            )}
            {part.blocks.map((b, i) => <Block key={i} b={b} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Transport bar ───────────────────────────────────────────────────
function TransportBar({ state, onMode, view, onView }) {
  const len = FLOW.totalLength(state);
  const btn = { width: 30, height: 26, borderRadius: 3, border: `1px solid ${DK.line2}`, background: DK.bg2,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: DK.txt2, cursor: 'pointer' };
  return (
    <div style={{ height: 50, flexShrink: 0, background: DK.bg1, borderTop: `1px solid ${DK.line}`, borderBottom: `1px solid ${DK.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 17, color: DK.read, letterSpacing: '0.04em' }}>01:00:04:12</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, color: DK.txt3 }}>SRC 00:00:02:01</span>
        <span style={{ width: 1, height: 22, background: DK.line2, margin: '0 4px' }} />
        <div style={{ display: 'inline-flex', border: `1px solid ${DK.line2}`, borderRadius: 3, overflow: 'hidden' }}>
          {[['timeline', 'Timeline'], ['beats', 'Beats']].map(([id, label], i) => (
            <div key={id} onClick={() => onView(id)} style={{ padding: '5px 13px', cursor: 'pointer', fontFamily: FK.MONO, fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: i ? `1px solid ${DK.line2}` : 'none',
              background: view === id ? DK.amber : DK.bg2, color: view === id ? DK.bg0 : DK.txt2 }}>{label}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={btn}><FGlyph name="arrow" size={13} style={{ transform: 'scaleX(-1)' }} /></div>
        <div style={{ ...btn, width: 38, background: DK.amber, borderColor: DK.amber, color: DK.bg0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
        </div>
        <div style={btn}><FGlyph name="arrow" size={13} /></div>
        <span style={{ width: 1, height: 22, background: DK.line2, margin: '0 8px' }} />
        <span style={{ fontFamily: FK.MONO, fontSize: 10, color: DK.txt3, marginRight: 6 }}>LENGTH</span>
        <span style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 22, color: DK.txt }}>{FLOW.fmtClock(len)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, color: DK.txt3 }}>CUT</span>
        <div style={{ display: 'inline-flex', border: `1px solid ${DK.line2}`, borderRadius: 3, overflow: 'hidden' }}>
          {[30, 15].map((m, i) => (
            <div key={m} onClick={() => onMode(m)} style={{ padding: '5px 12px', cursor: 'pointer', fontFamily: FK.MONO, fontSize: 11,
              borderLeft: i ? `1px solid ${DK.line2}` : 'none',
              background: state.mode === m ? DK.amber : DK.bg2, color: state.mode === m ? DK.bg0 : DK.txt2 }}>:{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Multi-track timeline ────────────────────────────────────────────
function Waveform() {
  const bars = [];
  for (let i = 0; i < 160; i++) {
    const x = i / 160;
    const a = Math.abs(Math.sin(x * 22) * 0.5 + Math.sin(x * 7 + 1) * 0.35 + Math.sin(x * 51) * 0.18);
    bars.push(Math.max(0.06, a) * 100);
  }
  return (
    <div style={{ position: 'absolute', inset: '4px 0', display: 'flex', alignItems: 'center', gap: 1, padding: '0 6px' }}>
      {bars.map((h, i) => <div key={i} style={{ flex: 1, height: h + '%', background: DK.wave, opacity: 0.85, minWidth: 1 }} />)}
    </div>
  );
}

function Clip({ left, width, color, label, sub }) {
  return (
    <div style={{ position: 'absolute', top: 3, bottom: 3, left: left + '%', width: width + '%',
      background: color, border: `1px solid ${DK.clipEdge}`, borderRadius: 2, overflow: 'hidden',
      display: 'flex', alignItems: 'center', padding: '0 8px', boxSizing: 'border-box' }}>
      <span style={{ fontFamily: FK.MONO, fontSize: 10, color: DK.clipText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {sub && <span style={{ fontFamily: FK.MONO, fontSize: 9, color: DK.clipSub, marginLeft: 'auto', flexShrink: 0 }}>{sub}</span>}
    </div>
  );
}

function EditTimeline({ state }) {
  const scenes = FLOW.activeScenes(state);
  const total = FLOW.totalLength(state);
  // scene start offsets
  let acc = 0;
  const sceneClips = scenes.map(s => {
    const dur = s.shots.reduce((a, sh) => a + sh.dur, 0);
    const clip = { left: acc / total * 100, width: dur / total * 100, name: FLOW.locName(s.locId).toUpperCase(), n: s.n };
    acc += dur;
    return clip;
  });
  const ROW_H = 34;
  const header = (label, p) => (
    <div style={{ height: ROW_H, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px',
      borderBottom: `1px solid ${DK.line}`, background: DK.bg1 }}>
      {p && <span style={{ width: 14, height: 14, borderRadius: 2, background: DK.amber, color: DK.bg0, fontFamily: FK.MONO, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P</span>}
      <span style={{ fontFamily: FK.MONO, fontSize: 11, color: DK.txt2, flex: 1 }}>{label}</span>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: DK.txt3 }} />
      <span style={{ width: 5, height: 5, borderRadius: 999, background: DK.txt3 }} />
    </div>
  );
  const lane = (children) => (
    <div style={{ height: ROW_H, position: 'relative', borderBottom: `1px solid ${DK.line}`, background: DK.bg0 }}>{children}</div>
  );
  const ticks = [];
  for (let t = 0; t <= total; t += 5) ticks.push(t);

  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', background: DK.bg0 }}>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        {/* Track headers */}
        <div style={{ width: 150, flexShrink: 0, borderRight: `1px solid ${DK.line2}` }}>
          <div style={{ padding: '0 10px', height: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'center', fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', color: DK.txt3, textTransform: 'uppercase' }}>Video</div>
          {header('V1.4')}{header('V1.3')}{header('V1.2', true)}{header('V1.1')}
          <div style={{ padding: '0 10px', height: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'center', fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', color: DK.txt3, textTransform: 'uppercase', borderTop: `1px solid ${DK.line}` }}>Audio</div>
          {header('A1.L')}{header('A1.R')}
        </div>
        {/* Lanes */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div style={{ height: 24 }} />
          {/* V1.4 — end logo */}
          {lane(<Clip left={88} width={12} color={DK.clipGray} label="TENET — END LOGO" sub="0" />)}
          {/* V1.3 — end line / title card */}
          {lane(<Clip left={64} width={24} color={DK.clipGray} label="STOP GUESSING — END LINE" sub="0" />)}
          {/* V1.2 — the cut, by scene/location */}
          {lane(sceneClips.map((c, i) => <Clip key={i} left={c.left} width={c.width} color={DK.clipBlue} label={c.name} sub={c.n} />))}
          {/* V1.1 — master */}
          {lane(<Clip left={0} width={100} color={DK.clip} label="01_brief-history_16x9.mov" sub="MOV" />)}
          <div style={{ height: 24, borderTop: `1px solid ${DK.line}` }} />
          {lane(<Waveform />)}
          {lane(<Waveform />)}
          {/* Playhead */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '34%', width: 1, background: DK.amber, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: -1, left: -4, width: 9, height: 8, background: DK.amber, clipPath: 'polygon(0 0,100% 0,50% 100%)' }} />
          </div>
        </div>
      </div>
      {/* Ruler */}
      <div style={{ display: 'flex', borderTop: `1px solid ${DK.line2}`, background: DK.bg1, flexShrink: 0 }}>
        <div style={{ width: 150, flexShrink: 0, borderRight: `1px solid ${DK.line2}` }} />
        <div style={{ flex: 1, position: 'relative', height: 26 }}>
          {ticks.map(t => (
            <span key={t} style={{ position: 'absolute', left: (t / total * 100) + '%', top: 6, fontFamily: FK.MONO, fontSize: 9, color: DK.txt3, transform: 'translateX(2px)' }}>
              {`01:00:${String(t).padStart(2, '0')}:00`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Beats: emotional throughline ────────────────────────────────────
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Overlay form — a transparent curve drawn ON TOP of the (dimmed) timeline,
// so the editor can read the emotional shape against the actual cut.
function BeatsOverlay({ state }) {
  const beats = [
    { key: 'open', t: 0.22 },
    { key: 'setup', t: 0.42, mk: DK.amber },
    { key: 'turn', t: 0.24, mk: DK.read },
    { key: 'build', t: 0.52 },
    { key: 'peak', t: 0.92, mk: DK.pink, hot: true },
    { key: 'land', t: 0.50 },
  ];
  // 0..100 coordinate space, stretched to fill via preserveAspectRatio=none.
  // Markers are HTML (percent-positioned) so they stay perfectly circular.
  const padXl = 3, padXr = 3, padTop = 14, padBot = 14;
  const X = i => padXl + (i / (beats.length - 1)) * (100 - padXl - padXr);
  const Y = t => padTop + (1 - t) * (100 - padTop - padBot);
  const pts = beats.map((b, i) => ({ x: X(i), y: Y(b.t) }));
  const line = smoothPath(pts);
  const area = line + ` L ${pts[pts.length - 1].x.toFixed(1)} 100 L ${pts[0].x.toFixed(1)} 100 Z`;
  const uid = 'beats';
  const sh = DK === DK_LIGHT ? '0 1px 2px rgba(255,255,255,0.6)' : '0 1px 4px rgba(0,0,0,0.7)';
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
      {/* caption row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 18px 0' }}>
        <span style={{ fontFamily: FK.SANS, fontSize: 14, color: DK.txt, textShadow: sh }}>Tension and release across the story</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 13, color: DK.txt2, letterSpacing: '0.04em', textShadow: sh, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 16 }}>:{state.mode} · 6 beats</span>
      </div>
      {/* chart area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, margin: '8px 18px 0' }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={DK.read} />
              <stop offset="0.42" stopColor={DK.amber} />
              <stop offset="0.78" stopColor={DK.pink} />
              <stop offset="1" stopColor={DK.amber} />
            </linearGradient>
            <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={DK.amber} stopOpacity={DK === DK_LIGHT ? 0.16 : 0.22} />
              <stop offset="1" stopColor={DK.amber} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${uid}-fill)`} />
          <path d={line} fill="none" stroke={`url(#${uid}-stroke)`} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* markers — HTML so they stay round regardless of stretch */}
        {beats.map((b, i) => b.mk && (
          <div key={b.key} style={{ position: 'absolute', left: pts[i].x + '%', top: pts[i].y + '%',
            transform: 'translate(-50%,-50%)', width: 15, height: 15, borderRadius: '50%',
            background: DK.bg0, border: `2.5px solid ${b.mk}`, boxSizing: 'border-box',
            boxShadow: DK === DK_LIGHT ? 'none' : '0 1px 6px rgba(0,0,0,0.6)' }} />
        ))}
      </div>
      {/* beat labels */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${beats.length}, 1fr)`, padding: '6px 18px 8px' }}>
        {beats.map(b => (
          <span key={b.key} style={{ textAlign: 'center', fontFamily: FK.MONO, fontSize: 12, letterSpacing: '0.08em',
            color: b.hot ? DK.amber : DK.txt2, fontWeight: b.hot ? 700 : 400, textShadow: sh }}>{b.key}</span>
        ))}
      </div>
    </div>
  );
}

// ── The edit bay (Creative-lane landing) ────────────────────────────
// The director's working surface: scaffold + monitor + live script + timeline.
// No top chrome — CreativeLane owns the unified bar + nav. `theme` drives the
// shared DK palette across the whole lane (bay + portal views).
function EditBay({ state, cat, subIdx, flashId, theme, onCat, onSub, onMode }) {
  DK = theme === 'light' ? DK_LIGHT : DK_DARK;
  const [bottomView, setBottomView] = React.useState('timeline');
  const [refOpen, setRefOpen] = React.useState(false);
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: DK.bg0 }}>
      {/* monitors row */}
      <div style={{ flex: '1 1 auto', display: 'flex', minHeight: 0 }}>
        <div style={{ flex: '0 0 ' + (refOpen ? 360 : 50) + 'px', minWidth: 0 }}>
          <EditScaffold cat={cat} subIdx={subIdx} onCat={onCat} onSub={onSub} open={refOpen} onToggle={() => setRefOpen(o => !o)} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}><ProgramMonitor state={state} /></div>
        <div style={{ flex: '0 0 450px', minWidth: 0 }}><EditScript state={state} flashId={flashId} /></div>
      </div>

      <TransportBar state={state} onMode={onMode} view={bottomView} onView={setBottomView} />
      {bottomView === 'beats' ? (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ opacity: 0.25 }}><EditTimeline state={state} /></div>
          <BeatsOverlay state={state} />
        </div>
      ) : <EditTimeline state={state} />}
    </div>
  );
}

// Set the shared dark palette before rendering reused sub-components from
// another file (they read the module-scoped `DK` at render time).
function setEditTheme(theme) { DK = theme === 'light' ? DK_LIGHT : DK_DARK; }

Object.assign(window, { EditBay, DK_DARK, DK_LIGHT, setEditTheme,
  ProgramMonitor, EditScript, EditTimeline, TransportBar, ChatProducer, EditScaffold, BeatsOverlay });
