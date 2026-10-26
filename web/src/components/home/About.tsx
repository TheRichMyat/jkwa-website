import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionHeading from "@/components/ui/SectionHeading";
import { placeholderImages } from "@/lib/placeholder-images";
import WaPanel from "./WaPanel";

const image = placeholderImages.about;

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-paper py-16 md:py-20 lg:py-24">
      {/*
        Phone: text → image → WA panel, stacked.
        md: text across the top, then image (≈62%) + WA panel (≈38%).
        lg: three columns, text ≈32% | image ≈40% | WA panel ≈20%.
      */}
      <Container className="grid gap-10 md:grid-cols-[62fr_38fr] md:gap-x-12 md:gap-y-12 lg:grid-cols-[32fr_40fr_20fr] lg:items-start">
        <div className="md:col-span-2 lg:col-span-1 lg:pt-9">
          <Eyebrow>About Us</Eyebrow>
          <SectionHeading id="about-heading" className="mt-4">
            The Philosophy <span className="block">Behind Our Design</span>
          </SectionHeading>
          <div className="mt-6 max-w-[560px] space-y-5 font-sans text-[15px] font-light leading-[1.7] text-body md:text-base md:leading-[1.75] lg:max-w-none">
            <p>
              Japanese interiors are built upon centuries of philosophy and craftsmanship. They
              embrace balance, simplicity, natural materials, and an understated elegance that never
              goes out of style.
            </p>
            <p>
              By incorporating the spirit of WA into your home or commercial space, you can create an
              environment that brings peace, balance, and timeless sophistication to everyday life.
              Imagine returning home to a place where every line has purpose, every material tells a
              story, and every space invites calm.
            </p>
          </div>
        </div>

        {/* Subgrid so the WA panel centres on the image, not on the (taller) text column */}
        <div className="grid gap-10 md:col-span-2 md:grid-cols-subgrid md:items-center md:gap-x-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[1.28/1]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1340px) 497px, (min-width: 1024px) 40vw, (min-width: 768px) 58vw, 100vw"
              className="object-cover"
              style={{ objectPosition: image.objectPosition }}
            />
          </div>

          <WaPanel />
        </div>
      </Container>
    </section>
  );
}
