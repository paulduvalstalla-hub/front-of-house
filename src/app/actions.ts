"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { endSession, getSession, startSession } from "@/lib/auth";
import { sql, type UserRow } from "@/lib/db";
import { dummyHash, hashPassword, verifyPassword } from "@/lib/password";

export type AuthState = {
  error?: string;
  fields?: Partial<Record<"name" | "email" | "password", string>>;
  values?: { name?: string; email?: string };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(raw: FormDataEntryValue | null, fallback: string) {
  const next = String(raw ?? "");
  return next.startsWith("/dashboard") || next.startsWith("/onboarding") ? next : fallback;
}

/** Creates a real account (Postgres, scrypt-hashed password) and signs the person in. */
export async function signUp(_prev: AuthState | undefined, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  const fields: AuthState["fields"] = {};
  if (!name) fields.name = "Add your name.";
  if (!EMAIL.test(email)) fields.email = "Enter a valid email address.";
  if (password.length < 8) fields.password = "Use at least 8 characters.";
  else if (password.length > 200) fields.password = "Use 200 characters or fewer.";
  if (Object.keys(fields).length) return { fields, values };

  const hash = await hashPassword(password);
  let rows: Record<string, unknown>[];
  try {
    rows = await sql`
      INSERT INTO users (email, name, password_hash) VALUES (${email}, ${name}, ${hash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id`;
  } catch {
    return { error: "We couldn't create your account just now. Try again in a moment.", values };
  }
  if (rows.length === 0) {
    return { fields: { email: "An account with this email already exists. Sign in instead." }, values };
  }

  await startSession({ kind: "user", uid: String(rows[0].id), name, email });
  redirect("/onboarding");
}

/** Signs in with email and password. */
export async function signIn(_prev: AuthState | undefined, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(formData.get("password") ?? "");
  const values = { email };
  if (!email || !password) return { error: "Enter your email and password.", values };

  let user: UserRow | undefined;
  try {
    user = (await sql`SELECT id, email, name, password_hash FROM users WHERE email = ${email}`)[0] as UserRow | undefined;
  } catch {
    return { error: "We couldn't sign you in just now. Try again in a moment.", values };
  }
  // Check a password either way, so a missing account takes as long as a wrong password.
  const ok = await verifyPassword(password, user?.password_hash ?? (await dummyHash()));
  if (!user || !ok) return { error: "That email and password don't match an account.", values };

  await startSession({ kind: "user", uid: user.id, name: user.name, email: user.email });
  redirect(safeNext(formData.get("next"), "/dashboard"));
}

/** Opens a fresh copy of the sample restaurant. Each demo gets its own id, so it starts clean. */
export async function startDemo() {
  await startSession({ kind: "demo", id: randomUUID() });
  redirect("/dashboard");
}

export async function signOut() {
  const s = await getSession();
  await endSession();
  redirect(s?.kind === "user" ? "/sign-in" : "/");
}
