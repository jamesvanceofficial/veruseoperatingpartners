import Link from "next/link";
import { formatCurrency } from "@/shared/format";
import type { DataQualityIssues } from "./data";

/**
 * The drift check: renders only when there's something wrong, never an
 * empty "all clear" panel competing for attention on a normal day (same
 * convention as the dashboard's past-due line).
 */
export function DataQualityBanner({ issues }: { issues: DataQualityIssues }) {
  const { activeClientsWithoutStripe, unmatchedSubscriptions } = issues;
  if (activeClientsWithoutStripe.length === 0 && unmatchedSubscriptions.length === 0) return null;

  return (
    <div role="alert" className="glass-panel flex flex-col gap-2.5 border border-[color-mix(in_srgb,var(--yellow)_55%,transparent)] px-4 py-3">
      <p className="text-[12.5px] font-semibold text-[var(--yellow)]">Data quality: COMPASS and Stripe don&apos;t agree</p>

      {activeClientsWithoutStripe.length > 0 ? (
        <div className="text-[12.5px] text-[var(--cream)]">
          {activeClientsWithoutStripe.length === 1 ? "1 organization is" : `${activeClientsWithoutStripe.length} organizations are`} marked Active Client but
          {activeClientsWithoutStripe.length === 1 ? " has" : " have"} no linked active Stripe subscription:{" "}
          {activeClientsWithoutStripe.map((o, i) => (
            <span key={o.id}>
              {i > 0 ? ", " : ""}
              <Link href={`/organizations/${o.id}`} className="text-[var(--gold-light)] hover:underline">
                {o.name}
              </Link>
            </span>
          ))}
          .
        </div>
      ) : null}

      {unmatchedSubscriptions.length > 0 ? (
        <div className="text-[12.5px] text-[var(--cream)]">
          {unmatchedSubscriptions.length === 1 ? "1 Stripe subscription has" : `${unmatchedSubscriptions.length} Stripe subscriptions have`} no linked organization (
          {formatCurrency(unmatchedSubscriptions.reduce((s, u) => s + u.mrr, 0))}/mo, not counted in Client or Total MRR until attached):{" "}
          {unmatchedSubscriptions.map((u, i) => (
            <span key={u.id}>
              {i > 0 ? "; " : ""}
              {u.label}
            </span>
          ))}
          .{" "}
          <Link href="/subscriptions/stripe" className="text-[var(--gold-light)] hover:underline">
            Attach them →
          </Link>
        </div>
      ) : null}

      <p className="text-[11px] text-[var(--muted)]">
        Demo organizations and Verus Trading Bot subscribers (individuals, not client organizations) are excluded from this check.
      </p>
    </div>
  );
}
