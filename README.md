# Anona Design System

A design system for **Anona**, a creative software company building tools for the people who tell stories at the highest level — writers, directors, producers, editors, department heads, and the craftspeople whose judgment makes work memorable.

This system covers the parent brand **Anona**, its first product **Tenet** (a production pipeline from script to final cut), and its sister studio **JANE**. The three share one visual language; only the accent placement and a faint mark differ.

---

## Brands at a glance

| Mark | What it is | Used for |
|---|---|---|
| **ANONA** | The parent company. Editorial, restrained, in **Ink** black. | Corporate communications, decks, hiring, investor material. |
| **TENET** | Anona's flagship product. The wordmark is set in **Anona Orange**. | Product UI, marketing site, in-app surfaces. |
| **JANE** | Sister studio. Same thin wordmark + a faceted line-art mark above it. | Studio-side comms, production work, on-set materials. |

Founded by David Parker, a twenty-six-year veteran of advertising and post-production. Headquartered with sister studio JANE in Los Angeles.

---

## Sources provided

This design system was built from the following uploaded assets only — there was no codebase or Figma library attached.

- `uploads/ANONA LOGO.jpg` → `assets/logos/anona-logo.jpg`
- `uploads/TENET LOGO.jpg` → `assets/logos/tenet-logo.jpg`
- `uploads/JANE LOGO.jpg` → `assets/logos/jane-logo.jpg`
- `uploads/JANE LOGO ONLY.jpg` → `assets/logos/jane-mark.jpg`

A written color palette + neutral spec (in the request) is encoded verbatim in `colors_and_type.css`.

> **Caveats**
> - No production codebase, Figma file, or product screenshots were attached. The Tenet UI kit in `ui_kits/tenet/` is therefore an **interpretive recreation** consistent with the brand language, not a 1:1 of the real product. Replace with real components when access is available.
> - The brand typeface is **Brown** (Lineto), now loaded locally from `fonts/`. Six weights/styles in use: Light, Regular, Bold (each with italic). Earlier drafts of this system used a Jost substitute — Brown is now the real face.

---

## CONTENT FUNDAMENTALS

The Anona voice mirrors its visual language: restrained, confident, plain-spoken, written for people who already understand the craft. We are talking to professionals — not selling them on the existence of their problem.

### Tone

- **Plain and direct.** Short sentences. No hedging. No hype words ("revolutionary," "unleash," "supercharge"). If a thing is good, describe what it does and let the reader conclude.
- **Quietly confident.** We trust the reader's expertise. We don't over-explain.
- **Respect for the craft.** Stories matter. Editors matter. The colorist's opinion is the point. Write like you've been in the room.
- **Editorial, not marketing.** Closer to a director's statement than a SaaS landing page.

### Voice rules

- **We** (the company) and **you** (the reader). Never "I."
- "We built Tenet for…" not "Tenet was built for…"
- Title Case for product names, section headers, and slide titles. **Sentence case** for body copy and UI labels.
- No exclamation points outside of error states. Even there, prefer a period.
- **No emoji.** Anywhere. Not in product copy, not in marketing, not in internal tools.
- **No icon-emoji substitutions** in body copy either ("✨ new") — use a proper kicker eyebrow instead.
- Numerals are written as figures (3, not three) anywhere production-adjacent: shot 47, take 3, day 12. Spell out "one" only in literary passages.
- Oxford commas. Em-dashes are welcome.

### Words we use

> *script. cut. take. lock. handoff. dailies. department. craft. judgment. memory. shape. weight. ear. eye. room.*

### Words we don't

> ~~AI-powered. seamless. revolutionary. unleash. delight. magic. journey. solution. game-changing. democratize. supercharge.~~

### Examples

**Kicker → headline → body** (the canonical Anona stack):

> **PRODUCTION**
> A pipeline shaped like the work.
> Tenet is the production pipeline real teams use to get from script to final cut — built around how creative work actually happens, not how individual AI tools assume one user works alone.

**Pull quote** (left amber bar, serif italic):

> "The colorist's opinion is the point. The tool just needs to get out of the way."
> — *David Parker, Founder*

**Product copy** (sparse, direct):

> Lock the cut. Tenet versions every change downstream and pings the right department head. No "are we on v17 or v18" Slack threads.

**Error state** (factual, no apology theater):

> Render failed at frame 04:21:13. Output bucket rejected the write. Retry, or open the bucket in Settings.

---

## VISUAL FOUNDATIONS

Anona's visual language is **editorial, geometric, and restrained**. Two colors carry it: a single warm amber and an honest black. Nothing else. The system reads like a film book or a director's monograph — generous white space, hairline rules, thin geometric letterforms.

### Palette

- Two colors and three neutrals. **Nothing else.**
- Primary: **Anona Orange `#BA7517`** — used for the company name, kickers, accent rules, key headline color shifts, pull-quote left bars. **Never used for body text. Never used as a background fill larger than a small badge.**
- Neutrals: **Ink `#1A1A1A` / Ink Muted `#6B6B6B` / Ink Faint `#9A9A9A` / Paper `#FFFFFF` / Paper Soft `#FAF8F4`**.
- Hairline border: **`rgba(0,0,0,0.10)`** — this is how cards and rules are separated, *not* shadows.
- Tints for charts and supporting graphics only: **Amber 50 `#FAEEDA` / Amber 200 `#EF9F27` / Amber 800 `#854F0B`**.

### Type

- **One family does almost everything.** **Brown** (Lineto). Light (300) for display sizes, Regular (400) for body, kickers, and UI labels. Bold (700) only where genuinely needed (it almost never is — color and tracking carry hierarchy). Brown ships these three weights only; **never use Medium (500)** — the browser will fake it.
- **Pull quotes use Source Serif 4** italic light — the only place we leave the sans.
- **Generous tracking on kickers** (0.18em+, uppercase). Tight, slightly negative tracking on large display sizes.
- **Numbers are figure-style** by default — they live alongside text in tables, slide counts, timecode.
- **No bold-italic.** No underline outside links. Emphasis is achieved by *changing color to amber* or *moving to a kicker*, not by weight.

### Spacing & layout

- **4 pt grid** — `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
- **Asymmetric, left-anchored compositions.** Content sits left; the right column breathes.
- **Wide outer gutters.** A standard slide reserves ~10% on each side. A page reserves a similar margin.
- A signature device: **the 48 px amber rule** — a 1 px × 48 px amber line above a section header. Used very sparingly; never near another amber element.
- **Big top/bottom space, tight horizontal density.** Sections are separated by `--s-9` (96 px) of vertical air, not by background-color blocks.

### Backgrounds

- **Paper white (`#FFFFFF`)** is the default. Paper Soft (`#FAF8F4`) is the only "alternate" — used for card fills and context lists.
- **No gradients.** None. Not on hero sections, not on buttons, not on charts.
- **No textures, no patterns, no grain overlays.** Imagery brings its own texture.
- **No dark mode** (yet). The system is born from print thinking; a dark theme is a separate exercise.

### Imagery

- **Warm, filmic, naturally lit.** Behind-the-scenes stills, hands on equipment, faces of crew. Not staged stock photography.
- **Black & white is welcome** alongside color; both feel native.
- **Full-bleed images** are common on slide title cards and on the hero of the marketing site. They are not cropped into shapes — they're respected as photographs.
- **No frames, no rounded corners on photography.** Sharp 0 px rectangles only.
- A faint grain may be present on real photography but is **never added in CSS**.

### Animation

- **Almost none.** When something moves, it's a fade or a slow opacity nudge. ~200 ms, **ease-out**.
- **No spring physics, no bounce, no overshoot.** Tenet is a calm tool used by people on deadline.
- **Hover states**: 8% darken on neutrals; on amber, shift one step to `--amber-800`. No scale, no glow.
- **Press states**: a 2 px translate-down + 1 step darker. No shrink. No haptic-imitation flash.
- Loading states are a thin amber indeterminate bar across the top of the surface — never a spinner.

### Borders & shadows

- **Hairlines first.** Almost every division is a 1 px line at `rgba(0,0,0,0.10)`. This is the connective tissue of the system.
- **Shadows are reserved** for floating UI only (menus, popovers, the active "pop" of a hovered file card). Soft, large, low opacity: `0 12px 32px rgba(0,0,0,0.08)`.
- **No inner shadows.** No emboss. No drop-shadow on type.
- Cards are flat: paper-soft fill + hairline border + 4 px radius. No drop shadow on a resting card.

### Corner radii

- **Square by default.** `--r-0: 0` for full-bleed surfaces and photography.
- **2 px** for buttons, badges, chips.
- **4 px** for cards and panels.
- **8 px** is the maximum, used only on modal sheets.
- **Pills (`999px`)** appear in exactly one place: status chips in Tenet (Ready / In Review / Locked).

### Transparency & blur

- **Used sparingly.** A backdrop-blur is permissible on top navigation that floats over imagery — `backdrop-filter: blur(20px)` over `rgba(255,255,255,0.7)`. Nowhere else.
- **No frosted-glass cards.** No translucent buttons.

### Layout rules

- **Top nav is fixed**, full-width, hairline-bottomed, 64 px tall on the marketing site; 48 px in the product.
- **One H1 per surface.** Anything that wants to be an H1 and isn't, becomes a kicker + display pair.
- **Captions, slide numbers, and metadata sit at `--fg-3`** (Ink Faint) and are always small. They never compete.
- **Tables are unruled** — only horizontal hairlines between rows. No vertical lines.

### Charts

- Two-color charts only: **Anona Orange + Ink**. Tints (Amber 50/200/800) fill in only when a third or fourth segment is unavoidable.
- **No 3D, no gradients, no shadow under bars.** Flat fills, hairline axes.

---

## ICONOGRAPHY

No icon set was provided in the upload. The system uses **Lucide** (`https://lucide.dev`) as a substitute: thin, geometric, 1.5–2 px stroke icons that match the wordmark's letterform weight. **Flag for the user**: please confirm Lucide is acceptable, or supply the real icon set.

### Rules

- **Stroke icons only.** No filled icons, no two-tone, no duotone.
- **Stroke width 1.75 px** at 24 px size. Scale proportionally — `currentColor` so they inherit text color.
- **24 px is the base size.** 16 px for inline; 20 px in toolbars; 32 px in feature lists.
- **Color is `--fg-2`** (Ink Muted) by default. Active or selected icons go to `--fg-1` (Ink). Amber icons are rare — reserved for status (e.g. "in review" chip).
- **No emoji.** Anywhere. No Unicode symbol-as-icon substitutes.
- **No icon backgrounds.** No circular badges behind icons. No colored chip wrappers.
- Inline icons sit **0.5em above the baseline** when paired with text, with `--s-2` (8 px) spacing.

### Logos

- **ANONA wordmark** in Ink black; never in amber.
- **TENET wordmark** in Anona Orange; never in black.
- **JANE wordmark + faceted mark** — both in Ink; the mark sits above, never beside.
- Minimum size: 64 px wide for ANONA / TENET / JANE wordmarks. Clear space: 1 cap-height on every side.

### Loading & status

- Indeterminate progress: **a 2 px amber bar** at the top of the surface, animating left-to-right.
- Status dots: 6 px circle, solid fill (`--fg-accent` for in-progress, `--ink` for done, `--fg-3` for pending).

---

## Index

| File / folder | What's in it |
|---|---|
| `README.md` | This document. |
| `SKILL.md` | Skill manifest so this whole folder works as a Claude / Claude Code skill. |
| `colors_and_type.css` | All raw + semantic CSS variables. Drop into any page. |
| `assets/logos/` | The four supplied wordmarks (ANONA, TENET, JANE wordmark, JANE mark). |
| `preview/` | The Design System cards (one per concept). |
| `ui_kits/tenet/` | An interpretive UI kit for Tenet — `index.html` + JSX components. |

### Open questions for the user

1. ~~Is **Jost** an acceptable stand-in for the real wordmark face?~~ **Resolved** — Brown is loaded locally.
2. Is **Lucide** an acceptable icon set, or do you have one in-house?
3. Is there a real codebase or Figma file for **Tenet** we should be working from? The current `ui_kits/tenet/` is interpretive.
4. Any photography we should be using? The system describes a warm filmic look but has no images to anchor it.
