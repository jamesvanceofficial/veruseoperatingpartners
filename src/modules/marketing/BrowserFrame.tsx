/**
 * A subtle browser-chrome mockup around a real product screenshot — a
 * thin title bar with three muted dots and an address pill, never the
 * cliché red/yellow/green traffic lights. The screenshot itself is a real
 * image (see public/images/product/), never re-created in markup.
 */
export function BrowserFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={className}>
      <div className="glass-panel-strong overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] bg-[var(--navy-2)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--muted)] opacity-40" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--muted)] opacity-40" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--muted)] opacity-40" />
          <div className="ml-2 flex-1 rounded-full bg-[color-mix(in_srgb,var(--navy)_60%,transparent)] px-3 py-1 text-[10px] text-[var(--muted)]">
            verusoperatingpartners.com
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block h-auto w-full" loading="lazy" />
      </div>
    </div>
  );
}
