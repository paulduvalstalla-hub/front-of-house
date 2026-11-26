"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useDesk } from "./desk-store";

/** Sends a first-time visitor to onboarding before the dashboard. */
export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { ready, hasWorkspace } = useDesk();
  const router = useRouter();
  useEffect(() => {
    if (ready && !hasWorkspace) router.replace("/onboarding");
  }, [ready, hasWorkspace, router]);
  if (ready && !hasWorkspace) return null;
  return <>{children}</>;
}
