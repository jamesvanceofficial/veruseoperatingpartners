/**
 * Page-specific hero diagrams, drawn in the same SVG line-art style as
 * CategoryIcons.tsx and AboutIcons.tsx — real illustrations in the locked
 * brand tokens, never a stock photo, never a duplicate of an existing
 * icon used elsewhere on the same page.
 */

type IconProps = { className?: string };

/** What We Do hero — a left-to-right systems flow, not a literal repeat of the per-category icons below it on the same page. */
export function SystemsMapDiagram({ className }: IconProps) {
  const nodes = [
    { x: 30, y: 140 },
    { x: 70, y: 100 },
    { x: 110, y: 120 },
    { x: 150, y: 75 },
  ];
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {nodes.slice(0, -1).map((n, i) => (
        <line key={i} x1={n.x} y1={n.y} x2={nodes[i + 1].x} y2={nodes[i + 1].y} stroke="var(--muted)" strokeWidth="1.8" opacity="0.6" />
      ))}
      {nodes.map((n, i) => (
        <rect key={i} x={n.x - 12} y={n.y - 12} width="24" height="24" rx="6" stroke="var(--gold-light)" strokeWidth="2.2" fill="var(--navy-2)" />
      ))}
      <circle cx="170" cy="55" r="16" fill="var(--gold)" />
      <path d="M163 55l4.5 4.5L178 48" stroke="var(--black)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="150" y1="75" x2="158" y2="63" stroke="var(--muted)" strokeWidth="1.8" opacity="0.6" />
    </svg>
  );
}

/** Build Packages hero — three ascending tiers, Foundation to Enterprise. */
export function BuildStackDiagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="130" width="40" height="50" rx="4" stroke="var(--muted)" strokeWidth="2" fill="var(--navy-2)" />
      <rect x="80" y="95" width="40" height="85" rx="4" stroke="var(--gold-light)" strokeWidth="2.2" fill="var(--navy-2)" />
      <rect x="130" y="55" width="40" height="125" rx="4" stroke="var(--gold)" strokeWidth="2.4" fill="var(--navy-2)" />
      <line x1="150" y1="55" x2="150" y2="30" stroke="var(--gold)" strokeWidth="2.2" />
      <path d="M150 30l16 8-16 8z" fill="var(--gold)" />
    </svg>
  );
}

/** Systems & Support hero — always-on protection, not a repeat of the smaller shield-check used elsewhere. */
export function UptimeShieldDiagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 24c22 8 40 8 40 8v48c0 32-18 52-40 64-22-12-40-32-40-64V32s18 0 40-8z"
        stroke="var(--gold-light)"
        strokeWidth="2.4"
        fill="var(--navy-2)"
      />
      <polyline points="70,100 88,100 96,84 106,116 114,100 130,100" stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="150" cy="46" r="7" stroke="var(--muted)" strokeWidth="1.8" opacity="0.7" />
      <circle cx="160" cy="70" r="4" fill="var(--gold)" opacity="0.85" />
    </svg>
  );
}

/** Services hero — people running inside a built system: a system window with three staffed seats wired to one queue, and the work moving through it. */
export function StaffedSystemDiagram({ className }: IconProps) {
  const seats = [58, 100, 142];
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="36" width="152" height="128" rx="8" stroke="var(--gold-light)" strokeWidth="2.4" fill="var(--navy-2)" />
      <line x1="24" y1="56" x2="176" y2="56" stroke="var(--gold-light)" strokeWidth="2.4" />
      <circle cx="36" cy="46" r="3" fill="var(--gold)" />
      <circle cx="46" cy="46" r="3" fill="var(--gold)" />
      {seats.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="88" r="10" stroke={i === 1 ? "var(--gold-light)" : "var(--muted)"} strokeWidth="2.2" fill="var(--navy-2)" />
          <path d={`M${x - 15} 116c0-10 7-16 15-16s15 6 15 16`} stroke={i === 1 ? "var(--gold-light)" : "var(--muted)"} strokeWidth="2.2" strokeLinecap="round" />
          <line x1={x} y1="118" x2={x} y2="132" stroke="var(--muted)" strokeWidth="1.8" opacity="0.7" />
        </g>
      ))}
      <line x1="58" y1="132" x2="142" y2="132" stroke="var(--muted)" strokeWidth="1.8" opacity="0.7" />
      <rect x="44" y="138" width="112" height="12" rx="6" stroke="var(--muted)" strokeWidth="1.8" />
      <rect x="44" y="138" width="78" height="12" rx="6" fill="var(--gold)" />
      <circle cx="160" cy="46" r="7" stroke="var(--green)" strokeWidth="2" />
      <path d="M156.5 46l2.5 2.5 5-5.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
