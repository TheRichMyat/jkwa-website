import type { Metadata } from "next";
import AuthCard from "@/components/admin/AuthCard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back">
      <LoginForm />
    </AuthCard>
  );
}
