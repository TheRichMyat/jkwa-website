"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ImageOff } from "lucide-react";
import { SortableArea, SortableItem } from "@/components/admin/Sortable";
import { useToast } from "@/components/admin/Toaster";
import { Badge, buttonClass } from "@/components/admin/ui";
import type { AdminProjectSummary } from "@/lib/admin/types";
import { reorderProjects } from "../../_actions/projects";

const CATEGORY = { residential: "Residential", commercial: "Commercial" } as const;

export default function ProjectList({ initial }: { initial: AdminProjectSummary[] }) {
  const [projects, setProjects] = useState(initial);
  const [saving, startSaving] = useTransition();
  const toast = useToast();

  const onReorder = (next: AdminProjectSummary[]) => {
    const previous = projects;
    setProjects(next);
    startSaving(async () => {
      const result = await reorderProjects(next.map((p) => p.id));
      if (result.ok) toast.success("Order saved");
      else {
        setProjects(previous);
        toast.error(result.error);
      }
    });
  };

  return (
    <div aria-busy={saving} className="flex flex-col gap-2.5">
      <SortableArea items={projects} onReorder={onReorder}>
        {projects.map((p) => (
          <SortableItem key={p.id} id={p.id} label={`Move ${p.title}`} className="rounded-sm border border-line bg-white">
            {(handle) => (
              <div className="flex items-center gap-2 p-2 pr-3 sm:gap-4 sm:pr-4">
                {handle}
                <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-sm bg-stone sm:w-28">
                  {p.cover ? (
                    <Image src={p.cover.url} alt="" fill sizes="112px" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-muted">
                      <ImageOff aria-hidden className="size-5" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[15px] font-medium text-ink sm:text-base">{p.title}</p>
                  <p className="truncate font-sans text-[13px] text-muted">
                    {p.location} · {CATEGORY[p.category]}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.published ? (
                      <Badge tone="green">Visible</Badge>
                    ) : p.cover ? (
                      <Badge tone="grey">Draft</Badge>
                    ) : (
                      <Badge tone="amber">Draft — incomplete</Badge>
                    )}
                    {p.featured && <Badge tone="gold">On home page</Badge>}
                  </div>
                </div>
                <Link href={`/admin/projects/${p.id}`} className={buttonClass("secondary", "shrink-0 px-4")}>
                  Edit
                </Link>
              </div>
            )}
          </SortableItem>
        ))}
      </SortableArea>
    </div>
  );
}
