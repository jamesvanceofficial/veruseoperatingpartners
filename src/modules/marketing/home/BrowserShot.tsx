import { cn } from "@/shared/ui/cn";

/** A screenshot in a rounded browser-style frame: a title bar with a small accent dot and a mono label. */
export function BrowserShot({
  src,
  alt,
  label,
  width,
  height,
  priority,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-[20px] border border-[var(--hairline-strong)] bg-[var(--raised)]", className)}>
      <figcaption className="flex items-center gap-2.5 border-b border-[var(--hairline)] bg-[var(--raised)] px-4 py-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted-dark)]">{label}</span>
      </figcaption>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("block h-auto w-full", imgClassName)}
      />
    </figure>
  );
}
