import About from "@/components/home/About";
import DesignerQuotes from "@/components/home/DesignerQuotes";
import Hero from "@/components/home/Hero";

// Placeholders until Phase 3 builds these sections
const PLACEHOLDERS = [
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <DesignerQuotes />
      {PLACEHOLDERS.map((section, i) => (
        <section
          key={section.id}
          id={section.id}
          aria-label={section.label}
          className={`flex min-h-[400px] items-center justify-center border-b border-line ${
            i % 2 ? "bg-paper" : "bg-stone"
          }`}
        >
          <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted">
            {section.label}
          </p>
        </section>
      ))}
    </>
  );
}
