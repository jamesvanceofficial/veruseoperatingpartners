"use client";

import { cn } from "./cn";

export function FormField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "glow-gold-focus rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] bg-[var(--navy)] px-3 py-2 text-[13px] text-[var(--cream)] outline-none placeholder:text-[var(--muted)]",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "glow-gold-focus rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] bg-[var(--navy)] px-3 py-2 text-[13px] text-[var(--cream)] outline-none",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "glow-gold-focus rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] bg-[var(--navy)] px-3 py-2 text-[13px] text-[var(--cream)] outline-none placeholder:text-[var(--muted)]",
        props.className
      )}
    />
  );
}
