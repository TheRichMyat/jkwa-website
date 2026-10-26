# Phase 3 — Services, Portfolio carousel, Contact

**Goal:** replace the last three placeholders (`services`, `portfolio`, `contact`) with finished sections. After this phase **the whole home page is complete**. Desktop must match `reference/mockup-full.png` closely, and phone must follow "Mobile — professional standards".

Read first:
- `plan/00-ROADMAP.md`
- `plan/DESIGN-SPEC.md`: Services, Portfolio, Contact, Mobile standards. Note that the colour tokens table was updated with your Phase 2 contrast changes.
- `plan/CONTENT.md`: §4–§6
- `images/IMAGE-MAP.md`

Phases 1–2 are approved. **Don't change the Header, Footer, Hero, About or Quotes**, and keep every owner decision noted in code comments.

---

## 0. Images
Run `scripts/optimize-images.mjs` on these files (no upscaling), and wire them up in `lib/placeholder-images.ts` with the `object-position` from IMAGE-MAP:

| Source | Destination | Use |
|---|---|---|
| `images/Services image.jpg` | `web/public/images/services/services.jpg` | Services |
| `images/Contact image.jpg` | `web/public/images/contact/contact.jpg` | Contact |
| `images/1.jpg` … `6.jpg` | `web/public/images/projects/placeholder-1.jpg` … `-6.jpg` | the 6 placeholder projects |

- **Projects:** give each placeholder project, in `sortOrder`, the matching numbered image as its `cover`. Make its `gallery` = its own cover + 3 of the other placeholder images, so Phase 4 has galleries to show.
- **Featured:** the featured projects must be the ones using images **1 and 2** first. Set `featured: true` on exactly 3 projects with covers 1, 2, 3, in that order.
- Keep a code comment saying these are temporary and the client replaces them via the admin panel.
- Read the real width and height of each file. Don't hard-code wrong dimensions.

## 1. Services — `components/home/Services.tsx`
Spec: DESIGN-SPEC → Services. Content: CONTENT.md §4.

- Section `id="services"`, bg `stone`.
- **Desktop (≥ 1024):**
  - Left content stays inside the Container's left half (max ~560px of content).
  - The image is **full-bleed to the right edge of the viewport**, ≈47vw wide, and fills the section's full height (`object-cover`, position from IMAGE-MAP).
  - The left content decides the section height. Padding: 96px top and bottom.
- **Left column order:**
  - eyebrow
  - heading on 2 lines ("Design & Build" / "for Residential & Commercial")
  - 2 paragraphs
  - closing line (Cormorant italic 20px, `gold-deep`)
  - 40px gap
  - 3 features in a row with 1px `line` vertical dividers between them
- **Features:**
  - lucide icons `House`, `Layers`, `Gem`: 28px, `strokeWidth={1.25}`, colour `gold`
  - title Jost 14px 500 `ink`
  - sub-text 13px `muted` (2 short lines, as in the mockup)
  - generous horizontal padding inside each feature (≈28px), the first one flush left
- **Tablet (768–1023):** the image goes on top, full width (aspect 16:9), then the content in the Container. The features stay in 3 columns.
- **Mobile:**
  - Image on top (aspect 4:3, full-bleed), then the content.
  - Features: 3 narrow columns from 520px; below 520px a vertical list, where each feature is a row (icon left, title + sub-text right) separated by 1px `line` horizontal dividers.
  - The tap area isn't needed, since features are not links.

## 2. Portfolio — `components/home/Portfolio.tsx` + `PortfolioCarousel.tsx`
Spec: DESIGN-SPEC → Portfolio. Content: CONTENT.md §5. Data: `getFeaturedProjects()`.

**The mockup layout to match (desktop ≥ 1024):**
- Header row: eyebrow + "Our Latest Projects" on the left. On the right, the ← → arrows, sitting on a 1px `line` that runs from the arrows leftwards ≈ 80px (look at the mockup).
- Row of 3 visible cards, height ≈ 360px (1440) and ≈ 320px (1024–1279), gap 14px:
  - **previous project (narrow) | active project (wide, ≈2.4× a narrow card) | next project (narrow)**
  - Only the **active** card shows the caption (bottom-left: title in Cormorant 22px white + location in Jost 12px white/80%, over a bottom gradient) and the counter "01 / 03" (bottom-right, Jost 12px white/70%, tracking 0.2em).
  - Narrow cards: a small dark overlay (black/10%) that clears on hover. They're clickable: clicking a narrow card makes it active (same as the arrows).
  - Clicking the **active** card opens `/projects/[slug]`. The page comes in Phase 4, so the link 404s for now; that's expected.
- **Changing the active project** (arrows, clicking a side card, keyboard ←/→ when the carousel has focus):
  - Animate smoothly. The cards slide and the widths transition (600ms, ease `cubic-bezier(.22,.61,.36,1)`), with the caption fading out/in.
  - It loops.
  - Pick the implementation that gives the smoothest result, e.g. a flex row with animated `flex-grow`, or Embla with per-slide widths. If you use Embla, use the shared `useCarousel`.
  - Under reduced motion, switch instantly.
- No autoplay (the owner prefers user-driven carousels; see the quotes decision).
- Use `CarouselControls` for the arrows. Add a prop so it can hide its counter here, because the counter lives inside the active card.
- **Edge cases:**
  - only 1 featured project: show it wide on its own, no arrows
  - 2 featured projects: active + 1 narrow
  - 0: hide the whole carousel and show only the "View All Projects" link
- Below the row: a right-aligned **"View All Projects →"** link to `/projects` (Jost 13px uppercase tracking 0.2em, `gold-deep`, the arrow nudges on hover).
- **Images:** `sizes` must match the actual card widths (wide ≈ 50vw, narrow ≈ 20vw on desktop). Use object-cover, center.

**Tablet (768–1023):** same idea, but the active card ≈ 70% and only a sliver (≈ 12%) of the next card visible on the right. Swipe works.

**Mobile (< 768):**
- One card per view, full Container width, aspect 4:3, with a ~8% peek of the next card so users see they can swipe.
- Embla with momentum swipe and snap.
- Caption always visible on every card.
- The arrows + counter (`CarouselControls`, counter visible) sit **under** the cards, centred, instead of top-right.
- "View All Projects →" goes full-width and centred under the controls.

Accessibility: the region has `aria-roledescription="carousel"` and `aria-label="Featured projects"`, each card is a link with the project title as its name, and the arrows are labelled.

## 3. Contact — `components/home/Contact.tsx`
Spec: DESIGN-SPEC → Contact. Content: CONTENT.md §6. Data: `getSettings()`.

- Section `id="contact"`. Three full-bleed panels on desktop (≥ 1024), min-height ≈ 420px, all the same height:
  - **Left ≈32%:** the contact image (`object-cover`, position from IMAGE-MAP).
  - **Centre ≈34%:** bg `night`, padding 56px (48px at 1024–1279):
    - eyebrow in its dark tone
    - "Get In Touch" (Cormorant 40px white)
    - 2 paragraphs (Jost 300 14px/1.8, white/75%)
    - then a price block: a 1px `gold` vertical line on the left (padding-left 16px), "Projects starting from" (12px white/60%), "S$100,000" (Cormorant 30px white)
  - **Right ≈34%:** bg `stone`, with a 1px `gold` vertical line about 40px from the left edge running the content height. The content is to the right of the line:
    - a small label "CONTACT: MR KENJI" (eyebrow style, no dash)
    - then rows, each with a gold lucide icon (20px, stroke 1.25) and text Jost 14px `body`, 20px between rows:
      - `MapPin` → 3 address lines
      - `Phone` → `tel:` link
      - `Printer` → fax (plain text)
      - `Mail` → `mailto:` link (must wrap nicely on small widths; use `break-all` only on the email)
      - `Clock` → hours
    - Links: hover shows `gold-deep` with an underline offset of 4px.
- **Tablet (768–1023):** image on top (aspect 21:9, full-bleed), then the dark and light panels side by side, 50/50.
- **Mobile:** image (aspect 16:10) → dark panel → light panel, all full width. Padding 40px 24px (20px at 360). The light panel's vertical gold line becomes a 48px horizontal line above the list.
- **Optional (do it only if it's simple):** make the address row a link to Google Maps (`https://www.google.com/maps/search/?api=1&query=Suntec+Tower+One+7+Temasek+Boulevard+Singapore+038987`), opening in a new tab.

## 4. Wire up `page.tsx`
Replace the three remaining placeholders. The home page now has no placeholders left. Check that the header's active-link tracking still works for SERVICES, PORTFOLIO and CONTACT, including at the bottom of the page: CONTACT must become active even though it's the last section and may never reach the top.

## 5. Check before you finish
- Compare the **whole home page** side by side with the mockup at 1440 and report anything that still differs.
- Widths: 360, 375, 414, 768, 1024, 1100, 1280, 1440. No horizontal scroll. The Services image is truly full-bleed right (no gap, no overflow).
- Portfolio: arrows, side-card click, keyboard, swipe on touch, loop, reduced motion, and the 1/2/0-featured edge cases (test by temporarily changing the data, then revert).
- Contact: `tel:`/`mailto:` work, the email wraps cleanly at 360px, and the panels are equal height on desktop.
- Lighthouse mobile on `/`: Performance, Accessibility, CLS, LCP.
- `npm run lint` and `npm run build` pass.
- Commit `Phase 3: services, portfolio carousel, contact` and push to main.
- Report in the same format as Phase 2, with screenshots: full home page at 1440 and 375, and the portfolio at 1440 / 768 / 375.
- **Stop any dev/test servers you started** before finishing, and say in the report that you did.
