import { cn } from "@/shared/ui/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("flex flex-col gap-3", align === "center" && "items-center text-center")}>
      <span className="section-label text-[var(--gold-light)]">{eyebrow}</span>
      <h2 className="text-[26px] font-semibold leading-tight text-[var(--cream)] sm:text-[32px]">{title}</h2>
      {description ? <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
