import { cn } from "./cn";

/** The one shared privacy line for every place this app collects a visitor's information — worded once so it can't drift between the scan, the contact form, and the assessment's business profile step. */
export function PrivacyNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11.5px] leading-relaxed text-[var(--muted)]", className)}>
      What you share here is used only to generate your result and follow up with you — seen only by VERUS, never shared or sold to anyone else.
    </p>
  );
}
