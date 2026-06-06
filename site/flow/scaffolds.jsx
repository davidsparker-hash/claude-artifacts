/* global React, FK, FGlyph, FLOW, FRAMEWORK, useFTween */
// The left panel — each lane's TOP 10. Producer carries dollars + the chat.

const dScaff = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: FK.PAPER,
    borderRight: `1px solid ${FK.BORDER}`, boxSizing: 'border-box', overflow: 'hidden' },
  head: { padding: '22px 30px 16px', borderBottom: `1px solid ${FK.BORDER}` },
  kicker: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER, whiteSpace: 'nowrap' },
  title: { fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 22, color: FK.INK, lineHeight: 1.1, marginTop: 8 },
  sub: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: FK.INK_FAINT, marginTop: 8 },
  list: { flex: 1, overflow: 'auto', padding: '8px 0' },
  row: (on) => ({ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 30px', cursor: 'pointer',
    background: on ? FK.AMBER_50 : 'transparent', boxShadow: on ? `inset 3px 0 0 ${FK.AMBER}` : 'none' }),
  n: (on) => ({ fontFamily: FK.MONO, fontSize: 11, color: on ? FK.AMBER : FK.INK_FAINT, width: 20 }),
  name: (on) => ({ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 18, color: on ? FK.AMBER_800 : FK.INK, flex: 1 }),
  count: { fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT },
};

function ScaffoldDirector({ cat, onCat }) {
  const S = dScaff;
  return (
    <div style={S.root}>
      <div style={S.head}>
        <div style={S.kicker}>Director · top 10</div>
        <div style={S.title}>Creative variables</div>
        <div style={S.sub}>The ten that decide whether it lands</div>
      </div>
      <div style={S.list}>
        {FRAMEWORK.DIRECTOR.map(c => {
          const on = cat === c.id;
          return (
            <div key={c.id} style={S.row(on)} onClick={() => onCat(c.id)}>
              <span style={S.n(on)}>{String(c.n).padStart(2, '0')}</span>
              <span style={S.name(on)}>{c.name}</span>
              <span style={S.count}>{on ? '6 subs ›' : '6'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const pScaff = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: FK.PAPER,
    borderRight: `1px solid ${FK.BORDER}`, boxSizing: 'border-box', overflow: 'hidden' },
  top: { padding: '20px 30px 16px', borderBottom: `1px solid ${FK.BORDER}` },
  kicker: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: FK.AMBER, whiteSpace: 'nowrap' },
  totalLabel: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: FK.INK_FAINT, marginTop: 12 },
  total: { fontFamily: FK.SANS, fontWeight: 300, fontSize: 44, color: FK.INK, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 4 },
  list: { flex: 1, overflow: 'auto' },
  row: (on, flash) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 30px', cursor: 'pointer',
    borderBottom: `1px solid ${FK.BORDER}`,
    background: on || flash ? FK.AMBER_50 : 'transparent', boxShadow: on ? `inset 3px 0 0 ${FK.AMBER}` : 'none' }),
  n: { fontFamily: FK.MONO, fontSize: 10, color: FK.INK_FAINT, width: 18 },
  name: (on) => ({ fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 16, color: on ? FK.AMBER_800 : FK.INK, flex: 1 }),
  ot: { fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: FK.AMBER_800,
    padding: '2px 6px', borderRadius: 2, background: FK.AMBER_50, border: `1px solid ${FK.AMBER}` },
  cost: { fontFamily: FK.MONO, fontSize: 12, color: FK.INK, width: 74, textAlign: 'right' },
  chat: { borderTop: `1px solid ${FK.BORDER}`, background: FK.PAPER_SOFT, padding: '14px 24px 18px', flexShrink: 0 },
  chatHead: { fontFamily: FK.MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: FK.AMBER, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' },
  bubble: (mine) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%',
    background: mine ? FK.INK : FK.PAPER, color: mine ? FK.PAPER : FK.INK,
    border: mine ? 'none' : `1px solid ${FK.BORDER}`, borderRadius: 8, padding: '8px 11px',
    fontFamily: FK.SANS, fontSize: 12.5, lineHeight: 1.4, marginBottom: 7 }),
  who: (mine) => ({ fontFamily: FK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: mine ? 'rgba(255,255,255,0.6)' : FK.INK_FAINT, marginBottom: 3 }),
  composer: { display: 'flex', flexDirection: 'column', gap: 9 },
  draft: { fontFamily: FK.SANS, fontSize: 12.5, color: FK.INK, lineHeight: 1.4, padding: '9px 11px',
    background: FK.PAPER, border: `1px solid ${FK.BORDER_STRONG}`, borderRadius: 8 },
  send: { alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    background: FK.AMBER, color: FK.PAPER, border: 'none', borderRadius: 2, padding: '8px 15px',
    fontFamily: FK.MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' },
  typing: { fontFamily: FK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: FK.INK_FAINT, marginBottom: 7 },
};

const DRAFT_MSG = 'Schedule won\u2019t let us shoot this night scene. Can it be changed?';

function ScaffoldProducer({ state, cat, onCat, chat, onSend, catFlash }) {
  const S = pScaff;
  const total = useFTween(FRAMEWORK.producerTotal(state), 700);
  return (
    <div style={S.root}>
      <div style={S.top}>
        <div style={S.kicker}>Producer · top 10</div>
        <div style={S.totalLabel}>Total cost</div>
        <div style={S.total}>{FLOW.fmtMoney(total)}</div>
      </div>

      <div style={S.list}>
        {FRAMEWORK.PRODUCER.map(c => {
          const on = cat === c.id;
          const cost = FRAMEWORK.categoryCost(c, state);
          const ot = c.nightVar && FRAMEWORK.nightActive(state);
          return (
            <div key={c.id} style={S.row(on, catFlash === c.id)} onClick={() => onCat(c.id)}>
              <span style={S.n}>{String(c.n).padStart(2, '0')}</span>
              <span style={S.name(on)}>{c.name}</span>
              {ot && <span style={S.ot}>+OT</span>}
              <span style={S.cost}>{FLOW.fmtMoney(cost)}</span>
            </div>
          );
        })}
      </div>

      <div style={S.chat}>
        <div style={S.chatHead}><FGlyph name="chat" size={14} /> Message · Director</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {chat.messages.map((m, i) => (
            <div key={i} style={S.bubble(m.from === 'producer')}>
              <div style={S.who(m.from === 'producer')}>{m.from === 'producer' ? 'You · Producer' : 'D. Parker · Director'}</div>
              {m.text}
            </div>
          ))}
          {chat.typing && <div style={S.typing}>Director is editing the script\u2026</div>}
        </div>
        {!chat.sent && (
          <div style={S.composer}>
            <div style={S.draft}>{DRAFT_MSG}</div>
            <button style={S.send} onClick={onSend}><FGlyph name="send" size={13} /> Send</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.ScaffoldDirector = ScaffoldDirector;
window.ScaffoldProducer = ScaffoldProducer;
