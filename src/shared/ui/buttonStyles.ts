import { cn } from "./cn";

// Deliberately NOT "use client" — this is pure string-building with no
// hooks or browser APIs. It used to live inside Button.tsx (which is "use
// client"), which broke LinkButton: a Server Component calling a function
// exported from a "use client" module throws "Attempted to call X() from
// the server but X is on the client" — Next treats every export of a
// client-marked file as a client reference, even a plain function, so it
// can only be invoked from within a Client Component, not called directly
// during server rendering. Moving it here (no directive) fixes that at the
// root: this function never needed to be client-only.
export type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonClassName({
  variant = "secondary",
  disabled,
  className,
}: {
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
}): string {
  return cn(
    "glow-gold-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-150",
    variant === "primary" &&
      "glow-gold-hover border border-[color-mix(in_srgb,var(--gold)_55%,transparent)] bg-gradient-to-b from-[var(--gold-light)] to-[var(--gold)] text-[var(--black)]",
    variant === "secondary" && "glow-gold-hover border border-[var(--hairline-strong)] bg-[var(--surface)] text-[var(--cream)] hover:border-[var(--gold)]",
    variant === "ghost" && "text-[var(--muted)] hover:text-[var(--cream)]",
    disabled && "cursor-not-allowed opacity-50",
    className
  );
}
