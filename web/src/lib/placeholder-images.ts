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

// The client's real project "Ceylon Road", from PROJECT/01 CEYLON ROAD/ (already
// optimised). 01–02 are landscape 1600×898, 03–07 portrait 1792×2400.
const ceylon = (n: number, alt: string, landscape: boolean): ProjectImage => ({
  src: `/images/projects/ceylon-road/ceylon-road-0${n}.jpg`,
  alt,
  width: landscape ? 1600 : 1792,
  height: landscape ? 898 : 2400,
});

export const CEYLON_ROAD = {
  1: ceylon(1, "Long corridor lined with full-height timber shelving, leading to a bright window", true),
  2: ceylon(2, "Narrow dining room with a long white table, white chairs and a city view", true),
  3: ceylon(3, "Double-height living space with a timber staircase, a paper pendant lamp and a potted tree", false),
  4: ceylon(4, "Floor-to-ceiling timber shelving with lattice screen panels and ceramics", false),
  5: ceylon(5, "Timber-panelled wardrobe wall with a low upholstered bench", false),
  6: ceylon(6, "Shoji-style window with a ceramic vase of branches, set into a timber wall", false),
  7: ceylon(7, "Calm bedroom with a linen-covered bed, timber bedside tables and a pendant light", false),
} as const;

export const placeholderImages = {
  heroSlides: [HERO_1, HERO_2],
  about: ABOUT,
  services: SERVICES,
  contact: CONTACT,
  ceylonRoad: CEYLON_ROAD,
} as const;
