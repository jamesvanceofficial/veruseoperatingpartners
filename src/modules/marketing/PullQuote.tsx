/** One strong line, full-bleed — a distinct plane from the card-grid sections around it. */
export function PullQuote({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span aria-hidden className="text-[48px] leading-none text-[var(--gold)]">
        &ldquo;
      </span>
      <blockquote className="mx-auto max-w-3xl text-[22px] font-semibold leading-snug text-[var(--cream)] sm:text-[30px]">{children}</blockquote>
      {attribution ? <span className="section-label text-[var(--gold-light)]">{attribution}</span> : null}
    </div>
  );
}
