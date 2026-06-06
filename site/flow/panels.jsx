/* global React, FK, FGlyph, FLOW */
// Shared panels — the script (right) and the shot timeline (bottom).

// ── Script panel ────────────────────────────────────────────────────
const scriptStyles = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: FK.PAPER, minHeight: 0 },
  head: { padding: '22px 40px 14px', borderBottom: `1px solid ${FK.BORDER}`, flexShrink: 0,
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
  kicker: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER },
  fname: { fontFamily: FK.MONO, fontSize: 11, color: FK.INK_FAINT },
  body: { flex: 1, overflow: 'auto', padding: '26px 40px 40px' },
  titleblock: { textAlign: 'center', marginBottom: 30 },
  title: { fontFamily: FK.SCRIPT, fontSize: 24, color: FK.INK, letterSpacing: '0.02em' },
  logline: { fontFamily: FK.SCRIPT, fontStyle: 'italic', fontSize: 14, color: FK.INK_FAINT, marginTop: 8 },
  scene: (dropped) => ({ marginBottom: 22, opacity: dropped ? 0.32 : 1 }),
  slug: (hot, dropped) => ({
    fontFamily: FK.SCRIPT, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: FK.INK,
    textTransform: 'uppercase', marginBottom: 8, padding: '3px 8px', marginLeft: -8,
    borderLeft: hot ? `2px solid ${FK.AMBER}` : '2px solid transparent',
    background: hot ? FK.AMBER_50 : 'transparent',
    textDecorationLine: dropped ? 'line-through' : 'none',
  }),
  para: (hot) => ({ fontFamily: FK.SCRIPT, fontSize: 15, lineHeight: 1.5, color: FK.INK,
    padding: '4px 8px', marginLeft: -8, marginBottom: 4,
    background: hot ? FK.AMBER_50 : 'transparent',
    boxShadow: hot ? `inset 2px 0 0 ${FK.AMBER}` : 'none' }),
};

function slugFor(scene, state) {
  const loc = FLOW.LOCS.find(l => l.id === scene.locId);
  return `${loc.kind}. ${loc.name.toUpperCase()} \u2014 ${FLOW.todOf(scene, state)}`;
}

function ScriptPanel({ state, sel, flashId }) {
  const S = scriptStyles;
  const active = new Set(FLOW.activeScenes(state).map(s => s.id));
  return (
    <div style={S.root}>
      <div style={S.head}>
        <span style={S.kicker}>Script</span>
        <span style={S.fname}>MERIDIAN_a-day-held_v3.fdx</span>
      </div>
      <div style={S.body}>
        <div style={S.titleblock}>
          <div style={S.title}>{FLOW.TITLE}</div>
          <div style={S.logline}>{FLOW.LOGLINE}</div>
        </div>
        {FLOW.SCENES.map(scene => {
          const dropped = !active.has(scene.id);
          const selLoc = sel && sel.type === 'loc' && sel.id === scene.locId;
          const selScene = sel && sel.type === 'scene' && sel.id === scene.id;
          const selChar = sel && sel.type === 'char' && scene.chars.includes(sel.id);
          const flash = flashId === scene.id;
          const slugHot = selLoc || selScene || flash;
          return (
            <div key={scene.id} style={S.scene(dropped)}>
              <div style={S.slug(slugHot, dropped)}>
                <span style={{ color: FK.INK_FAINT, marginRight: 10, fontWeight: 400 }}>{scene.n}</span>
                {slugFor(scene, state)}
              </div>
              {scene.action.map((p, i) => {
                const hot = (selChar && p.chars.includes(sel.id)) || selScene || (flash && i === 0);
                return <div key={i} style={S.para(hot)}>{p.text}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Timeline panel ──────────────────────────────────────────────────
const tlStyles = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: FK.PAPER_SOFT,
    borderTop: `1px solid ${FK.BORDER}`, padding: '20px 40px 24px', boxSizing: 'border-box' },
  head: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 },
  kicker: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER, whiteSpace: 'nowrap' },
  lenWrap: { display: 'flex', alignItems: 'baseline', gap: 10 },
  lenLabel: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: FK.INK_FAINT },
  len: { fontFamily: FK.SANS, fontWeight: 300, fontSize: 40, color: FK.INK, lineHeight: 1, letterSpacing: '-0.01em' },
  track: { display: 'flex', alignItems: 'flex-end', gap: 5, height: 78 },
  group: { display: 'flex', alignItems: 'flex-end', gap: 4 },
  groupGap: { width: 16, flexShrink: 0 },
  box: (state) => ({
    width: 58, height: state.tall ? 64 : 52, flexShrink: 0,
    border: `1px solid ${state.on ? FK.AMBER : FK.BORDER_STRONG}`,
    background: state.on ? FK.AMBER_50 : FK.PAPER,
    position: 'relative', cursor: 'default',
  }),
  dot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 999, background: FK.AMBER },
  ruler: { display: 'flex', justifyContent: 'space-between', marginTop: 14,
    borderTop: `1px solid ${FK.BORDER}`, paddingTop: 8 },
  tick: { fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT },
  sceneLabel: (hot) => ({ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: hot ? FK.AMBER : FK.INK_FAINT, marginTop: 8, textAlign: 'center' }),
};

function ModeToggle({ mode, onMode }) {
  const opts = [30, 15];
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${FK.BORDER_STRONG}`, borderRadius: 2, overflow: 'hidden' }}>
      {opts.map((m, i) => (
        <button key={m} onClick={() => onMode(m)} style={{
          padding: '6px 13px', fontFamily: FK.MONO, fontSize: 12, cursor: 'pointer', border: 'none',
          borderLeft: i ? `1px solid ${FK.BORDER}` : 'none',
          background: mode === m ? FK.AMBER : FK.PAPER, color: mode === m ? FK.PAPER : FK.INK_MUTED,
        }}>:{m}</button>
      ))}
    </div>
  );
}

function TimelinePanel({ state, sel, flashId, onMode }) {
  const S = tlStyles;
  const scenes = FLOW.activeScenes(state);
  const totalLen = FLOW.totalLength(state);
  const totalShots = scenes.reduce((a, s) => a + s.shots.length, 0);

  // Staggered reveal on mount — timer-driven so it survives paused rAF.
  const [revealed, setRevealed] = React.useState(0);
  React.useEffect(() => {
    let n = 0;
    const id = setInterval(() => { n += 1; setRevealed(n); if (n >= 30) clearInterval(id); }, 60);
    // Guarantee every box is shown even where timers are throttled.
    const fb = setTimeout(() => setRevealed(30), 1500);
    return () => { clearInterval(id); clearTimeout(fb); };
  }, []);

  let shotIndex = 0;
  return (
    <div style={S.root}>
      <div style={S.head}>
        <span style={S.kicker}>Timeline · the cut</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <ModeToggle mode={state.mode} onMode={onMode} />
          <div style={S.lenWrap}>
            <span style={S.lenLabel}>Length</span>
            <span style={S.len}>{FLOW.fmtClock(totalLen)}</span>
          </div>
        </div>
      </div>

      <div style={S.track}>
        {scenes.map((scene, si) => {
          const selLoc = sel && sel.type === 'loc' && sel.id === scene.locId;
          const flash = flashId === scene.id;
          return (
            <React.Fragment key={scene.id}>
              {si > 0 && <div style={S.groupGap} />}
              <div>
                <div style={S.group}>
                  {scene.shots.map(sh => {
                    const idx = shotIndex++;
                    const shown = idx < revealed;
                    if (!shown) return <div key={sh.id} style={{ width: 58, height: 52, flexShrink: 0 }} />;
                    const selChar = sel && sel.type === 'char' && sh.chars.includes(sel.id);
                    const selScene = sel && sel.type === 'scene' && sel.id === scene.id;
                    const on = selLoc || selScene || selChar || flash;
                    return (
                      <div key={sh.id} title={`${sh.desc} · ${sh.dur}s`} style={S.box({ on, tall: on })}>
                        {selChar && <span style={S.dot} />}
                      </div>
                    );
                  })}
                </div>
                <div style={S.sceneLabel((sel && sel.type === 'scene' && sel.id === scene.id) || selLoc || flash)}>{FLOW.locName(scene.locId)}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={S.ruler}>
        <span style={S.tick}>0:00</span>
        <span style={S.tick}>{FLOW.fmtClock(totalLen / 2)}</span>
        <span style={S.tick}>{FLOW.fmtClock(totalLen)}</span>
      </div>
    </div>
  );
}

window.ScriptPanel = ScriptPanel;
window.TimelinePanel = TimelinePanel;

// ── Subcategory tab strip — the six subs of the selected Top-10 item ──
const subBar = {
  root: { flex: '0 0 auto', height: 76, borderBottom: `1px solid ${FK.BORDER}`, background: FK.PAPER,
    padding: '0 40px', display: 'flex', alignItems: 'center', gap: 22 },
  cat: { display: 'flex', alignItems: 'baseline', gap: 9, flexShrink: 0 },
  catN: { fontFamily: FK.MONO, fontSize: 11, color: FK.AMBER, letterSpacing: '0.08em' },
  catName: { fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 19, color: FK.INK, whiteSpace: 'nowrap' },
  tabs: { display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0, height: '100%' },
  tab: (on) => ({ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', textAlign: 'center', padding: '0 6px',
    fontFamily: FK.MONO, fontSize: 10.5, letterSpacing: '0.04em',
    color: on ? FK.INK : FK.INK_FAINT,
    borderBottom: `2px solid ${on ? FK.AMBER : 'transparent'}`,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
  cyc: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  arrow: { width: 28, height: 28, borderRadius: 999, border: `1px solid ${FK.BORDER_STRONG}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: FK.INK_MUTED },
  pos: { fontFamily: FK.MONO, fontSize: 11, color: FK.INK_FAINT, width: 32, textAlign: 'center' },
};

function SubTabBar({ cat, subIdx, onSub }) {
  const S = subBar;
  if (!cat) return <div style={S.root} />;
  const subs = cat.subs;
  const go = d => onSub((subIdx + d + subs.length) % subs.length);
  return (
    <div style={S.root}>
      <div style={S.cat}>
        <span style={S.catN}>{String(cat.n).padStart(2, '0')}</span>
        <span style={S.catName}>{cat.name}</span>
      </div>
      <div style={S.tabs}>
        {subs.map((s, i) => (
          <div key={i} title={s} style={S.tab(i === subIdx)} onClick={() => onSub(i)}>{s}</div>
        ))}
      </div>
      <div style={S.cyc}>
        <div style={S.arrow} onClick={() => go(-1)}><FGlyph name="arrow" size={14} style={{ transform: 'scaleX(-1)' }} /></div>
        <span style={S.pos}>{subIdx + 1} / {subs.length}</span>
        <div style={S.arrow} onClick={() => go(1)}><FGlyph name="arrow" size={14} /></div>
      </div>
    </div>
  );
}

window.SubTabBar = SubTabBar;
