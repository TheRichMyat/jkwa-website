import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectView from "@/components/project/ProjectView";
import { getAdjacentProject, getAllProjectSlugs, getProjectBySlug } from "@/lib/data";

const CATEGORY_LABEL = { residential: "Residential", commercial: "Commercial" } as const;

// Slugs not known at build time (e.g. projects added later in the admin) are
// rendered on request. Since Phase 6 the lookup goes to Supabase, so Next serves
// the prerendered page shell first: an unknown or unpublished slug shows the
// not-found page with a noindex tag, but with HTTP status 200 ("soft 404"; see
// the notFound() docs). A true 404 would need a Proxy lookup on every project
// view, which isn't worth the cost. Prerendered project pages are unaffected.
export const instant = false;

// Every published project is prerendered; anything else (unknown or unpublished) 404s
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const description = project.story
    ? truncate(project.story.body.replace(/\s+/g, " "), 155)
    : `${CATEGORY_LABEL[project.category]} interior design project in ${project.location} by Atelier JK&WA.`;

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      images: [{ url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt }],
    },
  };
}

/** Cut at a word boundary, ~max characters, with an ellipsis */
function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const next = await getAdjacentProject(slug);

  return <ProjectView project={project} next={next} />;
}
