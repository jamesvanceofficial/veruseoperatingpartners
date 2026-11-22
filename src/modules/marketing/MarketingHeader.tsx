"use client";

import { useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/shared/ui/LinkButton";
import { CompassMark } from "@/shared/ui/CompassMark";
import { cn } from "@/shared/ui/cn";
import { BOOK_A_CALL_HREF, NAV_LINKS } from "./links";

/** The brand mark: the existing compass rose (re-tinted to the accent by the .mkt theme) beside the wordmark. */
export function VerusWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <CompassMark className="h-7 w-7" />
      <span className="text-[15px] font-bold tracking-[0.14em] text-[var(--white)]">VERUS</span>
    </span>
  );
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--ground)_88%,transparent)] backdrop-blur-md">
      <div className="page-container flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)} aria-label="VERUS Operating Partners — home">
          <VerusWordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-[14px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--white)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/login" className="text-[14px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--white)]">
            Log in
          </Link>
          <LinkButton href={BOOK_A_CALL_HREF} variant="primary">
            Book a call
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hairline-strong)] text-[var(--white)] lg:hidden"
        >
          <span className="relative flex h-3.5 w-4 flex-col justify-between" aria-hidden="true">
            <span className={cn("h-[1.5px] w-full bg-current transition-transform", open && "translate-y-[6.5px] rotate-45")} />
            <span className={cn("h-[1.5px] w-full bg-current transition-opacity", open && "opacity-0")} />
            <span className={cn("h-[1.5px] w-full bg-current transition-transform", open && "-translate-y-[6.5px] -rotate-45")} />
          </span>
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-[var(--hairline)] bg-[var(--ground)] lg:hidden">
          <nav aria-label="Main" className="page-container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2 py-3 text-[15px] font-medium text-[var(--white)] transition-colors hover:bg-[var(--raised)]"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-2 py-3 text-[15px] font-medium text-[var(--muted)] hover:bg-[var(--raised)]">
              Log in
            </Link>
            <LinkButton href={BOOK_A_CALL_HREF} variant="primary" className="mt-2" onClick={() => setOpen(false)}>
              Book a call
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
