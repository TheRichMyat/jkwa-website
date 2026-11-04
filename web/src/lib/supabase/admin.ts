import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Server-only client with the SECRET key: it bypasses every RLS rule.
 * For trusted server code only (e.g. admin actions after checking the user is
 * an admin). Never import it from components or anything that reaches the browser.
 */
export function adminClient(): SupabaseClient {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !secret) {
    throw new Error("Supabase admin client needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
  }
  return createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
