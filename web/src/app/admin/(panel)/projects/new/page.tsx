import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import NewProjectForm from "./NewProjectForm";

export const metadata: Metadata = { title: "Add project" };

// Admin data, per request (see the panel layout)
export const instant = false;

export default async function NewProjectPage() {
  await requireAdminPage();
  return (
    <>
      <PageTitle>Add a project</PageTitle>
      <NewProjectForm />
    </>
  );
}
