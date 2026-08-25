import type { AssessmentType, AssessmentStatus } from "./labels";

export type AnswerOption = { value: number; label: string };

export type Category = { id: string; name: string; weight: number; sort_order: number };
export type Band = { id: string; label: string; min_score: number; max_score: number; sort_order: number };

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
  recommended_build_tier: string | null;
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
};

export type AssessmentReport = {
  assessment: Assessment;
  orgName: string;
  bandLabel: string | null;
  categoryScores: CategoryScoreDetail[];
};
