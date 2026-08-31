"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import type { SubscriptionLineItem } from "./types";

function LineItemRow({ item, subscriptionId }: { item: SubscriptionLineItem; subscriptionId: string }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(item.monthly_price));
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [saving, setSaving] = useState(false);
  const active = item.end_date === null;

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch(`/api/subscriptions/${subscriptionId}/line-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleEnd() {
    if (!window.confirm(`End "${item.description}"? It will stop counting toward MRR immediately.`)) return;
    await save({ endDate: new Date().toISOString().slice(0, 10) });
  }

  async function handleRemove() {
    if (!window.confirm(`Remove "${item.description}" entirely? This deletes it, including its billing history — use "End" instead to just stop it going forward.`)) return;
    setSaving(true);
    try {
      await fetch(`/api/subscriptions/${subscriptionId}/line-items/${item.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="row-hover-lift border-b border-[var(--hairline)] last:border-0">
      <td className="px-5 py-3">
        <p className="text-[12.5px] text-[var(--cream)]">{item.description}</p>
        <p className="text-[10.5px] uppercase tracking-wide text-[var(--muted)]">
          {item.item_type.replace("_", " ")} · {item.revenue_category}
        </p>
      </td>
      <td className="px-5 py-3 text-right">
        <input
          type="number"
          step="0.01"
          min={0}
          value={price}
          disabled={saving}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => Number(price) !== item.monthly_price && save({ monthlyPrice: Number(price) })}
          className="field-control w-24 px-2 py-1 text-right text-[12px]"
        />
      </td>
      <td className="px-5 py-3 text-right">
        <input
          type="number"
          min={0}
          value={quantity}
          disabled={saving}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={() => Number(quantity) !== item.quantity && save({ quantity: Number(quantity) })}
          className="field-control w-16 px-2 py-1 text-right text-[12px]"
        />
      </td>
      <td className="px-5 py-3 text-right font-tabular text-[12.5px] text-[var(--gold-light)]">{formatCurrency(Number(price) * Number(quantity))}</td>
      <td className="px-5 py-3 text-[var(--muted)]">{formatDate(item.start_date)}</td>
      <td className="px-5 py-3">{active ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Ended {formatDate(item.end_date)}</Badge>}</td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          {active ? (
            <button type="button" onClick={handleEnd} disabled={saving} className="text-[11px] text-[var(--muted)] hover:text-[var(--yellow)]">
              End
            </button>
          ) : null}
          <button type="button" onClick={handleRemove} disabled={saving} className="text-[11px] text-[var(--muted)] hover:text-[var(--red)]">
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

export function LineItemsTable({ lineItems, subscriptionId }: { lineItems: SubscriptionLineItem[]; subscriptionId: string }) {
  if (lineItems.length === 0) {
    return <p className="text-[12.5px] text-[var(--muted)]">No line items yet.</p>;
  }

  return (
    <div className="glass-panel overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-[var(--hairline)]">
            <th className="section-label px-5 py-3 text-left">Description</th>
            <th className="section-label px-5 py-3 text-right">Monthly Price</th>
            <th className="section-label px-5 py-3 text-right">Qty</th>
            <th className="section-label px-5 py-3 text-right">Total</th>
            <th className="section-label px-5 py-3 text-left">Start</th>
            <th className="section-label px-5 py-3 text-left">Status</th>
            <th className="section-label px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <LineItemRow key={li.id} item={li} subscriptionId={subscriptionId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
