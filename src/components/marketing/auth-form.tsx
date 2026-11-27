"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-line-strong bg-night px-3.5 py-2.5 text-body text-linen outline-none transition placeholder:text-smoke-2 focus:border-lamp/70 focus:ring-4 focus:ring-lamp/15 aria-[invalid=true]:border-wine/70";

function FieldError({ id, text, className = "mt-1.5" }: { id: string; text?: string; className?: string }) {
  if (!text) return null;
  return (
    <span id={id} className={`block text-small text-wine ${className}`}>
      {text}
    </span>
  );
}

/** Real sign-in and sign-up: the account is stored in Postgres with a hashed password. */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState<AuthState | undefined, FormData>(
    signingUp ? signUp : signIn,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const f = state?.fields ?? {};

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="font-serif text-display-3">{signingUp ? "Create your account" : "Sign in to Front of House"}</h1>
      <p className="mt-3 text-body text-smoke">
        {signingUp
          ? "Set up your restaurant in five short steps. Your profile and replies are saved to your account."
          : "Pick up your reviews where you left them."}
      </p>

      <form action={action} className="mt-8 space-y-4" noValidate>
        <input type="hidden" name="next" value={next} />
        {signingUp && (
          <label className="block text-small text-smoke">
            Your name
            <input
              name="name"
              required
              autoComplete="name"
              defaultValue={state?.values?.name}
              aria-invalid={!!f.name}
              aria-describedby={f.name ? "name-error" : undefined}
              className={inputClass}
            />
            <FieldError id="name-error" text={f.name} />
          </label>
        )}
        <label className="block text-small text-smoke">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state?.values?.email}
            aria-invalid={!!f.email}
            aria-describedby={f.email ? "email-error" : undefined}
            className={inputClass}
          />
          <FieldError id="email-error" text={f.email} />
        </label>
        <div>
          <label className="block text-small text-smoke">
            Password
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={signingUp ? 8 : undefined}
              autoComplete={signingUp ? "new-password" : "current-password"}
              aria-invalid={!!f.password}
              aria-describedby={f.password ? "password-error" : signingUp ? "password-hint" : undefined}
              className={inputClass}
            />
          </label>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {f.password ? (
              <FieldError id="password-error" text={f.password} className="" />
            ) : (
              <span id="password-hint" className="text-micro text-smoke-2">
                {signingUp ? "At least 8 characters." : ""}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="shrink-0 py-0.5 text-micro text-smoke hover:text-linen"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
        </div>

        {state?.error && (
          <p role="alert" className="rounded-xl border border-wine/40 bg-wine/[0.08] px-4 py-3 text-small text-linen">
            {state.error}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-linen px-5 py-3 text-body font-semibold text-night transition hover:bg-white disabled:opacity-60"
          >
            {pending ? (signingUp ? "Creating your account…" : "Signing in…") : signingUp ? "Create account" : "Sign in"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-small text-smoke">
        {signingUp ? "Already have an account? " : "New to Front of House? "}
        <Link
          href={signingUp ? "/sign-in" : "/sign-up"}
          className="text-linen underline decoration-line-strong underline-offset-4 hover:decoration-linen"
        >
          {signingUp ? "Sign in" : "Create an account"}
        </Link>
      </p>

      <div className="mt-8 border-t border-line pt-6">
        <p className="text-small text-smoke">Just looking? Try the sample restaurant first, no account needed.</p>
        <Link
          href="/demo"
          className="mt-3 block w-full rounded-lg border border-line-strong px-5 py-3 text-center text-body font-medium text-linen transition hover:border-linen/40"
        >
          Try the live demo
        </Link>
      </div>
    </div>
  );
}
