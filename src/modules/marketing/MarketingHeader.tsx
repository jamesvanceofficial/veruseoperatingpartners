"use client";

import { useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/shared/ui/LinkButton";
import { cn } from "@/shared/ui/cn";

const NAV_LINKS = [
  { href: "/what-we-do", label: "What We Do" },
  { href: "/the-assessment", label: "The Assessment" },
  { href: "/builds", label: "Build Packages" },
  { href: "/systems-and-support", label: "Systems & Support" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
];

/** brand is rendered by the (Server Component) layout and passed down — BrandMark is itself async/server-only (reads app_settings via a cookie-based client), and a "use client" module can never import and instantiate a Server Component directly, only receive one as a prop. Same pattern as AppShell's brand prop. */
export function MarketingHeader({ brand }: { brand: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--hairline)] bg-[var(--navy)]/85 backdrop-blur-md">
      <div className="page-container flex items-center justify-between gap-4 py-4">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          {brand}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
            Client / Team Login
          </Link>
          <LinkButton href="/contact" variant="primary">
            Book a Call
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="glow-gold-focus flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] text-[var(--cream)] lg:hidden"
        >
          <span className="relative flex h-3.5 w-4 flex-col justify-between">
            <span className={cn("h-[1.5px] w-full bg-current transition-transform", open && "translate-y-[6.5px] rotate-45")} />
            <span className={cn("h-[1.5px] w-full bg-current transition-opacity", open && "opacity-0")} />
            <span className={cn("h-[1.5px] w-full bg-current transition-transform", open && "-translate-y-[6.5px] -rotate-45")} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--hairline)] bg-[var(--navy)] lg:hidden">
          <nav className="page-container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-sm)] px-2 py-2.5 text-[13.5px] font-medium text-[var(--cream)] transition-colors hover:bg-[var(--surface)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] px-2 py-2.5 text-[13.5px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface)]"
            >
              Client / Team Login
            </Link>
            <LinkButton href="/contact" variant="primary" className="mt-2 justify-center" onClick={() => setOpen(false)}>
              Book a Call
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
