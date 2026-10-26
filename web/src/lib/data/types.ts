export type ProjectCategory = "residential" | "commercial";

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  year?: number;
  /** 1–2 sentences for cards */
  summary: string;
  /** Longer text for the detail page (plain paragraphs separated by \n\n) */
  description: string;
  cover: ProjectImage;
  gallery: ProjectImage[];
  /** Shown in the home Portfolio carousel */
  featured: boolean;
  sortOrder: number;
}

export interface HeroSlide {
  id: string;
  image: ProjectImage;
  sortOrder: number;
}

export interface SiteSettings {
  companyName: string;
  uen: string;
  contactPerson: string;
  addressLines: string[];
  phone: string;
  fax: string;
  email: string;
  hours: string;
  bookletUrl: string;
  questionnaireUrl: string;
  socials: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    linkedin?: string;
    youtube?: string;
  };
}
