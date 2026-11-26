import type { Metadata } from "next";
import { AgentToasts } from "@/components/app/agent-toasts";
import { Sidebar } from "@/components/app/sidebar";
import { WorkspaceGate } from "@/components/app/workspace-gate";

export const metadata: Metadata = {
  title: "Dashboard — Front of House",
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <WorkspaceGate>
      <div className="flex min-h-dvh flex-col bg-night lg:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <AgentToasts />
    </WorkspaceGate>
  );
}
