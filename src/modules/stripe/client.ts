// Server-only — never import from a "use client" file (reads STRIPE_SECRET_KEY).
import { STRIPE_API_VERSION } from "./config";

/**
 * The only way this app talks to Stripe, and it can only send GET
 * requests — there is deliberately no POST/DELETE helper, so nothing in
 * COMPASS can ever create, change or cancel anything in Stripe.
 *
 * The key is read from the environment at call time and never logged:
 * errors carry Stripe's own message (which never echoes the key), not the
 * request.
 */

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("STRIPE_SECRET_KEY is not set on the server.");
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

type Params = Record<string, string | number | string[] | undefined>;

export async function stripeGet<T>(path: string, params: Params = {}): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError();

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((item) => qs.append(`${k}[]`, item));
    else qs.append(k, String(v));
  }
  const url = `https://api.stripe.com/v1/${path}${qs.size ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}`, "Stripe-Version": STRIPE_API_VERSION },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Stripe GET /${path.split("?")[0]} failed: ${message}`);
  }
  return body as T;
}

/** Every page of a Stripe list endpoint. */
export async function stripeListAll<T extends { id: string }>(path: string, params: Params = {}): Promise<T[]> {
  const out: T[] = [];
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripeGet<{ data: T[]; has_more: boolean }>(path, { ...params, limit: 100, starting_after: startingAfter });
    out.push(...page.data);
    if (!page.has_more || page.data.length === 0) return out;
    startingAfter = page.data[page.data.length - 1].id;
  }
}
