import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  id?: string;
}

/** Section h2: Cormorant, 44px at desktop, scaling down to 30px on mobile. */
export default function SectionHeading({
  children,
  tone = "light",
  className = "",
  id,
}: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={`font-display text-[clamp(1.875rem,1.4rem+1.5vw,2.75rem)] font-normal leading-[1.15] ${
        tone === "dark" ? "text-white" : "text-ink"
      } ${className}`}
    >
      {children}
    </h2>
  );
}
