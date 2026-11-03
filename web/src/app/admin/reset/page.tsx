import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import AuthCard from "@/components/admin/AuthCard";
import { buttonClass } from "@/components/admin/ui";
import { serverClient } from "@/lib/supabase/server";
import ResetForm from "./ResetForm";

export const metadata: Metadata = { title: "Set a new password" };

// Reads the session from the reset link, per request
export const instant = false;

export default async function ResetPage({ searchParams }: PageProps<"/admin/reset">) {
  const { expired } = await searchParams;
  await connection();
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (expired || !user) {
    return (
      <AuthCard title="Link expired">
        <p className="text-center font-sans text-sm leading-relaxed text-body">
          This reset link has expired or was already used. Links work only once, in the same browser
          where you asked for them. Please request a new one.
        </p>
        <Link href="/admin/login" className={buttonClass("primary", "mt-6 w-full")}>
          Back to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password">
      <ResetForm email={user.email ?? ""} />
    </AuthCard>
  );
}
