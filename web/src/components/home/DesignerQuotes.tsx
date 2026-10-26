import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionHeading from "@/components/ui/SectionHeading";
import { DESIGNER_QUOTES } from "@/lib/content/designers";
import QuoteCarousel from "./QuoteCarousel";

export default function DesignerQuotes() {
  return (
    <section id="designers" aria-labelledby="designers-heading" className="bg-paper pb-16 md:pb-20 lg:pb-24">
      <Container>
        <div aria-hidden className="h-px bg-line" />
        <div className="pt-16 text-center md:pt-20 lg:pt-24">
          <Eyebrow align="center">Our Designers</Eyebrow>
          <SectionHeading id="designers-heading" className="mt-4 text-balance">
            The People Behind the Harmony
          </SectionHeading>
        </div>
        <div className="mt-10 md:mt-12">
          <QuoteCarousel quotes={DESIGNER_QUOTES} />
        </div>
      </Container>
    </section>
  );
}
