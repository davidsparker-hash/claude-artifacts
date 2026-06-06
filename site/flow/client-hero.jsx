/* global React */
// TENET Client Portal — hero tabs: Overview snapshot + Decisions simulator.
const { FK: HFK, FGlyph: HG, CLIENT: HC } = window;
const { CPanel: HP, CPStat: HStat, CPBar: HBar, CPChip: HChip, CPDot: HDot, CPHead: HHead, useCountUp: HCount, cpKicker: HKick, cpKickerFaint: HKickF, cpSerif: HSerif, RISK_COLOR: HRISK } = window;
const HUse = React.useState, HEff = React.useEffect;

function shiftDate(days) {
  const d = new Date(2026, 5, 27); d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ══════════════════════════════════════════════════════════
   OVERVIEW
   ══════════════════════════════════════════════════════════ */
function OverviewTab({ ctx }) {
  const s = HC.status, b = HC.budget, t = HC.timeline, p = HC.priorities;
  const forecast = b.forecast + ctx.forecastDelta;
  const variance = forecast - b.approved;
  const over = variance > 0;
  const delivery = shiftDate(ctx.daysDelta);

  return (
    <div>
      <HHead kicker="Overview"
        lede="A complete read on health, money, and what needs you — in one screen." />

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <CPStatStatus overall={over ? 'At Risk' : s.overall} />
        <HStat label="Forecast final cost" value={HC.money(forecast)} tone={over ? '#B23A2E' : HFK.INK}
          sub={(over ? 'Over by ' : 'Under by ') + HC.money(Math.abs(variance)) + ' vs approved'} />
        <HStat label="Schedule" value={t.currentPhase} sub={t.daysRemaining + ' days to ' + delivery} />
        <HStat label="Deliverables" value="1 pending" sub={'2 approved \u00b7 3 in progress'} />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Health */}
          <HP label="Project health" title="Overall — on track">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {s.health.map(h => (
                <div key={h.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontFamily: HFK.SANS, fontSize: 14, color: HFK.INK }}>{h.label}</span>
                    <span style={{ fontFamily: HFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: h.id === 'creative' ? HFK.AMBER : HFK.INK_MUTED }}>{h.state}</span>
                  </div>
                  <HBar pct={h.score} color={h.id === 'creative' ? HFK.AMBER : HFK.INK} />
                  <div style={{ marginTop: 8, fontFamily: HFK.SANS, fontSize: 12.5, color: HFK.INK_MUTED, lineHeight: 1.4 }}>{h.note}</div>
                </div>
              ))}
            </div>
          </HP>

          {/* Cost drivers */}
          <HP label="Top cost drivers" title="What is moving the number">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {p.costDrivers.map((d, i) => {
                const max = Math.max.apply(null, p.costDrivers.map(x => x.amt));
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                      <span style={{ fontFamily: HFK.SANS, fontSize: 14, color: HFK.INK }}>{d.label}</span>
                      <span style={{ fontFamily: HFK.MONO, fontSize: 12, color: HFK.INK, fontVariantNumeric: 'tabular-nums' }}>{HC.money(d.amt)}</span>
                    </div>
                    <HBar pct={(d.amt / max) * 100} color={HFK.AMBER_200} />
                  </div>
                );
              })}
            </div>
          </HP>

          {/* Activity */}
          <HP label="Recent activity" title="Latest in the room">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {p.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderTop: i ? `1px solid ${HFK.BORDER}` : 'none' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${HFK.BORDER}`, color: a.tone === 'amber' ? HFK.AMBER : HFK.INK_MUTED, background: a.tone === 'amber' ? HFK.AMBER_50 : HFK.PAPER }}><HG name={a.icon} size={15} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: HFK.SANS, fontSize: 14, color: HFK.INK }}>{a.text}</div>
                    <div style={{ fontFamily: HFK.MONO, fontSize: 10.5, letterSpacing: '0.06em', color: HFK.INK_FAINT, marginTop: 2 }}>{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </HP>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Needs approval */}
          <HP label="Needs your approval" title={p.needsApproval.length + ' waiting'} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.needsApproval.map(n => (
                <button key={n.id} onClick={() => ctx.goTab(n.tab)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left', cursor: 'pointer', padding: '13px 14px', borderRadius: 4, border: `1px solid ${n.urgent ? HFK.AMBER : HFK.BORDER}`, background: n.urgent ? HFK.AMBER_50 : HFK.PAPER }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: HFK.SANS, fontSize: 14.5, color: HFK.INK }}>{n.label}</div>
                    <div style={{ fontFamily: HFK.SANS, fontSize: 12.5, color: HFK.INK_MUTED, marginTop: 1 }}>{n.sub}</div>
                  </div>
                  <HG name="arrow" size={15} style={{ color: n.urgent ? HFK.AMBER : HFK.INK_FAINT, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </HP>

          {/* Upcoming milestones */}
          <HP label="Upcoming" title="Milestones" pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {p.milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i ? `1px solid ${HFK.BORDER}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <HDot state={m.state} />
                    <span style={{ fontFamily: HFK.SANS, fontSize: 14, color: m.state === 'current' ? HFK.INK : HFK.INK_MUTED }}>{m.label}</span>
                  </div>
                  <span style={{ fontFamily: HFK.MONO, fontSize: 11, letterSpacing: '0.06em', color: m.state === 'current' ? HFK.AMBER : HFK.INK_FAINT }}>{m.date}</span>
                </div>
              ))}
            </div>
          </HP>

          <button onClick={() => ctx.goTab('decisions')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '18px 22px', borderRadius: 4, border: 'none', background: HFK.INK, color: HFK.PAPER }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: HFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: HFK.AMBER_200 }}>Decision simulator</div>
              <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 18, marginTop: 6 }}>See what a change would do</div>
            </div>
            <HG name="arrow" size={18} style={{ color: HFK.PAPER }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CPStatStatus({ overall }) {
  const onTrack = overall === 'On Track';
  return (
    <div style={{ border: `1px solid ${onTrack ? HFK.BORDER : HFK.AMBER}`, background: onTrack ? HFK.PAPER : HFK.AMBER_50, borderRadius: 4, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={HKickF}>Project status</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: onTrack ? '#1F8A5B' : HFK.AMBER }} />
        <span style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 28, lineHeight: 1, color: HFK.INK }}>{overall}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DECISIONS — the simulator
   ══════════════════════════════════════════════════════════ */
function DecisionsTab({ ctx }) {
  const [sel, setSel] = HUse(HC.decisions[0].id);
  const [revealed, setRevealed] = HUse(false);
  const d = HC.decisions.find(x => x.id === sel);
  const isCommitted = ctx.committed.indexOf(sel) >= 0;

  HEff(() => { setRevealed(false); const id = setTimeout(() => setRevealed(true), 40); return () => clearTimeout(id); }, [sel]);

  const b = HC.budget;
  const forecast = b.forecast + ctx.forecastDelta;
  const variance = forecast - b.approved;
  const over = variance > 0;

  const budgetTarget = revealed ? d.budget : 0;
  const animBudget = HCount(budgetTarget, 700);

  function approve() { if (!isCommitted) ctx.setCommitted(prev => prev.concat([sel])); }
  function undo() { ctx.setCommitted(prev => prev.filter(x => x !== sel)); }

  return (
    <div>
      {/* Running model strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ border: `1px solid ${over ? HFK.AMBER : HFK.BORDER}`, background: over ? HFK.AMBER_50 : HFK.PAPER, borderRadius: 4, padding: '16px 18px' }}>
          <div style={HKickF}>Forecast / approved</div>
          <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 24, marginTop: 8, color: over ? '#B23A2E' : HFK.INK, fontVariantNumeric: 'tabular-nums' }}>{HC.money(forecast)} <span style={{ color: HFK.INK_FAINT, fontSize: 16 }}>/ {HC.money(b.approved)}</span></div>
          <div style={{ marginTop: 10 }}><HBar pct={(forecast / b.approved) * 100} color={over ? '#B23A2E' : HFK.AMBER} /></div>
        </div>
        <div style={{ border: `1px solid ${HFK.BORDER}`, background: HFK.PAPER, borderRadius: 4, padding: '16px 18px' }}>
          <div style={HKickF}>Delivery</div>
          <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 24, marginTop: 8, color: HFK.INK }}>{shiftDate(ctx.daysDelta)}</div>
          <div style={{ fontFamily: HFK.MONO, fontSize: 11, color: ctx.daysDelta ? HFK.AMBER : HFK.INK_FAINT, marginTop: 8 }}>{ctx.daysDelta ? '+' + ctx.daysDelta + ' days committed' : 'On original date'}</div>
        </div>
        <div style={{ border: `1px solid ${HFK.BORDER}`, background: HFK.PAPER, borderRadius: 4, padding: '16px 18px' }}>
          <div style={HKickF}>Committed changes</div>
          <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 24, marginTop: 8, color: HFK.INK }}>{ctx.committed.length}</div>
          <div style={{ fontFamily: HFK.MONO, fontSize: 11, color: HFK.INK_FAINT, marginTop: 8 }}>{ctx.committed.length ? 'Reflected across the portal' : 'Nothing approved yet'}</div>
        </div>
      </div>

      <HHead kicker="Decisions"
        lede="Pick a change. See the budget, schedule, resources, and risk before you approve anything." />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Candidate list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={Object.assign({}, HKickF, { marginBottom: 4 })}>Active decisions</div>
          {HC.decisions.map(o => {
            const on = o.id === sel;
            const com = ctx.committed.indexOf(o.id) >= 0;
            return (
              <button key={o.id} onClick={() => setSel(o.id)} style={{ position: 'relative', textAlign: 'left', cursor: 'pointer', padding: '14px 16px', borderRadius: 4,
                border: `1px solid ${on ? HFK.INK : HFK.BORDER}`, background: on ? HFK.PAPER : 'transparent', boxShadow: on ? '0 6px 18px rgba(0,0,0,0.06)' : 'none', transition: 'all 160ms ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: HFK.SANS, fontSize: 14.5, color: HFK.INK, lineHeight: 1.25 }}>{o.label}</span>
                  {com && <HG name="check" size={14} style={{ color: '#1F8A5B', flexShrink: 0 }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
                  <span style={{ fontFamily: HFK.MONO, fontSize: 11, color: o.budget < 0 ? '#1F8A5B' : HFK.INK_MUTED, fontVariantNumeric: 'tabular-nums' }}>{HC.signed(o.budget)}</span>
                  <span style={{ width: 3, height: 3, borderRadius: 999, background: HFK.INK_FAINT }} />
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: HRISK[o.risk] }} />
                  <span style={{ fontFamily: HFK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: HFK.INK_FAINT }}>{o.risk}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Impact resolver */}
        <div key={sel} style={{ border: `1px solid ${HFK.BORDER_STRONG}`, borderRadius: 6, background: HFK.PAPER, overflow: 'hidden' }}>
          <div style={{ padding: '22px 28px', borderBottom: `1px solid ${HFK.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ fontFamily: HFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: d.kind === 'reduce' ? '#1F8A5B' : HFK.AMBER }}>{d.kind === 'reduce' ? 'Scope reduction' : 'Scope addition'}</div>
              <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 26, marginTop: 8, color: HFK.INK }}>{d.label}</div>
              <div style={{ fontFamily: HFK.SERIF, fontStyle: 'italic', fontSize: 15, color: HFK.INK_MUTED, marginTop: 4 }}>{d.sub}</div>
            </div>
            {isCommitted && <CPChipSm tone="#1F8A5B" label="Committed" />}
          </div>

          {/* Impact grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: HFK.BORDER }}>
            {/* Budget */}
            <ImpactCell label="Budget impact">
              <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 40, lineHeight: 1, color: d.budget < 0 ? '#1F8A5B' : HFK.INK, fontVariantNumeric: 'tabular-nums' }}>{HC.signed(animBudget)}</div>
              <div style={{ fontFamily: HFK.SANS, fontSize: 13, color: HFK.INK_MUTED, marginTop: 10 }}>Forecast would move to <b style={{ color: HFK.INK, fontWeight: 400 }}>{HC.money(forecast + (isCommitted ? 0 : d.budget))}</b></div>
            </ImpactCell>
            {/* Schedule */}
            <ImpactCell label="Schedule impact">
              <div style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 40, lineHeight: 1, color: d.days ? HFK.INK : '#1F8A5B', fontVariantNumeric: 'tabular-nums' }}>{d.days ? '+' + d.days + ' days' : 'No change'}</div>
              <div style={{ marginTop: 14, display: 'flex', gap: 4 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} style={{ flex: 1, height: 6, borderRadius: 1, background: i < 5 ? HFK.INK_FAINT : (i < 5 + d.days ? HFK.AMBER : HFK.BORDER), opacity: revealed ? 1 : 0.2, transition: 'all 320ms ease ' + (i * 50) + 'ms' }} />
                ))}
              </div>
              <div style={{ fontFamily: HFK.SANS, fontSize: 13, color: HFK.INK_MUTED, marginTop: 10 }}>Delivery {d.days ? 'moves to ' : 'holds at '}<b style={{ color: HFK.INK, fontWeight: 400 }}>{shiftDate(ctx.daysDelta + (isCommitted ? 0 : d.days))}</b></div>
            </ImpactCell>
            {/* Resources */}
            <ImpactCell label="Resources activated">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HC.RESOURCE_SET.map((r, i) => {
                  const on = d.resources.indexOf(r) >= 0;
                  return <span key={r} style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(6px)', transition: 'all 300ms ease ' + (i * 55) + 'ms' }}><HChip on={on} dot>{r}</HChip></span>;
                })}
              </div>
              {d.deliverable && <div style={{ fontFamily: HFK.SANS, fontSize: 13, color: HFK.INK_MUTED, marginTop: 14 }}>Adds <b style={{ color: HFK.INK, fontWeight: 400 }}>{d.deliverable}</b></div>}
            </ImpactCell>
            {/* Risk */}
            <ImpactCell label="Risk impact">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: HFK.SANS, fontWeight: 300, fontSize: 40, lineHeight: 1, color: HRISK[d.risk] }}>{d.risk}</span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
                {['Low', 'Medium', 'High'].map((lv, i) => {
                  const active = (d.risk === 'Low' && i === 0) || (d.risk === 'Medium' && i <= 1) || (d.risk === 'High');
                  return <div key={lv} style={{ flex: 1, height: 8, borderRadius: 2, background: active ? HRISK[d.risk] : HFK.BORDER, opacity: revealed ? 1 : 0.25, transition: 'all 320ms ease ' + (i * 90) + 'ms' }} />;
                })}
              </div>
              <div style={{ fontFamily: HFK.SANS, fontSize: 13, color: HFK.INK_MUTED, marginTop: 10 }}>{d.detail}</div>
            </ImpactCell>
          </div>

          {/* Action */}
          <div style={{ padding: '20px 28px', borderTop: `1px solid ${HFK.BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ fontFamily: HFK.SERIF, fontStyle: 'italic', fontSize: 14, color: HFK.INK_MUTED, maxWidth: 440 }}>
              {isCommitted ? 'This change is committed and reflected across Budget, Timeline, and Overview.' : 'Approving simulates the change across the whole portal — nothing is sent to the room yet.'}
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              {isCommitted
                ? <button onClick={undo} style={btnGhost}>Undo</button>
                : <button onClick={approve} style={d.kind === 'reduce' ? btnGreen : btnAmber}>{d.kind === 'reduce' ? 'Apply reduction' : 'Approve change'}</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactCell({ label, children }) {
  return (
    <div style={{ background: HFK.PAPER, padding: '22px 26px', minHeight: 150 }}>
      <div style={Object.assign({}, HKickF, { marginBottom: 16 })}>{label}</div>
      {children}
    </div>
  );
}
function CPChipSm({ label, tone }) {
  return <span style={{ fontFamily: HFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: tone, border: `1px solid ${tone}`, borderRadius: 3, padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 5, height: 5, borderRadius: 999, background: tone }} />{label}</span>;
}

const btnBaseH = { borderRadius: 3, padding: '12px 22px', cursor: 'pointer', fontFamily: HFK.MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none' };
const btnAmber = Object.assign({}, btnBaseH, { background: HFK.AMBER, color: HFK.PAPER });
const btnGreen = Object.assign({}, btnBaseH, { background: '#1F8A5B', color: HFK.PAPER });
const btnGhost = Object.assign({}, btnBaseH, { background: 'transparent', color: HFK.INK, border: `1px solid ${HFK.BORDER_STRONG}` });

Object.assign(window, { OverviewTab, DecisionsTab });
