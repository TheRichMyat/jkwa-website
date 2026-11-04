import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { ProjectCategory } from "@/lib/data/types";
import type { AdminImage, AdminProject, AdminProjectSummary, ImageKind } from "./types";

// Admin reads use the signed-in admin's client, so RLS lets drafts through.
// Never cached: the admin always sees the latest data.

interface ImageRow {
  id: string;
  kind: ImageKind;
  image_path: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
}

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  published: boolean;
  featured: boolean;
  property_type: string | null;
  size_sqft: number | null;
  duration: string | null;
  scope: string | null;
  year: number | null;
  story_heading: string | null;
  story_body: string | null;
  project_images: ImageRow[] | null;
}

const IMAGES = "project_images(id, kind, image_path, alt, width, height, sort_order)";

export const toAdminImage = (row: Omit<ImageRow, "kind" | "sort_order">): AdminImage => ({
  id: row.id,
  path: row.image_path,
  url: publicImageUrl(row.image_path),
  alt: row.alt,
  width: row.width,
  height: row.height,
});

function images(row: ProjectRow, kind: ImageKind) {
  return (row.project_images ?? [])
    .filter((img) => img.kind === kind)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toAdminImage);
}

function toSummary(row: ProjectRow): AdminProjectSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    published: row.published,
    featured: row.featured,
    cover: images(row, "cover")[0] ?? null,
  };
}

export async function getAdminProjects(supabase: SupabaseClient): Promise<AdminProjectSummary[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(`id, slug, title, location, category, published, featured, ${IMAGES}`)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data as ProjectRow[]).map(toSummary);
}

export async function getAdminProject(supabase: SupabaseClient, id: string): Promise<AdminProject | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data, error } = await supabase.from("projects").select(`*, ${IMAGES}`).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProjectRow;
  return {
    ...toSummary(row),
    propertyType: row.property_type ?? "",
    sizeSqft: row.size_sqft,
    duration: row.duration ?? "",
    scope: row.scope ?? "",
    year: row.year,
    storyHeading: row.story_heading ?? "",
    storyBody: row.story_body ?? "",
    before: images(row, "before")[0] ?? null,
    after: images(row, "after")[0] ?? null,
    gallery: images(row, "gallery"),
  };
}

export async function getAdminHeroSlides(supabase: SupabaseClient): Promise<AdminImage[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image_path, alt, width, height")
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data as Omit<ImageRow, "kind" | "sort_order">[]).map(toAdminImage);
}
