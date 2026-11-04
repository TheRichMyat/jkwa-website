import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import { getAdminHeroSlides } from "@/lib/admin/queries";
import HeroEditor from "./HeroEditor";

export const metadata: Metadata = { title: "Hero slides" };

// Admin data, per request (see the panel layout)
export const instant = false;

export default async function HeroPage() {
  const supabase = await requireAdminPage();
  const slides = await getAdminHeroSlides(supabase);

  return (
    <>
      <PageTitle>Hero slides</PageTitle>
      <p className="mb-6 max-w-2xl font-sans text-sm leading-relaxed text-body">
        The large photos at the top of the home page. Wide landscape photos work best (at least
        2000px wide). The first slide loads first.
      </p>
      <HeroEditor initial={slides} />
    </>
  );
}
