import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cookie-less client with the publishable key, for public reads inside
 * "use cache" functions. It never touches cookies or headers (not allowed in
 * cached functions) and never stores a session, so RLS treats every request
 * as anonymous: only published content is visible.
 */
export function publicClient(): SupabaseClient {
  client ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
