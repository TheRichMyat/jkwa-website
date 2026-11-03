import type { SiteSettings } from "./types";

/**
 * Fallback contact details, used only if Supabase can't be reached, so the
 * Contact section and Footer never go blank. Keep in step with the `settings`
 * row (the admin panel is the real source from Phase 7 on).
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "Atelier JK&WA Pte. Ltd.",
  uen: "202643450N",
  contactPerson: "Mr Kenji",
  addressLines: ["7 Temasek Boulevard", "#12-07, Suntec Tower One", "Singapore 038987"],
  phone: "+65 8028 7801",
  fax: "+65 6917 8977",
  email: "wadesign@gmail.com",
  hours: "Mon – Fri 9:00 AM – 6:00 PM (SGT)",
  bookletUrl: "#",
  questionnaireUrl: "#",
  socials: {},
};
