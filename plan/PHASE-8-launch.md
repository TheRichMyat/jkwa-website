# Phase 8 — Launch (today)

**Goal:** put the finished site (Phases 1–4 + Fix-01 + 6 + 7) live on the client's own domain, with the SEO essentials in place. The full Phase 5 polish (scroll reveals, Lenis, performance pass) moves to **after launch**. Only the launch-critical parts of Phase 5 are done here.

Read first: `plan/HANDOFF.md`, `plan/00-ROADMAP.md`, `plan/PHASE-5-polish.md` §4 (SEO) and §6 (404/error pages) for the detailed rules, and `plan/PHASE-7-REPORT.md`.

Work on `develop` first. Merge to `main` only at step 5.

---

## 1. SEO essentials (from Phase 5 §4, do them now)
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`. Every canonical and Open Graph URL uses it, and nothing is hard-coded.
- Title + description + canonical on `/`, `/projects` and each project. `/projects?type=…` canonicalises to `/projects`.
- **Default share image:** `app/opengraph-image.tsx` (1200×630, on-brand: the logo mark, "Atelier JK&WA", "Japanese Inspired Interior Design"). Project pages use their cover. Set `twitter.card = summary_large_image`.
- **`app/sitemap.ts`:** `/`, `/projects`, and every **published** project, read from Supabase at request/revalidate time so new projects appear without a redeploy. Exclude `/admin`.
- **`app/robots.ts`:** keep `disallow: /admin`, add the sitemap URL, and add the **`ALLOW_INDEXING` switch**.
  - When `ALLOW_INDEXING !== "true"`: `Disallow: /` for everyone, and the root metadata sets `robots: { index: false, follow: false }`.
  - When it's `"true"`: normal indexing.
  - Document it in `.env.example`.
- **JSON-LD:** `InteriorDesigner` on `/`, built from `getSettings()` (name, url, logo, telephone, email, the full Singapore PostalAddress, `areaServed: "Singapore"`). `BreadcrumbList` on project pages. No `undefined` values.
- **Google Search Console verification:** if the env var `GOOGLE_SITE_VERIFICATION` is set, output it via `metadata.verification.google`. Document it in `.env.example`.

## 2. Real 404 + error pages (from Phase 5 §6)
- A global, on-brand **`app/not-found.tsx`** that returns a **real HTTP 404**. **Fix the soft 404** reported in Phase 6 (unknown project URLs returned 200). Check with `curl -I` on the deployed develop URL.
- A styled `app/error.tsx`.

## 3. Privacy & Terms pages (legal: the client must approve)
- Create `/privacy` and `/terms` as specified in Phase 5 §5 (plain-English drafts written for a Singapore company with the PDPA in mind, with the contact details from `getSettings()`).
- **Don't show the word "Draft" on the live site.** Instead, use one flag `LEGAL_APPROVED` in `lib/content/legal.ts`, default `false`.
  - While `false`: the footer **doesn't link** to Privacy/Terms, the pages are `noindex`, and they're left out of the sitemap.
  - When it's switched to `true` (after the client approves the wording): the footer links appear and the pages get indexed.
- Remove the "Sitemap" link from the footer bottom bar if it still points to `/sitemap.xml`. It's a file for Google, not a page for visitors.

## 4. Pre-launch checks on the develop deploy
- **No `#` buttons:** if `bookletUrl` or `questionnaireUrl` in settings is still `#` or empty, **report it as a launch blocker**. The owner/client fills them in via Admin → Settings. Don't hard-code links.
- **Contact details:** they come from Supabase settings, and the email is `wadesign@gmail.com`.
- `npm run lint` and `npm run build` pass. All public pages are still static/cached, and `/admin` still works.
- Lighthouse mobile on `/`, `/projects` and `/projects/ceylon-road` on the develop URL. Report the scores. Don't spend time optimising now; that's Phase 5 after launch.
- Commit `Phase 8: launch essentials — SEO, sitemap, robots switch, 404, legal pages (hidden)` and push to `develop`.

## 5. Go live (only after the owner says "merge")
The owner will:
1. connect the domain in Netlify
2. update the env vars (below)
3. tell you to merge

Then:
- Merge `develop` → `main` and push. This triggers the production deploy.
- **Netlify env vars for the Production context** (the owner sets them; list them in the report):
  - `NEXT_PUBLIC_SITE_URL` = `https://<client-domain>` (the primary domain, no trailing slash)
  - `ALLOW_INDEXING` = `true` **only in Production**. Branch deploys keep it unset, so `develop--jkwa.netlify.app` is never indexed.
  - `GOOGLE_SITE_VERIFICATION` = the code from Search Console (optional; can be added later)
- **Supabase → Authentication → URL Configuration:**
  - Site URL = `https://<client-domain>`
  - add `https://<client-domain>/**` (and the `www` version) to Redirect URLs, so password-reset emails link to the real domain

## 6. After going live: verify and report
On `https://<client-domain>`:
- HTTPS works (a padlock, no certificate warning), and `www` ↔ apex redirects to the primary domain.
- Home, `/projects`, Ceylon Road and `/admin` login all work. An admin save shows on the live site.
- `curl -I https://<client-domain>/does-not-exist` returns 404.
- `/robots.txt` allows indexing and lists the sitemap. `/sitemap.xml` lists the live URLs on the real domain.
- Page source: canonical, `og:url`, `og:image` and JSON-LD all use the real domain.
- `develop--jkwa.netlify.app/robots.txt` still says `Disallow: /`.
- Report: the results, anything failing, and the owner's remaining to-dos:
  - Search Console: submit the sitemap
  - client admin login
  - legal approval → `LEGAL_APPROVED = true`
  - then Phase 5 polish

  Stop any servers you started.
