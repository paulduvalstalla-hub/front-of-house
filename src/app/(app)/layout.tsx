import { DeskProvider } from "@/components/app/desk-store";

/** Onboarding and the dashboard share one store, so moving between them keeps state and live drafts. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DeskProvider>{children}</DeskProvider>;
}
