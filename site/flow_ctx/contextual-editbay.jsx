/* global React, FK, FGlyph, FLOW, FRAMEWORK */
// TENET — Creative lane as a CONTEXTUAL edit bay.
// The real editing regions — Program, Live Script, Timeline, Reference,
// Producer — become weighted bands. Whichever you engage resolves forward;
// the rest dim to a single reachable line. Program leads at rest.
// Reuses the actual edit-bay components (exported from director-edit.jsx).

const CXD = {
  bg0: '#0E0F12', bg1: '#16181d', bg2: '#1f2228', bg3: '#2a2e36',
  line: 'rgba(255,255,255,0.06)', line2: 'rgba(255,255,255,0.13)',
  txt: '#dfe2e6', txt2: '#8c929b', txt3: '#5b616a', amber: '#E3A155',
  ok: '#7fd6a6', pink: '#f0909f',
};

const CXD_CSS = `
.cxd-frame{position:absolute;inset:0;display:flex;flex-direction:column;background:${CXD.bg0};
  --ease:cubic-bezier(.45,0,.12,1);--T:.7s;}
.cxd-mast{flex:0 0 64px;display:flex;align-items:center;justify-content:space-between;padding:0 30px;
  background:${CXD.bg1};border-bottom:1px solid ${CXD.line};position:relative;z-index:5;}
.cxd-lock{display:flex;align-items:baseline;gap:13px;}
.cxd-wm{font-family:${FK.SERIF};font-style:italic;font-size:22px;color:${CXD.txt};letter-spacing:.01em;}
.cxd-locklbl{font-family:${FK.MONO};font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;color:${CXD.amber};white-space:nowrap;}
.cxd-div{width:1px;height:16px;background:${CXD.line2};align-self:center;}
.cxd-proj{font-family:${FK.SERIF};font-style:italic;font-size:14px;color:${CXD.txt};white-space:nowrap;}
.cxd-projmeta{font-family:${FK.MONO};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:${CXD.txt3};}
.cxd-mright{display:flex;align-items:center;gap:20px;}
.cxd-fear{font-family:${FK.SERIF};font-style:italic;font-size:13px;color:${CXD.txt3};white-space:nowrap;max-width:300px;}
.cxd-seats{display:inline-flex;border:1px solid ${CXD.line2};border-radius:3px;overflow:hidden;}
.cxd-seat{padding:7px 14px;cursor:pointer;background:transparent;border:0;border-left:1px solid ${CXD.line2};
  font-family:${FK.MONO};font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${CXD.txt2};transition:color .25s,background .25s;}
.cxd-seat:first-child{border-left:0;}
.cxd-seat[aria-pressed="true"]{background:${CXD.amber};color:${CXD.bg0};}
.cxd-reset{display:inline-flex;align-items:center;gap:7px;background:transparent;border:1px solid ${CXD.line2};border-radius:3px;
  padding:7px 12px;cursor:pointer;color:${CXD.txt2};font-family:${FK.MONO};font-size:10px;letter-spacing:.14em;text-transform:uppercase;transition:color .2s,border-color .2s;white-space:nowrap;}
.cxd-reset:hover{color:${CXD.txt};border-color:${CXD.txt2};}

.cxd-bands{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;padding:16px 22px 12px;}
.cxd-band{flex:0 0 54px;min-height:0;position:relative;display:flex;flex-direction:column;background:${CXD.bg1};
  border:1px solid ${CXD.line};border-radius:8px;overflow:hidden;cursor:pointer;
  transition:flex-grow var(--T) var(--ease),flex-basis var(--T) var(--ease),opacity .5s var(--ease),
    background .45s,border-color .45s,box-shadow .45s,filter .45s;}
.cxd-band:hover{border-color:${CXD.line2};}
.cxd-band.is-subject{flex:1 1 0;flex-grow:16;background:${CXD.bg0};border-color:${CXD.line2};
  border-left:2px solid ${CXD.amber};box-shadow:0 1px 0 rgba(255,255,255,.03),0 26px 60px -26px rgba(0,0,0,.85);cursor:default;}
.cxd-band.is-collapsed{flex:0 0 54px;opacity:.5;filter:saturate(.55);}
.cxd-band.is-collapsed:hover{opacity:.85;filter:none;}

.cxd-head{flex:0 0 54px;display:flex;align-items:center;gap:14px;padding:0 22px;}
.cxd-kick{font-family:${FK.MONO};font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${CXD.txt3};flex:0 0 128px;
  display:flex;align-items:center;gap:9px;}
.cxd-band.is-subject .cxd-kick{color:${CXD.amber};}
.cxd-line{font-family:${FK.SERIF};font-style:italic;font-size:15px;color:${CXD.txt2};line-height:1.3;flex:1;min-width:0;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:font-size var(--T) var(--ease),color .4s;}
.cxd-band.is-subject .cxd-line{font-size:18px;color:${CXD.txt};font-style:normal;font-family:${FK.SANS};font-weight:300;}
.cxd-line b{font-style:normal;font-weight:600;color:${CXD.txt};}
.cxd-status{display:inline-flex;align-items:center;gap:8px;font-family:${FK.MONO};font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${CXD.txt3};white-space:nowrap;}
.cxd-dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto;}
.cxd-chev{flex:0 0 auto;color:${CXD.txt3};opacity:0;transition:opacity .3s,transform .4s;}
.cxd-band.is-collapsed:hover .cxd-chev{opacity:.8;}

.cxd-body{flex:1;min-height:0;position:relative;}
.cxd-bodyinner{position:absolute;inset:0;overflow:auto;opacity:0;transition:opacity .45s var(--ease);}
.cxd-band.is-subject .cxd-bodyinner{opacity:1;}

/* Timeline — the persistent spine: always full frame, left to right */
.cxd-tl{flex:0 0 auto;display:flex;flex-direction:column;background:${CXD.bg0};border-top:1px solid ${CXD.line2};}
.cxd-tl-head{display:flex;align-items:center;gap:14px;padding:0 22px;height:34px;border-bottom:1px solid ${CXD.line};}
.cxd-tl-kick{font-family:${FK.MONO};font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${CXD.amber};display:flex;align-items:center;gap:9px;}

.cxd-floor{flex:0 0 46px;display:flex;align-items:center;gap:18px;padding:0 30px;background:${CXD.bg1};border-top:1px solid ${CXD.line};}
.cxd-fk{font-family:${FK.MONO};font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:${CXD.txt3};}
.cxd-ftc{font-family:${FK.MONO};font-size:13px;color:${CXD.ok};letter-spacing:.04em;}
.cxd-fmeta{font-family:${FK.MONO};font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${CXD.txt2};}

/* Reference list (compact, inside the band) */
.cxd-reflist{padding:6px 0;}
.cxd-refrow{display:flex;align-items:center;gap:12px;padding:9px 22px;cursor:pointer;}
.cxd-refrow:hover{background:rgba(255,255,255,0.03);}
.cxd-refrow.on{background:${CXD.amber}1f;box-shadow:inset 3px 0 0 ${CXD.amber};}
.cxd-refn{font-family:${FK.MONO};font-size:10px;color:${CXD.txt3};width:18px;}
.cxd-refrow.on .cxd-refn{color:${CXD.amber};}
.cxd-refname{font-family:${FK.SERIF};font-style:italic;font-size:16px;color:${CXD.txt};flex:1;}
.cxd-refrow.on .cxd-refname{color:${CXD.amber};}
.cxd-refsubs{display:flex;flex-wrap:wrap;gap:6px;padding:14px 22px;border-top:1px solid ${CXD.line};}
.cxd-refsub{padding:6px 10px;cursor:pointer;font-family:${FK.MONO};font-size:10.5px;border-radius:2px;
  color:${CXD.txt2};background:${CXD.bg3};white-space:nowrap;}
.cxd-refsub.on{color:${CXD.bg0};background:${CXD.amber};}

@media (prefers-reduced-motion: reduce){.cxd-band,.cxd-bodyinner,.cxd-line{transition:none !important;}}
`;

(function injectCxd() {
  if (document.getElementById('cxd-styles')) return;
  const s = document.createElement('style'); s.id = 'cxd-styles'; s.textContent = CXD_CSS;
  document.head.appendChild(s);
})();

const CXD_SEAT = {
  client: { lbl: 'Client', fear: 'Watching it take shape — health at a glance.' },
  producer: { lbl: 'Producer', fear: 'Holding the line — does anything break, and what it costs.' },
  director: { lbl: 'Director', fear: 'Shaping the work — the room reads beneath, one line.' },
};

// Compact reference list — the director scaffold, sized for a band.
function CxdReference({ cat, subIdx, onCat, onSub }) {
  const cats = (window.FRAMEWORK && window.FRAMEWORK.DIRECTOR) || [];
  const catObj = cats.find(c => c.id === cat) || cats[0] || { n: 1, name: '—', subs: [] };
  return (
    <div className="cxd-reflist">
      {cats.map(c => (
        <div key={c.id} className={'cxd-refrow' + (c.id === cat ? ' on' : '')} onClick={(e) => { e.stopPropagation(); onCat && onCat(c.id); }}>
          <span className="cxd-refn">{String(c.n).padStart(2, '0')}</span>
          <span className="cxd-refname">{c.name}</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 9, color: CXD.txt3 }}>6</span>
        </div>
      ))}
      <div className="cxd-refsubs">
        {(catObj.subs || []).map((s, i) => (
          <div key={i} className={'cxd-refsub' + (i === subIdx ? ' on' : '')} onClick={(e) => { e.stopPropagation(); onSub && onSub(i); }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

// Timeline band body — transport + tracks, with the Beats overlay toggle.
function CxdTimeline({ state, onMode }) {
  const [view, setView] = React.useState('timeline');
  const TransportBar = window.TransportBar, EditTimeline = window.EditTimeline, BeatsOverlay = window.BeatsOverlay;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <TransportBar state={state} onMode={onMode} view={view} onView={setView} />
      {view === 'beats' ? (
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 0.25 }}><EditTimeline state={state} /></div>
          <BeatsOverlay state={state} />
        </div>
      ) : <EditTimeline state={state} />}
    </div>
  );
}

function ContextualEditBay(props) {
  const { state, cat, subIdx, flashId, dirChat, onCat, onSub, onMode, onSendDir, onReset, seat, onSeat } = props;
  if (window.setEditTheme) window.setEditTheme('dark');

  const [subject, setSubject] = React.useState('program');
  const focus = (id) => setSubject(id);

  const project = (window.CLIENT && window.CLIENT.project) || { title: 'A Brief History of Selling Ideas', format: ':30 brand film', code: '#17433' };
  const len = window.FLOW ? FLOW.fmtClock(FLOW.totalLength(state)) : '0:30';
  const isDay = state && state.tod && state.tod.s4 === 'DAY';
  const cats = (window.FRAMEWORK && window.FRAMEWORK.DIRECTOR) || [];
  const catObj = cats.find(c => c.id === cat) || cats[0] || { n: 1, name: 'Reference' };
  const lastMsg = dirChat && dirChat.messages && dirChat.messages.length
    ? dirChat.messages[dirChat.messages.length - 1].text
    : 'A direct line to the producer — send a question, watch it land in the room.';

  const ProgramMonitor = window.ProgramMonitor, EditScript = window.EditScript, ChatProducer = window.ChatProducer;

  // Band descriptor: id, kick, the collapsed one-line, status, and body.
  const BANDS = [
    {
      id: 'program', kick: 'Program',
      line: <React.Fragment><b>01_BriefHistory_HD</b> — the cut as it stands, {len}</React.Fragment>,
      status: <React.Fragment><span className="cxd-dot" style={{ background: CXD.amber }} />In review</React.Fragment>,
      body: <div style={{ position: 'absolute', inset: 0 }}><ProgramMonitor state={state} /></div>,
    },
    {
      id: 'script', kick: 'Live Script',
      line: <React.Fragment>Part 1 · <b>The Old Way</b> — AV format, locked to the cut</React.Fragment>,
      status: <React.Fragment><span className="cxd-dot" style={{ background: CXD.ok }} />Synced</React.Fragment>,
      body: <div style={{ position: 'absolute', inset: 0 }}><EditScript state={state} flashId={flashId} /></div>,
    },
    {
      id: 'reference', kick: 'Reference',
      line: <React.Fragment>{String(catObj.n).padStart(2, '0')} · <b>{catObj.name}</b> — the library behind the cut</React.Fragment>,
      status: <span style={{ fontFamily: FK.MONO, fontSize: 10, color: CXD.txt3 }}>10 categories</span>,
      body: <CxdReference cat={cat} subIdx={subIdx} onCat={onCat} onSub={onSub} />,
    },
    {
      id: 'producer', kick: 'Message · Producer',
      line: <React.Fragment>{lastMsg}</React.Fragment>,
      status: <React.Fragment><span className="cxd-dot" style={{ background: dirChat && dirChat.sent ? CXD.ok : CXD.txt3 }} />{dirChat && dirChat.sent ? 'Thread open' : 'Direct line'}</React.Fragment>,
      body: <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}><ChatProducer chat={dirChat || { messages: [], typing: false, sent: false }} onSend={onSendDir} /></div>,
    },
  ];

  return (
    <div className="cxd-frame">
      {/* Masthead */}
      <div className="cxd-mast">
        <div className="cxd-lock">
          <span className="cxd-wm">tenet</span>
          <span className="cxd-locklbl">Creative</span>
          <span className="cxd-div" />
          <span className="cxd-proj">{project.title}</span>
          <span className="cxd-projmeta">{project.format} · {project.code}</span>
        </div>
        <div className="cxd-mright">
          <span className="cxd-fear">{CXD_SEAT.director.fear}</span>
          <div className="cxd-seats">
            {['client', 'producer', 'director'].map(s => (
              <button key={s} className="cxd-seat" aria-pressed={s === 'director'}
                onClick={() => { if (s !== 'director' && onSeat) onSeat(s); }}>{CXD_SEAT[s].lbl}</button>
            ))}
          </div>
          <button className="cxd-reset" onClick={onReset}>
            <FGlyph name="arrow" size={12} style={{ transform: 'scaleX(-1)' }} /> Change lane
          </button>
        </div>
      </div>

      {/* Bands */}
      <div className="cxd-bands">
        {BANDS.map(b => {
          const on = b.id === subject;
          return (
            <div key={b.id} className={'cxd-band' + (on ? ' is-subject' : ' is-collapsed')}
              onClick={() => { if (!on) focus(b.id); }}>
              <div className="cxd-head">
                <span className="cxd-kick">{b.kick}</span>
                <span className="cxd-line">{b.line}</span>
                <span className="cxd-status">{b.status}</span>
                <span className="cxd-chev"><FGlyph name="arrow" size={13} style={{ transform: 'rotate(90deg)' }} /></span>
              </div>
              <div className="cxd-body">
                <div className="cxd-bodyinner">{on ? b.body : null}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline — the persistent spine, full frame left to right */}
      <div className="cxd-tl">
        <div className="cxd-tl-head">
          <span className="cxd-tl-kick">Timeline</span>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 13, color: CXD.txt2 }}>
            {len} · <b style={{ fontStyle: 'normal', color: CXD.txt }}>V1.2</b> active · {isDay ? 'apartment in daylight — conflict clear' : 'night exterior — 1 conflict'}
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: CXD.txt3 }}>
            {isDay ? 'Apartment flipped to day — the room is square.' : 'One open call: how the apartment scene reads.'}
          </span>
        </div>
        <CxdTimeline state={state} onMode={onMode} />
      </div>
    </div>
  );
}

window.ContextualEditBay = ContextualEditBay;
