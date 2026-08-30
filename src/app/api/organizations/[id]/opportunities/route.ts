import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listOpportunityOptions } from "@/modules/opportunities/data";

/** Powers the meeting form's org-dependent "related opportunity" dropdown. RLS-scoped read — no staff guard needed, same as any other page fetch. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: orgId } = await params;
  const supabase = await createServerSupabase();
  try {
    const data = await listOpportunityOptions(supabase, orgId);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load opportunities.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
