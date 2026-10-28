import type { Metadata } from "next";
import { Suspense } from "react";
import WaKanji from "@/components/brand/WaKanji";
import { Reveal } from "@/components/motion/Reveal";
import ProjectsBrowser, { ProjectsView } from "@/components/projects/ProjectsBrowser";
import CtaBand from "@/components/sections/CtaBand";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { getProjects } from "@/lib/data";

const INTRO =
  "We believe in the power of natural light, proportion, texture and craftsmanship to create timeless spaces.";

export const metadata: Metadata = {
  title: "Our Projects",
  description: INTRO,
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <section aria-labelledby="projects-heading" className="bg-stone py-12 md:py-14 lg:py-16">
        <Container className="flex items-center justify-between gap-10">
          <Reveal>
            <Eyebrow line="before">Portfolio</Eyebrow>
            <h1
              id="projects-heading"
              className="mt-4 font-display text-[clamp(2.5rem,1.9rem+2vw,3.5rem)] font-normal leading-[1.1] text-ink"
            >
              Our Projects
            </h1>
            <p className="mt-5 max-w-[470px] font-sans text-[15px] font-light leading-[1.7] text-body md:text-base">
              {INTRO}
            </p>
          </Reveal>
          {/* Decorative 和 with a gold rule (WA craft rules: SVG only, aria-hidden, lang="ja") */}
          <div aria-hidden className="mr-2 hidden shrink-0 items-center gap-10 md:flex lg:mr-6">
            <span className="h-24 w-px bg-gold" />
            <span lang="ja" className="text-gold">
              <WaKanji className="h-20" />
            </span>
          </div>
        </Container>
      </section>

      <div className="bg-paper">
        <Suspense fallback={<ProjectsView projects={projects} filter="all" />}>
          <ProjectsBrowser projects={projects} />
        </Suspense>
      </div>

      <CtaBand />
    </>
  );
}
