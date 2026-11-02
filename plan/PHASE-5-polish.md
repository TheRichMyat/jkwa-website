# Phase 5 — Polish: motion, smooth scrolling, performance, SEO, legal pages, accessibility

**Goal:** finish the front end to a "ready to show the client" standard. No new sections. This phase is about how the site **feels** (motion and scrolling, the owner's priority), how fast it is, and how it appears on Google and when shared.

Read first: `plan/00-ROADMAP.md`, and `plan/DESIGN-SPEC.md` → **"Motion & scrolling — standards"** (follow every rule) and "Mobile — professional standards".

Phases 1–4 are approved. Don't restyle anything. Every owner decision noted in code comments stays as it is.

---

## 1. Scroll reveals on the home page
Use the existing `Reveal` / `RevealImage` (Phase 4) on the home page. Keep it calm: one reveal per meaningful block, never per word or per small label.

| Section | What reveals |
|---|---|
| Hero | Nothing new; it already has its load intro. |
| About | Text column, then the image (`RevealImage`), then the WA panel. **WA panel sequence** (craft rule 6): the gold line draws top→bottom (scaleY 0→1, 900ms), then 和 fades in, then "WA / Harmony", then the text, ~120ms apart. On mobile the horizontal line draws left→right instead. |
| Designer Quotes | Eyebrow + heading as one block, then the quote stage. |
| Services | Text block. The image uses `RevealImage`. The 3 features stagger (80ms). |
| Portfolio | Heading row, then the card row as one block (don't stagger the cards; the carousel moves them). |
| Contact | The three panels stagger left → right (80ms). The image uses `RevealImage`. |
| Footer | No reveal. It should just be there. |

## 2. Smooth wheel scrolling (Lenis), desktop only
- Install `lenis`. Create one `SmoothScroll` client provider in the root layout. Settings: `lerp: 0.1`, `smoothWheel: true`, `syncTouch: false`. **Touch devices keep native scrolling**: don't init Lenis when `(pointer: coarse)` matches, and don't init under `prefers-reduced-motion`.
- Drive it with a single `requestAnimationFrame` loop. Make sure there's only one loop, and that it's destroyed on unmount.
- **Integration (each one must be checked):**
  - **Anchor links** (header nav, `/#section` from other pages, footer quick links) scroll smoothly through Lenis and land with the sticky-header offset: 64px below 1280, 88px from 1280. The two-row masthead at 1024–1279 must still land correctly.
  - The **header active-link IntersectionObserver** still updates correctly while Lenis scrolls.
  - **Scroll locks:** the mobile drawer and the project lightbox call `lenis.stop()` on open and `lenis.start()` on close, together with the existing body lock.
  - **Route changes** (Next `Link`): new pages start at the top. The back button restores the previous position without a visible jump.
  - **Inner scrollable areas** (the drawer if it scrolls, the lightbox) get `data-lenis-prevent`.
  - **Embla carousels and the before/after slider** still work with trackpad horizontal swipes and drag.
  - **Keyboard scrolling** (Space, PageDown, arrows) still works.
- If any of these can't be made reliable, **report it rather than shipping a half-working smooth scroll.** Native scrolling is the acceptable fallback.

## 3. Performance: reach Lighthouse mobile ≥ 90 on `/`, `/projects` and a project page
The Phase 4 report found about 1.7s of render delay (fonts and hydration). Work through these in order and measure after each:
1. **Fonts:**
   - load only the weights actually used (check every `font-*`/`italic` use)
   - `display: "swap"`
   - preload only the font used above the fold
   - make sure there's no unused italic or extra weight
2. **Less client JavaScript:**
   - keep components as Server Components wherever possible
   - only the interactive bits (carousels, header drawer, slider, lightbox, filters) should be client components
   - lazy-load the **lightbox** with `next/dynamic` on first click
   - make sure lucide icons are imported per icon (tree-shaken)
3. **Images:**
   - correct `sizes` everywhere
   - only the LCP image `preload`
   - quality ~75 for large photos
   - check that no image is downloaded at a much larger size than it's shown
4. Check the bundle (`next build` output or `@next/bundle-analyzer` as a dev-only tool) and remove anything unexpectedly large.

Report the before/after scores for each page.

## 4. SEO
- **Site URL:** add `NEXT_PUBLIC_SITE_URL` to `.env.example` (and `.env.local` with `http://localhost:3000`). Set `metadataBase` from it in the root layout. The real domain is filled in at launch (Phase 8). **Every Open Graph / canonical URL must use this. No hard-coded localhost.**
- **Metadata per page:**
  - title + description on `/`, `/projects` and each project
  - a canonical URL for each
  - `/projects?type=…` canonicalises to `/projects`
- **Open Graph / social share:**
  - a default share image for `/` and `/projects`: 1200×630, generated with `app/opengraph-image.tsx` (ImageResponse) using the logo mark, "Atelier JK&WA" in the display font, "Japanese Inspired Interior Design", on `paper` with a thin gold rule (or a hero photo half). It must look on-brand.
  - project pages use their cover
  - add `twitter: { card: "summary_large_image" }`
- **`app/sitemap.ts`:** `/`, `/projects`, every published project, `/privacy`, `/terms`. **`app/robots.ts`:** allow everything except `/admin` (it comes in Phase 7). Link to the sitemap.
- **Keep Google out until launch.** The site is deployed on Vercel before the real domain is connected, and that `*.vercel.app` address must not get indexed.
  - Add the env var `ALLOW_INDEXING` (default unset/false; document it in `.env.example`).
  - When it isn't `"true"`, `robots.ts` returns `Disallow: /` for all agents, and the root metadata sets `robots: { index: false, follow: false }`.
  - When it's `"true"`, everything behaves as described above.
  - It gets flipped to `true` only at launch (Phase 8). Mention this in the report.
- **Structured data (JSON-LD):**
  - on `/`: `InteriorDesigner` (subtype of LocalBusiness) with the name, url, logo, image, telephone, email, the full PostalAddress (Singapore, 038987) and `areaServed: "Singapore"`, all built from `getSettings()`
  - on project pages: `BreadcrumbList` (Home › Projects › Title)
  - validate the JSON output (no `undefined` values)
- Headings: exactly one `<h1>` per page (hero title / "Our Projects" / project title). Everything else follows in order.

## 5. Privacy Policy and Terms pages
- Routes `/privacy` and `/terms`, using one shared simple legal layout:
  - a stone intro banner like `/projects`, with the heading only
  - then a readable column (max 720px, Jost 16px/1.8)
  - headings in Cormorant
  - "Last updated" date at the top
- **Content:** write sensible, plain-English **drafts** for a Singapore company:
  - **Privacy:** written with the PDPA in mind. It covers:
    - what's collected (only what visitors send via the Google Form/email/phone; basic analytics only if added later)
    - why
    - third parties: Google Forms/Drive, hosting provider
    - how to contact the company to access or correct data, using the contact details from `getSettings()`
  - **Terms:** website use, content ownership (photos/designs belong to Atelier JK&WA), no guarantee that the "from S$100,000" figure is a quote, external links, Singapore law.
- Put a visible note at the top of both pages: **"Draft — to be reviewed by Atelier JK&WA before launch."** It must be easy to remove later: use a single flag constant, e.g. `LEGAL_DRAFT = true`, in `lib/content/legal.ts`. List this in the report as a launch blocker.

## 6. Accessibility & finishing touches
- A **"Skip to content"** link as the first focusable element, visible on focus, styled on-brand, jumping to `<main id="main">`.
- A consistent visible focus ring across the site: a 2px `gold-deep` outline with 3px offset. Check that it's visible on dark sections too (use white there).
- A styled **global `not-found.tsx`** and **`error.tsx`**, matching the projects not-found page.
- Every icon-only button has a label. Decorative images have empty `alt`. Content images have meaningful `alt`.
- Colour contrast is still ≥ 4.5:1 after any changes.
- Make sure `<html lang="en">` is set and 和 keeps `lang="ja"`.

## 7. Full QA pass
- **Widths:** 360, 375, 414, 768, 1024, 1100, 1280, 1440, 1920 on `/`, `/projects`, a full project and a sparse project, `/privacy`. No horizontal scroll, nothing awkward at 1920 (content stays centred, full-bleed images don't look stretched or blurry; if a photo is too small for 1920, note it).
- **Motion** (production build, 4× CPU throttle), **for every page above**: scroll top → bottom with the mouse wheel (Lenis on) and report long tasks and frame times in the same table format as Phase 4.
- **Reduced motion:** everything is visible immediately, there's no Lenis, and the site is fully usable.
- **Browsers:** Chrome and Edge, plus Firefox if available. Safari can't be tested on Windows, so list anything that might behave differently there (`svh`, `clip-path`, `backdrop-filter`) so the owner can check on an iPhone.
- **Real phone checklist for the owner:** write a short list in the report of what to tap and check on a phone over Wi-Fi.
- `npm run lint` and `npm run build` pass.
- Commit `Phase 5: polish — motion, smooth scroll, performance, SEO, legal, a11y` and push.
- Report in the usual format. **Stop every server you started, including the leftovers on ports 3100–3400 from Phase 2**, and confirm it.
