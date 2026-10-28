export type ProjectCategory = "residential" | "commercial";

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Every optional field below renders nothing at all when empty (no empty
// headings or dividers). This is the contract the admin panel fills in Phase 7.
export interface ProjectFacts {
  /** "Landed House", "Condominium", "Spa", "Office"… */
  propertyType?: string;
  /** Shown formatted: 3200 -> "3,200 sq ft" */
  sizeSqft?: number;
  /** "16 Weeks" */
  duration?: string;
  /** "Full Renovation", "Kitchen & Bath"… */
  scope?: string;
  year?: number;
}

export interface ProjectStory {
  /** e.g. "A Home Shaped by Light and Calm" */
  heading?: string;
  /** Plain text: a blank line starts a new paragraph; URLs are auto-linked */
  body: string;
}

export interface BeforeAfter {
  before: ProjectImage;
  after: ProjectImage;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  /** e.g. "Sentosa Cove, Singapore" */
  location: string;
  cover: ProjectImage;
  facts: ProjectFacts;
  story?: ProjectStory;
  /** Both images or none */
  beforeAfter?: BeforeAfter;
  /** Can be empty */
  gallery: ProjectImage[];
  /** Shown in the home Portfolio carousel */
  featured: boolean;
  /** The getters return only published projects */
  published: boolean;
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
