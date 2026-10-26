"use client";

import CarouselControls from "@/components/ui/carousel/CarouselControls";
import { useCarousel } from "@/components/ui/carousel/useCarousel";
import type { DesignerQuote } from "@/lib/content/designers";

export default function QuoteCarousel({ quotes }: { quotes: DesignerQuote[] }) {
  const { viewportRef, selectedIndex, isPlaying, scrollPrev, scrollNext, rootProps } = useCarousel({
    autoplay: 8000,
    fade: true,
  });

  return (
    <div aria-roledescription="carousel" aria-label="Designer quotes" {...rootProps}>
      {/* Slides share one flex row, so the stage is always as tall as the longest quote */}
      <div
        ref={viewportRef}
        aria-live={isPlaying ? "off" : "polite"}
        className="mx-auto max-w-[680px] overflow-hidden"
      >
        <div className="flex touch-pan-y">
          {quotes.map((q, i) => (
            <div
              key={q.role}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${quotes.length}`}
              aria-hidden={i !== selectedIndex}
              className="flex min-w-0 flex-[0_0_100%] flex-col items-center px-1 text-center"
            >
              <span
                aria-hidden
                className="block h-14 font-display text-8xl leading-[0.9] text-gold-light select-none"
              >
                “
              </span>
              {/* Upright, 500 and a ~70-character line: the italic 26px version was hard to read (owner) */}
              <blockquote className="font-display text-[19px] font-medium leading-[1.65] text-ink md:text-[22px]">
                <p>{q.quote}</p>
              </blockquote>
              <div className="mt-7">
                <cite className="font-sans text-xs uppercase not-italic tracking-[0.2em] text-gold-deep">
                  {q.role}
                </cite>
                {q.note && <p className="mt-2 font-sans text-[13px] text-muted">{q.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CarouselControls
        selectedIndex={selectedIndex}
        count={quotes.length}
        onPrev={scrollPrev}
        onNext={scrollNext}
        itemLabel="quote"
        className="mt-10 justify-center md:mt-12"
      />
    </div>
  );
}
