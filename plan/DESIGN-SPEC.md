# Design Spec

The source of truth is `reference/mockup-full.png`. It's 866px wide and represents a ~1440px desktop. **Multiply any size you measure from the mockup by ~1.66.** The values below are already converted to 1440px desktop sizes. Treat them as targets and use judgement to make the result look like the mockup.

## Colour tokens (sampled from the mockup and logo)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FAF8F7` | page background, header |
| `stone` | `#F1F0EB` | alternate section background (Services, Contact right panel) |
| `ink` | `#2B2925` | headings on light backgrounds |
| `body` | `#6B665E` | body text on light backgrounds |
| `muted` | `#726C63` | small captions, feature sub-text (darkened in Phase 2 for 4.5:1 contrast) |
| `gold` | `#B28E5A` | logo, icons, eyebrow dash lines, kanji, thin dividers |
| `gold-deep` | `#88673F` | filled button background, gold text (darkened in Phase 2 for 4.5:1 contrast) |
| `gold-light` | `#C2A68B` | kanji / decorative on light bg |
| `night` | `#181916` | Contact dark panel |
| `night-deep` | `#11110F` | Footer |
| `line` | `#E4DED4` | hairline borders on light bg |
| `line-dark` | `#2E2D29` | hairline borders on dark bg |

Light site only. Remove the dark-mode media query that create-next-app added.

## Typography

- **Display/headings:** `Cormorant Garamond` (weights 400, 500; italic 400). Used for:
  - section headings
  - the hero title
  - the brand name "Atelier JK&WA Pte. Ltd."
  - WA panel title
  - price, quotes
- **Body/UI:** `Jost` (weights 300, 400, 500). Used for:
  - paragraphs
  - nav
  - buttons
  - eyebrows
  - captions
- **Kanji 和:** **not a web font.** Use the prepared SVG `plan/assets/wa-kanji-light.svg`, the 和 glyph from Noto Serif CJK **JP** Light (Japanese Mincho form). It's turned into a React component (`WaKanji`) with `fill="currentColor"`. See "The WA panel — craft rules" below. If Phase 1 loaded Noto Serif JP through `next/font`, remove it in Phase 2. It downloads a large font for one character, and fallback fonts can show the Chinese form of the glyph.
- Scale at 1440px desktop (scale down on mobile with `clamp()`):
  - **Hero title:** 64px, line-height 1.1, weight 400, white
  - **Section heading (h2):** 44px, line-height 1.15, weight 400, `ink`
  - **Eyebrow:** Jost 11–12px, uppercase, letter-spacing 0.28em, `muted`, followed by a 40px 1px `gold` line (inline, vertically centred, 12px gap)
  - **Body:** Jost 16px, line-height 1.75, weight 300, `body`
  - **Nav links:** Jost 12px uppercase, letter-spacing 0.12em, `ink`. Active link has a 1px gold underline 6px below.
  - **Buttons:** Jost 13px, weight 400, letter-spacing 0.02em

## Layout

- Container: `max-width: 1240px`, horizontal padding 24px on mobile, 48px on tablet, 0 from 1340px up (centred).
- Section vertical padding on desktop: 96–112px. Mobile: 64px.
- Corners are square on images. Buttons are fully rounded (pill).
- Design rules everywhere: thin 1px gold lines, generous white space, no drop shadows (except a very soft one on the sticky header after scroll).

## Buttons

- **Primary (filled):** bg `gold-deep`, white text, pill, height 44px, padding-x 22px, book icon (left) + label + arrow → (right, on the hero only). Hover: slightly darker, and the arrow nudges 3px right.
- **Outline:** 1px border (`ink`/20% on light bg, white/60% on dark bg), transparent bg, clipboard icon + label. Hover: bg `ink`/5% (light) or white/10% (dark).
- Icons: `lucide-react` (allowed). Book = `BookOpen`, questionnaire = `ClipboardList`, arrow = `ArrowRight`.

## Sections (desktop measurements at 1440px)

### Header (sticky)
- Height 88px, bg `paper`, bottom hairline `line`.
- Left: logo mark (52px), then a 2-line brand block: "Atelier JK&WA Pte. Ltd." (Cormorant 22px, `gold-deep`) and "INTERIOR DESIGN & CONSULTANCY" (Jost 9px, letter-spacing 0.3em, `muted`).
- Centre: nav HOME · ABOUT · SERVICES · PORTFOLIO · CONTACT, with a 40px gap. Links scroll to `#home #about #services #portfolio #contact`. On `/projects`, PORTFOLIO is active and the others link to `/#section`.
- Right: Primary "Get Free Booklet" + Outline "Project Questionnaire" (compact: height 40px).
- On scroll > 10px: a soft shadow appears.
- **< 1024px:** hide the nav and buttons and show a hamburger. It opens a full-height drawer from the right (bg `paper`) with the nav links stacked (Cormorant 28px), both buttons full-width at the bottom, and a close X. It locks body scroll, closes on Escape or a link click, and traps focus.

### Hero (Phase 2)
- Height: `min(88vh, 760px)`, min 560px. Full-bleed carousel of hero slides, crossfading every 6s (pause on hover, respect `prefers-reduced-motion`).
- Overlay: a left-to-right gradient `rgba(17,17,15,0.75)` → transparent at 65% width, so the text is readable.
- Text block is left-aligned in the container and vertically centred, max-width 560px:
  - eyebrow (white/80%, no gold line)
  - title (2 lines)
  - sub-text (white/85%, 17px)
  - two buttons (outline in its dark-bg variant)
- Small slide indicators: thin lines, bottom-left in the container.

### About (Phase 2)
- bg `paper`. Three columns: text (≈32%) | image (≈40%, aspect ≈ 1.28:1, tall) | WA panel (≈20%), with a 48px gap.
- WA panel has a 1px `gold` vertical line on its left, with padding-left 28px. It shows:
  - 和 (Noto Serif JP 48px, `gold-light`)
  - "WA" (Cormorant 34px, `ink`)
  - "Harmony" (Cormorant 20px, `muted`)
  - then a 24px gap and the text (Jost 14px, `body`)
- Mobile: stack text → image → WA panel.

### Designer Quotes — AS BUILT in Phase 2 (owner-approved; this overrides the original spec below)
The quotes are in Jost 18px (17px mobile), left-aligned in a 640px column, with the gold “ and the role on the same left edge. **No autoplay**: they change on arrow click or swipe only. The stage height is fixed to the tallest quote.

### Designer Quotes (original Phase 2 spec, kept for reference)
- bg `paper`, separated from About by a centred 1px `line` hairline in the container.
- Centred eyebrow + heading.
- One quote visible at a time, centred, max-width 820px:
  - a large decorative gold “ (Cormorant 96px, `gold-light`)
  - the quote in Cormorant italic 26px / 1.5, `ink`
  - the role below in Jost uppercase 12px letter-spaced, `gold-deep`
  - an optional note line in `muted` 13px
- Controls: ← → thin arrow buttons + counter "01 / 05" (same style as the Portfolio arrows). Autoplay 8s, pause on hover/focus. Swipe on touch.

### Services (Phase 3)
- bg `stone`. Two halves: the left content sits in the container's left 50%. The image on the right is **full-bleed to the right edge of the viewport**, ≈47% of viewport width, filling the full section height (object-cover).
- Left column, top to bottom:
  - eyebrow
  - heading (2 lines)
  - body paragraphs
  - closing line (Cormorant italic 20px, `gold-deep`)
  - then 40px gap and the 3 features in a row, separated by 1px `line` vertical dividers
- Each feature: a gold outline icon (28px, stroke 1.25), title Jost 14px 500 `ink`, sub-text 13px `muted`.
- Mobile: image on top (aspect 4:3), content below; the features stack or sit in 3 narrow columns from 640px.

### Portfolio (Phase 3)
- bg `paper`. Eyebrow + heading on the left. ← → arrows top-right, aligned with the heading, with a 1px `line` above them.
- Carousel row (height ≈ 360px): the **centre card is wide (≈ 2.4× the side cards)**, the side cards are narrow, with a 14px gap.
  - Centre card shows a bottom-left caption: project title (Cormorant 22px white) + location (Jost 12px white/80%) over a bottom gradient.
  - Bottom-right counter "01 / 03" (white/70%).
- Arrows move to the next/previous featured project (the active card animates to the centre). Swipe on touch.
- Below the row, a right-aligned "View All Projects →" text link (Jost 13px uppercase letter-spaced, `gold-deep`).
- Mobile: a single card per view (aspect 4:3) with swipe, the caption always visible.

### Contact (Phase 3)
- Full-bleed three panels, height ≈ 420px:
  - **Left (≈32%):** image, object-cover
  - **Centre (≈34%):** bg `night`, padding 56px:
    - eyebrow (white/60%)
    - "Get In Touch" (Cormorant 40px white)
    - body (white/75%, 14px)
    - then a short 1px `gold` line on the left, with "Projects starting from" (12px white/60%) and "S$100,000" (Cormorant 30px white)
  - **Right (≈34%):** bg `stone`, a 1px `gold` vertical line 40px in from the left, and a list of rows with gold line icons (`MapPin`, `Phone`, `Printer`, `Mail`, `Clock`) and text 14px `body`. Rows: address (3 lines), phone (tel: link), fax, email (mailto: link), hours. Above the list, add "Contact: Mr Kenji" as a small `muted` label.
- Mobile: stack image (aspect 16:10) → dark panel → light panel.

### Footer
- bg `night-deep`, text white/70%, padding-top 72px.
- Four columns:
  1. Logo mark (gold, 56px) + "Atelier JK&WA Pte. Ltd." (Cormorant 22px white) + "INTERIOR DESIGN & CONSULTANCY" (9px letter-spaced white/50%), "Timeless spaces. Lasting impressions." (13px), "UEN 202643450N" (12px white/40%), and social icons (only those with a URL; hide the row if none).
  2. **Quick Links:** Home, About, Services, Portfolio, Contact.
  3. **Our Services:** Design & Build, Residential, Commercial, Consultancy (all link to `/#services`).
  4. **Contact Us:** address, phone, email, hours, with small gold icons.
- Column titles: Jost 14px white. Links: 13px white/60%, hover white. Thin vertical `line-dark` dividers between columns on desktop.
- Bottom bar: 1px `line-dark` top border, 20px padding. Left: "© {current year} Atelier JK&WA Pte. Ltd. All rights reserved." Right: Privacy Policy · Terms & Conditions · Sitemap (links to `/privacy`, `/terms`, `/sitemap.xml`). Text 12px white/45%.
- Mobile: columns stack; the bottom bar stacks and centres.

### The WA panel — craft rules (important)
The client is a Japanese design studio, so this small detail has to be right.
1. **Render 和 only through the `WaKanji` SVG component.** Never as typed text in a Latin font, never synthesised bold/italic, never letter-spaced, never uppercase-transformed, never stretched (keep the viewBox aspect ratio).
2. Size: 52px tall on desktop, 44px on mobile. Colour `gold-light`. It's decorative, so wrap it as `<span lang="ja" aria-hidden="true">` and give the panel an accessible label like "WA — Harmony".
3. **Optical alignment:** the glyph's left edge should line up with the left edge of the "WA" text below it. Nudge with a small negative margin if needed, judged by eye at 2× zoom.
4. Hierarchy and spacing, top to bottom:
   - 和
   - 20px gap
   - "WA" (Cormorant 34px, `ink`, letter-spacing 0.04em)
   - 2px gap
   - "Harmony" (Cormorant italic 20px, `muted`)
   - 28px gap
   - text (Jost 300 14px/1.8, `body`, max-width 220px)
5. The gold vertical line on the left runs the full height of the panel content, 1px, `gold` at 60% opacity.
6. Subtle entrance on scroll (Phase 5): the line draws from top to bottom (scaleY 0→1, 900ms ease-out), then 和 fades in, then the text. Skip it under `prefers-reduced-motion`.
7. On mobile, the panel sits under the About image as a centred block with a **horizontal** 1px gold line above it (48px wide, centred) instead of the vertical one. Same order and sizes as above.
8. Never write "Wa" or "wa". The romanisation is always "WA".

## Mobile — professional standards (applies to every phase)
The site must feel designed for phones, not just squeezed.
- **Base width 375px. Also check 360px (small Android) and 414/430px.** Nothing overflows horizontally, and long words like "Commercial" and the email address wrap or shrink gracefully.
- **Type scale on mobile:**
  - hero title 38–40px
  - h2 30–32px
  - body 15px/1.7
  - eyebrow 10–11px
  - Use `clamp()` so tablet sizes fall in between.
- **Spacing:**
  - side padding 24px (20px at 360px)
  - section padding 64–72px vertical
  - keep the generous feel, never cramped
- **Touch:** every tap target is at least 44×44px. Carousels support swipe with momentum and snap, and arrows stay usable.
- **Header:** 64px tall on mobile, logo mark 40px, brand name 17px, tagline hidden below 400px. Hamburger made of 2 thin lines (not 3 heavy ones), matching the minimal style.
- **Hero on mobile:**
  - height `100svh` minus the header (use `svh`, not `vh`, so iOS toolbars don't cut it)
  - overlay changes to bottom-to-top so the text sits over the dark area at the bottom
  - buttons stack full-width with a 12px gap
- **Images:**
  - correct `sizes` on every `next/image` so phones load small files
  - object-position chosen so the subject stays in frame when cropped
  - no layout shift
- **Sticky CTA:** none. The header menu holds the Booklet and Questionnaire buttons. Don't add floating buttons that cover content.
- **Performance:** hero image `priority`, everything else lazy. Aim for Lighthouse mobile ≥ 90.
- **Test on a real phone over LAN** (`npm run dev -- -H 0.0.0.0`) and in Chrome DevTools device mode, as well as desktop.

### Projects page + detail (Phase 4)
Mockups: `reference/projects-list-mockup.png` (list) and `reference/project-detail-mockup.png` (detail). Full spec in the Phase 4 file. **Ignore the footers in those two images.** They're AI-generated with wrong contact details, and the footer already built in Phase 1 is the one used everywhere.

## Motion & scrolling — standards (owner priority: "very clean and smooth")
Every animation on the site follows these rules. Phase 4 applies them to the new pages, and Phase 5 does a full pass over the whole site.
1. **Only animate `transform` and `opacity`** (plus `clip-path` for image reveals). Never animate width, height, top, margin or box-shadow during scroll. The Phase 3 portfolio `flex-grow` transition is the one approved exception (user-triggered, not scroll).
2. **One easing curve site-wide:** `cubic-bezier(.22,.61,.36,1)` (store it as a CSS variable `--ease-out-soft`). Durations: reveals 700–900ms, hovers 250–350ms, image zoom on hover 900ms. Nothing bouncy, nothing elastic.
3. **Scroll reveals:** one shared `Reveal` component (client, IntersectionObserver, `threshold ≈ 0.15`, `rootMargin: "0px 0px -8% 0px"`).
   - Content fades in and moves up 24px, **once only**: it never re-animates when scrolling back up.
   - Grid items stagger 80ms each, capped at 6 so long grids don't lag.
   - Content already in view on page load shows without waiting.
4. **Image reveals:** images fade in once they've **finished loading** (no half-painted images), with a very subtle scale 1.04 → 1.
5. **No scroll-jacking.** Smooth wheel scrolling (Lenis) is added in Phase 5 for **desktop mouse/trackpad only**. Touch devices keep native scrolling, because iOS/Android momentum is already perfect. It's off under reduced motion, and anchor links must still land below the sticky header.
6. **No layout shift:** every image reserves its space (`width`/`height` or aspect-ratio boxes) and fonts use `next/font`. Target CLS = 0.
7. **Performance budget:**
   - no JavaScript running on every scroll event (use IntersectionObserver, never `scroll` listeners for reveals)
   - `will-change` only while an animation is running
   - test in Chrome DevTools → Performance with 4× CPU throttling: scrolling the full home page and a project page must show no long tasks and no dropped frames
8. **`prefers-reduced-motion`:** all reveals show instantly, no parallax, no smooth-wheel scrolling. The hero keeps its gentle crossfade (owner decision).
9. **Restraint:** headings, paragraphs and images reveal; small UI (labels, buttons inside a revealed block) moves with their block, not separately. The site should feel calm, never busy.
