const tenetShotDetailStyles = {
  root: {
    width: 380, flexShrink: 0,
    borderLeft: "1px solid var(--border)",
    background: "var(--paper)",
    display: "flex", flexDirection: "column",
    height: "100%",
    overflow: "auto",
  },
  head: { padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" },
  amberRule: { width: 32, height: 1, background: "var(--anona-orange)", marginBottom: 10 },
  kicker: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--anona-orange)", fontWeight: 400, fontFamily: "var(--font-mono)" },
  title: { fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 22, lineHeight: 1.2, color: "var(--ink)", marginTop: 6 },
  sub: { fontSize: 12, color: "var(--ink-muted)", marginTop: 4 },

  player: {
    aspectRatio: "16 / 9", background: "var(--ink)",
    margin: "16px 24px 0", position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff",
  },
  playerTimecode: { position: "absolute", bottom: 10, left: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "#fff", opacity: 0.7 },
  playerScene: { position: "absolute", top: 10, left: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "#fff", opacity: 0.7, letterSpacing: "0.1em" },
  playBtn: { width: 56, height: 56, borderRadius: 999, border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" },

  section: { padding: "20px 24px", borderBottom: "1px solid var(--border)" },
  sectionLabel: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 400, marginBottom: 12 },
  metaRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" },
  metaItem: {},
  metaLabel: { fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 },
  metaValue: { fontSize: 13, color: "var(--ink)" },

  comment: { padding: "14px 0", borderBottom: "1px solid var(--border)" },
  commentHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  avatar: (color) => ({ width: 22, height: 22, borderRadius: 999, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 400 }),
  commentName: { fontSize: 12, color: "var(--ink)", fontWeight: 400 },
  commentTime: { fontSize: 10, color: "var(--ink-faint)", fontFamily: "var(--font-mono)", marginLeft: "auto" },
  commentBody: { fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.55 },
  commentTC: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--anona-orange)", marginRight: 6 },

  version: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0" },
  versionDot: (active) => ({ width: 8, height: 8, borderRadius: 999, background: active ? "var(--anona-orange)" : "var(--ink-faint)", flexShrink: 0 }),
  versionMeta: { fontSize: 11, color: "var(--ink-muted)", fontFamily: "var(--font-mono)" },
  versionLabel: { fontSize: 12, color: "var(--ink)" },

  actions: { padding: 24, display: "flex", gap: 10, borderTop: "1px solid var(--border)", marginTop: "auto" },
  btn: { flex: 1, padding: "10px 12px", borderRadius: 2, fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 12, border: "1px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer" },
  btnAmber: { background: "var(--anona-orange)", color: "#fff", border: "none" },
};

const ShotDetail = ({ shot }) => {
  const S = tenetShotDetailStyles;
  if (!shot) {
    return (
      <aside style={S.root}>
        <div style={{ padding: 40, color: "var(--ink-faint)", fontSize: 13 }}>
          Select a shot.
        </div>
      </aside>
    );
  }
  const comments = [
    { who: "A. Vega",    role: "DP",       color: "#1A1A1A",         tc: "00:00:18:04", body: "Focus drift on B-cam from 18 onward. Worth a re-take if we have the time.", time: "2h" },
    { who: "L. Mendez",  role: "Editor",   color: "#854F0B",         tc: "00:00:31:11", body: "Beautiful match cut to the diner. Holding this in for now.",                  time: "1d" },
    { who: "D. Parker",  role: "Director", color: "var(--anona-orange)", tc: null,      body: "Send to color when picture's locked.",                                       time: "1d" },
  ];
  const versions = [
    { label: "v17 · WIP",       meta: "today · 14:22", active: true },
    { label: "v16 · review",    meta: "yesterday",     active: false },
    { label: "v15 · color v1",  meta: "Aug 14",         active: false },
    { label: "v14 · picture",   meta: "Aug 11",         active: false },
  ];
  return (
    <aside style={S.root}>
      <div style={S.head}>
        <div style={S.amberRule} />
        <div style={S.kicker}>{shot.id} · SC {shot.scene} · T{shot.take}</div>
        <div style={S.title}>{shot.title}</div>
        <div style={S.sub}>{shot.sub}</div>
        <div style={{ marginTop: 12 }}><StatusChip state={shot.status} /></div>
      </div>

      <div style={S.player}>
        <div style={S.playerScene}>SC {shot.scene} · T{shot.take}</div>
        <div style={S.playBtn}><Icon name="play" size={20} /></div>
        <div style={S.playerTimecode}>00:00:00:00 / {shot.duration}</div>
      </div>

      <div style={S.section}>
        <div style={S.sectionLabel}>Specs</div>
        <div style={S.metaRow}>
          <div><div style={S.metaLabel}>Duration</div><div style={S.metaValue}>{shot.duration}</div></div>
          <div><div style={S.metaLabel}>Owner</div><div style={S.metaValue}>{shot.owner}</div></div>
          <div><div style={S.metaLabel}>Day</div><div style={S.metaValue}>Day 12</div></div>
          <div><div style={S.metaLabel}>Format</div><div style={S.metaValue}>ARRI · 4.6K</div></div>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionLabel}>Notes</div>
        {comments.map((c, i) => (
          <div key={i} style={{ ...S.comment, borderBottom: i === comments.length-1 ? "none" : "1px solid var(--border)" }}>
            <div style={S.commentHead}>
              <div style={S.avatar(c.color)}>{c.who.split(" ").map(s => s[0]).join("")}</div>
              <span style={S.commentName}>{c.who}</span>
              <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>· {c.role}</span>
              <span style={S.commentTime}>{c.time}</span>
            </div>
            <div style={S.commentBody}>
              {c.tc && <span style={S.commentTC}>{c.tc}</span>}
              {c.body}
            </div>
          </div>
        ))}
      </div>

      <div style={S.section}>
        <div style={S.sectionLabel}>Versions</div>
        {versions.map((v, i) => (
          <div key={i} style={S.version}>
            <div style={S.versionDot(v.active)} />
            <div>
              <div style={{ ...S.versionLabel, fontWeight: v.active ? 500 : 400 }}>{v.label}</div>
              <div style={S.versionMeta}>{v.meta}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.actions}>
        <button style={S.btn}>
          Add note
        </button>
        <button style={{ ...S.btn, ...S.btnAmber }}>
          Send to color
        </button>
      </div>
    </aside>
  );
};

window.ShotDetail = ShotDetail;
