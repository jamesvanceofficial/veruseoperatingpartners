import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listBuildPackageOptions } from "@/modules/buildPackages/data";

/** Powers the project form's org-dependent build-package dropdown. RLS-scoped read — no staff guard needed, same as any other page fetch. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: orgId } = await params;
  const supabase = await createServerSupabase();
  try {
    const data = await listBuildPackageOptions(supabase, orgId);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load build packages.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
