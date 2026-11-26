import type { Metadata } from "next";
import { DeskProvider } from "@/components/app/desk-store";
import { Sidebar } from "@/components/app/sidebar";

export const metadata: Metadata = {
  title: "Dashboard — Front of House",
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <DeskProvider>
      <div className="flex min-h-dvh flex-col bg-night lg:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DeskProvider>
  );
}
