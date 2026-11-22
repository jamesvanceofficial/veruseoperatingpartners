import { LinkButton } from "@/shared/ui/LinkButton";
import { BOOK_A_CALL_HREF } from "../links";

/** Full-bleed accent band: dark text, dark pill button (.mkt-accent re-scopes the button to dark). */
export function CtaBand({ heading, line }: { heading: string; line: string }) {
  return (
    <section className="mkt-accent">
      <div className="page-container flex flex-col items-start justify-between gap-6 py-14 sm:py-16 lg:flex-row lg:items-center">
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 className="text-[32px] leading-[1.05] sm:text-[44px]">{heading}</h2>
          <p className="text-[17px] leading-relaxed">{line}</p>
        </div>
        <LinkButton href={BOOK_A_CALL_HREF} variant="primary" className="shrink-0">
          Book a call
        </LinkButton>
      </div>
    </section>
  );
}
