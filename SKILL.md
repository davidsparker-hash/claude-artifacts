---
name: anona-design
description: Use this skill to generate well-branded interfaces and assets for Anona (and its product Tenet, sister studio JANE), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens:** `colors_and_type.css` — every color, type, spacing, radius, and shadow CSS variable.
- **Brand face:** Brown (Lineto), in `fonts/`. Light · Regular · Bold + italics. Brown ships 300/400/700 only — never request weight 500.
- **Logos:** `assets/logos/` — ANONA (ink), TENET (amber), JANE (ink + faceted mark).
- **UI Kit (Tenet):** `ui_kits/tenet/` — drop-in JSX components for the production app.
- **Design system cards:** `preview/` — visual reference for every primitive.

## Rules that are non-negotiable

1. **Two colors only.** Amber `#BA7517` + Ink `#1A1A1A`. Plus three neutrals. **No other hues, ever.**
2. **No emoji. No gradients. No bouncy animations.** See `README.md` → Visual Foundations.
3. **Voice is plain and direct.** No hype words, no exclamation points, no "we" without "you," sentence case for body copy. See `README.md` → Content Fundamentals.
4. **Amber is for kickers, accents, the brand name, and small badges — never body text, never a large fill.**
5. **Square corners by default.** Pills only for status chips. Cards are 4 px. Photography is 0 px.

When in doubt, look at the cards in `preview/` — they encode the system visually.
