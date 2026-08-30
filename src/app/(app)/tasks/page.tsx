import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { listTasks } from "@/modules/tasks/data";
import { listBuildPackages } from "@/modules/buildPackages/data";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import { TaskListTable } from "@/modules/tasks/TaskListTable";
import type { TaskListRow } from "@/modules/tasks/types";
import { cn } from "@/shared/ui/cn";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; buildPackage?: string; mine?: string; overdue?: string }>;
}) {
  const params = await searchParams;
  const mine = params.mine === "1";
  const overdue = params.overdue === "1";

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let rows: TaskListRow[] = [];
  let orgOptions: { id: string; name: string }[] = [];
  let buildPackageOptions: { id: string; label: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    const [orgOpts, buildPackages] = await Promise.all([listOrgOptions(supabase), listBuildPackages(supabase)]);
    orgOptions = orgOpts;
    buildPackageOptions = buildPackages.map((b) => ({ id: b.id, label: `${b.orgName} — ${BUILD_TIER_INFO[b.tier].label}` }));
    rows = await listTasks(supabase, {
      orgId: params.org,
      buildPackageId: params.buildPackage,
      assigneeId: mine && user ? user.id : undefined,
      overdue: overdue || undefined,
    });
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.org || params.buildPackage || mine || overdue);
  const quickFilterClass = (active: boolean) =>
    cn("rounded-[var(--radius-sm)] border px-3 py-1.5 text-[12px]", active ? "border-[var(--gold)] text-[var(--gold-light)]" : "border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--cream)]");

  return (
    <PageShell title="Tasks" subtitle="Work assigned across every project and client.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href={mine ? "/tasks" : "/tasks?mine=1"} className={quickFilterClass(mine)}>
              My Tasks
            </Link>
            <Link href={overdue ? "/tasks" : "/tasks?overdue=1"} className={quickFilterClass(overdue)}>
              Overdue
            </Link>
          </div>
          <form method="GET" className="flex flex-wrap items-center gap-3">
            {mine ? <input type="hidden" name="mine" value="1" /> : null}
            {overdue ? <input type="hidden" name="overdue" value="1" /> : null}
            <Select name="org" defaultValue={params.org ?? ""}>
              <option value="">All organizations</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Select name="buildPackage" defaultValue={params.buildPackage ?? ""}>
              <option value="">All build packages</option>
              {buildPackageOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
            {hasFilters ? (
              <Link href="/tasks" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
                Clear
              </Link>
            ) : null}
          </form>
        </div>
        {canCreate ? (
          <LinkButton href="/tasks/new" variant="primary">
            New task
          </LinkButton>
        ) : null}
      </div>

      {loadError ? (
        <EmptyState title="Tasks aren't available yet" description="The database migrations may not have been run yet — check back once they are." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No tasks match your filters" : "No tasks yet"}
          description={hasFilters ? "Try a different filter or clear it." : "Generate projects from a build package, or create a task directly."}
        />
      ) : (
        <TaskListTable rows={rows} />
      )}
    </PageShell>
  );
}
