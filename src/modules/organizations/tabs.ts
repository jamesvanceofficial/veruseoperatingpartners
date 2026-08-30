export type OrgTab = { slug: string; label: string };

/** Order matches the Stage 5 spec exactly. Empty slug = the Overview root. */
export const ORG_TABS: OrgTab[] = [
  { slug: "", label: "Overview" },
  { slug: "contacts", label: "Contacts" },
  { slug: "opportunities", label: "Opportunities" },
  { slug: "assessments", label: "Assessments" },
  { slug: "build-packages", label: "Build Packages" },
  { slug: "projects", label: "Projects" },
  { slug: "tasks", label: "Tasks" },
  { slug: "meetings", label: "Meetings" },
  { slug: "kpis", label: "KPIs" },
  { slug: "sops", label: "SOPs" },
  { slug: "documents", label: "Documents" },
  { slug: "subscription", label: "Subscription" },
  { slug: "vendor-revenue", label: "Vendor Revenue" },
  { slug: "support-tickets", label: "Support Tickets" },
];

/** Tabs with a real page today (routed by their own folder, not the [tab] catch-all). */
const BUILT_TAB_SLUGS = new Set(["", "contacts", "opportunities", "assessments", "build-packages", "projects", "tasks"]);

/** Everything else renders the generic "comes later" stub via [tab]/page.tsx. */
export const STUB_TAB_LABELS: Map<string, string> = new Map(
  ORG_TABS.filter((t) => !BUILT_TAB_SLUGS.has(t.slug)).map((t) => [t.slug, t.label])
);
