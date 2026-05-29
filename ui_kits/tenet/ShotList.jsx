const tenetShotListStyles = {
  root: { flex: 1, minWidth: 0, padding: "32px 32px 48px", overflow: "auto" },
  head: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 },
  amberRule: { width: 48, height: 1, background: "var(--anona-orange)", marginBottom: 12 },
  kicker: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--anona-orange)", fontWeight: 400 },
  title: { fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--ink)", marginTop: 6 },
  sub: { fontSize: 13, color: "var(--ink-muted)", marginTop: 8, maxWidth: 520 },
  controls: { display: "flex", gap: 8, alignItems: "center" },
  filterBtn: { padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 2, fontSize: 12, color: "var(--ink-muted)", cursor: "pointer", background: "var(--paper)" },
  filterBtnActive: { color: "var(--ink)", borderColor: "var(--ink)" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 400, borderBottom: "1px solid var(--ink)" },
  thNum: { width: 70 },
  thStatus: { width: 130 },
  thDept: { width: 200 },
  thOwner: { width: 140 },

  row: (active) => ({
    cursor: "pointer",
    background: active ? "var(--paper-soft)" : "transparent",
    boxShadow: active ? "inset 2px 0 0 var(--anona-orange)" : "none",
    transition: "background .15s ease-out",
  }),
  td: { padding: "14px 12px", fontSize: 13, color: "var(--ink)", borderBottom: "1px solid var(--border)", verticalAlign: "middle" },
  tdMono: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)" },
  shotTitle: { fontWeight: 400, color: "var(--ink)" },
  shotSub: { fontSize: 11, color: "var(--ink-faint)", marginTop: 2 },
  deptDots: { display: "flex", gap: 4 },
  dept: (state) => ({
    fontSize: 10, fontFamily: "var(--font-mono)",
    padding: "2px 6px", borderRadius: 2,
    background: state === "lock" ? "var(--ink)" : state === "review" ? "var(--amber-50)" : "transparent",
    color: state === "lock" ? "#fff" : state === "review" ? "var(--amber-800)" : "var(--ink-faint)",
    border: state === "open" ? "1px solid var(--border)" : "none",
  }),
};

const shots = [
  { id: "001A", scene: 4, take: 3, title: "Rooftop chase, golden hour", sub: "EXT · Day · A-cam + B-cam", status: "review",    duration: "00:48", owner: "A. Vega",      depts: { pic: "review", snd: "lock", vfx: "open", post: "open" } },
  { id: "002B", scene: 7, take: 1, title: "Diner interior, dialogue",   sub: "INT · Night · single-camera",  status: "locked",    duration: "02:14", owner: "D. Parker",    depts: { pic: "lock",   snd: "lock", vfx: "lock", post: "review" } },
  { id: "003A", scene: 9, take: 5, title: "Highway driving plate",       sub: "EXT · Day · plate",            status: "delivered", duration: "01:22", owner: "M. Cho",       depts: { pic: "lock",   snd: "lock", vfx: "lock", post: "lock" } },
  { id: "004C", scene: 12, take: 2, title: "Hospital corridor, walk-and-talk", sub: "INT · Night · Steadicam", status: "review",   duration: "01:36", owner: "R. Halberg",   depts: { pic: "review", snd: "review", vfx: "open", post: "open" } },
  { id: "005A", scene: 14, take: 7, title: "Phone call, motel exterior", sub: "EXT · Night · long lens",      status: "pending",   duration: "00:54", owner: "S. Idrissi",   depts: { pic: "open",   snd: "open", vfx: "open", post: "open" } },
  { id: "006B", scene: 18, take: 1, title: "Beach climax, master",       sub: "EXT · Sunset · drone + ground", status: "review",  duration: "03:08", owner: "A. Vega",      depts: { pic: "review", snd: "open", vfx: "review", post: "open" } },
  { id: "007A", scene: 21, take: 4, title: "Reveal — wide single",        sub: "EXT · Day · 100mm",            status: "locked",    duration: "01:02", owner: "D. Parker",    depts: { pic: "lock",   snd: "lock", vfx: "open", post: "open" } },
];

const ShotList = ({ activeId, onSelect }) => {
  const S = tenetShotListStyles;
  const [filter, setFilter] = React.useState("all");
  const filtered = shots.filter(s => filter === "all" ? true : s.status === filter);
  return (
    <main style={S.root}>
      <div style={S.head}>
        <div>
          <div style={S.amberRule} />
          <span style={S.kicker}>Production · Shots</span>
          <div style={S.title}>The work, listed.</div>
          <div style={S.sub}>{shots.length} shots across 9 scenes. {shots.filter(s=>s.status==="locked"||s.status==="delivered").length} locked, the rest in flight.</div>
        </div>
        <div style={S.controls}>
          {["all","review","locked","delivered","pending"].map(f => (
            <button key={f} style={{ ...S.filterBtn, ...(filter===f?S.filterBtnActive:{}) }} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f[0].toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <table style={S.table}>
        <thead>
          <tr>
            <th style={{...S.th, ...S.thNum}}>Shot</th>
            <th style={S.th}>Description</th>
            <th style={{...S.th, ...S.thStatus}}>Status</th>
            <th style={{...S.th, ...S.thDept}}>Departments</th>
            <th style={{...S.th, ...S.thOwner}}>Owner</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id} style={S.row(s.id === activeId)} onClick={() => onSelect(s.id)}>
              <td style={{...S.td, ...S.tdMono}}>{s.id}<div style={{ marginTop: 2 }}>{s.duration}</div></td>
              <td style={S.td}>
                <div style={S.shotTitle}>{s.title}</div>
                <div style={S.shotSub}>Sc {s.scene} · T{s.take} · {s.sub}</div>
              </td>
              <td style={S.td}><StatusChip state={s.status} /></td>
              <td style={S.td}>
                <div style={S.deptDots}>
                  <span style={S.dept(s.depts.pic)}>PIC</span>
                  <span style={S.dept(s.depts.snd)}>SND</span>
                  <span style={S.dept(s.depts.vfx)}>VFX</span>
                  <span style={S.dept(s.depts.post)}>POST</span>
                </div>
              </td>
              <td style={S.td}>{s.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

window.ShotList = ShotList;
window.__tenetShots = shots;
