// Lucide-style stroke icons. 1.75 stroke, currentColor.
// Keep additions to this file — never use emoji, never use Unicode glyphs.
const Icon = ({ name, size = 18, strokeWidth = 1.75, style }) => {
  const base = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", style };
  const P = {
    script: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></>),
    shots: (<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 7h4M17 7h4M3 17h4M17 17h4M3 12h18"/></>),
    dailies: (<><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4V8Z"/></>),
    cuts: (<><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></>),
    color: (<><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="10" cy="20" r="2.5"/><path d="M12 2a10 10 0 1 0 0 20"/></>),
    sound: (<><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></>),
    crew: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
    search: (<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>),
    share: (<><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></>),
    plus: (<><path d="M12 5v14M5 12h14"/></>),
    chevron: (<><polyline points="6 9 12 15 18 9"/></>),
    chevronRight: (<><polyline points="9 6 15 12 9 18"/></>),
    lock: (<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
    comment: (<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>),
    download: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>),
    play: (<><polygon points="6 3 20 12 6 21 6 3"/></>),
    more: (<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>),
    bell: (<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>),
    folder: (<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>),
    timecode: (<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),
  };
  return <svg {...base}>{P[name] || null}</svg>;
};

window.Icon = Icon;
