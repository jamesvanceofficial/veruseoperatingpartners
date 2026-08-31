import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createLineItem, addCatalogLineItem, addVaPlacement } from "@/modules/subscriptions/data";
import { LINE_ITEM_TYPES, REVENUE_CATEGORIES } from "@/modules/subscriptions/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const admin = createAdminClient();

  try {
    if (typeof body?.catalogKey === "string" && body.catalogKey) {
      const { id: lineItemId } = await addCatalogLineItem(admin, id, body.catalogKey);
      return NextResponse.json({ data: { id: lineItemId } });
    }

    if (typeof body?.vaRole === "string" && body.vaRole) {
      const result = await addVaPlacement(admin, id, body.vaRole);
      return NextResponse.json({ data: result });
    }

    // Custom line item.
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    if (!description) return NextResponse.json({ error: "A description is required." }, { status: 400 });
    const monthlyPrice = Number(body?.monthlyPrice);
    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) return NextResponse.json({ error: "A valid monthly price is required." }, { status: 400 });
    const quantity = Number(body?.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) return NextResponse.json({ error: "A valid quantity is required." }, { status: 400 });
    const itemType = LINE_ITEM_TYPES.includes(body?.itemType) ? body.itemType : "addon";
    const revenueCategory = REVENUE_CATEGORIES.includes(body?.revenueCategory) ? body.revenueCategory : "software";
    const startDate = emptyToNull(body?.startDate) ?? new Date().toISOString().slice(0, 10);
    const endDate = emptyToNull(body?.endDate);

    const { id: lineItemId } = await createLineItem(admin, id, { itemType, description, monthlyPrice, quantity, revenueCategory, startDate, endDate });
    return NextResponse.json({ data: { id: lineItemId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add the line item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
