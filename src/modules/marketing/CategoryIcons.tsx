/**
 * Real SVG diagrams for the What We Do build-category breakdown — drawn
 * directly in the locked brand tokens, never a stock photo or an empty
 * placeholder box. Each is a simple line-art illustration of the thing
 * being built, not decoration.
 */

type IconProps = { className?: string };

export function WebsiteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="24" width="92" height="72" rx="6" stroke="var(--gold-light)" strokeWidth="2.5" />
      <line x1="14" y1="42" x2="106" y2="42" stroke="var(--gold-light)" strokeWidth="2.5" />
      <circle cx="24" cy="33" r="2.5" fill="var(--gold)" />
      <circle cx="33" cy="33" r="2.5" fill="var(--gold)" />
      <circle cx="42" cy="33" r="2.5" fill="var(--gold)" />
      <rect x="24" y="52" width="40" height="8" rx="1.5" fill="var(--cream)" opacity="0.9" />
      <rect x="24" y="66" width="72" height="5" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="24" y="76" width="56" height="5" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="24" y="86" width="24" height="8" rx="2" fill="var(--gold)" />
    </svg>
  );
}

export function SoftwareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="20" width="92" height="80" rx="6" stroke="var(--gold-light)" strokeWidth="2.5" />
      <line x1="14" y1="36" x2="106" y2="36" stroke="var(--gold-light)" strokeWidth="2.5" />
      <line x1="42" y1="36" x2="42" y2="100" stroke="var(--gold-light)" strokeWidth="2" opacity="0.7" />
      <circle cx="24" cy="28" r="2.5" fill="var(--gold)" />
      <rect x="22" y="46" width="12" height="12" rx="2" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="22" y="64" width="12" height="12" rx="2" fill="var(--gold)" opacity="0.85" />
      <rect x="22" y="82" width="12" height="12" rx="2" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="52" y="46" width="42" height="9" rx="2" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="52" y="61" width="42" height="9" rx="2" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="52" y="76" width="28" height="9" rx="2" fill="var(--cream)" opacity="0.9" />
    </svg>
  );
}

export function SopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="16" width="60" height="76" rx="5" stroke="var(--muted)" strokeWidth="2" opacity="0.55" />
      <rect x="22" y="24" width="60" height="76" rx="5" stroke="var(--muted)" strokeWidth="2" opacity="0.8" />
      <rect x="14" y="32" width="60" height="76" rx="5" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <circle cx="27" cy="46" r="3" fill="var(--gold)" />
      <line x1="36" y1="46" x2="64" y2="46" stroke="var(--cream)" strokeWidth="2" opacity="0.9" />
      <circle cx="27" cy="60" r="3" stroke="var(--green)" strokeWidth="2" />
      <path d="M25 60l1.5 1.5L29 58" stroke="var(--green)" strokeWidth="1.6" />
      <line x1="36" y1="60" x2="60" y2="60" stroke="var(--muted)" strokeWidth="1.6" />
      <circle cx="27" cy="74" r="3" stroke="var(--muted)" strokeWidth="2" />
      <line x1="36" y1="74" x2="56" y2="74" stroke="var(--muted)" strokeWidth="1.6" />
      <circle cx="27" cy="88" r="3" stroke="var(--muted)" strokeWidth="2" />
      <line x1="36" y1="88" x2="62" y2="88" stroke="var(--muted)" strokeWidth="1.6" />
    </svg>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="18" width="96" height="84" rx="6" stroke="var(--gold-light)" strokeWidth="2.5" />
      <rect x="24" y="58" width="14" height="28" rx="1.5" fill="var(--muted)" opacity="0.55" />
      <rect x="44" y="46" width="14" height="40" rx="1.5" fill="var(--gold)" />
      <rect x="64" y="64" width="14" height="22" rx="1.5" fill="var(--muted)" opacity="0.55" />
      <rect x="84" y="36" width="14" height="50" rx="1.5" fill="var(--gold-light)" />
      <polyline points="24,44 44,32 64,40 84,26" stroke="var(--green)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="26" r="3" fill="var(--green)" />
      <line x1="24" y1="94" x2="98" y2="94" stroke="var(--muted)" strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}

export function AutomationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="30" r="10" stroke="var(--gold-light)" strokeWidth="2.5" />
      <circle cx="96" cy="30" r="10" stroke="var(--muted)" strokeWidth="2" />
      <circle cx="24" cy="92" r="10" stroke="var(--muted)" strokeWidth="2" />
      <circle cx="60" cy="61" r="12" fill="var(--gold)" />
      <path d="M55 61l3.5 3.5L67 56" stroke="var(--black)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="33" y1="34" x2="49" y2="55" stroke="var(--gold-light)" strokeWidth="2" />
      <line x1="87" y1="34" x2="71" y2="55" stroke="var(--muted)" strokeWidth="2" />
      <line x1="33" y1="88" x2="49" y2="67" stroke="var(--muted)" strokeWidth="2" />
      <line x1="72" y1="61" x2="96" y2="61" stroke="var(--muted)" strokeWidth="2" />
      <circle cx="96" cy="61" r="6" stroke="var(--muted)" strokeWidth="1.8" />
    </svg>
  );
}

export function DocumentationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 16h44l16 16v72a4 4 0 01-4 4H30a4 4 0 01-4-4V20a4 4 0 014-4z" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <path d="M74 16v16h16" stroke="var(--gold-light)" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="36" y1="52" x2="82" y2="52" stroke="var(--cream)" strokeWidth="2" opacity="0.9" />
      <line x1="36" y1="64" x2="82" y2="64" stroke="var(--muted)" strokeWidth="1.6" />
      <line x1="36" y1="76" x2="68" y2="76" stroke="var(--muted)" strokeWidth="1.6" />
      <line x1="36" y1="88" x2="74" y2="88" stroke="var(--muted)" strokeWidth="1.6" />
    </svg>
  );
}

export function SupportIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 18c16 6 28 6 28 6v34c0 22-13 36-28 44-15-8-28-22-28-44V24s12 0 28-6z"
        stroke="var(--gold-light)"
        strokeWidth="2.5"
        fill="var(--navy-2)"
      />
      <polyline points="42,60 53,71 80,44" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
