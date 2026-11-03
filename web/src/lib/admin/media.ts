import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/supabase/admin";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/**
 * Paths the browser may ask us to record: only fresh uploads in the right
 * folder (projects/<project-id>/<uuid>.jpg or hero/<uuid>.jpg), never an
 * arbitrary existing file.
 */
export function isUploadPath(path: string, folder: string) {
  const escaped = folder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}/${UUID}\\.jpg$`).test(path);
}

/** True when the object really is in storage (the upload finished) */
export async function objectExists(supabase: SupabaseClient, path: string) {
  const slash = path.lastIndexOf("/");
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(path.slice(0, slash), { search: path.slice(slash + 1), limit: 1 });
  return !error && data.some((o) => o.name === path.slice(slash + 1));
}

/** Delete files; logs instead of throwing (a leftover file is not worth failing a save) */
export async function removeObjects(supabase: SupabaseClient, paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(unique);
  if (error) console.error("[admin] Couldn't delete storage files:", unique, error.message);
}

interface Listed {
  path: string;
  size: number;
}

/** Every file under a folder, recursively (folders come back with id = null) */
export async function listAll(supabase: SupabaseClient, folder: string): Promise<Listed[]> {
  const files: Listed[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    for (const item of data) {
      const path = folder ? `${folder}/${item.name}` : item.name;
      if (item.id === null) files.push(...(await listAll(supabase, path)));
      else files.push({ path, size: Number(item.metadata?.size ?? 0) });
    }
    if (data.length < pageSize) break;
  }
  return files;
}

/** Total bytes stored in the media bucket (secret-key client: sees everything) */
export async function storageUsedBytes(): Promise<number> {
  const files = await listAll(adminClient(), "");
  return files.reduce((sum, f) => sum + f.size, 0);
}
