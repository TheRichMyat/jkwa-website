import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealImage } from "@/components/motion/Reveal";
import type { Project } from "@/lib/data";

const CATEGORY_LABEL = { residential: "Residential", commercial: "Commercial" } as const;

interface ProjectCardProps {
  project: Project;
  /**
   * First row of the grid: above the fold on load, so it loads eagerly (the first
   * card at high priority, it's the LCP) and skips the fade-in.
   */
  eager?: "high" | "auto";
}

/** One project in the /projects grid. The whole card is a single link. */
export default function ProjectCard({ project, eager }: ProjectCardProps) {
  const imageProps = {
    src: project.cover.src,
    alt: "",
    fill: true,
    sizes: "(min-width: 1340px) 392px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw",
    className: "object-cover",
  };
  return (
    <Link href={`/projects/${project.slug}`} className="group block outline-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone outline-offset-4 group-focus-visible:outline-2 group-focus-visible:outline-gold">
        {/* Hover zoom lives on a wrapper: the image's own transform is used by its reveal */}
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none">
          {eager ? (
            <Image {...imageProps} alt="" preload={eager === "high"} loading="eager" fetchPriority={eager} />
          ) : (
            <RevealImage {...imageProps} alt="" />
          )}
        </div>
        <span
          aria-hidden
          className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 ease-[var(--ease-out-soft)] group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <span
          aria-hidden
          className="absolute bottom-4 left-4 inline-flex translate-y-1.5 items-center gap-2 bg-night/85 px-4 py-2 font-sans text-xs tracking-[0.02em] text-white opacity-0 transition-[opacity,translate] duration-300 ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          View Project <ArrowRight className="size-3.5 stroke-[1.5]" />
        </span>
      </div>

      <p className="mt-5 font-sans text-[10.5px] uppercase tracking-[0.24em] text-gold-deep">
        {CATEGORY_LABEL[project.category]}
      </p>
      <h2 className="mt-2 font-display text-[26px] leading-tight text-ink decoration-1 underline-offset-[6px] group-hover:underline group-focus-visible:underline">
        {project.title}
      </h2>
      <p className="mt-3 flex items-center gap-3 font-sans text-[13px] text-muted">
        <span aria-hidden className="h-px w-6 shrink-0 bg-gold" />
        {project.location}
      </p>
    </Link>
  );
}
