import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site";

// Until ALLOW_INDEXING is "true" (Production only), nothing may be crawled, so
// the develop deploy and localhost never end up in search results. The admin
// panel is never crawled either way.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: ALLOW_INDEXING
      ? { userAgent: "*", allow: "/", disallow: "/admin" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
