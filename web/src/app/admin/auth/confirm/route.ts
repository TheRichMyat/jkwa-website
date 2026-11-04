import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";

/**
 * Where the password-reset email lands. Swaps the one-time code for a session
 * cookie, then continues to `next` (admin pages only). Handles both the default
 * email link (?code=) and a token_hash link, in case the email template changes.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nextParam = searchParams.get("next") ?? "/admin";
  const next = nextParam.startsWith("/admin") ? nextParam : "/admin";

  const supabase = await serverClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = new URL(ok ? next : "/admin/reset?expired=1", request.url);
  return NextResponse.redirect(target, { headers: { "Cache-Control": "private, no-store" } });
}
