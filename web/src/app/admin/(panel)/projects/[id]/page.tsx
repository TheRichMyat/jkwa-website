import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/auth";
import { getAdminProject } from "@/lib/admin/queries";
import ProjectEditor from "./ProjectEditor";

export const metadata: Metadata = { title: "Edit project" };

// Admin data, per request (see the panel layout)
export const instant = false;

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const supabase = await requireAdminPage();
  const project = await getAdminProject(supabase, id);
  if (!project) notFound();

  return (
    <>
      <Link
        href="/admin/projects"
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 font-sans text-sm text-gold-deep hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" /> All projects
      </Link>
      {/* Keyed so a different project (or a fresh load) never keeps old form state */}
      <ProjectEditor key={project.id} project={project} />
    </>
  );
}
