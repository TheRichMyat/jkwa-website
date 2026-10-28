import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import type { Project } from "@/lib/data";

const CATEGORY_LABEL = { residential: "Residential", commercial: "Commercial" } as const;
// Same on-load entrance as the home hero (skipped under reduced motion)
const delay = (step: number) => ({ animationDelay: `${step * 120}ms` });

export default function ProjectCover({ project }: { project: Project }) {
  return (
    <section
      aria-labelledby="project-title"
      className="relative isolate h-[min(calc(100svh-64px),560px)] overflow-hidden bg-night lg:h-[clamp(420px,64vh,640px)]"
    >
      {/* The cover is the LCP: preload it */}
      <Image
        src={project.cover.src}
        alt={project.cover.alt}
        fill
        sizes="100vw"
        preload
        fetchPriority="high"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,15,0.82)_0%,rgba(17,17,15,0.4)_38%,transparent_68%)] lg:bg-[linear-gradient(to_top,rgba(17,17,15,0.72)_0%,rgba(17,17,15,0.25)_40%,transparent_62%),linear-gradient(to_right,rgba(17,17,15,0.45)_0%,transparent_55%)]"
      />
      <Container className="absolute inset-x-0 bottom-0 pb-10 md:pb-12 lg:pb-14">
        <div className="animate-fade-up" style={delay(0)}>
          <Eyebrow tone="dark" line="before" className="text-white/90">
            {CATEGORY_LABEL[project.category]}
          </Eyebrow>
        </div>
        <h1
          id="project-title"
          className="mt-3 animate-fade-up font-display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] font-normal leading-[1.1] text-white text-balance"
          style={delay(1)}
        >
          {project.title}
        </h1>
        <p className="mt-2 animate-fade-up font-sans text-[15px] text-white/85" style={delay(2)}>
          {project.location}
        </p>
      </Container>
    </section>
  );
}
