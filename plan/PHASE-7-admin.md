# Phase 7 — Admin panel

**Goal:** a private admin panel at `/admin` where the client (and the owner) can manage **projects, hero slides and site settings** without touching code or Supabase. Every change shows on the public site right after saving.

Read first:
- `plan/HANDOFF.md`
- `plan/00-ROADMAP.md`
- `plan/PHASE-6-supabase.md`: schema, RLS, `is_admin()`, the bucket `media`, cache tags
- `web/src/lib/data/` and `web/src/lib/supabase/`
- `web/AGENTS.md`: Next 16. Check the bundled docs for `proxy.ts` (formerly middleware), Server Actions, `updateTag` / `revalidateTag`, and `cacheComponents` rules before using them.

Work on `develop`. **Don't change the public site's design.** The only public-site change allowed is the admin preview in §6.

---

## 0. Owner setup (the owner does these in Supabase; give them these exact steps in your report and wait if needed)
1. **Create the admin user:** Supabase → Authentication → Users → **Add user → Create new user**.
   - Email: `rivenwebdesign.aiautomation@gmail.com`
   - A strong password
   - Tick **Auto Confirm User**
2. **Make that user an admin.** In the SQL Editor, run:
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'rivenwebdesign.aiautomation@gmail.com'
   on conflict (user_id) do nothing;
   ```
   Later, the client's login is added the same way (create the user, then run this SQL with their email). Put this "how to add another admin" note in `plan/ADMIN-GUIDE.md` (see §9).
3. **URL configuration** (for password reset links): Authentication → URL Configuration.
   - **Site URL:** `https://jkwa.netlify.app`
   - **Redirect URLs:** add `http://localhost:3000/**`, `https://develop--jkwa.netlify.app/**`, `https://jkwa.netlify.app/**`

## 1. Packages
- `zod` (validate all form input on the server)
- `browser-image-compression` (resize/compress photos in the browser before upload)
- `@dnd-kit/core` + `@dnd-kit/sortable` (drag to reorder, with keyboard and touch support)

Nothing else unless it's clearly needed. If you add more, explain why in the report.

## 2. Auth & protection
- **Session refresh + guard** in `proxy.ts` (Next 16), using `@supabase/ssr` per its current Next.js docs:
  - only runs for `/admin/:path*`
  - unauthenticated requests to anything under `/admin` except `/admin/login` and `/admin/reset` → redirect to `/admin/login`
- **Double-check on the server.** The admin layout and **every Server Action** must verify both:
  1. there is a logged-in user (`supabase.auth.getUser()`, never just `getSession()`)
  2. `is_admin()` is true

  A logged-in non-admin sees "This account doesn't have admin access" with a sign-out button. Never rely on the proxy alone.
- **`/admin/login`:**
  - email + password
  - a clear error ("Email or password is incorrect"); don't reveal which part was wrong
  - a loading state on the button
  - "Forgot password?" sends `resetPasswordForEmail` with a redirect to `/admin/reset`
- **`/admin/reset`:** set a new password (min 10 characters, confirm field), then go to `/admin`.
- **Sign out** in the admin header.
- **Keep the admin out of search engines and the public site:**
  - every admin page has `robots: { index: false, follow: false }`
  - `/admin` is never linked from the public site
  - `robots.ts`/sitemap already exclude it (or will in Phase 5; check and add the exclusion now if missing)
- Admin pages are dynamic (they read cookies). Make sure that doesn't break `cacheComponents` prerendering of the public pages. Follow the Next 16 docs (Suspense / dynamic boundaries) and keep the **public pages fully static/cached** as before.

## 3. Admin layout & look
- A **separate admin layout** (no public Header/Footer), clean and calm, reusing the site tokens:
  - `paper` background, `ink` text, `gold-deep` primary buttons, `line` borders
  - Jost for UI, Cormorant only for the page titles
- **Top bar:** the logo mark + "JK&WA Admin", the nav (**Dashboard · Projects · Hero Slides · Settings**), "View site ↗" (new tab), and Sign out.
- On mobile the nav collapses into a menu. **The client may edit on a phone, so every admin screen must work well at 375px**, including uploads and reordering.
- **Feedback:**
  - success/error toasts ("Saved", "Couldn't save — please try again")
  - buttons show a loading state and are disabled while saving
  - a **warning before leaving a form with unsaved changes**
- **Plain, friendly wording for a non-technical client:** "Cover photo", "Gallery photos", "Show on home page", "Visible on website". No technical terms like slug, RLS or bucket in visible labels. If the URL field is shown, label it "Page address".

## 4. Dashboard — `/admin`
- Cards:
  - number of projects (published / drafts)
  - number of hero slides
  - **storage used**, e.g. "142 MB of 1 GB". Compute it server-side by summing object sizes in `media` with the admin client. Show it amber above 70% and red above 90%.
- Quick actions: "Add a project", "Edit contact details", "View website ↗".

## 5. Projects

### 5a. List — `/admin/projects`
- One row per project:
  - cover thumbnail, title, location, category
  - badges: **Visible / Draft**, **On home page**
  - an Edit button
- **Drag to reorder.** Order = `sort_order`, which controls the order on `/projects` and the home carousel. It saves automatically after the drop and shows a "Order saved" toast. It also works with the keyboard and on touch.
- "Add project" button.

### 5b. Create / edit — `/admin/projects/new`, `/admin/projects/[id]`
One page with clear sections, in the **same order as the public project page**, so the client understands where things appear:

1. **Basics**
   - Title (required)
   - Category: Residential / Commercial (required)
   - Location (required)
   - Page address: auto-generated from the title; editable; unique; lowercase letters, numbers and hyphens only. Show a live preview: `jkwa.netlify.app/projects/<address>`.
   - Warn when changing it on a visible project: "Old links will stop working."
2. **Cover photo** (required): upload or replace, with a preview and a description (alt) field.
3. **Project facts** (all optional): property type, size (sq ft, number), duration, scope, year. Helper text: "Leave empty to hide."
4. **Story** (optional): heading + text. Helper text: "Press Enter twice to start a new paragraph. Web addresses become links automatically."
   - Plain textarea that grows with the content, plus a character count.
5. **Before & After** (optional): two upload slots side by side. Helper text: "Add both photos to show the slider." Saving with only one of them is blocked, with a clear message.
6. **Gallery photos:**
   - upload many at once (multi-select **and** drag-and-drop on desktop)
   - a thumbnail grid with drag to reorder, a description field per photo, and remove (×)
   - a note: "The website arranges photos automatically. Wide photos fill a row, tall photos sit side by side. Just put them in the order you like."
   - each thumbnail shows a small "Wide"/"Tall" tag, so the client understands the layout
7. **Visibility:**
   - **Visible on website** switch (= `published`; off = draft)
   - **Show on home page** switch (= `featured`)

**Buttons:** **Save** (sticky at the bottom on mobile), **Preview** (§6), and **Delete project**.
- Delete is in a "Danger zone" at the bottom, with a confirm dialog where you type the project title. It deletes the DB rows **and** all the project's files in storage.

**Saving:**
- All writes go through **Server Actions** using the cookie-based Supabase client. RLS enforces `is_admin()`, and the action validates every field with zod.
- After a successful save, update the cache tags so the public site changes immediately: `projects`, `project:<slug>` (both the old and new slug if it changed), plus `hero-slides`/`settings` where relevant. Use the Next 16 API (`updateTag` in Server Actions, per the docs).
- **New project flow:** create the row first (as a draft), then images upload under `media/projects/<project-id>/…`. If the client leaves before saving, a draft with no cover may exist; that's fine, and the list shows it as "Draft — incomplete".

### 5c. Image upload (shared by the cover, before/after, gallery and hero)
- **In the browser, before upload:**
  - fix the orientation (EXIF)
  - resize so the longest side is ≤ 2400px
  - re-encode as JPEG quality ~0.82
  - strip metadata
  - read the final width/height
- **Accepted formats:** JPG, PNG, WebP.
  - **iPhone HEIC:** if the browser can't decode it, show: "This photo format isn't supported. Please export it as JPG and try again."
  - Reject anything over 30MB before compression.
- **Upload directly from the browser to Supabase Storage** with the logged-in session (the storage RLS allows admins). Show **a progress bar per file** and let several upload in parallel (max 3 at a time).
  - Path: `projects/<project-id>/<random-uuid>.jpg`, or `hero/<uuid>.jpg`
  - Then a Server Action records the path, width, height and alt in the DB.
- **No orphan files:** when a photo is removed or replaced, delete the old storage object too. If a DB write fails after an upload, delete the uploaded file.
- Never expose the secret key to the browser.

## 6. Preview drafts
`/admin/projects/[id]/preview` renders the **real public project page component** with that project's data, including when it's a draft. It sits behind admin auth and is never cached, and a thin gold bar at the top says "Preview — not visible to visitors" (or "This project is live" when it's published). Reuse the public components; don't duplicate them.

## 7. Hero slides — `/admin/hero`
- A grid of slides: upload, replace, a description field, drag to reorder, remove.
- **At least 1 slide must remain.** Block deleting the last one with a message.
- Helper text: "Wide landscape photos work best (at least 2000px wide). The first slide loads first."
- After saving, update the tag `hero-slides`.

## 8. Settings — `/admin/settings`
- One form, grouped:
  - **Contact:** contact person, phone, fax, email, opening hours, address (3 lines)
  - **Buttons:** Free Booklet link, Project Questionnaire link, each with a helper text and a **"Test link ↗"** button that opens it in a new tab
  - **Social media:** Instagram, Facebook, Pinterest, LinkedIn, YouTube (empty = icon hidden)
  - **Company:** company name, UEN
- **Validation:** the email format, URLs must start with `https://`, the phone allows `+`, spaces and digits.
- **Google Drive helper:** if the booklet link is a normal Drive "view" link (`/file/d/<id>/view`), show an optional "Convert to direct download link" button that turns it into `https://drive.google.com/uc?export=download&id=<id>`.
- After saving, update the tag `settings`. The footer, contact section and buttons update everywhere.

## 9. Docs for the owner/client — `plan/ADMIN-GUIDE.md`
A short, friendly guide in plain English (with headings, no code except the SQL in the last part):
- how to log in and reset a password
- how to add, edit, reorder, hide and delete a project
- photo tips: wide vs tall, size, order
- how to change hero slides and contact details
- **for the owner only:** how to add another admin (the SQL from §0) and how to remove one

## 10. Check before you finish
- **Security tests.** Run them and report the results:
  - logged out, every `/admin/*` page redirects to login, and calling a Server Action directly is rejected
  - a logged-in **non-admin** user can't read drafts, can't write, and can't upload. Create a temporary test user to prove it, then delete it.
  - the secret key isn't in the client bundle
  - drafts never appear on public pages, in the sitemap, on the home carousel or in Next Project
- **Full flow on the develop deploy:**
  - log in
  - create a test project with a cover, facts, a story, before/after and 5 gallery photos (mixed wide/tall)
  - preview it as a draft
  - publish it and check `/projects`, its page and the home carousel
  - reorder it, unpublish it, delete it
  - **confirm its storage files are gone** and the storage meter went back down
- Change a setting (e.g. the hours) and check the public footer updates without a redeploy. Then change it back.
- Hero: add a slide, reorder, delete it.
- **At 375px**, do one full project edit including the uploads.
- Public pages: Lighthouse scores and static rendering are unchanged from Phase 6 (report the scores).
- `npm run lint` and `npm run build` pass.
- Commit `Phase 7: admin panel — auth, projects, hero slides, settings` and push to **`develop`**. **Don't merge to main.**
- Report:
  - what was built
  - the security test results
  - screenshots of the admin at 1440 and 375 (dashboard, project edit, settings)
  - the owner steps from §0, and whether they're done
  - anything you couldn't do

  Stop any servers you started.
