export type NavEntry = {
  key: string;
  label: string;
  href: string;
};

/**
 * Every sidebar entry lives HERE and nowhere else. Stage 1: every route is
 * an honest empty shell except Settings (brand logo upload). Do not add an
 * entry for a route that doesn't exist yet.
 */
export const NAV_REGISTRY: NavEntry[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "crm-pipeline", label: "CRM Pipeline", href: "/crm-pipeline" },
  { key: "organizations", label: "Organizations", href: "/organizations" },
  { key: "business-assessments", label: "Business Assessments", href: "/business-assessments" },
  { key: "build-packages", label: "Build Packages", href: "/build-packages" },
  { key: "projects", label: "Projects", href: "/projects" },
  { key: "tasks", label: "Tasks", href: "/tasks" },
  { key: "meetings", label: "Meetings", href: "/meetings" },
  { key: "support-tickets", label: "Support Tickets", href: "/support-tickets" },
  { key: "kpis", label: "KPIs", href: "/kpis" },
  { key: "sop-library", label: "SOP Library", href: "/sop-library" },
  { key: "subscriptions", label: "Subscriptions", href: "/subscriptions" },
  { key: "website-funnel-builds", label: "Website & Funnel Builds", href: "/website-funnel-builds" },
  { key: "client-health", label: "Client Health", href: "/client-health" },
  { key: "documents", label: "Documents", href: "/documents" },
  { key: "settings", label: "Settings", href: "/settings" },
];
