import Image from "next/image";
import { Gem, House, Layers, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionHeading from "@/components/ui/SectionHeading";
import { placeholderImages } from "@/lib/placeholder-images";

const image = placeholderImages.services;

const FEATURES: { Icon: LucideIcon; title: string; text: [string, string] }[] = [
  { Icon: House, title: "Tailored Planning", text: ["For your lifestyle", "and budget."] },
  { Icon: Layers, title: "Premium Materials", text: ["Quality and", "lasting beauty."] },
  { Icon: Gem, title: "On-Time Delivery", text: ["Without", "compromise."] },
];

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="relative bg-stone">
      {/*
        Phone: image on top (4:3), tablet: on top (16:9), both full-bleed.
        lg: the image is pinned to the right edge of the viewport (≈47vw) and
        fills the section, whose height comes from the left content.
      */}
      <div className="relative aspect-[4/3] w-full md:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[47vw]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 47vw, 100vw"
          className="object-cover"
          style={{ objectPosition: image.objectPosition }}
        />
      </div>

      <Container className="py-16 md:py-20 lg:py-24">
        <div className="lg:w-1/2 lg:pr-12">
          <div className="max-w-[560px]">
            <Eyebrow>Our Services</Eyebrow>
            <SectionHeading id="services-heading" className="mt-4">
              Design &amp; Build <span className="block">for Residential &amp; Commercial</span>
            </SectionHeading>
            <div className="mt-6 space-y-5 font-sans text-[15px] font-light leading-[1.7] text-body md:text-base md:leading-[1.75]">
              <p>
                We offer Design &amp; Build services for both residential and commercial properties.
                Our quotations are carefully tailored to suit your budget while maintaining
                outstanding quality and excellent value. We are committed to completing every project
                on schedule without compromising workmanship.
              </p>
              <p>
                We never cut corners. Every project begins with thorough planning and careful
                preparation, using quality materials selected for durability, functionality, and
                lasting beauty.
              </p>
            </div>
            <p className="mt-6 font-display text-xl italic leading-snug text-gold-deep">
              We look forward to creating a space that is uniquely yours.
            </p>

            {/* Below 520px a list of rows; from 520px three columns with vertical dividers */}
            <ul className="mt-10 divide-y divide-line min-[32.5rem]:grid min-[32.5rem]:grid-cols-3 min-[32.5rem]:divide-x min-[32.5rem]:divide-y-0">
              {FEATURES.map(({ Icon, title, text }) => (
                <li
                  key={title}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0 min-[32.5rem]:block min-[32.5rem]:py-0 min-[32.5rem]:pl-5 min-[32.5rem]:first:pl-0 min-[32.5rem]:pr-3 xl:pl-7"
                >
                  <Icon aria-hidden size={28} strokeWidth={1.25} className="shrink-0 text-gold" />
                  <div className="min-[32.5rem]:mt-4">
                    <p className="font-sans text-sm font-medium text-ink">{title}</p>
                    <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-muted">
                      {text[0]} <span className="min-[32.5rem]:block">{text[1]}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
