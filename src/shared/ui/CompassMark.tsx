import { cn } from "./cn";
import { CompassRose } from "./CompassRose";

/**
 * The compass rose scaled down to a small inline mark — the same
 * CompassRose asset (never a second drawing), just small and static, for
 * the quiet recurring through-line: section handoffs, /scan, and the
 * assessment pages. Sized by the caller via className (e.g. `h-7 w-7`).
 * At this size the fine rings/ticks would turn to mush, so they're pushed
 * down and the star points carry the shape.
 */
export function CompassMark({ className, opacity = 0.9 }: { className?: string; opacity?: number }) {
  return (
    <CompassRose
      className={cn("h-7 w-7 shrink-0", className)}
      opacity={opacity}
      litOpacity={0.95}
      shadowOpacity={0.55}
      ringOpacity={0.45}
    />
  );
}

/** Hairline — compass mark — hairline. Used between two sections that share a background. */
export function CompassHandoff({ className }: { className?: string }) {
  return (
    <div className={cn("compass-handoff", className)} aria-hidden="true">
      <CompassMark className="h-10 w-10" />
    </div>
  );
}
