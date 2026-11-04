import Link from "next/link";
import LegalPage, { LegalContact, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata(
  "Terms & Conditions",
  "/terms",
  "The terms for using the Atelier JK&WA website.",
);

// Draft for Atelier JK&WA to review (LEGAL_APPROVED in lib/content/legal.ts)
export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        These terms apply to your use of this website, run by Atelier JK&amp;WA Pte. Ltd. (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By using the website, you agree to them. If you don&rsquo;t agree, please don&rsquo;t use the
        website.
      </p>

      <h2>About this website</h2>
      <p>
        This website introduces our interior design and Design &amp; Build services and shows examples of our work. It
        is for general information only. It isn&rsquo;t professional advice for your particular property or project.
      </p>

      <h2>Prices and project information</h2>
      <p>
        Any prices on this website, such as &ldquo;projects starting from S$100,000&rdquo;, are a general guide only.
        They are not a quotation or an offer. The cost of every project depends on its scope, site conditions,
        materials and timeline, and is agreed in a separate written proposal or contract.
      </p>
      <p>
        Project descriptions, sizes, durations and photos show work as it was completed. Your own project may differ.
      </p>

      <h2>Our content</h2>
      <p>
        The photos, designs, drawings, text, logo and other content on this website belong to Atelier JK&amp;WA or are
        used with permission. You may view and share links to our pages for personal use. You may not copy, reproduce,
        publish or use our designs or photos for any other purpose (including commercial use) without our written
        permission.
      </p>

      <h2>Links to other websites</h2>
      <p>
        This website links to services run by others, such as Google Forms, Google Drive and social media. We
        aren&rsquo;t responsible for their content, availability or privacy practices. Please read their own terms.
      </p>

      <h2>Availability and accuracy</h2>
      <p>
        We try to keep the website accurate and available, but we can&rsquo;t promise that it will always be complete,
        up to date or free of errors or interruptions. We may change or remove any part of it at any time.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        As far as the law allows, we are not liable for any loss or damage arising from your use of, or reliance on,
        this website. Nothing in these terms limits any liability that cannot be limited under Singapore law.
      </p>

      <h2>Your personal data</h2>
      <p>
        How we handle the information you send us is explained in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Singapore, and the courts of Singapore have jurisdiction.</p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The latest version is always on this page, with the date it was
        last updated.
      </p>

      <h2>Contact us</h2>
      <LegalContact />
    </LegalPage>
  );
}
