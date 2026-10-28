"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import Container from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import type { Project, ProjectCategory } from "@/lib/data";
import ProjectCard from "./ProjectCard";

type Filter = "all" | ProjectCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
];
const PAGE_SIZE = 9;
const FADE_MS = 250;

const hrefFor = (f: Filter) => (f === "all" ? "/projects" : `/projects?type=${f}`);
const toFilter = (value: string | null): Filter =>
  value === "residential" || value === "commercial" ? value : "all";

/**
 * Reads ?type= and drives the filter. Rendered inside <Suspense>; its fallback is
 * <ProjectsView filter="all">, so the full list is still in the prerendered HTML.
 */
export default function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const filter = toFilter(useSearchParams().get("type"));
  const gridRef = useRef<HTMLDivElement>(null);

  // Fade the grid out, then switch the URL (pushState keeps history + back button
  // and integrates with useSearchParams without a server round trip). The new grid
  // mounts with a fade-in. No scroll change.
  const select = (e: MouseEvent, next: Filter) => {
    e.preventDefault();
    if (next === filter) return;
    const go = () => window.history.pushState(null, "", hrefFor(next));
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return go();
    grid.style.transition = `opacity ${FADE_MS}ms var(--ease-out-soft)`;
    grid.style.opacity = "0";
    window.setTimeout(go, FADE_MS);
  };

  return <ProjectsView projects={projects} filter={filter} onSelect={select} gridRef={gridRef} />;
}

interface ProjectsViewProps {
  projects: Project[];
  filter: Filter;
  onSelect?: (e: MouseEvent, next: Filter) => void;
  gridRef?: React.Ref<HTMLDivElement>;
}

export function ProjectsView({ projects, filter, onSelect, gridRef }: ProjectsViewProps) {
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const count = visible.length;

  return (
    <>
      <FilterBar filter={filter} count={count} onSelect={onSelect} />
      {/* Keyed by filter: remounts with a fade-in and resets "Load More" to 9 */}
      <Grid key={filter} ref={gridRef} projects={visible} filter={filter} onSelect={onSelect} />
    </>
  );
}

function FilterBar({
  filter,
  count,
  onSelect,
}: {
  filter: Filter;
  count: number;
  onSelect?: ProjectsViewProps["onSelect"];
}) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  // Slide the 2px gold underline under the active tab: transform only (a 100px
  // bar scaled to the tab's width), so it glides instead of jumping.
  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const bar = underlineRef.current;
    if (!tabs || !bar) return;
    const place = () => {
      const tab = tabs.querySelector<HTMLElement>(`[data-filter="${filter}"]`);
      if (!tab) return;
      bar.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth / 100})`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(tabs);
    return () => ro.disconnect();
  }, [filter]);

  return (
    <Container className="flex flex-col gap-3 pt-10 md:flex-row md:items-end md:justify-between md:pt-12">
      <nav aria-label="Filter projects">
        <div ref={tabsRef} className="relative grid grid-cols-3 md:flex md:gap-10">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={hrefFor(f.id)}
              data-filter={f.id}
              scroll={false}
              aria-current={f.id === filter ? "page" : undefined}
              onClick={onSelect ? (e) => onSelect(e, f.id) : undefined}
              className={`flex min-h-11 items-center justify-center pb-1 font-sans text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 xs:tracking-[0.18em] md:justify-start md:px-0 md:text-xs md:tracking-[0.24em] ${
                f.id === filter ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {f.label}
            </Link>
          ))}
          <span
            ref={underlineRef}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-[100px] origin-left bg-gold transition-transform duration-300 ease-[var(--ease-out-soft)] motion-reduce:transition-none"
          />
        </div>
      </nav>
      <p className="text-right font-sans text-[13px] text-muted md:pb-3" aria-live="polite">
        {count} {count === 1 ? "Project" : "Projects"}
      </p>
    </Container>
  );
}

function Grid({
  ref,
  projects,
  filter,
  onSelect,
}: {
  ref?: React.Ref<HTMLDivElement>;
  projects: Project[];
  filter: Filter;
  onSelect?: ProjectsViewProps["onSelect"];
}) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

  const loadMore = () => {
    const firstNew = shown;
    setShown((n) => n + PAGE_SIZE);
    // Move keyboard focus to the first new card without scrolling the page
    requestAnimationFrame(() =>
      listRef.current?.querySelectorAll<HTMLElement>("li a")[firstNew]?.focus({ preventScroll: true }),
    );
  };

  return (
    <div ref={ref} className="motion-safe:animate-[grid-in_250ms_var(--ease-out-soft)]">
      <Container className="pt-8 pb-20 md:pt-10 md:pb-24">
        {projects.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-ink">New projects coming soon.</p>
            {filter !== "all" && (
              <Link
                href="/projects"
                scroll={false}
                onClick={onSelect ? (e) => onSelect(e, "all") : undefined}
                className="mt-4 inline-flex min-h-11 items-center font-sans text-[13px] uppercase tracking-[0.2em] text-gold-deep underline-offset-4 hover:underline"
              >
                View all projects
              </Link>
            )}
          </div>
        ) : (
          <>
            <ul ref={listRef} className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, shown).map((project, i) => (
                <Reveal as="li" key={project.id} index={i % PAGE_SIZE}>
                  <ProjectCard project={project} eager={i === 0 ? "high" : i < 3 ? "auto" : undefined} />
                </Reveal>
              ))}
            </ul>
            {shown < projects.length && (
              <div className="mt-14 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-flex h-11 items-center rounded-full border border-ink/20 px-8 font-sans text-[13px] tracking-[0.02em] text-ink transition-colors duration-300 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Load More Projects
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
