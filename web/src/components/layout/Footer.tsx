import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  PinterestIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { getSettings, type SiteSettings } from "@/lib/data";
import CopyrightYear from "./CopyrightYear";
import { NAV_ITEMS, sectionHref } from "./nav";

const SERVICE_LINKS = ["Design & Build", "Residential", "Commercial", "Consultancy"];

const SOCIALS: {
  key: keyof SiteSettings["socials"];
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "pinterest", label: "Pinterest", Icon: PinterestIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

// Links are 44px tall on touch layouts, compact from lg
const linkClass =
  "inline-flex min-h-11 items-center text-[13px] text-white/60 transition-colors hover:text-white lg:min-h-0";
const titleClass = "mb-3 font-sans text-sm font-normal text-white lg:mb-5";
const legalLinkClass =
  "inline-flex min-h-11 items-center transition-colors hover:text-white md:min-h-0";
const columnClass ="lg:border-l lg:border-line-dark lg:pl-10 xl:pl-12";

export default async function Footer() {
  const settings = await getSettings();
  const socials = SOCIALS.filter((s) => settings.socials[s.key]);

  return (
    <footer className="bg-night-deep pt-16 text-white/70 lg:pt-[72px]">
      <Container className="grid gap-10 pb-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[1.55fr_1fr_1.1fr_1.45fr] lg:gap-x-10 lg:pb-16 xl:gap-x-12">
        {/* Brand */}
        <div className="md:col-span-2 lg:col-span-1">
          {/* Logo sits above the name between lg and xl, where the column is too narrow for both */}
          <Link
            href="/"
            className="inline-flex items-center gap-4 lg:flex-col lg:items-start xl:flex-row xl:items-center"
          >
            <Image
              src="/brand/logo-mark-gold.png"
              alt=""
              width={400}
              height={365}
              sizes="62px"
              className="h-14 w-auto shrink-0"
            />
            <span className="flex flex-col">
              <span className="whitespace-nowrap font-display text-[22px] leading-tight text-white">
                {settings.companyName}
              </span>
              <span className="mt-1.5 whitespace-nowrap font-sans text-[9px] uppercase leading-none tracking-[0.3em] text-white/50">
                Interior Design &amp; Consultancy
              </span>
            </span>
          </Link>
          <p className="mt-6 text-[13px] text-white/70">Timeless spaces. Lasting impressions.</p>
          <p className="mt-2 text-xs text-white/45">UEN {settings.uen}</p>
          {socials.length > 0 && (
            <ul className="-ml-3 mt-4 flex items-center">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    href={settings.socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center text-white/70 transition-colors hover:text-white"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links" className={columnClass}>
          <h2 className={titleClass}>Quick Links</h2>
          <ul className="lg:space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link href={sectionHref(item.id, false)} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Our Services */}
        <nav aria-label="Our services" className={columnClass}>
          <h2 className={titleClass}>Our Services</h2>
          <ul className="lg:space-y-3">
            {SERVICE_LINKS.map((label) => (
              <li key={label}>
                <Link href="/#services" className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Us */}
        <div className={columnClass}>
          <h2 className={titleClass}>Contact Us</h2>
          <address className="space-y-0 text-[13px] lg:space-y-3 not-italic leading-relaxed text-white/60 [&_svg]:mt-[3px] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg]:text-gold">
            <p className="flex gap-3.5 py-3 lg:py-0">
              <MapPin aria-hidden />
              <span>
                {settings.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
            <p className="flex items-center gap-3.5">
              <Phone aria-hidden className="!mt-0" />
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 items-center transition-colors hover:text-white lg:min-h-0"
              >
                {settings.phone}
              </a>
            </p>
            <p className="flex items-center gap-3.5">
              <Mail aria-hidden className="!mt-0" />
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex min-h-11 items-center break-all transition-colors hover:text-white lg:min-h-0"
              >
                {settings.email}
              </a>
            </p>
            <p className="flex gap-3.5 py-3 lg:py-0">
              <Clock aria-hidden />
              <span>{settings.hours}</span>
            </p>
          </address>
        </div>
      </Container>

      <div className="border-t border-line-dark">
        <Container className="flex flex-col items-center gap-3 py-5 text-center text-xs text-white/45 md:flex-row md:justify-between md:text-left">
          <p>
            © <CopyrightYear /> {settings.companyName} All rights reserved.
          </p>
          <ul className="flex items-center">
            {LEGAL_LINKS.map((link, i) => (
              <li key={link.href} className="flex items-center">
                {i > 0 && <span aria-hidden className="mx-3 h-3 w-px bg-white/20" />}
                {link.href.endsWith(".xml") ? (
                  <a href={link.href} className={legalLinkClass}>
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className={legalLinkClass}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
