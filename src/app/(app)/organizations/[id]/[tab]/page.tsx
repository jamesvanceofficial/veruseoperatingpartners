import { notFound } from "next/navigation";
import { EmptyState } from "@/shared/ui/EmptyState";
import { STUB_TAB_LABELS } from "@/modules/organizations/tabs";

export default async function OrganizationStubTabPage({ params }: { params: Promise<{ id: string; tab: string }> }) {
  const { tab } = await params;
  const label = STUB_TAB_LABELS.get(tab);
  if (!label) notFound();

  return <EmptyState title={`${label} coming later`} description={`The ${label} module for this organization hasn't been built yet.`} />;
}
