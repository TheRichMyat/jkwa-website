"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import CarouselControls from "@/components/ui/carousel/CarouselControls";
import { useCarousel } from "@/components/ui/carousel/useCarousel";
import type { Project } from "@/lib/data";

const pad = (n: number) => String(n).padStart(2, "0");
const SIZES = "(min-width: 1024px) 46vw, (min-width: 768px) 88vw, 92vw";

/*
  Tablet/desktop row: every card is absolutely positioned in a slot relative to
  the active card, and `left` + `width` transition together, so cards slide and
  resize in one smooth move. Slot geometry is pure CSS (% of the row):
  lg: narrow | wide (2.4× narrow) | narrow, 14px gaps
      narrow = (100% − 28px) / 4.4, wide = 2.4 × narrow
  md: active 88% − 14px from the left edge, a ≈12% sliver of the next card.
  Classes must be literal strings so Tailwind can find them.
*/
const SLOTS: Record<string, string> = {
  far_left:
    "left-[-200%] md:w-[calc(88%_-_14px)] lg:left-[calc(-1*((100%_-_28px)/4.4_+_14px))] lg:w-[calc((100%_-_28px)/4.4)]",
  left: "md:left-[-88%] md:w-[calc(88%_-_14px)] lg:left-0 lg:w-[calc((100%_-_28px)/4.4)]",
  center:
    "md:left-0 md:w-[calc(88%_-_14px)] lg:left-[calc((100%_-_28px)/4.4_+_14px)] lg:w-[calc((100%_-_28px)*2.4/4.4)]",
  right:
    "md:left-[88%] md:w-[calc(88%_-_14px)] lg:left-[calc((100%_-_28px)*3.4/4.4_+_28px)] lg:w-[calc((100%_-_28px)/4.4)]",
  far_right: "left-[200%] md:w-[calc(88%_-_14px)] lg:left-[calc(100%_+_14px)] lg:w-[calc((100%_-_28px)/4.4)]",
  // Two projects: wide on the left, narrow on the right
  two_active: "md:left-0 md:w-[calc(88%_-_14px)] lg:left-0 lg:w-[calc((100%_-_14px)*2.4/3.4)]",
  two_other:
    "md:left-[88%] md:w-[calc(88%_-_14px)] lg:left-[calc((100%_-_14px)*2.4/3.4_+_14px)] lg:w-[calc((100%_-_14px)/3.4)]",
  single: "left-0 w-full",
};

/** Position of card i relative to the active card, in −⌊n/2⌋…⌊n/2⌋ */
function offsetOf(i: number, active: number, n: number) {
  const o = (((i - active) % n) + n) % n;
  return o > n / 2 ? o - n : o;
}

function slotOf(offset: number, n: number) {
  if (n === 1) return "single";
  if (n === 2) return offset === 0 ? "two_active" : "two_other";
  if (offset <= -2) return "far_left";
  if (offset === -1) return "left";
  if (offset === 0) return "center";
  if (offset === 1) return "right";
  return "far_right";
}

interface PortfolioCarouselProps {
  projects: Project[];
  /** Server-rendered eyebrow + heading; the arrows sit beside it from md */
  header: ReactNode;
}

export default function PortfolioCarousel({ projects, header }: PortfolioCarouselProps) {
  const n = projects.length;

  // `gen` remounts a card that jumps across the row (wrap-around), so it fades
  // in at its new slot instead of flying over the others
  const [{ active, gen }, setState] = useState({ active: 0, gen: projects.map(() => 0) });

  const go = (next: number) =>
    setState((s) => {
      const target = ((next % n) + n) % n;
      return {
        active: target,
        gen: s.gen.map((g, i) =>
          n === 2 || Math.abs(offsetOf(i, target, n) - offsetOf(i, s.active, n)) > 1 ? g + 1 : g,
        ),
      };
    });
  const prev = () => go(active - 1);
  const next = () => go(active + 1);

  // Touch swipe on the tablet/desktop row (phones use Embla below)
  const swipeStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const onPointerDown = (e: PointerEvent) => {
    swiped.current = false;
    swipeStart.current = e.pointerType === "mouse" ? null : e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 40) {
      swiped.current = true;
      if (dx < 0) next();
      else prev();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (n < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  // A side card becomes active on click; only the active card opens its project
  const onCardClick = (e: MouseEvent, i: number) => {
    if (swiped.current) {
      e.preventDefault();
      swiped.current = false;
      return;
    }
    if (i !== active) {
      e.preventDefault();
      go(i);
    }
  };

  // Phones: Embla with momentum swipe and snap, no autoplay (owner prefers user-driven carousels)
  const {
    viewportRef: mobileViewportRef,
    selectedIndex: mobileIndex,
    scrollPrev: mobilePrev,
    scrollNext: mobileNext,
  } = useCarousel({ options: { align: "start" } });

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onKeyDown={onKeyDown}
    >
      <div className="flex items-end justify-between gap-8">
        {header}
        {/* md+: arrows top-right, sitting on a hairline that runs ≈80px to their left */}
        {n > 1 && (
          <div className="hidden shrink-0 border-b border-line pb-3 pl-20 md:block">
            <CarouselControls
              selectedIndex={active}
              count={n}
              onPrev={prev}
              onNext={next}
              itemLabel="project"
              hideCounter
            />
          </div>
        )}
      </div>

      {/* Tablet/desktop */}
      <div className="mt-8 hidden md:block lg:mt-10">
        <p className="sr-only" aria-live="polite">
          {`Project ${active + 1} of ${n}: ${projects[active].title}`}
        </p>

        <div
          className="relative h-[380px] touch-pan-y overflow-hidden lg:h-[320px] xl:h-[360px]"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {projects.map((project, i) => {
            const offset = offsetOf(i, active, n);
            const isActive = offset === 0;
            const visible = n <= 3 || Math.abs(offset) <= 1;
            return (
              <Link
                key={`${project.id}-${gen[i]}`}
                href={`/projects/${project.slug}`}
                onClick={(e) => onCardClick(e, i)}
                tabIndex={visible ? undefined : -1}
                aria-hidden={visible ? undefined : true}
                className={`group absolute inset-y-0 overflow-hidden transition-[left,width] duration-[600ms] ease-[cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none ${gen[i] > 0 ? "motion-safe:animate-[card-in_500ms_ease-out]" : ""} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${SLOTS[slotOf(offset, n)]}`}
              >
                <Image
                  src={project.cover.src}
                  alt=""
                  fill
                  sizes={SIZES}
                  className="object-cover"
                />
                {/* Side cards: a light veil that clears on hover */}
                <span
                  aria-hidden
                  className={`absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:opacity-0 ${
                    isActive ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-black/15 via-45% to-transparent p-6 transition-opacity motion-reduce:transition-none xl:p-7 ${
                    isActive ? "opacity-100 delay-200 duration-500" : "opacity-0 duration-200"
                  }`}
                >
                  <span className="block">
                    <span aria-hidden className="mb-3 block h-px w-10 bg-white/60" />
                    <span className="block font-display text-[22px] leading-tight text-white">
                      {project.title}
                    </span>
                    <span className="mt-1 block font-sans text-xs text-white/80">{project.location}</span>
                  </span>
                  {n > 1 && (
                    <span aria-hidden className="font-sans text-xs tracking-[0.2em] text-white/70">
                      {pad(i + 1)} / {pad(n)}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Phones */}
      <div className="mt-8 md:hidden">
        <div ref={mobileViewportRef} className="overflow-hidden">
          <div className="-ml-3 flex touch-pan-y">
            {projects.map((project, i) => (
              <div
                key={project.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                className={`min-w-0 pl-3 ${n > 1 ? "flex-[0_0_92%]" : "flex-[0_0_100%]"}`}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold"
                >
                  <Image src={project.cover.src} alt="" fill sizes={SIZES} className="object-cover" />
                  <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 via-45% to-transparent p-5">
                    <span className="block">
                      <span className="block font-display text-[22px] leading-tight text-white">
                        {project.title}
                      </span>
                      <span className="mt-1 block font-sans text-xs text-white/80">{project.location}</span>
                    </span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
        {n > 1 && (
          <CarouselControls
            selectedIndex={mobileIndex}
            count={n}
            onPrev={mobilePrev}
            onNext={mobileNext}
            itemLabel="project"
            className="mt-8 justify-center"
          />
        )}
      </div>
    </div>
  );
}
