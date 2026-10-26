# Phase 1 — Foundation

**Goal:** set up everything the sections will sit on: design tokens, fonts, brand assets, the data layer with placeholder data, shared UI pieces, the **Header** and the **Footer**. At the end, the home page shows the real header, empty labelled section placeholders, and the real footer.

Read first: `plan/00-ROADMAP.md`, `plan/DESIGN-SPEC.md`, `plan/CONTENT.md`, and look at `reference/mockup-full.png` (the header strip at the top and the footer at the bottom).

---

## 1. Clean up the create-next-app defaults
- Delete the default SVGs in `web/public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
- Replace the default `page.tsx` content and the Geist font setup.
- Delete `web/src/app/favicon.ico`. The new icons are already provided (see step 3).

## 2. Install
- `lucide-react` (icons). Nothing else in this phase.

## 3. Brand assets (already placed in the repo, just use them)
```
web/public/brand/logo-mark-gold.png    transparent gold circle+WA mark (header, footer)
web/public/brand/logo-mark-white.png   transparent white version (spare, for dark/photo backgrounds)
web/public/brand/logo-full-gold.png    mark + "HARMONY DESIGN" (spare, used later for OG image)
web/public/images/hero/hero-1.jpg      hero slide 1 (1600×893)
web/public/images/hero/hero-2.jpg      hero slide 2 (1600×893)
web/src/app/icon.png                   512px app icon (Next picks it up automatically)
web/src/app/apple-icon.png             180px
web/src/app/favicon.ico                16/32/48
```
More real images (About, Services, Contact, projects) will come later. Until then, use the two hero images as placeholders wherever an image is needed. Keep every image path in the data layer or in one `web/src/lib/placeholder-images.ts` file, so swapping them is a one-line change.

## 4. Design tokens + fonts
- In `globals.css` (Tailwind v4 `@theme`), define every colour token from DESIGN-SPEC (`paper`, `stone`, `ink`, `body`, `muted`, `gold`, `gold-deep`, `gold-light`, `night`, `night-deep`, `line`, `line-dark`) so classes like `bg-paper` and `text-gold` work. Remove the dark-mode block. Set `body` to bg `paper`, colour `body`, font Jost.
- Add `scroll-behavior: smooth` on `html` (disabled under `prefers-reduced-motion`), plus `scroll-padding-top: 88px` so anchor jumps aren't hidden under the sticky header.
- In `layout.tsx`, load the fonts with `next/font/google`: Cormorant Garamond (400, 500, italic 400), Jost (300, 400, 500), Noto Serif JP (400, only for 和). Expose them as CSS variables and map them in `@theme` to `font-display`, `font-sans` and `font-jp`.
- Set `<html lang="en">` and default metadata: title template `%s | Atelier JK&WA`, default title `Atelier JK&WA — Japanese Inspired Interior Design`, and a description taken from the hero sub-text. Full SEO comes in Phase 5.

## 5. Data layer — `web/src/lib/data/`
Create the types and **async** getter functions. They return placeholder data now, and in Phase 6 their bodies switch to Supabase. Check the Next 16 docs on caching with `cacheComponents` and make these work in Server Components without build errors.

```ts
// types.ts
export type ProjectCategory = "residential" | "commercial";
export interface ProjectImage { src: string; alt: string; width: number; height: number; }
export interface Project {
  id: string; slug: string; title: string; location: string;
  category: ProjectCategory; year?: number;
  summary: string;            // 1–2 sentences for cards
  description: string;        // longer text for the detail page (plain paragraphs separated by \n\n)
  cover: ProjectImage; gallery: ProjectImage[];
  featured: boolean;          // shown in the home Portfolio carousel
  sortOrder: number;
}
export interface HeroSlide { id: string; image: ProjectImage; sortOrder: number; }
export interface SiteSettings {
  companyName: string; uen: string; contactPerson: string;
  addressLines: string[]; phone: string; fax: string; email: string; hours: string;
  bookletUrl: string; questionnaireUrl: string;
  socials: { instagram?: string; facebook?: string; pinterest?: string; linkedin?: string; youtube?: string };
}
```
Getters (in `index.ts`):
- `getSettings()`
- `getHeroSlides()`
- `getProjects(category?)`
- `getFeaturedProjects()`
- `getProjectBySlug(slug)`
- `getAllProjectSlugs()`

Placeholder data (in `placeholder.ts`, used only by `index.ts`):
- **Settings:** exactly the "Default settings" block in CONTENT.md. The email must be `kenjisansg@gmail.com`.
- **Hero slides:** the two hero images.
- **Projects:** 6 placeholder projects, 3 of them featured, mixing residential and commercial. Use names like "Private Residence – Tokyo, Japan", "Sentosa Cove Villa – Singapore", "Orchard Condominium – Singapore", "Zen Spa Retreat – Bangkok, Thailand", "Tea House Café – Singapore", "Boutique Office – Singapore". Give them neutral 1–2 sentence summaries and use the hero images. Add a code comment saying they are placeholders.

## 6. Shared UI — `web/src/components/ui/`
- `Container`: max-width + responsive padding per DESIGN-SPEC.
- `Eyebrow`: uppercase label + 40px gold line. Has a `tone` prop (`light`/`dark`) and an `align` prop (`left`/`center`; when centred, put a line on both sides).
- `SectionHeading`: h2 in `font-display`, responsive size with `clamp()`.
- `Button`: renders `<a>` (or Next `<Link>` for internal links), with variants `primary`, `outline`, `outline-dark`, sizes `md`, `sm`, optional `icon` and `trailingArrow`. External links get `target="_blank" rel="noopener noreferrer"`.
- `BookletButton` and `QuestionnaireButton`: small wrappers that take a URL and size and render the right icon and label. They're reused in the header, hero and mobile menu.

## 7. Header — `web/src/components/layout/Header.tsx`
Build it exactly as described in DESIGN-SPEC → Header. Notes:
- A server component fetches `getSettings()` and passes `bookletUrl` / `questionnaireUrl` to a client component (`HeaderClient`) that handles the scroll shadow, the active link and the mobile drawer.
- **Active link while scrolling** on the home page: use an IntersectionObserver on the section ids. On `/projects/*`, PORTFOLIO is active.
- Nav hrefs: on `/` use `#about` etc. On other pages use `/#about`. The logo links to `/`.
- Mobile drawer (< 1024px) per spec, accessible: a `button` with `aria-expanded`/`aria-controls`, Escape closes it, focus moves into the drawer and back, and body scroll is locked.

## 8. Footer — `web/src/components/layout/Footer.tsx`
Build it exactly as described in DESIGN-SPEC → Footer, with the data from `getSettings()`:
- Social icons render only when a URL exists.
- The © year comes from the current date. With `cacheComponents` on, check the docs for how to read the date without breaking prerendering. Rendering the year in a tiny client component is fine.
- Phone is a `tel:` link and email a `mailto:` link.

## 9. Home page skeleton
In `web/src/app/page.tsx`, render `<Header/>`, then six `<section>`s with ids `home`, `about`, `services`, `portfolio`, `contact` (plus a `designers` section between about and services). Each section is an empty placeholder: a centred grey label with the section name and a ~400px min-height, so the nav scrolling can be tested. Then `<Footer/>`.

Put `Header` and `Footer` in the root layout, so the Projects page gets them too.

## 10. Check before you finish
- Compare the header and footer side by side with `reference/mockup-full.png` at 1440px. Spacing, sizes and colours should match closely.
- Test 375 / 768 / 1024 / 1440. The mobile drawer works by keyboard and touch. There's no horizontal scroll at any width.
- `npm run lint` and `npm run build` pass.
- Commit `Phase 1: foundation — tokens, fonts, data layer, header, footer` and push to main.
- Report back: what you built, screenshots if you can take them (header and footer at 1440 and 375), and any question.
