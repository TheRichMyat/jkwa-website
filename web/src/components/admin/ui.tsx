// Small building blocks shared by every admin screen. Site tokens only:
// paper/ink/line, gold-deep for primary actions, Jost for UI.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-gold-deep text-white hover:bg-ink",
  secondary: "border border-line bg-white text-ink hover:border-gold-deep hover:text-gold-deep",
  danger: "bg-red-700 text-white hover:bg-red-800",
  ghost: "text-ink hover:text-gold-deep",
};

export const buttonClass = (variant: Variant = "primary", extra = "") =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 font-sans text-[13px] font-medium tracking-[0.06em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT[variant]} ${extra}`;

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pending?: boolean;
}

/** Shows a spinner and stays disabled while `pending` */
export function AdminButton({
  variant = "primary",
  pending = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClass(variant, className)}
      {...props}
    >
      {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export const inputClass =
  "block w-full rounded-sm border border-line bg-white px-3.5 py-2.5 font-sans text-[15px] text-ink placeholder:text-muted/70 focus:border-gold-deep focus:outline-none focus:ring-1 focus:ring-gold-deep aria-invalid:border-red-700";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block font-sans text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-gold-deep">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 font-sans text-[13px] leading-snug text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 font-sans text-[13px] leading-snug text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** One form section, styled as a card with a heading */
export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-sm border border-line bg-white p-5 md:p-7 ${className}`}>
      <h2 className="font-sans text-lg font-medium text-ink">{title}</h2>
      {description && <p className="mt-1 font-sans text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <h1 className="font-display text-[2rem] font-normal leading-tight text-ink md:text-[2.5rem]">
        {children}
      </h1>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "grey" | "gold" | "amber"; children: ReactNode }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    grey: "bg-stone text-body border-line",
    gold: "bg-[#f6efe4] text-gold-deep border-gold-light",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

interface SwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** An on/off switch with its label and an optional line of help */
export function Switch({ id, label, description, checked, onChange, disabled }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="font-sans text-[15px] font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 font-sans text-[13px] leading-snug text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60 ${
          checked ? "bg-gold-deep" : "bg-line"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/** After a failed save: bring the first highlighted field into view */
export function focusFirstError() {
  requestAnimationFrame(() => {
    const field = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
  });
}
