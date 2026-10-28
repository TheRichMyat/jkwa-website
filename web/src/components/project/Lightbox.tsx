"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useCarousel } from "@/components/ui/carousel/useCarousel";
import type { ProjectImage } from "@/lib/data";

interface LightboxProps {
  images: ProjectImage[];
  title: string;
  startIndex: number;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
const buttonClass =
  "flex size-11 items-center justify-center rounded-full text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-1 focus-visible:outline-white/70 [&_svg]:size-5 [&_svg]:stroke-[1.25]";

/**
 * Full-screen gallery viewer. Embla handles swipe; ← → and Esc work; focus is
 * trapped and body scroll locked while open. Only the current image and its
 * neighbours are loaded. Rendered in a portal so no transformed parent
 * (scroll reveals) can affect its fixed positioning.
 */
export default function Lightbox({ images, title, startIndex, onClose }: LightboxProps) {
  const n = images.length;
  const { viewportRef, selectedIndex, scrollPrev, scrollNext } = useCarousel({
    options: { startIndex, loop: n > 1 },
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const actions = useRef({ onClose, scrollPrev, scrollNext });
  useEffect(() => {
    actions.current = { onClose, scrollPrev, scrollNext };
  });

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return actions.current.onClose();
      if (e.key === "ArrowLeft") return actions.current.scrollPrev();
      if (e.key === "ArrowRight") return actions.current.scrollNext();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Current slide and its neighbours (wrapping) get the real image
  const near = (i: number) => {
    const d = Math.abs(i - selectedIndex);
    return d <= 1 || d === n - 1;
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: gallery`}
      className="fixed inset-0 z-[60] flex flex-col bg-night-deep/96 motion-safe:animate-[lightbox-in_250ms_var(--ease-out-soft)]"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6">
        <p className="font-sans text-xs tracking-[0.2em] text-white/70" aria-live="polite">
          <span className="sr-only">Image </span>
          {pad(selectedIndex + 1)} / {pad(n)}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close gallery" className={buttonClass}>
          <X aria-hidden />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={viewportRef} className="h-full overflow-hidden">
          <div className="flex h-full touch-pan-y">
            {images.map((image, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                aria-hidden={i !== selectedIndex}
                className="relative h-full min-w-0 flex-[0_0_100%] px-4 pb-6 md:px-20"
              >
                {near(i) && (
                  <div className="relative h-full w-full">
                    <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous image"
              className={`absolute top-1/2 left-2 -translate-y-1/2 md:left-5 ${buttonClass}`}
            >
              <ArrowLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next image"
              className={`absolute top-1/2 right-2 -translate-y-1/2 md:right-5 ${buttonClass}`}
            >
              <ArrowRight aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
