/* global React */
// TENET Creative Portal — the six views over the Decision/Asset graph.
// All dark; each view takes the active palette `ck` (theme-driven) and `ctx`
// (shared lane state: goTab, tod ripple). The system describes & translates —
// it never scores, ranks, or recommends.
const { FK: CFK, FGlyph: CGl, CREATIVE: CC } = window;

/* ── shared dark atoms ─────────────────────────────────────── */
function ccStatus(ck, s) {
  return { OPEN: ck.txt2, PROPOSED: ck.amber, DECIDED: ck.read, APPROVED: ck.read, LOCKED: ck.txt }[s] || ck.txt2;
}
function ccMaster(ck, m) {
  return { WHY: ck.txt2, WHAT: ck.amber, FEEL: ck.pink, HOW: ck.read, EXPERIENCE: ck.clipBlue }[m] || ck.txt2;
}
function ccVerbState(ck, st) {
  return { PENDING: ck.amber, GRANTED: ck.read, REJECTED: ck.pink }[st] || ck.txt2;
}
const ccKick = (ck, color) => ({ fontFamily: CFK.MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: color || ck.amber, whiteSpace: 'nowrap' });
const ccKickF = (ck) => ({ fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ck.txt3 });

function CCHead({ ck, kicker, lede }) {
  return (
    <div style={{ marginBottom: 22 }}>
      {kicker && <div style={{ fontFamily: CFK.MONO, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ck.amber }}>{kicker}</div>}
      {lede && <div style={{ marginTop: 10, maxWidth: 660, fontFamily: CFK.SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 16.5, lineHeight: 1.5, color: ck.txt2 }}>{lede}</div>}
    </div>
  );
}
function CCPanel({ ck, label, title, children, pad, style }) {
  return (
    <div style={Object.assign({ background: ck.bg1, border: `1px solid ${ck.line}`, borderRadius: 6, overflow: 'hidden' }, style)}>
      {(label || title) && (
        <div style={{ padding: '16px 20px 0' }}>
          {label && <div style={ccKick(ck)}>{label}</div>}
          {title && <div style={{ fontFamily: CFK.SANS, fontWeight: 300, fontSize: 21, color: ck.txt, marginTop: 7 }}>{title}</div>}
        </div>
      )}
      <div style={{ padding: pad != null ? pad : '18px 20px' }}>{children}</div>
    </div>
  );
}
function CCBar({ ck, pct, color, h }) {
  return (
    <div style={{ height: h || 6, background: ck.bg3, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: Math.max(0, Math.min(100, pct)) + '%', background: color || ck.amber }} />
    </div>
  );
}
function CCChip({ ck, on, tone, children }) {
  const c = tone || ck.amber;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 2, whiteSpace: 'nowrap',
      border: `1px solid ${on ? c : ck.line2}`, background: on ? ck.amberDim : 'transparent', color: on ? c : ck.txt2 }}>{children}</span>
  );
}
// origin tag — the structural "AI = human-directed evidence" signal
function CCOrigin({ ck, origin }) {
  const gen = origin === 'HUMAN_DIRECTED_GENERATION';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: gen ? ck.amber : ck.txt3 }}>
      <span style={{ width: 4, height: 4, borderRadius: 999, background: gen ? ck.amber : ck.txt3 }} />{gen ? 'Human-directed' : 'Upload'}
    </span>
  );
}
const ccMoney = CC.money, ccSigned = CC.signed;

/* ══════════════════════════════════════════════════════════
   PROJECT — the decision graph. Priorities first.
   ══════════════════════════════════════════════════════════ */
function CProject({ ctx, ck }) {
  const [sel, setSel] = React.useState('d3');
  const d = CC.decisions.find(x => x.id === sel) || CC.decisions[0];
  const priorities = CC.decisions.filter(x => x.status === 'OPEN' || x.status === 'PROPOSED');
  const settled = CC.decisions.filter(x => x.status === 'DECIDED' || x.status === 'APPROVED' || x.status === 'LOCKED');

  const row = (x) => {
    const on = x.id === sel;
    return (
      <button key={x.id} onClick={() => setSel(x.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
        padding: '13px 16px', background: on ? ck.amberDim : 'transparent', border: 0, borderTop: `1px solid ${ck.line}`,
        boxShadow: on ? `inset 3px 0 0 ${ck.amber}` : 'none' }}>
        <span style={{ fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ccMaster(ck, x.master), flex: '0 0 64px' }}>{CC.MASTER[x.master].label}</span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: CFK.SANS, fontSize: 14, color: on ? ck.txt : ck.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.title}</span>
        {x.cost && <span style={{ fontFamily: CFK.MONO, fontSize: 10, color: ck.amber, whiteSpace: 'nowrap' }}>{ccSigned(x.cost.amt)}</span>}
        <span style={{ fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ccStatus(ck, x.status), flex: '0 0 64px', textAlign: 'right' }}>{x.status}</span>
      </button>
    );
  };

  return (
    <div>
      <CCHead ck={ck} kicker="Project"
        lede="Everything the film is deciding right now — and who owns each call. TENET carries decisions between specialists and shows their consequence; it never casts a vote." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
        {/* decision list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ border: `1px solid ${ck.line}`, borderRadius: 6, background: ck.bg1, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={ccKick(ck)}>Current priorities</span>
              <span style={{ fontFamily: CFK.MONO, fontSize: 10, color: ck.txt3 }}>{priorities.length} awaiting a human</span>
            </div>
            {priorities.map(row)}
          </div>
          <div style={{ border: `1px solid ${ck.line}`, borderRadius: 6, background: ck.bg1, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px' }}><span style={ccKickF(ck)}>Settled</span></div>
            {settled.map(row)}
          </div>
          <div style={{ border: `1px solid ${ck.line}`, borderRadius: 6, background: ck.bg1, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px' }}><span style={ccKickF(ck)}>Room notes</span></div>
            <div style={{ padding: '2px 16px 16px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {CC.comments.map((c, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${ck.line2}`, paddingLeft: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                      <span style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt }}>{c.who}</span>
                      <span style={{ fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.txt3 }}>{CC.ROLE_LABEL[c.role] || c.role}</span>
                    </span>
                    <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, color: ck.txt3 }}>{c.when}</span>
                  </div>
                  <div style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.06em', color: ck.amber, marginBottom: 4 }}>{c.decision}</div>
                  <div style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt2, lineHeight: 1.5 }}>{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* decision detail */}
        <CDecisionDetail ctx={ctx} ck={ck} d={d} />
      </div>
    </div>
  );
}

function CDecisionDetail({ ctx, ck, d }) {
  const rip = d.cost && d.cost.ripple;
  const tod = ctx.tod;            // 'NIGHT' | 'DAY'
  const seeing = tod === 'NIGHT' ? CC.ripple.night : CC.ripple.day;
  return (
    <div style={{ border: `1px solid ${ck.line2}`, borderRadius: 6, background: ck.bg1, overflow: 'hidden', position: 'sticky', top: 0 }}>
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${ck.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: ccMaster(ck, d.master) }}>{CC.MASTER[d.master].label} · {CC.MASTER[d.master].gloss}</span>
          <span style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ccStatus(ck, d.status) }}>{d.status}</span>
        </div>
        <div style={{ fontFamily: CFK.SANS, fontWeight: 300, fontSize: 22, lineHeight: 1.15, color: ck.txt }}>{d.title}</div>
        <div style={{ fontFamily: CFK.SERIF, fontStyle: 'italic', fontSize: 14, color: ck.txt2, marginTop: 7, lineHeight: 1.4 }}>{d.desc}</div>
      </div>

      {/* facets — the same decision in each role's language (the translation) */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ck.line}` }}>
        <div style={Object.assign({}, ccKickF(ck), { marginBottom: 12 })}>Read in each language</div>
        {Object.keys(d.facets).map(role => (
          <div key={role} style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: ck.txt3, flex: '0 0 70px' }}>{role}</span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {d.facets[role].map((f, i) => <CCChip key={i} ck={ck} tone={role === 'Producer' ? ck.amber : ck.read} on>{f}</CCChip>)}
            </span>
          </div>
        ))}
      </div>

      {/* the ripple — consequence on the money lens */}
      {d.cost && (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ck.line}`, background: ck.bg2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={Object.assign({}, ccKickF(ck))}>Consequence</span>
            <span style={{ fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.txt3 }}>Producer lens</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: rip ? 14 : 0 }}>
            <span style={{ fontFamily: CFK.SANS, fontSize: 14, color: ck.txt }}>{d.cost.driver}</span>
            <span style={{ fontFamily: CFK.MONO, fontSize: 14, color: ck.amber }}>{ccSigned(d.cost.amt)}</span>
          </div>

          {rip ? (
            <div>
              {/* the toggle that ripples to the producer */}
              <div style={{ display: 'inline-flex', border: `1px solid ${ck.line2}`, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                {[['NIGHT', 'Night'], ['DAY', 'Day']].map(([v, label], i) => (
                  <div key={v} onClick={() => ctx.setTod(v)} style={{ padding: '6px 18px', cursor: 'pointer', fontFamily: CFK.MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderLeft: i ? `1px solid ${ck.line2}` : 'none', background: tod === v ? ck.amber : ck.bg3, color: tod === v ? ck.bg0 : ck.txt2 }}>{label}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: ck.line, border: `1px solid ${ck.line}`, borderRadius: 4, overflow: 'hidden' }}>
                <RipCell ck={ck} label="Forecast final" value={ccMoney(seeing.forecast)} />
                <RipCell ck={ck} label="Variance" value={seeing.variance === 0 ? '$0' : ccSigned(seeing.variance)} tone={seeing.variance > 0 ? ck.amber : ck.read} />
              </div>
              <div style={{ fontFamily: CFK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: ck.txt3, marginTop: 10, lineHeight: 1.4 }}>
                {tod === 'NIGHT'
                  ? 'Night holds the intimacy — and ' + ccMoney(CC.ripple.otDelta) + ' of crew OT. The producer sees it live.'
                  : 'Flipping to day clears the overtime. The variance moves the moment you choose.'}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.txt3, marginTop: 4 }}>{d.cost.removable ? 'Removable in scenarios' : 'Committed'}</div>
          )}
        </div>
      )}

      {/* authority chain */}
      <div style={{ padding: '16px 20px' }}>
        <div style={Object.assign({}, ccKickF(ck), { marginBottom: 12 })}>Approvals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {d.approvals.map((ap, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                <span style={{ fontFamily: CFK.SANS, fontSize: 13.5, color: ck.txt }}>{CC.ROLE_LABEL[ap.role] || ap.role}</span>
                <span style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ck.txt3 }}>{ap.verb}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ccVerbState(ck, ap.state) }}>{ap.state}</span>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: ccVerbState(ck, ap.state) }} />
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${ck.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.txt3 }}>{d.assets.length} asset{d.assets.length === 1 ? '' : 's'} of evidence</span>
          <button onClick={() => ctx.goTab('edit')} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.amber }}>See evidence <CGl name="arrow" size={11} /></button>
        </div>
      </div>
    </div>
  );
}
function RipCell({ ck, label, value, tone }) {
  return (
    <div style={{ background: ck.bg1, padding: '12px 14px' }}>
      <div style={ccKickF(ck)}>{label}</div>
      <div style={{ fontFamily: CFK.SANS, fontWeight: 300, fontSize: 22, marginTop: 6, color: tone || ck.txt, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCRIPT — versioned, broken down.
   ══════════════════════════════════════════════════════════ */
function CScript({ ctx, ck }) {
  const b = CC.breakdown;
  return (
    <div>
      <CCHead ck={ck} kicker="Script" title="Versioned, and broken down"
        lede="Every draft keeps its lineage. The breakdown extracts scenes, locations, and characters into the graph — it stores and parses, it doesn't rewrite." />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* version lineage */}
        <CCPanel ck={ck} label="Version lineage" title={null}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {CC.scriptVersions.map((v, i) => {
              const latest = i === 0;
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderTop: i ? `1px solid ${ck.line}` : 'none' }}>
                  <span style={{ fontFamily: CFK.MONO, fontSize: 11, color: latest ? ck.amber : ck.txt3, flex: '0 0 28px' }}>v{v.v}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: CFK.MONO, fontSize: 11.5, color: ck.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.label}</div>
                    <div style={{ fontFamily: CFK.SANS, fontSize: 11.5, color: ck.txt3, marginTop: 2 }}>{v.by}{v.parent ? ' · from v' + (v.v - 1) : ' · origin'}</div>
                  </div>
                  {latest && <CCChip ck={ck} on tone={ck.read}>Current</CCChip>}
                </div>
              );
            })}
          </div>
        </CCPanel>

        {/* breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: ck.line, border: `1px solid ${ck.line}`, borderRadius: 6, overflow: 'hidden' }}>
            {[['Scenes', b.scenes], ['Locations', b.locations], ['Characters', b.characters], ['Runtime', b.runtime]].map(([k, v], i) => (
              <div key={i} style={{ background: ck.bg1, padding: '16px 18px' }}>
                <div style={ccKickF(ck)}>{k}</div>
                <div style={{ fontFamily: CFK.SANS, fontWeight: 300, fontSize: 26, marginTop: 6, color: ck.txt }}>{v}</div>
              </div>
            ))}
          </div>
          <CCPanel ck={ck} label="Scene breakdown" title={null} pad={0}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px 1fr', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${ck.line}` }}>
              {['#', 'Location', 'Time', 'Cast'].map((h, i) => <span key={i} style={ccKickF(ck)}>{h}</span>)}
            </div>
            {b.scenes_list.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px 1fr', gap: 12, padding: '12px 18px', alignItems: 'center', borderBottom: i < b.scenes_list.length - 1 ? `1px solid ${ck.line}` : 'none' }}>
                <span style={{ fontFamily: CFK.MONO, fontSize: 11, color: ck.txt3 }}>{String(s.n).padStart(2, '0')}</span>
                <span style={{ fontFamily: CFK.SANS, fontSize: 13.5, color: ck.txt }}>{s.loc}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: CFK.MONO, fontSize: 10, letterSpacing: '0.06em', color: s.dynamic ? ck.amber : ck.txt2 }}>{s.tod}{s.dynamic && <span style={{ fontFamily: CFK.MONO, fontSize: 8, letterSpacing: '0.08em', color: ck.amber, border: `1px solid ${ck.line2}`, borderRadius: 2, padding: '1px 4px' }}>VAR</span>}</span>
                <span style={{ fontFamily: CFK.SANS, fontSize: 12.5, color: ck.txt2 }}>{s.chars.length ? s.chars.join(', ') : '—'}</span>
              </div>
            ))}
          </CCPanel>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BOARDS — frames as evidence. Explore/Refine = play; Lock/Promote = human verbs.
   ══════════════════════════════════════════════════════════ */
function BoardTile({ ck, a, locked, sel, onSelect }) {
  const stripe = ck === window.DK_LIGHT
    ? 'repeating-linear-gradient(135deg, #E7E2D8 0 10px, #ded8cc 10px 20px)'
    : 'repeating-linear-gradient(135deg, #20262d 0 10px, #1a1f25 10px 20px)';
  return (
    <button onClick={onSelect} style={{ textAlign: 'left', cursor: 'pointer', background: ck.bg1, border: `1px solid ${sel ? ck.amber : ck.line2}`, borderRadius: 5, overflow: 'hidden', padding: 0, boxShadow: sel ? `0 0 0 1px ${ck.amber}` : 'none' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: stripe, borderBottom: `1px solid ${ck.line}` }}>
        <div style={{ position: 'absolute', top: 8, left: 9, fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.12em', color: ck.txt3 }}>{a.type} · v{a.v}</div>
        {locked && <div style={{ position: 'absolute', top: 8, right: 9, fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.read }}>◉ Locked</div>}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '7px 9px', background: 'linear-gradient(transparent, rgba(0,0,0,0.35))' }}>
          <CCOrigin ck={ck} origin={a.origin} />
        </div>
      </div>
      <div style={{ padding: '10px 11px' }}>
        <div style={{ fontFamily: CFK.SANS, fontSize: 12.5, color: ck.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
        <div style={{ fontFamily: CFK.MONO, fontSize: 9.5, color: ck.txt3, marginTop: 3 }}>{a.scene}</div>
      </div>
    </button>
  );
}
function CBoards({ ctx, ck }) {
  const [sel, setSel] = React.useState(CC.boards[0].id);
  const [locked, setLocked] = React.useState({});
  const a = CC.boards.find(x => x.id === sel) || CC.boards[0];
  const isLocked = !!locked[a.id];
  function toggleLock() { setLocked(p => Object.assign({}, p, { [a.id]: !p[a.id] })); }

  const actionBtn = (label, primary, onClick) => (
    <button onClick={onClick} style={{ cursor: 'pointer', fontFamily: CFK.MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '9px 14px', borderRadius: 3, border: primary ? 'none' : `1px solid ${ck.line2}`, background: primary ? ck.amber : 'transparent', color: primary ? ck.bg0 : ck.txt2 }}>{label}</button>
  );

  return (
    <div>
      <CCHead ck={ck} kicker="Boards"
        lede="Frames as evidence — explore and refine freely; every one is something a human chose to generate. Lock and Promote are human calls." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {CC.boards.map(bd => <BoardTile key={bd.id} ck={ck} a={bd} locked={!!locked[bd.id]} sel={bd.id === sel} onSelect={() => setSel(bd.id)} />)}
        </div>

        {/* selected frame detail */}
        <div style={{ border: `1px solid ${ck.line2}`, borderRadius: 6, background: ck.bg1, overflow: 'hidden', position: 'sticky', top: 0 }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${ck.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={ccKick(ck)}>{a.type} · v{a.v}</span>
              <CCOrigin ck={ck} origin={a.origin} />
            </div>
            <div style={{ fontFamily: CFK.SANS, fontWeight: 300, fontSize: 19, color: ck.txt }}>{a.label}</div>
            <div style={{ fontFamily: CFK.MONO, fontSize: 10, color: ck.txt3, marginTop: 4 }}>{a.scene} · by {a.by}</div>
          </div>
          {a.prompt && (
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${ck.line}`, background: ck.bg2 }}>
              <div style={Object.assign({}, ccKickF(ck), { marginBottom: 7 })}>Prompt history · lineage, not authorship</div>
              <div style={{ fontFamily: CFK.SCRIPT || CFK.SERIF, fontStyle: 'italic', fontSize: 13, color: ck.txt2, lineHeight: 1.45 }}>“{a.prompt}”</div>
            </div>
          )}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {actionBtn('Explore', false, () => {})}
              {actionBtn('Refine', false, () => {})}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {actionBtn(isLocked ? 'Unlock frame' : 'Lock frame', !isLocked, toggleLock)}
              {actionBtn('Promote to edit', false, () => ctx.goTab('edit'))}
            </div>
            <div style={{ fontFamily: CFK.SERIF, fontStyle: 'italic', fontSize: 12, color: ck.txt3, marginTop: 14, lineHeight: 1.4 }}>
              {isLocked ? 'Locked by a human decision — recorded as an approval.' : 'Exploring freely. Nothing is decided until a person locks it.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EDIT — the cut + analysis that DESCRIBES present state (never advises).
   ══════════════════════════════════════════════════════════ */
function ccSmoothPath(pts) {
  if (pts.length < 2) return '';
  let dd = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    dd += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return dd;
}
function CEdit({ ctx, ck }) {
  const beats = CC.beats;
  const padX = 4, padT = 12, padB = 12;
  const X = i => padX + (i / (beats.length - 1)) * (100 - 2 * padX);
  const Y = t => padT + (1 - t) * (100 - padT - padB);
  const pts = beats.map((b, i) => ({ x: X(i), y: Y(b.t) }));
  const line = ccSmoothPath(pts);
  const area = line + ` L ${pts[pts.length - 1].x.toFixed(1)} 100 L ${pts[0].x.toFixed(1)} 100 Z`;
  const totalDur = CC.seq.reduce((a, s) => a + s.dur, 0);

  return (
    <div>
      <CCHead ck={ck} kicker="Edit"
        lede="The sequence the room is reading. The analysis describes what is present — pacing, coverage, voiceover — it never says what should change." />

      {/* sequence strip */}
      <CCPanel ck={ck} label="Sequence" title={null} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, height: 56, marginBottom: 8 }}>
          {CC.seq.map((s, i) => (
            <div key={i} title={s.desc} style={{ flex: s.dur, minWidth: 0, background: s.tod === 'NIGHT' ? ck.clipGray : ck.clipBlue, border: `1px solid ${ck.clipEdge}`, borderRadius: 2,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px 7px', overflow: 'hidden' }}>
              <span style={{ fontFamily: CFK.MONO, fontSize: 8.5, color: ck.clipText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.loc}</span>
              <span style={{ fontFamily: CFK.MONO, fontSize: 8, color: ck.clipSub }}>{String(s.n).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: CFK.MONO, fontSize: 9, color: ck.txt3 }}>0:00</span>
          <span style={{ fontFamily: CFK.MONO, fontSize: 9, color: ck.txt3 }}>{window.FLOW.fmtClock(totalDur)}</span>
        </div>
      </CCPanel>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* pacing curve — description of present shape */}
        <CCPanel ck={ck} label="Pacing" title="Tension across the cut">
          <div style={{ position: 'relative', height: 150 }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id="cedit-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={ck.read} /><stop offset="0.42" stopColor={ck.amber} /><stop offset="0.78" stopColor={ck.pink} /><stop offset="1" stopColor={ck.amber} />
                </linearGradient>
                <linearGradient id="cedit-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={ck.amber} stopOpacity="0.20" /><stop offset="1" stopColor={ck.amber} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#cedit-fill)" />
              <path d={line} fill="none" stroke="url(#cedit-stroke)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {beats.map((b, i) => (b.t > 0.85) && (
              <div key={b.key} style={{ position: 'absolute', left: pts[i].x + '%', top: pts[i].y + '%', transform: 'translate(-50%,-50%)', width: 13, height: 13, borderRadius: '50%', background: ck.bg0, border: `2.5px solid ${ck.pink}`, boxSizing: 'border-box' }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${beats.length}, 1fr)`, marginTop: 8 }}>
            {beats.map(b => <span key={b.key} style={{ textAlign: 'center', fontFamily: CFK.MONO, fontSize: 10, letterSpacing: '0.06em', color: b.t > 0.85 ? ck.amber : ck.txt3, fontWeight: b.t > 0.85 ? 700 : 400 }}>{b.key}</span>)}
          </div>
        </CCPanel>

        {/* analysis — present state only */}
        <CCPanel ck={ck} label="Creative analysis" title={null} pad={0}>
          <div style={{ padding: '4px 20px 8px' }}>
            {CC.analysis.map((an, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderTop: i ? `1px solid ${ck.line}` : 'none' }}>
                <span style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ck.txt3, flex: '0 0 64px', paddingTop: 2 }}>{an.kind}</span>
                <span style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt, lineHeight: 1.45 }}>{an.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${ck.line}`, background: ck.bg2 }}>
            <span style={{ fontFamily: CFK.SERIF, fontStyle: 'italic', fontSize: 12.5, color: ck.txt3, lineHeight: 1.4 }}>Describes what's there. Judgment stays with the room.</span>
          </div>
        </CCPanel>
      </div>

      {/* Boards — frames live under the edit */}
      <div style={{ marginTop: 32, paddingTop: 28, borderTop: `1px solid ${ck.line2}` }}>
        <CBoards ctx={ctx} ck={ck} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ASSETS — every row, filterable.
   ══════════════════════════════════════════════════════════ */
function CAssets({ ctx, ck }) {
  const types = ['ALL'].concat(Array.from(new Set(CC.assets.map(a => a.type))));
  const [filter, setFilter] = React.useState('ALL');
  const rows = CC.assets.filter(a => filter === 'ALL' || a.type === filter);
  const COLS = '120px 1fr 130px 70px 90px 110px';
  return (
    <div>
      <CCHead ck={ck} kicker="Assets"
        lede="All assets, by type, version, and who made them. Generated frames carry their origin — a human directed every one." />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {types.map(t => <button key={t} onClick={() => setFilter(t)} style={{ cursor: 'pointer', background: 'none', border: 0, padding: 0 }}><CCChip ck={ck} on={filter === t}>{t === 'ALL' ? 'All' : t}</CCChip></button>)}
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: ck.amber, color: ck.bg0, border: 'none', borderRadius: 3, padding: '8px 15px', fontFamily: CFK.MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          <CGl name="upload" size={13} /> Upload asset
        </button>
      </div>
      <div style={{ border: `1px solid ${ck.line}`, borderRadius: 6, background: ck.bg1, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '13px 18px', borderBottom: `1px solid ${ck.line}` }}>
          {['Type', 'Asset', 'Origin', 'Ver', 'State', 'By'].map((h, i) => <span key={i} style={ccKickF(ck)}>{h}</span>)}
        </div>
        {rows.map((a, i) => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '13px 18px', alignItems: 'center', borderTop: i ? `1px solid ${ck.line}` : 'none' }}>
            <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.08em', color: ck.amber }}>{a.type}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: CFK.SANS, fontSize: 13.5, color: ck.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</span>
              <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, color: ck.txt3 }}>{a.scene}</span>
            </span>
            <CCOrigin ck={ck} origin={a.origin} />
            <span style={{ fontFamily: CFK.MONO, fontSize: 11, color: ck.txt2 }}>v{a.v}{a.parent ? '' : ''}</span>
            <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: ccVerbState(ck, a.state) }}>{a.state}</span>
            <span style={{ fontFamily: CFK.SANS, fontSize: 12.5, color: ck.txt2 }}>{a.by}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COLLABORATION — approvals + comments. The AI never holds a verb.
   ══════════════════════════════════════════════════════════ */
function CCollab({ ctx, ck }) {
  const pending = CC.approvals.filter(a => a.state === 'PENDING');
  const acted = CC.approvals.filter(a => a.state !== 'PENDING');
  const apRow = (a, i, arr) => (
    <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 90px', gap: 12, padding: '13px 18px', alignItems: 'center', borderTop: i ? `1px solid ${ck.line}` : 'none' }}>
      <span style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt }}>{CC.ROLE_LABEL[a.role] || a.role}</span>
      <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.txt3 }}>{a.verb}</span>
      <span style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.decision}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ccVerbState(ck, a.state) }}>{a.state}</span>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: ccVerbState(ck, a.state) }} />
      </span>
    </div>
  );
  return (
    <div>
      <CCHead ck={ck} kicker="Collaboration" title="Who holds the verb"
        lede="Every decision routes between the people who own it. Propose, decide, approve, veto — held by roles that are human. The AI is never in this table." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CCPanel ck={ck} label="Awaiting a verb" title={null} pad={0}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 90px', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${ck.line}` }}>
              {['Role', 'Verb', 'Decision', 'State'].map((h, i) => <span key={i} style={ccKickF(ck)}>{h}</span>)}
            </div>
            {pending.map(apRow)}
          </CCPanel>
          <CCPanel ck={ck} label="Acted" title={null} pad={0}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 90px', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${ck.line}` }}>
              {['Role', 'Verb', 'Decision', 'State'].map((h, i) => <span key={i} style={ccKickF(ck)}>{h}</span>)}
            </div>
            {acted.map(apRow)}
          </CCPanel>
        </div>

        {/* comments thread */}
        <CCPanel ck={ck} label="Cross-department notes" title={null}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CC.comments.map((c, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${ck.line2}`, paddingLeft: 13 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                    <span style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt }}>{c.who}</span>
                    <span style={{ fontFamily: CFK.MONO, fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ck.txt3 }}>{CC.ROLE_LABEL[c.role] || c.role}</span>
                  </span>
                  <span style={{ fontFamily: CFK.MONO, fontSize: 9.5, color: ck.txt3 }}>{c.when}</span>
                </div>
                <div style={{ fontFamily: CFK.MONO, fontSize: 9, letterSpacing: '0.06em', color: ck.amber, marginBottom: 5 }}>{c.decision}</div>
                <div style={{ fontFamily: CFK.SANS, fontSize: 13, color: ck.txt2, lineHeight: 1.5 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </CCPanel>
      </div>
    </div>
  );
}

Object.assign(window, {
  CProject, CScript, CBoards, CEdit, CAssets, CCollab,
});
