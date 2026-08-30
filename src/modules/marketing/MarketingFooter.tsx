import Link from "next/link";
import { BrandMark } from "@/shared/ui/BrandMark";

const FOOTER_LINKS = [
  { href: "/what-we-do", label: "What We Do" },
  { href: "/the-assessment", label: "The Assessment" },
  { href: "/builds", label: "Build Packages" },
  { href: "/systems-and-support", label: "Systems & Support" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingFooter() {
  return (
    <footer className="no-print border-t border-[var(--hairline)] py-12">
      <div className="page-container flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <BrandMark size="md" />
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-1 border-t border-[var(--hairline)] pt-6 text-[11px] text-[var(--muted)]">
          <p>&copy; {new Date().getFullYear()} VERUS Operating Company. Delivered remotely, nationwide.</p>
          <p>
            <Link href="/login" className="hover:text-[var(--gold-light)]">
              Client / Team Login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
