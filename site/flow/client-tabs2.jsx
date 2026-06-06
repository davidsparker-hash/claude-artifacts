/* global React */
// TENET Client Portal — Budget, Scope, Risks.
const { FK: BFK, CLIENT: BC } = window;
const { CPanel: BP, CPStat: BStat, CPBar: BBar, CPHead: BHead, cpKickerFaint: BKickF, RISK_COLOR: BRISK } = window;

/* ══════════════════════════════════════════════════════════
   BUDGET
   ══════════════════════════════════════════════════════════ */
function BudgetTab({ ctx }) {
  const b = BC.budget;
  const forecast = b.forecast + ctx.forecastDelta;
  const variance = forecast - b.approved;
  const over = variance > 0;
  const drawn = Math.max(0, forecast - BC.T.directBudget);
  const contingency = b.reserve - drawn;
  const allocTotal = b.allocation.reduce((a, c) => a + c.amount, 0);
  const maxAlloc = Math.max.apply(null, b.allocation.map(c => c.amount));

  return (
    <div>
      <BHead kicker="Budget"
        lede="Budget impact without the accounting. Every number traces to a cause." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
        <BStat label="Approved budget" value={BC.money(b.approved)} />
        <BStat label="Actual spend" value={BC.money(b.actual)} sub="Committed to date" />
        <BStat label="Forecast final" value={BC.money(forecast)} tone={over ? '#B23A2E' : BFK.INK} sub={ctx.forecastDelta ? BC.signed(ctx.forecastDelta) + ' from changes' : 'On plan'} />
        <BStat label="Variance" value={(over ? '+' : '\u2212') + BC.money(Math.abs(variance))} tone={over ? '#B23A2E' : '#1F8A5B'} sub={over ? 'Over approved' : 'Under approved'} />
        <BStat label="Contingency left" value={BC.money(Math.max(0, contingency))} tone={contingency < 0 ? '#B23A2E' : BFK.INK} sub={'of ' + BC.money(b.reserve) + ' reserve'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Allocation */}
        <BP label="Current cost allocation" title="By forecast">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {b.allocation.map(c => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                  <span style={{ fontFamily: BFK.SANS, fontSize: 14, color: BFK.INK }}>{c.name}</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: BFK.MONO, fontSize: 10, color: BFK.INK_FAINT }}>{Math.round((c.amount / allocTotal) * 100)}%</span>
                    <span style={{ fontFamily: BFK.MONO, fontSize: 12, color: BFK.INK, fontVariantNumeric: 'tabular-nums' }}>{BC.money(c.amount)}</span>
                  </span>
                </div>
                <BBar pct={(c.amount / maxAlloc) * 100} color={BFK.INK} />
                <div style={{ fontFamily: BFK.SANS, fontSize: 12, color: BFK.INK_MUTED, marginTop: 6, lineHeight: 1.4 }}>{c.why}</div>
              </div>
            ))}
          </div>
        </BP>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* What changed */}
          <BP label="What changed" title={null} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {b.changed.map((c, i) => (
                <div key={i} style={{ padding: '13px 0', borderTop: i ? `1px solid ${BFK.BORDER}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: BFK.SANS, fontSize: 14, color: BFK.INK }}>{c.label}</span>
                    <span style={{ fontFamily: BFK.MONO, fontSize: 12, color: BFK.AMBER_800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>+{BC.money(c.amt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 3 }}>
                    <span style={{ fontFamily: BFK.SANS, fontSize: 12.5, color: BFK.INK_MUTED, lineHeight: 1.4, maxWidth: 220 }}>{c.detail}</span>
                    <span style={{ fontFamily: BFK.MONO, fontSize: 10, color: BFK.INK_FAINT }}>{c.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </BP>

          {/* Forecast bands */}
          <BP label="Forecast" title={null} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {b.forecastBands.map(f => {
                const isExp = f.id === 'exp';
                return (
                  <div key={f.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontFamily: BFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: isExp ? BFK.AMBER : BFK.INK_MUTED }}>{f.label}</span>
                      <span style={{ fontFamily: BFK.SANS, fontSize: 15, color: BFK.INK, fontVariantNumeric: 'tabular-nums' }}>{BC.money(f.id === 'exp' ? forecast : f.amount)}</span>
                    </div>
                    <BBar pct={((f.id === 'exp' ? forecast : f.amount) / b.approved) * 100} color={isExp ? BFK.AMBER : BFK.INK_FAINT} />
                    <div style={{ fontFamily: BFK.SANS, fontSize: 12, color: BFK.INK_MUTED, marginTop: 5 }}>{f.note}</div>
                  </div>
                );
              })}
            </div>
          </BP>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCOPE
   ══════════════════════════════════════════════════════════ */
function ScopeTab({ ctx }) {
  const s = BC.scope;
  return (
    <div>
      <BHead kicker="Scope"
        lede="The line between what was agreed and what’s been added — drawn clearly." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start', marginBottom: 16 }}>
        <BP label="Original scope" title="As agreed">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {s.original.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderTop: i ? `1px solid ${BFK.BORDER}` : 'none' }}>
                <span style={{ fontFamily: BFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: BFK.INK_FAINT }}>{o.label}</span>
                <span style={{ fontFamily: BFK.SANS, fontSize: 14, color: BFK.INK, textAlign: 'right' }}>{o.value}</span>
              </div>
            ))}
          </div>
        </BP>

        <BP label="Current scope" title="Today">
          <div style={{ marginBottom: 16 }}>
            <div style={Object.assign({}, BKickF, { marginBottom: 10 })}>Approved</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {s.current.approved.map((x, i) => (
                <span key={i} style={{ fontFamily: BFK.SANS, fontSize: 13, color: BFK.INK, padding: '6px 12px', borderRadius: 3, border: `1px solid ${BFK.BORDER}`, background: BFK.PAPER_SOFT }}>{x}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: s.current.removed.length ? 16 : 0 }}>
            <div style={Object.assign({}, BKickF, { marginBottom: 10, color: BFK.AMBER })}>Added</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {s.current.added.map((x, i) => (
                <span key={i} style={{ fontFamily: BFK.SANS, fontSize: 13, color: BFK.AMBER_800, padding: '6px 12px', borderRadius: 3, border: `1px solid ${BFK.AMBER}`, background: BFK.AMBER_50 }}>{x}</span>
              ))}
            </div>
          </div>
          {s.current.removed.length > 0 && (
            <div>
              <div style={Object.assign({}, BKickF, { marginBottom: 10 })}>Removed</div>
              <span style={{ fontFamily: BFK.SANS, fontSize: 13, color: BFK.INK_FAINT }}>{s.current.removed.join(', ')}</span>
            </div>
          )}
          {s.current.removed.length === 0 && (
            <div style={{ fontFamily: BFK.SERIF, fontStyle: 'italic', fontSize: 13, color: BFK.INK_FAINT, marginTop: 4 }}>Nothing removed from the original agreement.</div>
          )}
        </BP>
      </div>

      <BP label="Change history" title="Every change, dated">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0 28px', alignItems: 'center' }}>
          <div style={Object.assign({}, BKickF, { paddingBottom: 12, borderBottom: `1px solid ${BFK.BORDER}` })}>Change</div>
          <div style={Object.assign({}, BKickF, { paddingBottom: 12, borderBottom: `1px solid ${BFK.BORDER}`, textAlign: 'right' })}>Approved</div>
          <div style={Object.assign({}, BKickF, { paddingBottom: 12, borderBottom: `1px solid ${BFK.BORDER}`, textAlign: 'right' })}>Cost</div>
          <div style={Object.assign({}, BKickF, { paddingBottom: 12, borderBottom: `1px solid ${BFK.BORDER}`, textAlign: 'right' })}>Schedule</div>
          {s.changes.map((c, i) => (
            <React.Fragment key={i}>
              <div style={{ fontFamily: BFK.SANS, fontSize: 14, color: BFK.INK, padding: '13px 0', borderTop: `1px solid ${BFK.BORDER}` }}>{c.label}</div>
              <div style={{ fontFamily: BFK.MONO, fontSize: 11, color: BFK.INK_FAINT, textAlign: 'right', padding: '13px 0', borderTop: `1px solid ${BFK.BORDER}` }}>{c.date}</div>
              <div style={{ fontFamily: BFK.MONO, fontSize: 12, color: c.cost ? BFK.AMBER_800 : '#1F8A5B', textAlign: 'right', padding: '13px 0', borderTop: `1px solid ${BFK.BORDER}`, fontVariantNumeric: 'tabular-nums' }}>{c.cost ? '+' + BC.money(c.cost) : 'No cost'}</div>
              <div style={{ fontFamily: BFK.MONO, fontSize: 12, color: BFK.INK, textAlign: 'right', padding: '13px 0', borderTop: `1px solid ${BFK.BORDER}` }}>{c.days ? '+' + c.days + 'd' : '\u2014'}</div>
            </React.Fragment>
          ))}
        </div>
      </BP>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RISKS
   ══════════════════════════════════════════════════════════ */
function RisksTab({ ctx }) {
  return (
    <div>
      <BHead kicker="Risks"
        lede="Only what’s meaningful — four risks worth your attention, each with a plan." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {BC.risks.map(r => (
          <div key={r.id} style={{ border: `1px solid ${BFK.BORDER}`, borderRadius: 6, background: BFK.PAPER, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 16px', borderBottom: `1px solid ${BFK.BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: BFK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: BFK.AMBER, whiteSpace: 'nowrap' }}>{r.type} risk</span>
                <span style={{ fontFamily: BFK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: BFK.INK_FAINT }}>{r.owner}</span>
              </div>
              <div style={{ fontFamily: BFK.SANS, fontWeight: 300, fontSize: 19, lineHeight: 1.2, color: BFK.INK }}>{r.title}</div>
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
              <RiskMeter label="Probability" value={r.prob} />
              <span style={{ width: 1, background: BFK.BORDER }} />
              <RiskMeter label="Impact" value={r.impact} />
            </div>
            <div style={{ padding: '16px 22px', borderTop: `1px solid ${BFK.BORDER}`, background: BFK.PAPER_SOFT }}>
              <div style={Object.assign({}, BKickF, { marginBottom: 8 })}>Mitigation plan</div>
              <div style={{ fontFamily: BFK.SANS, fontSize: 13.5, color: BFK.INK, lineHeight: 1.5 }}>{r.plan}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskMeter({ label, value }) {
  const idx = value === 'Low' ? 0 : value === 'Medium' ? 1 : 2;
  return (
    <div style={{ flex: 1, padding: '14px 22px' }}>
      <div style={Object.assign({}, BKickF, { marginBottom: 10 })}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: BFK.SANS, fontSize: 16, color: BRISK[value] }}>{value}</span>
        <span style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 14, height: 6, borderRadius: 1, background: i <= idx ? BRISK[value] : BFK.BORDER }} />)}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { BudgetTab, ScopeTab, RisksTab });
