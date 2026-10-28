"use client";

import Image, { type ImageProps } from "next/image";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type SyntheticEvent,
} from "react";

/*
  Scroll reveals, per DESIGN-SPEC "Motion & scrolling — standards" §3–4.
  - Server HTML is fully visible (works without JS, good for SEO/LCP).
  - After hydration, blocks below the fold are set to "pending" (hidden, 24px
    down) and revealed once by an IntersectionObserver; they never re-animate.
  - Blocks already in view on page load stay as they are (no waiting). Blocks
    that mount later in view (e.g. "Load More") reveal in place.
  - Reduced motion: nothing is hidden. State lives in a data attribute set on
    the DOM node, so revealing never re-renders React.
*/

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -8% 0px",
};
const STAGGER_MS = 80;
const MAX_STAGGER = 6;
// Mounts within this window after the JS loads count as "page load"
const PAGE_LOAD_WINDOW_MS = 1000;
const bootTime = typeof performance !== "undefined" ? performance.now() : 0;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function inViewport(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.92 && r.bottom > 0;
}

/**
 * Reveal `el` once it enters the viewport; returns a cleanup. (will-change
 * comes from the "pending" CSS rule, so it goes away as soon as it's shown.)
 */
function revealOnce(el: HTMLElement) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      observer.disconnect();
      el.dataset.reveal = "shown";
    }
  }, OBSERVER_OPTIONS);
  observer.observe(el);
  return () => observer.disconnect();
}

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Position in a grid; staggers by 80ms, capped at 6 */
  index?: number;
  className?: string;
}

export function Reveal({ children, as: Tag = "div", index = 0, className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const pageLoad = performance.now() - bootTime < PAGE_LOAD_WINDOW_MS;
    if (pageLoad && inViewport(el)) return; // already visible on load: show without waiting

    el.dataset.reveal = "pending";
    return revealOnce(el);
  }, []);

  const style = { "--reveal-delay": `${Math.min(index, MAX_STAGGER - 1) * STAGGER_MS}ms` } as CSSProperties;
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * next/image that fades in (with a subtle 1.04 → 1 scale) only once the file
 * has finished loading, so no half-painted images. Cached images show at once.
 */
export function RevealImage({ alt, className = "", onLoad, ...props }: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img || prefersReducedMotion() || img.complete) return;
    img.dataset.revealImg = "pending";
  }, []);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.revealImg === "pending") {
      // Let the pending frame paint before transitioning
      requestAnimationFrame(() => {
        img.dataset.revealImg = "shown";
      });
    }
    onLoad?.(e);
  };

  return <Image ref={ref} alt={alt} className={className} onLoad={handleLoad} {...props} />;
}
