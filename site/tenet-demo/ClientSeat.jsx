/* global React, TK, Glyph, useTween, Switch, Segmented, BreathingDot */
// The client seat — the analytics view. Production made legible:
// total cost and delivery date dominate; everything else is quiet display.
// The dials are the only things that say "touch me."

function useChangeFlash(key) {
  const [flash, setFlash] = React.useState(0);
  const prev = React.useRef(key);
  React.useEffect(() => {
    if (prev.current !== key) {
      prev.current = key; setFlash(1);
      const id = setTimeout(() => setFlash(0), 700);
      return () => clearTimeout(id);
    }
  }, [key]);
  return flash;
}

function HeroFigure({ label, children, flashKey, accentWhenFlash }) {
  const flash = useChangeFlash(flashKey);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: TK.INK_FAINT, marginBottom: 14 }}>{label}</div>
      <div style={{
        fontFamily: TK.SANS, fontWeight: 300, fontSize: 76, lineHeight: 0.95,
        letterSpacing: '-0.02em',
        color: flash && accentWhenFlash ? TK.AMBER : TK.INK,
        transition: 'color .7s ease-out',
      }}>{children}</div>
    </div>
  );
}

function SecondaryStat({ label, value, flashKey }) {
  const flash = useChangeFlash(flashKey);
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: TK.SANS, fontWeight: 300, fontSize: 34, lineHeight: 1,
        color: flash ? TK.AMBER : TK.INK, transition: 'color .7s ease-out',
      }}>{value}</div>
      <div style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: TK.INK_FAINT, marginTop: 8 }}>{label}</div>
    </div>
  );
}

function DialRow({ children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16,
      padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${TK.BORDER}` }}>
      {children}
    </div>
  );
}

function ClientSeat({ state, derived, onToggleScene, onHero, onTokyo }) {
  const cost = useTween(derived.cost, 700);
  const runtime = useTween(derived.runtime, 700);
  const shots = useTween(derived.shots, 700);
  const dp = window.TENET.fmtDateParts(derived.delivery);

  const cuttable = window.TENET.SCENES.filter(s => s.cuttable);

  return (
    <div style={{ height: '100%', boxSizing: 'border-box', padding: '64px 70px 56px',
      display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: TK.AMBER }}>Client</span>
        <span style={{ width: 26, height: 1, background: TK.BORDER_STRONG }}/>
        <span style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: TK.INK_FAINT }}>Analytics</span>
      </div>
      <div style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontWeight: 400,
        fontSize: 38, lineHeight: 1.05, color: TK.INK, marginTop: 6 }}>Meridian — A Day Held</div>
      <div style={{ fontFamily: TK.SANS, fontSize: 14, color: TK.INK_MUTED, marginTop: 8 }}>
        Brand film · Meridian Watches · the room you steer, not the one you wait on
      </div>

      {/* Dominant figures */}
      <div style={{ display: 'flex', gap: 40, marginTop: 44 }}>
        <HeroFigure label="Total cost" flashKey={derived.cost} accentWhenFlash>
          {window.TENET.fmtMoney(cost)}
        </HeroFigure>
        <HeroFigure label="Delivery" flashKey={derived.days} accentWhenFlash>
          {dp.mon} {dp.day}
          <span style={{ fontSize: 26, color: TK.INK_FAINT, marginLeft: 12 }}>{dp.year}</span>
        </HeroFigure>
      </div>

      {/* Secondary stats */}
      <div style={{ display: 'flex', gap: 24, marginTop: 46,
        paddingTop: 26, borderTop: `1px solid ${TK.BORDER}` }}>
        <SecondaryStat label="Runtime" value={window.TENET.fmtRuntime(Math.round(runtime))} flashKey={derived.runtime} />
        <SecondaryStat label="Shots" value={Math.round(shots)} flashKey={derived.shots} />
        <SecondaryStat label="Locations" value={derived.locations.length} flashKey={derived.locations.length} />
        <SecondaryStat label="Principal cast" value={derived.principals.length} flashKey={derived.principals.length} />
      </div>

      {/* The dials — the only loud elements */}
      <div style={{ marginTop: 'auto', paddingTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <BreathingDot />
          <span style={{ fontFamily: TK.MONO, fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: TK.AMBER, whiteSpace: 'nowrap' }}>Adjust the cut</span>
          <span style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 13,
            color: TK.INK_FAINT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>— one change a client makes on a call</span>
        </div>

        <div style={{ display: 'flex', gap: 48, marginTop: 14 }}>
          {/* Scenes in the cut */}
          <div style={{ flex: 1.2 }}>
            <div style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: TK.INK_FAINT, marginBottom: 4 }}>Scenes in the cut</div>
            {cuttable.map((s, i) => {
              const cut = !!state.cuts[s.id];
              return (
                <DialRow key={s.id} last={i === cuttable.length - 1}>
                  <span style={{ fontFamily: TK.MONO, fontSize: 11, color: TK.INK_FAINT, width: 30 }}>SC{s.n}</span>
                  <span style={{ flex: 1, fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 17,
                    color: cut ? TK.INK_FAINT : TK.INK,
                    textDecorationLine: cut ? 'line-through' : 'none',
                    textDecorationColor: TK.AMBER,
                    transition: 'color .3s ease-out' }}>{s.name}</span>
                  <Switch on={!cut} onClick={() => onToggleScene(s.id)} />
                </DialRow>
              );
            })}
          </div>

          {/* Hero length + second location */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div>
              <div style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: TK.INK_FAINT, marginBottom: 12 }}>Hero macro length</div>
              <Segmented
                options={[{value:15,label:'15s'},{value:10,label:'10s'},{value:6,label:'6s'}]}
                value={state.heroLen} onChange={onHero} />
              <div style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 13,
                color: TK.INK_FAINT, marginTop: 12, maxWidth: 280 }}>
                The product shot. Shorten it and the comp work changes downstream.
              </div>
            </div>

            <div>
              <div style={{ fontFamily: TK.MONO, fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: TK.INK_FAINT, marginBottom: 12 }}>Second location</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Switch on={state.addTokyo} onClick={onTokyo} />
                <span style={{ fontFamily: TK.SERIF, fontStyle: 'italic', fontSize: 17,
                  color: state.addTokyo ? TK.INK : TK.INK_FAINT, transition: 'color .3s ease-out' }}>
                  Add Tokyo street
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ClientSeat = ClientSeat;
