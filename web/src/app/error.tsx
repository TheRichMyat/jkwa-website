"use client";

import Link from "next/link";
import { useEffect } from "react";
import WaKanji from "@/components/brand/WaKanji";
import Container from "@/components/ui/Container";

/** Something went wrong while rendering a page: offer a retry instead of a blank screen */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-paper py-24 md:py-32">
      <Container className="text-center">
        <span lang="ja" aria-hidden="true" className="inline-block text-gold-light">
          <WaKanji className="h-12" />
        </span>
        <h1 className="mt-6 font-display text-[clamp(2rem,1.6rem+1.2vw,2.75rem)] font-normal leading-[1.15] text-ink">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-[440px] font-sans text-[15px] font-light leading-[1.7] text-body md:text-base">
          Sorry, this page didn&apos;t load properly. Please try again in a moment.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-10">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center bg-gold-deep px-7 font-sans text-[13px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-ink"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-sans text-[13px] uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-ink"
          >
            Back to home
          </Link>
        </div>
      </Container>
    </section>
  );
}
