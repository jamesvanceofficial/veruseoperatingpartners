import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportTier } from "@/modules/assessments/buildTiers";
import { computeResponseDueDate } from "./sla";
import { OPEN_STATUSES } from "./labels";
import type { SupportTicket, TicketListRow, TicketDetail, TicketReply, TicketStatus, TicketPriority } from "./types";

async function getProfileNameMap(supabase: SupabaseClient, ids: (string | null)[]): Promise<Map<string, string>> {
  const realIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (realIds.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", realIds);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const p of data ?? []) map.set(p.id, p.full_name ?? p.email ?? "Unnamed");
  return map;
}

/**
 * The support tier used to compute a new ticket's response-due SLA.
 * Prefers the org's active subscription's own `support_tier` (a real,
 * structured billing fact) — subscriptions has no creation UI yet, so
 * this falls back to the org's most recently completed Full Assessment's
 * EFFECTIVE tier (override ?? recommended, same convention used
 * everywhere else in the app) when no subscription tier is on file. Null
 * if neither source has one — the ticket then gets no fixed SLA rather
 * than a guessed one.
 */
export async function resolveSupportTierForOrg(supabase: SupabaseClient, orgId: string): Promise<SupportTier | null> {
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select("support_tier")
    .eq("org_id", orgId)
    .eq("status", "active")
    .not("support_tier", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subError) throw subError;
  if (sub?.support_tier) return sub.support_tier as SupportTier;

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("recommended_support_tier, support_tier_override")
    .eq("org_id", orgId)
    .eq("assessment_type", "full")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (assessmentError) throw assessmentError;
  if (!assessment) return null;
  return (assessment.support_tier_override ?? assessment.recommended_support_tier) as SupportTier | null;
}

export async function listStaffOptions(supabase: SupabaseClient): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["verus_admin", "verus_staff"])
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({ id: p.id as string, name: (p.full_name as string | null) ?? (p.email as string) ?? "Unnamed" }));
}

export async function listTickets(
  supabase: SupabaseClient,
  filters: { orgId?: string; status?: TicketStatus; statuses?: TicketStatus[]; priority?: TicketPriority; assignedTo?: string } = {}
): Promise<TicketListRow[]> {
  let query = supabase
    .from("support_tickets")
    .select("id, org_id, subject, status, priority, assigned_to, opened_at, response_due_at, first_responded_at");
  if (filters.orgId) query = query.eq("org_id", filters.orgId);
  if (filters.status) query = query.eq("status", filters.status);
  else if (filters.statuses && filters.statuses.length > 0) query = query.in("status", filters.statuses);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

  const { data: rows, error } = await query;
  if (error) throw error;
  const tickets = rows ?? [];
  if (tickets.length === 0) return [];

  const orgIds = [...new Set(tickets.map((t) => t.org_id as string))];
  const [orgsResult, nameMap] = await Promise.all([
    supabase.from("organizations").select("id, name").in("id", orgIds),
    getProfileNameMap(
      supabase,
      tickets.map((t) => t.assigned_to as string | null)
    ),
  ]);
  if (orgsResult.error) throw orgsResult.error;
  const orgNameMap = new Map((orgsResult.data ?? []).map((o) => [o.id as string, o.name as string]));

  return tickets.map((t) => ({
    id: t.id as string,
    orgId: t.org_id as string,
    orgName: orgNameMap.get(t.org_id as string) ?? "Unknown organization",
    subject: t.subject as string,
    status: t.status as TicketStatus,
    priority: t.priority as TicketPriority,
    assignedTo: t.assigned_to as string | null,
    assignedToName: t.assigned_to ? (nameMap.get(t.assigned_to as string) ?? null) : null,
    openedAt: t.opened_at as string,
    responseDueAt: t.response_due_at as string | null,
    firstRespondedAt: t.first_responded_at as string | null,
  }));
}

export async function getTicketDetail(supabase: SupabaseClient, id: string): Promise<TicketDetail | null> {
  const { data: ticket, error } = await supabase.from("support_tickets").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!ticket) return null;

  const [orgResult, subResult, repliesResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", ticket.org_id).maybeSingle(),
    ticket.subscription_id
      ? supabase.from("subscriptions").select("plan_name").eq("id", ticket.subscription_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    // RLS's support_ticket_replies_isolation already hides is_internal rows
    // from a client viewer — no app-level filtering needed on top of it.
    supabase.from("support_ticket_replies").select("*").eq("ticket_id", id).order("created_at", { ascending: true }),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (subResult.error) throw subResult.error;
  if (repliesResult.error) throw repliesResult.error;

  const nameMap = await getProfileNameMap(supabase, [
    ticket.opened_by,
    ticket.assigned_to,
    ...(repliesResult.data ?? []).map((r) => r.author as string | null),
  ]);

  const replies: TicketReply[] = (repliesResult.data ?? []).map((r) => ({
    id: r.id as string,
    ticket_id: r.ticket_id as string,
    author: r.author as string | null,
    authorName: r.author ? (nameMap.get(r.author as string) ?? null) : null,
    body: r.body as string,
    is_internal: r.is_internal as boolean,
    created_at: r.created_at as string,
  }));

  return {
    ticket: ticket as SupportTicket,
    orgName: (orgResult.data?.name as string | undefined) ?? "Unknown organization",
    subscriptionPlanName: (subResult.data as { plan_name: string } | null)?.plan_name ?? null,
    openedByName: ticket.opened_by ? (nameMap.get(ticket.opened_by as string) ?? null) : null,
    assignedToName: ticket.assigned_to ? (nameMap.get(ticket.assigned_to as string) ?? null) : null,
    replies,
  };
}

export async function createTicket(
  admin: SupabaseClient,
  input: { orgId: string; subject: string; description: string | null; priority: TicketPriority; openedBy: string | null }
): Promise<{ id: string; orgName: string }> {
  const tier = await resolveSupportTierForOrg(admin, input.orgId);
  const now = new Date();
  const responseDueAt = computeResponseDueDate(tier, now);

  const { data, error } = await admin
    .from("support_tickets")
    .insert({
      org_id: input.orgId,
      subject: input.subject,
      description: input.description,
      priority: input.priority,
      opened_by: input.openedBy,
      response_due_at: responseDueAt ? responseDueAt.toISOString() : null,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { data: org } = await admin.from("organizations").select("name").eq("id", input.orgId).maybeSingle();
  return { id: data.id as string, orgName: (org?.name as string | undefined) ?? "your organization" };
}

export async function addReply(
  admin: SupabaseClient,
  ticketId: string,
  input: { body: string; author: string | null; isInternal: boolean; isStaffReply: boolean }
): Promise<void> {
  const { error } = await admin.from("support_ticket_replies").insert({
    ticket_id: ticketId,
    author: input.author,
    body: input.body,
    is_internal: input.isInternal,
  });
  if (error) throw error;

  if (input.isStaffReply && !input.isInternal) {
    const { data: ticket, error: ticketError } = await admin.from("support_tickets").select("first_responded_at").eq("id", ticketId).maybeSingle();
    if (ticketError) throw ticketError;
    if (ticket && !ticket.first_responded_at) {
      const { error: stampError } = await admin.from("support_tickets").update({ first_responded_at: new Date().toISOString() }).eq("id", ticketId);
      if (stampError) throw stampError;
    }
  }
}

export async function updateTicketFields(
  admin: SupabaseClient,
  id: string,
  patch: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string | null; resolutionNotes?: string | null }
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.status !== undefined) {
    update.status = patch.status;
    update.resolved_at = patch.status === "resolved" || patch.status === "closed" ? new Date().toISOString() : null;
  }
  if (patch.priority !== undefined) update.priority = patch.priority;
  if (patch.assignedTo !== undefined) update.assigned_to = patch.assignedTo;
  if (patch.resolutionNotes !== undefined) update.resolution_notes = patch.resolutionNotes;
  if (Object.keys(update).length === 0) return;

  const { error } = await admin.from("support_tickets").update(update).eq("id", id);
  if (error) throw error;
}

export async function getTicketDeletePreview(supabase: SupabaseClient, id: string): Promise<{ subject: string; replyCount: number }> {
  const [ticketResult, repliesResult] = await Promise.all([
    supabase.from("support_tickets").select("subject").eq("id", id).maybeSingle(),
    supabase.from("support_ticket_replies").select("id", { count: "exact", head: true }).eq("ticket_id", id),
  ]);
  if (ticketResult.error) throw ticketResult.error;
  if (repliesResult.error) throw repliesResult.error;
  return { subject: (ticketResult.data?.subject as string | undefined) ?? "this ticket", replyCount: repliesResult.count ?? 0 };
}

export async function deleteTicket(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("support_tickets").delete().eq("id", id);
  if (error) throw error;
}

export async function getOpenAndOverdueCounts(supabase: SupabaseClient): Promise<{ open: number; overdue: number }> {
  const [openResult, overdueResult] = await Promise.all([
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", OPEN_STATUSES),
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_STATUSES)
      .is("first_responded_at", null)
      .lt("response_due_at", new Date().toISOString()),
  ]);
  if (openResult.error) throw openResult.error;
  if (overdueResult.error) throw overdueResult.error;
  return { open: openResult.count ?? 0, overdue: overdueResult.count ?? 0 };
}
