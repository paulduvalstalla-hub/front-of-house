import type { Metadata } from "next";
import { AuthShell } from "@/components/marketing/auth-shell";
import { AuthForm } from "@/components/marketing/auth-form";

export const metadata: Metadata = {
  title: "Create your account — Front of House",
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
