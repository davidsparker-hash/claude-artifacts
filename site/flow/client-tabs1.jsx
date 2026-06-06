/* global React */
// TENET Client Portal — Reviews (the landing cut) + Timeline.
const { FK: RFK, FGlyph: RG, CLIENT: RC } = window;
const { CPanel: RP, CPStat: RStat, CPBar: RBar, CPDot: RDot, CPHead: RHead, cpKickerFaint: RKickF } = window;
const RUse = React.useState;

function rShift(days) { const d = new Date(2026, 5, 27); d.setDate(d.getDate() + days); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

/* ══════════════════════════════════════════════════════════
   REVIEWS — the cut, kept as the landing
   ══════════════════════════════════════════════════════════ */
function ReviewsTab({ ctx }) {
  const r = RC.reviews;
  const [asset, setAsset] = RUse('edits');
  const [cutId, setCutId] = RUse('v4');
  const [decision, setDecision] = RUse(null);
  const cut = r.cuts.find(c => c.id === cutId);
  const a = r.assets.find(x => x.id === asset);

  return (
    <div>
      <RHead kicker="Reviews"
        lede="See the idea before it’s made. Approve the cut, or send a note straight back to the room." />

      <div style={{ display: 'grid', gridTemplateColumns: '156px 1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Asset rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={Object.assign({}, RKickF, { marginBottom: 8 })}>Project assets</div>
          {r.assets.map(x => {
            const on = x.id === asset;
            return (
              <button key={x.id} onClick={() => setAsset(x.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, textAlign: 'left', cursor: 'pointer', padding: '10px 12px', borderRadius: 4, border: `1px solid ${on ? RFK.INK : 'transparent'}`, background: on ? RFK.PAPER : 'transparent' }}>
                <span style={{ fontFamily: RFK.SANS, fontSize: 13, color: on ? RFK.INK : RFK.INK_MUTED, lineHeight: 1.2 }}>{x.name}</span>
                <span style={{ fontFamily: RFK.MONO, fontSize: 10, color: RFK.INK_FAINT }}>{x.count}</span>
              </button>
            );
          })}
        </div>

        {/* Center */}
        <div>
          {asset === 'edits' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {r.cuts.map(c => {
                  const on = c.id === cutId;
                  return (
                    <button key={c.id} onClick={() => setCutId(c.id)} title={c.date + ' · ' + c.note} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 10px', borderRadius: 3, whiteSpace: 'nowrap', border: `1px solid ${on ? RFK.AMBER : RFK.BORDER}`, background: on ? RFK.AMBER_50 : 'transparent', fontFamily: RFK.MONO, fontSize: 10, letterSpacing: '0.06em', color: on ? RFK.AMBER_800 : RFK.INK_MUTED }}>
                      {on && <span style={{ width: 5, height: 5, borderRadius: 999, background: RFK.AMBER }} />}{c.tag}
                      <span style={{ color: RFK.INK_FAINT }}>{c.date}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: RFK.INK_FAINT, whiteSpace: 'nowrap' }}>
                <RG name="film" size={14} /><span style={{ fontFamily: RFK.MONO, fontSize: 11, letterSpacing: '0.08em' }}>{cut.name}</span>
                <span style={{ fontFamily: RFK.SERIF, fontStyle: 'italic', fontSize: 12, color: RFK.INK_FAINT }}>{cut.note}</span>
              </div>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000', border: `1px solid ${RFK.BORDER_STRONG}`, overflow: 'hidden' }}>
                <iframe src="https://player.vimeo.com/video/1198884434?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerPolicy="strict-origin-when-cross-origin" title={RC.project.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' }}></iframe>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(rgba(0,0,0,0.5),transparent)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: RFK.MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }}>PROGRAM · 16×9</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + r.beats.length + ',1fr)', marginTop: 14 }}>
                {r.beats.map((bt, i) => (<span key={bt} style={{ textAlign: 'center', fontFamily: RFK.MONO, fontSize: 11, letterSpacing: '0.08em', color: i === 4 ? RFK.AMBER : RFK.INK_FAINT, fontWeight: i === 4 ? 700 : 400 }}>{bt}</span>))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: RFK.SANS, fontWeight: 300, fontSize: 22, color: RFK.INK }}>{a.name}</span>
                <span style={{ fontFamily: RFK.MONO, fontSize: 11, color: RFK.INK_FAINT }}>{a.count} items</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {Array.from({ length: Math.min(6, a.count) }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '4 / 3', borderRadius: 4, border: `1px solid ${RFK.BORDER}`, background: 'repeating-linear-gradient(135deg, #FAF8F4 0 9px, #F2EDE4 9px 18px)', display: 'flex', alignItems: 'flex-end', padding: 10 }}>
                    <span style={{ fontFamily: RFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: RFK.INK_FAINT }}>{a.name.split(' ')[0]} {String(i + 1).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: review + feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RP label="For your review" title={null} pad={22} subject>
            <div style={{ fontFamily: RFK.SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 22, lineHeight: 1.2, color: RFK.INK, marginBottom: 12 }}>{RC.project.title}</div>
            <div style={{ fontFamily: RFK.SANS, fontSize: 13.5, lineHeight: 1.55, color: RFK.INK_MUTED, marginBottom: 20 }}>The cut as it stands today — approve it, or send a note back to the room.</div>
            {!decision ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => setDecision('approved')} style={{ borderRadius: 3, padding: '12px 16px', cursor: 'pointer', fontFamily: RFK.MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', background: RFK.AMBER, color: RFK.PAPER, border: 'none' }}>Approve this cut</button>
                <button onClick={() => setDecision('changes')} style={{ borderRadius: 3, padding: '12px 16px', cursor: 'pointer', fontFamily: RFK.MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: RFK.INK, border: `1px solid ${RFK.BORDER_STRONG}` }}>Send notes</button>
              </div>
            ) : (
              <div style={{ padding: '16px 18px', border: `1px solid ${decision === 'approved' ? 'rgba(31,138,91,0.4)' : RFK.AMBER}`, background: decision === 'approved' ? 'rgba(31,138,91,0.08)' : RFK.AMBER_50, borderRadius: 4 }}>
                <div style={{ fontFamily: RFK.MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: decision === 'approved' ? '#1F8A5B' : RFK.AMBER_800, marginBottom: 6 }}>{decision === 'approved' ? 'Approved' : 'Notes sent'}</div>
                <div style={{ fontFamily: RFK.SERIF, fontStyle: 'italic', fontSize: 14, color: RFK.INK }}>{decision === 'approved' ? 'Sent to the room. Production can lock the bid.' : 'Your note is on its way to the creative seat.'}</div>
                <button onClick={() => setDecision(null)} style={{ marginTop: 12, background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: RFK.MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: RFK.INK_FAINT, borderBottom: `1px solid ${RFK.BORDER}` }}>Undo</button>
              </div>
            )}
          </RP>

          <RP label="Client feedback" title={null} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {r.comments.map((c, i) => (
                <div key={i} style={{ padding: '12px 0', borderTop: i ? `1px solid ${RFK.BORDER}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: RFK.MONO, fontSize: 10, color: RFK.AMBER, letterSpacing: '0.08em' }}>{c.at}</span>
                    <span style={{ fontFamily: RFK.SANS, fontSize: 12, color: RFK.INK }}>{c.author}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: RFK.MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.state === 'addressed' ? '#1F8A5B' : RFK.INK_FAINT }}>{c.state}</span>
                  </div>
                  <div style={{ fontFamily: RFK.SANS, fontSize: 13, color: RFK.INK_MUTED, lineHeight: 1.45 }}>{c.text}</div>
                </div>
              ))}
            </div>
          </RP>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TIMELINE
   ══════════════════════════════════════════════════════════ */
function TimelineTab({ ctx }) {
  const t = RC.timeline;
  const delivery = rShift(ctx.daysDelta);
  return (
    <div>
      <RHead kicker="Timeline"
        lede="Seven stages, one path. The shoot is wrapped; editorial is in your hands." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <RStat label="Current phase" value={t.currentPhase} sub="Cut with the client" />
        <RStat label="Days remaining" value={t.daysRemaining + (ctx.daysDelta ? '+' + ctx.daysDelta : '')} sub="To final delivery" />
        <RStat label="Expected delivery" value={delivery} sub={ctx.daysDelta ? 'Shifted by committed changes' : 'On original date'} tone={ctx.daysDelta ? RFK.AMBER : RFK.INK} />
        <RStat label="Schedule confidence" value={t.confidence} sub="Holds if review lands by Jun 9" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Stages */}
        <RP label="Project stages" title="The path">
          <div style={{ position: 'relative', paddingLeft: 8 }}>
            {t.stages.map((st, i) => {
              const color = st.state === 'current' ? RFK.AMBER : (st.state === 'done' ? RFK.INK : RFK.INK_FAINT);
              return (
                <div key={st.id} style={{ position: 'relative', display: 'flex', gap: 18, paddingBottom: i === t.stages.length - 1 ? 0 : 22 }}>
                  {/* connector */}
                  {i < t.stages.length - 1 && <span style={{ position: 'absolute', left: 6, top: 16, bottom: 0, width: 1, background: RFK.BORDER }} />}
                  <span style={{ position: 'relative', zIndex: 1, width: 13, height: 13, marginTop: 3, borderRadius: 999, flexShrink: 0, background: st.state === 'upcoming' ? RFK.PAPER : color, border: st.state === 'upcoming' ? `1.5px solid ${RFK.BORDER_STRONG}` : 'none', boxShadow: st.state === 'current' ? '0 0 0 4px ' + RFK.AMBER_50 : 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flex: 1, gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: RFK.SANS, fontSize: 15, color: st.state === 'upcoming' ? RFK.INK_MUTED : RFK.INK }}>{st.name}</div>
                      <div style={{ fontFamily: RFK.MONO, fontSize: 10.5, letterSpacing: '0.06em', color: RFK.INK_FAINT, marginTop: 3 }}>{st.range}</div>
                    </div>
                    <span style={{ fontFamily: RFK.MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: st.state === 'current' ? RFK.AMBER : RFK.INK_FAINT }}>{st.state === 'done' ? 'Complete' : st.state === 'current' ? 'In progress' : 'Upcoming'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </RP>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RP label="Milestones" title={null} pad={22}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {t.milestones.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderTop: i ? `1px solid ${RFK.BORDER}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RDot state={m.state} />
                    <span style={{ fontFamily: RFK.SANS, fontSize: 14, color: m.state === 'upcoming' ? RFK.INK_MUTED : RFK.INK }}>{m.name}</span>
                  </div>
                  <span style={{ fontFamily: RFK.MONO, fontSize: 11, color: m.state === 'current' ? RFK.AMBER : RFK.INK_FAINT }}>{m.date}</span>
                </div>
              ))}
            </div>
          </RP>

          <RP label="Delivery forecast" title={null} pad={22}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
              <span style={{ fontFamily: RFK.SANS, fontWeight: 300, fontSize: 30, color: ctx.daysDelta ? RFK.AMBER : RFK.INK }}>{delivery}</span>
              <span style={{ fontFamily: RFK.SANS, fontSize: 13, color: RFK.INK_MUTED }}>expected</span>
            </div>
            {t.delays.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: `1px solid ${RFK.BORDER}` }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: RFK.AMBER, marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: RFK.SANS, fontSize: 13.5, color: RFK.INK }}>{d.label}</div>
                  <div style={{ fontFamily: RFK.SANS, fontSize: 12.5, color: RFK.INK_MUTED, marginTop: 2, lineHeight: 1.4 }}>{d.detail}</div>
                </div>
              </div>
            ))}
          </RP>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReviewsTab, TimelineTab });
