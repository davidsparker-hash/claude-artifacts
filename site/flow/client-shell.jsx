/* global React */
// TENET Client Portal — app shell, primary nav, and shared primitives.
// Decision state is lifted here so an approved change ripples into the
// Budget forecast, the Timeline delivery date, and the Overview snapshot.
const { FK, FGlyph, CLIENT } = window;
const { useState: cpUseState, useEffect: cpUseEffect, useRef: cpUseRef } = React;

// ── Shared style atoms ──────────────────────────────────────
const cpKicker = { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: FK.AMBER, whiteSpace: 'nowrap' };
const cpKickerFaint = { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: FK.INK_FAINT, whiteSpace: 'nowrap' };
const cpPanelTitle = { fontFamily: FK.SANS, fontWeight: 300, fontSize: 22, lineHeight: 1.1, color: FK.INK, marginTop: 8 };
const cpSerif = { fontFamily: FK.SERIF, fontStyle: 'italic', fontWeight: 300 };

const STATE_COLOR = { done: FK.INK_FAINT, current: FK.AMBER, upcoming: FK.INK_FAINT };
const RISK_COLOR = { Low: '#1F8A5B', Medium: FK.AMBER, High: '#B23A2E' };

// ── Panel ───────────────────────────────────────────────────
// `subject` lifts the panel onto the bright foreground plane (warm shadow +
// amber spine) — the resolved focus. At rest, panels stay flat hairline
// surfaces (legible context). This is the morph contract, made physical.
function CPanel({ label, title, right, children, style, pad, subject }) {
  const base = subject
    ? { border: `1px solid ${FK.BORDER}`, background: FK.PAPER, borderRadius: 6,
        boxShadow: FK.SHADOW_LIFT, borderLeft: `2px solid ${FK.AMBER}` }
    : { border: `1px solid ${FK.BORDER}`, background: FK.PAPER, borderRadius: 6 };
  return (
    <div style={Object.assign(base, { padding: pad == null ? 28 : pad }, style)}>
      {(label || title || right) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: title ? 20 : 16, gap: 16 }}>
          <div>
            {label && <div style={cpKicker}>{label}</div>}
            {title && <div style={cpPanelTitle}>{title}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────
function CPStat({ label, value, sub, tone, big, subject }) {
  return (
    <div style={{ border: `1px solid ${FK.BORDER}`, background: FK.PAPER, borderRadius: 6, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0,
      boxShadow: subject ? FK.SHADOW_LIFT : 'none' }}>
      <div style={cpKickerFaint}>{label}</div>
      <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: big ? 36 : 29, lineHeight: 1, color: tone || FK.INK, letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontFamily: FK.SANS, fontSize: 12.5, color: FK.INK_MUTED, lineHeight: 1.35 }}>{sub}</div>}
    </div>
  );
}

// ── Bar ─────────────────────────────────────────────────────
function CPBar({ pct, color, track, h }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: h || 4, background: track || FK.BORDER, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.max(0, Math.min(100, pct)) + '%', background: color || FK.AMBER, borderRadius: 999, transition: 'width 700ms cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  );
}

// ── Pill / chip ─────────────────────────────────────────────
function CPChip({ children, on, tone, dot }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 3, whiteSpace: 'nowrap',
      border: `1px solid ${on ? (tone || FK.AMBER) : FK.BORDER}`, background: on ? FK.AMBER_50 : 'transparent',
      fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: on ? (tone || FK.AMBER_800) : FK.INK_MUTED, transition: 'all 260ms ease' }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 999, background: on ? (tone || FK.AMBER) : FK.INK_FAINT }} />}
      {children}
    </span>
  );
}

// ── Status dot ──────────────────────────────────────────────
function CPDot({ state, size }) {
  const s = size || 7;
  const filled = state === 'current' || state === 'done';
  return <span style={{ width: s, height: s, borderRadius: 999, flexShrink: 0,
    background: state === 'current' ? FK.AMBER : (state === 'done' ? FK.INK : 'transparent'),
    border: state === 'upcoming' ? `1.5px solid ${FK.BORDER_STRONG}` : 'none', boxSizing: 'border-box' }} />;
}

// ── Section heading inside a tab ────────────────────────────
function CPHead({ kicker, title, lede }) {
  return (
    <div style={{ marginBottom: title ? 28 : 22 }}>
      {kicker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: title ? 16 : 10 }}>
          <span style={{ width: 22, height: 2, background: FK.AMBER, display: 'inline-block' }} />
          <div style={cpKicker}>{kicker}</div>
        </div>
      )}
      {title && <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.02em', color: FK.INK }}>{title}</div>}
      {lede && <div style={{ marginTop: title ? 16 : 0, maxWidth: 640, fontFamily: FK.SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 19, lineHeight: 1.5, color: FK.INK_MUTED }}>{lede}</div>}
    </div>
  );
}

// ── Count-up number (for the simulator) ─────────────────────
function useCountUp(target, dur) {
  const [v, setV] = cpUseState(target);
  const ref = cpUseRef({ from: target, to: target, t0: 0, raf: 0 });
  cpUseEffect(() => {
    const st = ref.current; st.from = v; st.to = target; st.t0 = 0;
    cancelAnimationFrame(st.raf);
    const tick = (ts) => {
      if (!st.t0) st.t0 = ts;
      const p = Math.min(1, (ts - st.t0) / (dur || 650));
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(st.from + (st.to - st.from) * e));
      if (p < 1) st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(st.raf);
    // eslint-disable-next-line
  }, [target]);
  return v;
}

// ── Header + nav + tab router ───────────────────────────────
function ClientPortal({ onReset }) {
  const [tab, setTab] = cpUseState('reviews');     // land on the cut, per spec
  const [committed, setCommitted] = cpUseState([]); // approved decision ids
  const [notifOpen, setNotifOpen] = cpUseState(false);
  const scrollRef = cpUseRef(null);

  const cd = CLIENT.decisions.filter(d => committed.indexOf(d.id) >= 0);
  const forecastDelta = cd.reduce((a, d) => a + d.budget, 0);
  const daysDelta = cd.reduce((a, d) => a + d.days, 0);

  function goTab(t) { setTab(t); setNotifOpen(false); if (scrollRef.current) scrollRef.current.scrollTop = 0; }

  const ctx = { committed, setCommitted, forecastDelta, daysDelta, goTab };

  const VIEWS = {
    overview: window.OverviewTab, reviews: window.ReviewsTab, timeline: window.TimelineTab,
    budget: window.BudgetTab, scope: window.ScopeTab, risks: window.RisksTab, decisions: window.DecisionsTab,
  };
  const View = VIEWS[tab] || function () { return null; };
  const approvalCount = CLIENT.priorities.needsApproval.length;

  return (
    <div style={{ position: 'absolute', inset: 0, background: FK.PAPER_SOFT, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ flex: '0 0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: `1px solid ${FK.BORDER}`, background: FK.PAPER, position: 'relative', zIndex: 20, boxShadow: '0 1px 0 rgba(38,28,12,0.035)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 15 }}>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 23, color: FK.INK, letterSpacing: '0.01em' }}>tenet</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: FK.AMBER, whiteSpace: 'nowrap' }}>Client Portal</span>
          <span style={{ width: 1, height: 17, background: FK.BORDER_STRONG, display: 'inline-block', alignSelf: 'center' }} />
          <span style={Object.assign({}, cpSerif, { fontSize: 15.5, color: FK.INK, whiteSpace: 'nowrap' })}>{CLIENT.project.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ display: 'none', alignItems: 'center', gap: 8, color: FK.INK_FAINT }} />
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotifOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, cursor: 'pointer', padding: 0, color: notifOpen ? FK.AMBER : FK.INK_MUTED }}>
              <FGlyph name="pin" size={16} />
              <span style={{ fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.08em', color: 'inherit' }}>{approvalCount} waiting</span>
            </button>
            {notifOpen && (
              <div style={{ position: 'absolute', top: 30, right: 0, width: 320, background: FK.PAPER, border: `1px solid ${FK.BORDER_STRONG}`, borderRadius: 6, boxShadow: '0 18px 48px rgba(0,0,0,0.14)', padding: 8, zIndex: 40 }}>
                <div style={Object.assign({}, cpKickerFaint, { padding: '8px 10px 10px' })}>Notification center</div>
                {CLIENT.notifications.map((n, i) => (
                  <button key={i} onClick={() => goTab(n.tab)} style={{ display: 'flex', alignItems: 'baseline', gap: 12, width: '100%', textAlign: 'left', background: 'none', border: 0, borderTop: `1px solid ${FK.BORDER}`, padding: '12px 10px', cursor: 'pointer' }}>
                    <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: FK.AMBER, flex: '0 0 64px' }}>{n.kind}</span>
                    <span style={{ fontFamily: FK.SANS, fontSize: 13, color: FK.INK, lineHeight: 1.4 }}>{n.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="reset-btn" onClick={onReset}><FGlyph name="arrow" size={13} style={{ transform: 'scaleX(-1)' }} /> Change lane</button>
        </div>
      </div>

      {/* Primary nav */}
      <div style={{ flex: '0 0 auto', height: 50, display: 'flex', alignItems: 'stretch', gap: 2, padding: '0 30px', borderBottom: `1px solid ${FK.BORDER}`, background: FK.PAPER, position: 'relative', zIndex: 10 }}>
        {CLIENT.NAV.map(n => {
          const on = n.id === tab;
          return (
            <button key={n.id} onClick={() => goTab(n.id)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, borderBottom: on ? `2px solid ${FK.AMBER}` : '2px solid transparent', cursor: 'pointer', padding: '0 16px', marginBottom: -1, transition: 'color 200ms ease',
              fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: on ? FK.INK : FK.INK_FAINT }}>
              {n.label}
              {n.id === 'decisions' && <span style={{ width: 5, height: 5, borderRadius: 999, background: FK.AMBER }} />}
            </button>
          );
        })}
      </div>

      {/* Scroll body */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 48px 64px' }}>
          <View ctx={ctx} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CPanel, CPStat, CPBar, CPChip, CPDot, CPHead, useCountUp, ClientPortal,
  cpKicker, cpKickerFaint, cpPanelTitle, cpSerif, STATE_COLOR, RISK_COLOR,
});
