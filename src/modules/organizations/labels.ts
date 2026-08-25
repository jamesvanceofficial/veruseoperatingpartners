export const ORG_TYPES = [
  "prospect",
  "active_client",
  "former_client",
  "referral_partner",
  "vendor",
  "strategic_opportunity",
] as const;
export type OrganizationType = (typeof ORG_TYPES)[number];

export const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  prospect: "Prospect",
  active_client: "Active Client",
  former_client: "Former Client",
  referral_partner: "Referral Partner",
  vendor: "Vendor",
  strategic_opportunity: "Strategic Opportunity",
};

export const ORG_STATUSES = ["active", "inactive"] as const;
export type OrganizationStatus = (typeof ORG_STATUSES)[number];

export const ORG_STATUS_LABELS: Record<OrganizationStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const CONTACT_ROLES = ["owner", "executive", "manager", "vendor_contact", "referral_partner"] as const;
export type ContactRole = (typeof CONTACT_ROLES)[number];

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  owner: "Owner",
  executive: "Executive",
  manager: "Manager",
  vendor_contact: "Vendor Contact",
  referral_partner: "Referral Partner",
};

export const HEALTH_STATUSES = ["green", "yellow", "red"] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
};
