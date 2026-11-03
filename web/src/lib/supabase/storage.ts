import { MEDIA_BUCKET, SUPABASE_URL } from "./env";

/**
 * Public URL of an object in the "media" bucket. The database stores only the
 * path (e.g. "projects/ceylon-road/01.jpg"), so a domain or bucket change is
 * this one line.
 */
export function publicImageUrl(path: string): string {
  const clean = path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${clean}`;
}
