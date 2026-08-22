import { BrandMark } from "@/shared/ui/BrandMark";
import { Button } from "@/shared/ui/Button";

export default async function PublicHome() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <BrandMark size="md" />
        <a href="/login" className="text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
          Client / Team Login
        </a>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="glass-panel-strong fade-scale-in flex max-w-2xl flex-col items-center gap-6 px-10 py-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--gold-light)]">
            VERUS Operating Company
          </span>
          <h1 className="text-[32px] font-semibold leading-tight text-[var(--cream)]">
            We turn founder-led businesses into system-driven, scalable companies.
          </h1>
          <p className="max-w-lg text-[14px] text-[var(--muted)]">
            Websites, software, systems, SOPs, automations, dashboards, documentation, and ongoing
            support — built and run as one operating system for your business.
          </p>
          <Button variant="primary" className="mt-2 px-6 py-2.5 text-[13px]" disabled>
            Book a Business Assessment
          </Button>
        </div>
      </main>

      <footer className="px-8 py-6 text-center text-[11px] text-[var(--muted)]">
        &copy; {new Date().getFullYear()} VERUS Operating Company.
      </footer>
    </div>
  );
}
