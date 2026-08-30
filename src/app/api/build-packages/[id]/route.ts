import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull, numberOrNull } from "@/shared/format";
import { updateBuildPackage, deleteBuildPackage } from "@/modules/buildPackages/data";
import { BUILD_PACKAGE_STATUSES } from "@/modules/buildPackages/labels";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await deleteBuildPackage(admin, id, guard.userId);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete the build package.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const status = emptyToNull(body?.status);
  if (!status || !BUILD_PACKAGE_STATUSES.includes(status as (typeof BUILD_PACKAGE_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    await updateBuildPackage(admin, id, {
      price: numberOrNull(body.price),
      depositAmount: numberOrNull(body.depositAmount),
      depositPaid: Boolean(body.depositPaid),
      balanceAmount: numberOrNull(body.balanceAmount),
      balancePaid: Boolean(body.balancePaid),
      startDate: emptyToNull(body.startDate),
      targetCompletionDate: emptyToNull(body.targetCompletionDate),
      handoverDate: emptyToNull(body.handoverDate),
      status,
      notes: emptyToNull(body.notes),
    });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the build package.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
