"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/ui/cn";
import { ORG_TABS } from "./tabs";

export function OrganizationTabs({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const base = `/organizations/${orgId}`;

  return (
    <div className="glass-panel flex flex-wrap gap-1 p-1.5">
      {ORG_TABS.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const active = pathname === href;
        return (
          <Link
            key={tab.slug || "overview"}
            href={href}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] font-medium transition-colors duration-150",
              active
                ? "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-[var(--gold-light)]"
                : "text-[var(--muted)] hover:text-[var(--cream)]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
