import type { BuildTier } from "@/modules/assessments/buildTiers";
import type { BuildPackageStatus, ScopeItemStatus, ScopeCategory, PaymentStatus } from "./labels";

export type BuildPackage = {
  id: string;
  org_id: string;
  opportunity_id: string | null;
  assessment_id: string | null;
  tier: BuildTier;
  status: BuildPackageStatus;
  price: number | null;
  deposit_amount: number | null;
  deposit_paid_at: string | null;
  balance_amount: number | null;
  balance_paid_at: string | null;
  start_date: string | null;
  target_completion_date: string | null;
  /** What the 90-day subscription billing counts from — see computeFirstBillingDate() in assessments/buildTiers.ts. */
  handover_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BuildPackageScopeItem = {
  id: string;
  phase_id: string;
  scope_category: ScopeCategory;
  description: string;
  status: ScopeItemStatus;
  sort_order: number;
};

export type BuildPackagePhase = {
  id: string;
  build_package_id: string;
  phase_number: number;
  name: string;
  week_start: number;
  week_end: number;
  kind: string;
  category_name: string | null;
  category_score: number | null;
};

export type BuildPackagePhaseDetail = BuildPackagePhase & {
  scopeItems: BuildPackageScopeItem[];
  /** completed / total, 0 when the phase has no items. */
  progressPct: number;
};

export type BuildPackageListRow = {
  id: string;
  org_id: string;
  assessment_id: string | null;
  orgName: string;
  tier: BuildTier;
  status: BuildPackageStatus;
  price: number | null;
  paymentStatus: PaymentStatus;
  start_date: string | null;
  target_completion_date: string | null;
  handover_date: string | null;
  created_at: string;
};

export type BuildPackageDetail = {
  buildPackage: BuildPackage;
  orgName: string;
  paymentStatus: PaymentStatus;
  assessmentType: "quick_scan" | "full" | null;
  assessmentCompletedAt: string | null;
  phases: BuildPackagePhaseDetail[];
  /** completed / total across every phase's items, 0 when there are none. */
  overallProgressPct: number;
};
