"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/shared/supabase/client";
import { cn } from "./cn";
import type { NavEntry } from "@/shared/nav";

export function AppShell({
  navEntries,
  brand,
  userName,
  userEmail,
  roleLabel,
  banner,
  children,
}: {
  navEntries: NavEntry[];
  brand: React.ReactNode;
  userName: string;
  userEmail: string;
  roleLabel: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Backdrop — mobile only, closes the drawer on tap outside it. */}
      {navOpen ? (
        <div
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--black)_65%,transparent)] lg:hidden"
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "glass-panel-strong plane-edge fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col justify-between rounded-none border-y-0 border-l-0 px-4 py-5 transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-10 lg:w-60 lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <div className="mb-6 flex items-center justify-between px-2">
            {brand}
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="glow-gold-focus rounded-[var(--radius-sm)] p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--cream)] lg:hidden"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-0.5">
            {navEntries.map((entry) => {
              const active = pathname === entry.href;
              return (
                <a
                  key={entry.key}
                  href={entry.href}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "relative rounded-[var(--radius-sm)] px-3 py-2.5 text-[12.5px] font-medium transition-colors duration-150 lg:py-2",
                    active ? "text-[var(--cream)]" : "text-[var(--muted)] hover:text-[var(--cream)]"
                  )}
                >
                  {active ? (
                    <span
                      className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-[var(--gold)]"
                      style={{ boxShadow: "0 0 10px 1px color-mix(in srgb, var(--gold) 65%, transparent)" }}
                    />
                  ) : null}
                  {entry.label}
                </a>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--red)] lg:py-2"
        >
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="glass-panel rounded-none border-x-0 border-t-0 py-3">
          <div className="page-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNavOpen(true)}
                aria-label="Open menu"
                className="glow-gold-focus -ml-1.5 rounded-[var(--radius-sm)] p-1.5 text-[var(--cream)] transition-colors hover:text-[var(--gold-light)] lg:hidden"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">COMPASS</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <p className="text-[12.5px] font-medium text-[var(--cream)]">{userName}</p>
                <p className="text-[11px] text-[var(--muted)]">{userEmail}</p>
              </div>
              <span className="rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] px-2 py-1 text-[10.5px] font-medium uppercase tracking-wide text-[var(--gold-light)]">
                {roleLabel}
              </span>
            </div>
          </div>
        </header>

        {banner}

        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
