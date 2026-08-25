import type { OrganizationType, OrganizationStatus, HealthStatus } from "./labels";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  industry: string | null;
  website: string | null;
  phone: string | null;
  primary_address: string | null;
  employee_count_estimate: number | null;
  annual_revenue_estimate: number | null;
  source: string | null;
  referred_by_org_id: string | null;
  assigned_owner: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationListRow = {
  id: string;
  name: string;
  type: OrganizationType;
  industry: string | null;
  ownerName: string | null;
  latestScore: number | null;
  latestBand: string | null;
  healthStatus: HealthStatus | null;
  mrr: number;
};

export type OrganizationOverview = {
  org: Organization;
  ownerName: string | null;
  referredByName: string | null;
  latestAssessment: { score: number | null; band: string | null; completedAt: string | null } | null;
  healthStatus: HealthStatus | null;
  healthPeriod: string | null;
  mrr: number;
  lifetimeRevenue: number;
};

export type Contact = {
  id: string;
  org_id: string;
  full_name: string;
  title: string | null;
  contact_role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffOption = { id: string; full_name: string | null; email: string | null };
export type OrgOption = { id: string; name: string };
