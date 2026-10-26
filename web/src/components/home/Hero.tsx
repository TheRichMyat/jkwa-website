import BookletButton from "@/components/ui/BookletButton";
import Container from "@/components/ui/Container";
import QuestionnaireButton from "@/components/ui/QuestionnaireButton";
import { getHeroSlides, getSettings } from "@/lib/data";
import HeroCarousel from "./HeroCarousel";

// 120ms stagger for the on-load fade-up (skipped under reduced motion)
const delay = (step: number) => ({ animationDelay: `${step * 120}ms` });

export default async function Hero() {
  const [slides, settings] = await Promise.all([getHeroSlides(), getSettings()]);

  return (
    <HeroCarousel slides={slides}>
      {/* pointer-events-none lets swipes reach the carousel; the buttons opt back in */}
      <Container className="pointer-events-none relative z-10 flex h-full items-end pb-12 md:items-center md:pb-0">
        <div className="max-w-[560px]">
          <p
            className="animate-fade-up font-sans text-[10.5px] uppercase tracking-[0.28em] text-white/80 md:text-xs"
            style={delay(0)}
          >
            Timeless spaces. Lasting impressions.
          </p>
          <h1
            className="mt-4 animate-fade-up font-display text-[clamp(2.5rem,1.6rem+3vw,4rem)] font-normal leading-[1.1] text-white md:mt-5"
            style={delay(1)}
          >
            Japanese Inspired <span className="md:block">Interior Design</span>
          </h1>
          <p
            className="mt-5 max-w-[440px] animate-fade-up font-sans text-[15px] leading-[1.7] text-white/85 md:mt-6 md:text-[17px]"
            style={delay(2)}
          >
            Blending traditional values with modern living, we create spaces that bring balance,
            beauty and a sense of peace to your everyday life.
          </p>
          <div
            className="pointer-events-auto mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row md:mt-10"
            style={delay(3)}
          >
            <BookletButton url={settings.bookletUrl} trailingArrow className="w-full sm:w-auto" />
            <QuestionnaireButton
              url={settings.questionnaireUrl}
              tone="dark"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </Container>
    </HeroCarousel>
  );
}
