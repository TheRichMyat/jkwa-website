import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NotAdminError, requireAdmin } from "./auth";
import { NOT_ADMIN, SAVE_FAILED, type ActionResult } from "./result";

/** A message the admin should see as-is (validation, "add both photos"…) */
export class UserError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

/**
 * Wraps the body of an admin Server Action: checks the caller is a signed-in
 * admin (getUser + is_admin), runs it with their RLS-bound client, and turns
 * any failure into a friendly ActionResult instead of a thrown error.
 */
export async function asAdmin<T>(
  name: string,
  run: (supabase: SupabaseClient) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const supabase = await requireAdmin();
    return { ok: true, data: await run(supabase) };
  } catch (error) {
    if (error instanceof NotAdminError) return { ok: false, error: NOT_ADMIN };
    if (error instanceof UserError) return { ok: false, error: error.message, fieldErrors: error.fieldErrors };
    console.error(`[admin] ${name} failed:`, error instanceof Error ? error.message : error);
    return { ok: false, error: SAVE_FAILED };
  }
}

/** Throw the Supabase error (if any) so asAdmin reports "Couldn't save" */
export function check<T extends { error: { message: string } | null }>(result: T): T {
  if (result.error) throw new Error(result.error.message);
  return result;
}

/** For .single() queries: the row, or throw (error or no row) */
export function row<R extends { data: unknown; error: { message: string } | null }>(
  result: R,
): NonNullable<R["data"]> {
  if (result.error) throw new Error(result.error.message);
  if (result.data == null) throw new Error("No row returned");
  return result.data as NonNullable<R["data"]>;
}
