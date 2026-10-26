import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionHeading from "@/components/ui/SectionHeading";
import { getFeaturedProjects } from "@/lib/data";
import PortfolioCarousel from "./PortfolioCarousel";

export default async function Portfolio() {
  const projects = await getFeaturedProjects();

  const header = (
    <div>
      <Eyebrow>Featured Projects</Eyebrow>
      <SectionHeading id="portfolio-heading" className="mt-4">
        Our Latest Projects
      </SectionHeading>
    </div>
  );

  return (
    <section id="portfolio" aria-labelledby="portfolio-heading" className="bg-paper py-16 md:py-20 lg:py-24">
      <Container>
        {/* No featured projects: just the heading and the link to the full list */}
        {projects.length > 0 ? <PortfolioCarousel projects={projects} header={header} /> : header}

        <div className="mt-8 flex justify-center md:mt-7 md:justify-end">
          <Link
            href="/projects"
            className="group inline-flex min-h-11 w-full items-center justify-center gap-2.5 font-sans text-[13px] uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-ink md:w-auto"
          >
            View All Projects
            <ArrowRight
              aria-hidden
              className="size-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-[3px]"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
