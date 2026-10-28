import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  /**
   * Where the 40px gold line goes. Defaults: "after" when left-aligned (home
   * page), "both" when centred. The projects pages use "before" (their mockups).
   */
  line?: "after" | "before" | "both";
  className?: string;
}

/** Uppercase label with a 40px gold line. */
export default function Eyebrow({
  children,
  tone = "light",
  align = "left",
  line = align === "center" ? "both" : "after",
  className = "",
}: EyebrowProps) {
  const rule = <span aria-hidden className="h-px w-10 shrink-0 bg-gold" />;
  return (
    <p
      className={`flex items-center gap-3 font-sans text-[10.5px] font-normal uppercase tracking-[0.28em] md:text-xs ${
        tone === "dark" ? "text-white/60" : "text-muted"
      } ${align === "center" ? "justify-center text-center" : ""} ${className}`}
    >
      {line !== "after" && rule}
      <span>{children}</span>
      {line !== "before" && rule}
    </p>
  );
}
