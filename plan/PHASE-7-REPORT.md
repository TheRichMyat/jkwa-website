# Phase 7 report — Admin panel

**Date:** 3 Nov 2026 · **Branch:** `develop` (commit `25476da`) · **Not merged to `main`**
**Admin URL (test):** https://develop--jkwa.netlify.app/admin

## Summary

The admin panel is built, tested and live on the develop deploy. The owner (`rivenwebdesign.aiautomation@gmail.com`) can log in. Lint and build pass, and the public pages are still fully static.

## What was built

| Area | What it does |
|---|---|
| Login | Email + password; "Email or password is incorrect" (never says which); forgot password → email link → set a new password (min 10 characters); sign out |
| Protection | `proxy.ts` refreshes the session and redirects anyone not logged in to the login page. Every admin page and every Server Action re-checks the user (`getUser()`) and `is_admin()`. A logged-in non-admin sees "This account doesn't have admin access" |
| Dashboard | Project counts (visible / drafts), hero slide count, storage meter ("x MB of 1 GB", amber > 70%, red > 90%), quick actions |
| Projects list | Cover thumbnail, title, location, category, Visible / Draft / Draft — incomplete / On home page badges. Drag to reorder (mouse, touch, keyboard), saves automatically |
| Project editor | Sections in the same order as the public page: Basics (with "Page address" and an old-links warning), Cover, Facts, Story (auto-growing, character count), Before & After (saving with only one is blocked), Gallery (multi-upload, drag-and-drop, reorder, descriptions, Wide/Tall tags), Visibility switches. Sticky Save bar, Preview, Danger zone (type the title to delete; removes DB rows and every storage file) |
| Photo upload | In the browser: orientation fixed, resized to ≤ 2400px, JPEG ~0.82, metadata stripped; HEIC message if unsupported; 30 MB limit. Uploaded straight to Supabase Storage with a progress bar per file, 3 at a time, recorded in selection order. Replaced or removed photos delete their old file; a failed save deletes the uploaded file (no orphans) |
| Draft preview | `/admin/projects/[id]/preview` renders the real public page (`ProjectView`, shared with `/projects/[slug]`) with a gold "Preview — not visible to visitors" / "This project is live" bar |
| Hero slides | Upload, replace, describe, reorder, remove; the last slide can't be removed |
| Settings | Contact, address (3 lines), Booklet / Questionnaire links with "Test link ↗" and the Google Drive "convert to direct download" helper, social links, company / UEN. Validation: email format, `https://` links, phone digits / spaces / `+` |
| Live updates | Every save calls `updateTag` (`projects`, `project:<slug>` old + new, `hero-slides`, `settings`), so the public site changes without a redeploy |
| Feedback | Toasts ("Saved", "Couldn't save — please try again"), loading buttons, focus jumps to the first invalid field, warning before leaving with unsaved changes |
| SEO | Every admin page is `noindex, nofollow`; new `app/robots.ts` disallows `/admin`; `/admin` is not linked from the public site |
| Docs | `plan/ADMIN-GUIDE.md`: plain-English guide for the client, plus how to add or remove an admin |

## Security tests (all passed)

| Test | Result |
|---|---|
| Logged out → every `/admin/*` page | 307 redirect to `/admin/login` (localhost and develop deploy) |
| Logged out → Server Action called directly | Never runs: the proxy redirects, other routes ignore unknown actions |
| Non-admin → all 10 Server Actions called directly | All refused ("…this account isn't an admin") |
| Non-admin → straight to Supabase (bypassing the app) | 11/11 blocked: read drafts, read draft photos, read `admins`, insert / update projects, update settings, delete hero slides, make self admin, upload a file, delete a file |
| Secret key in the browser bundle | Not found in any of the 27 client files (only the publishable key) |
| Drafts on public pages | Not on `/projects`, the home carousel or Next Project; the project URL returns 404 (no sitemap yet, Phase 5) |

Temporary test users (one admin, one non-admin) were created for these tests and deleted afterwards.

## Full flow test

Run on localhost against the same Supabase database, because the owner's login didn't exist yet. The owner has since logged in on the develop deploy.

- **Test project:** created with a cover (a 4000×2600 PNG became a 2400px JPEG), facts, a story with a link, before/after, and 5 gallery photos (3 wide, 2 tall). Previewed as a draft, then published. It appeared on `/projects`, its own page and the home carousel. Reordered, unpublished (gone everywhere), then deleted. All 9 files were removed and storage went from 3.91 MB back to 3.44 MB.
- **Settings:** changing the opening hours updated the footer and contact section right away; changed back.
- **Hero:** added a slide, moved it to first (the home page followed), then deleted it.
- **At 375px:** replaced a cover, added a gallery photo, edited a field and saved. No sideways scrolling.

## Lighthouse (mobile, develop deploy)

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 94 | 100 | 96 | 100 | 1.9 s | 0 |
| `/projects` | 89 | 100 | 96 | 100 | 2.9 s | 0 |
| `/projects/ceylon-road` | 93 | 100 | 96 | 100 | 2.4 s | 0 |

There are no Phase 6 scores on record to compare against. Static rendering is unchanged: `/`, `/projects` and `/projects/ceylon-road` are still prerendered.

## Owner steps (§0)

| Step | Status |
|---|---|
| Admin user created in project `jkwa` | ✅ |
| Added to `admins` | ✅ (needed a second run of the SQL; the first run happened before the user existed, so it inserted 0 rows) |
| URL Configuration (Site URL + Redirect URLs) | Set by the owner; not verified (no access to that setting) |

## Changes beyond the plan

- **Extra package:** `@dnd-kit/utilities`, needed by the drag-to-reorder code.
- **`.gitignore`:** `PROJECT/` changed to `/PROJECT/`. On Windows the old rule also matched `web/src/components/project/`, so new files there were silently not committed.
- **Root layout:** the public header and footer now hide on `/admin` (except the preview page). Same look on the public site.
- **Data layer:** the project page body moved into `components/project/ProjectView.tsx`, and the row mappers into `lib/data/rows.ts`, so the preview reuses them.
- **Ceylon Road:** its `sort_order` is now 2 (from the reorder test). It's the only project, so nothing visible changes.

## Not done / open

1. **Password-reset email not tested end to end** (there was no real inbox). The link works only in the same browser that requested it; the guide says so.
2. **The client has no login yet.** See below.
3. **The live site (`main`) doesn't use the admin yet.** Production still runs the FIX-01 code without Supabase. Until `develop` is merged to `main`, admin changes show only on https://develop--jkwa.netlify.app.

## Can the client log in now?

Not yet. Two things are needed:

1. **Give them their own login** (don't share the owner's): Supabase → Authentication → Users → Add user (their email, a temporary password, Auto Confirm), then run the SQL from `plan/ADMIN-GUIDE.md` with their email. Ask them to use "Forgot password?" to choose their own password.
2. **Decide which site they edit.** Today they'd edit at https://develop--jkwa.netlify.app/admin, and changes show only on the develop site. For changes to reach https://jkwa.netlify.app, `develop` must be merged to `main`. That's the owner's call (it uses Netlify credits); it could wait for Phase 5 polish, or happen now if the client needs to start adding projects.

Send the client `plan/ADMIN-GUIDE.md` with their login.
