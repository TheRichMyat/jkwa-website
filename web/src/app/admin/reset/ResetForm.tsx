"use client";

import { useActionState } from "react";
import { AdminButton, Field, inputClass } from "@/components/admin/ui";
import { updatePassword, type FormState } from "../_actions/auth";

export default function ResetForm({ email }: { email: string }) {
  const [state, action, saving] = useActionState(updatePassword, {} as FormState);

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Lets password managers save the new password against the right account */}
      <input type="hidden" name="username" autoComplete="username" value={email} readOnly />
      <Field label="New password" htmlFor="password" hint="At least 10 characters.">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Type it again" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3.5 py-2.5 font-sans text-sm text-red-800">
          {state.error}
        </p>
      )}
      <AdminButton type="submit" pending={saving} className="w-full">
        {saving ? "Saving…" : "Save new password"}
      </AdminButton>
    </form>
  );
}
