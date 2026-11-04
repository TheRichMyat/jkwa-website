import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import Toaster from "@/components/admin/Toaster";
import { getAdminState } from "@/lib/admin/auth";

// Reads the session cookie on every request, so it can't be prerendered: let
// it block on the server (the public pages stay static; this is admin only)
export const instant = false;

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const state = await getAdminState();
  if (state.status === "signed-out") redirect("/admin/login");
  if (state.status === "not-admin") redirect("/admin/no-access");

  return (
    <Toaster>
      <div className="min-h-screen bg-paper">
        <AdminHeader email={state.user.email ?? ""} />
        <div className="mx-auto max-w-[1240px] px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16">{children}</div>
      </div>
    </Toaster>
  );
}
