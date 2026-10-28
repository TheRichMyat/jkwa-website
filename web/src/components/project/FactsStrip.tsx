import Container from "@/components/ui/Container";
import type { Project } from "@/lib/data";

// Literal class strings so Tailwind can find them: one equal column per fact on desktop
const LG_COLS = [
  "",
  "lg:grid-cols-1",
  "lg:grid-cols-2",
  "lg:grid-cols-3",
  "lg:grid-cols-4",
  "lg:grid-cols-5",
  "lg:grid-cols-6",
];

/**
 * Facts in a fixed order, skipping empty ones (location is always present).
 * Phone: 2 columns with horizontal lines between rows. Tablet: 3 per row.
 * Desktop: one row, evenly spread, gold vertical dividers.
 */
export default function FactsStrip({ project }: { project: Project }) {
  const { propertyType, sizeSqft, duration, scope, year } = project.facts;
  const items = [
    { label: "Property", value: propertyType },
    { label: "Location", value: project.location },
    { label: "Size", value: sizeSqft ? `${sizeSqft.toLocaleString("en-US")} sq ft` : undefined },
    { label: "Duration", value: duration },
    { label: "Scope", value: scope },
    { label: "Year", value: year ? String(year) : undefined },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <section aria-label="Project facts" className="border-b border-line bg-paper">
      <Container>
        <dl className={`grid grid-cols-2 py-4 md:grid-cols-3 md:py-5 lg:py-8 ${LG_COLS[items.length]}`}>
          {items.map((item, i) => (
            <div
              key={item.label}
              className={[
                "min-w-0 py-4 lg:py-0",
                // Phone: rows separated by a hairline; the second column gets a gap
                i >= 2 ? "border-t border-t-line" : "",
                i % 2 === 1 ? "pl-5" : "",
                // Tablet: 3 per row, gold divider inside a row, hairline between rows
                i >= 3 ? "md:border-t md:border-t-line" : "md:border-t-0",
                i % 3 !== 0 ? "md:border-l md:border-l-gold/60 md:pl-6" : "md:border-l-0 md:pl-0",
                // Desktop: a single row, gold dividers between every item
                "lg:border-t-0",
                i > 0 ? "lg:border-l lg:border-l-gold/60 lg:pl-6 xl:pl-8" : "lg:border-l-0 lg:pl-0",
              ].join(" ")}
            >
              <dt className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted">{item.label}</dt>
              <dd className="mt-1.5 font-display text-[19px] italic leading-snug text-ink lining-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
