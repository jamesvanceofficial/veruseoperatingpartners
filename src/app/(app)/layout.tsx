import { redirect } from "next/navigation";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { AppShell } from "@/shared/ui/AppShell";
import { BrandMark } from "@/shared/ui/BrandMark";
import { NAV_REGISTRY } from "@/shared/nav";

const ROLE_LABELS: Record<string, string> = {
  verus_admin: "Verus Admin",
  verus_staff: "Verus Staff",
  client_owner: "Client Owner",
  client_user: "Client User",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profileResult = await getMyProfile(user.id);

  // The database migrations haven't been run yet in the Supabase SQL
  // Editor — render the shell anyway rather than crash, with a small
  // non-blocking banner explaining why nothing is personalized yet.
  const notConfigured = profileResult.status === "not_configured" || profileResult.status === "not_found";
  const profile = profileResult.status === "ok" ? profileResult.profile : null;

  return (
    <AppShell
      navEntries={NAV_REGISTRY}
      brand={<BrandMark size="sm" />}
      userName={profile?.full_name ?? user.email ?? "Signed in"}
      userEmail={profile?.email ?? user.email ?? ""}
      roleLabel={profile ? (ROLE_LABELS[profile.role] ?? profile.role) : "Unassigned"}
      banner={
        notConfigured ? (
          <div className="border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--yellow)_10%,transparent)] px-6 py-2 text-[11.5px] text-[var(--yellow)]">
            Database not set up yet — run the migrations in supabase/migrations under the Supabase SQL Editor to
            unlock roles and org scoping.
          </div>
        ) : undefined
      }
    >
      {children}
    </AppShell>
  );
}
