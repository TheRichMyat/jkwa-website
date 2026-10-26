import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}

/** Uppercase label with a 40px gold line (on both sides when centred). */
export default function Eyebrow({
  children,
  tone = "light",
  align = "left",
  className = "",
}: EyebrowProps) {
  const line = <span aria-hidden className="h-px w-10 shrink-0 bg-gold" />;
  return (
    <p
      className={`flex items-center gap-3 font-sans text-[10.5px] font-normal uppercase tracking-[0.28em] md:text-xs ${
        tone === "dark" ? "text-white/60" : "text-muted"
      } ${align === "center" ? "justify-center text-center" : ""} ${className}`}
    >
      {align === "center" && line}
      <span>{children}</span>
      {line}
    </p>
  );
}
