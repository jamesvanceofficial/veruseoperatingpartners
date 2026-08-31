import { notFound } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSubscriptionDetail } from "@/modules/subscriptions/data";
import { SubscriptionForm } from "@/modules/subscriptions/SubscriptionForm";

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getSubscriptionDetail(supabase, id);
  if (!detail) notFound();

  return (
    <PageShell title={`Edit — ${detail.subscription.plan_name}`} subtitle={detail.orgName}>
      <div className="max-w-2xl">
        <SubscriptionForm subscription={detail.subscription} />
      </div>
    </PageShell>
  );
}
