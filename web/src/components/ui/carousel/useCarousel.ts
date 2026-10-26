"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import type { EmblaOptionsType } from "embla-carousel";
import { useReducedMotion } from "./useReducedMotion";

interface CarouselConfig {
  /** Autoplay delay in ms; omit for no autoplay */
  autoplay?: number;
  /** Crossfade between slides instead of sliding */
  fade?: boolean;
  /**
   * Under reduced motion, keep the crossfade and autoplay instead of stopping.
   * A fade has no movement across the screen (owner's choice for the hero).
   */
  fadeWhenReducedMotion?: boolean;
  options?: EmblaOptionsType;
}

/**
 * Shared Embla setup for every carousel on the site: prev/next, the selected
 * index, autoplay that pauses while the pointer or keyboard focus is inside
 * `rootProps`, and reduced motion (no autoplay, no fade, instant jumps, unless
 * `fadeWhenReducedMotion`). The autoplay plugin itself pauses while the tab is hidden.
 */
export function useCarousel({
  autoplay,
  fade = false,
  fadeWhenReducedMotion = false,
  options,
}: CarouselConfig = {}) {
  const reducedMotion = useReducedMotion();
  // Reduced motion and no exception: no plugins, and navigation jumps instantly
  const still = reducedMotion && !(fade && fadeWhenReducedMotion);

  const plugins = useMemo(() => {
    if (still) return [];
    return [
      ...(fade ? [Fade()] : []),
      ...(autoplay ? [Autoplay({ delay: autoplay, stopOnInteraction: false })] : []),
    ];
  }, [still, fade, autoplay]);

  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, ...options }, plugins);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const hovered = useRef(false);
  const focused = useRef(false);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setSlideCount(emblaApi.scrollSnapList().length);
      setIsPlaying(emblaApi.plugins().autoplay?.isPlaying() ?? false);
    };
    const onPlay = () => setIsPlaying(true);
    const onStop = () => setIsPlaying(false);
    sync();
    emblaApi
      .on("select", sync)
      .on("reInit", sync)
      .on("autoplay:play", onPlay)
      .on("autoplay:stop", onStop);
    return () => {
      emblaApi
        .off("select", sync)
        .off("reInit", sync)
        .off("autoplay:play", onPlay)
        .off("autoplay:stop", onStop);
    };
  }, [emblaApi]);

  const pause = useCallback(() => emblaApi?.plugins().autoplay?.stop(), [emblaApi]);
  const resume = useCallback(() => {
    if (!hovered.current && !focused.current) emblaApi?.plugins().autoplay?.play();
  }, [emblaApi]);

  // Manual navigation restarts the autoplay countdown
  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index, still);
      emblaApi?.plugins().autoplay?.reset();
    },
    [emblaApi, still],
  );
  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev(still);
    emblaApi?.plugins().autoplay?.reset();
  }, [emblaApi, still]);
  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext(still);
    emblaApi?.plugins().autoplay?.reset();
  }, [emblaApi, still]);

  /** Spread on the element that should pause autoplay on hover or focus */
  const rootProps = {
    onMouseEnter: () => {
      hovered.current = true;
      pause();
    },
    onMouseLeave: () => {
      hovered.current = false;
      resume();
    },
    onFocus: () => {
      focused.current = true;
      pause();
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      focused.current = false;
      resume();
    },
  };

  return {
    viewportRef,
    selectedIndex,
    slideCount,
    isPlaying,
    reducedMotion,
    scrollTo,
    scrollPrev,
    scrollNext,
    rootProps,
  };
}
