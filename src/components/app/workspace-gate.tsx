"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useDesk } from "./desk-store";

/** Waits for the restaurant to load, and sends an account with no restaurant yet to onboarding. */
export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { ready, hasWorkspace, loadError, retryLoad } = useDesk();
  const router = useRouter();
  useEffect(() => {
    if (ready && !hasWorkspace) router.replace("/onboarding");
  }, [ready, hasWorkspace, router]);

  if (loadError) {
    return (
      <div className="grid min-h-dvh place-items-center bg-night px-5">
        <div className="max-w-[380px] text-center">
          <p className="text-[15px] text-linen">{loadError}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="mt-5 rounded-lg bg-linen px-4 py-2 text-[14px] font-medium text-night hover:bg-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-night" role="status" aria-live="polite">
        <span className="dot-pulse flex gap-1.5" aria-hidden>
          <span className="size-1.5 rounded-full bg-smoke" />
          <span className="size-1.5 rounded-full bg-smoke" />
          <span className="size-1.5 rounded-full bg-smoke" />
        </span>
        <span className="sr-only">Opening your inbox</span>
      </div>
    );
  }
  if (!hasWorkspace) return null;
  return <>{children}</>;
}
