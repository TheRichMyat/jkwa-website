/**
 * Privacy Policy and Terms are drafts until Atelier JK&WA approves the wording.
 *
 * While false: the footer doesn't link to them, the pages are noindex, and the
 * sitemap leaves them out (the pages still open at /privacy and /terms, so the
 * client can review them). Switch to true once the client approves, then deploy.
 */
export const LEGAL_APPROVED = false;

/** Shown at the top of both pages. Update it whenever the wording changes. */
export const LEGAL_LAST_UPDATED = "4 November 2026";

export const LEGAL_PAGES = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
] as const;
