// The only entry point for site data. Components call these async getters and
// never import placeholder data or Supabase directly. In Phase 6 the bodies
// switch to Supabase; the cache tags let the admin panel revalidate on save.
import { cacheLife, cacheTag } from "next/cache";
import { placeholderHeroSlides, placeholderProjects, placeholderSettings } from "./placeholder";
import type { HeroSlide, Project, ProjectCategory, SiteSettings } from "./types";

export type * from "./types";

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  return placeholderSettings;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("hero-slides");
  return [...placeholderHeroSlides].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjects(category?: ProjectCategory): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  return placeholderProjects
    .filter((p) => !category || p.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  return placeholderProjects
    .filter((p) => p.featured)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  return placeholderProjects.find((p) => p.slug === slug) ?? null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  return placeholderProjects.map((p) => p.slug);
}
