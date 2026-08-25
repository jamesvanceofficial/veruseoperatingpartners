import { Card } from "./Card";
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
    <Card className="flex flex-col gap-1.5">
      <span className="section-label">{label}</span>
      <span
        className={cn(
          "font-tabular text-[28px] font-semibold leading-none",
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
    </Card>
  );
}
