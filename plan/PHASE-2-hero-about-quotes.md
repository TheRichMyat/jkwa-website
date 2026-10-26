# Phase 2 — Hero, About, Designer Quotes

**Goal:** replace the first three placeholder sections (`home`, `about`, `designers`) with the finished sections. Desktop must match `reference/mockup-full.png` closely, and phone must follow the mobile standards in DESIGN-SPEC.

Read first:
- `plan/00-ROADMAP.md`, including the `images/` folder rules
- `plan/DESIGN-SPEC.md`: Hero, About, Designer Quotes, "The WA panel — craft rules", "Mobile — professional standards"
- `plan/CONTENT.md`: sections 1–3

Phase 1 is approved by the owner. **Don't change the Header, Footer or tokens** unless this file says so.

---

## 0. Housekeeping
1. **Remove Noto Serif JP** from `layout.tsx`, its CSS variable and the `font-jp` theme mapping. 和 now comes only from the SVG (step 3).
2. Install **`embla-carousel-react`**, **`embla-carousel-autoplay`** and **`embla-carousel-fade`**. They're used for every carousel on the site (hero, quotes, and the Phase 3 portfolio), so swipe, momentum and accessibility behave the same everywhere. Write one small shared hook or wrapper in `components/ui/carousel/` that handles:
   - prev/next
   - the selected index
   - autoplay pause on hover/focus
   - `prefers-reduced-motion` (no autoplay, no fade animation)
3. **Real images:** read `images/IMAGE-MAP.md` first. It says which photo goes in which section and the `object-position` to use. Follow the ROADMAP image rules:
   - About → `About image.*`
   - extra hero slides → `Hero *` (append them after the two existing slides)

   If not, keep the placeholders and say so in the report.

## 1. Hero — `components/home/Hero.tsx`
Spec: DESIGN-SPEC → Hero, plus the mobile rules. Data: `getHeroSlides()` and `getSettings()` (for the two button URLs).

- A Server Component fetches the data and renders a client `HeroCarousel` for the slides. The text block stays server-rendered, so it's in the HTML for SEO.
- **Slides:**
  - Embla with the fade plugin, autoplay every 6s, loop
  - pause on hover/focus and when the tab is hidden
  - each slide also does a very slow zoom (scale 1 → 1.05 over the slide's lifetime), off under reduced motion
  - slide 1 uses `priority` and `fetchPriority="high"`; the others are lazy
  - `sizes="100vw"`
- **Overlay:**
  - Desktop: a left-to-right gradient, `rgba(17,17,15,0.78)` → transparent at ~65%.
  - Mobile (< 768px): a bottom-to-top gradient, `rgba(17,17,15,0.85)` → transparent at ~70%, with the text anchored to the bottom (padding-bottom 48px).
  - Make sure the text stays readable over **both** hero photos. Hero-2 is darker and hero-1 is lighter.
- **Height:**
  - Desktop ≥ 1280: `min(88vh, 760px)`, min 560px.
  - 1024–1279 (two-row masthead): use `calc(100svh - 64px)`, capped at 760px, so the sticky bar doesn't cover it.
  - < 1024: `calc(100svh - 64px)`, min 560px.
- **Text block:** eyebrow, title, sub-text, then the two buttons (BookletButton primary with trailing arrow; QuestionnaireButton `outline-dark`).
  - On mobile, the buttons stack full-width with a 12px gap.
  - Title: 64px desktop / 40px mobile via `clamp()`, `font-display` weight 400, line-height 1.1, max 2 lines on desktop ("Japanese Inspired" / "Interior Design").
- **Intro animation (on load):** eyebrow, title, sub-text and buttons fade up 16px with a 120ms stagger and a 700ms ease-out. Under reduced motion, show them instantly. Use CSS/`@keyframes` with a class; no animation library.
- **Indicators:** thin horizontal bars (24px × 1px, the active one 48px and white, the others white/40%), bottom-left inside the Container. Clickable, with `aria-label="Go to slide N"`. Hide them if there's only one slide.
- Accessibility: the region has `aria-roledescription="carousel"`, slides have `aria-label="N of M"`, and images carry the `alt` from the data.

## 2. About — `components/home/About.tsx`
Spec: DESIGN-SPEC → About + **WA panel craft rules (follow all 8 exactly)**. Content: CONTENT.md §2.

- Section `id="about"`, bg `paper`, padding per spec.
- **Desktop (≥ 1024):** three columns. Text ≈32% | image ≈40% | WA panel ≈20%, with a 48px gap, vertically aligned to the top of the image, as in the mockup.
  - Text column: eyebrow, heading (2 lines: "The Philosophy" / "Behind Our Design"), 2 paragraphs.
  - Image: aspect ≈ 1.28:1 on desktop, `object-cover`, `sizes` set correctly. Use the About image or the placeholder.
- **Tablet (768–1023):** text full width on top. Below it, the image (≈62%) and WA panel (≈38%) side by side.
- **Mobile:** text → image (aspect 4:3) → WA panel in its centred mobile variant (craft rule 7).
- **`WaKanji` component:** `components/brand/WaKanji.tsx`. Inline the path from `plan/assets/wa-kanji-light.svg` (keep the viewBox, `fill="currentColor"`). It accepts `className` for size and colour.

  Check it at 2× zoom on desktop and on a phone:
  - Its left edge lines up optically with "WA".
  - It's the Japanese form. Compare it with the reference rendering in the SVG file. Don't redraw it.

## 3. Designer Quotes — `components/home/DesignerQuotes.tsx`
Spec: DESIGN-SPEC → Designer Quotes. Content: CONTENT.md §3. Put the five quotes in `lib/content/designers.ts`. They're fixed page text, not admin data.

- Section `id="designers"`, bg `paper`. A centred 1px `line` hairline at the top, inside the Container.
- Centred eyebrow (gold lines on both sides) + heading.
- **Quote stage:** Embla fade, one quote at a time, max-width 820px, centred.
  - Decorative “ (Cormorant 96px, `gold-light`, `aria-hidden`)
  - Quote: Cormorant italic, 26px desktop / 21px mobile, line-height 1.5, `ink`, wrapped in `<blockquote>`
  - Role: `<cite>` with `not-italic`, Jost uppercase 12px, tracking 0.2em, `gold-deep`
  - Note line (quote 2 only): 13px `muted`
- **The stage height must not jump** between quotes of different lengths. Reserve the height of the longest quote at each breakpoint: render all slides in the same grid cell and size the cell to the tallest.
- **Controls** under the quote, centred:
  - ← thin arrow button, "01 / 05" counter (Jost 12px, tracking 0.2em; the current number in `ink`, "/ 05" in `muted`), → thin arrow button
  - arrow buttons are 44×44 tap targets with a 1px `line` circle border; on hover the border turns `gold` and the icon `gold-deep`
  - **Reuse this control as `CarouselControls`.** Phase 3's Portfolio uses the same arrows and counter.
- Autoplay 8s, pause on hover/focus, swipe on touch. Use `aria-live="polite"` on the stage only while it's not autoplaying, so screen readers aren't spammed.

## 4. Wire up `page.tsx`
Replace the `home`, `about` and `designers` placeholders with `<Hero/>`, `<About/>` and `<DesignerQuotes/>`. Keep the placeholders for `services`, `portfolio` and `contact`. Header active-link tracking must still work: the `#designers` section has no nav item, so ABOUT stays active while it's in view.

## 5. Check before you finish
- Compare side by side with the mockup at 1440 for the Hero and About.
- Widths: 360, 375, 414, 768, 1024, 1100, 1280, 1440. No horizontal scroll. Hero text readable on both slides. No layout shift when quotes change.
- Keyboard: the hero indicators and quote arrows are reachable and labelled.
- Reduced motion (DevTools → Rendering → emulate): no autoplay, no zoom, no intro animation, nothing breaks.
- Lighthouse mobile on `/`: report Performance, Accessibility and the LCP element. LCP should be the first hero image.
- `npm run lint` and `npm run build` pass.
- Commit `Phase 2: hero, about, designer quotes` and push to main.
- Report back in the same format as Phase 1:
  - what was built
  - judgement calls
  - which real images were used, or that placeholders remain
  - screenshots: Hero + About at 1440 and 375, and the WA panel close-up on both
