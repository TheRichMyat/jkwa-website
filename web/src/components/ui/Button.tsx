import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export type ButtonVariant = "primary" | "outline" | "outline-dark";
export type ButtonSize = "md" | "sm";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon, e.g. <BookOpen /> */
  icon?: ReactNode;
  trailingArrow?: boolean;
  className?: string;
  onClick?: () => void;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold-deep text-white hover:bg-[#765936]",
  outline: "border border-ink/20 text-ink hover:bg-ink/5",
  "outline-dark": "border border-white/60 text-white hover:bg-white/10",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-[22px]",
  sm: "h-10 px-[18px]",
};

const isExternal = (href: string) => /^(https?:)?\/\//.test(href);

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  icon,
  trailingArrow = false,
  className = "",
  onClick,
}: ButtonProps) {
  const classes = `group inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-sans text-[13px] font-normal tracking-[0.02em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5] ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {icon}
      <span>{children}</span>
      {trailingArrow && (
        <ArrowRight
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-[3px]"
        />
      )}
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      onClick={onClick}
      {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
