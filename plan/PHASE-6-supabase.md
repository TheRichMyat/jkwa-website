# Phase 6 — Supabase: database, storage, security, live data

**Goal:** move all admin-editable data (settings, hero slides, projects and their images) from `placeholder.ts` into Supabase, and switch the data layer to read from it. **The website must look and behave exactly the same afterwards.** No visual changes. Phase 7 builds the admin panel on top of this.

Read first: `plan/00-ROADMAP.md`, `web/src/lib/data/` (types, getters, placeholder), and `web/AGENTS.md` (Next 16, `cacheComponents` is on).

Work on `develop`. Phases 1–4 and Fix-01 are approved.

---

## 0. Before you start: the owner has already done this
- Created a Supabase project (region **Singapore**).
- Put the keys in `web/.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
  SUPABASE_SECRET_KEY=sb_secret_...
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```
  If the owner's project only shows the legacy `anon` / `service_role` keys, those go in the same two variables. The code must not care which kind it is.
- Added the same variables to Netlify (Site configuration → Environment variables).
- Turned **off** public sign-ups in Supabase Auth.

**Check that these variables exist before writing any code.** If any are missing, stop and tell the owner exactly which ones.

Update `web/.env.example` to the variable names above, plus `ALLOW_INDEXING=` for later, with a comment saying the secret key is **server-only** and must never be used in client code.

## 1. Packages
- Install `@supabase/supabase-js` and `@supabase/ssr` (needed for admin auth in Phase 7).
- Add `server-only` and import it in every file that uses the secret key.

## 2. Database schema — `supabase/migrations/0001_init.sql` (repo root)
Write one idempotent SQL migration (safe to run twice: `if not exists`, `create or replace`, `drop policy if exists`).

**Tables:**
```
settings          (single row, id = 1, check id = 1)
  company_name, uen, contact_person, address_lines text[], phone, fax, email, hours,
  booklet_url, questionnaire_url, socials jsonb default '{}', updated_at timestamptz

hero_slides
  id uuid pk default gen_random_uuid(), image_path text not null, alt text not null default '',
  width int not null, height int not null, sort_order int not null default 0, created_at

projects
  id uuid pk, slug text unique not null, title text not null,
  category text not null check (category in ('residential','commercial')),
  location text not null,
  property_type text, size_sqft int check (size_sqft > 0), duration text, scope text,
  year int check (year between 1950 and 2100),
  story_heading text, story_body text,
  featured bool not null default false, published bool not null default false,
  sort_order int not null default 0, created_at, updated_at

project_images
  id uuid pk, project_id uuid not null references projects on delete cascade,
  kind text not null check (kind in ('cover','gallery','before','after')),
  image_path text not null, alt text not null default '', width int not null, height int not null,
  sort_order int not null default 0, created_at
  -- at most ONE cover, ONE before and ONE after per project (partial unique index on (project_id, kind) where kind <> 'gallery')

admins
  user_id uuid pk references auth.users on delete cascade, email text not null, created_at
```
- `updated_at` triggers on `settings` and `projects`.
- Indexes:
  - `projects(published, sort_order)`
  - `projects(featured) where published`
  - `project_images(project_id, kind, sort_order)`
- `image_path` stores the **storage path only** (e.g. `projects/ceylon-road/01.jpg`), never a full URL. The data layer builds URLs, so a future domain or bucket change is a one-line edit.

**Security (RLS on every table):**
- A `public.is_admin()` function: `security definer`, `set search_path = ''`, `stable`. It returns true when `auth.uid()` is in `admins`.
- **Anyone** (the `anon` + `authenticated` roles) can `select`:
  - `settings` and `hero_slides`
  - `projects` **where `published = true`**
  - `project_images` whose parent project is published
- **Admins** (`is_admin()`) can do everything on all tables, including unpublished projects.
- `admins` table: only admins can read it. **Nobody can insert into it from the API**, because admins are added by SQL only (Phase 7 explains how).

**Storage** (in the same migration):
- A bucket `media`, **public read**, with a file size limit of 10MB and allowed mime types `image/jpeg`, `image/png`, `image/webp`, `image/avif`, plus `application/pdf` (for a future booklet upload).
- Policies on `storage.objects` for bucket `media`: public `select`, and admin-only `insert`/`update`/`delete`.

**Running it:** you can't run SQL on the owner's project directly. Print a short instruction: Supabase dashboard → **SQL Editor** → New query → paste the whole file → Run. Then **wait for the owner to confirm it ran without errors** before continuing to step 4.

## 3. Supabase clients — `web/src/lib/supabase/`
- `public.ts`: a cookie-less client using the publishable key, for public reads inside `"use cache"` functions. It must **not** read cookies or headers (which isn't allowed inside cached functions), and it uses `auth: { persistSession: false }`.
- `admin.ts`: a server-only client with the secret key, for the seed script and trusted server code. Never imported by components.
- `server.ts`: an `@supabase/ssr` cookie-based client for logged-in admin requests (Phase 7 uses it). Create it now, following the current `@supabase/ssr` docs for the Next.js App Router.
- `storage.ts`: `publicImageUrl(path)` builds the public URL for an object in `media`.

## 4. Seed script — `web/scripts/seed-supabase.mjs`
A one-off, re-runnable script (`npm run seed`) using the secret key from `.env.local`. It must be idempotent: upsert by slug/path, and skip uploads that already exist.
1. **Settings:** insert row 1 from the current `placeholderSettings` (email `wadesign@gmail.com`).
2. **Hero slides:** upload `public/images/hero/hero-1.jpg` and `hero-2.jpg` to `media/hero/`, then insert 2 rows with their alt text and dimensions.
3. **Ceylon Road:** upload `public/images/projects/ceylon-road/ceylon-road-01…07.jpg` to `media/projects/ceylon-road/`. Insert the project, with the same fields as `placeholder.ts` (featured, published, sort_order 1). Insert `project_images`: 01 as `cover`, then the gallery in the **same order as now** (02, 07, 03, 04, 05, 06), with the alt text from `placeholder.ts`.
4. Print a summary of the counts.

Run it once after the owner confirms the migration.

## 5. Switch the data layer — `web/src/lib/data/index.ts`
- Keep **every getter's name, signature and return type exactly the same.** Components must not change.
- Each getter queries Supabase through `lib/supabase/public.ts` and maps rows to the existing types:
  - `image_path` becomes a full URL with `publicImageUrl`
  - `cover` / `gallery` (by `sort_order`) / `beforeAfter` (only if both before and after exist)
  - `facts` (omit null fields)
  - `story` (only if `story_body` isn't empty)
- Keep `"use cache"`, `cacheLife("hours")` and the existing `cacheTag`s (`settings`, `hero-slides`, `projects`). Phase 7 calls `revalidateTag` on save, so edits show immediately. Also add a per-project tag `project:<slug>`.
- **Fetch efficiently:** one query for projects with their images (`select('*, project_images(*)')`), not one query per project.
- **If Supabase is unreachable,** the getters log the error and return empty data (`[]` / `null`) rather than crashing the page. `getSettings()` falls back to the hard-coded defaults, so the contact details never disappear.
- **Delete `placeholder.ts`** and anything only it used. Keep `placeholder-images.ts` for the fixed page images (About, Services, Contact), which stay in `/public` because the client doesn't edit them.
- `next.config.ts`: add the Supabase storage host to `images.remotePatterns` (only the `/storage/v1/object/public/media/**` path). It works on Netlify too, because the adapter reads `remotePatterns`.

## 6. Keep the free Supabase project awake
Free projects pause after 7 days without activity, and a quiet site might not call Supabase for a week.
- Add `.github/workflows/supabase-keepalive.yml`: a scheduled GitHub Action that runs **daily** and once on manual trigger (`workflow_dispatch`). It does one tiny read (`GET {SUPABASE_URL}/rest/v1/settings?select=id&limit=1` with the publishable key headers) and fails loudly if the response isn't 200.
- It uses the repo secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Tell the owner how to add them (GitHub repo → Settings → Secrets and variables → Actions).
- This costs no Netlify credits.

## 7. Check before you finish
- `npm run build` **with** the env vars: all pages prerender, and `/projects/ceylon-road` is generated.
- **Visual check:** the home page, `/projects` and `/projects/ceylon-road` look identical to before. Compare screenshots before and after at 1440 and 375.
- **Security checks.** Run them with the **publishable** key, from a small script or curl, and report the results:
  - reading `projects` returns only published rows (temporarily set Ceylon Road to `published=false` in the dashboard, check that it disappears, then set it back)
  - inserting/updating/deleting any table is **denied**
  - uploading to `media` is **denied**
  - reading `admins` returns nothing
- `grep` the client bundle (`.next/static`) for the secret key value and `SUPABASE_SECRET_KEY`. There must be **no matches**.
- `npm run lint` and `npm run build` pass.
- Commit `Phase 6: Supabase — schema, storage, RLS, seed, live data layer` and push to `develop`. Check that the Netlify develop deploy works with the env vars, and say so in the report. **Don't merge to main.**
- Report:
  - what was built
  - the security check results
  - the exact owner actions still needed (GitHub secrets, etc.)
  - storage used so far (MB)
  - anything you couldn't do

  Stop any servers you started.
