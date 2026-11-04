import { getHeroSlides, getSettings } from "@/lib/data";
import { jsonLd, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

/** Drop empty values so the output never has "", [] or undefined */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
  ) as Partial<T>;
}

/**
 * schema.org InteriorDesigner (a LocalBusiness) for the home page, built from
 * the admin-edited settings. The last address line is "Singapore <postcode>".
 */
export default async function BusinessJsonLd() {
  const [settings, slides] = await Promise.all([getSettings(), getHeroSlides()]);

  const lines = settings.addressLines.filter(Boolean);
  const postalCode = lines.at(-1)?.match(/\b\d{6}\b/)?.[0];
  const street = (postalCode ? lines.slice(0, -1) : lines).join(", ");
  const sameAs = Object.values(settings.socials).filter((url): url is string => Boolean(url));

  const data = compact({
    "@context": "https://schema.org",
    "@type": "InteriorDesigner",
    name: settings.companyName,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/brand/logo-full-gold.png`,
    image: slides[0]?.image.src ?? `${SITE_URL}/brand/logo-full-gold.png`,
    telephone: settings.phone,
    email: settings.email,
    address: compact({
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: "Singapore",
      postalCode,
      addressCountry: "SG",
    }),
    areaServed: "Singapore",
    sameAs,
  });

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
