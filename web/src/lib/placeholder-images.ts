import type { ProjectImage } from "@/lib/data/types";

// Temporary stand-ins until the client sends real About, Services, Contact and
// project photos. Swap a path here to update every place that uses it.
export const HERO_1: ProjectImage = {
  src: "/images/hero/hero-1.jpg",
  alt: "Japanese-inspired living room with timber shelving, a paper lantern and garden views",
  width: 1600,
  height: 893,
};

export const HERO_2: ProjectImage = {
  src: "/images/hero/hero-2.jpg",
  alt: "Calm interior with natural wood, soft light and a view onto a green garden",
  width: 1600,
  height: 893,
};

export const placeholderImages = {
  heroSlides: [HERO_1, HERO_2],
  about: HERO_2,
  services: HERO_1,
  contact: HERO_2,
  project: [HERO_1, HERO_2],
} as const;
