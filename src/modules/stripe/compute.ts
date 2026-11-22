import { SERVICE_CATEGORY_METADATA_KEY, SERVICE_CATEGORY_VALUE, SERVICE_KEY_METADATA_KEY } from "./config";
import { serviceKeyFromText } from "./services";

/**
 * Pure functions (no DB, no network) that turn raw Stripe objects into
 * the numbers COMPASS stores — same convention as subscriptions/mrr.ts
 * and support/sla.ts, so they can be checked directly against real data.
 *
 * Amounts are list prices (unit amount × quantity). The account has no
 * coupons/discounts or tax on any subscription at the time this was
 * written; if that changes, these are pre-discount figures.
 */

export type StripeRecurring = { interval: "day" | "week" | "month" | "year"; interval_count: number };
export type StripePrice = {
  id: string;
  product: string | { id: string };
  unit_amount: number | null;
  unit_amount_decimal?: string | null;
  recurring: StripeRecurring | null;
  metadata?: Record<string, string> | null;
};
export type StripeSubscriptionItem = { price: StripePrice; quantity?: number | null };
export type StripeSchedulePhase = {
  start_date: number;
  end_date: number | null;
  items: { price: StripePrice | string; quantity?: number | null }[];
};
export type StripeSchedule = { id: string; status: string; end_behavior: string; phases: StripeSchedulePhase[] };

export type SyncedItem = {
  product_id: string;
  product_name: string;
  price_id: string;
  unit_amount: number;
  quantity: number;
  interval: string;
  interval_count: number;
  monthly_amount: number;
  /** Resold service line (Stripe product or price metadata verus_category = "service") — counts as Services MRR. Absent on rows synced before this existed = false. */
  is_service?: boolean;
  /** Which service, for duplicate detection against COMPASS line items: verus_service metadata, else inferred from the product name. */
  service_key?: string | null;
};

/** What the sync knows about each Stripe product, read from the product list every run. */
export type ProductInfo = { name: string; metadata: Record<string, string> };

const round2 = (n: number) => Math.round(n * 100) / 100;

function productIdOf(price: StripePrice): string {
  return typeof price.product === "string" ? price.product : price.product.id;
}

/** Cents → dollars. Falls back to unit_amount_decimal (sub-cent prices) when unit_amount is null. */
function unitAmountDollars(price: StripePrice): number {
  if (price.unit_amount !== null && price.unit_amount !== undefined) return price.unit_amount / 100;
  if (price.unit_amount_decimal) return Number(price.unit_amount_decimal) / 100;
  return 0;
}

/** Multiplier from one billing interval's amount to a monthly amount. */
export function monthlyFactor(recurring: StripeRecurring | null): number {
  if (!recurring) return 0; // one-time price: not recurring revenue
  const count = recurring.interval_count || 1;
  switch (recurring.interval) {
    case "month":
      return 1 / count;
    case "year":
      return 1 / (12 * count);
    case "week":
      return 52 / 12 / count;
    case "day":
      return 365 / 12 / count;
  }
}

/**
 * A line is a service when its price's metadata says verus_category =
 * "service", or — with no category on the price — its product's does. A
 * category set on the price always wins (either way), so one product can
 * carry a service price and a non-service price.
 */
export function classifyServiceLine(price: StripePrice, product: ProductInfo | undefined): { isService: boolean; serviceKey: string | null } {
  const priceCategory = price.metadata?.[SERVICE_CATEGORY_METADATA_KEY]?.trim().toLowerCase();
  const productCategory = product?.metadata?.[SERVICE_CATEGORY_METADATA_KEY]?.trim().toLowerCase();
  const category = priceCategory || productCategory;
  const isService = category === SERVICE_CATEGORY_VALUE;
  if (!isService) return { isService: false, serviceKey: null };
  const explicitKey = (price.metadata?.[SERVICE_KEY_METADATA_KEY] || product?.metadata?.[SERVICE_KEY_METADATA_KEY])?.trim().toLowerCase();
  return { isService: true, serviceKey: explicitKey || serviceKeyFromText(product?.name ?? "") };
}

export function toSyncedItems(items: StripeSubscriptionItem[], products: Map<string, ProductInfo>): SyncedItem[] {
  return items.map((item) => {
    const productId = productIdOf(item.price);
    const unit = unitAmountDollars(item.price);
    const quantity = item.quantity ?? 1;
    const product = products.get(productId);
    const service = classifyServiceLine(item.price, product);
    return {
      product_id: productId,
      product_name: product?.name ?? productId,
      price_id: item.price.id,
      unit_amount: round2(unit),
      quantity,
      interval: item.price.recurring?.interval ?? "one_time",
      interval_count: item.price.recurring?.interval_count ?? 1,
      monthly_amount: round2(unit * quantity * monthlyFactor(item.price.recurring)),
      is_service: service.isService,
      service_key: service.serviceKey,
    };
  });
}

export function sumMonthly(items: SyncedItem[]): number {
  return round2(items.reduce((s, i) => s + i.monthly_amount, 0));
}

/** One subscription's monthly amount split by line: resold service lines vs. everything else (platform/product lines). Never double-counted — each line lands in exactly one. */
export function splitMonthly(items: SyncedItem[]): { service: number; platform: number } {
  return { service: sumMonthly(items.filter((i) => i.is_service)), platform: sumMonthly(items.filter((i) => !i.is_service)) };
}

/** One billing period's charge for these items (not normalized to monthly). */
export function sumPerPeriod(items: SyncedItem[]): number {
  return round2(items.reduce((s, i) => s + i.unit_amount * i.quantity, 0));
}

/** "Verus Trading Bot + Extra broker account ×2" — items grouped by product, quantities added up. */
export function summarizeProducts(items: SyncedItem[]): string {
  const totals = new Map<string, number>();
  for (const i of items) totals.set(i.product_name, (totals.get(i.product_name) ?? 0) + i.quantity);
  return [...totals.entries()].map(([name, qty]) => (qty > 1 ? `${name} ×${qty}` : name)).join(" + ") || "(no items)";
}

export function describeInterval(interval: string, count: number): string {
  if (interval === "one_time") return "one-time";
  return count === 1 ? interval : `every ${count} ${interval}s`;
}

function phaseItems(phase: StripeSchedulePhase, products: Map<string, ProductInfo>): SyncedItem[] | null {
  // A phase item's price must be expanded to read its amount; an unexpanded string id means we can't price it.
  if (phase.items.some((i) => typeof i.price === "string")) return null;
  return toSyncedItems(phase.items.map((i) => ({ price: i.price as StripePrice, quantity: i.quantity })), products);
}

function phaseAt(schedule: StripeSchedule | null, t: number): StripeSchedulePhase | null {
  if (!schedule || schedule.status !== "active") return null;
  return schedule.phases.find((p) => p.start_date <= t && (p.end_date === null || t < p.end_date)) ?? null;
}

function sameItems(a: SyncedItem[], b: SyncedItem[]): boolean {
  const key = (items: SyncedItem[]) =>
    items
      .map((i) => `${i.price_id}:${i.quantity}`)
      .sort()
      .join("|");
  return key(a) === key(b);
}

export type InvoiceAndSchedule = {
  nextInvoiceAt: number | null;
  nextInvoiceAmount: number | null;
  scheduledChangeAt: number | null;
  scheduledMrr: number | null;
  scheduledItems: SyncedItem[] | null;
};

/**
 * Next invoice + next scheduled change, computed from the subscription
 * and its schedule — never from Stripe's invoice-preview endpoint, which
 * (for these flexible-billing-mode subscriptions) only exists as a POST,
 * and this connection only ever sends GETs.
 *
 * - Next invoice: at the end of the current period, for the items in
 *   effect at that moment (a schedule phase starting exactly then wins, so
 *   a scheduled increase shows its new amount). None when the
 *   subscription is set to end before then.
 * - Scheduled change: the first future schedule phase whose items differ
 *   from today's, or a future cancel_at (moving MRR to 0), whichever is
 *   sooner.
 */
export function computeInvoiceAndSchedule(
  sub: { status: string; current_period_end: number | null; cancel_at_period_end: boolean; cancel_at: number | null },
  currentItems: SyncedItem[],
  schedule: StripeSchedule | null,
  products: Map<string, ProductInfo>,
  nowSec: number
): InvoiceAndSchedule {
  const result: InvoiceAndSchedule = { nextInvoiceAt: null, nextInvoiceAmount: null, scheduledChangeAt: null, scheduledMrr: null, scheduledItems: null };

  const periodEnd = sub.current_period_end;
  const ending = sub.cancel_at_period_end || (sub.cancel_at !== null && periodEnd !== null && sub.cancel_at <= periodEnd);
  if (periodEnd !== null && !ending && (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due")) {
    const phase = phaseAt(schedule, periodEnd);
    const items = (phase && phaseItems(phase, products)) ?? currentItems;
    result.nextInvoiceAt = periodEnd;
    result.nextInvoiceAmount = sumPerPeriod(items);
  }

  if (schedule && schedule.status === "active") {
    const future = schedule.phases.filter((p) => p.start_date > nowSec).sort((a, b) => a.start_date - b.start_date);
    for (const phase of future) {
      const items = phaseItems(phase, products);
      if (items && !sameItems(items, currentItems)) {
        result.scheduledChangeAt = phase.start_date;
        result.scheduledMrr = sumMonthly(items);
        result.scheduledItems = items;
        break;
      }
    }
  }

  if (sub.cancel_at !== null && sub.cancel_at > nowSec && (result.scheduledChangeAt === null || sub.cancel_at < result.scheduledChangeAt)) {
    result.scheduledChangeAt = sub.cancel_at;
    result.scheduledMrr = 0;
    result.scheduledItems = [];
  }

  return result;
}
