// Phase 1 skeleton: labelled placeholders so the header nav can be tested.
// Each section is replaced by its real component in Phases 2–3.
const SECTIONS = [
  { id: "home", label: "Hero" },
  { id: "about", label: "About" },
  { id: "designers", label: "Designer Quotes" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      {SECTIONS.map((section, i) => (
        <section
          key={section.id}
          id={section.id}
          aria-label={section.label}
          className={`flex min-h-[400px] items-center justify-center border-b border-line ${
            i % 2 ? "bg-stone" : "bg-paper"
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
