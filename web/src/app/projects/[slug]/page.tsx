import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BeforeAfterSlider from "@/components/project/BeforeAfterSlider";
import FactsStrip from "@/components/project/FactsStrip";
import NextProjectBand from "@/components/project/NextProjectBand";
import ProjectCover from "@/components/project/ProjectCover";
import ProjectGallery from "@/components/project/ProjectGallery";
import ProjectStory from "@/components/project/ProjectStory";
import { Reveal } from "@/components/motion/Reveal";
import CtaBand from "@/components/sections/CtaBand";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { getAdjacentProject, getAllProjectSlugs, getProjectBySlug } from "@/lib/data";

const CATEGORY_LABEL = { residential: "Residential", commercial: "Commercial" } as const;

// Slugs not known at build time (e.g. projects added later in the admin) may
// block while they render instead of streaming a Suspense fallback. That way an
// unknown or unpublished slug returns a real HTTP 404 from notFound(), not a
// streamed 200. Prerendered project pages are unaffected (still static).
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

  return (
    <>
      <ProjectCover project={project} />
      <FactsStrip project={project} />
      <ProjectStory story={project.story} />

      {project.beforeAfter && (
        <section aria-labelledby="before-after-heading" className="bg-stone py-16 md:py-20 lg:py-24">
          <Container>
            <Reveal>
              <Eyebrow line="before">Transformation</Eyebrow>
              <h2
                id="before-after-heading"
                className="mt-4 font-display text-[clamp(1.875rem,1.4rem+1.5vw,2.75rem)] font-normal leading-[1.15] text-ink"
              >
                Before &amp; After
              </h2>
            </Reveal>
            <Reveal className="mt-8">
              <BeforeAfterSlider images={project.beforeAfter} />
            </Reveal>
          </Container>
        </section>
      )}

      <ProjectGallery images={project.gallery} title={project.title} />
      <CtaBand />
      <NextProjectBand project={next} />
    </>
  );
}
