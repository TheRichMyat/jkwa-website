"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";

export interface FormState {
  error?: string;
  message?: string;
}

const credentials = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Please enter your email and password." };

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.status === 429) return { error: "Too many attempts. Please wait a few minutes and try again." };
    // Never say which part was wrong
    return { error: "Email or password is incorrect." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { error: "Please enter a valid email address." };

  // The link comes back to the site the request came from (localhost, develop or
  // live). Supabase only follows it if the address is in its Redirect URLs list.
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await serverClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${origin}/admin/auth/confirm?next=/admin/reset`,
  });
  if (error?.status === 429) {
    return { error: "Too many requests. Please wait a few minutes and try again." };
  }
  // Same message either way, so the form doesn't reveal which emails have accounts
  return { message: "If that email belongs to an admin account, a reset link is on its way. Please check your inbox." };
}

const newPassword = z
  .object({
    password: z.string().min(10, "Your new password needs at least 10 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match." });

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPassword.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "This reset link has expired. Please request a new one from the login page." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Please choose a password you haven't used before." };
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Please choose a stronger one." };
    return { error: "Couldn't save the new password. Please try again." };
  }
  redirect("/admin");
}
