/* global React, TK, Glyph, useTween, Switch, DeptChip, BreathingDot */
// The director seat — the shot view. The client's budget-language change
// arrives here as the thing the director actually needs: shots struck,
// a location dropped, downstream tasks that evaporate.

// Full superset of scenes (Tokyo always in the DOM so it can collapse in/out).
function allScenesInOrder() {
  const out = [];
  window.TENET.SCENES.forEach(s => {
    out.push(s);
    if (s.id === 's3') out.push(window.TENET.TOKYO);
  });
  return out;
}

// A task chip that collapses horizontally when it evaporates.
function TaskSlot({ present, dept, label, atRisk }) {
  return (
    <span style={{
      display: 'inline-flex', overflow: 'hidden', whiteSpace: 'nowrap',
      maxWidth: present ? 160 : 0, opacity: present ? 1 : 0,
      marginRight: present ? 8 : 0,
      transform: present ? 'translateX(0)' : 'translateX(-6px)',
      transition: 'max-width .42s cubic-bezier(.4,0,.2,1), opacity .34s ease-out, margin-right .42s ease-out, transform .42s ease-out',
    }}>
      <DeptChip dept={dept} label={label} atRisk={atRisk} />
    </span>
  );
}

function SceneRow({ scene, present, tasks }) {
  return (
    <div style={{
      maxHeight: present ? 96 : 0, opacity: present ? 1 : 0,
      overflow: 'hidden',
      transition: 'max-height .45s cubic-bezier(.4,0,.2,1), opacity .34s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18,
        padding: '15px 0', borderBottom: `1px solid ${TK.BORDER}` }}>
        <span style={{ fontFamily: TK.MONO, fontSize: 11, color: TK.INK_FAINT, width: 34, flexShrink: 0 }}>SC{scene.n}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 18, color: TK.INK,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scene.name}</div>
          <div style={{ fontFamily: TK.SANS, fontSize: 12, color: TK.INK_FAINT, marginTop: 3,
            display: 'flex', gap: 10 }}>
            <span>{scene.detail}</span>
            <span style={{ color: TK.BORDER_STRONG }}>·</span>
            <span style={{ fontFamily: TK.MONO }}>{scene.location}</span>
          </div>
        </div>
        <span style={{ fontFamily: TK.MONO, fontSize: 12, color: TK.INK_MUTED, width: 70, flexShrink: 0,
          textAlign: 'right' }}>{scene.shots} shots</span>
        <div style={{ display: 'flex', alignItems: 'center', width: 230, flexShrink: 0, justifyContent: 'flex-end' }}>
          {tasks.map((t, i) => (
            <TaskSlot key={t.label + i} present={t.present} dept={t.dept} label={t.label} atRisk={t.atRisk} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DirectorSeat({ state, derived, onFlag }) {
  const shots = useTween(derived.shots, 700);
  const tasks = useTween(derived.taskCount, 700);
  const scenes = allScenesInOrder();
  const heroPresent = !state.cuts['s5'];
  const heroHasComp = state.heroLen !== 6;
  const flagAvailable = heroPresent && heroHasComp;

  // Resolve each scene's task presence (superset, so chips can collapse).
  function tasksFor(s) {
    if (s.isHero) {
      const comp = { dept:'VFX', label:'Product comp', present: heroHasComp && !state.cuts[s.id], atRisk: state.flag };
      return [ comp,
        { dept:'Color', label:'Grade', present: !state.cuts[s.id] },
        { dept:'Sound', label:'Mix',   present: !state.cuts[s.id] } ];
    }
    const present = s.id === 'sT' ? state.addTokyo : !state.cuts[s.id];
    return s.tasks.map(t => ({ dept: t.dept, label: t.label, present }));
  }
  function presentOf(s) { return s.id === 'sT' ? state.addTokyo : !state.cuts[s.id]; }

  return (
    <div style={{ height: '100%', boxSizing: 'border-box', padding: '64px 70px 56px',
      display: 'flex', flexDirection: 'column', background: TK.PAPER_SOFT }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: TK.AMBER }}>Director</span>
        <span style={{ width: 26, height: 1, background: TK.BORDER_STRONG }}/>
        <span style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: TK.INK_FAINT, whiteSpace: 'nowrap' }}>Shot breakdown</span>
      </div>
      <div style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontWeight: 400,
        fontSize: 38, lineHeight: 1.05, color: TK.INK, marginTop: 6 }}>The work, as shots.</div>
      <div style={{ fontFamily: TK.SANS, fontSize: 14, color: TK.INK_MUTED, marginTop: 8,
        display: 'flex', gap: 18 }}>
        <span><b style={{ fontWeight: 400, color: TK.INK }}>{Math.round(shots)}</b> shots</span>
        <span style={{ color: TK.BORDER_STRONG }}>·</span>
        <span><b style={{ fontWeight: 400, color: TK.INK }}>{derived.scenes.length}</b> scenes</span>
        <span style={{ color: TK.BORDER_STRONG }}>·</span>
        <span><b style={{ fontWeight: 400, color: TK.INK }}>{Math.round(tasks)}</b> downstream tasks</span>
      </div>

      {/* Scene rows */}
      <div style={{ marginTop: 26 }}>
        {scenes.map(s => (
          <SceneRow key={s.id} scene={s} present={presentOf(s)} tasks={tasksFor(s)} />
        ))}
      </div>

      {/* The director's one live control — the constraint that travels up */}
      <div style={{ marginTop: 'auto', paddingTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <BreathingDot />
          <span style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: TK.AMBER, whiteSpace: 'nowrap' }}>Schedule check</span>
          <span style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 13, color: TK.INK_FAINT, whiteSpace: 'nowrap' }}>
            — run the moat the other way
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18,
          padding: '18px 22px', background: TK.PAPER, border: `1px solid ${state.flag ? TK.AMBER : TK.BORDER}`,
          borderRadius: 4, transition: 'border-color .3s ease-out',
          opacity: flagAvailable ? 1 : 0.45 }}>
          <span style={{ color: state.flag ? TK.AMBER : TK.INK_MUTED, display: 'flex', flexShrink: 0 }}>
            <Glyph name="alert" size={22} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: TK.SANS, fontSize: 15, color: TK.INK }}>
              SC5 · Product comp — 280 render-hours over the window
            </div>
            <div style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 13, color: TK.INK_MUTED, marginTop: 3 }}>
              {flagAvailable
                ? (state.flag ? 'Flagged. A second vendor is on it — and the client already knows the cost.'
                              : 'This VFX shot can\u2019t land in the timeline. Flag it and watch it ripple up.')
                : (heroPresent ? 'The 6s cut has no product comp — nothing to flag.' : 'SC5 is cut — nothing to flag.')}
            </div>
          </div>
          <Switch on={state.flag} onClick={onFlag} disabled={!flagAvailable} />
        </div>
      </div>
    </div>
  );
}

window.DirectorSeat = DirectorSeat;
