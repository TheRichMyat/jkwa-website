"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface CarouselControlsProps {
  selectedIndex: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  /** Used in the button labels, e.g. "quote" -> "Previous quote" */
  itemLabel: string;
  /** Hide "01 / 05" when the counter is shown elsewhere (the portfolio's active card) */
  hideCounter?: boolean;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const arrowClass =
  "flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors duration-200 hover:border-gold hover:text-gold-deep focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gold [&_svg]:size-[18px] [&_svg]:stroke-[1.25]";

/** Thin ← 01 / 05 → control shared by the quote and portfolio carousels. */
export default function CarouselControls({
  selectedIndex,
  count,
  onPrev,
  onNext,
  itemLabel,
  hideCounter = false,
  className = "",
}: CarouselControlsProps) {
  return (
    <div className={`flex items-center ${hideCounter ? "gap-3" : "gap-5"} ${className}`}>
      <button type="button" onClick={onPrev} className={arrowClass} aria-label={`Previous ${itemLabel}`}>
        <ArrowLeft aria-hidden />
      </button>
      <p
        className={`min-w-[4.5rem] text-center font-sans text-xs tracking-[0.2em] ${
          hideCounter ? "sr-only" : ""
        }`}
      >
        <span className="sr-only">
          {itemLabel} {selectedIndex + 1} of {count}
        </span>
        <span aria-hidden>
          <span className="text-ink">{pad(selectedIndex + 1)}</span>
          <span className="text-muted"> / {pad(count)}</span>
        </span>
      </p>
      <button type="button" onClick={onNext} className={arrowClass} aria-label={`Next ${itemLabel}`}>
        <ArrowRight aria-hidden />
      </button>
    </div>
  );
}
