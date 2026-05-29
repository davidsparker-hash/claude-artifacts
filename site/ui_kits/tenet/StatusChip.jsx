// Status chip — the only pill in the Tenet system.
// 4 workflow states: pending → in-review → locked → delivered.
const StatusChip = ({ state = "pending", size = "md" }) => {
  const map = {
    pending:   { label: "Pending",   bg: "transparent",        border: "1px solid var(--border)", color: "var(--ink)",       dot: "var(--ink-faint)" },
    review:    { label: "In Review", bg: "var(--amber-50)",    border: "none",                    color: "var(--amber-800)", dot: "var(--anona-orange)" },
    locked:    { label: "Locked",    bg: "var(--ink)",         border: "none",                    color: "#fff",             dot: "#fff" },
    delivered: { label: "Delivered", bg: "transparent",        border: "1px solid var(--border)", color: "var(--ink-muted)", dot: "var(--ink)" },
  };
  const s = map[state] || map.pending;
  const pad = size === "sm" ? "3px 8px" : "4px 10px";
  const fs  = size === "sm" ? 10 : 11;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, borderRadius: 999, fontSize: fs, fontWeight: 400,
      letterSpacing: "0.02em", background: s.bg, border: s.border, color: s.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
      {s.label}
    </span>
  );
};

window.StatusChip = StatusChip;
