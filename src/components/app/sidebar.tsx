"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/actions";
import { Logo } from "@/components/brand";
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

const SAVE_LABEL = { idle: "", saving: "Saving…", saved: "Saved to your account", error: "Not saved. Retrying on your next change." };

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { reviews, records, trialDaysLeft, workspace, agentOn, connections, account, saveStatus, flushSave } = useDesk();
  const watching = Object.values(connections).filter(Boolean).length;
  const demo = account.kind === "demo";
  const name = account.kind === "user" ? account.name : workspace.manager;
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
        {demo ? (
          <div className="rounded-xl border border-lamp/30 bg-lamp/[0.05] px-3 py-3">
            <p className="text-[13px] text-linen">You&rsquo;re in the demo</p>
            <p className="mt-1 text-[12.5px] leading-snug text-smoke">
              Create an account to set up your own restaurant. It&rsquo;s saved, so it&rsquo;s there next time.
            </p>
            <Link
              href="/sign-up"
              onClick={onNavigate}
              className="mt-2.5 block rounded-lg bg-linen px-3 py-1.5 text-center text-[13px] font-medium text-night hover:bg-white"
            >
              Create an account
            </Link>
          </div>
        ) : (
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
        )}

        <div className="flex items-center gap-2.5 px-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-dusk text-[13px] font-medium">
            {(name || "?").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px]">{name}</p>
            <p className="truncate text-[12px] text-smoke-2" aria-live="polite">
              {demo ? "Demo visit" : saveStatus === "idle" ? account.email : SAVE_LABEL[saveStatus]}
            </p>
          </div>
          <form
            action={async () => {
              await flushSave();
              await signOut();
            }}
          >
            <button
              type="submit"
              title={demo ? "Leave the demo" : "Sign out"}
              aria-label={demo ? "Leave the demo" : "Sign out"}
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
