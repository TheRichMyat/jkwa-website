// Public Supabase settings (safe in the browser). The secret key is read only in
// admin.ts, which is server-only.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** Storage bucket for all editable images (and a future PDF booklet) */
export const MEDIA_BUCKET = "media";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
