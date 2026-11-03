"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { slugify } from "@/lib/admin/slug";
import { Field, inputClass } from "./ui";

export interface Basics {
  title: string;
  category: "residential" | "commercial" | "";
  location: string;
  slug: string;
}

interface BasicsFieldsProps {
  value: Basics;
  onChange: (value: Basics) => void;
  errors?: Record<string, string>;
  /** Keep the page address in step with the title until it's edited by hand */
  autoSlug: boolean;
  onAutoSlugChange?: (auto: boolean) => void;
  /** The project is visible and already has an address: changing it breaks old links */
  liveSlug?: string;
}

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL || "https://jkwa.netlify.app").replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Title, category, location and page address, shared by "new" and "edit" */
export default function BasicsFields({
  value,
  onChange,
  errors = {},
  autoSlug,
  onAutoSlugChange,
  liveSlug,
}: BasicsFieldsProps) {
  const [showSlug, setShowSlug] = useState(Boolean(errors.slug));
  const set = (patch: Partial<Basics>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Title" htmlFor="title" required error={errors.title} className="md:col-span-2">
        <input
          id="title"
          value={value.title}
          maxLength={120}
          aria-invalid={Boolean(errors.title) || undefined}
          onChange={(e) =>
            set(autoSlug ? { title: e.target.value, slug: slugify(e.target.value) } : { title: e.target.value })
          }
          className={inputClass}
        />
      </Field>

      <Field label="Category" htmlFor="category" required error={errors.category}>
        <select
          id="category"
          value={value.category}
          aria-invalid={Boolean(errors.category) || undefined}
          onChange={(e) => set({ category: e.target.value as Basics["category"] })}
          className={inputClass}
        >
          <option value="" disabled>
            Choose…
          </option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
      </Field>

      <Field label="Location" htmlFor="location" required error={errors.location} hint="e.g. Ceylon Road, Singapore">
        <input
          id="location"
          value={value.location}
          maxLength={120}
          aria-invalid={Boolean(errors.location) || undefined}
          onChange={(e) => set({ location: e.target.value })}
          className={inputClass}
        />
      </Field>

      <div className="md:col-span-2">
        <p className="font-sans text-sm text-muted">
          Page address:{" "}
          <span className="break-all text-ink">
            {SITE_HOST}/projects/{value.slug || "…"}
          </span>
          {!showSlug && !errors.slug && (
            <button
              type="button"
              onClick={() => setShowSlug(true)}
              className="ml-2 font-medium text-gold-deep underline-offset-2 hover:underline"
            >
              Change
            </button>
          )}
        </p>
        {(showSlug || errors.slug) && (
          <Field
            label="Page address"
            htmlFor="slug"
            error={errors.slug}
            hint="Lowercase letters, numbers and hyphens only."
            className="mt-3"
          >
            <input
              id="slug"
              value={value.slug}
              maxLength={80}
              aria-invalid={Boolean(errors.slug) || undefined}
              onChange={(e) => {
                onAutoSlugChange?.(false);
                set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
              }}
              onBlur={() => set({ slug: slugify(value.slug) })}
              className={inputClass}
            />
          </Field>
        )}
        {liveSlug && value.slug !== liveSlug && (
          <p className="mt-2 flex items-start gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-[13px] text-amber-900">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            This project is visible on the website. Old links will stop working.
          </p>
        )}
      </div>
    </div>
  );
}
