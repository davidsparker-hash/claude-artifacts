# Tenet UI Kit

An **interpretive** UI kit for Tenet, Anona's production pipeline product. Built from brand guidelines only — no production codebase or Figma was provided. Treat this as a directionally-correct visual scaffold; replace with real components when access lands.

## What's in here

- `index.html` — a click-through showing the full app shell: sidebar, top bar, scene list, and a shot detail panel. Clicking a shot opens its detail; clicking another shot replaces it.
- `Sidebar.jsx` — the left nav: project picker, primary sections (Script, Shots, Dailies, Cuts, Color, Sound), department list.
- `TopBar.jsx` — fixed app header with project / version / search / share.
- `ShotList.jsx` — the dense, hairline-ruled table of scenes & takes.
- `ShotDetail.jsx` — right-side detail panel with player frame, status, notes, version history.
- `StatusChip.jsx` — the only pill in the system, in 4 workflow states.
- `Icon.jsx` — Lucide-style stroke icons inline as SVG.

## What's intentionally faked

- The video frame is a placeholder block (no real media).
- Comments and version history are static stub data.
- "Lock the cut" and similar actions do nothing — they're visual.

## What to swap in when the real product lands

1. The Tenet color tokens already match. No changes there.
2. Replace placeholders in `ShotDetail.jsx` with the real player & comment widgets.
3. Sidebar icons should be replaced with the real product's icon set if it differs from Lucide.
