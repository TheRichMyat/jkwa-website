# Phase 4 — Projects list page + Project detail page

**Goal:** build `/projects` and `/projects/[slug]` from the two new mockups, and upgrade the data model so every part of the detail page can later be edited in the admin panel (Phase 7). Everything still runs on placeholder data.

Read first:
- `plan/00-ROADMAP.md`
- `plan/DESIGN-SPEC.md`: tokens, mobile standards, and the new **"Motion & scrolling — standards"** (owner priority)
- **`reference/projects-list-mockup.png`** and **`reference/project-detail-mockup.png`**: the design source for this phase. Match them closely. **Ignore their footers** (they have the wrong contact details); the existing Footer stays.
- `images/IMAGE-MAP.md`

Phases 1–3 are approved. Don't restyle existing sections. The only change to existing code is the data model update in step 1, plus making home Portfolio cards link to the real pages.

---

## 1. Data model upgrade — `lib/data/types.ts`
Replace `summary`, `description` and the top-level `year` with the structure below. Every optional field must render nothing at all when empty, with no empty headings or dividers. This is the contract the admin panel will fill.

```ts
export interface ProjectFacts {
  propertyType?: string;   // "Landed House", "Condominium", "Spa", "Office"…
  sizeSqft?: number;       // shown formatted: 3200 -> "3,200 sq ft"
  duration?: string;       // "16 Weeks"
  scope?: string;          // "Full Renovation", "Kitchen & Bath"…
  year?: number;
}
export interface ProjectStory {
  heading?: string;        // e.g. "A Home Shaped by Light and Calm"
  body: string;            // plain text, blank line = new paragraph; URLs auto-linked
}
export interface BeforeAfter { before: ProjectImage; after: ProjectImage; }

export interface Project {
  id: string; slug: string;
  title: string;                       // required
  category: ProjectCategory;           // required
  location: string;                    // required, e.g. "Sentosa Cove, Singapore"
  cover: ProjectImage;                 // required
  facts: ProjectFacts;                 // all optional
  story?: ProjectStory;                // optional
  beforeAfter?: BeforeAfter;           // optional (both images or none)
  gallery: ProjectImage[];             // optional (can be empty)
  featured: boolean;
  published: boolean;                  // getters return ONLY published projects
  sortOrder: number;
}
```
- Update `getProjects(category?)`, `getFeaturedProjects()`, `getProjectBySlug(slug)` and `getAllProjectSlugs()` to filter `published: true`.
- Add `getAdjacentProject(slug)`, which returns the **next** published project by `sortOrder`, looping back to the first.
- Fix every existing use of the removed fields (home Portfolio, etc.). Home Portfolio cards now link to `/projects/[slug]`.

## 2. Placeholder data — 10 projects
Ten published projects (so "Load More" is testable with 9 per page), plus **1 unpublished** project to prove it's hidden everywhere. Use the mockup titles:

| # | Title | Category | Location |
|---|---|---|---|
| 1 | Sentosa Cove Residence | residential | Sentosa Cove, Singapore |
| 2 | Orchard Condominium | residential | Orchard, Singapore |
| 3 | Zen Spa Retreat | commercial | Sentosa, Singapore |
| 4 | Tea House Café | commercial | Tiong Bahru, Singapore |
| 5 | Boutique Office | commercial | Marina Bay, Singapore |
| 6 | Tanjong Pagar Restaurant | commercial | Tanjong Pagar, Singapore |
| 7 | Bukit Timah Villa | residential | Bukit Timah, Singapore |
| 8 | Marina Bay Penthouse | residential | Marina Bay, Singapore |
| 9 | Kyoto-Style Ryokan Suite | residential | Sentosa, Singapore |
| 10 | Holland Village Apartment | residential | Holland Village, Singapore |

Keep projects 1–3 as the featured ones, with covers 1, 2, 3 as in Phase 3. Reuse the available images (placeholder 1–6, hero, about, services, contact) for covers and galleries.

**Vary the content on purpose**, so the "empty = hidden" rule gets tested:
- **#1 is complete:** all 5 facts, story with heading and 3 paragraphs, before/after, and a gallery of 8 images (exercises the full gallery pattern).
- **#2:** facts, a story with **no heading**, no before/after, and a gallery of 5.
- **#3:** only 2 facts, no story, before/after, and a gallery of 3.
- **#4:** no facts at all, a story, and **no gallery**.
- The others are a mix. Write neutral, believable placeholder copy (2–3 short paragraphs), in the calm tone of CONTENT.md.

**Placeholder "before" images:** generate them with `sharp` from the matching "after" image (desaturated, slightly darker, cooler tint), saved as `web/public/images/projects/placeholder-before-N.jpg`. They exist only so the slider can be tested; leave a code comment saying so.

## 3. Shared pieces
- **`components/motion/Reveal.tsx`**: implement it per "Motion & scrolling — standards" §3–4 (one component for text blocks and a `RevealImage` variant for images). Use it on both new pages. Applying it to the home page happens in Phase 5.
- **`components/sections/CtaBand.tsx`:** the dark "PLANNING A SIMILAR SPACE? / Let's Create Something Beautiful" band with the Booklet (primary) and Questionnaire (outline-dark) buttons, centred.
  - bg `night`, padding 88px desktop / 64px mobile
  - eyebrow centred in dark tone with the gold line
  - heading Cormorant 40px white
  - buttons side by side, stacked full-width on mobile
  - used on both pages
- **`lib/text.ts`:** a `toParagraphs(body)` helper that splits on blank lines and turns plain URLs into safe links (`rel="noopener noreferrer"`, new tab). **Never render raw HTML** (no `dangerouslySetInnerHTML`), because admin text must be treated as plain text.

## 4. Projects list — `app/projects/page.tsx`
Match `reference/projects-list-mockup.png`.

**a) Intro banner.** bg `stone`, padding ≈ 64px desktop.
- Left: eyebrow "PORTFOLIO", heading "Our Projects" (Cormorant ~56px), 2 lines of text: **"We believe in the power of natural light, proportion, texture and craftsmanship to create timeless spaces."**
- Right (desktop only): a 1px `gold` vertical line, then the `WaKanji` (≈ 80px tall, colour `gold`), with all WA craft rules applied. Hidden below 768px.

**b) Filter bar.** On `paper`.
- Tabs ALL · RESIDENTIAL · COMMERCIAL: Jost 12px uppercase, tracking 0.24em, `muted`. The active one is `ink` with a 2px `gold` underline spanning the tab width; the underline **slides** between tabs (transform), it doesn't jump.
- Right: count text, e.g. "9 Projects" (updates with the filter).
- The filter is a URL search param (`/projects?type=residential`), so filtered views are shareable and the back button works. Switching filters fades the grid out/in (250ms) with no page jump.
- Mobile: the tabs fill the width evenly and the count goes under them, right-aligned.

**c) Grid.** 3 columns ≥ 1024, 2 columns 640–1023, 1 column below. Gap ≈ 32px horizontal / 48px vertical.
- **Card:**
  - image 4:3 (`object-cover`)
  - then tiny gold uppercase category label (RESIDENTIAL / COMMERCIAL)
  - title (Cormorant 26px `ink`)
  - a row with a 24px `gold` line + location (Jost 13px `muted`)
- The whole card is one link to the project.
- **Hover (pointer devices):**
  - image scales to 1.04 (900ms)
  - a soft dark overlay fades in
  - a small dark chip "View Project →" appears bottom-left of the image, fading in and rising 6px
  - the title gets a thin underline
- Keyboard focus shows the same state plus a visible focus ring.
- Cards reveal with the staggered `Reveal` (max 6 staggered).

**d) Load More.** Show 9, then a centred outline pill "Load More Projects" adds 9 more, with the new cards revealing in place. It's hidden when everything is shown. Filtering resets to 9. The button must not cause a scroll jump.

**e) Empty state.** If a filter has no projects: a centred short message "New projects coming soon." with a link back to All.

**f)** `<CtaBand/>` at the bottom, then the Footer as usual.

Metadata: title "Our Projects", plus a description from the intro text.

## 5. Project detail — `app/projects/[slug]/page.tsx`
Match `reference/project-detail-mockup.png`. Use `generateStaticParams` from `getAllProjectSlugs()`. Unknown or unpublished slug → `notFound()`. Add a simple, on-brand `not-found.tsx` for projects, with a link back to `/projects`.

**a) Cover.**
- Full-bleed image, height `clamp(420px, 64vh, 640px)` on desktop, `calc(100svh - 64px)` capped at 560px on mobile.
- Bottom-left gradient, like the home hero.
- Inside the Container, bottom-left: eyebrow (category, white, with the gold line), title (Cormorant 56px desktop / 36px mobile, white), location (Jost 15px white/85%).
- `preload` the cover (it's the LCP).
- Content fades up on load, like the hero intro.

**b) Facts strip.** On `paper`, with a 1px `line` bottom border. Padding ≈ 32px.
- Items in this order, **skipping empty ones:** PROPERTY, LOCATION (always present, from `location`), SIZE, DURATION, SCOPE, YEAR.
- Each item: tiny uppercase label (Jost 10px, tracking 0.24em, `muted`) over the value (Cormorant italic 19px `ink`).
- Separated by 1px `gold` (60%) vertical lines, spread evenly across the Container.
- Fewer items → still evenly spread, never stretched oddly.
- Tablet: 3 per row. Mobile: a 2-column grid with thin horizontal `line` dividers between rows.

**c) Story** (only if `story` exists). On `paper`, padding ≈ 96px.
- Two columns ≥ 1024 (≈ 40% / 60%).
- Left: eyebrow "THE PROJECT" + heading. If there's no heading, the eyebrow stays alone.
- Right: the paragraphs (Jost 300 16px/1.8 `body`, max ≈ 560px).
- Mobile: stacked.

**d) Before & After** (only if `beforeAfter` exists). bg `stone`. Eyebrow "TRANSFORMATION" + heading "Before & After".
- **The slider:**
  - aspect 16:9 desktop (max height 640px), 4:3 mobile
  - the after image fully underneath, the before image on top, clipped with `clip-path: inset(0 X% 0 0)`
  - a 2px white divider line with a 44px round white handle showing ‹ ›
  - labels: "BEFORE" (dark chip, bottom-left) and "AFTER" (gold chip, bottom-right), Jost 11px tracking 0.2em
  - starts at 50%
- **Interaction:**
  - drag the handle **or anywhere on the image** (Pointer Events with pointer capture; works with mouse, touch and pen)
  - on touch, horizontal drags move the slider and vertical drags still scroll the page (`touch-action: pan-y`)
  - keyboard: it's a real `role="slider"` with `aria-valuenow`; ← → move 5%, Home/End go to 0/100%
  - updates go through `requestAnimationFrame` with transforms and `clip-path` only, so it stays perfectly smooth on mid-range phones
- No library; build it.

**e) Gallery** (only if there are images). On `paper`, eyebrow "GALLERY".
- **Automatic editorial pattern**, repeating in upload order:
  1. **Full** — one image full Container width
  2. **Pair** — two images 50/50
  3. **Wide + narrow** — 2/3 + 1/3
  4. repeat from 1
- **Leftovers at the end:** 1 left → Full. 2 left → Pair.
- Row heights on desktop: Full ≈ 440px, Pair ≈ 400px, Wide + narrow ≈ 400px (`object-cover`). Gaps 8px. Tablet: the same pattern with heights scaled ≈ 0.75. Mobile: a single column, each image at aspect 4:3, gap 8px.
- Each image reveals with `RevealImage` and has `sizes` matching its slot.
- **Lightbox:** clicking any gallery image opens a full-screen viewer:
  - bg `night-deep`/96%, image `object-contain`
  - counter "03 / 08", ← → buttons, close X (top-right)
  - Embla for swipe on touch; keyboard ← → Esc
  - focus trapped, body scroll locked, focus returns to the clicked image on close
  - opens with a 250ms fade + scale 0.98 → 1
  - only loads the full-size image for the current slide and its neighbours
- The before/after images are **not** part of the lightbox.

**f)** `<CtaBand/>`

**g) Next project.** A full-bleed band, height ≈ 280px desktop / 220px mobile, with the next project's cover image and a dark overlay (black/45%).
- Bottom-left in the Container: eyebrow "NEXT PROJECT" (white, gold line), then the title (Cormorant 36px white) + "→".
- The whole band is a link. On hover the image scales to 1.04 and the arrow slides 6px right.
- If there's only one published project, hide this band.

**Metadata** (`generateMetadata`):
- title = project title
- description = the first ~155 characters of the story body; if there's no story, "{category} interior design project in {location} by Atelier JK&WA."
- Open Graph image = the cover

## 6. Check before you finish
- Compare both pages with their mockups at 1440 and list any remaining differences.
- Test project #1 (everything), #3 (no story), #4 (no facts, no gallery) and the unpublished one (must 404, and must not appear in lists, filters, counts, the home carousel or Next project).
- Gallery pattern with 1, 2, 3, 4, 5 and 8 images: no orphan gaps.
- Before/after: mouse, touch (Chrome device mode **and** a real phone over Wi-Fi), keyboard; vertical page scroll still works on a phone when touching the slider.
- Lightbox: swipe, keys, Esc, focus return, no background scroll.
- Filter + Load More: URL updates, back button, count, no scroll jump.
- **Motion:** apply the standards; run the DevTools Performance check (4× CPU throttle) while scrolling a project page. Report the result.
- Widths 360 → 1440, no horizontal scroll. Reduced motion: everything visible and usable.
- Lighthouse mobile for `/projects` and `/projects/sentosa-cove-residence`.
- `npm run lint` and `npm run build` pass. All project pages prerender.
- Commit `Phase 4: projects list + project detail` and push.
- Report in the usual format with screenshots of both pages at 1440 and 375. **Stop any servers you started.**
