"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { asAdmin, check, UserError } from "@/lib/admin/action";
import type { ActionResult } from "@/lib/admin/result";

const text = (max: number) => z.string().trim().max(max, "This is too long.");

/** Empty, or a full https:// address */
const link = z
  .string()
  .trim()
  .max(500, "This link is too long.")
  .refine((v) => v === "" || (v.startsWith("https://") && URL.canParse(v)), "Links must start with https://");

const phone = z
  .string()
  .trim()
  .max(30, "This is too long.")
  .regex(/^[+\d\s]*$/, "Use only digits, spaces and +.");

const settingsForm = z.object({
  contactPerson: text(120),
  phone,
  fax: phone,
  email: z.union([z.literal(""), z.email("Please enter a valid email address.")]),
  hours: text(200),
  addressLines: z.array(text(160)).length(3),
  bookletUrl: link,
  questionnaireUrl: link,
  socials: z.object({
    instagram: link,
    facebook: link,
    pinterest: link,
    linkedin: link,
    youtube: link,
  }),
  companyName: text(160),
  uen: text(40),
});

export type SettingsFormInput = z.input<typeof settingsForm>;

export async function saveSettings(input: SettingsFormInput): Promise<ActionResult<undefined>> {
  return asAdmin("saveSettings", async (supabase) => {
    const parsed = settingsForm.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
      throw new UserError("Please check the highlighted fields.", errors);
    }
    const s = parsed.data;

    // Empty social links are left out, so their icons are hidden
    const socials = Object.fromEntries(Object.entries(s.socials).filter(([, url]) => url));

    check(
      await supabase.from("settings").upsert({
        id: 1,
        contact_person: s.contactPerson,
        phone: s.phone,
        fax: s.fax,
        email: s.email,
        hours: s.hours,
        // Blank lines are dropped so the address doesn't show gaps
        address_lines: s.addressLines.filter(Boolean),
        // The site's buttons treat "#" as "link not set yet"
        booklet_url: s.bookletUrl || "#",
        questionnaire_url: s.questionnaireUrl || "#",
        socials,
        company_name: s.companyName,
        uen: s.uen,
      }),
    );
    updateTag("settings");
    return undefined;
  });
}
