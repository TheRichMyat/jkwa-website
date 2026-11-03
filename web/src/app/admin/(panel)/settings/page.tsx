import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import type { SettingsRow } from "@/lib/data/rows";
import SettingsForm, { type SettingsValues } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };

// Admin data, per request (see the panel layout)
export const instant = false;

/** "#" is how the site stores "link not set yet"; show it as empty */
const link = (v: string | undefined) => (v && v !== "#" ? v : "");

export default async function SettingsPage() {
  const supabase = await requireAdminPage();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  const row = (data ?? {}) as Partial<SettingsRow>;
  const address = row.address_lines ?? [];
  const socials = row.socials ?? {};

  const initial: SettingsValues = {
    contactPerson: row.contact_person ?? "",
    phone: row.phone ?? "",
    fax: row.fax ?? "",
    email: row.email ?? "",
    hours: row.hours ?? "",
    addressLines: [address[0] ?? "", address[1] ?? "", address[2] ?? ""],
    bookletUrl: link(row.booklet_url),
    questionnaireUrl: link(row.questionnaire_url),
    socials: {
      instagram: link(socials.instagram),
      facebook: link(socials.facebook),
      pinterest: link(socials.pinterest),
      linkedin: link(socials.linkedin),
      youtube: link(socials.youtube),
    },
    companyName: row.company_name ?? "",
    uen: row.uen ?? "",
  };

  return (
    <>
      <PageTitle>Settings</PageTitle>
      <SettingsForm initial={initial} />
    </>
  );
}
