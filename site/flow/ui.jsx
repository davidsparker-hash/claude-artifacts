/* global React */
// TENET flow — shared UI: First Experience tokens, line icons, tween, scaling.

const FK = {
  INK: '#1A1A1A', INK_MUTED: '#6B6B6B', INK_FAINT: '#9A9A9A',
  PAPER: '#FFFFFF', PAPER_RAISED: '#FBFBFA', PAPER_SOFT: '#F4F4F2', PAPER_DIM: '#ECECEA',
  AMBER: '#BA7517', AMBER_50: '#FAEEDA', AMBER_200: '#EF9F27', AMBER_800: '#854F0B',
  BORDER: 'rgba(0,0,0,0.10)', BORDER_STRONG: 'rgba(0,0,0,0.18)',
  SHADOW_LIFT: '0 1px 0 rgba(20,20,22,0.02), 0 12px 34px -16px rgba(20,20,30,0.20)',
  SHADOW_POP: '0 28px 64px -22px rgba(20,20,30,0.28)',
  OK: '#1F8A5B', DANGER: '#B23A2E',
  SANS: '"Brown","Avenir Next","Helvetica Neue",system-ui,sans-serif',
  SERIF: '"Source Serif 4","Source Serif Pro",Georgia,serif',
  MONO: '"JetBrains Mono","SF Mono",Menlo,monospace',
  SCRIPT: '"Times New Roman",Times,serif',
};

function FGlyph({ name, size = 24, sw = 1.5, style }) {
  const base = { width: size, height: size, viewBox: '0 0 32 32', fill: 'none',
    stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const P = {
    mic: (<><rect x="12" y="4" width="8" height="16" rx="4"/><path d="M7 14a9 9 0 0 0 18 0"/><path d="M16 23v5"/><path d="M12 28h8"/></>),
    phone: (<><path d="M7 6.5C7 5.7 7.7 5 8.5 5h3.2c.7 0 1.3.5 1.4 1.2l.7 4c.1.6-.2 1.2-.7 1.5l-2 1.2a14 14 0 0 0 7 7l1.2-2c.3-.5.9-.8 1.5-.7l4 .7c.7.1 1.2.7 1.2 1.4v3.2c0 .8-.7 1.5-1.5 1.5A18.5 18.5 0 0 1 7 6.5z"/></>),
    upload: (<><path d="M16 4v16M10 10l6-6 6 6"/><path d="M5 22v4a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-4"/></>),
    script: (<><path d="M8 4h12l5 5v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M20 4v5h5"/><path d="M11 15h10M11 19h10M11 23h6"/></>),
    chat: (<><path d="M27 19a2 2 0 0 1-2 2H11l-5 5V8a2 2 0 0 1 2-2h17a2 2 0 0 1 2 2z"/></>),
    send: (<><path d="M28 4 14 18M28 4l-9 24-5-10-10-5 24-9z"/></>),
    pin: (<><path d="M25 13c0 7-9 15-9 15s-9-8-9-15a9 9 0 0 1 18 0Z"/><circle cx="16" cy="13" r="3.4"/></>),
    user: (<><circle cx="16" cy="11" r="5"/><path d="M6 27a10 10 0 0 1 20 0"/></>),
    clock: (<><circle cx="16" cy="16" r="12"/><path d="M16 8v8l5 3"/></>),
    arrow: (<><path d="M6 16h20M18 8l8 8-8 8"/></>),
    check: (<><path d="M27 8 12 23l-7-7"/></>),
    x: (<><path d="M8 8l16 16M24 8 8 24"/></>),
    plus: (<><path d="M16 6v20M6 16h20"/></>),
    film: (<><rect x="4" y="7" width="24" height="18" rx="2"/><path d="M10 7v18M22 7v18M4 13h6M22 13h6M4 19h6M22 19h6"/></>),
    video: (<><rect x="4" y="9" width="17" height="14" rx="2.5"/><path d="M21 13.5l7-4v13l-7-4z"/></>),
    review: (<><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z"/><circle cx="16" cy="16" r="4.2"/></>),
  };
  return <svg {...base}>{P[name] || null}</svg>;
}

// Interruptible count tween — guarantees the destination even if rAF is paused.
function useFTween(value, dur = 600) {
  const [disp, setDisp] = React.useState(value);
  const ref = React.useRef(value);
  const raf = React.useRef();
  React.useEffect(() => {
    const from = ref.current, to = value;
    if (Math.abs(from - to) < 0.001) { ref.current = to; setDisp(to); return; }
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    let done = false;
    const finish = () => { if (done) return; done = true; ref.current = to; setDisp(to); };
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      ref.current = from + (to - from) * e; setDisp(ref.current);
      if (p < 1) raf.current = requestAnimationFrame(tick); else finish();
    };
    raf.current = requestAnimationFrame(tick);
    const fb = setTimeout(finish, dur + 80);
    return () => { cancelAnimationFrame(raf.current); clearTimeout(fb); };
  }, [value, dur]);
  return disp;
}

function fitFlowStage() {
  const st = document.getElementById('stage');
  if (!st) return;
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const s = Math.min(vw / 1920, vh / 1080);
  // Dimensions not ready yet (can be 0 on first paint in some embeds) —
  // never apply scale(0); reschedule until the frame has real size.
  if (!(s > 0) || !isFinite(s)) { setTimeout(fitFlowStage, 60); return; }
  st.style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', fitFlowStage);
if (typeof ResizeObserver !== 'undefined') {
  try { new ResizeObserver(() => fitFlowStage()).observe(document.documentElement); } catch (e) {}
}

Object.assign(window, { FK, FGlyph, useFTween, fitFlowStage });
