export const ROLES = ["verus_admin", "verus_staff", "client_owner", "client_user"] as const;
export type Role = (typeof ROLES)[number];

export function isVerusStaff(role: Role | null | undefined): boolean {
  return role === "verus_admin" || role === "verus_staff";
}

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  org_id: string | null;
};
