// The only entry point for site data. Components call these async getters and
// never import Supabase directly. Reads go through the cookie-less public client
// (RLS: published content only) inside "use cache"; the admin panel (Phase 7)
// calls updateTag("settings" | "hero-slides" | "projects" | "project:<slug>")
// on save so edits show immediately.
//
// If Supabase can't be reached, getters log the error and return empty data
// (settings fall back to DEFAULT_SETTINGS), cached for minutes instead of hours
// so the site recovers on its own.
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { DEFAULT_SETTINGS } from "./defaults";
import {
  PROJECT_SELECT,
  toImage,
  toProject,
  toProjects,
  type HeroSlideRow,
  type ProjectRow,
  type SettingsRow,
} from "./rows";
import type { HeroSlide, Project, ProjectCategory, SiteSettings } from "./types";

export type * from "./types";

/** Published projects with their images, by sort order. Throws on failure. */
async function queryPublishedProjects(): Promise<Project[]> {
  const { data, error } = await publicClient()
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return toProjects(data as ProjectRow[]);
}

function logError(getter: string, error: unknown) {
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  console.error(`[data] ${getter} failed, serving fallback data:`, message);
}

// ---------------------------------------------------------------------------
// Getters (names, signatures and return types unchanged since Phase 1/4)
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  try {
    const { data, error } = await publicClient().from("settings").select("*").eq("id", 1).single();
    if (error) throw error;
    const row = data as SettingsRow;
    cacheLife("hours");
    return {
      companyName: row.company_name,
      uen: row.uen,
      contactPerson: row.contact_person,
      addressLines: row.address_lines ?? [],
      phone: row.phone,
      fax: row.fax,
      email: row.email,
      hours: row.hours,
      bookletUrl: row.booklet_url,
      questionnaireUrl: row.questionnaire_url,
      socials: row.socials ?? {},
    };
  } catch (error) {
    logError("getSettings", error);
    cacheLife("minutes");
    return DEFAULT_SETTINGS;
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheTag("hero-slides");
  try {
    const { data, error } = await publicClient()
      .from("hero_slides")
      .select("id, image_path, alt, width, height, sort_order")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    cacheLife("hours");
    return (data as HeroSlideRow[]).map((row) => ({
      id: row.id,
      image: toImage(row),
      sortOrder: row.sort_order,
    }));
  } catch (error) {
    logError("getHeroSlides", error);
    cacheLife("minutes");
    return [];
  }
}

export async function getProjects(category?: ProjectCategory): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  try {
    const projects = await queryPublishedProjects();
    cacheLife("hours");
    return projects.filter((p) => !category || p.category === category);
  } catch (error) {
    logError("getProjects", error);
    cacheLife("minutes");
    return [];
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  try {
    const projects = await queryPublishedProjects();
    cacheLife("hours");
    return projects.filter((p) => p.featured);
  } catch (error) {
    logError("getFeaturedProjects", error);
    cacheLife("minutes");
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag("projects", `project:${slug}`);
  try {
    const { data, error } = await publicClient()
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    cacheLife("hours");
    return data ? toProject(data as ProjectRow) : null;
  } catch (error) {
    logError("getProjectBySlug", error);
    cacheLife("minutes");
    return null;
  }
}

export async function getAllProjectSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("projects");
  try {
    const projects = await queryPublishedProjects();
    cacheLife("hours");
    return projects.map((p) => p.slug);
  } catch (error) {
    logError("getAllProjectSlugs", error);
    cacheLife("minutes");
    return [];
  }
}

/**
 * The next published project by sortOrder, looping back to the first.
 * Null when the slug isn't published or it's the only published project.
 */
export async function getAdjacentProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag("projects", `project:${slug}`);
  try {
    const list = await queryPublishedProjects();
    cacheLife("hours");
    const i = list.findIndex((p) => p.slug === slug);
    if (i === -1 || list.length < 2) return null;
    return list[(i + 1) % list.length];
  } catch (error) {
    logError("getAdjacentProject", error);
    cacheLife("minutes");
    return null;
  }
}
