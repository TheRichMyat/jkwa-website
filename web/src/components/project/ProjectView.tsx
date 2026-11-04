import BeforeAfterSlider from "./BeforeAfterSlider";
import FactsStrip from "./FactsStrip";
import NextProjectBand from "./NextProjectBand";
import ProjectCover from "./ProjectCover";
import ProjectGallery from "./ProjectGallery";
import ProjectStory from "./ProjectStory";
import { Reveal } from "@/components/motion/Reveal";
import CtaBand from "@/components/sections/CtaBand";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import type { Project } from "@/lib/data";

/**
 * The whole project page below the header. Used by the public page and by the
 * admin's draft preview, so the preview is exactly what visitors will see.
 */
export default function ProjectView({ project, next }: { project: Project; next: Project | null }) {
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
