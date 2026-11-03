import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PROJECT_SELECT, toProject, type ProjectRow } from "./rows";
import type { Project } from "./types";

/**
 * One project for the admin preview, drafts included. Takes the signed-in
 * admin's client (RLS shows drafts to admins only) and is never cached.
 * `project` is null when the project has no cover yet (the page can't render).
 */
export async function getProjectPreview(
  supabase: SupabaseClient,
  id: string,
): Promise<{ project: Project | null; published: boolean } | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data, error } = await supabase.from("projects").select(PROJECT_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProjectRow;
  return { project: toProject(row), published: row.published };
}
