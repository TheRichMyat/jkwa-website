import WaKanji from "@/components/brand/WaKanji";

/**
 * The WA panel (DESIGN-SPEC "The WA panel — craft rules"). From md it has a
 * vertical gold line on the left; on phones it is a centred block with a short
 * horizontal gold line above.
 */
export default function WaPanel({ className = "" }: { className?: string }) {
  return (
    <div
      role="group"
      aria-label="WA — Harmony"
      className={`relative mx-auto max-w-[260px] pt-9 text-center md:mx-0 md:max-w-none md:pt-0 md:pl-7 md:text-left ${className}`}
    >
      {/* Mobile: 48px horizontal line, centred. md+: full-height vertical line */}
      <span aria-hidden className="absolute top-0 left-1/2 h-px w-12 -translate-x-1/2 bg-gold/60 md:hidden" />
      <span aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-gold/60 md:block" />

      {/* No nudge needed: measured at 2×, the glyph's left ink sits within 0.5px of the "W" */}
      <span lang="ja" aria-hidden="true" className="inline-block text-gold-light">
        <WaKanji className="h-11 md:h-[52px]" />
      </span>

      <p className="mt-5 font-display text-[34px] leading-none tracking-[0.04em] text-ink">WA</p>
      <p className="mt-0.5 font-display text-xl italic leading-tight text-muted">Harmony</p>

      <p className="mx-auto mt-7 max-w-[220px] font-sans text-sm font-light leading-[1.8] text-body md:mx-0">
        The Japanese concept of WA (Harmony) is at the heart of every design.
      </p>
    </div>
  );
}
