/* global React, FK, FLOW, FRAMEWORK, FGlyph, useFTween */
// Producer page — a lighter windowed finance dashboard:
//   left   = small timeline + message-director chat
//   center = running actuals (budget · actual · variance + ledger)
//   right  = finance breakdown (proportions + subcategory allocations)

const LT = { canvas: '#ECE8E1', win: '#FFFFFF', line: 'rgba(0,0,0,0.10)', line2: 'rgba(0,0,0,0.16)' };
const FIN_GOOD = '#1F8A5B';   // under-budget green
function finSigned(n) { return (n < 0 ? '\u2212' : '+') + FLOW.fmtMoney(Math.abs(n)); }

function Win({ title, right, children, flex, style }) {
  return (
    <div style={Object.assign({ background: LT.win, border: `1px solid ${LT.line}`, borderRadius: 4,
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }, style)}>
      <div style={{ padding: '11px 16px', borderBottom: `1px solid ${LT.line}`, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER, whiteSpace: 'nowrap' }}>{title}</span>
        {right}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
    </div>
  );
}

// ── small timeline ──────────────────────────────────────────────────
function TimelineMini({ state, flashId }) {
  const scenes = FLOW.activeScenes(state);
  const total = FLOW.totalLength(state);
  return (
    <div style={{ padding: '16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT }}>The cut</span>
        <span style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 26, color: FK.INK }}>{FLOW.fmtClock(total)}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, height: 54 }}>
        {scenes.map(s => {
          const dur = s.shots.reduce((a, sh) => a + sh.dur, 0);
          const night = FLOW.isNight(s, state);
          const hot = flashId === s.id;
          return (
            <div key={s.id} style={{ flex: dur, minWidth: 0, border: `1px solid ${hot ? FK.AMBER : LT.line2}`,
              background: hot ? FK.AMBER_50 : (night ? '#EFE4D2' : FK.PAPER_SOFT), borderRadius: 2,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px 6px', overflow: 'hidden' }}>
              <span style={{ fontFamily: FK.MONO, fontSize: 8.5, color: FK.INK_MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{FLOW.locName(s.locId)}</span>
              <span style={{ fontFamily: FK.MONO, fontSize: 8, letterSpacing: '0.06em', color: night ? FK.AMBER_800 : FK.INK_FAINT }}>{FLOW.todOf(s, state)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 9, color: FK.INK_FAINT }}>0:00</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 9, color: FK.INK_FAINT }}>{FLOW.fmtClock(total)}</span>
      </div>
    </div>
  );
}

// ── chat to director ────────────────────────────────────────────────
const PMSG = 'Schedule won\u2019t let us shoot this night scene. Can it be changed?';
function ChatDirector({ chat, onSend }) {
  const bub = (mine) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%',
    background: mine ? FK.INK : FK.PAPER, color: mine ? FK.PAPER : FK.INK,
    border: mine ? 'none' : `1px solid ${LT.line}`, borderRadius: 8, padding: '8px 11px',
    fontFamily: FK.SANS, fontSize: 12.5, lineHeight: 1.4, marginBottom: 7 });
  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {chat.messages.map((m, i) => (
          <div key={i} style={bub(m.from === 'producer')}>
            <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.from === 'producer' ? 'rgba(255,255,255,0.6)' : FK.INK_FAINT, marginBottom: 3 }}>{m.from === 'producer' ? 'You · Producer' : 'D. Parker · Director'}</div>
            {m.text}
          </div>
        ))}
        {chat.typing && <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: FK.INK_FAINT, marginBottom: 7 }}>Director is editing the script\u2026</div>}
      </div>
      {!chat.sent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontFamily: FK.SANS, fontSize: 12.5, color: FK.INK, lineHeight: 1.4, padding: '9px 11px', background: FK.PAPER_SOFT, border: `1px solid ${LT.line2}`, borderRadius: 8 }}>{PMSG}</div>
          <button onClick={onSend} style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: FK.AMBER, color: FK.PAPER, border: 'none', borderRadius: 2, padding: '8px 15px', fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}><FGlyph name="send" size={13} /> Send</button>
        </div>
      )}
    </div>
  );
}

// ── running actuals ─────────────────────────────────────────────────
function Figure({ label, value, accent }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.13em', textTransform: 'uppercase', color: FK.INK_FAINT, marginBottom: 7, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 29, lineHeight: 1, letterSpacing: '-0.02em', color: accent || FK.INK, whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}
const FIN_COLS = 'minmax(150px, 1.4fr) 82px 82px 88px 94px';
function RunningActuals({ state, cat, onCat, catFlash }) {
  const t = FRAMEWORK.finTotals(state);
  const forecast = useFTween(t.forecast, 700);
  const variance = useFTween(t.variance, 700);
  const conting = useFTween(t.contingency, 700);
  const v = Math.round(variance);
  const cR = Math.round(conting);
  const lowC = cR < t.reserve * 0.45;
  const drawnPct = (t.reserve - cR) / t.reserve * 100;
  const metaR = { fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: FK.INK_FAINT, textAlign: 'right' };
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', gap: 18, paddingBottom: 20, borderBottom: `1px solid ${LT.line}` }}>
        <Figure label="Approved" value={FLOW.fmtMoney(t.approved)} />
        <Figure label="Running actual" value={FLOW.fmtMoney(t.actual)} />
        <Figure label="Forecast final" value={FLOW.fmtMoney(Math.round(forecast))} />
        <Figure label="Variance" value={v === 0 ? '$0' : finSigned(v)} accent={v > 0 ? FK.AMBER_800 : FIN_GOOD} />
        <Figure label="Contingency left" value={FLOW.fmtMoney(cR)} accent={lowC ? FK.AMBER_800 : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: FIN_COLS, gap: 8, padding: '0 8px', margin: '18px 0 2px' }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT }}>Cost center</span>
        <span style={metaR}>Budget</span><span style={metaR}>Actual</span><span style={metaR}>Forecast</span><span style={metaR}>Variance</span>
      </div>
      {FRAMEWORK.FIN_CENTERS.map(c => {
        const on = cat === c.id;
        const fc = FRAMEWORK.finForecast(c, state);
        const vv = fc - c.budget;
        const ot = c.nightVar && FRAMEWORK.nightActive(state);
        const num = (val, col) => <span style={{ fontFamily: FK.MONO, fontSize: 12, color: col || FK.INK, textAlign: 'right' }}>{val}</span>;
        return (
          <div key={c.id} onClick={() => onCat(c.id)} style={{ display: 'grid', gridTemplateColumns: FIN_COLS, gap: 8, alignItems: 'center',
            padding: '9px 8px', cursor: 'pointer', borderBottom: `1px solid ${LT.line}`,
            background: on || catFlash === c.id ? FK.AMBER_50 : 'transparent', boxShadow: on ? `inset 3px 0 0 ${FK.AMBER}` : 'none' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
              <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15.5, color: on ? FK.AMBER_800 : FK.INK, whiteSpace: 'nowrap' }}>{c.name}</span>
              {ot && <span style={{ fontFamily: FK.MONO, fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: FK.AMBER_800, padding: '1px 5px', borderRadius: 2, background: FK.AMBER_50, border: `1px solid ${FK.AMBER}`, flexShrink: 0 }}>+OT</span>}
            </span>
            {num(FLOW.fmtMoney(c.budget))}
            {num(FLOW.fmtMoney(c.actual), FK.INK_MUTED)}
            {num(FLOW.fmtMoney(fc))}
            {num(vv === 0 ? '\u2014' : finSigned(vv), vv > 0 ? FK.AMBER_800 : vv < 0 ? FIN_GOOD : FK.INK_FAINT)}
          </div>
        );
      })}

      {/* Contingency reserve — the live tension metric */}
      <div onClick={() => onCat('contingency')} style={{ marginTop: 16, padding: '12px 10px', cursor: 'pointer', borderRadius: 3,
        background: cat === 'contingency' ? FK.AMBER_50 : 'transparent', boxShadow: cat === 'contingency' ? `inset 3px 0 0 ${FK.AMBER}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: lowC ? FK.AMBER_800 : FK.INK_MUTED, whiteSpace: 'nowrap' }}>Contingency reserve</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 11, color: FK.INK_MUTED, whiteSpace: 'nowrap' }}>{FLOW.fmtMoney(cR)} <span style={{ color: FK.INK_FAINT }}>of {FLOW.fmtMoney(t.reserve)} left</span></span>
        </div>
        <div style={{ height: 6, background: FK.PAPER_SOFT, borderRadius: 999, overflow: 'hidden', marginTop: 9 }}>
          <div style={{ height: '100%', width: drawnPct + '%', background: lowC ? FK.AMBER_800 : FK.AMBER }} />
        </div>
      </div>
    </div>
  );
}

// ── finance breakdown — cause & effect (WHAT is costing money → WHY) ──
function FinanceBreakdown({ state, cat, onCat }) {
  const t = FRAMEWORK.finTotals(state);
  const centers = FRAMEWORK.FIN_CENTERS;
  const isCont = cat === 'contingency';
  const sel = centers.find(c => c.id === cat) || (isCont ? null : centers[0]);

  // selected payload
  let title, amountLine, headline, drivers, chip;
  if (isCont) {
    title = 'Contingency';
    drivers = FRAMEWORK.finContingencyDrivers(state).slice().sort((a, b) => b.amt - a.amt);
    amountLine = `${FLOW.fmtMoney(t.contingency)} of ${FLOW.fmtMoney(t.reserve)} left`;
    headline = FRAMEWORK.nightActive(state)
      ? 'Night overtime is the biggest draw against the reserve.'
      : 'The reserve is largely intact — the pressure is easing.';
    chip = { text: FLOW.fmtMoney(t.reserve - t.contingency) + ' drawn', over: t.reserve - t.contingency > t.reserve * 0.5 };
  } else {
    title = sel.name;
    const fc = FRAMEWORK.finForecast(sel, state);
    const vv = FRAMEWORK.finVariance(sel, state);
    drivers = FRAMEWORK.finDrivers(sel, state).slice().sort((a, b) => b.amt - a.amt);
    amountLine = FLOW.fmtMoney(fc) + ' forecast';
    headline = sel.why;
    chip = vv === 0 ? null : { text: finSigned(vv) + (vv > 0 ? ' over' : ' under'), over: vv > 0 };
  }
  const maxAmt = Math.max(...drivers.map(d => d.amt), 1);

  return (
    <div style={{ padding: '20px 22px' }}>
      {/* WHAT is costing money — proportions across centers */}
      <div style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT, marginBottom: 10 }}>What is costing money</div>
      <div style={{ display: 'flex', height: 26, borderRadius: 2, overflow: 'hidden', border: `1px solid ${LT.line}` }}>
        {centers.map((c, i) => {
          const fc = FRAMEWORK.finForecast(c, state);
          const on = c.id === cat;
          return <div key={c.id} title={`${c.name} · ${FLOW.fmtMoney(fc)}`} onClick={() => onCat(c.id)}
            style={{ width: (fc / t.forecast * 100) + '%', background: on ? FK.AMBER : (i % 2 ? FK.INK : '#3a3a3a'),
              borderRight: `1px solid ${LT.win}`, cursor: 'pointer' }} />;
        })}
      </div>

      {/* the selected center */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, margin: '24px 0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, minWidth: 0 }}>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 23, color: FK.INK, whiteSpace: 'nowrap' }}>{title}</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 12, color: FK.INK_MUTED, whiteSpace: 'nowrap' }}>{amountLine}</span>
        </div>
        {chip && <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.04em', color: chip.over ? FK.AMBER_800 : FIN_GOOD, padding: '3px 8px', borderRadius: 2, background: chip.over ? FK.AMBER_50 : 'rgba(31,138,91,0.10)', border: `1px solid ${chip.over ? FK.AMBER : 'rgba(31,138,91,0.4)'}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{chip.text}</span>}
      </div>

      {/* WHY — the intelligence line */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '14px 0 20px', padding: '13px 15px', background: FK.PAPER_SOFT, borderLeft: `2px solid ${FK.AMBER}`, borderRadius: '0 4px 4px 0' }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.16em', color: FK.AMBER, marginTop: 3, flexShrink: 0 }}>WHY</span>
        <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 17, lineHeight: 1.35, color: FK.INK, textWrap: 'pretty' }}>{headline}</span>
      </div>

      {/* drivers — cause & effect, biggest first */}
      {drivers.map((d, i) => (
        <div key={i} style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <span style={{ fontFamily: FK.SANS, fontSize: 14, color: FK.INK }}>{d.label}</span>
            <span style={{ fontFamily: FK.MONO, fontSize: 13, color: i === 0 ? FK.AMBER_800 : FK.INK_MUTED, whiteSpace: 'nowrap' }}>{FLOW.fmtMoney(d.amt)}</span>
          </div>
          <div style={{ height: 5, background: FK.PAPER_SOFT, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (d.amt / maxAmt * 100) + '%', background: i === 0 ? FK.AMBER : FK.INK_FAINT }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── the producer page ───────────────────────────────────────────────
// ── bid build-up (Bidding tab) ─────────────────────────────────────
const BID_COLS = '1fr 34px 40px 70px 78px';
function BidLever({ label, sub, pct, amount, onStep }) {
  const btn = { width: 21, height: 21, borderRadius: 3, border: `1px solid ${LT.line2}`, background: FK.PAPER_SOFT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FK.MONO, fontSize: 14, color: FK.INK_MUTED, lineHeight: 1, userSelect: 'none' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${LT.line}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FK.SANS, fontSize: 14, color: FK.INK }}>{label}</div>
        <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: FK.INK_FAINT, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={btn} onClick={() => onStep(-1)}>{'\u2212'}</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 13, color: FK.AMBER_800, width: 44, textAlign: 'center' }}>{pct}%</span>
          <span style={btn} onClick={() => onStep(1)}>+</span>
        </div>
        <span style={{ fontFamily: FK.MONO, fontSize: 13, color: FK.INK, width: 82, textAlign: 'right' }}>{FLOW.fmtMoney(amount)}</span>
      </div>
    </div>
  );
}

function BiddingView() {
  const bid = FRAMEWORK.BID;
  const [open, setOpen] = React.useState(bid.sections[0].code);
  const [markup, setMarkup] = React.useState(bid.markupPct);
  const [fee, setFee] = React.useState(bid.feePct);
  const clamp = v => Math.max(0, Math.min(50, v));
  const lineTotal = l => l.qty * l.days * l.rate;
  const secSub = s => s.lines.reduce((a, l) => a + lineTotal(l), 0);
  const direct = bid.sections.reduce((a, s) => a + secSub(s), 0);
  const mAmt = Math.round(direct * markup / 100);
  const fAmt = Math.round(direct * fee / 100);
  const iAmt = Math.round((direct + mAmt) * bid.insurancePct / 100);
  const grand = direct + mAmt + fAmt + iAmt;
  const diff = grand - bid.expected;
  const ok = Math.abs(diff) <= bid.expected * 0.02;
  const colR = { fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: FK.INK_FAINT, textAlign: 'right' };
  return (
    <div style={{ padding: '16px 24px 24px' }}>
      {/* bid meta */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: `1px solid ${LT.line}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, minWidth: 0 }}>
          <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 19, color: FK.INK }}>{bid.client}</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 11, color: FK.INK_FAINT }}>{bid.agency} · {bid.project}</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.12em', color: FK.AMBER_800, padding: '2px 7px', borderRadius: 2, background: FK.AMBER_50, border: `1px solid ${FK.AMBER}` }}>{bid.status}</span>
        </div>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT, whiteSpace: 'nowrap' }}>{bid.system} · {bid.director}</span>
      </div>

      {/* sections accordion */}
      {bid.sections.map(s => {
        const sub = secSub(s), isOpen = open === s.code;
        return (
          <div key={s.code} style={{ borderBottom: `1px solid ${LT.line}` }}>
            <div onClick={() => setOpen(isOpen ? null : s.code)} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto 16px', gap: 11, alignItems: 'center', padding: '11px 4px', cursor: 'pointer' }}>
              <span style={{ fontFamily: FK.MONO, fontSize: 11, color: FK.AMBER }}>{s.code}</span>
              <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 16, color: isOpen ? FK.AMBER_800 : FK.INK }}>{s.name}</span>
              <span style={{ fontFamily: FK.MONO, fontSize: 13, color: FK.INK }}>{FLOW.fmtMoney(sub)}</span>
              <FGlyph name="arrow" size={11} style={{ color: FK.INK_FAINT, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
            </div>
            {isOpen && (
              <div style={{ paddingBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: BID_COLS, gap: 8, padding: '0 4px 5px' }}>
                  <span style={{ ...colR, textAlign: 'left' }}>Description</span><span style={colR}>Qty</span><span style={colR}>Days</span><span style={colR}>Rate</span><span style={colR}>Total</span>
                </div>
                {s.lines.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: BID_COLS, gap: 8, alignItems: 'baseline', padding: '5px 4px' }}>
                    <span style={{ fontFamily: FK.SANS, fontSize: 12.5, color: FK.INK, minWidth: 0 }}>{l.desc}
                      {l.ctype
                        ? <span style={{ fontFamily: FK.MONO, fontSize: 8, letterSpacing: '0.08em', color: FK.AMBER_800, marginLeft: 8, padding: '1px 5px', borderRadius: 2, background: FK.AMBER_50, border: `1px solid ${FK.AMBER}` }}>{l.ctype}</span>
                        : <span style={{ fontFamily: FK.MONO, fontSize: 8.5, letterSpacing: '0.06em', color: FK.INK_FAINT, marginLeft: 7 }}>{l.unit}</span>}</span>
                    <span style={{ fontFamily: FK.MONO, fontSize: 12, color: FK.INK_MUTED, textAlign: 'right' }}>{l.qty}</span>
                    <span style={{ fontFamily: FK.MONO, fontSize: 12, color: FK.INK_MUTED, textAlign: 'right' }}>{l.days}</span>
                    <span style={{ fontFamily: FK.MONO, fontSize: 12, color: FK.INK_MUTED, textAlign: 'right' }}>{FLOW.fmtMoney(l.rate)}</span>
                    <span style={{ fontFamily: FK.MONO, fontSize: 12, color: FK.INK, textAlign: 'right' }}>{FLOW.fmtMoney(lineTotal(l))}</span>
                  </div>
                ))}
                {s.travel && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px 2px', marginTop: 4, borderTop: `1px solid ${LT.line}` }}>
                    <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: FK.INK_FAINT }}>Travel handling · {s.handlingPct}% reduced</span>
                    <span style={{ fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT }}>incl. in subtotal</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* calc stack — the deal-term levers */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 8px' }}>
          <span style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT }}>Bid calc · live</span>
          <span style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.04em', color: FK.INK_FAINT }}>Direct {FLOW.fmtMoney(direct)}</span>
        </div>
        <BidLever label="Markup" sub="on direct costs" pct={markup} amount={mAmt} onStep={d => setMarkup(v => clamp(v + d))} />
        <BidLever label="Production fee" sub="on direct costs" pct={fee} amount={fAmt} onStep={d => setFee(v => clamp(v + d))} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <div>
            <div style={{ fontFamily: FK.SANS, fontSize: 14, color: FK.INK }}>Insurance</div>
            <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: FK.INK_FAINT, marginTop: 2 }}>{bid.insurancePct}% on direct + markup</div>
          </div>
          <span style={{ fontFamily: FK.MONO, fontSize: 13, color: FK.INK }}>{FLOW.fmtMoney(iAmt)}</span>
        </div>
      </div>

      {/* grand total + reconciliation */}
      <div style={{ marginTop: 14, padding: '15px 17px', background: FK.PAPER_SOFT, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: FK.INK_FAINT, marginBottom: 5 }}>Computed grand total</div>
          <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color: FK.INK }}>{FLOW.fmtMoney(grand)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FK.MONO, fontSize: 11, color: FK.INK_MUTED, marginBottom: 7 }}>Expected {FLOW.fmtMoney(bid.expected)}</div>
          <span style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.04em', color: ok ? FIN_GOOD : FK.AMBER_800, padding: '3px 9px', borderRadius: 2, background: ok ? 'rgba(31,138,91,0.10)' : FK.AMBER_50, border: `1px solid ${ok ? 'rgba(31,138,91,0.4)' : FK.AMBER}`, whiteSpace: 'nowrap' }}>
            {ok ? 'within tolerance' : `review · ${diff > 0 ? '+' : '\u2212'}${FLOW.fmtMoney(Math.abs(diff))}`}</span>
        </div>
      </div>
    </div>
  );
}

// ── script intake (Script tab — line-by-line + live breakdown) ─────
const SCRIPT_LINES = (function () {
  const out = [];
  FLOW.FILM.parts.forEach(p => {
    out.push({ kind: 'part', text: p.transition ? 'Transition' : 'Part ' + p.n + ' \u00b7 ' + p.label });
    p.blocks.forEach(b => out.push({ kind: b.k, text: b.text }));
  });
  return out;
})();
// What the breakdown engine flags as it reads — each tagged to a bid line.
const SCRIPT_INSIGHTS = [
  { match: 'BOOMS UP', code: 'D', cat: 'Equipment', driver: 'Technocrane move', impact: 16000, src: 'Camera BOOMS UP the face of an 80th-floor building' },
  { match: '80th-floor', code: 'C', cat: 'Locations', driver: 'High-rise permit + freight', impact: 9000, src: 'an 80th-floor office building' },
  { match: 'frantic executives', code: 'A', cat: 'Talent', driver: 'Background crowd (~60)', impact: 12000, src: 'rows of frantic executives' },
  { match: 'thrown out a window', code: 'F', cat: 'Post / FX', driver: 'Window gag — rig + comp', impact: 18000, src: 'a man is thrown out a window' },
  { match: 'Sets constructed', code: 'E', cat: 'Production Design', driver: 'Period set build', impact: 16000, src: 'Sets constructed. Crew scrambling.' },
  { match: 'parking lot', code: 'C', cat: 'Locations', driver: 'Exterior unit + picture vehicles', impact: 10000, src: 'Cars pull up to a store parking lot' },
  { match: 'production set that matches', code: 'E', cat: 'Production Design', driver: 'Match-to-board build', impact: 8000, src: 'a real production set that matches the storyboard' },
];
function hlScript(text) {
  for (const ins of SCRIPT_INSIGHTS) {
    const idx = text.toLowerCase().indexOf(ins.match.toLowerCase());
    if (idx >= 0) return [text.slice(0, idx),
      <span key="m" style={{ background: FK.AMBER_50, color: FK.AMBER_800, borderRadius: 2, padding: '0 2px', boxShadow: `inset 0 -1px 0 ${FK.AMBER}` }}>{text.slice(idx, idx + ins.match.length)}</span>,
      text.slice(idx + ins.match.length)];
  }
  return [text];
}

function ScriptProcessing({ step }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [step]);
  const total = SCRIPT_LINES.length;
  const done = step >= total - 1;
  const cursor = <span style={{ display: 'inline-block', width: 7, height: 14, background: FK.AMBER, marginLeft: 4, verticalAlign: '-2px', animation: 'tenetBreathe 1s ease-in-out infinite' }} />;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '11px 22px', borderBottom: `1px solid ${LT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: FK.AMBER }}>Reading script</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT }}>{FLOW.FILM.file} · {Math.min(step + 1, total)}/{total}</span>
      </div>
      <div ref={ref} style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 22px 24px' }}>
        {SCRIPT_LINES.slice(0, step + 1).map((l, i) => {
          const active = i === step && !done;
          if (l.kind === 'part') return (
            <div key={i} style={{ margin: i === 0 ? '0 0 12px' : '20px 0 12px' }}>
              <div style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER }}>{l.text}</div>
              <div style={{ height: 1, background: LT.line, marginTop: 8 }} />
            </div>
          );
          if (l.kind === 'card') return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
              <span style={{ flex: 1, height: 1, background: LT.line2 }} />
              <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: FK.INK_MUTED, whiteSpace: 'nowrap' }}>{l.text}</span>
              <span style={{ flex: 1, height: 1, background: LT.line2 }} />
            </div>
          );
          if (l.kind === 'q') return (
            <div key={i} style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.4, color: FK.INK, textAlign: 'center', margin: '0 8px 12px' }}>{hlScript(l.text)}{active && cursor}</div>
          );
          const vo = l.kind === 'vo';
          return (
            <div key={i} style={{ display: 'flex', gap: 13, marginBottom: 11, padding: '3px 6px', borderRadius: 3, background: active ? FK.AMBER_50 : 'transparent' }}>
              <div style={{ flex: '0 0 44px', textAlign: 'right', paddingTop: 3 }}>
                <span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: vo ? FK.AMBER : FK.INK_FAINT }}>{vo ? 'VO' : 'Visual'}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0, borderLeft: vo ? `2px solid ${FK.AMBER}` : 'none', paddingLeft: vo ? 12 : 0 }}>
                <span style={{ fontFamily: FK.SCRIPT, fontSize: 13.5, lineHeight: 1.5, color: vo ? FK.INK : FK.INK_MUTED, fontWeight: vo ? 500 : 400 }}>{hlScript(l.text)}{active && cursor}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BidInsights({ step, onOpenBid }) {
  const seen = SCRIPT_LINES.slice(0, step + 1).map(l => l.text.toLowerCase()).join(' \u2063 ');
  const detected = SCRIPT_INSIGHTS.filter(ins => seen.includes(ins.match.toLowerCase()));
  const total = SCRIPT_INSIGHTS.length;
  const flagged = detected.reduce((a, d) => a + d.impact, 0);
  const done = step >= SCRIPT_LINES.length - 1;
  return (
    <div style={{ padding: '18px 22px 22px' }}>
      <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15, color: FK.INK_MUTED, marginBottom: 14 }}>
        {done ? 'Breakdown ready — every driver tagged to a bid line.' : 'Reading the script for cost drivers\u2026'}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 8, background: FK.PAPER_SOFT, borderRadius: 3 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: FK.INK_MUTED }}>{detected.length}/{total} drivers</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 13, color: FK.AMBER_800 }}>{FLOW.fmtMoney(flagged)} flagged</span>
      </div>
      {detected.map((d, i) => (
        <div key={i} style={{ padding: '12px 6px', borderBottom: `1px solid ${LT.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 9, minWidth: 0 }}>
              <span style={{ fontFamily: FK.MONO, fontSize: 10, color: FK.AMBER }}>{d.code}</span>
              <span style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 16, color: FK.INK }}>{d.cat}</span>
            </span>
            <span style={{ fontFamily: FK.MONO, fontSize: 12, color: FK.AMBER_800, whiteSpace: 'nowrap' }}>+{FLOW.fmtMoney(d.impact)}</span>
          </div>
          <div style={{ fontFamily: FK.SANS, fontSize: 13, color: FK.INK, marginBottom: 3 }}>{d.driver}</div>
          <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: FK.INK_FAINT }}>“{d.src}”</div>
        </div>
      ))}
      {detected.length === 0 && <div style={{ fontFamily: FK.MONO, fontSize: 11, color: FK.INK_FAINT, padding: '20px 6px', textAlign: 'center' }}>Listening…</div>}
      {done && (
        <button onClick={onOpenBid} style={{ marginTop: 16, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: FK.AMBER, color: FK.PAPER, border: 'none', borderRadius: 3, padding: '10px 14px', fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Open the bid <FGlyph name="arrow" size={13} /></button>
      )}
    </div>
  );
}

// ── scenarios (Bidding tab — the "what if" engine) ─────────────────
function ScenariosPanel() {
  const bid = FRAMEWORK.BID;
  const [on, setOn] = React.useState({});
  const factor = 1 + (bid.markupPct + bid.feePct) / 100 + (bid.insurancePct / 100) * (1 + bid.markupPct / 100);
  const baseDirect = bid.sections.reduce((a, s) => a + s.lines.reduce((b, l) => b + l.qty * l.days * l.rate, 0), 0);
  const active = FRAMEWORK.BID_SCENARIOS.filter(s => on[s.id]);
  const saveDirect = active.reduce((a, s) => a + s.save, 0);
  const baseGrand = Math.round(baseDirect * factor);
  const newGrand = Math.round((baseDirect - saveDirect) * factor);
  const dBudget = newGrand - baseGrand;
  const dDays = active.reduce((a, s) => a + s.days, 0);
  const dCrew = active.reduce((a, s) => a + s.crew, 0);
  const riskNet = active.reduce((a, s) => a + s.risk, 0);
  const risk = active.length === 0 ? { t: '\u2014', c: FK.INK_FAINT } : riskNet < 0 ? { t: 'Lower', c: FIN_GOOD } : riskNet > 0 ? { t: 'Higher', c: FK.AMBER_800 } : { t: 'Neutral', c: FK.INK_MUTED };
  const stat = (label, value, color) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: FK.INK_FAINT, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 22, lineHeight: 1, color: color || FK.INK }}>{value}</div>
    </div>
  );
  return (
    <div style={{ padding: '18px 22px 22px' }}>
      <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 15, color: FK.INK_MUTED, marginBottom: 16 }}>Toggle a lever — watch the bid move.</div>
      {FRAMEWORK.BID_SCENARIOS.map(s => {
        const sel = !!on[s.id];
        return (
          <div key={s.id} onClick={() => setOn(o => Object.assign({}, o, { [s.id]: !o[s.id] }))}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', marginLeft: -10, marginRight: -10, cursor: 'pointer', borderBottom: `1px solid ${LT.line}`, background: sel ? FK.AMBER_50 : 'transparent' }}>
            <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 3, border: `1px solid ${sel ? FK.AMBER : LT.line2}`, background: sel ? FK.AMBER : LT.win, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FK.PAPER, fontSize: 12, lineHeight: 1 }}>{sel ? '\u2713' : ''}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FK.SANS, fontSize: 14, color: sel ? FK.AMBER_800 : FK.INK }}>{s.label}</div>
              <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.04em', color: FK.INK_FAINT, marginTop: 2 }}>{s.note}</div>
            </div>
            <span style={{ fontFamily: FK.MONO, fontSize: 12, color: sel ? FK.AMBER_800 : FK.INK_MUTED, whiteSpace: 'nowrap' }}>{'\u2212'}{FLOW.fmtMoney(s.save)}</span>
          </div>
        );
      })}

      {/* impact output */}
      <div style={{ marginTop: 20, padding: '16px 17px', background: FK.PAPER_SOFT, borderRadius: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <div>
            <div style={{ fontFamily: FK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: FK.INK_FAINT, marginBottom: 5, whiteSpace: 'nowrap' }}>Budget impact · all-in</div>
            <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color: dBudget < 0 ? FIN_GOOD : FK.INK }}>{dBudget === 0 ? '$0' : finSigned(dBudget)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT, marginBottom: 4, whiteSpace: 'nowrap' }}>{FLOW.fmtMoney(baseGrand)} {'\u2192'}</div>
            <div style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 20, color: FK.INK }}>{FLOW.fmtMoney(newGrand)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, borderTop: `1px solid ${LT.line}`, paddingTop: 14 }}>
          {stat('Schedule', dDays === 0 ? '0' : dDays + 'd', dDays < 0 ? FIN_GOOD : dDays > 0 ? FK.AMBER_800 : FK.INK)}
          {stat('Crew', dCrew === 0 ? '0' : String(dCrew), dCrew < 0 ? FIN_GOOD : FK.INK)}
          {stat('Risk', risk.t, risk.c)}
        </div>
      </div>
    </div>
  );
}

// ── the producer page ───────────────────────────────────────────────
// ── viewing window (program monitor) ───────────────────
function ViewingWindow({ state }) {
  const len = FLOW.totalLength(state);
  return (
    <Win title="Program" style={{ flex: '0 0 auto' }}
      right={<span style={{ fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT }}>16×9</span>}>
      <div style={{ padding: 14 }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000',
          border: `1px solid ${LT.line2}`, overflow: 'hidden' }}>
          <img src="assets/production-thumbnail.png" alt="Program" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 38, background: 'linear-gradient(rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)' }}>PROGRAM · 16×9</div>
          <div style={{ position: 'absolute', left: 12, bottom: 10, fontFamily: FK.MONO, fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>01:00:00:00</div>
          <div style={{ position: 'absolute', right: 12, bottom: 10, fontFamily: FK.MONO, fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>{FLOW.fmtClock(len)}</div>
        </div>
      </div>
    </Win>
  );
}

// ── bottom timeline (full width, compact) ─────────────────
function PWave() {
  const bars = [];
  for (let i = 0; i < 150; i++) { const x = i / 150; bars.push(Math.max(0.08, Math.abs(Math.sin(x * 22) * 0.5 + Math.sin(x * 7 + 1) * 0.35 + Math.sin(x * 51) * 0.16)) * 100); }
  return <div style={{ position: 'absolute', inset: '3px 0', display: 'flex', alignItems: 'center', gap: 1, padding: '0 6px' }}>{bars.map((h, i) => <div key={i} style={{ flex: 1, height: h + '%', background: '#b3bcc6', minWidth: 1 }} />)}</div>;
}

// Cost heat ramp — neutral (cheap) → rust (expensive). Stays in the warm,
// amber-led brand family rather than a literal red/green map.
const HEAT_STOPS = ['#E7E2D8', '#F2DCB4', '#ECB659', '#DB8526', '#B4471C'];
const HEAT_CSS = 'linear-gradient(90deg, #E7E2D8, #F2DCB4, #ECB659, #DB8526, #B4471C)';
function heatColor(t) {
  const i = t >= 0.8 ? 4 : t >= 0.6 ? 3 : t >= 0.4 ? 2 : t >= 0.2 ? 1 : 0;
  return HEAT_STOPS[i];
}
function finTotal(scene) { return scene.fin ? scene.fin.lv.reduce((a, b) => a + b, 0) : 0; }
function dollarColor(lv) { return lv <= 2 ? '#B58A4C' : lv <= 4 ? '#D8922F' : lv <= 5 ? '#C56A1E' : '#B4471C'; }

// Per-shot cost-profile popup.
function FinancePopup({ block, state, anchor }) {
  const { scene, num } = block;
  const loc = FLOW.LOCS.find(l => l.id === scene.locId);
  const align = anchor < 24 ? 'left' : anchor > 76 ? 'right' : 'center';
  const tx = align === 'left' ? '-10px' : align === 'right' ? 'calc(-100% + 10px)' : '-50%';
  return (
    <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: anchor + '%', transform: `translateX(${tx})`,
      width: 304, background: LT.win, border: `1px solid ${LT.line2}`, borderRadius: 6,
      boxShadow: '0 14px 38px rgba(0,0,0,0.18)', padding: '14px 16px 15px', zIndex: 60, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 3 }}>
        <span style={{ fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.18em', color: FK.AMBER, whiteSpace: 'nowrap', flexShrink: 0 }}>SHOT {num}</span>
        <span style={{ fontFamily: FK.MONO, fontSize: 9, color: FK.INK_FAINT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, textAlign: 'right' }}>{block.sh.dur.toFixed(1).replace('.0', '')}s · {block.sh.desc}</span>
      </div>
      <div style={{ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 13, color: FK.INK_MUTED, marginBottom: 11 }}>{loc.kind}. {loc.name} — {FLOW.todOf(scene, state)}</div>
      {FLOW.FIN_CATS.map((c, i) => {
        const lv = scene.fin.lv[i];
        return (
          <div key={c} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 4 }}>
            <span style={{ fontFamily: FK.MONO, fontSize: 10.5, color: FK.INK, width: 96, flexShrink: 0 }}>{c}</span>
            <span style={{ flex: 1, borderBottom: `1px dotted ${LT.line2}`, margin: '0 6px 4px' }} />
            <span style={{ fontFamily: FK.MONO, fontSize: 12, letterSpacing: '1.5px', color: dollarColor(lv), whiteSpace: 'nowrap' }}>{'$'.repeat(lv)}</span>
          </div>
        );
      })}
      <div style={{ borderTop: `1px solid ${LT.line}`, margin: '11px 0 9px' }} />
      <div style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT, marginBottom: 7 }}>Primary cost drivers</div>
      {scene.fin.drivers.map((d, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontFamily: FK.SANS, fontSize: 12.5, color: FK.INK, lineHeight: 1.3 }}>
          <span style={{ color: FK.AMBER, flexShrink: 0 }}>•</span>{d}
        </div>
      ))}
    </div>
  );
}

function ProducerTimeline({ state, flashId }) {
  const [view, setView] = React.useState('timeline');
  const [hover, setHover] = React.useState(null);
  const scenes = FLOW.activeScenes(state);
  const total = FLOW.totalLength(state);
  // cut clips (timeline view)
  let acc = 0;
  const clips = scenes.map(s => { const dur = s.shots.reduce((a, sh) => a + sh.dur, 0); const c = { left: acc / total * 100, width: dur / total * 100, name: FLOW.locName(s.locId).toUpperCase(), night: FLOW.isNight(s, state), id: s.id }; acc += dur; return c; });
  // shot heat blocks (finance view)
  let fa = 0;
  const fblocks = FLOW.allShots(state).map((sh, i) => {
    const scene = FLOW.SCENES.find(s => s.id === sh.sceneId);
    const tot = finTotal(scene);
    const left = fa / total * 100, width = sh.dur / total * 100; fa += sh.dur;
    return { sh, scene, tot, left, width, center: left + width / 2, num: String(i + 1).padStart(2, '0') };
  });
  const tots = fblocks.map(b => b.tot);
  const mn = Math.min(...tots), mx = Math.max(...tots);
  const heatT = tot => mx === mn ? 0.5 : (tot - mn) / (mx - mn);
  const hb = fblocks.find(b => b.num === hover);

  const ticks = []; for (let t = 0; t <= total; t += 5) ticks.push(t);
  const HEAD = 110, ROW = 30;
  const hdr = (label) => (<div style={{ height: ROW, display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: `1px solid ${LT.line}`, fontFamily: FK.MONO, fontSize: 10, color: FK.INK_MUTED, letterSpacing: '0.08em' }}>{label}</div>);
  const tab = (id, label) => (
    <div key={id} onClick={() => { setView(id); setHover(null); }} style={{ padding: '5px 13px', cursor: 'pointer', fontFamily: FK.MONO, fontSize: 11,
      letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: id === 'finance' ? `1px solid ${LT.line2}` : 'none',
      background: view === id ? FK.AMBER : LT.win, color: view === id ? FK.PAPER : FK.INK_MUTED }}>{label}</div>
  );
  return (
    <div style={{ flex: '0 0 auto', background: LT.win, borderTop: `1px solid ${LT.line2}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 16px', borderBottom: `1px solid ${LT.line}` }}>
        <div style={{ display: 'inline-flex', border: `1px solid ${LT.line2}`, borderRadius: 3, overflow: 'hidden' }}>
          {tab('timeline', 'Timeline')}{tab('finance', 'Finance')}
        </div>
        <span style={{ fontFamily: FK.SANS, fontWeight: 300, fontSize: 20, color: FK.INK }}>{FLOW.fmtClock(total)}</span>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: HEAD, flexShrink: 0, borderRight: `1px solid ${LT.line2}` }}>
          {view === 'timeline' ? <React.Fragment>{hdr('V1 · CUT')}{hdr('A1 · MIX')}</React.Fragment>
            : <React.Fragment>{hdr('SHOTS · COST')}{hdr('HEAT')}</React.Fragment>}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {view === 'timeline' ? (
            <React.Fragment>
              <div style={{ height: ROW, position: 'relative', borderBottom: `1px solid ${LT.line}` }}>
                {clips.map((c, i) => (
                  <div key={i} title={c.name} style={{ position: 'absolute', top: 3, bottom: 3, left: c.left + '%', width: c.width + '%',
                    background: flashId === c.id ? FK.AMBER_50 : (c.night ? '#EFE4D2' : '#dde6ef'), border: `1px solid ${flashId === c.id ? FK.AMBER : LT.line2}`, borderRadius: 2,
                    display: 'flex', alignItems: 'center', padding: '0 7px', overflow: 'hidden' }}>
                    <span style={{ fontFamily: FK.MONO, fontSize: 9, color: FK.INK_MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: ROW, position: 'relative', borderBottom: `1px solid ${LT.line}`, background: FK.PAPER_SOFT }}><PWave /></div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '34%', width: 1, background: FK.AMBER }} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ height: ROW, position: 'relative', borderBottom: `1px solid ${LT.line}` }}>
                {fblocks.map(b => {
                  const t = heatT(b.tot), active = hover === b.num;
                  return (
                    <div key={b.num} onMouseEnter={() => setHover(b.num)} onMouseLeave={() => setHover(h => h === b.num ? null : h)}
                      onClick={() => setHover(h => h === b.num ? null : b.num)}
                      style={{ position: 'absolute', top: 3, bottom: 3, left: b.left + '%', width: b.width + '%',
                        background: heatColor(t), border: `1px solid ${active ? FK.INK : 'rgba(0,0,0,0.14)'}`, borderRadius: 2, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        boxShadow: active ? '0 0 0 1px ' + FK.INK : 'none' }}>
                      <span style={{ fontFamily: FK.MONO, fontSize: 8.5, color: t > 0.55 ? 'rgba(255,255,255,0.92)' : FK.INK_MUTED }}>{b.num}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: ROW, display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px', borderBottom: `1px solid ${LT.line}`, background: FK.PAPER_SOFT }}>
                <span style={{ fontFamily: FK.MONO, fontSize: 8.5, letterSpacing: '0.14em', color: FK.INK_FAINT }}>LOW</span>
                <div style={{ width: 130, height: 7, borderRadius: 999, background: HEAT_CSS, border: `1px solid ${LT.line2}` }} />
                <span style={{ fontFamily: FK.MONO, fontSize: 8.5, letterSpacing: '0.14em', color: FK.INK_FAINT }}>HIGH</span>
                <span style={{ marginLeft: 'auto', fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 12, color: FK.INK_FAINT }}>Hover a shot for its cost profile</span>
              </div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '34%', width: 1, background: 'rgba(0,0,0,0.25)' }} />
              {hb && <FinancePopup block={hb} state={state} anchor={hb.center} />}
            </React.Fragment>
          )}
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: HEAD, flexShrink: 0, borderRight: `1px solid ${LT.line2}` }} />
        <div style={{ flex: 1, position: 'relative', height: 22 }}>
          {ticks.map(t => (<span key={t} style={{ position: 'absolute', left: (t / total * 100) + '%', top: 5, fontFamily: FK.MONO, fontSize: 9, color: FK.INK_FAINT, transform: 'translateX(2px)' }}>{`01:00:${String(t).padStart(2, '0')}`}</span>))}
        </div>
      </div>
    </div>
  );
}

// ── Script intake cockpit — the production-lane landing ──────────────
// Program monitor + message-to-director (left) · live script reader (center) ·
// auto-tagged bidding insights (right) · cut/finance timeline (bottom).
// This is the unified lane's first view; nav lives in ProductionLane.
function ScriptCockpit({ state, chat, flashId, onSend, goTab }) {
  const [scriptStep, setScriptStep] = React.useState(0);
  const scriptDone = scriptStep >= SCRIPT_LINES.length - 1;
  React.useEffect(() => {
    if (scriptDone) return;
    const t = setTimeout(() => setScriptStep(s => Math.min(s + 1, SCRIPT_LINES.length - 1)), 430);
    return () => clearTimeout(t);
  }, [scriptStep, scriptDone]);
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: LT.canvas }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 14, padding: 16, boxSizing: 'border-box' }}>
        <div style={{ flex: '0 0 430px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <ViewingWindow state={state} />
          <Win title="Message · Director" style={{ flex: 1 }}><ChatDirector chat={chat} onSend={onSend} /></Win>
        </div>
        <div style={{ flex: 1, minWidth: 0, background: LT.win, border: `1px solid ${LT.line}`, borderRadius: 4, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <ScriptProcessing step={scriptStep} />
        </div>
        <Win title="Bidding insights" style={{ flex: '0 0 560px' }}
          right={<span style={{ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT, whiteSpace: 'nowrap' }}>Auto-tagged</span>}>
          <BidInsights step={scriptStep} onOpenBid={() => goTab('bid')} />
        </Win>
      </div>
      <ProducerTimeline state={state} flashId={flashId} />
    </div>
  );
}

Object.assign(window, { ScriptCockpit, BiddingView });
