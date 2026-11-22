/**
 * Stripe products that are product-style plans: the Verus Trading Bot
 * and its add-on. Their subscribers are individuals, not COMPASS
 * organizations, so a subscription made up only of these products counts
 * as Product MRR, is never matched to an organization, and is never
 * flagged as unmatched. Every other subscription is a client subscription
 * that is expected to link to an organization (Client MRR once linked).
 *
 * Product IDs, not names: a rename in Stripe can't silently reclassify
 * revenue. Add a new product here when a new self-serve plan launches.
 */
export const PRODUCT_PLAN_PRODUCT_IDS: ReadonlySet<string> = new Set([
  "prod_VU8aZK1SDbk0I9", // Verus Trading Bot
  "prod_VUVDDjmZ82EN0z", // Extra broker account (Trading Bot add-on)
]);

/**
 * Pinned so the response shape this code reads (e.g. `current_period_end`
 * on the subscription itself) never shifts under it when the account's
 * default API version changes.
 */
export const STRIPE_API_VERSION = "2024-06-20";

export const SYNC_INTERVAL_MS = 60 * 60 * 1000;

/** Subscription statuses that count toward MRR and the Active Subscriptions tile. */
export const MRR_STATUSES: ReadonlySet<string> = new Set(["active"]);

/** Statuses after which a subscription can never come back — not re-fetched once stored. */
export const TERMINAL_STATUSES: ReadonlySet<string> = new Set(["canceled", "incomplete_expired"]);
