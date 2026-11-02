# FIX-01 — Client feedback (Nov 2026)

These are the client's first requested changes. **Item 1 is the client's top priority.** Do all of them in one run, on the `develop` branch.

Phases 1–4 are approved. Don't restyle anything that isn't mentioned here.

---

## 1. Services image looks blurry (TOP PRIORITY)
The old image was only 1024px wide. **A new, sharp image is already in place:** `web/public/images/services/services.jpg`, 1792×2400 (portrait), taken from the client's own photo `PROJECT/01 CEYLON ROAD/04.jpg` (timber shelving and screen joinery). It's already optimised, so don't re-compress it.

- Update `SERVICES` in `lib/placeholder-images.ts`:
  - width 1792, height 2400, `objectPosition: "50% 45%"`
  - alt: "Bespoke timber shelving and lattice screen joinery in a Japanese-inspired home"
- **Make sure it actually renders sharp; the size of the file alone doesn't guarantee that:**
  - The Services `next/image` `sizes` must match the real slot: about `47vw` from 1024px up, `100vw` below.
  - On a 2× screen at 1440px wide, the slot is ~680px wide, so the browser must download a version that's **at least ~1360px wide**. Check this in DevTools → Network on the **deployed develop URL** (Netlify), not just locally, and report the downloaded width.
  - If Next serves a smaller variant, fix `sizes`/`deviceSizes`, and check that `quality` is at least 75.
- Update `images/IMAGE-MAP.md`: Services → `PROJECT/01 CEYLON ROAD/04.jpg`, position `50% 45%`.

## 2. "Our Latest Projects": only Ceylon Road
The client wants **every placeholder project removed** and only their real project shown.

### 2a. Remove the placeholders
- Delete all 10 placeholder projects and the unpublished one from `lib/data/placeholder.ts`.
- Delete the files `web/public/images/projects/placeholder-*.jpg` and `placeholder-before-*.jpg`, and the script `scripts/make-placeholder-befores.mjs`.
- Remove any leftover references (`placeholder-images.ts`, etc.). The build must have no dead imports.

### 2b. Add the real project "Ceylon Road"
The images are **already optimised and in place:** `web/public/images/projects/ceylon-road/ceylon-road-01.jpg` … `-07.jpg`. They come from `PROJECT/01 CEYLON ROAD/`. Read each file's real dimensions:
- 01 and 02 are 1600×898 (landscape)
- 03–07 are 1792×2400 (portrait)

```
slug:      ceylon-road
title:     Ceylon Road
category:  residential        (assumed; the owner will confirm)
location:  Singapore
cover:     ceylon-road-01.jpg   (corridor with full-height timber shelving)
gallery:   02, 07, 03, 04, 05, 06  (in THIS order; the cover is NOT repeated in the gallery)
facts:     {}  (none yet, so the strip shows LOCATION only)
story:     none yet
beforeAfter: none
featured:  true
published: true
sortOrder: 1
```
Write a short, accurate `alt` for every image. Describe what's visible; don't invent facts.

### 2c. Home carousel must show 3 images
With only one project, the carousel would show a single card, but the client wants **3 images, each captioned "Ceylon Road"**. Change how the home Portfolio carousel builds its slides. This is a permanent rule, not a hack:
- Slides = the cover of each featured project, in order.
- **If there are fewer than 3 slides,** top up with gallery images from the featured projects, in gallery order, until there are 3 (or until no images are left).
- Every slide's caption is its project's title + location, it links to that project, and the counter counts slides ("01 / 03").
- With Ceylon Road this gives: cover 01 (corridor with timber shelving, centre), then gallery 02 (dining) and 07 (bedroom). The owner can change which images appear by reordering the gallery in the admin later.
- Once there are 3+ featured projects, behaviour is exactly as before (one cover per project).

### 2d. Gallery layout must respect photo orientation
Real client photos are mostly **portrait**, and the current pattern (Full → Pair → Wide+narrow) crops portraits into thin strips in "Full" rows. Make the row builder orientation-aware. It's still automatic, so the admin never chooses layouts:
- Landscape = width/height ≥ 1.2. Everything else counts as portrait.
- Walk the images in order and build rows:
  - **Landscape → Full row** (as now, ~440px tall)
  - **Two portraits in a row → Pair row**, but **taller for portraits: ~640px on desktop**, so they aren't cropped flat
  - **Landscape + portrait together → Wide + narrow** (the landscape goes in the wide slot)
  - **A single leftover portrait at the end → centred, 50% of the Container width, ~640px tall**
- Tablet scales the heights as before. Mobile stays a single column, but **portrait images show at aspect 4:5** instead of 4:3.
- For Ceylon Road (gallery 02 L, then 07, 03, 04, 05, 06 P) the result should be: Full(02) → Pair(07,03) → Pair(04,05) → centred single (06, the window with the vase, which makes a calm closing image). Check that it looks balanced. If the centred single looks odd, propose an alternative in the report.
- **The lightbox is unchanged.**

### 2e. Other pages with one project
- `/projects`:
  - shows 1 card, "1 Project" (singular)
  - Residential shows it
  - Commercial shows the "New projects coming soon." empty state
  - no Load More button
- The detail page hides the Next Project band (rule from Phase 4).
- Unknown slugs still 404.

## 3. Email address changed
The client's email is now **`wadesign@gmail.com`** (was `kenjisansg@gmail.com`).
- Update it in `lib/data/placeholder.ts` (settings).
- `grep` the whole `web/src` folder for `kenjisansg` and replace any remaining hard-coded copy. It must change in **both** the home Contact section and the Footer "Contact Us" column. `mailto:` links must use the new address too.
- `plan/CONTENT.md` has already been updated.

## 4. Housekeeping
- Add `PROJECT/` to the root `.gitignore`. It's the client's 53MB of original photos and must **not** be committed. The optimised copies in `web/public` are what get committed.

## 5. Check, commit, deploy
- Check at 375, 768, 1440 and 1920:
  - Services image sharp
  - home carousel shows 3 Ceylon Road slides
  - `/projects` with 1 project
  - `/projects/ceylon-road` gallery rows
  - the email in Contact + Footer
- `npm run lint` and `npm run build` pass.
- Commit `Fix-01: client feedback — sharp services image, Ceylon Road project, new email`, push to `develop`, and wait for the Netlify develop deploy. Verify the Services image width there (item 1).
- **Then merge `develop` into `main` and push. This is approved by the owner**, so the client sees the fixes on the live URL.
- Report: what changed, the downloaded Services image width on Netlify, screenshots (home Services + Portfolio at 1440 and 375, `/projects/ceylon-road` at 1440 and 375), and anything you couldn't do. Stop any servers you started.
