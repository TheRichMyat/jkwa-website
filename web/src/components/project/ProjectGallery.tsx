"use client";

import { useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Reveal, RevealImage } from "@/components/motion/Reveal";
import type { ProjectImage } from "@/lib/data";
import Lightbox from "./Lightbox";

type RowType = "full" | "pair" | "wideNarrow" | "single";
interface Slot {
  image: ProjectImage;
  /** Position in upload order (what the lightbox opens) */
  index: number;
  portrait: boolean;
}
interface Row {
  type: RowType;
  slots: Slot[];
}

/** Landscape = width/height ≥ 1.2; everything else counts as portrait. */
const isPortrait = (img: ProjectImage) => img.width / img.height < 1.2;

/**
 * Orientation-aware editorial rows (FIX-01), built automatically in upload order
 * so the admin never picks layouts:
 * - landscape → Full row
 * - two portraits in a row → Pair (tall, so portraits aren't cropped flat)
 * - landscape + a portrait that has no portrait partner → Wide + narrow
 *   (landscape in the wide slot)
 * - a single leftover portrait → centred, half the Container width
 */
export function galleryRows(images: ProjectImage[]): Row[] {
  const slots = images.map((image, index) => ({ image, index, portrait: isPortrait(image) }));
  const rows: Row[] = [];
  let i = 0;
  while (i < slots.length) {
    const [cur, next, after] = [slots[i], slots[i + 1], slots[i + 2]];
    if (cur.portrait) {
      if (next?.portrait) {
        rows.push({ type: "pair", slots: [cur, next] });
        i += 2;
      } else if (next) {
        rows.push({ type: "wideNarrow", slots: [next, cur] }); // landscape goes wide
        i += 2;
      } else {
        rows.push({ type: "single", slots: [cur] });
        i += 1;
      }
    } else if (next?.portrait && !after?.portrait) {
      // The portrait would otherwise be left alone: pair it with this landscape
      rows.push({ type: "wideNarrow", slots: [cur, next] });
      i += 2;
    } else {
      rows.push({ type: "full", slots: [cur] });
      i += 1;
    }
  }
  return rows;
}

// Row heights: tablet ≈ 0.75 × desktop. Phones: one column, 4:3 landscape / 4:5 portrait.
const ROW_CLASS: Record<RowType, string> = {
  full: "md:h-[330px] lg:h-[440px]",
  pair: "md:h-[480px] lg:h-[640px]",
  wideNarrow: "md:h-[300px] lg:h-[400px]",
  single: "md:h-[480px] md:justify-center lg:h-[640px]",
};
const SLOT_CLASS: Record<RowType, string[]> = {
  full: ["md:flex-1"],
  pair: ["md:flex-1", "md:flex-1"],
  wideNarrow: ["md:flex-[2]", "md:flex-1"],
  single: ["md:w-1/2 md:flex-none"],
};
const SLOT_SIZES: Record<RowType, string[]> = {
  full: ["(min-width: 1340px) 1240px, 100vw"],
  pair: ["(min-width: 1340px) 616px, (min-width: 768px) 50vw, 100vw"],
  wideNarrow: [
    "(min-width: 1340px) 824px, (min-width: 768px) 66vw, 100vw",
    "(min-width: 1340px) 408px, (min-width: 768px) 33vw, 100vw",
  ],
  single: ["(min-width: 1340px) 620px, (min-width: 768px) 50vw, 100vw"],
};

export default function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  if (images.length === 0) return null;
  const rows = galleryRows(images);

  return (
    <section aria-label="Gallery" className="bg-paper py-16 md:py-20 lg:py-24">
      <Container>
        <Reveal>
          <Eyebrow line="before">Gallery</Eyebrow>
        </Reveal>
        <div className="mt-8 space-y-2">
          {rows.map((row) => (
            <div key={row.slots[0].index} className={`grid gap-2 md:flex ${ROW_CLASS[row.type]}`}>
              {row.slots.map(({ image, index, portrait }, k) => {
                return (
                  <button
                    key={index}
                    ref={(el) => {
                      triggers.current[index] = el;
                    }}
                    type="button"
                    onClick={() => setOpen(index)}
                    aria-label={`Open image ${index + 1} of ${images.length}`}
                    className={`group relative block ${portrait ? "aspect-[4/5]" : "aspect-[4/3]"} overflow-hidden bg-stone outline-offset-2 focus-visible:outline-2 focus-visible:outline-gold md:aspect-auto md:h-full ${SLOT_CLASS[row.type][k]}`}
                  >
                    <span className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03] motion-reduce:transition-none">
                      <RevealImage
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes={SLOT_SIZES[row.type][Math.min(k, SLOT_SIZES[row.type].length - 1)]}
                        className="object-cover"
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Container>

      {open !== null && (
        <Lightbox
          images={images}
          title={title}
          startIndex={open}
          onClose={() => {
            const trigger = triggers.current[open];
            setOpen(null);
            // Return focus to the image that opened the viewer
            requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
          }}
        />
      )}
    </section>
  );
}
