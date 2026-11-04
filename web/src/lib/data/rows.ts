// Database row shapes and their mapping to the site's types. Shared by the
// cached public getters (index.ts) and the admin draft preview (preview.ts).
import { publicImageUrl } from "@/lib/supabase/storage";
import type {
  BeforeAfter,
  ProjectCategory,
  ProjectFacts,
  ProjectImage,
  Project,
  SiteSettings,
} from "./types";

export interface SettingsRow {
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

export interface ImageRow {
  image_path: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
}

export interface HeroSlideRow extends ImageRow {
  id: string;
}

export interface ProjectImageRow extends ImageRow {
  kind: "cover" | "gallery" | "before" | "after";
}

export interface ProjectRow {
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
export const PROJECT_SELECT = "*, project_images(image_path, alt, width, height, sort_order, kind)";

export const toImage = (row: ImageRow): ProjectImage => ({
  src: publicImageUrl(row.image_path),
  alt: row.alt,
  width: row.width,
  height: row.height,
});

const text = (value: string | null) => (value && value.trim() ? value.trim() : undefined);

export function toProject(row: ProjectRow): Project | null {
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

export const toProjects = (rows: ProjectRow[]) =>
  rows.map(toProject).filter((p): p is Project => p !== null);
