/* global React */
// TENET — Contextual Interface workspace.
// ONE frame holds the whole project. As focus shifts (grab the budget lever,
// or change seat), the active decision + its consequence resolve forward;
// everything else dims and collapses to a single reachable line — never hidden.
// This replaces the tab-based lane workspaces for the contextual build.

const CX_CSS = `
.cx-frame{position:absolute;inset:0;display:flex;flex-direction:column;background:#EDEDEB;
  --ink:#17171A;--muted:#6A6E76;--faint:#A2A6AE;--hair:rgba(20,20,28,.10);--hair2:rgba(20,20,28,.18);
  --paper:#FFFFFF;--ground:#EDEDEB;--sub:#F6F6F4;--amber:#BA7517;--amber50:#FAEEDA;
  --ok:#1F8A5B;--watch:#BA7517;--risk:#C0392B;
  --sans:var(--font-sans,"Brown","Helvetica Neue",system-ui,sans-serif);
  --serif:var(--font-serif,"Source Serif 4",Georgia,serif);
  --mono:var(--font-mono,"JetBrains Mono",monospace);
  --ease:cubic-bezier(.45,0,.12,1);--T:.72s;}
.cx-mast{flex:0 0 76px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;
  background:var(--paper);border-bottom:1px solid var(--hair);box-shadow:0 1px 0 rgba(20,20,28,.03);position:relative;z-index:5;}
.cx-lock{display:flex;align-items:baseline;gap:14px;}
.cx-wm{font-family:var(--serif);font-style:italic;font-size:24px;color:var(--ink);letter-spacing:.01em;}
.cx-locklbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--amber);white-space:nowrap;}
.cx-div{width:1px;height:18px;background:var(--hair2);align-self:center;}
.cx-proj{font-family:var(--serif);font-style:italic;font-size:15.5px;color:var(--ink);white-space:nowrap;}
.cx-projmeta{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);}
.cx-mright{display:flex;align-items:center;gap:22px;}
.cx-fear{font-family:var(--serif);font-style:italic;font-size:13px;color:var(--faint);white-space:nowrap;max-width:340px;}
.cx-seats{display:inline-flex;border:1px solid var(--hair2);border-radius:3px;overflow:hidden;}
.cx-seat{padding:8px 15px;cursor:pointer;background:var(--paper);border:0;border-left:1px solid var(--hair2);
  font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);transition:color .25s,background .25s;}
.cx-seat:first-child{border-left:0;}
.cx-seat[aria-pressed="true"]{background:var(--ink);color:#fff;}
.cx-resetbtn{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--hair2);border-radius:3px;
  padding:8px 13px;cursor:pointer;color:var(--muted);font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;transition:color .2s,border-color .2s;white-space:nowrap;}
.cx-resetbtn:hover{color:var(--ink);border-color:var(--ink);}

.cx-bands{flex:1;min-height:0;display:flex;flex-direction:column;gap:14px;padding:22px 40px;}
.cx-band{flex:1 1 0;min-height:0;position:relative;display:flex;flex-direction:column;background:var(--sub);
  border:1px solid var(--hair);border-radius:9px;overflow:hidden;cursor:pointer;
  transition:flex-grow var(--T) var(--ease),flex-basis var(--T) var(--ease),opacity .55s var(--ease),
    background .5s var(--ease),box-shadow .5s var(--ease),border-color .5s var(--ease),filter .5s var(--ease);}
.cx-band:hover{border-color:var(--hair2);}
.cx-head{flex:0 0 auto;display:flex;align-items:center;gap:14px;padding:20px 26px;transition:padding var(--T) var(--ease);}
.cx-kick{font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);flex:0 0 132px;}
.cx-line{font-family:var(--serif);font-style:italic;font-size:18px;color:var(--ink);line-height:1.3;flex:1;transition:font-size var(--T) var(--ease),color .5s;}
.cx-line b{font-style:normal;font-weight:600;}
.cx-status{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;}
.cx-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto;}
.cx-grip{flex:0 0 auto;width:18px;color:var(--faint);opacity:0;transition:opacity .4s;font-family:var(--mono);font-size:13px;text-align:center;}
.cx-band:hover .cx-grip{opacity:.7;}
.cx-body{flex:1;min-height:0;overflow:hidden;max-height:0;opacity:0;padding:0 26px;
  transition:max-height var(--T) var(--ease),opacity .5s var(--ease),padding var(--T) var(--ease);}

.cx-frame[data-subject="rest"] .cx-band{flex:1 1 0;opacity:1;}
.cx-frame[data-subject="rest"] .cx-body{max-height:320px;opacity:1;padding:0 26px 22px;}

.cx-band.is-subject{flex-grow:10;background:var(--paper);border-color:var(--hair2);border-left:2px solid var(--amber);
  box-shadow:0 1px 0 rgba(20,20,28,.02),0 24px 60px -22px rgba(20,20,34,.30);}
.cx-band.is-subject .cx-line{font-size:22px;}
.cx-band.is-subject .cx-body{max-height:820px;opacity:1;padding:0 26px 26px;}
.cx-band.is-collapsed{flex:0 0 60px;opacity:.5;filter:saturate(.5);background:var(--sub);}
.cx-band.is-collapsed .cx-head{padding:18px 26px;}
.cx-band.is-collapsed .cx-line{font-size:14px;font-style:normal;font-family:var(--sans);color:var(--muted);}
.cx-band.is-collapsed .cx-body{max-height:0;opacity:0;padding:0 26px;}
.cx-band.is-collapsed:hover{opacity:.85;filter:none;}

.cx-metrics{display:flex;gap:48px;flex-wrap:wrap;}
.cx-metric{display:flex;flex-direction:column;gap:7px;min-width:0;}
.cx-ml{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);}
.cx-mv{font-family:var(--sans);font-weight:300;font-size:34px;line-height:1;color:var(--ink);letter-spacing:-.02em;font-variant-numeric:tabular-nums;transition:color .4s;}
.cx-ms{font-family:var(--sans);font-size:12.5px;color:var(--muted);}
.cx-metric.live .cx-mv{color:var(--amber);}
.cx-reveal{max-height:0;opacity:0;overflow:hidden;transition:max-height var(--T) var(--ease),opacity .55s var(--ease) .08s,margin var(--T) var(--ease);}
.cx-band.is-subject .cx-reveal{max-height:560px;opacity:1;margin-top:26px;}
.cx-rule{height:1px;background:var(--hair);}

.cx-lever{display:flex;flex-direction:column;gap:16px;}
.cx-lvtop{display:flex;align-items:center;justify-content:space-between;}
.cx-lvtitle{font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--amber);}
.cx-lvends{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);}
.cx-lvends b{color:var(--ink);font-weight:500;}
.cx-track{position:relative;height:46px;border-radius:8px;background:var(--sub);border:1px solid var(--hair2);cursor:ew-resize;touch-action:none;user-select:none;}
.cx-fill{position:absolute;left:0;top:0;bottom:0;border-radius:8px 0 0 8px;background:linear-gradient(90deg,rgba(186,117,23,.10),rgba(186,117,23,.22));}
.cx-knob{position:absolute;top:50%;width:30px;height:30px;border-radius:50%;background:var(--paper);border:1.5px solid var(--amber);
  box-shadow:0 4px 14px -4px rgba(20,20,28,.4);transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;}
.cx-knob:after{content:"";width:2px;height:12px;background:var(--amber);border-radius:2px;box-shadow:4px 0 0 var(--amber),-4px 0 0 var(--amber);}
.cx-ticks{position:absolute;inset:0;display:flex;justify-content:space-between;padding:0 22px;align-items:center;pointer-events:none;}
.cx-ticks span{width:1px;height:10px;background:var(--hair2);}
.cx-conseq{display:flex;gap:14px;}
.cx-cq{flex:1;background:var(--sub);border:1px solid var(--hair);border-radius:8px;padding:18px 20px;display:flex;flex-direction:column;gap:8px;transition:background .4s,border-color .4s;}
.cx-cq.hot{border-color:rgba(186,117,23,.45);background:var(--amber50);}
.cx-cql{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);}
.cx-cqv{font-family:var(--sans);font-weight:300;font-size:30px;line-height:1;color:var(--ink);letter-spacing:-.02em;font-variant-numeric:tabular-nums;}
.cx-cqs{font-family:var(--sans);font-size:12px;color:var(--muted);line-height:1.4;}
.cx-note{font-family:var(--serif);font-style:italic;font-size:16px;line-height:1.5;color:var(--muted);max-width:760px;}
.cx-still{aspect-ratio:16/9;width:260px;flex:0 0 260px;background:#0c0c0d;border-radius:6px;position:relative;overflow:hidden;}
.cx-still span{position:absolute;top:12px;left:14px;font-family:var(--mono);font-size:9px;letter-spacing:.18em;color:rgba(255,255,255,.6);}
.cx-feat{display:flex;align-items:center;gap:16px;padding:13px 0;border-top:1px solid var(--hair);}
.cx-feat:first-child{border-top:0;}
.cx-ft{font-family:var(--serif);font-style:italic;font-size:17px;color:var(--ink);flex:1;}
.cx-fm{font-family:var(--mono);font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums;}
.cx-fs{font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;}
.cx-moneyline{margin-top:18px;display:flex;align-items:center;gap:14px;padding:14px 18px;background:var(--sub);border:1px solid var(--hair);border-radius:8px;}

.cx-floor{flex:0 0 56px;display:flex;align-items:center;gap:16px;padding:0 40px;background:var(--paper);border-top:1px solid var(--hair);}
.cx-fk{font-family:var(--mono);font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);}
.cx-ft2{font-family:var(--serif);font-style:italic;font-size:14.5px;color:var(--muted);}
.cx-ft2 b{color:var(--ink);font-style:normal;font-weight:500;}
@media (prefers-reduced-motion: reduce){.cx-band,.cx-body,.cx-reveal,.cx-mv{transition:none !important;}}
`;

(function injectCx(){
  if (document.getElementById('cx-styles')) return;
  const s = document.createElement('style'); s.id = 'cx-styles'; s.textContent = CX_CSS;
  document.head.appendChild(s);
})();

const CXC = window.CONTEXTUAL || {};
const cxMoney = (n) => '$' + Math.round(n).toLocaleString('en-US');
const cxR1k = (n) => Math.round(n / 1000) * 1000;

const CX_SEAT = {
  client:   { lbl: 'Client',   fear: 'Watching it take shape — health at a glance.',            subject: 'rest' },
  producer: { lbl: 'Producer', fear: 'Holding the line — does anything break, and what it costs.', subject: 'budget' },
  director: { lbl: 'Director', fear: 'Shaping the work — the money reads beneath, one line.',     subject: 'creative' },
};

// shared lever: 0 = NIGHT, 1 = DAY
function cxDerive(v) {
  const approved = 500000;
  const forecast = cxR1k(472000 + (454000 - 472000) * v);
  const ot = cxR1k(18000 * (1 - v));
  const under = approved - forecast;
  const conflict = v < 0.55;
  const cont = Math.max(0, Math.min(50000, 50000 - (forecast - 454000)));
  return { approved, forecast, ot, under, conflict, cont };
}

function CXLever({ v, onV, title, hint, ends, idSuffix }) {
  const trackRef = React.useRef(null);
  const drag = React.useRef(false);
  const pct = (v * 88 + 6) + '%';
  function fromX(clientX) {
    const t = trackRef.current; if (!t) return;
    const r = t.getBoundingClientRect();
    onV(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
  }
  return (
    <div className="cx-lever">
      <div className="cx-lvtop">
        <span className="cx-lvtitle">{title}</span>
        <span className="cx-status">{hint}</span>
      </div>
      <div className="cx-track" ref={trackRef}
        onPointerDown={(e) => { drag.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} fromX(e.clientX); e.preventDefault(); e.stopPropagation(); }}
        onPointerMove={(e) => { if (drag.current) fromX(e.clientX); }}
        onPointerUp={() => { drag.current = false; }}
        onPointerCancel={() => { drag.current = false; }}
        onClick={(e) => e.stopPropagation()}>
        <div className="cx-fill" style={{ width: pct }} />
        <div className="cx-ticks"><span /><span /><span /><span /><span /></div>
        <div className="cx-knob" style={{ left: pct }} />
      </div>
      <div className="cx-lvends">{ends}</div>
    </div>
  );
}

function ContextualFrame({ seat: initialSeat, onReset, onSeat }) {
  const FK = window.FK;
  const [seat, setSeat] = React.useState(initialSeat && CX_SEAT[initialSeat] ? initialSeat : 'client');
  const [subject, setSubject] = React.useState(CX_SEAT[initialSeat && CX_SEAT[initialSeat] ? initialSeat : 'client'].subject);
  const [v, setV] = React.useState(0.06);
  const d = cxDerive(v);

  // Re-seed when the lane changes from outside (seat switch in the masthead).
  React.useEffect(() => {
    if (initialSeat && CX_SEAT[initialSeat]) { setSeat(initialSeat); setSubject(CX_SEAT[initialSeat].subject); }
  }, [initialSeat]);

  function chooseSeat(s) {
    if (s === 'director' && onSeat) { onSeat(s); return; }   // hand off to the contextual edit bay
    setSeat(s); setSubject(CX_SEAT[s].subject);
    if (onSeat) onSeat(s);
  }
  function focus(id, e) { if (e) e.stopPropagation(); if (subject !== id) setSubject(id); }
  function grab(id) { if (subject !== id) setSubject(id); }

  const cls = (id) => 'cx-band' + (subject !== 'rest' && subject === id ? ' is-subject'
    : (subject !== 'rest' && subject !== id ? ' is-collapsed' : ''));

  const project = (window.CLIENT && window.CLIENT.project) || { title: 'A Brief History of Selling Ideas', format: ':30 brand film', code: '#17433' };

  return (
    <div className="cx-frame" data-subject={subject}>
      {/* Masthead */}
      <div className="cx-mast">
        <div className="cx-lock">
          <span className="cx-wm">tenet</span>
          <span className="cx-locklbl">{CX_SEAT[seat].lbl}</span>
          <span className="cx-div" />
          <span className="cx-proj">{project.title}</span>
          <span className="cx-projmeta">{project.format} · {project.code}</span>
        </div>
        <div className="cx-mright">
          <span className="cx-fear">{CX_SEAT[seat].fear}</span>
          <div className="cx-seats">
            {['client', 'producer', 'director'].map((s) => (
              <button key={s} className="cx-seat" aria-pressed={seat === s} onClick={() => chooseSeat(s)}>{CX_SEAT[s].lbl}</button>
            ))}
          </div>
          <button className="cx-resetbtn" onClick={onReset}>↩ Change lane</button>
        </div>
      </div>

      {/* Bands */}
      <div className="cx-bands">

        {/* BUDGET */}
        <div className={cls('budget')} onClick={(e) => focus('budget', e)}>
          <div className="cx-head">
            <span className="cx-kick">Budget</span>
            <span className="cx-line">Forecast <b>{cxMoney(d.forecast)}</b> — under approved by <b>{cxMoney(d.under)}</b></span>
            <span className="cx-status"><span className="cx-dot" style={{ background: d.forecast > d.approved ? 'var(--risk)' : 'var(--ok)' }} />{d.forecast > d.approved ? 'Over' : 'Healthy'}</span>
            <span className="cx-grip">⋮⋮</span>
          </div>
          <div className="cx-body">
            <div className="cx-metrics">
              <div className="cx-metric"><span className="cx-ml">Approved</span><span className="cx-mv">{cxMoney(d.approved)}</span><span className="cx-ms">Master bid</span></div>
              <div className="cx-metric live"><span className="cx-ml">Forecast final</span><span className="cx-mv">{cxMoney(d.forecast)}</span><span className="cx-ms">{cxMoney(d.under)} under</span></div>
              <div className="cx-metric"><span className="cx-ml">Contingency</span><span className="cx-mv">{cxMoney(d.cont)}</span><span className="cx-ms">of $50,000 reserve</span></div>
            </div>
            <div className="cx-reveal">
              <div className="cx-rule" style={{ marginBottom: 24 }} />
              <CXLever v={v} onV={(nv) => { grab('budget'); setV(nv); }}
                title="The lever — apartment scene"
                hint={<React.Fragment><span className="cx-dot" style={{ background: 'var(--amber)' }} />Drag to model</React.Fragment>}
                ends={<React.Fragment><span>Shoot <b>Night</b> — premium</span><span>Flip to <b>Day</b> — clears it</span></React.Fragment>} />
              <div className="cx-conseq" style={{ marginTop: 24 }}>
                <div className={'cx-cq' + (d.forecast < d.approved && v < 0.5 ? ' hot' : '')}><span className="cx-cql">Forecast moves to</span><span className="cx-cqv">{cxMoney(d.forecast)}</span><span className="cx-cqs">{v < 0.5 ? 'Carrying the night premium' : 'Premium cleared'}</span></div>
                <div className={'cx-cq' + (d.ot > 0 ? ' hot' : '')}><span className="cx-cql">Crew overtime</span><span className="cx-cqv">{d.ot > 0 ? '+' + cxMoney(d.ot) : cxMoney(0)}</span><span className="cx-cqs">Night exterior load</span></div>
                <div className={'cx-cq' + (d.conflict ? ' hot' : '')}><span className="cx-cql">Delivery</span><span className="cx-cqv">Jun 27</span><span className="cx-cqs">{d.conflict ? '1 schedule conflict' : 'No conflicts — clear'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE */}
        <div className={cls('schedule')} onClick={(e) => focus('schedule', e)}>
          <div className="cx-head">
            <span className="cx-kick">Schedule</span>
            <span className="cx-line">Delivers <b>Jun 27</b> — editorial in progress, <b>{d.conflict ? '1 conflict' : '0 conflicts'}</b></span>
            <span className="cx-status"><span className="cx-dot" style={{ background: d.conflict ? 'var(--watch)' : 'var(--ok)' }} />{d.conflict ? 'Watch' : 'On track'}</span>
            <span className="cx-grip">⋮⋮</span>
          </div>
          <div className="cx-body">
            <div className="cx-metrics">
              <div className="cx-metric"><span className="cx-ml">Delivery</span><span className="cx-mv">Jun 27</span><span className="cx-ms">22 days out</span></div>
              <div className="cx-metric"><span className="cx-ml">Stage</span><span className="cx-mv" style={{ fontSize: 28 }}>Editorial</span><span className="cx-ms">Picture lock waits on review</span></div>
              <div className="cx-metric"><span className="cx-ml">Conflicts</span><span className="cx-mv">{d.conflict ? '1' : '0'}</span><span className="cx-ms">{d.conflict ? 'Night exterior vs. permit window' : 'Permit window clear'}</span></div>
            </div>
            <div className="cx-reveal">
              <div className="cx-rule" style={{ marginBottom: 24 }} />
              <div>
                <div className="cx-feat"><span className="cx-fs" style={{ color: 'var(--ok)', flex: '0 0 70px' }}>Wrapped</span><span className="cx-ft">Principal photography</span><span className="cx-fm">6 days</span></div>
                <div className="cx-feat"><span className="cx-fs" style={{ color: 'var(--amber)', flex: '0 0 70px' }}>Active</span><span className="cx-ft">Editorial — assembling the cut</span><span className="cx-fm">Jun 13 lock</span></div>
                <div className="cx-feat"><span className="cx-fs" style={{ color: 'var(--faint)', flex: '0 0 70px' }}>Upcoming</span><span className="cx-ft">Color · sound · final delivery</span><span className="cx-fm">Jun 27</span></div>
              </div>
              <div className="cx-note" style={{ marginTop: 22 }}>{d.conflict ? 'The night exterior collides with the permit window. Flipping it to day clears the conflict.' : 'Permit window is clear — the apartment runs in daylight and editorial holds its date.'}</div>
            </div>
          </div>
        </div>

        {/* CREATIVE */}
        <div className={cls('creative')} onClick={(e) => focus('creative', e)}>
          <div className="cx-head">
            <span className="cx-kick">Creative</span>
            <span className="cx-line">The cut is landing — <b>1 open call</b>: how the apartment scene reads</span>
            <span className="cx-status"><span className="cx-dot" style={{ background: 'var(--amber)' }} />In review</span>
            <span className="cx-grip">⋮⋮</span>
          </div>
          <div className="cx-body">
            <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start' }}>
              <div className="cx-still"><span>PROGRAM · 16×9</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cx-metrics" style={{ gap: 40 }}>
                  <div className="cx-metric"><span className="cx-ml">Open decision</span><span className="cx-mv" style={{ fontSize: 24 }}>Apartment</span><span className="cx-ms">Night vs. day — the gift scene</span></div>
                  <div className="cx-metric"><span className="cx-ml">Owner</span><span className="cx-mv" style={{ fontSize: 24 }}>Director</span><span className="cx-ms">Producer holds the money lens</span></div>
                </div>
              </div>
            </div>
            <div className="cx-reveal">
              <div className="cx-rule" style={{ margin: '24px 0' }} />
              <CXLever v={v} onV={(nv) => { grab('creative'); setV(nv); }}
                title="The call — how the apartment reads"
                hint={<React.Fragment><span className="cx-dot" style={{ background: 'var(--amber)' }} />Drag to choose</React.Fragment>}
                ends={<React.Fragment><span><b>Night</b> — sells the intimacy</span><span><b>Day</b> — clears the overtime</span></React.Fragment>} />
              <div className="cx-note" style={{ marginTop: 24 }}>{v < 0.5 ? 'Night holds the intimacy of the gift. Your call — the money reads beneath, one line.' : 'Day is cleaner and clears the premium. Your call — the money reads beneath, one line.'}</div>
              <div className="cx-moneyline">
                <span className="cx-kick" style={{ flex: '0 0 110px' }}>Money lens</span>
                <span className="cx-line" style={{ fontSize: 16 }}>Night exterior — crew OT <b>{d.ot > 0 ? '+' + cxMoney(d.ot) : cxMoney(0)}</b></span>
                <span className="cx-status"><span className="cx-dot" style={{ background: d.ot > 0 ? 'var(--watch)' : 'var(--ok)' }} />{d.ot > 0 ? 'Carried' : 'Cleared'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCOPE */}
        <div className={cls('scope')} onClick={(e) => focus('scope', e)}>
          <div className="cx-head">
            <span className="cx-kick">Scope</span>
            <span className="cx-line">Agreed deliverables on plan — <b>2 additions</b> logged and priced</span>
            <span className="cx-status"><span className="cx-dot" style={{ background: 'var(--ok)' }} />Clear</span>
            <span className="cx-grip">⋮⋮</span>
          </div>
          <div className="cx-body">
            <div>
              <div className="cx-feat"><span className="cx-ft">:30 master + :15 cutdown</span><span className="cx-fm">Agreed</span><span className="cx-fs" style={{ color: 'var(--ok)' }}>In scope</span></div>
              <div className="cx-feat"><span className="cx-ft">Social verticals (×3)</span><span className="cx-fm">+$6,000</span><span className="cx-fs" style={{ color: 'var(--amber)' }}>Added</span></div>
              <div className="cx-feat"><span className="cx-ft">Extended director's cut</span><span className="cx-fm">+$0</span><span className="cx-fs" style={{ color: 'var(--faint)' }}>Proposed</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* Floor — the reachable line; cost stays legible in every state */}
      <div className="cx-floor">
        <span className="cx-fk">Room</span>
        <span className="cx-ft2">{d.ot > 0
          ? <React.Fragment><b>M. Hall · Producer:</b> Night is +{cxMoney(d.ot)} of crew OT. Day clears it — your call on the room, I just hold the line.</React.Fragment>
          : <React.Fragment><b>M. Hall · Producer:</b> Day it is — premium cleared, variance holds. Sending the updated board.</React.Fragment>}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="cx-resetbtn" disabled={subject === 'rest'} onClick={() => setSubject('rest')} style={{ opacity: subject === 'rest' ? 0.35 : 1 }}>↩ Back to overview</button>
        </div>
      </div>
    </div>
  );
}

window.ContextualFrame = ContextualFrame;
