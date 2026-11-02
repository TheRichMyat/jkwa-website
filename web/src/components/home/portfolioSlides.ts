import type { Project, ProjectImage } from "@/lib/data";

/** One card in the home "Our Latest Projects" carousel. */
export interface PortfolioSlide {
  id: string;
  image: ProjectImage;
  /** Caption: always the project's title + location */
  title: string;
  location: string;
  /** Always links to the project */
  href: string;
}

const MIN_SLIDES = 3;

/**
 * Permanent rule (FIX-01): one slide per featured project, using its cover, in
 * order. With fewer than 3, top up with the featured projects' gallery images
 * (project order, then gallery order) until there are 3 or no images are left.
 * So one project still fills the carousel, and the owner picks which photos
 * appear by reordering that project's gallery.
 */
export function buildPortfolioSlides(featured: Project[]): PortfolioSlide[] {
  const slide = (p: Project, image: ProjectImage, key: string): PortfolioSlide => ({
    id: `${p.id}-${key}`,
    image,
    title: p.title,
    location: p.location,
    href: `/projects/${p.slug}`,
  });

  const slides = featured.map((p) => slide(p, p.cover, "cover"));
  for (const p of featured) {
    for (const [i, image] of p.gallery.entries()) {
      if (slides.length >= MIN_SLIDES) return slides;
      slides.push(slide(p, image, `g${i}`));
    }
  }
  return slides;
}
