import Link from "next/link";
import { CompassMark } from "@/shared/ui/CompassMark";
import { BOOK_A_CALL_HREF, FREE_SCAN_HREF, NAV_LINKS } from "./links";

const PRIMARY_LINKS = NAV_LINKS;

const SECONDARY_LINKS = [
  { href: FREE_SCAN_HREF, label: "Free scan" },
  { href: "/builds", label: "Pricing" },
  { href: BOOK_A_CALL_HREF, label: "Contact" },
  { href: "/login", label: "Client log in" },
];

/** Pages that left the top nav — still live, linked from here only. */
const MORE_LINKS = [
  { href: "/what-we-do", label: "What We Do in detail" },
  { href: "/the-assessment", label: "The Assessment" },
  { href: "/builds", label: "Build Packages" },
  { href: "/systems-and-support", label: "Systems & Support" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
];

function LinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <p className="mono-label">{title}</p>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className="text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--white)]">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="no-print border-t border-[var(--hairline)] bg-[var(--ground)] py-14">
      <div className="page-container flex flex-col gap-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-3">
              <CompassMark className="h-9 w-9" />
              <span className="text-[15px] font-bold tracking-[0.14em] text-[var(--white)]">VERUS OPERATING PARTNERS</span>
            </span>
            <address className="flex flex-col gap-1 text-[14px] not-italic leading-relaxed text-[var(--muted)]">
              <span>PO Box 237, Cambridge City, IN 47327</span>
              <span>Delivered remotely, nationwide.</span>
            </address>
          </div>
          <LinkColumn title="The company" links={PRIMARY_LINKS} />
          <LinkColumn title="Get started" links={SECONDARY_LINKS} />
        </div>

        <nav aria-label="More pages" className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--hairline)] pt-6">
          {MORE_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--white)]">
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="text-[13px] text-[var(--muted)]">&copy; 2026 VERUS OPERATING PARTNERS LLC</p>
      </div>
    </footer>
  );
}
