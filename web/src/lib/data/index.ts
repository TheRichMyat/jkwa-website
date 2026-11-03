// The only entry point for site data. Components call these async getters and
// never import Supabase directly. Reads go through the cookie-less public client
// (RLS: published content only) inside "use cache"; the admin panel (Phase 7)
// calls revalidateTag("settings" | "hero-slides" | "projects" | "project:<slug>")
// on save so edits show immediately.
//
// If Supabase can't be reached, getters log the error and return empty data
// (settings fall back to DEFAULT_SETTINGS), cached for minutes instead of hours
// so the site recovers on its own.
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { publicImageUrl } from "@/lib/supabase/storage";
import { DEFAULT_SETTINGS } from "./defaults";
import type {
  BeforeAfter,
  HeroSlide,
  Project,
  ProjectCategory,
  ProjectFacts,
  ProjectImage,
  SiteSettings,
} from "./types";

export type * from "./types";

// ---------------------------------------------------------------------------
// Row shapes (as stored in Postgres) and mapping to the site's types
// ---------------------------------------------------------------------------

interface SettingsRow {
  company_name: string;
  uen: string;
  contact_person: string;
  address_lines: string[];
  phone: string;
  fax: string;
  email: string;
  hours: string;
  booklet_url: string;
  questionnaire_url: string;
  socials: SiteSettings["socials"] | null;
}

interface ImageRow {
  image_path: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
}

interface HeroSlideRow extends ImageRow {
  id: string;
}

interface ProjectImageRow extends ImageRow {
  kind: "cover" | "gallery" | "before" | "after";
}

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  location: string;
  property_type: string | null;
  size_sqft: number | null;
  duration: string | null;
  scope: string | null;
  year: number | null;
  story_heading: string | null;
  story_body: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  project_images: ProjectImageRow[] | null;
}

// One query for projects with all their images (no per-project round trips)
const PROJECT_SELECT = "*, project_images(image_path, alt, width, height, sort_order, kind)";

const toImage = (row: ImageRow): ProjectImage => ({
  src: publicImageUrl(row.image_path),
  alt: row.alt,
  width: row.width,
  height: row.height,
});

const text = (value: string | null) => (value && value.trim() ? value.trim() : undefined);

function toProject(row: ProjectRow): Project | null {
  const images = [...(row.project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const one = (kind: ProjectImageRow["kind"]) => images.find((img) => img.kind === kind);

  const cover = one("cover");
  if (!cover) {
    console.error(`[data] Project "${row.slug}" has no cover image; it is hidden until one is added`);
    return null;
  }

  // Facts: only the fields that have a value
  const facts: ProjectFacts = {};
  if (text(row.property_type)) facts.propertyType = text(row.property_type);
  if (row.size_sqft) facts.sizeSqft = row.size_sqft;
  if (text(row.duration)) facts.duration = text(row.duration);
  if (text(row.scope)) facts.scope = text(row.scope);
  if (row.year) facts.year = row.year;

  const before = one("before");
  const after = one("after");
  const beforeAfter: BeforeAfter | undefined =
    before && after ? { before: toImage(before), after: toImage(after) } : undefined;

  const body = text(row.story_body);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    location: row.location,
    cover: toImage(cover),
    facts,
    story: body ? { heading: text(row.story_heading), body } : undefined,
    beforeAfter,
    gallery: images.filter((img) => img.kind === "gallery").map(toImage),
    featured: row.featured,
    published: row.published,
    sortOrder: row.sort_order,
  };
}

const toProjects = (rows: ProjectRow[]) =>
  rows.map(toProject).filter((p): p is Project => p !== null);

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
