/* global React */
// TENET Live Demo — shared UI: tokens, line icons, tween hook, dials.

const TK = {
  INK: '#1A1A1A', INK_MUTED: '#6B6B6B', INK_FAINT: '#9A9A9A',
  PAPER: '#FFFFFF', PAPER_SOFT: '#FAF8F4',
  AMBER: '#BA7517', AMBER_50: '#FAEEDA', AMBER_800: '#854F0B',
  BORDER: 'rgba(0,0,0,0.10)', BORDER_STRONG: 'rgba(0,0,0,0.18)',
  SANS: '"Brown","Avenir Next","Helvetica Neue",system-ui,sans-serif',
  SERIF: '"Source Serif 4","Source Serif Pro",Georgia,serif',
  MONO: '"JetBrains Mono","SF Mono",Menlo,monospace',
};

// ── Line icons — single weight, currentColor (matches the wordmark) ──
function Glyph({ name, size = 20, sw = 1.5, style }) {
  const base = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const P = {
    scissors: (<><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></>),
    pin: (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>),
    ruler: (<><path d="M3 9h18M3 9v6h18V9M7 9v3M11 9v3M15 9v3M19 9v3"/></>),
    alert: (<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>),
    arrow: (<><path d="M5 12h14M13 6l6 6-6 6"/></>),
    check: (<><path d="M20 6 9 17l-5-5"/></>),
    plus: (<><path d="M12 5v14M5 12h14"/></>),
    clapper: (<><path d="M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.5-4 4 .8M9.5 5.8 13 5l-2 4M13 5l4 .8-2 3.2M17 5.8 20.5 5 21 9"/></>),
    layers: (<><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>),
    user: (<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>),
    reset: (<><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>),
  };
  return <svg {...base}>{P[name] || null}</svg>;
}

// ── Tween hook — interruptible count animation ──────────────────────
function useTween(value, dur = 650) {
  const [disp, setDisp] = React.useState(value);
  const dispRef = React.useRef(value);
  const raf = React.useRef();
  React.useEffect(() => {
    const from = dispRef.current, to = value;
    if (Math.abs(from - to) < 0.001) { dispRef.current = to; setDisp(to); return; }
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    let done = false;
    const finish = () => { if (done) return; done = true; dispRef.current = to; setDisp(to); };
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      dispRef.current = from + (to - from) * e; setDisp(dispRef.current);
      if (p < 1) raf.current = requestAnimationFrame(tick); else finish();
    };
    raf.current = requestAnimationFrame(tick);
    // Guarantee the destination even where rAF is throttled/paused (the resting
    // value can never depend on frames actually painting).
    const fb = setTimeout(finish, dur + 80);
    return () => { cancelAnimationFrame(raf.current); clearTimeout(fb); };
  }, [value, dur]);
  return disp;
}

// ── Switch — a calm, unmistakably-live toggle ───────────────────────
function Switch({ on, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      width: 44, height: 24, borderRadius: 999, position: 'relative', flexShrink: 0,
      border: `1px solid ${on ? TK.AMBER : TK.BORDER_STRONG}`,
      background: on ? TK.AMBER : TK.PAPER,
      cursor: disabled ? 'default' : 'pointer', padding: 0,
      opacity: disabled ? 0.35 : 1,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 22 : 2,
        width: 18, height: 18, borderRadius: 999,
        background: on ? TK.PAPER : TK.INK_FAINT,
      }}/>
    </button>
  );
}

// ── Segmented control — amber selection ─────────────────────────────
function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${TK.BORDER_STRONG}`, borderRadius: 2, overflow: 'hidden' }}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '7px 16px', fontFamily: TK.MONO, fontSize: 13, fontWeight: 500,
            letterSpacing: '0.02em', cursor: 'pointer',
            border: 'none', borderLeft: i ? `1px solid ${TK.BORDER}` : 'none',
            background: active ? TK.AMBER : TK.PAPER,
            color: active ? TK.PAPER : TK.INK_MUTED,
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ── Department chip — the downstream task tag ───────────────────────
function DeptChip({ dept, label, atRisk }) {
  const muted = TK.INK_MUTED;
  return (
    <span title={label} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px', borderRadius: 2,
      fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.04em',
      border: `1px solid ${atRisk ? TK.AMBER : TK.BORDER}`,
      background: atRisk ? TK.AMBER_50 : TK.PAPER,
      color: atRisk ? TK.AMBER_800 : muted,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: atRisk ? TK.AMBER : (dept === 'VFX' ? TK.INK : TK.INK_FAINT) }}/>
      {dept}
    </span>
  );
}

// ── Breathing amber dot — the "live" / "translating" pulse ──────────
function BreathingDot({ size = 6, color = TK.AMBER }) {
  return (
    <span style={{ display: 'inline-block', width: size, height: size, borderRadius: 999,
      background: color, animation: 'tenetBreathe 1.6s ease-in-out infinite' }}/>
  );
}

Object.assign(window, { TK, Glyph, useTween, Switch, Segmented, DeptChip, BreathingDot });
