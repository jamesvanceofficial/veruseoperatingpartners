import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById } from "@/modules/organizations/data";
import { ORG_TYPE_LABELS, ORG_STATUS_LABELS } from "@/modules/organizations/labels";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/LinkButton";
import { OrganizationTabs } from "@/modules/organizations/OrganizationTabs";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const org = await getOrganizationById(supabase, id);
  if (!org) notFound();

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 px-8 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/organizations" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Organizations
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{org.name}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone="gold">{ORG_TYPE_LABELS[org.type]}</Badge>
            <Badge tone={org.status === "active" ? "green" : "neutral"}>{ORG_STATUS_LABELS[org.status]}</Badge>
          </div>
        </div>
        {canEdit ? <LinkButton href={`/organizations/${id}/edit`}>Edit organization</LinkButton> : null}
      </div>

      <OrganizationTabs orgId={id} />

      {children}
    </div>
  );
}
