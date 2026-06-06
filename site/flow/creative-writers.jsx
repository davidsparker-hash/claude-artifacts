/* global React */
// TENET Creative — Writers Room. A working surface (like the edit bay):
// read one script version full-frame or compare two side by side. The script
// sits on white PAGES with borders (clear separation in compare); the desk,
// controls and cut timeline stay dark. Selecting a scene highlights its clip.
const { FK: WFK, CREATIVE: WC } = window;

// Fixed paper palette for the script pages (independent of lane theme).
const WPAGE = { bg: '#FFFFFF', ink: '#1A1A1A', ink2: '#565656', ink3: '#9A9A9A',
  amber: '#BA7517', amber800: '#854F0B', line: 'rgba(0,0,0,0.14)', line2: 'rgba(0,0,0,0.08)',
  sel: '#FBF3E4', read: '#1F8A5B', cut: '#B23A2E' };

function wText(lines) { return lines ? lines.map(function (l) { return l.text; }).join(' · ') : ''; }

function WLine(props) {
  const l = props.l, changed = props.changed;
  if (l.k === 'vo') {
    return (
      <div style={{ borderLeft: '2px solid ' + (changed ? WPAGE.amber : 'rgba(0,0,0,0.12)'), paddingLeft: 12, margin: '7px 0', background: changed ? WPAGE.sel : 'transparent', borderRadius: changed ? '0 3px 3px 0' : 0 }}>
        <span style={{ fontFamily: WFK.MONO, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: WPAGE.amber, display: 'block', marginBottom: 3 }}>VO</span>
        <span style={{ fontFamily: WFK.SCRIPT || WFK.SERIF, fontSize: 14.5, lineHeight: 1.5, color: changed ? WPAGE.amber800 : WPAGE.ink }}>{l.text}</span>
      </div>
    );
  }
  return <div style={{ fontFamily: WFK.SCRIPT || WFK.SERIF, fontSize: 14, lineHeight: 1.55, color: changed ? WPAGE.amber800 : WPAGE.ink2, margin: '6px 0', background: changed ? WPAGE.sel : 'transparent', borderRadius: changed ? 3 : 0, padding: changed ? '2px 6px' : 0 }}>{l.text}</div>;
}

function WBody(props) {
  const lines = props.lines, other = props.other;
  return (
    <div>
      {lines.map(function (l, i) {
        const o = other && other[i];
        const changed = !!other && (!o || o.text !== l.text);
        return <WLine key={i} l={l} changed={changed} />;
      })}
    </div>
  );
}

// One white script page for a version. otherId (optional) drives diff marking.
function WPage(props) {
  const ck = props.ck, versionId = props.versionId, otherId = props.otherId;
  const sections = props.sections, sel = props.sel, onToggle = props.onToggle, isRight = props.isRight;
  const v = WC.writers.versions.find(function (x) { return x.id === versionId; });
  return (
    <div style={{ background: WPAGE.bg, border: '1px solid ' + WPAGE.line, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 26px', borderBottom: '1px solid ' + WPAGE.line2 }}>
        <span style={{ fontFamily: WFK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: WPAGE.amber }}>{v.tag}</span>
        <span style={{ fontFamily: WFK.MONO, fontSize: 10, color: WPAGE.ink3 }}>{v.file}</span>
      </div>
      <div style={{ padding: '8px 26px 26px' }}>
        {sections.map(function (s) {
          const lines = WC.writers.resolve(versionId, s.sceneId);
          const other = otherId ? WC.writers.resolve(otherId, s.sceneId) : null;
          if (!lines) {
            return (
              <div key={s.sceneId} style={{ padding: '16px 0', borderTop: '1px solid ' + WPAGE.line2, opacity: 0.5 }}>
                <div style={{ fontFamily: WFK.MONO, fontSize: 10.5, letterSpacing: '0.1em', color: WPAGE.ink3 }}>{String(s.n).padStart(2, '0')} · {s.slug}</div>
                <div style={{ fontFamily: WFK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: WPAGE.ink3, marginTop: 5 }}>Not in this draft</div>
              </div>
            );
          }
          const on = sel.indexOf(s.sceneId) >= 0;
          let tag = null;
          if (otherId) {
            if (!other) tag = isRight ? { t: 'Added', c: WPAGE.read } : { t: 'Cut', c: WPAGE.cut };
            else if (wText(lines) !== wText(other)) tag = { t: 'Revised', c: WPAGE.amber };
          }
          return (
            <button key={s.sceneId} onClick={function () { onToggle(s.sceneId); }} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0, borderTop: '1px solid ' + WPAGE.line2,
              background: on ? WPAGE.sel : 'transparent', boxShadow: on ? 'inset 3px 0 0 ' + WPAGE.amber : 'none', padding: '14px 14px 14px', borderRadius: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: WFK.MONO, fontSize: 10.5, letterSpacing: '0.1em', color: on ? WPAGE.amber800 : WPAGE.ink }}>{String(s.n).padStart(2, '0')} · {s.slug}</span>
                {tag && <span style={{ fontFamily: WFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: tag.c, flexShrink: 0 }}>{tag.t}</span>}
              </div>
              <WBody lines={lines} other={other} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WritersRoom(props) {
  const ck = props.ck;
  const versions = WC.writers.versions;
  const sections = WC.writers.sections;
  const b = WC.breakdown;
  const [mode, setMode] = React.useState('single');
  const [ver, setVer] = React.useState('v4');
  const [left, setLeft] = React.useState('v2');
  const [right, setRight] = React.useState('v4');
  const [sel, setSel] = React.useState([]);

  function toggle(sceneId) { setSel(function (p) { return p.indexOf(sceneId) >= 0 ? p.filter(function (x) { return x !== sceneId; }) : p.concat([sceneId]); }); }

  const activeScenes = mode === 'single'
    ? (versions.find(function (v) { return v.id === ver; }) || {}).scenes || []
    : sections.map(function (s) { return s.sceneId; }).filter(function (id) { return WC.writers.resolve(left, id) || WC.writers.resolve(right, id); });

  const chip = function (id, active, onClick) {
    const v = versions.find(function (x) { return x.id === id; });
    return (
      <button key={id} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 10px', borderRadius: 3, whiteSpace: 'nowrap',
        border: '1px solid ' + (active ? ck.amber : ck.line2), background: active ? ck.amberDim : 'transparent', fontFamily: WFK.MONO, fontSize: 10, letterSpacing: '0.06em', color: active ? ck.amber : ck.txt2 }}>
        {active && <span style={{ width: 5, height: 5, borderRadius: 999, background: ck.amber }} />}{v.tag}
        <span style={{ color: ck.txt3 }}>{v.date}</span>
      </button>
    );
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: ck.bg0 }}>
      {/* ── control bar ── */}
      <div style={{ flex: '0 0 auto', minHeight: 52, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', borderBottom: '1px solid ' + ck.line, background: ck.bg1, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: WFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: ck.amber }}>Writers Room</span>
        <div style={{ display: 'inline-flex', border: '1px solid ' + ck.line2, borderRadius: 3, overflow: 'hidden' }}>
          {[['single', 'Full frame'], ['compare', 'Compare']].map(function (pair, i) {
            const id = pair[0], label = pair[1];
            return <div key={id} onClick={function () { setMode(id); }} style={{ padding: '6px 13px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: WFK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: i ? '1px solid ' + ck.line2 : 'none', background: mode === id ? ck.amber : ck.bg2, color: mode === id ? ck.bg0 : ck.txt2 }}>{label}</div>;
          })}
        </div>
        {mode === 'single' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {versions.map(function (v) { return chip(v.id, ver === v.id, function () { setVer(v.id); }); })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: WFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ck.txt3 }}>A</span>
            <div style={{ display: 'flex', gap: 6 }}>{versions.map(function (v) { return chip(v.id, left === v.id, function () { setLeft(v.id); }); })}</div>
            <span style={{ color: ck.txt3, fontFamily: WFK.MONO, fontSize: 12 }}>{'→'}</span>
            <span style={{ fontFamily: WFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ck.txt3 }}>B</span>
            <div style={{ display: 'flex', gap: 6 }}>{versions.map(function (v) { return chip(v.id, right === v.id, function () { setRight(v.id); }); })}</div>
          </div>
        )}
        <span style={{ marginLeft: 'auto', fontFamily: WFK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: ck.txt3 }}>{sel.length ? sel.length + ' scene' + (sel.length === 1 ? '' : 's') + ' on the timeline' : 'Select a scene to mark the cut'}</span>
      </div>

      {/* ── breakdown strip (folded in from the Script view) ── */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 26, padding: '8px 22px', borderBottom: '1px solid ' + ck.line, background: ck.bg0 }}>
        {[['Scenes', b.scenes], ['Locations', b.locations], ['Cast', b.characters], ['Runtime', b.runtime]].map(function (pair) {
          return (
            <span key={pair[0]} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontFamily: WFK.MONO, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: ck.txt3 }}>{pair[0]}</span>
              <span style={{ fontFamily: WFK.SANS, fontSize: 14, color: ck.txt2 }}>{pair[1]}</span>
            </span>
          );
        })}
      </div>

      {/* ── script pages ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {mode === 'single' ? (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '30px 24px 44px' }}>
            <WPage ck={ck} versionId={ver} sections={sections} sel={sel} onToggle={toggle} />
          </div>
        ) : (
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
            <WPage ck={ck} versionId={left} otherId={right} isRight={false} sections={sections} sel={sel} onToggle={toggle} />
            <WPage ck={ck} versionId={right} otherId={left} isRight={true} sections={sections} sel={sel} onToggle={toggle} />
          </div>
        )}
      </div>

      {/* ── timeline ── */}
      <WTimeline ck={ck} sections={sections} activeScenes={activeScenes} sel={sel} onToggle={toggle} />
    </div>
  );
}

// Cut timeline: scene clips proportional to duration. Selected → amber.
// Scenes not in the active draft are faded ("not written yet").
function WTimeline(props) {
  const ck = props.ck, sections = props.sections, activeScenes = props.activeScenes, sel = props.sel, onToggle = props.onToggle;
  const total = sections.reduce(function (a, s) { return a + s.dur; }, 0);
  const ticks = []; for (var t = 0; t <= total; t += 5) ticks.push(t);
  return (
    <div style={{ flex: '0 0 auto', background: ck.bg1, borderTop: '1px solid ' + ck.line2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderBottom: '1px solid ' + ck.line }}>
        <span style={{ fontFamily: WFK.MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ck.txt3 }}>The cut · V1.2</span>
        <span style={{ fontFamily: WFK.SANS, fontWeight: 300, fontSize: 18, color: ck.txt }}>{window.FLOW.fmtClock(total)}</span>
      </div>
      <div style={{ padding: '12px 18px 6px' }}>
        <div style={{ display: 'flex', gap: 4, height: 46 }}>
          {sections.map(function (s) {
            const present = activeScenes.indexOf(s.sceneId) >= 0;
            const on = sel.indexOf(s.sceneId) >= 0;
            const stripe = ck === window.DK_LIGHT
              ? 'repeating-linear-gradient(135deg, #E7E2D8 0 7px, #ded8cc 7px 14px)'
              : 'repeating-linear-gradient(135deg, #20262d 0 7px, #1a1f25 7px 14px)';
            return (
              <button key={s.sceneId} onClick={function () { if (present) onToggle(s.sceneId); }} title={s.loc} style={{ flex: s.dur, minWidth: 0, cursor: present ? 'pointer' : 'default', textAlign: 'left',
                background: on ? ck.amberDim : (present ? ck.clipBlue : stripe), border: '1px solid ' + (on ? ck.amber : (present ? ck.clipEdge : ck.line2)), borderRadius: 2,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px 7px', overflow: 'hidden', opacity: present ? 1 : 0.55 }}>
                <span style={{ fontFamily: WFK.MONO, fontSize: 8.5, color: on ? ck.amber : (present ? ck.clipText : ck.txt3), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.loc}</span>
                <span style={{ fontFamily: WFK.MONO, fontSize: 8, color: on ? ck.amber : (present ? ck.clipSub : ck.txt3) }}>{String(s.n).padStart(2, '0')}{present ? '' : ' · —'}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
          {ticks.map(function (tk) { return <span key={tk} style={{ position: 'absolute', left: (tk / total * 100) + '%', top: 3, fontFamily: WFK.MONO, fontSize: 9, color: ck.txt3, transform: 'translateX(1px)' }}>{'01:00:' + String(tk).padStart(2, '0')}</span>; })}
        </div>
      </div>
    </div>
  );
}

window.WritersRoom = WritersRoom;
