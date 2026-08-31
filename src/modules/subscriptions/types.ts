import type { SupportTier } from "@/modules/assessments/buildTiers";

export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled", "past_due"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const LINE_ITEM_TYPES = ["base_plan", "addon", "module", "upgrade"] as const;
export type LineItemType = (typeof LINE_ITEM_TYPES)[number];

export const REVENUE_CATEGORIES = ["software", "service"] as const;
export type RevenueCategory = (typeof REVENUE_CATEGORIES)[number];

export type Subscription = {
  id: string;
  org_id: string;
  build_package_id: string | null;
  plan_name: string;
  status: SubscriptionStatus;
  support_tier: SupportTier | null;
  seats: number | null;
  start_date: string;
  renewal_date: string | null;
  first_billing_date: string | null;
  cancelled_at: string | null;
  billing_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionLineItem = {
  id: string;
  subscription_id: string;
  item_type: LineItemType;
  description: string;
  monthly_price: number;
  quantity: number;
  revenue_category: RevenueCategory;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionListRow = {
  id: string;
  orgId: string;
  orgName: string;
  planName: string;
  status: SubscriptionStatus;
  supportTier: SupportTier | null;
  seats: number | null;
  renewalDate: string | null;
  mrr: number;
};

export type SubscriptionDetail = {
  subscription: Subscription;
  orgName: string;
  buildPackageLabel: string | null;
  lineItems: SubscriptionLineItem[];
  mrr: number;
  mrrByCategory: { software: number; service: number };
};
