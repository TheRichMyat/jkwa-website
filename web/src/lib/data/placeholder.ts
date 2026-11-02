// Placeholder data used until Phase 6 connects Supabase.
// Only src/lib/data/index.ts may import this file.
import { placeholderImages } from "@/lib/placeholder-images";
import type { HeroSlide, Project, SiteSettings } from "./types";

const { ceylonRoad: CR } = placeholderImages;

export const placeholderSettings: SiteSettings = {
  companyName: "Atelier JK&WA Pte. Ltd.",
  uen: "202643450N",
  contactPerson: "Mr Kenji",
  addressLines: ["7 Temasek Boulevard", "#12-07, Suntec Tower One", "Singapore 038987"],
  phone: "+65 8028 7801",
  fax: "+65 6917 8977",
  // Changed by client request (FIX-01, Nov 2026); see plan/CONTENT.md
  email: "wadesign@gmail.com",
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

// The client's real projects (FIX-01: every placeholder project was removed).
// Until the admin panel (Phase 7), new projects are added here.
export const placeholderProjects: Project[] = [
  {
    id: "ceylon-road",
    slug: "ceylon-road",
    title: "Ceylon Road",
    category: "residential", // assumed; the owner will confirm
    location: "Singapore",
    cover: CR[1],
    facts: {},
    // Order chosen by the owner; the cover isn't repeated. The home carousel
    // tops up with the first gallery images (02, 07) while there's one project.
    gallery: [CR[2], CR[7], CR[3], CR[4], CR[5], CR[6]],
    featured: true,
    published: true,
    sortOrder: 1,
  },
];
