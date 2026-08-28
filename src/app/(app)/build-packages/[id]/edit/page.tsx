import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getBuildPackageDetail } from "@/modules/buildPackages/data";
import { BuildPackageForm } from "@/modules/buildPackages/BuildPackageForm";

export default async function EditBuildPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);
  if (!canEdit) redirect(`/build-packages/${id}`);

  const supabase = await createServerSupabase();
  const detail = await getBuildPackageDetail(supabase, id);
  if (!detail) notFound();

  return (
    <PageShell title="Edit build package" subtitle={`${detail.orgName} — price, payment, dates, status, and notes.`}>
      <BuildPackageForm orgName={detail.orgName} buildPackage={detail.buildPackage} />
    </PageShell>
  );
}
