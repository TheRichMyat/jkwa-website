import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonClass, PageTitle } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import { getAdminProjects } from "@/lib/admin/queries";
import ProjectList from "./ProjectList";

export const metadata: Metadata = { title: "Projects" };

// Admin data, per request (see the panel layout)
export const instant = false;

export default async function ProjectsAdminPage() {
  const supabase = await requireAdminPage();
  const projects = await getAdminProjects(supabase);

  return (
    <>
      <PageTitle
        actions={
          <Link href="/admin/projects/new" className={buttonClass("primary")}>
            <Plus aria-hidden className="size-4" /> Add project
          </Link>
        }
      >
        Projects
      </PageTitle>
      {projects.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line bg-white p-8 text-center font-sans text-body">
          No projects yet. Add your first one.
        </p>
      ) : (
        <>
          <p className="mb-4 font-sans text-sm text-muted">
            Drag the handle to change the order. This is the order on the Projects page and the home
            page. It saves automatically.
          </p>
          <ProjectList initial={projects} />
        </>
      )}
    </>
  );
}
