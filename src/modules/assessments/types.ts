import type { AssessmentType, AssessmentStatus, PhysicalLocation, SocialChannel, ReviewsStatus, EmailDomainStatus, StaffingFeeling, TimeToFill, PortalNeed, AutomationTask } from "./labels";
import type { BuildTier, SupportTier } from "./buildTiers";

export type AnswerOption = { value: number; label: string };

export type Category = { id: string; name: string; weight: number; sort_order: number };
export type Band = { id: string; label: string; min_score: number; max_score: number; description: string | null; sort_order: number };

export type Question = {
  id: string;
  category_id: string;
  question_text: string;
  help_text: string | null;
  answer_options: AnswerOption[];
  sort_order: number;
  is_quick_scan: boolean;
  version: number;
  active: boolean;
};

export type Assessment = {
  id: string;
  org_id: string;
  opportunity_id: string | null;
  conducted_by: string | null;
  status: AssessmentStatus;
  assessment_type: AssessmentType;
  started_at: string | null;
  completed_at: string | null;
  enterprise_score: number | null;
  band_id: string | null;
  recommended_build_tier: BuildTier | null;
  recommended_build_price: number | null;
  build_recommendation_reasoning: string | null;
  recommended_support_tier: SupportTier | null;
  recommended_support_price: number | null;
  support_recommendation_reasoning: string | null;
  build_tier_override: BuildTier | null;
  build_tier_override_by: string | null;
  build_tier_override_at: string | null;
  support_tier_override: SupportTier | null;
  support_tier_override_by: string | null;
  support_tier_override_at: string | null;
  price_paid: number | null;
  notes: string | null;
  share_token: string | null;
  share_token_expires_at: string | null;
  share_token_revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentListRow = {
  id: string;
  org_id: string;
  orgName: string;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  enterprise_score: number | null;
  bandLabel: string | null;
  created_at: string;
  completed_at: string | null;
};

/** Per-category score, already joined with the category's name/weight — what the runner's live score and the report both render from. */
export type CategoryScoreDetail = {
  categoryId: string;
  categoryName: string;
  rawScore: number;
  weightedScore: number;
  weight: number;
  answeredCount: number;
  bottleneckRank: number;
  /** Answered "not applicable" — excluded from rawScore/weightedScore entirely, never counted as a zero. */
  notApplicableCount: number;
  /** This category's full question bank size for the assessment's type (12 for full, 2 for quick scan) — the denominator behind lowConfidence. */
  totalQuestionCount: number;
  /** notApplicableCount / totalQuestionCount > 1/3 — too much of this category's score is missing to trust it. */
  lowConfidence: boolean;
};

// Stage 12 — captured once per FULL assessment as a point-in-time
// snapshot (never quick_scan), so it can be compared across
// reassessments. Every field optional/nullable.
export type FinancialProfile = {
  lastFullYearRevenue: number | null;
  currentYearRevenue: number | null;
  grossProfitMarginPct: number | null;
  netProfitMarginPct: number | null;
  netProfitLastYear: number | null;
  monthlyOverhead: number | null;
  payrollPctOfRevenue: number | null;
  cashOnHand: number | null;
  accountsReceivableOutstanding: number | null;
  largestCustomerPctOfRevenue: number | null;
  ownersCompensation: number | null;
};

export type BusinessPresence = {
  physicalLocation: PhysicalLocation | null;
  physicalAddress: string | null;
  hasWebsite: boolean | null;
  websiteUrl: string | null;
  socialChannels: SocialChannel[];
  reviewsStatus: ReviewsStatus | null;
  emailDomainStatus: EmailDomainStatus | null;
};

export type Workforce = {
  w2EmployeeCount: number | null;
  contractorCount: number | null;
  vaCount: number | null;
  managementCount: number | null;
  staffingFeeling: StaffingFeeling | null;
  activelyHiring: boolean | null;
  hiringRoles: string | null;
  timeToFill: TimeToFill | null;
  turnoverPct: number | null;
};

// Stage 18 — drives portal and automation scope from actual need, not tier.
export type OperationalNeeds = {
  portalNeed: PortalNeed | null;
  portalDetails: string | null;
  automationTasks: AutomationTask[];
  automationTasksOther: string | null;
};

export type AssessmentReport = {
  assessment: Assessment;
  orgName: string;
  bandLabel: string | null;
  bandDescription: string | null;
  categoryScores: CategoryScoreDetail[];
  /** Total across the WHOLE assessment, including categories excluded entirely because every question in them was marked not applicable. */
  notApplicableCount: number;
  buildTierOverrideByName: string | null;
  supportTierOverrideByName: string | null;
  /** null for quick_scan (never captured) or a full assessment where the section was never saved. */
  financialProfile: FinancialProfile | null;
  businessPresence: BusinessPresence | null;
  workforce: Workforce | null;
  operationalNeeds: OperationalNeeds | null;
  /** (currentYearRevenue ?? lastFullYearRevenue) / realHeadcount — null unless both a revenue figure and a nonzero headcount exist. */
  revenuePerEmployee: number | null;
  /** w2EmployeeCount + contractorCount + vaCount, if workforce was ever saved — the real headcount, not organizations.employee_count_estimate. */
  realHeadcount: number | null;
};
