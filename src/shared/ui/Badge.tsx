import { cn } from "./cn";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "green" | "yellow" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide",
        tone === "neutral" && "border-[var(--hairline)] text-[var(--muted)]",
        tone === "gold" && "border-[color-mix(in_srgb,var(--gold)_50%,transparent)] text-[var(--gold-light)]",
        tone === "green" && "border-[color-mix(in_srgb,var(--green)_50%,transparent)] text-[var(--green)] text-glow-gold",
        tone === "yellow" && "border-[color-mix(in_srgb,var(--yellow)_50%,transparent)] text-[var(--yellow)]",
        tone === "red" && "border-[color-mix(in_srgb,var(--red)_50%,transparent)] text-[var(--red)]"
      )}
    >
      {children}
    </span>
  );
}
