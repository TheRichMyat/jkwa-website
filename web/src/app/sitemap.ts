import type { MetadataRoute } from "next";
import { LEGAL_APPROVED, LEGAL_PAGES } from "@/lib/content/legal";
import { getAllProjectSlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

/**
 * Public pages only (never /admin). Published projects come from the cached
 * getter (tag "projects"), so a project published in the admin appears here
 * without a redeploy. Legal pages are listed once the client has approved them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProjectSlugs();

  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.8 },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(LEGAL_APPROVED
      ? LEGAL_PAGES.map(({ href }) => ({ url: `${SITE_URL}${href}`, changeFrequency: "yearly" as const, priority: 0.2 }))
      : []),
  ];
}
