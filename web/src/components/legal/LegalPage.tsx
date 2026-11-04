import type { Metadata } from "next";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { LEGAL_APPROVED, LEGAL_LAST_UPDATED } from "@/lib/content/legal";
import { getSettings } from "@/lib/data";
import { openGraph } from "@/lib/site";

/** Metadata for a legal page: noindex until the client approves the wording */
export function legalMetadata(title: string, path: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: openGraph(path, { title, description }),
    ...(LEGAL_APPROVED ? {} : { robots: { index: false, follow: false } }),
  };
}

/** Stone banner with the heading (like /projects), then a readable column */
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <section aria-labelledby="legal-heading" className="bg-stone py-12 md:py-14 lg:py-16">
        <Container>
          <Eyebrow line="before">Atelier JK&amp;WA</Eyebrow>
          <h1
            id="legal-heading"
            className="mt-4 font-display text-[clamp(2.5rem,1.9rem+2vw,3.5rem)] font-normal leading-[1.1] text-ink"
          >
            {title}
          </h1>
        </Container>
      </section>
      <div className="bg-paper py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-[720px] font-sans text-base font-light leading-[1.8] text-body [&_a]:text-gold-deep [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[1.75rem] [&_h2]:font-normal [&_h2]:leading-tight [&_h2]:text-ink [&_li]:mt-1.5 [&_p]:mt-4 [&_strong]:font-normal [&_strong]:text-ink [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
            <p className="!mt-0 text-sm text-muted">Last updated: {LEGAL_LAST_UPDATED}</p>
            {children}
          </div>
        </Container>
      </div>
    </>
  );
}

/** How to reach the company, from the admin-edited settings */
export async function LegalContact() {
  const s = await getSettings();
  return (
    <ul>
      <li>
        <strong>Company:</strong> {s.companyName}
        {s.uen && <> (UEN {s.uen})</>}
      </li>
      {s.contactPerson && (
        <li>
          <strong>Contact person:</strong> {s.contactPerson}
        </li>
      )}
      {s.email && (
        <li>
          <strong>Email:</strong> <a href={`mailto:${s.email}`}>{s.email}</a>
        </li>
      )}
      {s.phone && (
        <li>
          <strong>Phone:</strong> <a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a>
        </li>
      )}
      {s.addressLines.length > 0 && (
        <li>
          <strong>Address:</strong> {s.addressLines.join(", ")}
        </li>
      )}
    </ul>
  );
}
