import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectView from "@/components/project/ProjectView";
import { getAdjacentProject, getAllProjectSlugs, getProjectBySlug } from "@/lib/data";
import { jsonLd, openGraph, SITE_NAME, SITE_URL } from "@/lib/site";

const CATEGORY_LABEL = { residential: "Residential", commercial: "Commercial" } as const;

// The whole page is static (every read is "use cache"d). Requiring that also
// means a slug that wasn't prerendered (a project added later in the admin, or
// an unknown address) is rendered in full before anything is sent, so an
// unknown or unpublished slug gets a real HTTP 404 instead of a streamed
// "soft 404". Next stores the result; the admin's updateTag refreshes it.
export const ensureStatic = "navigation";

// Every published project is prerendered; anything else (unknown or unpublished) 404s
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  // ensureStatic needs at least one entry: with no published projects, a
  // placeholder that simply prerenders as the not-found page
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const description = project.story
    ? truncate(project.story.body.replace(/\s+/g, " "), 155)
    : `${CATEGORY_LABEL[project.category]} interior design project in ${project.location} by ${SITE_NAME}.`;
  const path = `/projects/${project.slug}`;

  return {
    title: project.title,
    description,
    alternates: { canonical: path },
    openGraph: openGraph(path, {
      type: "article",
      title: project.title,
      description,
      images: [{ url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt }],
    }),
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

  // Home › Projects › this project, for search results
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${SITE_URL}/projects/${project.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <ProjectView project={project} next={next} />
    </>
  );
}
