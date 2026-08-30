import type { SupabaseClient } from "@supabase/supabase-js";
import { taskStatusToScopeItemStatus } from "./scopeItemSync";
import type { Task, TaskListRow } from "./types";

async function getProfileNameMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const p of data ?? []) map.set(p.id, p.full_name ?? p.email ?? "Unnamed");
  return map;
}

export type TaskFilters = {
  orgId?: string;
  assigneeId?: string;
  overdue?: boolean;
  buildPackageId?: string;
  status?: string;
};

export async function listTasks(supabase: SupabaseClient, filters: TaskFilters = {}): Promise<TaskListRow[]> {
  let query = supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false });
  if (filters.orgId) query = query.eq("org_id", filters.orgId);
  if (filters.assigneeId) query = query.eq("assignee", filters.assigneeId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.overdue) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.lt("due_date", today).not("status", "in", "(complete,cancelled)");
  }
  if (filters.buildPackageId) {
    const { data: projectRows, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("build_package_id", filters.buildPackageId);
    if (projectError) throw projectError;
    const projectIds = (projectRows ?? []).map((p) => p.id as string);
    if (projectIds.length === 0) return [];
    query = query.in("project_id", projectIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data as Task[]) ?? [];
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.org_id).filter((v): v is string => Boolean(v)))];
  const projectIds = [...new Set(rows.map((r) => r.project_id).filter((v): v is string => Boolean(v)))];
  const assigneeIds = [...new Set(rows.map((r) => r.assignee).filter((v): v is string => Boolean(v)))];

  const [orgsResult, projectsResult, assigneeNameMap] = await Promise.all([
    orgIds.length > 0 ? supabase.from("organizations").select("id, name").in("id", orgIds) : Promise.resolve({ data: [], error: null }),
    projectIds.length > 0 ? supabase.from("projects").select("id, name").in("id", projectIds) : Promise.resolve({ data: [], error: null }),
    getProfileNameMap(supabase, assigneeIds),
  ]);
  if (orgsResult.error) throw orgsResult.error;
  if (projectsResult.error) throw projectsResult.error;

  const orgNameMap = new Map((orgsResult.data ?? []).map((o) => [o.id as string, o.name as string]));
  const projectNameMap = new Map((projectsResult.data ?? []).map((p) => [p.id as string, p.name as string]));

  return rows.map((r) => ({
    ...r,
    orgName: r.org_id ? (orgNameMap.get(r.org_id) ?? null) : null,
    projectName: r.project_id ? (projectNameMap.get(r.project_id) ?? null) : null,
    assigneeName: r.assignee ? (assigneeNameMap.get(r.assignee) ?? null) : null,
  }));
}

export async function getTaskById(supabase: SupabaseClient, id: string): Promise<Task | null> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Task) ?? null;
}

export type TaskInput = {
  title: string;
  description: string | null;
  projectId: string | null;
  orgId: string | null;
  assignee: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  notes: string | null;
};

export async function createTask(admin: SupabaseClient, input: TaskInput): Promise<string> {
  const { data, error } = await admin
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description,
      project_id: input.projectId,
      org_id: input.orgId,
      assignee: input.assignee,
      priority: input.priority,
      status: input.status,
      due_date: input.dueDate,
      notes: input.notes,
      completed_at: input.status === "complete" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/** Also syncs the linked scope item's status when this task came from a generated build package (Stage 10 requirement 6) — a direct write, never calling back into updateScopeItemStatus(), so the two functions can't loop. */
export async function updateTask(admin: SupabaseClient, id: string, input: TaskInput): Promise<void> {
  const { data: current, error: currentError } = await admin.from("tasks").select("completed_at, scope_item_id").eq("id", id).maybeSingle();
  if (currentError) throw currentError;

  const completedAt = input.status === "complete" ? (current?.completed_at ?? new Date().toISOString()) : null;

  const { error } = await admin
    .from("tasks")
    .update({
      title: input.title,
      description: input.description,
      project_id: input.projectId,
      org_id: input.orgId,
      assignee: input.assignee,
      priority: input.priority,
      status: input.status,
      due_date: input.dueDate,
      notes: input.notes,
      completed_at: completedAt,
    })
    .eq("id", id);
  if (error) throw error;

  const scopeItemId = current?.scope_item_id as string | null | undefined;
  if (scopeItemId) {
    const mapped = taskStatusToScopeItemStatus(input.status as Parameters<typeof taskStatusToScopeItemStatus>[0]);
    if (mapped) {
      const { error: scopeItemError } = await admin.from("build_package_scope_items").update({ status: mapped }).eq("id", scopeItemId);
      if (scopeItemError) throw scopeItemError;
    }
  }
}

export type TaskDeletePreview = { hasLinkedScopeItem: boolean };

export async function getTaskDeletePreview(supabase: SupabaseClient, id: string): Promise<TaskDeletePreview> {
  const { data, error } = await supabase.from("tasks").select("scope_item_id").eq("id", id).maybeSingle();
  if (error) throw error;
  return { hasLinkedScopeItem: Boolean(data?.scope_item_id) };
}

export async function deleteTask(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
