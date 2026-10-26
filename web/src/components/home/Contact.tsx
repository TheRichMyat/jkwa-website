import Image from "next/image";
import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Phone, Printer, type LucideIcon } from "lucide-react";
import { getSettings } from "@/lib/data";
import { placeholderImages } from "@/lib/placeholder-images";

const image = placeholderImages.contact;

const linkClass =
  "underline-offset-4 transition-colors hover:text-gold-deep hover:underline focus-visible:text-gold-deep focus-visible:underline";

function Row({ Icon, children }: { Icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <Icon aria-hidden size={20} strokeWidth={1.25} className="mt-0.5 shrink-0 text-gold" />
      <div className="min-w-0">{children}</div>
    </li>
  );
}

export default async function Contact() {
  const settings = await getSettings();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.addressLines.join(", "),
  )}`;

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      // Phone: image → dark → light, stacked. md: image on top, then dark | light.
      // lg: three equal-height panels, 32% | 34% | 34%.
      className="grid md:grid-cols-2 lg:min-h-[420px] lg:grid-cols-[32fr_34fr_34fr]"
    >
      <div className="relative aspect-[16/10] md:col-span-2 md:aspect-[21/9] lg:col-span-1 lg:aspect-auto">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 32vw, 100vw"
          className="object-cover"
          style={{ objectPosition: image.objectPosition }}
        />
      </div>

      {/* Dark panel */}
      <div className="bg-night px-5 py-10 xs:px-6 md:p-12 xl:p-14">
        {/* No dash here, as in the mockup; it also keeps the long line from wrapping awkwardly on tablet */}
        <p className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-white/60 md:text-xs">
          Let&apos;s Create Something Beautiful
        </p>
        <h2
          id="contact-heading"
          className="mt-4 font-display text-[clamp(2rem,1.6rem+1.2vw,2.5rem)] font-normal leading-[1.15] text-white"
        >
          Get In Touch
        </h2>
        <div className="mt-5 space-y-4 font-sans text-sm font-light leading-[1.8] text-white/75">
          <p>
            Whether you are renovating a condominium, landed property, office, restaurant, retail
            space, or boutique hotel, our Japanese interior designers create bespoke environments that
            reflect both your lifestyle and your personality.
          </p>
          <p>We invite you to begin the journey with us.</p>
        </div>
        <div className="mt-8 border-l border-gold pl-4">
          <p className="font-sans text-xs text-white/60">Projects starting from</p>
          <p className="mt-1 font-display text-[30px] leading-tight text-white lining-nums">S$100,000</p>
        </div>
      </div>

      {/* Light panel: gold line 40px from the left on md+, a short horizontal line on phones */}
      <div className="flex items-center bg-stone px-5 py-10 xs:px-6 md:px-10 md:py-12 xl:py-14">
        <div className="relative w-full pt-9 md:pt-0 md:pl-12">
          <span aria-hidden className="absolute top-0 left-0 h-px w-12 bg-gold md:hidden" />
          <span aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-gold md:block" />

          <p className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-muted md:text-xs">
            Contact: {settings.contactPerson}
          </p>
          <address className="not-italic">
            <ul className="mt-6 space-y-5 font-sans text-sm leading-[1.7] text-body">
              <Row Icon={MapPin}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {settings.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="sr-only"> (opens Google Maps)</span>
                </a>
              </Row>
              <Row Icon={Phone}>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className={linkClass}>
                  {settings.phone}
                </a>
              </Row>
              <Row Icon={Printer}>
                <span>
                  <span className="sr-only">Fax: </span>
                  {settings.fax}
                </span>
              </Row>
              <Row Icon={Mail}>
                <a href={`mailto:${settings.email}`} className={`break-all ${linkClass}`}>
                  {settings.email}
                </a>
              </Row>
              <Row Icon={Clock}>{settings.hours}</Row>
            </ul>
          </address>
        </div>
      </div>
    </section>
  );
}
