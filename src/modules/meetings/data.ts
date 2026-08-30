import type { SupabaseClient } from "@supabase/supabase-js";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import { createTask } from "@/modules/tasks/data";
import type { AttendeeInput, Meeting, MeetingActionItem, MeetingDetail, MeetingListRow } from "./types";

async function getProfileNameMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const p of data ?? []) map.set(p.id, p.full_name ?? p.email ?? "Unnamed");
  return map;
}

async function resolveRelatedLabel(supabase: SupabaseClient, meeting: Meeting): Promise<string | null> {
  if (meeting.opportunity_id) {
    const { data } = await supabase.from("opportunities").select("name").eq("id", meeting.opportunity_id).maybeSingle();
    return data ? `Opportunity: ${data.name}` : null;
  }
  if (meeting.build_package_id) {
    const { data } = await supabase.from("build_packages").select("tier").eq("id", meeting.build_package_id).maybeSingle();
    return data ? `Build Package: ${BUILD_TIER_INFO[data.tier as keyof typeof BUILD_TIER_INFO].label}` : null;
  }
  if (meeting.project_id) {
    const { data } = await supabase.from("projects").select("name").eq("id", meeting.project_id).maybeSingle();
    return data ? `Project: ${data.name}` : null;
  }
  return null;
}

// ===========================================================
// List
// ===========================================================

export type MeetingFilters = { orgId?: string; type?: string };

export async function listMeetings(supabase: SupabaseClient, filters: MeetingFilters = {}): Promise<MeetingListRow[]> {
  let query = supabase.from("meetings").select("*").order("scheduled_at", { ascending: false, nullsFirst: false });
  if (filters.orgId) query = query.eq("org_id", filters.orgId);
  if (filters.type) query = query.eq("meeting_type", filters.type);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data as Meeting[]) ?? [];
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.org_id).filter((v): v is string => Boolean(v)))];
  const meetingIds = rows.map((r) => r.id);

  const [orgsResult, attendeesResult, actionItemsResult] = await Promise.all([
    orgIds.length > 0 ? supabase.from("organizations").select("id, name").in("id", orgIds) : Promise.resolve({ data: [], error: null }),
    supabase.from("meeting_attendees").select("meeting_id").in("meeting_id", meetingIds),
    supabase.from("meeting_action_items").select("meeting_id, status").in("meeting_id", meetingIds),
  ]);
  if (orgsResult.error) throw orgsResult.error;
  if (attendeesResult.error) throw attendeesResult.error;
  if (actionItemsResult.error) throw actionItemsResult.error;

  const orgNameMap = new Map((orgsResult.data ?? []).map((o) => [o.id as string, o.name as string]));
  const attendeeCountMap = new Map<string, number>();
  for (const a of attendeesResult.data ?? []) attendeeCountMap.set(a.meeting_id as string, (attendeeCountMap.get(a.meeting_id as string) ?? 0) + 1);
  const openActionItemCountMap = new Map<string, number>();
  for (const a of actionItemsResult.data ?? []) {
    if (a.status === "open" || a.status === "in_progress") {
      openActionItemCountMap.set(a.meeting_id as string, (openActionItemCountMap.get(a.meeting_id as string) ?? 0) + 1);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    orgName: r.org_id ? (orgNameMap.get(r.org_id) ?? "Unknown organization") : null,
    title: r.title,
    meeting_type: r.meeting_type,
    scheduled_at: r.scheduled_at,
    attendeeCount: attendeeCountMap.get(r.id) ?? 0,
    openActionItemCount: openActionItemCountMap.get(r.id) ?? 0,
  }));
}

// ===========================================================
// Detail
// ===========================================================

export async function getMeetingDetail(supabase: SupabaseClient, id: string): Promise<MeetingDetail | null> {
  const { data: meetingRow, error: meetingError } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
  if (meetingError) throw meetingError;
  if (!meetingRow) return null;
  const meeting = meetingRow as Meeting;

  const [orgResult, relatedLabel, attendeesResult, actionItemsResult, createdByNameMap] = await Promise.all([
    meeting.org_id ? supabase.from("organizations").select("name").eq("id", meeting.org_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    resolveRelatedLabel(supabase, meeting),
    supabase.from("meeting_attendees").select("*").eq("meeting_id", id),
    supabase.from("meeting_action_items").select("*").eq("meeting_id", id).order("created_at", { ascending: true }),
    getProfileNameMap(supabase, meeting.created_by ? [meeting.created_by] : []),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (attendeesResult.error) throw attendeesResult.error;
  if (actionItemsResult.error) throw actionItemsResult.error;

  const attendeeRows = attendeesResult.data ?? [];
  const contactIds = attendeeRows.filter((a) => a.contact_id).map((a) => a.contact_id as string);
  const profileIds = attendeeRows.filter((a) => a.profile_id).map((a) => a.profile_id as string);
  const actionItemRows = (actionItemsResult.data as MeetingActionItem[]) ?? [];
  const assigneeIds = actionItemRows.filter((a) => a.assignee).map((a) => a.assignee as string);

  const [contactNameResult, profileNameMap] = await Promise.all([
    contactIds.length > 0 ? supabase.from("contacts").select("id, full_name").in("id", contactIds) : Promise.resolve({ data: [], error: null }),
    getProfileNameMap(supabase, [...new Set([...profileIds, ...assigneeIds])]),
  ]);
  if (contactNameResult.error) throw contactNameResult.error;
  const contactNameMap = new Map((contactNameResult.data ?? []).map((c) => [c.id as string, c.full_name as string]));

  const attendees = attendeeRows.map((a) => {
    if (a.contact_id) return { id: a.id as string, name: contactNameMap.get(a.contact_id as string) ?? "Unknown contact", kind: "contact" as const };
    if (a.profile_id) return { id: a.id as string, name: profileNameMap.get(a.profile_id as string) ?? "Unknown staff", kind: "staff" as const };
    return { id: a.id as string, name: (a.display_name as string) ?? "Guest", kind: "guest" as const };
  });

  const actionItems = actionItemRows.map((a) => ({ ...a, assigneeName: a.assignee ? (profileNameMap.get(a.assignee) ?? null) : null }));

  return {
    meeting,
    orgName: (orgResult.data as { name: string } | null)?.name ?? null,
    relatedLabel,
    attendees,
    actionItems,
    createdByName: meeting.created_by ? (createdByNameMap.get(meeting.created_by) ?? null) : null,
  };
}

/** Raw attendee rows for the edit form — getMeetingDetail()'s attendees are resolved display names, not the contact_id/profile_id/display_name the form needs to pre-fill and re-submit. */
export async function getMeetingAttendeesForEdit(supabase: SupabaseClient, meetingId: string): Promise<AttendeeInput[]> {
  const { data, error } = await supabase.from("meeting_attendees").select("contact_id, profile_id, display_name").eq("meeting_id", meetingId);
  if (error) throw error;
  return (data ?? []).map((a) => {
    if (a.contact_id) return { kind: "contact" as const, value: a.contact_id as string };
    if (a.profile_id) return { kind: "staff" as const, value: a.profile_id as string };
    return { kind: "guest" as const, value: (a.display_name as string) ?? "" };
  });
}

// ===========================================================
// Create / update / delete
// ===========================================================

export type MeetingInput = {
  orgId: string | null;
  opportunityId: string | null;
  buildPackageId: string | null;
  projectId: string | null;
  title: string;
  meetingType: string;
  scheduledAt: string | null;
  agenda: string | null;
  notes: string | null;
  decisions: string | null;
  followUpDate: string | null;
  attendees: AttendeeInput[];
};

async function replaceAttendees(admin: SupabaseClient, meetingId: string, attendees: AttendeeInput[]): Promise<void> {
  const { error: deleteError } = await admin.from("meeting_attendees").delete().eq("meeting_id", meetingId);
  if (deleteError) throw deleteError;

  const rows = attendees
    .filter((a) => a.value.trim().length > 0)
    .map((a) => ({
      meeting_id: meetingId,
      contact_id: a.kind === "contact" ? a.value : null,
      profile_id: a.kind === "staff" ? a.value : null,
      display_name: a.kind === "guest" ? a.value.trim() : null,
    }));
  if (rows.length === 0) return;

  const { error: insertError } = await admin.from("meeting_attendees").insert(rows);
  if (insertError) throw insertError;
}

export async function createMeeting(admin: SupabaseClient, input: MeetingInput, createdBy: string): Promise<string> {
  const { data, error } = await admin
    .from("meetings")
    .insert({
      org_id: input.orgId,
      opportunity_id: input.opportunityId,
      build_package_id: input.buildPackageId,
      project_id: input.projectId,
      title: input.title,
      meeting_type: input.meetingType,
      scheduled_at: input.scheduledAt,
      agenda: input.agenda,
      notes: input.notes,
      decisions: input.decisions,
      follow_up_date: input.followUpDate,
      created_by: createdBy,
    })
    .select("id")
    .single();
  if (error) throw error;

  await replaceAttendees(admin, data.id as string, input.attendees);
  return data.id as string;
}

export async function updateMeeting(admin: SupabaseClient, id: string, input: MeetingInput): Promise<void> {
  const { error } = await admin
    .from("meetings")
    .update({
      org_id: input.orgId,
      opportunity_id: input.opportunityId,
      build_package_id: input.buildPackageId,
      project_id: input.projectId,
      title: input.title,
      meeting_type: input.meetingType,
      scheduled_at: input.scheduledAt,
      agenda: input.agenda,
      notes: input.notes,
      decisions: input.decisions,
      follow_up_date: input.followUpDate,
    })
    .eq("id", id);
  if (error) throw error;

  await replaceAttendees(admin, id, input.attendees);
}

export type MeetingDeletePreview = { attendeeCount: number; actionItemCount: number };

export async function getMeetingDeletePreview(supabase: SupabaseClient, id: string): Promise<MeetingDeletePreview> {
  const [attendeesResult, actionItemsResult] = await Promise.all([
    supabase.from("meeting_attendees").select("*", { count: "exact", head: true }).eq("meeting_id", id),
    supabase.from("meeting_action_items").select("*", { count: "exact", head: true }).eq("meeting_id", id),
  ]);
  if (attendeesResult.error) throw attendeesResult.error;
  if (actionItemsResult.error) throw actionItemsResult.error;
  return { attendeeCount: attendeesResult.count ?? 0, actionItemCount: actionItemsResult.count ?? 0 };
}

export async function deleteMeeting(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("meetings").delete().eq("id", id);
  if (error) throw error;
}

// ===========================================================
// Action items
// ===========================================================

export type ActionItemInput = { description: string; assignee: string | null; dueDate: string | null; status: string };

export async function createActionItem(admin: SupabaseClient, meetingId: string, input: ActionItemInput): Promise<string> {
  const { data, error } = await admin
    .from("meeting_action_items")
    .insert({ meeting_id: meetingId, description: input.description, assignee: input.assignee, due_date: input.dueDate, status: input.status })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateActionItem(admin: SupabaseClient, id: string, input: ActionItemInput): Promise<void> {
  const { error } = await admin
    .from("meeting_action_items")
    .update({ description: input.description, assignee: input.assignee, due_date: input.dueDate, status: input.status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteActionItem(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("meeting_action_items").delete().eq("id", id);
  if (error) throw error;
}

/** One click: description/assignee/due date carry straight over — nothing retyped. Idempotent — re-clicking an already-converted item returns its existing task rather than creating a duplicate. */
export async function convertActionItemToTask(admin: SupabaseClient, actionItemId: string): Promise<{ ok: true; taskId: string } | { ok: false; error: string }> {
  const { data: item, error: itemError } = await admin.from("meeting_action_items").select("*").eq("id", actionItemId).maybeSingle();
  if (itemError) return { ok: false, error: itemError.message };
  if (!item) return { ok: false, error: "Action item not found." };
  if (item.linked_task_id) return { ok: true, taskId: item.linked_task_id as string };

  const { data: meeting, error: meetingError } = await admin.from("meetings").select("org_id, project_id").eq("id", item.meeting_id).maybeSingle();
  if (meetingError) return { ok: false, error: meetingError.message };

  const taskId = await createTask(admin, {
    title: item.description as string,
    description: null,
    projectId: (meeting?.project_id as string | null) ?? null,
    orgId: (meeting?.org_id as string | null) ?? null,
    assignee: (item.assignee as string | null) ?? null,
    priority: "medium",
    status: "open",
    dueDate: (item.due_date as string | null) ?? null,
    notes: null,
  });

  const { error: linkError } = await admin.from("meeting_action_items").update({ linked_task_id: taskId }).eq("id", actionItemId);
  if (linkError) return { ok: false, error: linkError.message };

  return { ok: true, taskId };
}

/** Reverse lookup for a task's edit page — "Originated from meeting: X" — since the link (Stage 11 requirement 3) is stored as meeting_action_items.linked_task_id, forward only. */
export async function getMeetingForTask(supabase: SupabaseClient, taskId: string): Promise<{ meetingId: string; meetingTitle: string } | null> {
  const { data: item, error: itemError } = await supabase.from("meeting_action_items").select("meeting_id").eq("linked_task_id", taskId).maybeSingle();
  if (itemError) throw itemError;
  if (!item) return null;
  const { data: meeting, error: meetingError } = await supabase.from("meetings").select("title").eq("id", item.meeting_id).maybeSingle();
  if (meetingError) throw meetingError;
  if (!meeting) return null;
  return { meetingId: item.meeting_id as string, meetingTitle: meeting.title as string };
}
