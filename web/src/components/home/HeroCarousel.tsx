"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import Container from "@/components/ui/Container";
import { useCarousel } from "@/components/ui/carousel/useCarousel";
import type { HeroSlide } from "@/lib/data";

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** The server-rendered text block */
  children: ReactNode;
}

export default function HeroCarousel({ slides, children }: HeroCarouselProps) {
  const { viewportRef, selectedIndex, scrollTo, rootProps } = useCarousel({
    autoplay: 6000,
    fade: true,
  });

  // Keep zooming the outgoing slide while it fades out, so it doesn't snap back
  const [previous, setPrevious] = useState<number | null>(null);
  const [current, setCurrent] = useState(selectedIndex);
  if (current !== selectedIndex) {
    setPrevious(current);
    setCurrent(selectedIndex);
  }

  const count = slides.length;

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Featured interiors"
      className="relative isolate h-[calc(100svh-64px)] min-h-[560px] overflow-hidden bg-night lg:h-[min(calc(100svh-64px),760px)] xl:h-[min(88vh,760px)]"
      {...rootProps}
    >
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== selectedIndex}
              className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                preload={i === 0}
                fetchPriority={i === 0 ? "high" : undefined}
                className={`object-cover ${
                  i === selectedIndex || i === previous
                    ? "motion-safe:animate-[hero-zoom_8s_ease-out_forwards]"
                    : ""
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Readability: bottom-up on phones (text sits low), left-to-right from md */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,15,0.85)_0%,rgba(17,17,15,0.55)_50%,transparent_75%)] md:bg-[linear-gradient(to_right,rgba(17,17,15,0.78)_0%,rgba(17,17,15,0.5)_35%,transparent_65%)]"
      />

      {children}

      {count > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <Container className="flex pb-1 md:pb-6">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === selectedIndex ? "true" : undefined}
                className="group pointer-events-auto flex h-11 min-w-11 items-center pr-3 focus-visible:outline-1 focus-visible:outline-white/70"
              >
                <span
                  className={`block h-px transition-all duration-500 ${
                    i === selectedIndex ? "w-12 bg-white" : "w-6 bg-white/40 group-hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </Container>
        </div>
      )}
    </section>
  );
}
