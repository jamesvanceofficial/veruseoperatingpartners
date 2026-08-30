import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listPhaseOptions } from "@/modules/buildPackages/data";

/** Powers the project form's build-package-dependent phase dropdown. RLS-scoped read — no staff guard needed, same as any other page fetch. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: buildPackageId } = await params;
  const supabase = await createServerSupabase();
  try {
    const data = await listPhaseOptions(supabase, buildPackageId);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load phases.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
