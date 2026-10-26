// Placeholder data used until Phase 6 connects Supabase.
// Only src/lib/data/index.ts may import this file.
import { placeholderImages } from "@/lib/placeholder-images";
import type { HeroSlide, Project, SiteSettings } from "./types";

const [imgA, imgB] = placeholderImages.project;

export const placeholderSettings: SiteSettings = {
  companyName: "Atelier JK&WA Pte. Ltd.",
  uen: "202643450N",
  contactPerson: "Mr Kenji",
  addressLines: ["7 Temasek Boulevard", "#12-07, Suntec Tower One", "Singapore 038987"],
  phone: "+65 8028 7801",
  fax: "+65 6917 8977",
  email: "kenjisansg@gmail.com",
  // Placeholder, client to confirm
  hours: "Mon – Fri 9:00 AM – 6:00 PM (SGT)",
  // Placeholders until the client sends the Google Drive / Google Form links
  bookletUrl: "#",
  questionnaireUrl: "#",
  socials: { instagram: "", facebook: "", pinterest: "", linkedin: "", youtube: "" },
};

export const placeholderHeroSlides: HeroSlide[] = placeholderImages.heroSlides.map(
  (image, i) => ({ id: `hero-${i + 1}`, image, sortOrder: i + 1 }),
);

// PLACEHOLDER PROJECTS: names, text and images are stand-ins, not real client work.
export const placeholderProjects: Project[] = [
  {
    id: "p1",
    slug: "private-residence-tokyo",
    title: "Private Residence",
    location: "Tokyo, Japan",
    category: "residential",
    year: 2024,
    summary: "A family home arranged around natural light, warm timber and quiet, uncluttered rooms.",
    description:
      "A family home arranged around natural light, warm timber and quiet, uncluttered rooms.\n\nPlaceholder description. The full project story will be added when the client provides it.",
    cover: imgA,
    gallery: [imgA, imgB],
    featured: true,
    sortOrder: 1,
  },
  {
    id: "p2",
    slug: "sentosa-cove-villa",
    title: "Sentosa Cove Villa",
    location: "Singapore",
    category: "residential",
    year: 2024,
    summary: "A waterfront villa where open living spaces flow out to the garden and the sea breeze.",
    description:
      "A waterfront villa where open living spaces flow out to the garden and the sea breeze.\n\nPlaceholder description. The full project story will be added when the client provides it.",
    cover: imgB,
    gallery: [imgB, imgA],
    featured: true,
    sortOrder: 2,
  },
  {
    id: "p3",
    slug: "orchard-condominium",
    title: "Orchard Condominium",
    location: "Singapore",
    category: "residential",
    year: 2023,
    summary: "A city apartment reworked with natural materials and calm, practical storage.",
    description:
      "A city apartment reworked with natural materials and calm, practical storage.\n\nPlaceholder description. The full project story will be added when the client provides it.",
    cover: imgA,
    gallery: [imgA, imgB],
    featured: false,
    sortOrder: 3,
  },
  {
    id: "p4",
    slug: "zen-spa-retreat-bangkok",
    title: "Zen Spa Retreat",
    location: "Bangkok, Thailand",
    category: "commercial",
    year: 2023,
    summary: "A spa designed for stillness, with soft lighting, stone and timber treatment rooms.",
    description:
      "A spa designed for stillness, with soft lighting, stone and timber treatment rooms.\n\nPlaceholder description. The full project story will be added when the client provides it.",
    cover: imgB,
    gallery: [imgB, imgA],
    featured: true,
    sortOrder: 4,
  },
  {
    id: "p5",
    slug: "tea-house-cafe",
    title: "Tea House Café",
    location: "Singapore",
    category: "commercial",
    year: 2022,
    summary: "A neighbourhood café inspired by the simplicity and rhythm of a traditional tea house.",
    description:
      "A neighbourhood café inspired by the simplicity and rhythm of a traditional tea house.\n\nPlaceholder description. The full project story will be added when the client provides it.",
    cover: imgA,
    gallery: [imgA, imgB],
    featured: false,
    sortOrder: 5,
  },
  {
    id: "p6",
    slug: "boutique-office",
    title: "Boutique Office",
    location: "Singapore",
    category: "commercial",
    year: 2022,
    summary: "A compact workplace balancing focused desks with a calm, welcoming reception.",
    description:
      "A compact workplace balancing focused desks with a calm, welcoming reception.\n\nPlaceholder description. The full project story will be added when the client provides it.",
    cover: imgB,
    gallery: [imgB, imgA],
    featured: false,
    sortOrder: 6,
  },
];
