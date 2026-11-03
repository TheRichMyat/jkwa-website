"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import BasicsFields, { type Basics } from "@/components/admin/BasicsFields";
import { useToast } from "@/components/admin/Toaster";
import { AdminButton, buttonClass, Section, focusFirstError } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";
import { createProject } from "../../../_actions/projects";

const EMPTY: Basics = { title: "", category: "", location: "", slug: "" };

/** Step one: the basics. The project is created as a hidden draft, then photos are added on its page. */
export default function NewProjectForm() {
  const [basics, setBasics] = useState(EMPTY);
  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [created, setCreated] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const dirty = !created && (basics.title !== "" || basics.location !== "" || basics.category !== "");
  useUnsavedChanges(dirty);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const result = await createProject(basics as Parameters<typeof createProject>[0]);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        focusFirstError();
        toast.error(result.error);
        return;
      }
      setCreated(true);
      toast.success("Project created. Now add the photos.");
      router.push(`/admin/projects/${result.data.id}`);
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex max-w-3xl flex-col gap-6">
      <Section title="Basics" description="You can add photos and the other details on the next step. The project stays hidden until you make it visible.">
        <BasicsFields
          value={basics}
          onChange={(b) => {
            setBasics(b);
            setErrors({});
          }}
          errors={errors}
          autoSlug={autoSlug}
          onAutoSlugChange={setAutoSlug}
        />
      </Section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/projects" className={buttonClass("secondary")}>
          Cancel
        </Link>
        <AdminButton type="submit" pending={saving}>
          {saving ? "Creating…" : "Create and add photos"}
        </AdminButton>
      </div>
    </form>
  );
}
