import { cn } from "@/shared/ui/cn";

/**
 * A real, locally-served photograph as a section background, always
 * behind a navy overlay strong enough that the photo reads as atmosphere,
 * not decoration — text and cards on top never fight the image for
 * attention. Never hotlinked; every src here lives under
 * public/images/photography/.
 */
export function PhotoSection({
  src,
  alt = "",
  className,
  children,
}: {
  src: string;
  alt?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--navy)_92%,transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--black)]/40 via-transparent to-[var(--black)]/80" />
      <div className="relative">{children}</div>
    </section>
  );
}
