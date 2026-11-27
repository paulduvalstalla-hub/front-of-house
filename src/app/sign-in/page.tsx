import type { Metadata } from "next";
import { AuthForm } from "@/components/marketing/auth-form";
import { AuthShell } from "@/components/marketing/auth-shell";

export const metadata: Metadata = {
  title: "Sign in — Front of House",
};

export default function SignInPage() {
  return (
    <AuthShell>
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
