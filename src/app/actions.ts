"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, encodeSession } from "@/lib/session";

/** Demo sign-in: accepts any name/email and opens the dashboard. No account is created. */
export async function signInDemo(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim() || "camille@petitcomptoir.example";
  const rawName = String(formData.get("name") ?? "").trim();
  const name = rawName || (email.startsWith("camille@") ? "Camille Durand" : email.split("@")[0]);
  const next = String(formData.get("next") ?? "");

  (await cookies()).set(SESSION_COOKIE, encodeSession({ name, email }), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(next.startsWith("/dashboard") || next.startsWith("/onboarding") ? next : "/dashboard");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
