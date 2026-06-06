/* global React */
// TENET Production Portal — Shots, Schedule, Resources, Risks.
const { FK: XFK, FGlyph: XG, PROD: XC } = window;
const { CPanel: XP, CPStat: XStat, CPBar: XBar, CPChip: XChip, CPHead: XHead,
  cpKickerFaint: XKickF, RISK_COLOR: XRISK } = window;
const XUse = React.useState;

const RES_STATE = { wrapped: { c: '#9A9A9A', t: 'Wrapped' }, active: { c: '#BA7517', t: 'Active' }, pending: { c: '#9A9A9A', t: 'Pending' } };

/* ══════════════════════════════════════════════════════════
   SHOTS — cost & complexity, scene by scene
   ══════════════════════════════════════════════════════════ */
function PShots({ ctx }) {
  const [sel, setSel] = XUse(XC.shots[0].id);
  const s = XC.shots.find(x => x.id === sel);
  const maxDriver = Math.max.apply(null, XC.topDrivers.map(d => d.amt));

  return (
    <div>
      <XHead kicker="Shots" title="Cost and complexity, shot by shot"
        lede="Every setup carries a complexity and a cost score — and the drivers behind both." />

      <XP label="Primary cost drivers" title="Across the production" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
          {XC.topDrivers.map((d, i) => (
            <div key={i}>
              <div style={{ fontFamily: XFK.MONO, fontSize: 14, color: XFK.INK, fontVariantNumeric: 'tabular-nums' }}>{XC.money(d.amt)}</div>
              <div style={{ marginTop: 8, marginBottom: 8 }}><XBar pct={(d.amt / maxDriver) * 100} color={XFK.AMBER_200} /></div>
              <div style={{ fontFamily: XFK.SANS, fontSize: 12.5, color: XFK.INK_MUTED, lineHeight: 1.3 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </XP>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Shot list */}
        <div style={{ border: `1px solid ${XFK.BORDER}`, borderRadius: 6, overflow: 'hidden', background: XFK.PAPER }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 92px 92px', gap: 12, padding: '13px 18px', borderBottom: `1px solid ${XFK.BORDER}` }}>
            {['#', 'Setup', 'Complexity', 'Cost'].map((h, i) => (
              <div key={i} style={{ fontFamily: XFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: XFK.INK_FAINT, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          {XC.shots.map((sh, i) => {
            const on = sh.id === sel;
            return (
              <button key={sh.id} onClick={() => setSel(sh.id)} style={{ width: '100%', display: 'grid', gridTemplateColumns: '40px 1fr 92px 92px', gap: 12, padding: '14px 18px', alignItems: 'center', cursor: 'pointer', textAlign: 'left',
                background: on ? XFK.PAPER_SOFT : XFK.PAPER, border: 0, borderTop: i ? `1px solid ${XFK.BORDER}` : 'none', borderLeft: `2px solid ${on ? XFK.AMBER : 'transparent'}` }}>
                <span style={{ fontFamily: XFK.MONO, fontSize: 12, color: XFK.INK_FAINT }}>{String(sh.n).padStart(2, '0')}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: XFK.SANS, fontSize: 14, color: XFK.INK, display: 'flex', alignItems: 'center', gap: 8 }}>{sh.loc}{sh.night && <span style={{ fontFamily: XFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', color: XFK.AMBER, border: `1px solid ${XFK.AMBER}`, borderRadius: 2, padding: '1px 4px' }}>NIGHT</span>}</span>
                  <span style={{ fontFamily: XFK.MONO, fontSize: 10, letterSpacing: '0.08em', color: XFK.INK_FAINT }}>{sh.tod} · {sh.shotCount} shots</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ width: 34 }}><XBar pct={sh.complexity} color={sh.complexity > 55 ? '#B23A2E' : XFK.INK} h={4} /></span>
                  <span style={{ fontFamily: XFK.MONO, fontSize: 11, color: XFK.INK, width: 22, textAlign: 'right' }}>{sh.complexity}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ width: 34 }}><XBar pct={sh.costScore} color={XFK.AMBER} h={4} /></span>
                  <span style={{ fontFamily: XFK.MONO, fontSize: 11, color: XFK.INK, width: 22, textAlign: 'right' }}>{sh.costScore}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Shot detail */}
        <div style={{ border: `1px solid ${XFK.BORDER_STRONG}`, borderRadius: 6, background: XFK.PAPER, overflow: 'hidden', position: 'sticky', top: 0 }}>
          <div style={{ padding: '20px 22px', borderBottom: `1px solid ${XFK.BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: XFK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: XFK.AMBER }}>Setup {String(s.n).padStart(2, '0')}</div>
              <div style={{ fontFamily: XFK.MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: XFK.INK_FAINT }}>{s.status}</div>
            </div>
            <div style={{ fontFamily: XFK.SANS, fontWeight: 300, fontSize: 22, marginTop: 8, color: XFK.INK }}>{s.loc}</div>
            <div style={{ fontFamily: XFK.SERIF, fontStyle: 'italic', fontSize: 13.5, color: XFK.INK_MUTED, marginTop: 4, lineHeight: 1.4 }}>{s.desc}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: XFK.BORDER }}>
            <MiniStat label="Est. cost" value={XC.money(s.cost)} />
            <MiniStat label="Complexity" value={s.complexity + ' / 100'} tone={s.complexity > 55 ? '#B23A2E' : XFK.INK} />
          </div>
          <div style={{ padding: '18px 22px', borderTop: `1px solid ${XFK.BORDER}` }}>
            <div style={Object.assign({}, XKickF, { marginBottom: 14 })}>Complexity factors</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {s.factors.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 18px', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: XFK.SANS, fontSize: 11.5, color: XFK.INK_MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                  <XBar pct={(f.lv / 7) * 100} color={f.lv >= 5 ? XFK.AMBER : XFK.INK_FAINT} h={5} />
                  <span style={{ fontFamily: XFK.MONO, fontSize: 10, color: XFK.INK_FAINT, textAlign: 'right' }}>{f.lv}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '18px 22px', borderTop: `1px solid ${XFK.BORDER}`, background: XFK.PAPER_SOFT }}>
            <div style={Object.assign({}, XKickF, { marginBottom: 10 })}>Primary cost drivers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {s.drivers.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: XFK.AMBER, flexShrink: 0 }} />
                  <span style={{ fontFamily: XFK.SANS, fontSize: 13, color: XFK.INK }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function MiniStat({ label, value, tone }) {
  return (
    <div style={{ background: XFK.PAPER, padding: '16px 22px' }}>
      <div style={XKickF}>{label}</div>
      <div style={{ fontFamily: XFK.SANS, fontWeight: 300, fontSize: 24, marginTop: 6, color: tone || XFK.INK, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCHEDULE
   ══════════════════════════════════════════════════════════ */
function PSchedule({ ctx }) {
  const sc = XC.schedule;
  return (
    <div>
      <XHead kicker="Schedule"
        lede="The shoot wrapped on plan. Here is how the days ran, and what carried the risk." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <XStat label="Shoot days" value={sc.shootDays} sub="Principal photography" />
        <XStat label="Days complete" value={sc.daysComplete + ' / ' + sc.shootDays} sub="Wrapped" tone="#1F8A5B" />
        <XStat label="Days remaining" value={sc.daysRemaining} sub="In post now" />
        <XStat label="Forecast wrap" value={sc.forecastWrap} sub="Hit on schedule" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        <XP label="Day view" title="How the days ran">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sc.days.map(d => (
              <div key={d.id} style={{ border: `1px solid ${XFK.BORDER}`, borderRadius: 4, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontFamily: XFK.SANS, fontWeight: 300, fontSize: 20, color: XFK.INK }}>{d.label}</span>
                    <span style={{ fontFamily: XFK.MONO, fontSize: 11, color: XFK.INK_FAINT }}>{d.date}</span>
                    <span style={{ fontFamily: XFK.SERIF, fontStyle: 'italic', fontSize: 13, color: XFK.INK_MUTED }}>{d.locs.join(' \u2192 ')}</span>
                  </div>
                  <span style={{ fontFamily: XFK.MONO, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1F8A5B' }}>Complete</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: d.risks.length ? 12 : 0 }}>
                  {[['Pages', d.pages], ['Shots', d.shots], ['Crew', d.crew], ['Hours', d.hours]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: XFK.MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: XFK.INK_FAINT }}>{k}</div>
                      <div style={{ fontFamily: XFK.SANS, fontSize: 17, color: XFK.INK, marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {d.risks.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {d.risks.map((r, i) => <XChip key={i} on tone={XFK.AMBER} dot>{r}</XChip>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </XP>

        <XP label="Risk factors" title="What stressed the days" pad={22}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sc.riskFactors.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderTop: i ? `1px solid ${XFK.BORDER}` : 'none' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: XFK.SANS, fontSize: 14, color: XFK.INK }}>{r.label}</div>
                  <div style={{ fontFamily: XFK.SANS, fontSize: 12.5, color: XFK.INK_MUTED, marginTop: 1 }}>{r.note}</div>
                </div>
                <span style={{ fontFamily: XFK.MONO, fontSize: 16, color: XFK.AMBER, flexShrink: 0 }}>{r.count}</span>
              </div>
            ))}
          </div>
        </XP>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RESOURCES
   ══════════════════════════════════════════════════════════ */
function PResources({ ctx }) {
  return (
    <div>
      <XHead kicker="Resources"
        lede="Every person, place, and piece of gear the project switched on — and where it stands." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {XC.resources.map(g => (
          <XP key={g.group} label={g.group} title={null} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {g.items.map((it, i) => {
                const st = RES_STATE[it.state];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderTop: i ? `1px solid ${XFK.BORDER}` : 'none' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: XFK.SANS, fontSize: 14, color: XFK.INK }}>{it.name}</div>
                      <div style={{ fontFamily: XFK.SANS, fontSize: 12.5, color: XFK.INK_MUTED, marginTop: 1 }}>{it.detail}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span style={{ fontFamily: XFK.SANS, fontWeight: 300, fontSize: 20, color: XFK.INK }}>{it.count}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: XFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: st.c }}>
                        <span style={{ width: 5, height: 5, borderRadius: 999, background: st.c }} />{st.t}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </XP>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RISKS
   ══════════════════════════════════════════════════════════ */
function PRisks({ ctx }) {
  return (
    <div>
      <XHead kicker="Risks" title="Threats before they happen"
        lede="Each risk priced in dollars and days — the producer reads exposure, not vibes." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {XC.risks.map(r => (
          <div key={r.id} style={{ border: `1px solid ${XFK.BORDER}`, borderRadius: 6, background: XFK.PAPER, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 16px', borderBottom: `1px solid ${XFK.BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: XFK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: XFK.AMBER, whiteSpace: 'nowrap' }}>{r.type} risk</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: XFK.MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: XFK.INK_FAINT }}>Prob</span>
                  <span style={{ fontFamily: XFK.SANS, fontSize: 13, color: XRISK[r.prob] }}>{r.prob}</span>
                </span>
              </div>
              <div style={{ fontFamily: XFK.SANS, fontWeight: 300, fontSize: 19, lineHeight: 1.2, color: XFK.INK }}>{r.title}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: XFK.BORDER }}>
              {[['Exposure', r.exposure, XFK.INK], ['Cost impact', r.cost ? '+' + XC.money(r.cost) : '\u2014', r.cost ? '#B23A2E' : XFK.INK_FAINT], ['Schedule', r.days ? '+' + r.days + 'd' : '\u2014', r.days ? XFK.AMBER : XFK.INK_FAINT]].map(([k, v, c], i) => (
                <div key={i} style={{ background: XFK.PAPER, padding: '14px 18px' }}>
                  <div style={{ fontFamily: XFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: XFK.INK_FAINT, marginBottom: 6 }}>{k}</div>
                  <div style={{ fontFamily: XFK.SANS, fontSize: 15, color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 22px', borderTop: `1px solid ${XFK.BORDER}`, background: XFK.PAPER_SOFT }}>
              <div style={Object.assign({}, XKickF, { marginBottom: 8 })}>Mitigation</div>
              <div style={{ fontFamily: XFK.SANS, fontSize: 13.5, color: XFK.INK, lineHeight: 1.5 }}>{r.mitigation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PShots, PSchedule, PResources, PRisks });
