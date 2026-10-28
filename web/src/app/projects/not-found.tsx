import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WaKanji from "@/components/brand/WaKanji";
import Container from "@/components/ui/Container";

/** Unknown or unpublished project. */
export default function ProjectNotFound() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <Container className="text-center">
        <span lang="ja" aria-hidden="true" className="inline-block text-gold-light">
          <WaKanji className="h-12" />
        </span>
        <h1 className="mt-6 font-display text-[clamp(2rem,1.6rem+1.2vw,2.75rem)] font-normal leading-[1.15] text-ink">
          This project isn&apos;t available
        </h1>
        <p className="mx-auto mt-4 max-w-[440px] font-sans text-[15px] font-light leading-[1.7] text-body md:text-base">
          It may have been moved or is no longer on display.
        </p>
        <Link
          href="/projects"
          className="group mt-8 inline-flex min-h-11 items-center gap-2.5 font-sans text-[13px] uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-ink"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 stroke-[1.5] transition-transform duration-200 group-hover:-translate-x-[3px]"
          />
          Back to all projects
        </Link>
      </Container>
    </section>
  );
}
