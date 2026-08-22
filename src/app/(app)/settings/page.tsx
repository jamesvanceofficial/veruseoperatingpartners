import { PageShell } from "@/shared/ui/PageShell";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { BrandLogoUpload } from "@/modules/settings/BrandLogoUpload";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : { status: "not_configured" as const };
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let logoUrl: string | null = null;
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("app_settings").select("logo_url").eq("id", 1).maybeSingle();
    logoUrl = data?.logo_url ?? null;
  } catch {
    logoUrl = null;
  }

  return (
    <PageShell title="Settings" subtitle="Brand and system configuration for COMPASS.">
      <BrandLogoUpload initialLogoUrl={logoUrl} canEdit={canEdit} />
    </PageShell>
  );
}
