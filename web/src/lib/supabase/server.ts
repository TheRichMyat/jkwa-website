import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Cookie-based client for logged-in admin requests (Phase 7), per @supabase/ssr
 * for the App Router. Create a new one per request; never use it inside
 * "use cache" (it reads cookies).
 *
 * Server Components can't set cookies, so setAll is allowed to fail there; the
 * proxy (src/proxy.ts) refreshes the session on every /admin request.
 */
export async function serverClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: the proxy keeps the session fresh instead
        }
      },
    },
  });
}
