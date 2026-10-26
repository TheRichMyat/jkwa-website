"use client";

import CarouselControls from "@/components/ui/carousel/CarouselControls";
import { useCarousel } from "@/components/ui/carousel/useCarousel";
import type { DesignerQuote } from "@/lib/content/designers";

// Owner feedback: the quotes must be easy to read. So: body font (Jost) at
// 17–18px, left-aligned in a ~65-character column, and no autoplay, so a quote
// only changes when the visitor asks for the next one.
export default function QuoteCarousel({ quotes }: { quotes: DesignerQuote[] }) {
  const { viewportRef, selectedIndex, scrollPrev, scrollNext } = useCarousel({ fade: true });

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Designer quotes"
      className="mx-auto max-w-[640px]"
    >
      {/* Slides share one flex row, so the stage is always as tall as the longest quote */}
      <div ref={viewportRef} aria-live="polite" className="overflow-hidden">
        <div className="flex touch-pan-y">
          {quotes.map((q, i) => (
            <div
              key={q.role}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${quotes.length}`}
              aria-hidden={i !== selectedIndex}
              className="min-w-0 flex-[0_0_100%] pr-1"
            >
              <span
                aria-hidden
                className="-ml-1 block h-12 font-display text-8xl leading-[0.9] text-gold-light select-none"
              >
                “
              </span>
              <blockquote className="font-sans text-[17px] font-normal leading-[1.8] text-ink md:text-lg">
                <p>{q.quote}</p>
              </blockquote>
              <div className="mt-6">
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
        className="mt-10"
      />
    </div>
  );
}
