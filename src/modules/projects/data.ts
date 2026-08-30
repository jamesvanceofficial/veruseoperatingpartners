import type { SupabaseClient } from "@supabase/supabase-js";
import { getBuildPackageDetail } from "@/modules/buildPackages/data";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import { scopeItemStatusToTaskStatus } from "@/modules/tasks/scopeItemSync";
import type { Task } from "@/modules/tasks/types";
import type { Project, ProjectDetail, ProjectListRow } from "./types";

async function getProfileNameMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const p of data ?? []) map.set(p.id, p.full_name ?? p.email ?? "Unnamed");
  return map;
}

function computeCompletionPct(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0;
  const complete = tasks.filter((t) => t.status === "complete").length;
  return Math.round((complete / tasks.length) * 100);
}

// ===========================================================
// List
// ===========================================================

/** Powers the task form's org-dependent project dropdown. */
export async function listProjectOptions(supabase: SupabaseClient, orgId: string): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase.from("projects").select("id, name").eq("org_id", orgId).order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { id: string; name: string }[];
}

export type ProjectFilters = { orgId?: string; status?: string };

export async function listProjects(supabase: SupabaseClient, filters: ProjectFilters = {}): Promise<ProjectListRow[]> {
  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (filters.orgId) query = query.eq("org_id", filters.orgId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data as Project[]) ?? [];
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.org_id))];
  const ownerIds = [...new Set(rows.map((r) => r.owner).filter((v): v is string => Boolean(v)))];
  const projectIds = rows.map((r) => r.id);

  const [orgsResult, ownerNameMap, tasksResult] = await Promise.all([
    supabase.from("organizations").select("id, name").in("id", orgIds),
    getProfileNameMap(supabase, ownerIds),
    supabase.from("tasks").select("project_id, status").in("project_id", projectIds),
  ]);
  if (orgsResult.error) throw orgsResult.error;
  if (tasksResult.error) throw tasksResult.error;

  const orgNameMap = new Map((orgsResult.data ?? []).map((o) => [o.id as string, o.name as string]));
  const tasksByProject = new Map<string, { status: string }[]>();
  for (const t of tasksResult.data ?? []) {
    const list = tasksByProject.get(t.project_id as string) ?? [];
    list.push({ status: t.status as string });
    tasksByProject.set(t.project_id as string, list);
  }

  return rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    orgName: orgNameMap.get(r.org_id) ?? "Unknown organization",
    name: r.name,
    status: r.status,
    priority: r.priority,
    ownerName: r.owner ? (ownerNameMap.get(r.owner) ?? null) : null,
    due_date: r.due_date,
    completionPct: computeCompletionPct(tasksByProject.get(r.id) ?? []),
  }));
}

// ===========================================================
// Detail
// ===========================================================

export async function getProjectDetail(supabase: SupabaseClient, id: string): Promise<ProjectDetail | null> {
  const { data: projectRow, error: projectError } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (projectError) throw projectError;
  if (!projectRow) return null;
  const project = projectRow as Project;

  const [orgResult, ownerNameMap, categoryResult, buildPackageResult, phaseResult, tasksResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", project.org_id).maybeSingle(),
    getProfileNameMap(supabase, project.owner ? [project.owner] : []),
    project.category_id ? supabase.from("assessment_categories").select("name").eq("id", project.category_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    project.build_package_id ? supabase.from("build_packages").select("tier").eq("id", project.build_package_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    project.build_package_phase_id
      ? supabase.from("build_package_phases").select("name").eq("id", project.build_package_phase_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("tasks").select("*").eq("project_id", id).order("due_date", { ascending: true, nullsFirst: false }),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (categoryResult.error) throw categoryResult.error;
  if (buildPackageResult.error) throw buildPackageResult.error;
  if (phaseResult.error) throw phaseResult.error;
  if (tasksResult.error) throw tasksResult.error;

  const tasks = (tasksResult.data as Task[]) ?? [];
  const tier = (buildPackageResult.data as { tier: keyof typeof BUILD_TIER_INFO } | null)?.tier ?? null;

  return {
    project,
    orgName: (orgResult.data as { name: string } | null)?.name ?? "Unknown organization",
    ownerName: project.owner ? (ownerNameMap.get(project.owner) ?? null) : null,
    categoryName: (categoryResult.data as { name: string } | null)?.name ?? null,
    buildPackageTierLabel: tier ? BUILD_TIER_INFO[tier].label : null,
    phaseName: (phaseResult.data as { name: string } | null)?.name ?? null,
    tasks,
    completionPct: computeCompletionPct(tasks),
  };
}

// ===========================================================
// Create / update / delete
// ===========================================================

export type ProjectInput = {
  name: string;
  description: string | null;
  orgId: string;
  buildPackageId: string | null;
  buildPackagePhaseId: string | null;
  categoryId: string | null;
  owner: string | null;
  priority: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
};

export async function createProject(admin: SupabaseClient, input: ProjectInput): Promise<string> {
  const { data, error } = await admin
    .from("projects")
    .insert({
      name: input.name,
      description: input.description,
      org_id: input.orgId,
      build_package_id: input.buildPackageId,
      build_package_phase_id: input.buildPackagePhaseId,
      category_id: input.categoryId,
      owner: input.owner,
      priority: input.priority,
      status: input.status,
      start_date: input.startDate,
      due_date: input.dueDate,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateProject(admin: SupabaseClient, id: string, input: ProjectInput): Promise<void> {
  const { error } = await admin
    .from("projects")
    .update({
      name: input.name,
      description: input.description,
      org_id: input.orgId,
      build_package_id: input.buildPackageId,
      build_package_phase_id: input.buildPackagePhaseId,
      category_id: input.categoryId,
      owner: input.owner,
      priority: input.priority,
      status: input.status,
      start_date: input.startDate,
      due_date: input.dueDate,
    })
    .eq("id", id);
  if (error) throw error;
}

export type ProjectDeletePreview = { taskCount: number };

export async function getProjectDeletePreview(supabase: SupabaseClient, id: string): Promise<ProjectDeletePreview> {
  const { count, error } = await supabase.from("tasks").select("*", { count: "exact", head: true }).eq("project_id", id);
  if (error) throw error;
  return { taskCount: count ?? 0 };
}

export async function deleteProject(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ===========================================================
// Generate from a build package — the one action that turns each phase
// into a project and each of its scope items into a task, per Stage 10
// requirement 4. Blocked if this build package already has projects, so
// re-clicking never piles up duplicates.
// ===========================================================

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Converts a phase's relative week range (1-based) into real calendar dates, anchored to the build package's own start_date. Null if the package has no start_date yet — there's nothing to anchor to, so the generated project/task simply gets no dates, same as any other field that "carries across as dates where they exist." */
function phaseDatesFrom(packageStartDate: string | null, weekStart: number, weekEnd: number): { startDate: string | null; dueDate: string | null } {
  if (!packageStartDate) return { startDate: null, dueDate: null };
  return {
    startDate: addDays(packageStartDate, (weekStart - 1) * 7),
    dueDate: addDays(packageStartDate, weekEnd * 7 - 1),
  };
}

export async function getProjectCountForBuildPackage(supabase: SupabaseClient, buildPackageId: string): Promise<number> {
  const { count, error } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("build_package_id", buildPackageId);
  if (error) throw error;
  return count ?? 0;
}

/** Powers the build package detail page's "Projects" section once generated. */
export async function listProjectsForBuildPackage(
  supabase: SupabaseClient,
  buildPackageId: string
): Promise<{ id: string; name: string; status: string }[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("build_package_id", buildPackageId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { id: string; name: string; status: string }[];
}

export async function generateProjectsFromBuildPackage(
  admin: SupabaseClient,
  buildPackageId: string
): Promise<{ ok: true; projectIds: string[] } | { ok: false; error: string }> {
  const existingCount = await getProjectCountForBuildPackage(admin, buildPackageId);
  if (existingCount > 0) {
    return { ok: false, error: "Projects have already been generated for this build package." };
  }

  const detail = await getBuildPackageDetail(admin, buildPackageId);
  if (!detail) return { ok: false, error: "Build package not found." };
  if (detail.phases.length === 0) return { ok: false, error: "This build package has no phases to generate projects from." };

  const { data: categories, error: categoriesError } = await admin.from("assessment_categories").select("id, name");
  if (categoriesError) return { ok: false, error: categoriesError.message };
  const categoryIdByName = new Map((categories ?? []).map((c) => [c.name as string, c.id as string]));

  const projectIds: string[] = [];

  for (const phase of detail.phases) {
    const { startDate, dueDate } = phaseDatesFrom(detail.buildPackage.start_date, phase.week_start, phase.week_end);
    const categoryId = phase.category_name ? (categoryIdByName.get(phase.category_name) ?? null) : null;

    const { data: projectRow, error: projectError } = await admin
      .from("projects")
      .insert({
        org_id: detail.buildPackage.org_id,
        build_package_id: buildPackageId,
        build_package_phase_id: phase.id,
        category_id: categoryId,
        name: phase.name,
        description: `Generated from ${BUILD_TIER_INFO[detail.buildPackage.tier].label}, Phase ${phase.phase_number}.`,
        status: "not_started",
        priority: "medium",
        start_date: startDate,
        due_date: dueDate,
      })
      .select("id")
      .single();
    if (projectError) return { ok: false, error: projectError.message };
    projectIds.push(projectRow.id as string);

    if (phase.scopeItems.length > 0) {
      const { error: tasksError } = await admin.from("tasks").insert(
        phase.scopeItems.map((item) => ({
          project_id: projectRow.id,
          org_id: detail.buildPackage.org_id,
          title: item.description,
          priority: "medium",
          status: scopeItemStatusToTaskStatus(item.status),
          due_date: dueDate,
          scope_item_id: item.id,
          completed_at: item.status === "complete" ? new Date().toISOString() : null,
        }))
      );
      if (tasksError) return { ok: false, error: tasksError.message };
    }
  }

  return { ok: true, projectIds };
}
