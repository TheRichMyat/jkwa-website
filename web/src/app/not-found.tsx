import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WaKanji from "@/components/brand/WaKanji";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** Any unknown address. Served with a real HTTP 404. */
export default function NotFound() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <Container className="text-center">
        <span lang="ja" aria-hidden="true" className="inline-block text-gold-light">
          <WaKanji className="h-12" />
        </span>
        <h1 className="mt-6 font-display text-[clamp(2rem,1.6rem+1.2vw,2.75rem)] font-normal leading-[1.15] text-ink">
          This page can&apos;t be found
        </h1>
        <p className="mx-auto mt-4 max-w-[440px] font-sans text-[15px] font-light leading-[1.7] text-body md:text-base">
          The address may be mistyped, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-10">
          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-2.5 font-sans text-[13px] uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-ink"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 stroke-[1.5] transition-transform duration-200 group-hover:-translate-x-[3px]"
            />
            Back to home
          </Link>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center font-sans text-[13px] uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-ink"
          >
            See our projects
          </Link>
        </div>
      </Container>
    </section>
  );
}
