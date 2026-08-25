import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listContacts } from "@/modules/organizations/data";
import { ContactsPanel } from "@/modules/organizations/ContactsPanel";

export default async function OrganizationContactsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const contacts = await listContacts(supabase, id);

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return <ContactsPanel orgId={id} contacts={contacts} canEdit={canEdit} />;
}
