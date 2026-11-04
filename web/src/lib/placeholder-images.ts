import type { ProjectImage } from "@/lib/data/types";

/** A fixed page image plus the crop focus chosen for it (see images/IMAGE-MAP.md). */
export type SiteImage = ProjectImage & { objectPosition?: string };

// Fixed page images that the client doesn't edit, served from /public (Phase 6).
// Editable images (hero slides, projects) live in Supabase storage instead.

// From images/About image.jpg
export const ABOUT: SiteImage = {
  src: "/images/about/about.jpg",
  alt: "Bright open-plan home with a timber staircase, wooden floors and tall garden windows",
  width: 818,
  height: 1227,
  objectPosition: "50% 60%",
};

// From PROJECT/01 CEYLON ROAD/04.jpg (FIX-01: the old 1024px image was blurry).
// Already optimised; don't re-compress.
export const SERVICES: SiteImage = {
  src: "/images/services/services.jpg",
  alt: "Bespoke timber shelving and lattice screen joinery in a Japanese-inspired home",
  width: 1792,
  height: 2400,
  objectPosition: "50% 45%",
};

// From images/Contact image.jpg
export const CONTACT: SiteImage = {
  src: "/images/contact/contact.jpg",
  alt: "Japanese garden with a stone-edged pond, a stone lantern and clipped shrubs",
  width: 1108,
  height: 1477,
  objectPosition: "50% 65%",
};

export const placeholderImages = {
  about: ABOUT,
  services: SERVICES,
  contact: CONTACT,
} as const;
