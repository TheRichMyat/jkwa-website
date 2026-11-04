# HANDOFF — read this first in any new session

Last updated: 4 Nov 2026 (Phase 8 steps 1–4, merged to main). This file is the single "where are we" summary for the Atelier JK&WA website. Any new session (Claude Code or a Claude chat) should read this file, then `plan/00-ROADMAP.md`, before doing anything.

## The project in one paragraph
A portfolio website + admin panel for **Atelier JK&WA Pte. Ltd.** (Singapore, Japanese-inspired interior design / Design & Build). The owner (the developer) builds it **phase by phase**: a Claude chat writes the phase plan files in `plan/`, Claude Code implements them, and the owner reviews each phase and sends the report back. Desktop design must match the mockups in `reference/` closely. Mobile must feel professional. Motion must be calm and smooth (see DESIGN-SPEC → "Motion & scrolling — standards").

## Where things live
| What | Where |
|---|---|
| Project folder | `C:\Users\User\OneDrive\Desktop\JKWA-website` |
| App code | `web/` (Next.js 16.4, App Router, `src/`, TypeScript, Tailwind v4, `cacheComponents` on) |
| Plans / specs | `plan/` (ROADMAP, DESIGN-SPEC, CONTENT, PHASE-1…6, FIX-01, this file) |
| Design mockups | `reference/` (`mockup-full.png` = home, `projects-list-mockup.png`, `project-detail-mockup.png`) |
| Client's original photos | `PROJECT/` (git-ignored, 53MB). `images/` = older placeholders + `IMAGE-MAP.md` |
| GitHub | `TheRichMyat/jkwa-website` (private) |
| Branches | **`develop`** = all work. **`main`** = production; merge only when the owner says so (each deploy uses ~2 of the 300 monthly build minutes) |
| Hosting | **Netlify Free (Legacy plan: 100 GB bandwidth, 300 build minutes/month, no credits)**, project `jkwa`. Production: https://jkwa.netlify.app (main). Test: https://develop--jkwa.netlify.app (develop branch deploy). `netlify.toml` at the repo root (base `web`, publish `.next`, Node 20). "Powered by Netlify" badge turned off. |
| Database | **Supabase**, project `jkwa`, region **Singapore (ap-southeast-1)**, in its **own organization** (separate quota from the owner's other client, Wide-Eleven). URL: `https://lrlocmkmvrnomoawgpfl.supabase.co`. Public sign-ups **OFF**. |
| Env vars | `web/.env.local` (git-ignored) and Netlify: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (only this one is marked secret in Netlify), `NEXT_PUBLIC_SITE_URL`, plus from Phase 8 `ALLOW_INDEXING` (`true` in Production only) and optional `GOOGLE_SITE_VERIFICATION`. **Never paste key values into chat or commit them.** |

## Status
| Phase | Status |
|---|---|
| 0 Setup · 1 Foundation · 2 Hero/About/Quotes · 3 Services/Portfolio/Contact · 4 Projects list + detail | ✅ done, approved |
| FIX-01 client feedback (sharp Services image, Ceylon Road only, email → wadesign@gmail.com) | ✅ done, **live on main** |
| 6 Supabase (schema, storage bucket `media`, RLS, seed, data layer, keep-alive workflow) | ✅ done, merged to main |
| 7 Admin panel (login, projects, hero slides, settings) at `/admin` | ✅ done, merged to main. Guide: `plan/ADMIN-GUIDE.md` |
| **8 Launch** (`PHASE-8-launch.md`) | Steps 1–4 ✅ (SEO, sitemap, robots switch, real 404, legal pages hidden) and **merged to main**. ⏳ Owner: connect the domain + Production env vars (§5), then step 6 verification |
| 5 Polish (scroll reveals, Lenis, performance, a11y; its SEO/404/legal parts were done in Phase 8) | after launch |

## Key decisions (don't undo)
- **Content:** page text is fixed in code. The admin edits only: projects, hero slides, settings (contact details, booklet + questionnaire links, socials).
- **Data:** all data goes through `web/src/lib/data/` getters. Components never touch Supabase directly. Cache tags: `settings`, `hero-slides`, `projects`, `project:<slug>` (the admin must `revalidateTag` on save).
- **Project model:**
  - required: title, category (residential/commercial), location, cover
  - optional: facts (property type, size sq ft, duration, scope, year), story (heading + plain-text body), before/after pair, gallery
  - flags: featured, published, sortOrder
  - **empty = hidden** on the page
  - text is plain text only, URLs auto-linked, no HTML
- **Images:** stored in Supabase Storage bucket `media`. The DB stores **paths only**, not URLs.
- **Gallery layout:** automatic and orientation-aware (landscape → full row, portraits → pairs / centred single). The admin only orders the photos.
- **Home portfolio carousel:** one cover per featured project. If there are fewer than 3, it tops up with gallery images.
- **Design decisions already approved:**
  - quotes: Jost 18px, left-aligned, no autoplay
  - contrast-darkened tokens: `muted #726C63`, `gold-deep #88673F`
  - hero keeps its crossfade under reduced motion
  - 和 is an SVG (`WaKanji`), never a font
  - two-row header at 1024–1279px
  - testimonial section was dropped by the client
- **Admin security:**
  - only users listed in the `admins` table (added by SQL) can write
  - the secret key is server-only
  - RLS is on every table

## Open items / waiting on
1. **Owner:** add GitHub repo secrets `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` (for the daily keep-alive Action). Check if done.
2. **Admin logins:** the owner (`rivenwebdesign.aiautomation@gmail.com`) is set up and working. **The client has no login yet**: add it the same way (`plan/ADMIN-GUIDE.md`, last section). Until `develop` is merged to `main`, admin edits show only on develop--jkwa.netlify.app.
3. **Client:**
   - booklet Google Drive link and questionnaire Google Form link (currently `#`)
   - opening hours (placeholder)
   - social links
   - confirm Ceylon Road is residential
   - real facts/story for Ceylon Road
4. **Client:** confirm the other `PROJECT/` folders (ANOTHER, APROZ, PR-01, 文藝春秋) are their own work before publishing (some look like other brands' photos).
5. **Launch blockers in content:** the Booklet and Questionnaire links are still `#` (Admin → Settings).
6. **Legal:** `/privacy` and `/terms` are drafts, hidden until the client approves them. Then set `LEGAL_APPROVED = true` in `web/src/lib/content/legal.ts` and deploy (footer links + indexing + sitemap switch on).
7. **Hosting:** the Netlify team is on the **Legacy Free** plan (no credits): 100 GB bandwidth and 300 build minutes a month. Admin edits don't trigger builds. Turn on usage notifications.

## How to resume
**In a new Claude Code session**, paste:
```
Read plan/HANDOFF.md first, then plan/00-ROADMAP.md. Summarise the current status in 5 lines and wait for my next instruction. Work on the develop branch.
```
**In a new Claude chat** (planning), attach or paste this file and say: "Continue the JK&WA website from this handoff."
