"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { signOut } from "@/app/actions";
import { Logo } from "@/components/brand";
import { readClientSession } from "@/lib/session";
import { useDesk } from "./desk-store";
import { CardIcon, ChartIcon, CloseIcon, ExitIcon, InboxIcon, MenuIcon, PlugIcon, QuillIcon, VoiceIcon } from "./icons";

const NAV = [
  { href: "/dashboard", label: "Inbox", icon: InboxIcon },
  { href: "/dashboard/quick-reply", label: "Quick reply", icon: QuillIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/dashboard/integrations", label: "Integrations", icon: PlugIcon },
  { href: "/dashboard/voice", label: "Brand voice", icon: VoiceIcon },
  { href: "/dashboard/billing", label: "Billing", icon: CardIcon },
];

const subscribe = () => () => {};
const cookieSnapshot = () => document.cookie;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { reviews, records, trialDaysLeft, workspace, agentOn, connections } = useDesk();
  const watching = Object.values(connections).filter(Boolean).length;
  // Subscribe to the raw cookie string (stable between renders), then decode it.
  const rawCookie = useSyncExternalStore(subscribe, cookieSnapshot, () => "");
  const session = useMemo(() => (rawCookie ? readClientSession() : null), [rawCookie]);
  const open = reviews.filter((r) => {
    const s = records[r.id]?.status;
    return s === "new" || s === "drafted";
  }).length;

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-4">
      <Link href="/" className="px-2 pt-1" onClick={onNavigate}>
        <Logo size={19} />
      </Link>

      <div className="rounded-xl border border-line bg-night-2 px-3 py-2.5">
        <p className="truncate text-[13.5px] font-medium text-linen">{workspace.restaurant}</p>
        <p className="truncate text-[12.5px] text-smoke-2">
          {workspace.mode === "sample" ? "Sample restaurant" : workspace.location || "Your restaurant"}
        </p>
        <p className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-[12.5px]">
          <span className="relative flex size-1.5 shrink-0">
            {agentOn && <span className="live-ping absolute inline-flex size-full rounded-full bg-sage" />}
            <span className={`relative inline-flex size-1.5 rounded-full ${agentOn ? "bg-sage" : "bg-smoke-2"}`} />
          </span>
          <span className={agentOn ? "text-linen/90" : "text-smoke-2"}>
            {agentOn ? `Agent on · ${watching} ${watching === 1 ? "platform" : "platforms"}` : "Agent paused"}
          </span>
        </p>
      </div>

      <nav aria-label="Dashboard" className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[14px] transition-colors ${
                active ? "bg-night-3 text-linen" : "text-smoke hover:bg-night-2 hover:text-linen"
              }`}
            >
              <Icon className={active ? "text-lamp" : ""} />
              <span className="flex-1">{label}</span>
              {label === "Inbox" && open > 0 && (
                <span className="rounded-full bg-night-4 px-1.5 text-[12px] tabular-nums text-linen/90">{open}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/dashboard/billing"
          onClick={onNavigate}
          className="rounded-xl border border-line px-3 py-2.5 hover:border-line-strong"
        >
          <p className="text-[13px] text-linen">Pro trial</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-night-4">
            <div className="h-full rounded-full bg-linen/70" style={{ width: `${(trialDaysLeft / 14) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[12px] text-smoke-2">{trialDaysLeft} days left</p>
        </Link>

        <div className="flex items-center gap-2.5 px-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-dusk text-[13px] font-medium">
            {(session?.name ?? "C").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px]">{session?.name ?? workspace.manager}</p>
            <p className="truncate text-[12px] text-smoke-2">{session?.email ?? "Demo account"}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="grid size-8 place-items-center rounded-lg text-smoke hover:bg-night-2 hover:text-linen"
            >
              <ExitIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[236px] shrink-0 border-r border-line lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-night/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size={18} />
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid size-9 place-items-center rounded-lg border border-line"
        >
          <MenuIcon />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[272px] border-r border-line bg-night">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-smoke"
            >
              <CloseIcon />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
