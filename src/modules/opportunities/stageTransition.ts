import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The one place a stage actually changes. Used by both the kanban
 * drag-and-drop endpoint and the full edit form's PATCH route, so a stage
 * change is always logged exactly once, however it happened. No-ops if
 * the stage didn't actually change (editing other fields shouldn't touch
 * stage_changed_at or write a no-op history row). changedBy is null for a
 * transition with no staff actor behind it — a client accepting a
 * proposal via its public share link, for instance; the column itself is
 * nullable for exactly this case.
 */
export async function transitionStage(
  admin: SupabaseClient,
  opportunityId: string,
  fromStage: string | null,
  toStage: string,
  changedBy: string | null
): Promise<void> {
  if (fromStage === toStage) return;

  const nowIso = new Date().toISOString();
  const { error: updateError } = await admin
    .from("opportunities")
    .update({ stage: toStage, stage_changed_at: nowIso })
    .eq("id", opportunityId);
  if (updateError) throw updateError;

  const { error: historyError } = await admin
    .from("opportunity_stage_history")
    .insert({ opportunity_id: opportunityId, from_stage: fromStage, to_stage: toStage, changed_by: changedBy });
  if (historyError) throw historyError;
}
