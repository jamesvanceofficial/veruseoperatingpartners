/**
 * Real SVG diagrams for the Services page — one per service area, drawn
 * in the same line-art style and locked brand tokens as CategoryIcons.tsx
 * (What We Do), never a stock photo or an empty placeholder box.
 */

type IconProps = { className?: string };

/** Marketing, SEO and paid advertising — a search-results panel, a magnifier with a rising trend inside it, a local pin, and a sponsored tag. */
export function MarketingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="20" width="80" height="66" rx="6" stroke="var(--gold-light)" strokeWidth="2.5" />
      <line x1="12" y1="34" x2="92" y2="34" stroke="var(--gold-light)" strokeWidth="2.5" />
      <circle cx="22" cy="27" r="2.5" fill="var(--gold)" />
      <rect x="22" y="43" width="44" height="6" rx="1.5" fill="var(--cream)" opacity="0.9" />
      <rect x="22" y="54" width="34" height="4" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="22" y="63" width="40" height="4" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="22" y="73" width="18" height="7" rx="2" fill="var(--gold)" />
      <path d="M100 18c-5.5 0-9 4-9 8.5 0 6.5 9 15.5 9 15.5s9-9 9-15.5c0-4.5-3.5-8.5-9-8.5z" stroke="var(--gold-light)" strokeWidth="2.2" fill="var(--navy-2)" strokeLinejoin="round" />
      <circle cx="100" cy="26.5" r="3" fill="var(--gold)" />
      <circle cx="84" cy="80" r="17" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <line x1="96" y1="92" x2="110" y2="106" stroke="var(--gold-light)" strokeWidth="3.2" strokeLinecap="round" />
      <polyline points="73,87 79,79 85,83 94,71" stroke="var(--green)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="94" cy="71" r="2.6" fill="var(--green)" />
      <circle cx="26" cy="98" r="2.5" fill="var(--gold)" opacity="0.8" />
      <circle cx="35" cy="98" r="2.5" fill="var(--gold)" opacity="0.8" />
      <circle cx="44" cy="98" r="2.5" fill="var(--gold)" opacity="0.8" />
    </svg>
  );
}

/** Personal assistants — a calendar with one day handled, a clock, and an inbox with something waiting. */
export function PersonalAssistantIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="26" width="64" height="68" rx="5" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <line x1="14" y1="42" x2="78" y2="42" stroke="var(--gold-light)" strokeWidth="2.5" />
      <line x1="30" y1="18" x2="30" y2="32" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="18" x2="62" y2="32" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="23" y="50" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="38" y="50" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="53" y="50" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="23" y="65" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="38" y="65" width="9" height="9" rx="1.5" fill="var(--gold)" />
      <path d="M40.5 69.5l1.8 1.8L46 67.5" stroke="var(--black)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="53" y="65" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="23" y="80" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="38" y="80" width="9" height="9" rx="1.5" stroke="var(--muted)" strokeWidth="1.6" />
      <circle cx="94" cy="38" r="16" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <line x1="94" y1="38" x2="94" y2="28" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="94" y1="38" x2="101" y2="42" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="74" y="70" width="36" height="26" rx="4" stroke="var(--muted)" strokeWidth="2" fill="var(--navy-2)" />
      <path d="M74 74l18 12 18-12" stroke="var(--muted)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="110" cy="70" r="4.5" fill="var(--gold)" />
    </svg>
  );
}

/** Administration — a ledger with line items and amounts, a ruled total, and a reconciled check. */
export function AdministrationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 22h40l14 14v66a4 4 0 01-4 4H20a4 4 0 01-4-4V26a4 4 0 014-4z" stroke="var(--muted)" strokeWidth="2" opacity="0.5" />
      <path d="M30 14h44l14 14v72a4 4 0 01-4 4H30a4 4 0 01-4-4V18a4 4 0 014-4z" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <path d="M74 14v14h14" stroke="var(--gold-light)" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="36" y1="44" x2="60" y2="44" stroke="var(--cream)" strokeWidth="2" opacity="0.9" />
      <line x1="70" y1="44" x2="82" y2="44" stroke="var(--cream)" strokeWidth="2" opacity="0.9" />
      <line x1="36" y1="56" x2="56" y2="56" stroke="var(--muted)" strokeWidth="1.6" />
      <line x1="72" y1="56" x2="82" y2="56" stroke="var(--muted)" strokeWidth="1.6" />
      <line x1="36" y1="68" x2="58" y2="68" stroke="var(--muted)" strokeWidth="1.6" />
      <line x1="70" y1="68" x2="82" y2="68" stroke="var(--muted)" strokeWidth="1.6" />
      <line x1="36" y1="79" x2="82" y2="79" stroke="var(--gold)" strokeWidth="1.6" opacity="0.7" />
      <rect x="36" y="85" width="18" height="6" rx="1.5" fill="var(--gold)" />
      <rect x="66" y="85" width="16" height="6" rx="1.5" fill="var(--cream)" opacity="0.9" />
      <circle cx="96" cy="96" r="13" fill="var(--gold)" />
      <path d="M90 96l4 4 8-9" stroke="var(--black)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Virtual assistance — a person on a headset working inside a system window, connected to the queue they're running. */
export function VirtualAssistanceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="18" width="96" height="84" rx="6" stroke="var(--gold-light)" strokeWidth="2.5" />
      <line x1="12" y1="32" x2="108" y2="32" stroke="var(--gold-light)" strokeWidth="2.5" />
      <circle cx="22" cy="25" r="2.5" fill="var(--gold)" />
      <circle cx="31" cy="25" r="2.5" fill="var(--gold)" />
      <path d="M26 92c0-13 9-21 20-21s20 8 20 21" stroke="var(--gold-light)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="46" cy="55" r="11" stroke="var(--gold-light)" strokeWidth="2.5" fill="var(--navy-2)" />
      <path d="M33 55a13 13 0 0126 0" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="31" y="54" width="5" height="9" rx="2.5" fill="var(--gold)" />
      <rect x="56" y="54" width="5" height="9" rx="2.5" fill="var(--gold)" />
      <path d="M58.5 63c0 6-4 9-10 9" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <line x1="64" y1="62" x2="72" y2="62" stroke="var(--muted)" strokeWidth="1.8" strokeDasharray="3 3" />
      <rect x="72" y="44" width="26" height="8" rx="2" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="72" y="58" width="26" height="8" rx="2" stroke="var(--muted)" strokeWidth="1.6" />
      <rect x="72" y="72" width="18" height="8" rx="2" fill="var(--cream)" opacity="0.9" />
      <path d="M86 90l3 3 6-7" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
