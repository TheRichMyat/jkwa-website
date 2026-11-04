import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { serverClient } from "@/lib/supabase/server";

export type AdminState =
  | { status: "signed-out" }
  | { status: "not-admin"; user: User }
  | { status: "admin"; user: User; supabase: SupabaseClient };

/**
 * Who is making this request. getUser() verifies the token with Supabase
 * (never getSession(), which trusts the cookie), then is_admin() checks the
 * admins table. Cached per request, so the layout and page share one check.
 */
export const getAdminState = cache(async (): Promise<AdminState> => {
  // Request time only (the session check reads the clock, which can't be prerendered)
  await connection();
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { status: "not-admin", user };
  return { status: "admin", user, supabase };
});

/** For admin pages: the admin's Supabase client, or off to the login page */
export async function requireAdminPage(): Promise<SupabaseClient> {
  const state = await getAdminState();
  if (state.status === "signed-out") redirect("/admin/login");
  if (state.status === "not-admin") redirect("/admin/no-access");
  return state.supabase;
}

export class NotAdminError extends Error {
  constructor() {
    super("Not signed in as an admin");
  }
}

/**
 * For Server Actions: they can be called directly (not only from our forms),
 * so every action checks for itself. Throws NotAdminError otherwise.
 */
export async function requireAdmin(): Promise<SupabaseClient> {
  const state = await getAdminState();
  if (state.status !== "admin") throw new NotAdminError();
  return state.supabase;
}
