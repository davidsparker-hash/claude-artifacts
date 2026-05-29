const tenetTopBarStyles = {
  root: {
    height: 56, flexShrink: 0,
    borderBottom: "1px solid var(--border)",
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
    display: "flex", alignItems: "center", padding: "0 24px",
    gap: 18, position: "sticky", top: 0, zIndex: 5,
  },
  crumbs: { display: "flex", alignItems: "center", gap: 10, color: "var(--ink-muted)", fontSize: 13 },
  crumbsCurrent: { color: "var(--ink)", fontWeight: 400 },
  sep: { color: "var(--ink-faint)" },
  version: {
    marginLeft: 14,
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 10px", borderRadius: 2,
    border: "1px solid var(--border)",
    fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink)",
    cursor: "pointer",
  },
  spacer: { flex: 1 },
  search: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "7px 12px",
    border: "1px solid var(--border)", borderRadius: 2,
    color: "var(--ink-faint)", fontSize: 12, width: 220,
    background: "var(--paper)",
  },
  iconBtn: {
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--ink-muted)", cursor: "pointer", borderRadius: 2,
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 2,
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400,
    background: "var(--ink)", color: "#fff", cursor: "pointer",
    border: "none",
  },
  btnAmber: { background: "var(--anona-orange)" },
};

const TopBar = ({ section = "Shots" }) => {
  const S = tenetTopBarStyles;
  return (
    <header style={S.root}>
      <div style={S.crumbs}>
        <span>The Last Reel</span>
        <span style={S.sep}>/</span>
        <span style={S.crumbsCurrent}>{section}</span>
      </div>
      <div style={S.version}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--anona-orange)" }}/>
        v17 · WIP
        <Icon name="chevron" size={12} />
      </div>
      <div style={S.spacer} />
      <div style={S.search}>
        <Icon name="search" size={14} />
        <span>Search shots, takes, notes…</span>
      </div>
      <div style={S.iconBtn}><Icon name="bell" size={18} /></div>
      <div style={S.iconBtn}><Icon name="share" size={18} /></div>
      <button style={{ ...S.btn, ...S.btnAmber }}>
        <Icon name="lock" size={14} />
        Lock the cut
      </button>
    </header>
  );
};

window.TopBar = TopBar;
