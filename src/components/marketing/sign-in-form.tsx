"use client";

import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { signInDemo } from "@/app/actions";

const DEFAULT_NAME = "Camille Durand";
const DEFAULT_EMAIL = "camille@petitcomptoir.example";

function SubmitButton({ children, variant }: { children: string; variant: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        variant === "primary"
          ? "w-full rounded-full bg-lamp px-5 py-3 text-[15px] font-semibold text-night shadow-[0_0_30px_-8px_rgb(242_182_109/0.7)] transition hover:bg-[#f6c584] disabled:opacity-60"
          : "w-full rounded-full border border-line-strong px-5 py-3 text-[15px] font-medium text-linen transition hover:border-linen/40 disabled:opacity-60"
      }
    >
      {pending ? "Opening the dashboard…" : children}
    </button>
  );
}

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-line-strong bg-night px-3.5 py-2.5 text-[15px] text-linen outline-none transition placeholder:text-smoke-2 focus:border-lamp/70 focus:ring-4 focus:ring-lamp/15";

export function SignInForm() {
  const next = useSearchParams().get("next") ?? "";

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="font-serif text-[38px] leading-[1.05] tracking-[-0.03em]">Sign in to Front of House</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-smoke">
        Pick up tonight&rsquo;s reviews for Petit Comptoir where you left them.
      </p>

      <form action={signInDemo} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block text-[13.5px] text-smoke">
          Name
          <input name="name" defaultValue={DEFAULT_NAME} autoComplete="name" className={inputClass} />
        </label>
        <label className="block text-[13.5px] text-smoke">
          Work email
          <input
            name="email"
            type="email"
            defaultValue={DEFAULT_EMAIL}
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <div className="pt-2">
          <SubmitButton variant="primary">Continue to the dashboard</SubmitButton>
        </div>
      </form>

      <form action={signInDemo} className="mt-3">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="name" value={DEFAULT_NAME} />
        <input type="hidden" name="email" value={DEFAULT_EMAIL} />
        <SubmitButton variant="secondary">Use the demo account</SubmitButton>
      </form>

      <p className="mt-6 rounded-xl border border-line bg-night/60 px-4 py-3 text-[13px] leading-relaxed text-smoke">
        Demo mode: no account is created and no password is needed. Everything you do stays in this browser.
      </p>
    </div>
  );
}
