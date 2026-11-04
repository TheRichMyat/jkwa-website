// Site-wide settings that come from the environment (set per Netlify context).
// Both are read at build time, so changing them needs a redeploy.
import type { Metadata } from "next";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/** The site's own address, no trailing slash. Every canonical, Open Graph and sitemap URL uses it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

/**
 * Search engines may index the site only when ALLOW_INDEXING is "true".
 * Set it in Netlify's Production context only, so the develop branch deploy
 * and localhost are never indexed.
 */
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";

export const SITE_NAME = "Atelier JK&WA";
export const SITE_TAGLINE = "Japanese Inspired Interior Design";
export const SITE_DESCRIPTION =
  "Blending traditional values with modern living, we create spaces that bring balance, beauty and a sense of peace to your everyday life.";

/**
 * Open Graph for a page. Next replaces (doesn't merge) a parent's openGraph,
 * so every page builds the whole object here. The share image comes from
 * app/opengraph-image.tsx unless `images` is given (project covers).
 */
export function openGraph(path: string, extra: Partial<OpenGraph> = {}): OpenGraph {
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_SG",
    url: path,
    ...extra,
  };
}

/** JSON for a <script type="application/ld+json">, safe to inline in HTML */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
