/**
 * Services MRR — pure functions (no DB, no network), shared by the
 * dashboard tile and the data-quality banner so the two can never
 * disagree about what was counted or excluded.
 *
 * Services MRR = live Stripe service lines (any subscription, linked or
 * not) + open COMPASS `subscription_line_items` with revenue_category
 * 'service' (anything billed outside Stripe) — EXCEPT a COMPASS line item
 * whose organization already has a counted Stripe line for the same
 * service. That one is excluded (Stripe is the billing of record) and
 * named in the banner as a suspected duplicate.
 */

export type ServiceKey = "va" | "seo" | "social" | "bookkeeping" | "marketing";

/**
 * Which service a product name / line-item description refers to, or null
 * when it can't tell. Order matters: "VA Hours — Marketing / social media"
 * is a VA placement, and "Social media management" is social, not
 * marketing.
 */
export function serviceKeyFromText(text: string): ServiceKey | null {
  const t = text.toLowerCase();
  if (/\bva\b|virtual assistan/.test(t)) return "va";
  if (/\bseo\b|search engine/.test(t)) return "seo";
  if (/social/.test(t)) return "social";
  if (/bookkeep|accounting/.test(t)) return "bookkeeping";
  if (/marketing/.test(t)) return "marketing";
  return null;
}

const normalizeName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export type StripeServiceLine = {
  stripeSubscriptionId: string;
  orgId: string | null;
  productName: string;
  serviceKey: string | null;
  monthly: number;
};

export type CompassServiceLine = {
  id: string;
  subscriptionId: string;
  orgId: string | null;
  orgName: string | null;
  description: string;
  monthly: number;
};

export type SuspectedDuplicate = {
  lineItemId: string;
  subscriptionId: string;
  orgId: string;
  orgName: string;
  lineItemDescription: string;
  lineItemMrr: number;
  stripeProductName: string;
  stripeSubscriptionId: string;
};

export type ServicesBreakdown = {
  stripeMRR: number;
  stripeLineCount: number;
  compassMRR: number;
  compassLineCount: number;
  totalMRR: number;
  duplicates: SuspectedDuplicate[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Same organization, and the same service — by service key, or failing that an identical name. */
function findStripeMatch(line: CompassServiceLine, stripeLines: StripeServiceLine[]): StripeServiceLine | null {
  if (!line.orgId) return null;
  const key = serviceKeyFromText(line.description);
  const name = normalizeName(line.description);
  return (
    stripeLines.find(
      (s) => s.orgId === line.orgId && ((key !== null && (s.serviceKey ?? serviceKeyFromText(s.productName)) === key) || normalizeName(s.productName) === name)
    ) ?? null
  );
}

export function computeServicesBreakdown(stripeLines: StripeServiceLine[], compassLines: CompassServiceLine[]): ServicesBreakdown {
  const duplicates: SuspectedDuplicate[] = [];
  const counted: CompassServiceLine[] = [];
  for (const line of compassLines) {
    const match = findStripeMatch(line, stripeLines);
    if (match) {
      duplicates.push({
        lineItemId: line.id,
        subscriptionId: line.subscriptionId,
        orgId: line.orgId!,
        orgName: line.orgName ?? "—",
        lineItemDescription: line.description,
        lineItemMrr: round2(line.monthly),
        stripeProductName: match.productName,
        stripeSubscriptionId: match.stripeSubscriptionId,
      });
    } else {
      counted.push(line);
    }
  }
  const stripeMRR = round2(stripeLines.reduce((s, l) => s + l.monthly, 0));
  const compassMRR = round2(counted.reduce((s, l) => s + l.monthly, 0));
  return { stripeMRR, stripeLineCount: stripeLines.length, compassMRR, compassLineCount: counted.length, totalMRR: round2(stripeMRR + compassMRR), duplicates };
}
