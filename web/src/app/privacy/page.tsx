import LegalPage, { LegalContact, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata(
  "Privacy Policy",
  "/privacy",
  "How Atelier JK&WA collects, uses and protects personal data, in line with Singapore's Personal Data Protection Act.",
);

// Draft for Atelier JK&WA to review (LEGAL_APPROVED in lib/content/legal.ts)
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Atelier JK&amp;WA Pte. Ltd. (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy explains
        what personal data we collect through this website, why we collect it, and how you can contact us about it. We
        handle personal data in line with Singapore&rsquo;s Personal Data Protection Act 2012 (PDPA).
      </p>

      <h2>What we collect</h2>
      <p>This website doesn&rsquo;t ask you to create an account, and it doesn&rsquo;t use advertising cookies. We only
        collect the personal data you choose to send us, for example when you:</p>
      <ul>
        <li>fill in our project questionnaire or request our booklet (these use Google Forms or Google Drive)</li>
        <li>email us, call us or message us</li>
      </ul>
      <p>
        This usually means your name, email address, phone number, and details about your property and project (such as
        its type, size, address, budget and preferences).
      </p>
      <p>
        Like most websites, our hosting provider automatically records basic technical information (such as your IP
        address, browser type and the pages you visit) to keep the site secure and working. If we add website analytics
        in the future, we will update this policy.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>to reply to your enquiry and send you the information you asked for</li>
        <li>to prepare consultations, proposals and quotations for your project</li>
        <li>to carry out and manage a project you engage us for</li>
        <li>to meet our legal, accounting and regulatory obligations</li>
      </ul>
      <p>
        We don&rsquo;t sell your personal data, and we won&rsquo;t send you marketing messages unless you have agreed to
        receive them.
      </p>

      <h2>Who we share it with</h2>
      <p>We share personal data only as far as needed to run our business, with:</p>
      <ul>
        <li>Google (Google Forms and Google Drive), which receives the information you enter in our forms</li>
        <li>the companies that host and run this website</li>
        <li>contractors, suppliers and consultants working on your project, where needed to complete it</li>
        <li>authorities, where the law requires it</li>
      </ul>
      <p>
        Some of these providers may store data outside Singapore. Where that happens, we take reasonable steps to make
        sure your data is protected to a standard comparable to the PDPA.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep personal data only for as long as it&rsquo;s needed for the purposes above, or as required by law (for
        example, for tax and accounting records). After that, we delete it or make it anonymous.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        We use reasonable security measures to protect personal data from unauthorised access, use or loss. No method of
        sending or storing data online is completely secure, so please avoid sending sensitive information by email.
      </p>

      <h2>Your choices</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>tell you what personal data we hold about you and how it has been used</li>
        <li>correct personal data that is wrong or incomplete</li>
        <li>stop using your personal data (withdraw your consent)</li>
      </ul>
      <p>
        We will reply as soon as reasonably possible. If you withdraw consent, we may not be able to continue helping
        with your project, and we will explain what that means for you.
      </p>

      <h2>Contact us</h2>
      <p>For any question or request about your personal data, please contact us:</p>
      <LegalContact />

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The latest version is always on this page, with the date it was
        last updated.
      </p>
    </LegalPage>
  );
}
