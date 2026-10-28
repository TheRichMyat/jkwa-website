"use client";

import Image from "next/image";
import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BeforeAfter } from "@/lib/data";

const START = 50;
const STEP = 5;
const SIZES = "(min-width: 1340px) 1240px, 100vw";

/*
  Before/after comparison. The "after" image sits underneath; the "before" image
  on top is clipped with clip-path. Position updates go straight to the DOM in a
  requestAnimationFrame (clip-path + transform only, no React re-render), so
  dragging stays smooth on mid-range phones.
  - Mouse/pen: press anywhere on the image or the handle and drag.
  - Touch: a mostly-horizontal drag moves the slider; a vertical one is left to
    the browser (touch-action: pan-y), so the page still scrolls.
  - Keyboard: the handle is a real slider (← → 5%, Home/End).
*/
export default function BeforeAfterSlider({ images }: { images: BeforeAfter }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pos = useRef(START);
  const frame = useRef(0);
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);

  const render = () => {
    frame.current = 0;
    const p = pos.current;
    if (beforeRef.current) beforeRef.current.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    if (railRef.current) railRef.current.style.transform = `translateX(${p}%)`;
    handleRef.current?.setAttribute("aria-valuenow", String(Math.round(p)));
    handleRef.current?.setAttribute("aria-valuetext", `${Math.round(p)}% before`);
  };

  const setPos = (p: number) => {
    pos.current = Math.min(100, Math.max(0, p));
    if (!frame.current) frame.current = requestAnimationFrame(render);
  };

  const setFromClientX = (clientX: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (r) setPos(((clientX - r.left) / r.width) * 100);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const dragging = e.pointerType !== "touch"; // touch waits to see the direction
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging };
    if (dragging) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.dragging) {
      const dx = Math.abs(e.clientX - g.x);
      const dy = Math.abs(e.clientY - g.y);
      if (dy > 8 && dy > dx) {
        gesture.current = null; // vertical: let the page scroll
        return;
      }
      if (dx < 6) return;
      g.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setFromClientX(e.clientX);
  };

  const endGesture = (e: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id === e.pointerId) gesture.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? pos.current - STEP
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? pos.current + STEP
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.round(next));
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      className="relative aspect-[4/3] max-h-[640px] w-full touch-pan-y overflow-hidden bg-night select-none md:aspect-video"
    >
      <Image
        src={images.after.src}
        alt={`After: ${images.after.alt}`}
        fill
        sizes={SIZES}
        draggable={false}
        className="object-cover"
      />
      <div
        ref={beforeRef}
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - START}% 0 0)` }}
      >
        <Image
          src={images.before.src}
          alt={`Before: ${images.before.alt}`}
          fill
          sizes={SIZES}
          draggable={false}
          className="object-cover"
        />
      </div>

      <span className="absolute bottom-0 left-0 bg-night/85 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-white">
        Before
      </span>
      <span className="absolute right-0 bottom-0 bg-gold-deep px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-white">
        After
      </span>

      {/* Full-width rail moved by translateX(p%): the divider + handle sit at its left edge */}
      <div
        ref={railRef}
        className="pointer-events-none absolute inset-0"
        style={{ transform: `translateX(${START}%)` }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 bg-white" />
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label="Before and after comparison"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={START}
          aria-valuetext={`${START}% before`}
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute top-1/2 left-0 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(17,17,15,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ChevronLeft aria-hidden className="-mr-0.5 size-4 stroke-[1.75]" />
          <ChevronRight aria-hidden className="-ml-0.5 size-4 stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
