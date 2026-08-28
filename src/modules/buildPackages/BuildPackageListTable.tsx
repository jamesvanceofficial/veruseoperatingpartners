import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import { BUILD_PACKAGE_STATUS_LABELS, BUILD_PACKAGE_STATUS_TONE, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "./labels";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import type { BuildPackageListRow } from "./types";

export function BuildPackageListTable({ rows, showOrgColumn = true }: { rows: BuildPackageListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<BuildPackageListRow>[] = [
    {
      key: "tier",
      header: "Build Package",
      render: (row) => (
        <Link href={`/build-packages/${row.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {BUILD_TIER_INFO[row.tier].label}
        </Link>
      ),
    },
    ...(showOrgColumn
      ? [
          {
            key: "orgName",
            header: "Organization",
            render: (row: BuildPackageListRow) => (
              <Link href={`/organizations/${row.org_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">
                {row.orgName}
              </Link>
            ),
          } as TableColumn<BuildPackageListRow>,
        ]
      : []),
    { key: "status", header: "Status", render: (row) => <Badge tone={BUILD_PACKAGE_STATUS_TONE[row.status]}>{BUILD_PACKAGE_STATUS_LABELS[row.status]}</Badge> },
    { key: "price", header: "Price", align: "right", render: (row) => formatCurrency(row.price) },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (row) => <Badge tone={PAYMENT_STATUS_TONE[row.paymentStatus]}>{PAYMENT_STATUS_LABELS[row.paymentStatus]}</Badge>,
    },
    { key: "target_completion_date", header: "Target Completion", render: (row) => formatDate(row.target_completion_date) },
    { key: "handover_date", header: "Handover", render: (row) => formatDate(row.handover_date) },
  ];

  return <Table columns={columns} rows={rows} />;
}
