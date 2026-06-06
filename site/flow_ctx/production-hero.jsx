/* global React */
// TENET Production Portal — hero tabs: Dashboard, Budget (expandable), Scenarios.
const { FK: DFK, FGlyph: DG, PROD: DC } = window;
const { CPanel: DP, CPStat: DStat, CPBar: DBar, CPChip: DChip, CPHead: DHead, useCountUp: DCount,
  cpKickerFaint: DKickF, RISK_COLOR: DRISK, SEV_COLOR: DSEV } = window;
const DUse = React.useState;
const RES_BUDGET = { wrapped: { c: '#9A9A9A', t: 'Wrapped' }, active: { c: '#BA7517', t: 'Active' }, pending: { c: '#9A9A9A', t: 'Pending' } };

/* ══════════════════════════════════════════════════════════
   DASHBOARD — producer mission control
   ══════════════════════════════════════════════════════════ */
function PDashboard({ ctx }) {
  const d = DC.dashboard;
  const b = d.budget;
  const projForecast = b.forecast + ctx.savings;  // savings negative
  const hasScenarios = ctx.active.length > 0;

  return (
    <div>
      <DHead kicker="Dashboard"
        lede="The operational read — money, schedule, resources, and what’s flashing red." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 16 }}>
        <DStat label="Approved budget" value={DC.money(b.approved)} />
        <DStat label="Actual spend" value={DC.money(b.actual)} sub="Committed to date" />
        <DStat label="Forecast final" value={DC.money(projForecast)} tone={hasScenarios ? '#1F8A5B' : DFK.INK} sub={hasScenarios ? DC.signed(ctx.savings) + ' w/ scenarios' : 'On plan'} />
        <DStat label="Variance" value={(b.variance < 0 ? '\u2212' : '+') + DC.money(b.variance)} tone={b.variance > 0 ? '#B23A2E' : '#1F8A5B'} sub={b.variance < 0 ? 'Under approved' : 'Over approved'} />
        <DStat label="Contingency" value={DC.money(b.contingency)} sub={'of ' + DC.money(b.reserve) + ' reserve'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        <DP label="Project health" title="Status across the board">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {d.health.map(h => (
              <div key={h.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: DFK.SANS, fontSize: 14, color: DFK.INK }}>{h.label}</span>
                  <span style={{ fontFamily: DFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: h.score >= 80 ? '#1F8A5B' : (h.score >= 70 ? DFK.AMBER : '#B23A2E') }}>{h.state}</span>
                </div>
                <DBar pct={h.score} color={h.score >= 80 ? '#1F8A5B' : (h.score >= 70 ? DFK.AMBER : '#B23A2E')} />
                <div style={{ marginTop: 8, fontFamily: DFK.SANS, fontSize: 12.5, color: DFK.INK_MUTED, lineHeight: 1.4 }}>{h.note}</div>
              </div>
            ))}
          </div>
        </DP>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DP label="Alerts" title={null} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {d.alerts.map((a, i) => (
                <button key={i} onClick={() => ctx.goTab(a.tab)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', background: 'none', border: 0, borderTop: i ? `1px solid ${DFK.BORDER}` : 'none', padding: '13px 0', cursor: 'pointer', width: '100%' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: DSEV[a.sev], marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: DSEV[a.sev], marginBottom: 3 }}>{a.kind}</div>
                    <div style={{ fontFamily: DFK.SANS, fontSize: 13.5, color: DFK.INK, lineHeight: 1.4 }}>{a.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </DP>

          <button onClick={() => ctx.goTab('scenarios')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '18px 22px', borderRadius: 4, border: 'none', background: DFK.INK, color: DFK.PAPER }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: DFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: DFK.AMBER_200 }}>Changes</div>
              <div style={{ fontFamily: DFK.SANS, fontWeight: 300, fontSize: 18, marginTop: 6 }}>Model a change</div>
            </div>
            <DG name="arrow" size={18} style={{ color: DFK.PAPER }} />
          </button>
        </div>
      </div>

      {/* Risks — merged in from the old Risks tab */}
      <div style={{ marginTop: 28 }}>
        <div style={Object.assign({}, DKickF, { marginBottom: 14 })}>Risks · priced exposure</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {DC.risks.map(r => (
            <div key={r.id} style={{ border: `1px solid ${DFK.BORDER}`, borderRadius: 6, background: DFK.PAPER, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 16px', borderBottom: `1px solid ${DFK.BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontFamily: DFK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: DFK.AMBER, whiteSpace: 'nowrap' }}>{r.type} risk</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DFK.INK_FAINT }}>Prob</span>
                    <span style={{ fontFamily: DFK.SANS, fontSize: 13, color: DRISK[r.prob] }}>{r.prob}</span>
                  </span>
                </div>
                <div style={{ fontFamily: DFK.SANS, fontWeight: 300, fontSize: 19, lineHeight: 1.2, color: DFK.INK }}>{r.title}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: DFK.BORDER }}>
                {[['Exposure', r.exposure, DFK.INK], ['Cost impact', r.cost ? '+' + DC.money(r.cost) : '\u2014', r.cost ? '#B23A2E' : DFK.INK_FAINT], ['Schedule', r.days ? '+' + r.days + 'd' : '\u2014', r.days ? DFK.AMBER : DFK.INK_FAINT]].map(([k, v, c], i) => (
                  <div key={i} style={{ background: DFK.PAPER, padding: '14px 18px' }}>
                    <div style={{ fontFamily: DFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: DFK.INK_FAINT, marginBottom: 6 }}>{k}</div>
                    <div style={{ fontFamily: DFK.SANS, fontSize: 15, color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px 22px', borderTop: `1px solid ${DFK.BORDER}`, background: DFK.PAPER_SOFT }}>
                <div style={Object.assign({}, DKickF, { marginBottom: 8 })}>Mitigation</div>
                <div style={{ fontFamily: DFK.SANS, fontSize: 13.5, color: DFK.INK, lineHeight: 1.5 }}>{r.mitigation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BUDGET — level 1 + expandable level 2 (drivers)
   ══════════════════════════════════════════════════════════ */
function PBudget({ ctx }) {
  const [open, setOpen] = DUse('crew');
  const [shotsOpen, setShotsOpen] = DUse(false);
  const [resOpen, setResOpen] = DUse(false);
  const cats = DC.budgetCats.concat([DC.contingency]);
  const b = DC.dashboard.budget;
  const maxDriver = Math.max.apply(null, DC.topDrivers.map(d => d.amt));

  return (
    <div>
      <DHead kicker="Budget"
        lede="Open any line to see the drivers — the system already knows why." />

      {/* approved budget summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        <DStat label="Approved budget" value={DC.money(b.approved)} />
        <DStat label="Forecast final" value={DC.money(b.forecast)} sub="On plan" />
        <DStat label="Variance" value={(b.variance < 0 ? '\u2212' : '+') + DC.money(b.variance)} tone={b.variance > 0 ? '#B23A2E' : '#1F8A5B'} sub={b.variance < 0 ? 'Under approved' : 'Over approved'} />
      </div>

      <div style={{ border: `1px solid ${DFK.BORDER}`, borderRadius: 6, background: DFK.PAPER, overflow: 'hidden' }}>
        {/* header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 28px', gap: 16, padding: '14px 22px', borderBottom: `1px solid ${DFK.BORDER}`, alignItems: 'center' }}>
          {['Category', 'Budget', 'Actual', 'Forecast', 'Variance', ''].map((h, i) => (
            <div key={i} style={{ fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: DFK.INK_FAINT, textAlign: i === 0 ? 'left' : (i === 5 ? 'center' : 'right') }}>{h}</div>
          ))}
        </div>
        {cats.map((c, idx) => {
          const isOpen = open === c.id;
          const over = c.variance > 0;
          const isCont = c.id === 'cont';
          return (
            <div key={c.id} style={{ borderTop: idx ? `1px solid ${DFK.BORDER}` : 'none', background: isOpen ? DFK.PAPER_SOFT : DFK.PAPER }}>
              <button onClick={() => setOpen(isOpen ? null : c.id)} style={{ width: '100%', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 28px', gap: 16, padding: '15px 22px', alignItems: 'center', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontFamily: DFK.SANS, fontSize: 15, color: DFK.INK, display: 'flex', alignItems: 'center', gap: 10 }}>{isCont && <span style={{ width: 6, height: 6, borderRadius: 999, background: DFK.AMBER }} />}{c.name}</span>
                <span style={numCell(DFK.INK_MUTED)}>{DC.money(c.budget)}</span>
                <span style={numCell(DFK.INK_MUTED)}>{DC.money(c.actual)}</span>
                <span style={numCell(DFK.INK)}>{DC.money(c.forecast)}</span>
                <span style={numCell(over ? '#B23A2E' : '#1F8A5B')}>{c.variance === 0 ? '\u2014' : (over ? '+' : '\u2212') + DC.money(c.variance)}</span>
                <span style={{ textAlign: 'center', color: DFK.INK_FAINT, transition: 'transform 200ms ease', transform: isOpen ? 'rotate(90deg)' : 'none' }}><DG name="arrow" size={14} /></span>
              </button>
              {isOpen && (
                <div style={{ padding: '4px 22px 22px' }}>
                  <div style={{ fontFamily: DFK.SERIF, fontStyle: 'italic', fontSize: 14, color: DFK.INK_MUTED, marginBottom: 16, maxWidth: 620 }}>{c.why}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px' }}>
                    {c.drivers.map((dr, i) => {
                      const dmax = Math.max.apply(null, c.drivers.map(x => x.amt));
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                            <span style={{ fontFamily: DFK.SANS, fontSize: 13, color: dr.night ? DFK.AMBER_800 : DFK.INK }}>{dr.label}{dr.night && ' \u00b7 night'}</span>
                            <span style={{ fontFamily: DFK.MONO, fontSize: 12, color: DFK.INK, fontVariantNumeric: 'tabular-nums' }}>{DC.money(dr.amt)}</span>
                          </div>
                          <DBar pct={(dr.amt / dmax) * 100} color={dr.night ? DFK.AMBER : DFK.INK_FAINT} h={3} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* collapsible shot breakdown (merged from the old Shots tab) */}
      <div style={{ marginTop: 16, border: `1px solid ${DFK.BORDER}`, borderRadius: 6, background: DFK.PAPER, overflow: 'hidden' }}>
        <button onClick={() => setShotsOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: shotsOpen ? DFK.PAPER_SOFT : DFK.PAPER, border: 0, cursor: 'pointer', textAlign: 'left' }}>
          <span>
            <span style={{ display: 'block', fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: DFK.AMBER }}>Shot breakdown</span>
            <span style={{ display: 'block', fontFamily: DFK.SANS, fontWeight: 300, fontSize: 18, color: DFK.INK, marginTop: 4 }}>Cost and complexity, shot by shot</span>
          </span>
          <span style={{ color: DFK.INK_FAINT, transition: 'transform 200ms ease', transform: shotsOpen ? 'rotate(90deg)' : 'none' }}><DG name="arrow" size={16} /></span>
        </button>
        {shotsOpen && (
          <div style={{ padding: '0 22px 22px', borderTop: `1px solid ${DFK.BORDER}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, padding: '18px 0' }}>
              {DC.topDrivers.map((d, i) => (
                <div key={i}>
                  <div style={{ fontFamily: DFK.MONO, fontSize: 13, color: DFK.INK, fontVariantNumeric: 'tabular-nums' }}>{DC.money(d.amt)}</div>
                  <div style={{ margin: '7px 0' }}><DBar pct={(d.amt / maxDriver) * 100} color={DFK.AMBER_200} /></div>
                  <div style={{ fontFamily: DFK.SANS, fontSize: 12, color: DFK.INK_MUTED, lineHeight: 1.3 }}>{d.label}</div>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${DFK.BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 110px', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${DFK.BORDER}` }}>
                {['#', 'Setup', 'Complexity', 'Est. cost'].map((h, i) => <div key={i} style={{ fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: DFK.INK_FAINT, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>)}
              </div>
              {DC.shots.map((sh, i) => (
                <div key={sh.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 110px', gap: 12, padding: '13px 18px', alignItems: 'center', borderTop: i ? `1px solid ${DFK.BORDER}` : 'none' }}>
                  <span style={{ fontFamily: DFK.MONO, fontSize: 12, color: DFK.INK_FAINT }}>{String(sh.n).padStart(2, '0')}</span>
                  <span style={{ fontFamily: DFK.SANS, fontSize: 14, color: DFK.INK, display: 'flex', alignItems: 'center', gap: 8 }}>{sh.loc}{sh.night && <span style={{ fontFamily: DFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', color: DFK.AMBER, border: `1px solid ${DFK.AMBER}`, borderRadius: 2, padding: '1px 4px' }}>NIGHT</span>}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}><span style={{ width: 50 }}><DBar pct={sh.complexity} color={sh.complexity > 55 ? '#B23A2E' : DFK.INK} h={4} /></span><span style={{ fontFamily: DFK.MONO, fontSize: 11, color: DFK.INK, width: 22, textAlign: 'right' }}>{sh.complexity}</span></span>
                  <span style={{ fontFamily: DFK.MONO, fontSize: 12, color: DFK.INK, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{DC.money(sh.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* collapsible resources (merged from the old Resources tab) */}
      <div style={{ marginTop: 16, border: `1px solid ${DFK.BORDER}`, borderRadius: 6, background: DFK.PAPER, overflow: 'hidden' }}>
        <button onClick={() => setResOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: resOpen ? DFK.PAPER_SOFT : DFK.PAPER, border: 0, cursor: 'pointer', textAlign: 'left' }}>
          <span>
            <span style={{ display: 'block', fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: DFK.AMBER }}>Resources</span>
            <span style={{ display: 'block', fontFamily: DFK.SANS, fontWeight: 300, fontSize: 18, color: DFK.INK, marginTop: 4 }}>People, locations, gear, and post</span>
          </span>
          <span style={{ color: DFK.INK_FAINT, transition: 'transform 200ms ease', transform: resOpen ? 'rotate(90deg)' : 'none' }}><DG name="arrow" size={16} /></span>
        </button>
        {resOpen && (
          <div style={{ padding: '18px 22px 22px', borderTop: `1px solid ${DFK.BORDER}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {DC.resources.map(g => (
              <div key={g.group} style={{ border: `1px solid ${DFK.BORDER}`, borderRadius: 6, background: DFK.PAPER, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px 0', fontFamily: DFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: DFK.AMBER }}>{g.group}</div>
                <div style={{ padding: '6px 18px 14px' }}>
                  {g.items.map((it, i) => {
                    const st = RES_BUDGET[it.state] || RES_BUDGET.pending;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${DFK.BORDER}` : 'none' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: DFK.SANS, fontSize: 14, color: DFK.INK }}>{it.name}</div>
                          <div style={{ fontFamily: DFK.SANS, fontSize: 12.5, color: DFK.INK_MUTED, marginTop: 1 }}>{it.detail}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          <span style={{ fontFamily: DFK.SANS, fontWeight: 300, fontSize: 20, color: DFK.INK }}>{it.count}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: DFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: st.c }}>
                            <span style={{ width: 5, height: 5, borderRadius: 999, background: st.c }} />{st.t}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function numCell(color) { return { fontFamily: DFK.MONO, fontSize: 13, color: color, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }; }

/* ══════════════════════════════════════════════════════════
   SCENARIOS — the producer superpower (toggle + stack)
   ══════════════════════════════════════════════════════════ */
function PScenarios({ ctx }) {
  const approved = DC.dashboard.budget.approved;
  const projected = DC.dashboard.budget.forecast + ctx.savings;
  const saved = Math.abs(ctx.savings);
  const animSaved = saved;  // render the live value directly (count-up didn't track target)

  function toggle(id) {
    ctx.setActive(prev => prev.indexOf(id) >= 0 ? prev.filter(x => x !== id) : prev.concat([id]));
  }
  function clearAll() { ctx.setActive([]); }

  const activeRes = {};
  DC.scenarios.filter(s => ctx.active.indexOf(s.id) >= 0).forEach(s => s.res.forEach(r => { activeRes[r] = true; }));
  const riskWord = ctx.riskDelta < 0 ? 'Lower' : ctx.riskDelta > 0 ? 'Higher' : 'Neutral';
  const riskColor = ctx.riskDelta < 0 ? '#1F8A5B' : ctx.riskDelta > 0 ? '#B23A2E' : DFK.INK_MUTED;

  return (
    <div>
      {/* Running strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div style={{ border: `1px solid ${saved ? '#1F8A5B' : DFK.BORDER}`, background: saved ? 'rgba(31,138,91,0.06)' : DFK.PAPER, borderRadius: 4, padding: '16px 18px' }}>
          <div style={DKickF}>Projected / approved</div>
          <div style={{ fontFamily: DFK.SANS, fontWeight: 300, fontSize: 24, marginTop: 8, color: DFK.INK, fontVariantNumeric: 'tabular-nums' }}>{DC.money(projected)} <span style={{ color: DFK.INK_FAINT, fontSize: 16 }}>/ {DC.money(approved)}</span></div>
          <div style={{ marginTop: 10 }}><DBar pct={(projected / approved) * 100} color={saved ? '#1F8A5B' : DFK.AMBER} /></div>
        </div>
        <StripStat label="Total saved" value={DC.money(animSaved)} tone={saved ? '#1F8A5B' : DFK.INK} sub={ctx.active.length + ' active'} />
        <StripStat label="Schedule" value={ctx.daysDelta ? ctx.daysDelta + ' days' : 'No change'} tone={ctx.daysDelta < 0 ? '#1F8A5B' : DFK.INK} sub={ctx.daysDelta < 0 ? 'Shorter' : 'Same'} />
        <StripStat label="Risk" value={riskWord} tone={riskColor} sub={ctx.crewDelta ? ctx.crewDelta + ' crew' : 'No crew change'} />
      </div>

      <DHead kicker="Changes"
        lede="Stack changes and watch the savings, the schedule, and the risk move together. Nothing is committed." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DC.scenarios.map(s => {
            const on = ctx.active.indexOf(s.id) >= 0;
            return (
              <button key={s.id} onClick={() => toggle(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', padding: '16px 18px', borderRadius: 4,
                border: `1px solid ${on ? '#1F8A5B' : DFK.BORDER}`, background: on ? 'rgba(31,138,91,0.05)' : DFK.PAPER, transition: 'all 160ms ease' }}>
                <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${on ? '#1F8A5B' : DFK.BORDER_STRONG}`, background: on ? '#1F8A5B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{on && <DG name="check" size={13} />}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: DFK.SANS, fontSize: 15.5, color: DFK.INK }}>{s.label}</div>
                  <div style={{ fontFamily: DFK.SERIF, fontStyle: 'italic', fontSize: 13, color: DFK.INK_MUTED, marginTop: 2 }}>{s.note}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: DFK.MONO, fontSize: 14, color: '#1F8A5B', fontVariantNumeric: 'tabular-nums' }}>{DC.signed(s.budget)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: s.risk < 0 ? '#1F8A5B' : s.risk > 0 ? '#B23A2E' : DFK.INK_FAINT }} />
                    <span style={{ fontFamily: DFK.MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DFK.INK_FAINT }}>{s.risk < 0 ? 'lowers risk' : s.risk > 0 ? 'raises risk' : 'neutral'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Combined output */}
        <div style={{ border: `1px solid ${DFK.BORDER_STRONG}`, borderRadius: 6, background: DFK.PAPER, overflow: 'hidden', position: 'sticky', top: 0 }}>
          <div style={{ padding: '22px 24px', borderBottom: `1px solid ${DFK.BORDER}` }}>
            <div style={DKickF}>How much can I save?</div>
            <div style={{ fontFamily: DFK.SANS, fontWeight: 300, fontSize: 44, lineHeight: 1, color: saved ? '#1F8A5B' : DFK.INK, marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>{DC.money(animSaved)}</div>
            <div style={{ fontFamily: DFK.SANS, fontSize: 13, color: DFK.INK_MUTED, marginTop: 8 }}>Brings the bid to <b style={{ color: DFK.INK, fontWeight: 400 }}>{DC.money(projected)}</b></div>
          </div>
          <OutCell label="Schedule impact" value={ctx.daysDelta ? ctx.daysDelta + ' days' : 'No change'} tone={ctx.daysDelta < 0 ? '#1F8A5B' : DFK.INK} />
          <OutCell label="Resource impact" value={ctx.crewDelta ? ctx.crewDelta + ' crew' : 'No change'} tone={DFK.INK}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
              {['Crew', 'Extras', 'Specialty', 'Grip', 'Locations', 'VFX', 'Editorial', 'Schedule'].map(r => (
                <DChip key={r} on={!!activeRes[r]} dot>{r}</DChip>
              ))}
            </div>
          </OutCell>
          <OutCell label="Risk impact" value={riskWord} tone={riskColor}>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              {[-2, -1, 0, 1, 2].map(v => {
                const mid = 2; const filled = ctx.riskDelta < 0 ? (v < 0 && v >= ctx.riskDelta) : ctx.riskDelta > 0 ? (v > 0 && v <= ctx.riskDelta) : false;
                return <div key={v} style={{ flex: 1, height: 8, borderRadius: 2, background: v === 0 ? DFK.BORDER_STRONG : (filled ? riskColor : DFK.BORDER) }} />;
              })}
            </div>
          </OutCell>
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${DFK.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: DFK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: DFK.INK_FAINT }}>{ctx.active.length} scenario{ctx.active.length === 1 ? '' : 's'} stacked</span>
            {ctx.active.length > 0 && <button onClick={clearAll} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: DFK.MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: DFK.INK_MUTED, borderBottom: `1px solid ${DFK.BORDER}` }}>Reset</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StripStat({ label, value, sub, tone }) {
  return (
    <div style={{ border: `1px solid ${DFK.BORDER}`, background: DFK.PAPER, borderRadius: 4, padding: '16px 18px' }}>
      <div style={DKickF}>{label}</div>
      <div style={{ fontFamily: DFK.SANS, fontWeight: 300, fontSize: 24, marginTop: 8, color: tone || DFK.INK }}>{value}</div>
      <div style={{ fontFamily: DFK.MONO, fontSize: 11, color: DFK.INK_FAINT, marginTop: 8 }}>{sub}</div>
    </div>
  );
}
function OutCell({ label, value, tone, children }) {
  return (
    <div style={{ padding: '18px 24px', borderTop: `1px solid ${DFK.BORDER}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={DKickF}>{label}</span>
        <span style={{ fontFamily: DFK.SANS, fontSize: 17, color: tone || DFK.INK }}>{value}</span>
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { PDashboard, PBudget, PScenarios });
