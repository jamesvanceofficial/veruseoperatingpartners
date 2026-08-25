import { cn } from "./cn";

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "neutral" | "gold" | "green" | "yellow" | "red";
}) {
  return (
    <div className="glass-panel fade-scale-in flex flex-col gap-1 p-5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</span>
      <span
        className={cn(
          "font-tabular text-[22px] font-semibold",
          tone === "neutral" && "text-[var(--cream)]",
          tone === "gold" && "text-[var(--gold-light)]",
          tone === "green" && "text-[var(--green)]",
          tone === "yellow" && "text-[var(--yellow)]",
          tone === "red" && "text-[var(--red)]"
        )}
      >
        {value}
      </span>
      {hint ? <span className="text-[11px] text-[var(--muted)]">{hint}</span> : null}
    </div>
  );
}
