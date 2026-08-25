import type { PipelineStage } from "./labels";

export type Opportunity = {
  id: string;
  org_id: string;
  name: string;
  primary_contact_id: string | null;
  stage: PipelineStage;
  owner: string | null;
  source: string | null;
  expected_value: number | null;
  probability: number | null;
  pain_points: string | null;
  business_goals: string | null;
  next_action: string | null;
  next_action_date: string | null;
  notes: string | null;
  lost_reason: string | null;
  stage_changed_at: string;
  created_at: string;
  updated_at: string;
};

export type OpportunityListRow = {
  id: string;
  name: string;
  org_id: string;
  orgName: string;
  stage: PipelineStage;
  owner: string | null;
  ownerName: string | null;
  expected_value: number | null;
  probability: number | null;
  next_action: string | null;
  next_action_date: string | null;
  primaryContactName: string | null;
};

export type StageHistoryEntry = {
  id: string;
  from_stage: PipelineStage | null;
  to_stage: PipelineStage;
  changed_by: string | null;
  changedByName: string | null;
  changed_at: string;
};

export type OpportunityDetail = {
  opportunity: Opportunity;
  orgName: string;
  ownerName: string | null;
  primaryContactName: string | null;
  stageHistory: StageHistoryEntry[];
};

export type StageValue = { stage: PipelineStage; count: number; value: number };

export type PipelineStats = {
  totalValue: number;
  byStage: StageValue[];
};

export type ContactOption = { id: string; full_name: string };
