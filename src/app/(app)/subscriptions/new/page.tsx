import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listOrgOptions } from "@/modules/organizations/data";
import { SubscriptionForm } from "@/modules/subscriptions/SubscriptionForm";

export default async function NewSubscriptionPage({ searchParams }: { searchParams: Promise<{ org_id?: string }> }) {
  const { org_id } = await searchParams;
  const supabase = await createServerSupabase();
  const orgOptions = await listOrgOptions(supabase);

  return (
    <PageShell title="New Subscription" subtitle="Start a subscription manually — for a build package's own subscription, use the Create Subscription button on its detail page instead.">
      <div className="max-w-2xl">
        <SubscriptionForm orgOptions={orgOptions} defaultOrgId={org_id} />
      </div>
    </PageShell>
  );
}
