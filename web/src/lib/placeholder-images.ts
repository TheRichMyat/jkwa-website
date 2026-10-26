import type { ProjectImage } from "@/lib/data/types";

/** A fixed page image plus the crop focus chosen for it (see images/IMAGE-MAP.md). */
export type SiteImage = ProjectImage & { objectPosition?: string };

// Every image path lives here, so swapping a photo is a one-line change.
// Hero images are stand-ins until the client sends originals; slots still
// pointing at HERO_* are waiting for their real photo.
export const HERO_1: ProjectImage = {
  src: "/images/hero/hero-1.jpg",
  alt: "Japanese-inspired living room with timber shelving, a paper lantern and garden views",
  width: 1600,
  height: 893,
};

export const HERO_2: ProjectImage = {
  src: "/images/hero/hero-2.jpg",
  alt: "Evening living room lit by paper lanterns and shoji screens, beside a garden",
  width: 1600,
  height: 893,
};

// From images/About image.jpg
export const ABOUT: SiteImage = {
  src: "/images/about/about.jpg",
  alt: "Bright open-plan home with a timber staircase, wooden floors and tall garden windows",
  width: 818,
  height: 1227,
  objectPosition: "50% 60%",
};

export const placeholderImages = {
  heroSlides: [HERO_1, HERO_2],
  about: ABOUT,
  services: HERO_1,
  contact: HERO_2,
  project: [HERO_1, HERO_2],
} as const;
