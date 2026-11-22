import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { listStripeSubscriptions, getRecentSyncRuns, isCountedForMrr, isUnmatchedClientSubscription, type StripeSubscriptionRow } from "@/modules/stripe/data";
import { StripeSyncButton } from "@/modules/stripe/StripeSyncButton";
import { AttachOrgControl } from "@/modules/stripe/AttachOrgControl";
import { formatSyncTime, formatUtcDate } from "@/modules/stripe/format";
import { isStripeConfigured } from "@/modules/stripe/client";
import { formatCurrency } from "@/shared/format";

const MATCH_LABEL = { email: "Matched by email", name: "Matched by company name", manual: "Attached by hand" } as const;

function statusTone(status: string): "green" | "yellow" | "red" | "neutral" {
  if (status === "active") return "green";
  if (status === "trialing") return "yellow";
  if (status === "past_due" || status === "unpaid") return "red";
  return "neutral";
}

export default async function StripeSubscriptionsPage() {
  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : null;
  const staff = profileResult?.status === "ok" && isVerusStaff(profileResult.profile.role);
  if (!staff) {
    return (
      <PageShell title="Stripe Subscriptions" subtitle="Synced from the connected Stripe account.">
        <EmptyState title="Staff only" description="Stripe billing data is only visible to VERUS staff." />
      </PageShell>
    );
  }

  const supabase = await createServerSupabase();
  let rows: StripeSubscriptionRow[] = [];
  let runs: Awaited<ReturnType<typeof getRecentSyncRuns>> = [];
  let orgs: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    [rows, runs, orgs] = await Promise.all([listStripeSubscriptions(supabase), getRecentSyncRuns(supabase, 8), listOrgOptions(supabase)]);
  } catch {
    loadError = true;
  }

  const unmatched = rows.filter(isUnmatchedClientSubscription);
  const linked = rows.filter((r) => !r.is_product_plan && r.org_id !== null);
  const productPlan = rows.filter((r) => r.is_product_plan);
  const other = rows.filter((r) => !r.is_product_plan && r.org_id === null && !isCountedForMrr(r));

  const base: TableColumn<StripeSubscriptionRow>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <div>
          <div className="text-[var(--cream)]">{r.customer_name ?? "—"}</div>
          <div className="text-[11px] text-[var(--muted)]">{r.customer_email ?? r.stripe_customer_id}</div>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <div>
          <div>{r.product_name}</div>
          <div className="text-[11px] text-[var(--muted)]">
            {r.unit_amount !== null ? `${formatCurrency(r.unit_amount)} × ${r.quantity ?? 1} / ${r.billing_interval}` : null}
            {r.items.length > 1 ? ` · ${r.items.length} items` : null}
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status.replace(/_/g, " ")}</Badge> },
    { key: "mrr", header: "MRR", align: "right", render: (r) => formatCurrency(r.mrr) },
    {
      key: "next",
      header: "Next Invoice",
      align: "right",
      render: (r) => (r.next_invoice_date ? `${formatCurrency(r.next_invoice_amount)} on ${formatUtcDate(r.next_invoice_date)}` : "—"),
    },
    {
      key: "scheduled",
      header: "Scheduled Change",
      align: "right",
      render: (r) => (r.scheduled_change_at ? `${formatCurrency(r.scheduled_mrr)}/mo from ${formatUtcDate(r.scheduled_change_at)}` : "—"),
    },
  ];

  return (
    <PageShell title="Stripe Subscriptions" subtitle="Synced read-only from the connected Stripe account, hourly and on demand. Nothing here writes to Stripe.">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-[12px] text-[var(--muted)]">
          {isStripeConfigured() ? "Stripe connected." : <span className="text-[var(--red)]">Stripe isn&apos;t connected — STRIPE_SECRET_KEY is not set.</span>} Last sync:{" "}
          {runs[0] ? `${formatSyncTime(runs[0].started_at)} (${runs[0].status}${runs[0].error ? `: ${runs[0].error}` : ""})` : "never"}.
        </p>
        <div className="flex items-start gap-2">
          <LinkButton href="/dashboard" variant="secondary">
            Dashboard
          </LinkButton>
          <StripeSyncButton />
        </div>
      </div>

      {loadError ? (
        <EmptyState title="Stripe sync isn't set up yet" description="The database migrations may not have been run yet." />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <p className="section-label">Unmatched Client Subscriptions ({unmatched.length})</p>
            {unmatched.length === 0 ? (
              <p className="text-[12.5px] text-[var(--muted)]">Every active client subscription is linked to an organization.</p>
            ) : (
              <>
                <p className="text-[12px] text-[var(--muted)]">
                  No organization matched by customer email or company name. Attach each to an existing organization by hand — COMPASS never creates one automatically. Not counted in
                  Service or Total MRR until attached.
                </p>
                <Table
                  columns={[
                    ...base,
                    { key: "attach", header: "Attach To", align: "right", render: (r) => <AttachOrgControl stripeSubscriptionRowId={r.id} orgs={orgs} /> },
                  ]}
                  rows={unmatched}
                />
              </>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <p className="section-label">Client Subscriptions · Service MRR ({linked.length})</p>
            {linked.length === 0 ? (
              <p className="text-[12.5px] text-[var(--muted)]">None linked yet.</p>
            ) : (
              <Table
                columns={[
                  {
                    key: "org",
                    header: "Organization",
                    render: (r) => (
                      <div>
                        <Link href={`/organizations/${r.org_id}`} className="text-[var(--gold-light)] hover:underline">
                          {r.organization?.name ?? "—"}
                        </Link>
                        <div className="text-[11px] text-[var(--muted)]">{r.match_method ? MATCH_LABEL[r.match_method] : null}</div>
                      </div>
                    ),
                  },
                  ...base,
                  {
                    key: "reassign",
                    header: "Change Organization",
                    align: "right",
                    render: (r) => <AttachOrgControl stripeSubscriptionRowId={r.id} orgs={orgs} currentOrgId={r.org_id} label="Move" />,
                  },
                ]}
                rows={linked}
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <p className="section-label">Verus Trading Bot Subscribers · Software MRR ({productPlan.length})</p>
            <p className="text-[12px] text-[var(--muted)]">Product-plan subscribers are individuals, not client organizations — never matched and never flagged.</p>
            {productPlan.length === 0 ? <p className="text-[12.5px] text-[var(--muted)]">None synced yet.</p> : <Table columns={base} rows={productPlan} />}
          </section>

          {other.length > 0 ? (
            <section className="flex flex-col gap-3">
              <p className="section-label">Ended or Not Active ({other.length})</p>
              <Table columns={base} rows={other} />
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <p className="section-label">Recent Syncs</p>
            {runs.length === 0 ? (
              <p className="text-[12.5px] text-[var(--muted)]">No sync has run yet.</p>
            ) : (
              <Table
                columns={[
                  { key: "started", header: "Started", render: (r) => formatSyncTime(r.started_at) },
                  { key: "trigger", header: "Trigger", render: (r) => (r.trigger === "manual" ? "Button" : "Hourly") },
                  { key: "status", header: "Result", render: (r) => <Badge tone={r.status === "success" ? "green" : r.status === "error" ? "red" : "yellow"}>{r.status}</Badge> },
                  { key: "synced", header: "Subscriptions", align: "right", render: (r) => r.subscriptions_synced ?? "—" },
                  { key: "matched", header: "Newly Matched", align: "right", render: (r) => r.newly_matched ?? "—" },
                  { key: "error", header: "Error", render: (r) => r.error ?? "" },
                ]}
                rows={runs}
              />
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}
