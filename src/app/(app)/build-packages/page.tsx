import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listOrgOptions } from "@/modules/organizations/data";
import { listBuildPackages } from "@/modules/buildPackages/data";
import { BUILD_PACKAGE_STATUSES, BUILD_PACKAGE_STATUS_LABELS } from "@/modules/buildPackages/labels";
import { BuildPackageListTable } from "@/modules/buildPackages/BuildPackageListTable";
import type { BuildPackageListRow } from "@/modules/buildPackages/types";

export default async function BuildPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; status?: string }>;
}) {
  const params = await searchParams;

  let rows: BuildPackageListRow[] = [];
  let orgOptions: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    [rows, orgOptions] = await Promise.all([
      listBuildPackages(supabase, { orgId: params.org, status: params.status }),
      listOrgOptions(supabase),
    ]);
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.org || params.status);

  return (
    <PageShell title="Build Packages" subtitle="The actual work sold after an assessment is accepted — phases, scope, and payment status for every client.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <Select name="org" defaultValue={params.org ?? ""}>
            <option value="">All organizations</option>
            {orgOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            {BUILD_PACKAGE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BUILD_PACKAGE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <Link href="/build-packages" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {loadError ? (
        <EmptyState
          title="Build packages aren't available yet"
          description="The database migrations may not have been run yet — check back once they are."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No build packages match your filters" : "No build packages yet"}
          description={
            hasFilters
              ? "Try a different filter or clear it."
              : "Create one from a completed Full Assessment's report, or from an organization's Build Packages tab."
          }
        />
      ) : (
        <BuildPackageListTable rows={rows} />
      )}
    </PageShell>
  );
}
