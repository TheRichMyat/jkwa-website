"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight } from "lucide-react";
import { useToast } from "@/components/admin/Toaster";
import { AdminButton, Field, inputClass, Section, focusFirstError } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";
import { saveSettings } from "../../_actions/settings";

export interface SettingsValues {
  contactPerson: string;
  phone: string;
  fax: string;
  email: string;
  hours: string;
  addressLines: [string, string, string];
  bookletUrl: string;
  questionnaireUrl: string;
  socials: { instagram: string; facebook: string; pinterest: string; linkedin: string; youtube: string };
  companyName: string;
  uen: string;
}

const SOCIALS = [
  { key: "instagram", label: "Instagram", example: "https://www.instagram.com/yourpage" },
  { key: "facebook", label: "Facebook", example: "https://www.facebook.com/yourpage" },
  { key: "pinterest", label: "Pinterest", example: "https://www.pinterest.com/yourpage" },
  { key: "linkedin", label: "LinkedIn", example: "https://www.linkedin.com/company/yourpage" },
  { key: "youtube", label: "YouTube", example: "https://www.youtube.com/@yourchannel" },
] as const;

/** A Google Drive "view" link → a direct download link (null if it isn't one) */
function driveDownloadLink(url: string) {
  const match = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : null;
}

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const toast = useToast();

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedChanges(dirty);

  const set = (patch: Partial<SettingsValues>) => setValues((v) => ({ ...v, ...patch }));

  const text = (key: "contactPerson" | "phone" | "fax" | "email" | "hours" | "companyName" | "uen", label: string, opts: { type?: string; hint?: string; inputMode?: "tel" | "email" } = {}) => (
    <Field label={label} htmlFor={key} error={errors[key]} hint={opts.hint}>
      <input
        id={key}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        value={values[key]}
        aria-invalid={Boolean(errors[key]) || undefined}
        onChange={(e) => set({ [key]: e.target.value })}
        className={inputClass}
      />
    </Field>
  );

  const linkField = (key: "bookletUrl" | "questionnaireUrl", label: string, hint: string) => {
    const direct = key === "bookletUrl" ? driveDownloadLink(values.bookletUrl) : null;
    return (
      <Field label={label} htmlFor={key} error={errors[key]} hint={hint}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={key}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={values[key]}
            aria-invalid={Boolean(errors[key]) || undefined}
            onChange={(e) => set({ [key]: e.target.value })}
            className={inputClass}
          />
          <a
            href={values[key] || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!values[key]}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-sm border border-line bg-white px-4 font-sans text-sm text-ink hover:border-gold-deep hover:text-gold-deep ${
              values[key] ? "" : "pointer-events-none opacity-50"
            }`}
          >
            Test link <ArrowUpRight aria-hidden className="size-4" />
          </a>
        </div>
        {direct && (
          <div className="mt-2 rounded-sm border border-line bg-stone px-3 py-2.5 font-sans text-[13px] text-body">
            This is a Google Drive &ldquo;view&rdquo; link. Visitors will see a preview page first.{" "}
            <button
              type="button"
              onClick={() => set({ bookletUrl: direct })}
              className="font-medium text-gold-deep underline underline-offset-2 hover:text-ink"
            >
              Convert to direct download link
            </button>
          </div>
        )}
      </Field>
    );
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const result = await saveSettings(values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        focusFirstError();
        toast.error(result.error);
        return;
      }
      setErrors({});
      setSaved(values);
      toast.success("Saved. The website is updated.");
    });
  };

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-6">
      <Section title="Contact" description="Shown in the Contact section and the footer.">
        <div className="grid gap-5 md:grid-cols-2">
          {text("contactPerson", "Contact person")}
          {text("email", "Email", { type: "email", inputMode: "email" })}
          {text("phone", "Phone", { inputMode: "tel", hint: "Digits, spaces and + only, e.g. +65 8028 7801" })}
          {text("fax", "Fax", { inputMode: "tel", hint: "Leave empty if you don't use one." })}
          <div className="md:col-span-2">{text("hours", "Opening hours", { hint: "e.g. Mon – Fri 9:00 AM – 6:00 PM (SGT)" })}</div>
          <fieldset className="md:col-span-2">
            <legend className="mb-1.5 font-sans text-sm font-medium text-ink">Address</legend>
            <div className="flex flex-col gap-2">
              {values.addressLines.map((line, i) => (
                <input
                  key={i}
                  aria-label={`Address line ${i + 1}`}
                  value={line}
                  placeholder={["Street", "Unit / building", "Singapore postcode"][i]}
                  onChange={(e) => {
                    const lines = [...values.addressLines] as SettingsValues["addressLines"];
                    lines[i] = e.target.value;
                    set({ addressLines: lines });
                  }}
                  className={inputClass}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </Section>

      <Section title="Buttons" description="Where the two buttons in the header, hero and contact section lead.">
        <div className="flex flex-col gap-5">
          {linkField("bookletUrl", "Free Booklet link", "A link to the booklet (e.g. a Google Drive file). Must start with https://")}
          {linkField("questionnaireUrl", "Project Questionnaire link", "A link to the questionnaire (e.g. a Google Form). Must start with https://")}
        </div>
      </Section>

      <Section title="Social media" description="Leave a link empty to hide its icon.">
        <div className="grid gap-5 md:grid-cols-2">
          {SOCIALS.map(({ key, label, example }) => (
            <Field key={key} label={label} htmlFor={key} error={errors[`socials.${key}`]}>
              <input
                id={key}
                type="url"
                inputMode="url"
                placeholder={example}
                value={values.socials[key]}
                aria-invalid={Boolean(errors[`socials.${key}`]) || undefined}
                onChange={(e) => set({ socials: { ...values.socials, [key]: e.target.value } })}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Company" description="Shown in the footer.">
        <div className="grid gap-5 md:grid-cols-2">
          {text("companyName", "Company name")}
          {text("uen", "UEN")}
        </div>
      </Section>

      <div className="sticky bottom-0 z-40 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-sm md:border md:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="hidden font-sans text-sm text-muted sm:block">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          <AdminButton type="submit" pending={saving} disabled={!dirty} className="flex-1 sm:flex-none sm:px-8">
            {saving ? "Saving…" : "Save"}
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
