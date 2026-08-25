import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Input, Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrganizations } from "@/modules/organizations/data";
import { ORG_TYPES, ORG_TYPE_LABELS, ORG_STATUSES, ORG_STATUS_LABELS, HEALTH_LABELS } from "@/modules/organizations/labels";
import { formatCurrency } from "@/shared/format";
import type { OrganizationListRow } from "@/modules/organizations/types";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let rows: OrganizationListRow[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    rows = await listOrganizations(supabase, { q: params.q, type: params.type, status: params.status });
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.q || params.type || params.status);

  const columns: TableColumn<OrganizationListRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link href={`/organizations/${row.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {row.name}
        </Link>
      ),
    },
    { key: "type", header: "Type", render: (row) => <Badge tone="gold">{ORG_TYPE_LABELS[row.type]}</Badge> },
    { key: "industry", header: "Industry", render: (row) => row.industry ?? "—" },
    { key: "ownerName", header: "Owner", render: (row) => row.ownerName ?? "—" },
    {
      key: "latestScore",
      header: "Enterprise Score",
      render: (row) => (row.latestScore !== null ? `${row.latestScore} · ${row.latestBand ?? "—"}` : "—"),
    },
    {
      key: "healthStatus",
      header: "Client Health",
      render: (row) => (row.healthStatus ? <Badge tone={row.healthStatus}>{HEALTH_LABELS[row.healthStatus]}</Badge> : "—"),
    },
    { key: "mrr", header: "MRR", align: "right", render: (row) => formatCurrency(row.mrr) },
  ];

  return (
    <PageShell title="Organizations" subtitle="Every company VERUS does business with — prospects, clients, vendors, and partners.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <Input name="q" placeholder="Search by name…" defaultValue={params.q ?? ""} className="w-56" />
          <Select name="type" defaultValue={params.type ?? ""}>
            <option value="">All types</option>
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>
                {ORG_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            {ORG_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORG_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <Link href="/organizations" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              Clear
            </Link>
          ) : null}
        </form>
        {canCreate ? (
          <LinkButton href="/organizations/new" variant="primary">
            New organization
          </LinkButton>
        ) : null}
      </div>

      {loadError ? (
        <EmptyState
          title="Organizations aren't available yet"
          description="The database migrations may not have been run yet — check back once they are."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No organizations match your filters" : "No organizations yet"}
          description={hasFilters ? "Try a different search or clear your filters." : "Add the first company VERUS is working with."}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}
    </PageShell>
  );
}
