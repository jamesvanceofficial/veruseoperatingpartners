import { ScreenshotVisual } from "./ScreenshotVisual";
import { CompassRose } from "@/shared/ui/CompassRose";

/**
 * A hero screenshot given a real backdrop to sit on instead of floating in
 * empty column space — a `.diagram-screen` textured panel (the same one
 * the What We Do category diagrams use), a soft gold glow, and a faint
 * compass rose watermark, all filling the FULL column height so there is
 * no void above or below the image regardless of how tall the text
 * column next to it ends up. The screenshot itself (`ScreenshotVisual`,
 * unmodified) is rendered larger against this backdrop than it ever was
 * floating alone.
 */
export function ScreenshotStage({
  src,
  alt,
  maxWidthClassName = "max-w-xl",
}: {
  src: string;
  alt: string;
  maxWidthClassName?: string;
}) {
  return (
    <div className="diagram-screen relative flex h-full min-h-[440px] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] p-6 sm:min-h-[480px] sm:p-10">
      <div className="absolute h-56 w-56 rounded-full bg-[var(--gold)] opacity-20 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]" aria-hidden="true">
        <CompassRose className="h-[92%] w-[92%]" />
      </div>
      <div className="relative w-full">
        <ScreenshotVisual tilt maxWidthClassName={maxWidthClassName} src={src} alt={alt} />
      </div>
    </div>
  );
}
