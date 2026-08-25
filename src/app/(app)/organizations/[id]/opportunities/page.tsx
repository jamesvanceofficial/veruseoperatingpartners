import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOpportunities } from "@/modules/opportunities/data";
import { OpportunityListTable } from "@/modules/opportunities/OpportunityListTable";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";

export default async function OrganizationOpportunitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const rows = await listOpportunities(supabase, { orgId: id });

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Opportunities</h2>
        {canCreate ? (
          <LinkButton href={`/crm-pipeline/new?org_id=${id}`} variant="primary">
            New opportunity
          </LinkButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No opportunities yet" description="Nothing in the pipeline for this organization yet." />
      ) : (
        <OpportunityListTable rows={rows} showOrgColumn={false} />
      )}
    </div>
  );
}
