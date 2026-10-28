import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import type { ProjectStory as Story } from "@/lib/data";
import { toParagraphs } from "@/lib/text";

/** "The Project": eyebrow + optional heading | paragraphs. Renders nothing without a story. */
export default function ProjectStory({ story }: { story?: Story }) {
  if (!story) return null;

  return (
    <section aria-label="The project" className="bg-paper py-16 md:py-20 lg:py-24">
      <Container className="grid gap-8 lg:grid-cols-[40fr_60fr] lg:gap-16">
        <Reveal>
          <Eyebrow line="before">The Project</Eyebrow>
          {story.heading && (
            <h2 className="mt-4 max-w-[420px] font-display text-[clamp(1.875rem,1.4rem+1.5vw,2.75rem)] font-normal leading-[1.15] text-ink text-balance">
              {story.heading}
            </h2>
          )}
        </Reveal>
        <Reveal className="max-w-[560px] space-y-5 font-sans text-[15px] font-light leading-[1.8] text-body md:text-base">
          {toParagraphs(story.body).map((parts, i) => (
            <p key={i}>{parts}</p>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
