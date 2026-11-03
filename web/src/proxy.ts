import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Pages under /admin that work without a session (login, password reset and
// the email link that leads to it)
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/reset", "/admin/auth/"];

/**
 * Admin only: refreshes the Supabase session cookie on every /admin request
 * (per @supabase/ssr for Next.js) and sends visitors without a session to the
 * login page. This is a convenience, not the security boundary: the admin
 * layouts, every Server Action and RLS all check again.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // getUser() asks Supabase to verify the token (getSession() would trust the cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p));

  if (!user && !isPublic) {
    return redirectKeepingCookies(request, response, "/admin/login");
  }
  if (user && pathname === "/admin/login") {
    return redirectKeepingCookies(request, response, "/admin");
  }
  return response;
}

/** Redirect, carrying over any refreshed session cookies */
function redirectKeepingCookies(request: NextRequest, from: NextResponse, to: string) {
  const redirect = NextResponse.redirect(new URL(to, request.url));
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
