"use client";

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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="glass-panel-strong sticky top-0 flex h-screen w-60 flex-col justify-between rounded-none border-y-0 border-l-0 px-4 py-5">
        <div>
          <div className="mb-6 px-2">{brand}</div>
          <nav className="flex flex-col gap-0.5">
            {navEntries.map((entry) => {
              const active = pathname === entry.href;
              return (
                <a
                  key={entry.key}
                  href={entry.href}
                  className={cn(
                    "relative rounded-[var(--radius-sm)] px-3 py-2 text-[12.5px] font-medium transition-colors duration-150",
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
          className="rounded-[var(--radius-sm)] px-3 py-2 text-left text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--red)]"
        >
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="glass-panel flex items-center justify-between rounded-none border-x-0 border-t-0 px-6 py-3">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">COMPASS</span>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-[12.5px] font-medium text-[var(--cream)]">{userName}</p>
              <p className="text-[11px] text-[var(--muted)]">{userEmail}</p>
            </div>
            <span className="rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] px-2 py-1 text-[10.5px] font-medium uppercase tracking-wide text-[var(--gold-light)]">
              {roleLabel}
            </span>
          </div>
        </header>

        {banner}

        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
