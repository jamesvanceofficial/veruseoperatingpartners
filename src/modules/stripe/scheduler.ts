// Server-only — started once per server process from src/instrumentation.ts.
import { isStripeConfigured } from "./client";
import { SYNC_INTERVAL_MS } from "./config";
import { runStripeSync } from "./sync";

const FIRST_RUN_DELAY_MS = 60 * 1000;
const globalFlag = globalThis as unknown as { __verusStripeSchedulerStarted?: boolean };

/**
 * The hourly Stripe sync: once a minute after the server boots (so a fresh
 * deploy has current figures), then every hour. Lives in the app itself —
 * not a host crontab — so the schedule is version-controlled and ships with
 * every deploy. Failures are logged and recorded in stripe_sync_runs; they
 * never crash the server.
 */
export function startStripeScheduler(): void {
  if (globalFlag.__verusStripeSchedulerStarted) return;
  globalFlag.__verusStripeSchedulerStarted = true;

  if (!isStripeConfigured()) {
    console.warn("[stripe-sync] STRIPE_SECRET_KEY not set — hourly sync disabled.");
    return;
  }

  const tick = () => {
    runStripeSync({ trigger: "schedule" })
      .then((s) => console.log(`[stripe-sync] scheduled sync ok: ${s.synced} subscriptions, ${s.newlyMatched} newly matched`))
      .catch((err) => console.error("[stripe-sync] scheduled sync failed:", err instanceof Error ? err.message : String(err)));
  };

  setTimeout(tick, FIRST_RUN_DELAY_MS).unref();
  setInterval(tick, SYNC_INTERVAL_MS).unref();
}
