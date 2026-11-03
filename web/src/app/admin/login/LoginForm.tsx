"use client";

import { useActionState, useState } from "react";
import { AdminButton, Field, inputClass } from "@/components/admin/ui";
import { requestPasswordReset, signIn, type FormState } from "../_actions/auth";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  // Controlled, so a failed attempt (React resets the form) keeps the email
  const [email, setEmail] = useState("");
  const [loginState, loginAction, loggingIn] = useActionState(signIn, {} as FormState);
  const [resetState, resetAction, sending] = useActionState(requestPasswordReset, {} as FormState);

  if (mode === "forgot") {
    return (
      <form action={resetAction} className="flex flex-col gap-5">
        <p className="font-sans text-sm leading-relaxed text-body">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
        <Field label="Email" htmlFor="reset-email">
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        {resetState.error && <p role="alert" className="font-sans text-sm text-red-700">{resetState.error}</p>}
        {resetState.message && <p role="status" className="font-sans text-sm text-emerald-800">{resetState.message}</p>}
        <AdminButton type="submit" pending={sending} className="w-full">
          {sending ? "Sending…" : "Send reset link"}
        </AdminButton>
        <button type="button" onClick={() => setMode("login")} className="font-sans text-sm text-gold-deep hover:text-ink">
          Back to log in
        </button>
      </form>
    );
  }

  return (
    <form action={loginAction} className="flex flex-col gap-5">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      {loginState.error && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3.5 py-2.5 font-sans text-sm text-red-800">
          {loginState.error}
        </p>
      )}
      <AdminButton type="submit" pending={loggingIn} className="w-full">
        {loggingIn ? "Logging in…" : "Log in"}
      </AdminButton>
      <button type="button" onClick={() => setMode("forgot")} className="font-sans text-sm text-gold-deep hover:text-ink">
        Forgot password?
      </button>
    </form>
  );
}
