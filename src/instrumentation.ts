export async function register() {
  // Node server only, and never during `next build` (no long-lived timers in a build worker).
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { startStripeScheduler } = await import("./modules/stripe/scheduler");
  startStripeScheduler();
}
