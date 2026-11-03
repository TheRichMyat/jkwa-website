import type { MetadataRoute } from "next";

// The admin panel is never crawled. Phase 5 adds the sitemap and the
// ALLOW_INDEXING switch here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
  };
}
