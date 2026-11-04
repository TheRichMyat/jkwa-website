import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import { AdminButton } from "@/components/admin/ui";
import { getAdminState } from "@/lib/admin/auth";
import { signOut } from "../_actions/auth";

export const metadata: Metadata = { title: "No access" };

export const instant = false;

export default async function NoAccessPage() {
  const state = await getAdminState();
  if (state.status === "signed-out") redirect("/admin/login");
  if (state.status === "admin") redirect("/admin");

  return (
    <AuthCard title="No admin access">
      <p className="text-center font-sans text-sm leading-relaxed text-body">
        This account doesn&apos;t have admin access
        {state.user.email ? <> ({state.user.email})</> : null}. Please sign out and log in with an
        admin account.
      </p>
      <form action={signOut} className="mt-6">
        <AdminButton type="submit" className="w-full">
          Sign out
        </AdminButton>
      </form>
    </AuthCard>
  );
}
