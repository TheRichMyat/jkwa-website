import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import type { Project } from "@/lib/data";

/** Full-bleed link to the next project. Hidden when there's no other published project. */
export default function NextProjectBand({ project }: { project: Project | null }) {
  if (!project) return null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block h-[220px] overflow-hidden bg-night outline-offset-[-4px] focus-visible:outline-2 focus-visible:outline-gold lg:h-[280px]"
    >
      <span className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04] motion-reduce:transition-none">
        <Image src={project.cover.src} alt="" fill sizes="100vw" className="object-cover" />
      </span>
      <span aria-hidden className="absolute inset-0 bg-black/45" />
      <Container className="absolute inset-x-0 bottom-0 pb-8 lg:pb-10">
        <Eyebrow tone="dark" line="before" className="text-white/90">
          Next Project
        </Eyebrow>
        <p className="mt-3 flex items-center gap-3 font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] leading-tight text-white">
          {project.title}
          <ArrowRight
            aria-hidden
            className="size-7 shrink-0 stroke-[1] transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1.5"
          />
        </p>
      </Container>
    </Link>
  );
}
