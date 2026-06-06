/* global React, FK, FGlyph */
// Entry screens — lane select + upload gate, in the First Experience register.

const laneStyles = {
  wrap: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: FK.PAPER },
  kicker: { fontFamily: FK.MONO, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase',
    color: FK.AMBER, marginBottom: 64, whiteSpace: 'nowrap' },
  row: { display: 'flex', alignItems: 'stretch', gap: 0 },
  opt: (hover) => ({ width: 340, padding: '8px 40px', textAlign: 'center', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center' }),
  divider: { width: 1, background: FK.BORDER, alignSelf: 'stretch', margin: '6px 0' },
  label: (hover) => ({ fontFamily: FK.SANS, fontWeight: 300, fontSize: 42, letterSpacing: '0.04em',
    color: hover ? FK.AMBER : FK.INK, lineHeight: 1, whiteSpace: 'nowrap' }),
  rule: (hover) => ({ width: 40, height: 1, background: hover ? FK.AMBER : FK.BORDER_STRONG,
    margin: '22px 0' }),
  exp: { fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 18, color: FK.INK_MUTED,
    lineHeight: 1.4, maxWidth: 240 },
  brief: { fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15, color: FK.INK_FAINT,
    marginTop: 64, whiteSpace: 'nowrap' },
};

function LaneSelect({ onPick }) {
  const S = laneStyles;
  const [hover, setHover] = React.useState(null);
  const opts = [
    { id: 'director', label: 'Creative', exp: 'Shape the work. Script, shots, and the craft of the cut.' },
    { id: 'producer', label: 'Production', exp: 'Hold the line. Cost, schedule, and every change in dollars.' },
    { id: 'client', label: 'Client', exp: 'Watch it take shape. Approve before a single frame is shot.' },
  ];
  return (
    <div style={S.wrap}>
      <div style={S.kicker}>Pick a lane</div>
      <div style={S.row}>
        {opts.map((o, i) => (
          <React.Fragment key={o.id}>
            {i > 0 && <div style={S.divider} />}
            <div style={S.opt(hover === o.id)} onMouseEnter={() => setHover(o.id)}
              onMouseLeave={() => setHover(null)} onClick={() => onPick(o.id)}>
              <div style={S.label(hover === o.id)}>{o.label}</div>
              <div style={S.rule(hover === o.id)} />
              <div style={S.exp}>{o.exp}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={S.brief}>Three seats, one project. Choose where you sit.</div>
    </div>
  );
}

const upStyles = {
  wrap: { position: 'absolute', inset: 0, background: FK.PAPER },
  center: { position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center' },
  icons: { display: 'flex', alignItems: 'flex-start', gap: 92, marginBottom: 44 },
  iconCol: (active) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    cursor: active ? 'pointer' : 'default', opacity: active ? 1 : 0.32 }),
  iconLabel: (active) => ({ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: active ? FK.AMBER : FK.INK_FAINT }),
  prompt: { fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 19, color: FK.INK_MUTED },
  ring: (active) => ({ width: 92, height: 92, borderRadius: '50%',
    border: `1px solid ${active ? FK.AMBER : FK.BORDER}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? FK.AMBER : FK.INK_FAINT, background: active ? FK.AMBER_50 : FK.PAPER }),
  fileRow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 6,
    fontFamily: FK.MONO, fontSize: 13, color: FK.INK },
  bar: { width: 320, height: 2, background: FK.BORDER, marginTop: 22, position: 'relative' },
  barFill: (p) => ({ position: 'absolute', left: 0, top: 0, height: 2, width: p + '%', background: FK.AMBER }),
};

function UploadGate({ lane, onUploaded }) {
  const S = upStyles;
  const [phase, setPhase] = React.useState('idle'); // idle | uploading
  const [prog, setProg] = React.useState(0);

  const isClient = lane === 'client';

  function startUpload() {
    if (phase !== 'idle') return;
    setPhase('uploading');
    let p = 0;
    const id = setInterval(() => { p = Math.min(100, p + 12); setProg(p); if (p >= 100) clearInterval(id); }, 90);
    // Completion is one timer, not dependent on the bar's many ticks.
    setTimeout(onUploaded, 1400);
  }

  // Client seats don't upload a script — they review the cut. The active
  // action becomes Review (straight through to the cut); Upload is greyed.
  const tools = isClient ? [
    { id: 'mic', label: 'Record', active: false },
    { id: 'phone', label: 'Call', active: false },
    { id: 'upload', label: 'Upload', active: false },
    { id: 'review', label: 'Review', active: true, action: onUploaded },
  ] : [
    { id: 'mic', label: 'Record', active: false },
    { id: 'phone', label: 'Call', active: false },
    { id: 'upload', label: 'Upload', active: true, action: startUpload },
    { id: 'video', label: 'Video call', active: false },
  ];

  return (
    <div style={S.wrap}>
      <div style={S.center}>
        <div style={S.icons}>
          {tools.map(t => (
            <div key={t.id} style={S.iconCol(t.active)} onClick={t.active ? t.action : undefined}>
              <div style={S.ring(t.active)}><FGlyph name={t.id} size={32} /></div>
              <div style={S.iconLabel(t.active)}>{t.label}</div>
            </div>
          ))}
        </div>

        {phase === 'idle' && (
          <div style={S.prompt}>{isClient ? 'Open the latest cut to review.' : 'Upload a script to begin.'}</div>
        )}
        {phase === 'uploading' && (
          <>
            <div style={S.fileRow}>
              <FGlyph name="script" size={16} style={{ color: FK.AMBER }} />
              A_Brief_History_of_Selling_Ideas_v3.fdx
            </div>
            <div style={S.bar}><div style={S.barFill(prog)} /></div>
            <div style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: FK.INK_FAINT, marginTop: 12 }}>
              {prog < 100 ? 'Reading scenes\u2026' : 'Building scaffold\u2026'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.LaneSelect = LaneSelect;
window.UploadGate = UploadGate;
