"use client";

import { cn } from "./cn";

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

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ variant = "secondary", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={buttonClassName({ variant, disabled: disabled || loading, className })} disabled={disabled || loading} {...rest}>
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
