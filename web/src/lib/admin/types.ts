// Shapes the admin screens work with (they carry database ids, which the
// public types don't)
import type { ProjectCategory } from "@/lib/data/types";

export type ImageKind = "cover" | "gallery" | "before" | "after";

export interface AdminImage {
  id: string;
  path: string;
  /** Public URL, for thumbnails */
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface AdminProjectSummary {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  published: boolean;
  featured: boolean;
  cover: AdminImage | null;
}

export interface AdminProject extends AdminProjectSummary {
  propertyType: string;
  sizeSqft: number | null;
  duration: string;
  scope: string;
  year: number | null;
  storyHeading: string;
  storyBody: string;
  before: AdminImage | null;
  after: AdminImage | null;
  gallery: AdminImage[];
}

/** The size we record for an upload, after the browser has compressed it */
export interface UploadedImage {
  path: string;
  width: number;
  height: number;
  alt?: string;
}
