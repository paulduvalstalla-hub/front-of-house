import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { DeskProvider } from "@/components/app/desk-store";
import { accountFrom, getSession } from "@/lib/auth";

/** Onboarding and the dashboard share one store, so moving between them keeps state and live drafts. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-night" aria-busy />}>
      <SessionDesk>{children}</SessionDesk>
    </Suspense>
  );
}

/** Reads the session at request time, behind the boundary above, and opens that person's desk. */
async function SessionDesk({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const account = accountFrom(session);
  // A new key per person or demo visit, so switching never carries one desk's data into another.
  const key = account.kind === "user" ? `user:${account.uid}` : `demo:${account.id}`;
  return (
    <DeskProvider key={key} account={account}>
      {children}
    </DeskProvider>
  );
}
