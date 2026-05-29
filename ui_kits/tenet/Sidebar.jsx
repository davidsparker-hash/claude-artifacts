const tenetSidebarStyles = {
  root: {
    width: 240,
    flexShrink: 0,
    background: "var(--paper-soft)",
    borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column",
    height: "100vh",
    position: "sticky", top: 0,
    fontFamily: "var(--font-sans)",
  },
  brand: {
    padding: "20px 22px 18px",
    borderBottom: "1px solid var(--border)",
    display: "flex", alignItems: "center", gap: 10,
  },
  wordmark: {
    fontFamily: "var(--font-display)", fontWeight: 300,
    fontSize: 20, color: "var(--anona-orange)",
    letterSpacing: "0.06em",
  },
  project: {
    padding: "16px 22px",
    borderBottom: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    cursor: "pointer",
  },
  projectMeta: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 400 },
  projectName: { fontSize: 14, color: "var(--ink)", fontWeight: 400, marginTop: 2 },
  navSection: { padding: "14px 12px 6px" },
  navLabel: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)", fontWeight: 400, padding: "0 10px 8px" },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 12,
    padding: "8px 10px", borderRadius: 2,
    cursor: "pointer",
    color: active ? "var(--ink)" : "var(--ink-muted)",
    background: active ? "var(--paper)" : "transparent",
    boxShadow: active ? "inset 2px 0 0 var(--anona-orange)" : "none",
    fontSize: 13, fontWeight: active ? 500 : 400,
    transition: "color .15s ease-out, background .15s ease-out",
  }),
  navCount: { marginLeft: "auto", fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" },
  footer: { marginTop: "auto", padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 999, background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 400 },
  userName: { fontSize: 12, color: "var(--ink)", fontWeight: 400 },
  userRole: { fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.04em" },
};

const Sidebar = ({ active = "shots", onChange = () => {} }) => {
  const S = tenetSidebarStyles;
  const items = [
    { id: "script",  label: "Script",  icon: "script",  count: "2 drafts" },
    { id: "shots",   label: "Shots",   icon: "shots",   count: 124 },
    { id: "dailies", label: "Dailies", icon: "dailies", count: 18 },
    { id: "cuts",    label: "Cuts",    icon: "cuts",    count: "v17" },
    { id: "color",   label: "Color",   icon: "color",   count: null },
    { id: "sound",   label: "Sound",   icon: "sound",   count: null },
  ];
  const depts = [
    { id: "picture", label: "Picture" },
    { id: "sound2",  label: "Sound" },
    { id: "vfx",     label: "VFX" },
    { id: "post",    label: "Post" },
  ];
  return (
    <aside style={S.root}>
      <div style={S.brand}>
        <span style={S.wordmark}>TENET</span>
      </div>
      <div style={S.project}>
        <div>
          <div style={S.projectMeta}>Project</div>
          <div style={S.projectName}>The Last Reel</div>
        </div>
        <Icon name="chevron" size={14} style={{ color: "var(--ink-muted)" }} />
      </div>

      <div style={S.navSection}>
        <div style={S.navLabel}>Production</div>
        {items.map(it => (
          <div key={it.id} style={S.navItem(active === it.id)} onClick={() => onChange(it.id)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
            {it.count != null && <span style={S.navCount}>{it.count}</span>}
          </div>
        ))}
      </div>

      <div style={S.navSection}>
        <div style={S.navLabel}>Departments</div>
        {depts.map(d => (
          <div key={d.id} style={S.navItem(false)}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--ink-faint)", marginLeft: 5, marginRight: 1 }} />
            <span>{d.label}</span>
          </div>
        ))}
      </div>

      <div style={S.footer}>
        <div style={S.avatar}>DP</div>
        <div>
          <div style={S.userName}>David Parker</div>
          <div style={S.userRole}>Director · Founder</div>
        </div>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
