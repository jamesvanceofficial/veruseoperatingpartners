import type { SupabaseClient } from "@supabase/supabase-js";
import { numberOrNull, emptyToNull } from "@/shared/format";
import {
  PHYSICAL_LOCATION_OPTIONS,
  SOCIAL_CHANNELS,
  REVIEWS_STATUS_OPTIONS,
  EMAIL_DOMAIN_STATUS_OPTIONS,
  STAFFING_FEELING_OPTIONS,
  TIME_TO_FILL_OPTIONS,
  PORTAL_NEED_OPTIONS,
  AUTOMATION_TASKS,
} from "./labels";
import type { FinancialProfile, BusinessPresence, Workforce, OperationalNeeds } from "./types";
import type { PhysicalLocation, SocialChannel, ReviewsStatus, EmailDomainStatus, StaffingFeeling, TimeToFill, PortalNeed, AutomationTask } from "./labels";

// ===========================================================
// Financial profile, business presence, workforce — Stage 12. One row per
// assessment (upsert on assessment_id), every field optional. Full
// Assessment only — callers are responsible for never invoking these for
// a quick_scan.
// ===========================================================

type FinancialProfileRow = {
  last_full_year_revenue: number | null;
  current_year_revenue: number | null;
  gross_profit_margin_pct: number | null;
  net_profit_margin_pct: number | null;
  net_profit_last_year: number | null;
  monthly_overhead: number | null;
  payroll_pct_of_revenue: number | null;
  cash_on_hand: number | null;
  accounts_receivable_outstanding: number | null;
  largest_customer_pct_of_revenue: number | null;
  owners_compensation: number | null;
};

function toFinancialProfile(row: FinancialProfileRow): FinancialProfile {
  return {
    lastFullYearRevenue: row.last_full_year_revenue,
    currentYearRevenue: row.current_year_revenue,
    grossProfitMarginPct: row.gross_profit_margin_pct,
    netProfitMarginPct: row.net_profit_margin_pct,
    netProfitLastYear: row.net_profit_last_year,
    monthlyOverhead: row.monthly_overhead,
    payrollPctOfRevenue: row.payroll_pct_of_revenue,
    cashOnHand: row.cash_on_hand,
    accountsReceivableOutstanding: row.accounts_receivable_outstanding,
    largestCustomerPctOfRevenue: row.largest_customer_pct_of_revenue,
    ownersCompensation: row.owners_compensation,
  };
}

export async function getFinancialProfile(supabase: SupabaseClient, assessmentId: string): Promise<FinancialProfile | null> {
  const { data, error } = await supabase
    .from("assessment_financial_profiles")
    .select(
      "last_full_year_revenue, current_year_revenue, gross_profit_margin_pct, net_profit_margin_pct, net_profit_last_year, monthly_overhead, payroll_pct_of_revenue, cash_on_hand, accounts_receivable_outstanding, largest_customer_pct_of_revenue, owners_compensation"
    )
    .eq("assessment_id", assessmentId)
    .maybeSingle();
  if (error) throw error;
  return data ? toFinancialProfile(data as FinancialProfileRow) : null;
}

export async function saveFinancialProfile(admin: SupabaseClient, assessmentId: string, input: FinancialProfileRow): Promise<void> {
  const { error } = await admin.from("assessment_financial_profiles").upsert(
    { assessment_id: assessmentId, ...input, updated_at: new Date().toISOString() },
    { onConflict: "assessment_id" }
  );
  if (error) throw error;
}

type BusinessPresenceRow = {
  physical_location: PhysicalLocation | null;
  physical_address: string | null;
  has_website: boolean | null;
  website_url: string | null;
  social_channels: SocialChannel[];
  reviews_status: ReviewsStatus | null;
  email_domain_status: EmailDomainStatus | null;
};

function toBusinessPresence(row: BusinessPresenceRow): BusinessPresence {
  return {
    physicalLocation: row.physical_location,
    physicalAddress: row.physical_address,
    hasWebsite: row.has_website,
    websiteUrl: row.website_url,
    socialChannels: row.social_channels ?? [],
    reviewsStatus: row.reviews_status,
    emailDomainStatus: row.email_domain_status,
  };
}

export async function getBusinessPresence(supabase: SupabaseClient, assessmentId: string): Promise<BusinessPresence | null> {
  const { data, error } = await supabase
    .from("assessment_business_presence")
    .select("physical_location, physical_address, has_website, website_url, social_channels, reviews_status, email_domain_status")
    .eq("assessment_id", assessmentId)
    .maybeSingle();
  if (error) throw error;
  return data ? toBusinessPresence(data as BusinessPresenceRow) : null;
}

export async function saveBusinessPresence(admin: SupabaseClient, assessmentId: string, input: BusinessPresenceRow): Promise<void> {
  const { error } = await admin.from("assessment_business_presence").upsert(
    { assessment_id: assessmentId, ...input, updated_at: new Date().toISOString() },
    { onConflict: "assessment_id" }
  );
  if (error) throw error;
}

type WorkforceRow = {
  w2_employee_count: number | null;
  contractor_count: number | null;
  va_count: number | null;
  management_count: number | null;
  staffing_feeling: StaffingFeeling | null;
  actively_hiring: boolean | null;
  hiring_roles: string | null;
  time_to_fill: TimeToFill | null;
  turnover_pct: number | null;
};

function toWorkforce(row: WorkforceRow): Workforce {
  return {
    w2EmployeeCount: row.w2_employee_count,
    contractorCount: row.contractor_count,
    vaCount: row.va_count,
    managementCount: row.management_count,
    staffingFeeling: row.staffing_feeling,
    activelyHiring: row.actively_hiring,
    hiringRoles: row.hiring_roles,
    timeToFill: row.time_to_fill,
    turnoverPct: row.turnover_pct,
  };
}

export async function getWorkforce(supabase: SupabaseClient, assessmentId: string): Promise<Workforce | null> {
  const { data, error } = await supabase
    .from("assessment_workforce")
    .select("w2_employee_count, contractor_count, va_count, management_count, staffing_feeling, actively_hiring, hiring_roles, time_to_fill, turnover_pct")
    .eq("assessment_id", assessmentId)
    .maybeSingle();
  if (error) throw error;
  return data ? toWorkforce(data as WorkforceRow) : null;
}

export async function saveWorkforce(admin: SupabaseClient, assessmentId: string, input: WorkforceRow): Promise<void> {
  const { error } = await admin.from("assessment_workforce").upsert(
    { assessment_id: assessmentId, ...input, updated_at: new Date().toISOString() },
    { onConflict: "assessment_id" }
  );
  if (error) throw error;
}

/** Real headcount — W2 + 1099 contractors + VAs, from the workforce section. Used instead of organizations.employee_count_estimate wherever it's available. */
export function realHeadcountFrom(workforce: Workforce | null): number | null {
  if (!workforce) return null;
  const { w2EmployeeCount, contractorCount, vaCount } = workforce;
  if (w2EmployeeCount === null && contractorCount === null && vaCount === null) return null;
  return (w2EmployeeCount ?? 0) + (contractorCount ?? 0) + (vaCount ?? 0);
}

/** (current or last full year revenue) / real headcount — null unless both a revenue figure and a nonzero headcount exist. */
export function revenuePerEmployeeFrom(financial: FinancialProfile | null, headcount: number | null): number | null {
  const revenue = financial?.currentYearRevenue ?? financial?.lastFullYearRevenue ?? null;
  if (revenue === null || headcount === null || headcount <= 0) return null;
  return revenue / headcount;
}

type OperationalNeedsRow = {
  portal_need: PortalNeed | null;
  portal_details: string | null;
  automation_tasks: AutomationTask[];
  automation_tasks_other: string | null;
};

function toOperationalNeeds(row: OperationalNeedsRow): OperationalNeeds {
  return {
    portalNeed: row.portal_need,
    portalDetails: row.portal_details,
    automationTasks: row.automation_tasks ?? [],
    automationTasksOther: row.automation_tasks_other,
  };
}

export async function getOperationalNeeds(supabase: SupabaseClient, assessmentId: string): Promise<OperationalNeeds | null> {
  const { data, error } = await supabase
    .from("assessment_operational_needs")
    .select("portal_need, portal_details, automation_tasks, automation_tasks_other")
    .eq("assessment_id", assessmentId)
    .maybeSingle();
  if (error) throw error;
  return data ? toOperationalNeeds(data as OperationalNeedsRow) : null;
}

export async function saveOperationalNeeds(admin: SupabaseClient, assessmentId: string, input: OperationalNeedsRow): Promise<void> {
  const { error } = await admin.from("assessment_operational_needs").upsert(
    { assessment_id: assessmentId, ...input, updated_at: new Date().toISOString() },
    { onConflict: "assessment_id" }
  );
  if (error) throw error;
}

// ===========================================================
// Request body parsing — shared by the staff and public profile routes so
// validation can't drift between the two.
// ===========================================================

export function parseFinancialProfileBody(body: unknown): FinancialProfileRow {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    last_full_year_revenue: numberOrNull(b.lastFullYearRevenue),
    current_year_revenue: numberOrNull(b.currentYearRevenue),
    gross_profit_margin_pct: numberOrNull(b.grossProfitMarginPct),
    net_profit_margin_pct: numberOrNull(b.netProfitMarginPct),
    net_profit_last_year: numberOrNull(b.netProfitLastYear),
    monthly_overhead: numberOrNull(b.monthlyOverhead),
    payroll_pct_of_revenue: numberOrNull(b.payrollPctOfRevenue),
    cash_on_hand: numberOrNull(b.cashOnHand),
    accounts_receivable_outstanding: numberOrNull(b.accountsReceivableOutstanding),
    largest_customer_pct_of_revenue: numberOrNull(b.largestCustomerPctOfRevenue),
    owners_compensation: numberOrNull(b.ownersCompensation),
  };
}

function boolOrNull(value: unknown): boolean | null {
  if (value === true || value === false) return value;
  return null;
}

export function parseBusinessPresenceBody(body: unknown): BusinessPresenceRow {
  const b = (body ?? {}) as Record<string, unknown>;
  const physicalLocation = PHYSICAL_LOCATION_OPTIONS.includes(b.physicalLocation as PhysicalLocation) ? (b.physicalLocation as PhysicalLocation) : null;
  const reviewsStatus = REVIEWS_STATUS_OPTIONS.includes(b.reviewsStatus as ReviewsStatus) ? (b.reviewsStatus as ReviewsStatus) : null;
  const emailDomainStatus = EMAIL_DOMAIN_STATUS_OPTIONS.includes(b.emailDomainStatus as EmailDomainStatus)
    ? (b.emailDomainStatus as EmailDomainStatus)
    : null;
  const rawChannels = Array.isArray(b.socialChannels) ? (b.socialChannels as unknown[]) : [];
  const socialChannels = rawChannels.filter((c): c is SocialChannel => SOCIAL_CHANNELS.includes(c as SocialChannel));
  return {
    physical_location: physicalLocation,
    physical_address: emptyToNull(b.physicalAddress),
    has_website: boolOrNull(b.hasWebsite),
    website_url: emptyToNull(b.websiteUrl),
    social_channels: socialChannels,
    reviews_status: reviewsStatus,
    email_domain_status: emailDomainStatus,
  };
}

export function parseWorkforceBody(body: unknown): WorkforceRow {
  const b = (body ?? {}) as Record<string, unknown>;
  const staffingFeeling = STAFFING_FEELING_OPTIONS.includes(b.staffingFeeling as StaffingFeeling) ? (b.staffingFeeling as StaffingFeeling) : null;
  const timeToFill = TIME_TO_FILL_OPTIONS.includes(b.timeToFill as TimeToFill) ? (b.timeToFill as TimeToFill) : null;
  return {
    w2_employee_count: numberOrNull(b.w2EmployeeCount),
    contractor_count: numberOrNull(b.contractorCount),
    va_count: numberOrNull(b.vaCount),
    management_count: numberOrNull(b.managementCount),
    staffing_feeling: staffingFeeling,
    actively_hiring: boolOrNull(b.activelyHiring),
    hiring_roles: emptyToNull(b.hiringRoles),
    time_to_fill: timeToFill,
    turnover_pct: numberOrNull(b.turnoverPct),
  };
}

export function parseOperationalNeedsBody(body: unknown): OperationalNeedsRow {
  const b = (body ?? {}) as Record<string, unknown>;
  const portalNeed = PORTAL_NEED_OPTIONS.includes(b.portalNeed as PortalNeed) ? (b.portalNeed as PortalNeed) : null;
  const rawTasks = Array.isArray(b.automationTasks) ? (b.automationTasks as unknown[]) : [];
  const automationTasks = rawTasks.filter((t): t is AutomationTask => AUTOMATION_TASKS.includes(t as AutomationTask));
  return {
    portal_need: portalNeed,
    portal_details: emptyToNull(b.portalDetails),
    automation_tasks: automationTasks,
    automation_tasks_other: emptyToNull(b.automationTasksOther),
  };
}
