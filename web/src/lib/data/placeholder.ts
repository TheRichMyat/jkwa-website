// Placeholder data used until Phase 6 connects Supabase.
// Only src/lib/data/index.ts may import this file.
import { placeholderImages } from "@/lib/placeholder-images";
import type { HeroSlide, Project, SiteSettings } from "./types";

// TEMPORARY images (see placeholder-images.ts); the client replaces them via the admin panel.
const [P1, P2, P3, P4, P5, P6] = placeholderImages.projects;
const { heroSlides: [H1, H2], about: AB, services: SV, contact: CT, before: BEFORE } =
  placeholderImages;

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
// Featured = projects 1–3 (covers 1, 2, 3, the most on-brand images per IMAGE-MAP).
// The content varies ON PURPOSE so the "empty = hidden" rule is exercised:
//   #1 everything (5 facts, story with heading, before/after, 8-image gallery)
//   #2 facts, story without heading, 5 images      #3 two facts, no story, before/after, 3 images
//   #4 no facts, story, no gallery                  #5–#10 a mix (galleries of 4, 2, 1, 6, 3, 5)
//   #11 unpublished: must never appear anywhere
export const placeholderProjects: Project[] = [
  {
    id: "p1",
    slug: "sentosa-cove-residence",
    title: "Sentosa Cove Residence",
    category: "residential",
    location: "Sentosa Cove, Singapore",
    cover: P1,
    facts: {
      propertyType: "Landed House",
      sizeSqft: 3200,
      duration: "16 Weeks",
      scope: "Full Renovation",
      year: 2025,
    },
    story: {
      heading: "A Home Shaped by Light and Calm",
      body: "This landed house in Sentosa Cove was a complete renovation project, designed to bring the serenity of Japanese living into a modern family home.\n\nWe focused on natural materials, clean lines and a calm colour palette to create a space that feels open, warm and connected to nature.\n\nEvery detail was carefully considered, from the flow of light and space to the use of timber, stone and greenery, resulting in a home that feels both timeless and deeply personal.",
    },
    beforeAfter: { before: BEFORE[1], after: H1 },
    gallery: [P2, P3, P4, P5, P6, H2, SV, AB],
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    id: "p2",
    slug: "orchard-condominium",
    title: "Orchard Condominium",
    category: "residential",
    location: "Orchard, Singapore",
    cover: P2,
    facts: {
      propertyType: "Condominium",
      sizeSqft: 1450,
      duration: "10 Weeks",
      scope: "Full Renovation",
      year: 2024,
    },
    story: {
      body: "A city apartment reworked around natural light and quiet, practical storage. Built-in timber joinery keeps everyday things out of sight, so the rooms feel open and unhurried.\n\nSoft linen, pale oak and paper screens bring the calm of a Japanese home to a busy part of the city.",
    },
    gallery: [P3, P4, P5, P6, H1],
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    id: "p3",
    slug: "zen-spa-retreat",
    title: "Zen Spa Retreat",
    category: "commercial",
    location: "Sentosa, Singapore",
    cover: P3,
    facts: { propertyType: "Spa", year: 2024 },
    beforeAfter: { before: BEFORE[3], after: SV },
    gallery: [P4, P5, H2],
    featured: true,
    published: true,
    sortOrder: 3,
  },
  {
    id: "p4",
    slug: "tea-house-cafe",
    title: "Tea House Café",
    category: "commercial",
    location: "Tiong Bahru, Singapore",
    cover: P4,
    facts: {},
    story: {
      heading: "The Rhythm of a Tea House",
      body: "A neighbourhood café inspired by the simplicity of a traditional tea house. Long timber tables, soft pendant light and a restrained palette let the food and the conversation take centre stage.\n\nThe counter was designed as a quiet stage for the ritual of making tea, visible from every seat.",
    },
    gallery: [],
    featured: false,
    published: true,
    sortOrder: 4,
  },
  {
    id: "p5",
    slug: "boutique-office",
    title: "Boutique Office",
    category: "commercial",
    location: "Marina Bay, Singapore",
    cover: P5,
    facts: { propertyType: "Office", sizeSqft: 2100, duration: "12 Weeks", year: 2024 },
    story: {
      heading: "Focus and Calm at Work",
      body: "A compact workplace that balances focused desks with a calm, welcoming reception.\n\nAcoustic timber panels and soft daylight keep the office quiet, while a small tea corner gives the team a place to pause.",
    },
    gallery: [P6, H1, H2, AB],
    featured: false,
    published: true,
    sortOrder: 5,
  },
  {
    id: "p6",
    slug: "tanjong-pagar-restaurant",
    title: "Tanjong Pagar Restaurant",
    category: "commercial",
    location: "Tanjong Pagar, Singapore",
    cover: P6,
    facts: { propertyType: "Restaurant", scope: "Interior Fit-Out", year: 2023 },
    story: {
      body: "An intimate restaurant where warm timber, low lighting and carefully spaced tables create a sense of calm in the heart of the city.\n\nThe layout guides guests gently from the busy street to a quiet dining room at the back.",
    },
    gallery: [H2, SV],
    featured: false,
    published: true,
    sortOrder: 6,
  },
  {
    id: "p7",
    slug: "bukit-timah-villa",
    title: "Bukit Timah Villa",
    category: "residential",
    location: "Bukit Timah, Singapore",
    cover: H1,
    facts: {
      propertyType: "Landed House",
      sizeSqft: 4100,
      duration: "20 Weeks",
      scope: "Full Renovation",
      year: 2023,
    },
    story: {
      heading: "A Garden at the Heart of the Home",
      body: "A family villa reorganised around its garden. Wide openings, sliding screens and a covered veranda blur the line between inside and out.\n\nNatural timber and stone were chosen to age beautifully over the years.",
    },
    beforeAfter: { before: BEFORE[7], after: H2 },
    gallery: [AB],
    featured: false,
    published: true,
    sortOrder: 7,
  },
  {
    id: "p8",
    slug: "marina-bay-penthouse",
    title: "Marina Bay Penthouse",
    category: "residential",
    location: "Marina Bay, Singapore",
    cover: H2,
    facts: { propertyType: "Penthouse", sizeSqft: 2800, year: 2025 },
    story: {
      heading: "Quiet Above the City",
      body: "High above the bay, this penthouse was designed as a calm retreat from the city below.\n\nShoji-inspired screens soften the strong tropical light, and a restrained palette of oak, linen and stone keeps the focus on the view.",
    },
    gallery: [P1, P2, P3, P4, P5, P6],
    featured: false,
    published: true,
    sortOrder: 8,
  },
  {
    id: "p9",
    slug: "kyoto-style-ryokan-suite",
    title: "Kyoto-Style Ryokan Suite",
    category: "residential",
    location: "Sentosa, Singapore",
    cover: SV,
    facts: { propertyType: "Suite", duration: "8 Weeks", scope: "Bedroom & Bath" },
    gallery: [P5, P6, AB],
    featured: false,
    published: true,
    sortOrder: 9,
  },
  {
    id: "p10",
    slug: "holland-village-apartment",
    title: "Holland Village Apartment",
    category: "residential",
    location: "Holland Village, Singapore",
    cover: AB,
    facts: { propertyType: "Apartment", sizeSqft: 1200, scope: "Kitchen & Living", year: 2024 },
    story: {
      body: "A bright apartment opened up around a new timber staircase and a long kitchen counter.\n\nSimple materials and generous storage make the most of a compact plan.",
    },
    gallery: [P1, P2, P3, H1, CT],
    featured: false,
    published: true,
    sortOrder: 10,
  },
  {
    // UNPUBLISHED on purpose: proves hidden projects never appear (lists, filters,
    // counts, home carousel, Next project) and that its URL returns 404.
    id: "p11",
    slug: "garden-pavilion",
    title: "Garden Pavilion",
    category: "residential",
    location: "Singapore",
    cover: CT,
    facts: { propertyType: "Pavilion" },
    gallery: [CT],
    featured: true,
    published: false,
    sortOrder: 11,
  },
];
