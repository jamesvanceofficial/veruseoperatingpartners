/**
 * The About page's hero visual — a real SVG diagram, not a photo, matching
 * the line-art style of CategoryIcons.tsx. A central operator node
 * connected to seven surrounding nodes, echoing the seven-sector band on
 * the same page rather than illustrating any one of them literally.
 */

type IconProps = { className?: string };

const SATELLITES = 7;

export function OperatorDiagram({ className }: IconProps) {
  const center = 100;
  const radius = 78;
  const points = Array.from({ length: SATELLITES }, (_, i) => {
    const angle = (i / SATELLITES) * Math.PI * 2 - Math.PI / 2;
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  });

  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {points.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="var(--muted)" strokeWidth="1.8" opacity="0.55" />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="9" stroke="var(--gold-light)" strokeWidth="2.2" fill="var(--navy-2)" />
      ))}
      <circle cx={center} cy={center} r="22" fill="var(--gold)" />
      <circle cx={center} cy={center} r="22" stroke="var(--gold-light)" strokeWidth="2.2" />
    </svg>
  );
}
