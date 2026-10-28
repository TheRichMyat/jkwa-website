import BookletButton from "@/components/ui/BookletButton";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import QuestionnaireButton from "@/components/ui/QuestionnaireButton";
import { Reveal } from "@/components/motion/Reveal";
import { getSettings } from "@/lib/data";

/** Dark "Let's Create Something Beautiful" band used on the projects pages. */
export default async function CtaBand() {
  const { bookletUrl, questionnaireUrl } = await getSettings();

  return (
    <section aria-labelledby="cta-heading" className="bg-night py-16 lg:py-[88px]">
      <Container>
        <Reveal className="text-center">
          <Eyebrow tone="dark" align="center" line="before">
            Planning a Similar Space?
          </Eyebrow>
          <h2
            id="cta-heading"
            className="mt-4 font-display text-[clamp(2rem,1.6rem+1.2vw,2.5rem)] font-normal leading-[1.15] text-white"
          >
            Let&apos;s Create Something Beautiful
          </h2>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <BookletButton url={bookletUrl} className="w-full sm:w-auto" />
            <QuestionnaireButton url={questionnaireUrl} tone="dark" className="w-full sm:w-auto" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
