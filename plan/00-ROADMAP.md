# Atelier JK&WA Website — Build Roadmap

Read this file first in every phase. Then read the phase file you were given.

## Project at a glance

- **Client:** Atelier JK&WA Pte. Ltd. (Singapore). Japanese-inspired interior design and Design & Build, for residential and commercial work.
- **Site:** a portfolio website with an admin panel (CMS).
- **Pages:**
  - **Home** (one long page): Hero, About, Designer Quotes, Services, Portfolio, Contact, Footer
  - **Projects:** a list page plus a detail page for each project
- **Stack:**
  - Next.js 16 (App Router, `web/src`), TypeScript, Tailwind CSS v4
  - Supabase (database, auth, storage) for the admin panel
  - Hosting on Vercel. The client already owns the domain.
- **The design source of truth** is `reference/mockup-full.png`. Match it closely. Rules for the parts the mockup doesn't cover are in `plan/DESIGN-SPEC.md`.
- **All website copy** is in `plan/CONTENT.md`. Use that text exactly. Don't invent copy.

## Ground rules (every phase)

1. The app lives in `web/`. Run all npm commands inside `web/`.
2. This is Next.js **16**. Follow `web/AGENTS.md`. Check the bundled docs in `node_modules/next/dist/docs/` before using any API you're unsure of. `cacheComponents` is on in `next.config.ts`.
3. **The page text is fixed in code.** The client edits only these through the admin panel later:
   - projects
   - hero slides
   - booklet and questionnaire links
   - contact details
   - social links
4. **All data goes through `web/src/lib/data/`.** Components never import placeholder data or Supabase directly. They call the async functions there (`getProjects()`, `getSettings()` and so on). In Phase 6 we swap the inside of those functions for Supabase without touching the components.
5. Use `next/image` for every image. Use `next/font` for fonts. Don't add new UI libraries unless the phase file allows it.
6. Build mobile-first and test at 375px, 768px, 1024px and 1440px.
7. At the end of every phase:
   - run `npm run lint` and `npm run build` (both must pass)
   - commit with the message `Phase N: <title>`
   - push to `main`
   - report back: files created/changed, anything you couldn't do, and any question

## Real images — `images/` folder at the project root

The owner drops the client's original photos into `images/` (root, next to `plan/`), named by purpose, e.g. `About image.jpg`, `Services image.jpg`, `Contact image.jpg`, `Hero 3.jpg`, and project folders. **Never use those files directly in the site.** When a phase needs an image:
1. Copy it into `web/public/images/<section>/` with a web-safe name (lowercase, hyphens, no spaces or `&`), e.g. `about.jpg`, `services.jpg`, `contact.jpg`.
2. Resize it so the longest side is at most 2400px, re-save it as JPG quality ~82, and strip the metadata (use `sharp` as a dev script, `web/scripts/optimize-images.mjs`, written the first time it's needed).
3. Point the data layer / `placeholder-images.ts` at the new path, and note in the phase report which original was used for which slot.
4. If a needed image is missing, keep the placeholder and say so in the report. Don't stop the phase.
5. **Portfolio images** are named by number (`1.jpg`, `2.jpg`, `3.jpg`, …). They're temporary stand-ins for the placeholder projects (Phases 3–4). The client replaces them with real projects through the admin panel later, so just spread them across the placeholder projects. Don't try to match them to project names.

The `images/` folder itself is committed to git **only if the total is under ~50MB**. Otherwise add it to `.gitignore` and mention that in the report.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 0 | Project setup (Next.js, git, GitHub) | ✅ Done |
| 1 | Foundation: design tokens, fonts, assets, data layer, Header, Footer | ✅ Done (approved) |
| 2 | Hero carousel, About, Designer Quotes | ✅ Done (approved) |
| 3 | Services, Portfolio carousel, Contact | ✅ Done (approved) |
| 4 | Projects list + project detail (mockups in `reference/`), data model for admin | ⏳ Next |
| 5 | Polish: site-wide scroll reveals + smooth scrolling (see Motion standards), responsive QA, SEO, Privacy/Terms pages, accessibility | |
| 6 | Supabase: tables, storage, security rules, connect the data layer | |
| 7 | Admin panel: login, projects, hero slides, settings | |
| 8 | Launch: keep-alive ping, Vercel deploy, domain, Search Console | |

Phases 1–5 are the front end, built with placeholder data. Phases 6–8 are the backend and launch.
