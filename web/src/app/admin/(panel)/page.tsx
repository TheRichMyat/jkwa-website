import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Images, LayoutGrid, Plus, HardDrive, Phone } from "lucide-react";
import { buttonClass, PageTitle } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import { storageUsedBytes } from "@/lib/admin/media";

export const metadata: Metadata = { title: "Dashboard" };

// Admin data, per request (see the panel layout)
export const instant = false;

// Supabase Free plan storage
const STORAGE_LIMIT_BYTES = 1024 ** 3;

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

export default async function DashboardPage() {
  const supabase = await requireAdminPage();

  const [projects, slides, usedBytes] = await Promise.all([
    supabase.from("projects").select("published"),
    supabase.from("hero_slides").select("id", { count: "exact", head: true }),
    storageUsedBytes().catch((error) => {
      console.error("[admin] Storage usage failed:", error);
      return null;
    }),
  ]);

  const rows = (projects.data ?? []) as { published: boolean }[];
  const published = rows.filter((p) => p.published).length;
  const drafts = rows.length - published;

  const share = usedBytes === null ? 0 : usedBytes / STORAGE_LIMIT_BYTES;
  const meterTone = share > 0.9 ? "bg-red-700" : share > 0.7 ? "bg-amber-500" : "bg-gold-deep";
  const textTone = share > 0.9 ? "text-red-700" : share > 0.7 ? "text-amber-700" : "text-ink";

  return (
    <>
      <PageTitle>Dashboard</PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card icon={<LayoutGrid aria-hidden className="size-5" />} label="Projects" href="/admin/projects">
          <p className="font-display text-[2.5rem] leading-none text-ink">{rows.length}</p>
          <p className="mt-2 font-sans text-sm text-muted">
            {published} visible · {drafts} {drafts === 1 ? "draft" : "drafts"}
          </p>
        </Card>

        <Card icon={<Images aria-hidden className="size-5" />} label="Hero slides" href="/admin/hero">
          <p className="font-display text-[2.5rem] leading-none text-ink">{slides.count ?? 0}</p>
          <p className="mt-2 font-sans text-sm text-muted">on the home page</p>
        </Card>

        <Card icon={<HardDrive aria-hidden className="size-5" />} label="Photo storage">
          {usedBytes === null ? (
            <p className="font-sans text-sm text-muted">Couldn&apos;t read storage right now.</p>
          ) : (
            <>
              <p className={`font-sans text-lg font-medium ${textTone}`}>
                {formatBytes(usedBytes)} <span className="font-normal text-muted">of 1 GB</span>
              </p>
              <div
                role="meter"
                aria-label="Photo storage used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(share * 100)}
                className="mt-3 h-2 overflow-hidden rounded-full bg-stone"
              >
                <div className={`h-full rounded-full ${meterTone}`} style={{ width: `${Math.min(100, share * 100)}%` }} />
              </div>
              {share > 0.7 && (
                <p className={`mt-2 font-sans text-[13px] ${textTone}`}>
                  Storage is filling up. Remove photos you no longer need.
                </p>
              )}
            </>
          )}
        </Card>
      </div>

      <h2 className="mt-10 mb-4 font-sans text-lg font-medium text-ink">Quick actions</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/admin/projects/new" className={buttonClass("primary")}>
          <Plus aria-hidden className="size-4" /> Add a project
        </Link>
        <Link href="/admin/settings" className={buttonClass("secondary")}>
          <Phone aria-hidden className="size-4" /> Edit contact details
        </Link>
        <a href="/" target="_blank" rel="noopener" className={buttonClass("secondary")}>
          View website <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
    </>
  );
}

function Card({
  icon,
  label,
  href,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-line bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 font-sans text-sm text-body">
          <span className="text-gold-deep">{icon}</span>
          {label}
        </span>
        {href && (
          <Link href={href} className="font-sans text-[13px] text-gold-deep hover:text-ink">
            Manage
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
