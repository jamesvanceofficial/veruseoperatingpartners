import { cn } from "@/shared/ui/cn";
import { CompassRose } from "@/shared/ui/CompassRose";

/**
 * The quiet reuse of the hero centerpiece — a partial compass bleeding
 * off one edge of a section divider, static (no rotation) and much
 * fainter than the hero, so it reads as a recurring mark of the brand
 * rather than a second hero moment. Parent section needs `relative
 * overflow-hidden` for the bleed to clip correctly.
 */
export function CompassDivider({ side = "right", opacity = 0.1 }: { side?: "left" | "right"; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 h-[640px] w-[640px] -translate-y-1/2",
        side === "right" ? "right-0 translate-x-1/3" : "left-0 -translate-x-1/3"
      )}
    >
      <CompassRose className="h-full w-full" opacity={opacity} />
    </div>
  );
}
