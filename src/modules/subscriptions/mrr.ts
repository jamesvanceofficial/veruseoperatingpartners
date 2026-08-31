import type { SubscriptionLineItem, RevenueCategory } from "./types";

type MinimalLineItem = { monthly_price: number; quantity: number; end_date: string | null };

/** MRR is live, never stored — an empty end_date means the line item is currently active and counts; anything with an end_date, past or future, doesn't. */
export function computeMRR(lineItems: MinimalLineItem[]): number {
  return lineItems.filter((li) => li.end_date === null).reduce((sum, li) => sum + Number(li.monthly_price) * li.quantity, 0);
}

export function computeMRRByCategory(lineItems: (MinimalLineItem & { revenue_category: RevenueCategory })[]): { software: number; service: number } {
  const open = lineItems.filter((li) => li.end_date === null);
  return {
    software: open.filter((li) => li.revenue_category === "software").reduce((sum, li) => sum + Number(li.monthly_price) * li.quantity, 0),
    service: open.filter((li) => li.revenue_category === "service").reduce((sum, li) => sum + Number(li.monthly_price) * li.quantity, 0),
  };
}

/** "New MRR this month" — the live MRR contributed by line items that started within the current calendar month. `now` is a parameter so this stays pure/testable. */
export function computeNewMRRThisMonth(lineItems: (MinimalLineItem & { start_date: string })[], now: Date): number {
  const year = now.getFullYear();
  const month = now.getMonth();
  return lineItems
    .filter((li) => li.end_date === null)
    .filter((li) => {
      const started = new Date(li.start_date);
      return started.getFullYear() === year && started.getMonth() === month;
    })
    .reduce((sum, li) => sum + Number(li.monthly_price) * li.quantity, 0);
}

export function isLineItemActive(li: Pick<SubscriptionLineItem, "end_date">): boolean {
  return li.end_date === null;
}
