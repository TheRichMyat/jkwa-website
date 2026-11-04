import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectView from "@/components/project/ProjectView";
import { requireAdminPage } from "@/lib/admin/auth";
import { getAdjacentProject } from "@/lib/data";
import { getProjectPreview } from "@/lib/data/preview";

export const metadata: Metadata = { title: "Preview" };

// Admin only, per request, never cached
export const instant = false;

/** The real public project page, for a draft or a live project, with a notice bar on top */
export default async function ProjectPreviewPage({ params }: PageProps<"/admin/projects/[id]/preview">) {
  const { id } = await params;
  const supabase = await requireAdminPage();
  const preview = await getProjectPreview(supabase, id);
  if (!preview) notFound();
  const { project, published } = preview;

  const next = project && published ? await getAdjacentProject(project.slug) : null;

  return (
    <>
      <div
        role="status"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-gold-deep px-4 py-2 text-center font-sans text-[13px] text-white"
      >
        <span>{published ? "This project is live" : "Preview — not visible to visitors"}</span>
        <Link href={`/admin/projects/${id}`} className="underline underline-offset-2 hover:text-white/80">
          Back to editing
        </Link>
      </div>
      {project ? (
        <ProjectView project={project} next={next} />
      ) : (
        <p className="mx-auto max-w-md px-4 py-24 text-center font-sans text-body">
          Add a cover photo to see the preview.
        </p>
      )}
    </>
  );
}
