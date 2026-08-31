import { cn } from "@/shared/ui/cn";

/**
 * A real 16-point mariner's compass rose, drawn programmatically (no
 * static asset) — 4 primary points (N/E/S/W), 4 intercardinal points
 * (NE/SE/SW/NW), and 8 secondary intercardinal points, each a faceted
 * spike split into a lit half (brighter --gold-light) and a shadowed
 * half (deeper --gold at lower opacity), a consistent "light source"
 * always on the counter-clockwise side of each point. A degree ring with
 * minor/major tick marks and three fine concentric rings surround it.
 * Every color is one of the locked tokens; the `opacity` prop is the one
 * knob callers use to push this from full line-art down to a faint
 * embossed watermark — never a new hue.
 */

const VIEWBOX = 1000;
const CENTER = VIEWBOX / 2;
const R = 420;

function polar(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

function fmt(n: number): string {
  return n.toFixed(1);
}

function spike(angleDeg: number, outerFrac: number, bulgeFrac: number, halfWidthDeg: number) {
  const baseFrac = 0.045;
  const base = polar(R * baseFrac, angleDeg);
  const tip = polar(R * outerFrac, angleDeg);
  const left = polar(R * bulgeFrac, angleDeg - halfWidthDeg);
  const right = polar(R * bulgeFrac, angleDeg + halfWidthDeg);
  return {
    lit: `M ${fmt(base[0])},${fmt(base[1])} L ${fmt(left[0])},${fmt(left[1])} L ${fmt(tip[0])},${fmt(tip[1])} Z`,
    shadow: `M ${fmt(base[0])},${fmt(base[1])} L ${fmt(tip[0])},${fmt(tip[1])} L ${fmt(right[0])},${fmt(right[1])} Z`,
  };
}

const SPIKES = [
  ...Array.from({ length: 4 }, (_, i) => ({ angle: i * 90, outer: 1.0, bulge: 0.22, half: 12 })),
  ...Array.from({ length: 4 }, (_, i) => ({ angle: 45 + i * 90, outer: 0.62, bulge: 0.15, half: 9 })),
  ...Array.from({ length: 8 }, (_, i) => ({ angle: 22.5 + i * 45, outer: 0.34, bulge: 0.09, half: 6 })),
];

const RING_R = 452;
const TICK_OUTER = 452;

const MINOR_TICKS = Array.from({ length: 72 }, (_, i) => i * 5).filter((a) => a % 15 !== 0);
const MAJOR_TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

export function CompassRose({
  className,
  opacity = 1,
  litOpacity = 0.68,
  shadowOpacity = 0.3,
  ringOpacity = 0.3,
}: {
  className?: string;
  opacity?: number;
  litOpacity?: number;
  shadowOpacity?: number;
  ringOpacity?: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className={cn("overflow-visible", className)}
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      {/* fine concentric rings */}
      {[150, 255, 355].map((r) => (
        <circle key={r} cx={CENTER} cy={CENTER} r={r} fill="none" stroke="var(--gold)" strokeWidth={1} style={{ opacity: ringOpacity * 0.7 }} />
      ))}

      {/* faceted star points */}
      {SPIKES.map((s, i) => {
        const { lit, shadow } = spike(s.angle, s.outer, s.bulge, s.half);
        return (
          <g key={i}>
            <path d={lit} fill="var(--gold-light)" style={{ opacity: litOpacity }} />
            <path d={shadow} fill="var(--gold)" style={{ opacity: shadowOpacity }} />
          </g>
        );
      })}

      {/* center medallion */}
      <circle cx={CENTER} cy={CENTER} r={32} fill="none" stroke="var(--gold-light)" strokeWidth={2} style={{ opacity: litOpacity }} />
      <circle cx={CENTER} cy={CENTER} r={9} fill="var(--gold-light)" style={{ opacity: litOpacity }} />

      {/* degree ring */}
      <circle cx={CENTER} cy={CENTER} r={RING_R} fill="none" stroke="var(--gold)" strokeWidth={1.5} style={{ opacity: ringOpacity }} />
      {MINOR_TICKS.map((a) => {
        const [x1, y1] = polar(TICK_OUTER - 10, a);
        const [x2, y2] = polar(TICK_OUTER, a);
        return <line key={a} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke="var(--gold)" strokeWidth={1} style={{ opacity: ringOpacity * 0.8 }} />;
      })}
      {MAJOR_TICKS.map((a) => {
        const [x1, y1] = polar(TICK_OUTER - 20, a);
        const [x2, y2] = polar(TICK_OUTER + 8, a);
        return <line key={a} x1={fmt(x1)} y1={fmt(y1)} x2={fmt(x2)} y2={fmt(y2)} stroke="var(--gold-light)" strokeWidth={1.75} style={{ opacity: ringOpacity }} />;
      })}
    </svg>
  );
}
