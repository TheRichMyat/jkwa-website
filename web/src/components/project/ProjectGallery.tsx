"use client";

import { useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Reveal, RevealImage } from "@/components/motion/Reveal";
import type { ProjectImage } from "@/lib/data";
import Lightbox from "./Lightbox";

type RowType = "full" | "pair" | "wideNarrow";
interface Row {
  type: RowType;
  start: number;
  images: ProjectImage[];
}

const PATTERN: RowType[] = ["full", "pair", "wideNarrow"];

/**
 * Editorial rows in upload order: Full → Pair → Wide+narrow, repeating.
 * Leftovers at the end: 1 image → Full, 2 images → Pair. No orphan gaps.
 */
export function galleryRows(images: ProjectImage[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  let step = 0;
  while (i < images.length) {
    const left = images.length - i;
    let type = PATTERN[step % PATTERN.length];
    if (left === 1) type = "full";
    else if (left === 2) type = "pair";
    const take = type === "full" ? 1 : 2;
    rows.push({ type, start: i, images: images.slice(i, i + take) });
    i += take;
    step++;
  }
  return rows;
}

// Row heights: tablet ≈ 0.75 × desktop; phones are a single column of 4:3 images
const ROW_CLASS: Record<RowType, string> = {
  full: "md:h-[330px] lg:h-[440px]",
  pair: "md:h-[300px] lg:h-[400px]",
  wideNarrow: "md:h-[300px] lg:h-[400px]",
};
const SLOT_CLASS: Record<RowType, string[]> = {
  full: ["md:flex-1"],
  pair: ["md:flex-1", "md:flex-1"],
  wideNarrow: ["md:flex-[2]", "md:flex-1"],
};
const SLOT_SIZES: Record<RowType, string[]> = {
  full: ["(min-width: 1340px) 1240px, 100vw"],
  pair: ["(min-width: 1340px) 616px, (min-width: 768px) 50vw, 100vw"],
  wideNarrow: [
    "(min-width: 1340px) 824px, (min-width: 768px) 66vw, 100vw",
    "(min-width: 1340px) 408px, (min-width: 768px) 33vw, 100vw",
  ],
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
            <div key={row.start} className={`grid gap-2 md:flex ${ROW_CLASS[row.type]}`}>
              {row.images.map((image, k) => {
                const index = row.start + k;
                return (
                  <button
                    key={index}
                    ref={(el) => {
                      triggers.current[index] = el;
                    }}
                    type="button"
                    onClick={() => setOpen(index)}
                    aria-label={`Open image ${index + 1} of ${images.length}`}
                    className={`group relative block aspect-[4/3] overflow-hidden bg-stone outline-offset-2 focus-visible:outline-2 focus-visible:outline-gold md:aspect-auto md:h-full ${SLOT_CLASS[row.type][k]}`}
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
