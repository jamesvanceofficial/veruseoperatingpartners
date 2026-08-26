export const ASSESSMENT_TYPES = ["quick_scan", "full"] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  quick_scan: "Quick Scan",
  full: "Full Assessment",
};

export const ASSESSMENT_STATUSES = ["draft", "in_progress", "completed"] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
};

export const ASSESSMENT_STATUS_TONE: Record<AssessmentStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  draft: "neutral",
  in_progress: "yellow",
  completed: "green",
};

export const REVENUE_RANGES = ["Under $250K", "$250K–$1M", "$1M–$5M", "$5M–$10M", "$10M+"] as const;

// ===========================================================
// Financial profile / business presence / workforce — Stage 12, Full
// Assessment only.
// ===========================================================

export const PHYSICAL_LOCATION_OPTIONS = ["yes", "no", "home_based"] as const;
export type PhysicalLocation = (typeof PHYSICAL_LOCATION_OPTIONS)[number];
export const PHYSICAL_LOCATION_LABELS: Record<PhysicalLocation, string> = {
  yes: "Yes",
  no: "No",
  home_based: "Home-based",
};

export const SOCIAL_CHANNELS = ["linkedin", "facebook", "instagram", "tiktok", "youtube", "twitter", "google_business", "none"] as const;
export type SocialChannel = (typeof SOCIAL_CHANNELS)[number];
export const SOCIAL_CHANNEL_LABELS: Record<SocialChannel, string> = {
  linkedin: "LinkedIn company page",
  facebook: "Facebook business page",
  instagram: "Instagram business account",
  tiktok: "TikTok business account",
  youtube: "YouTube channel",
  twitter: "X / Twitter",
  google_business: "Google Business Profile",
  none: "None of these",
};

export const REVIEWS_STATUS_OPTIONS = ["none", "some", "active"] as const;
export type ReviewsStatus = (typeof REVIEWS_STATUS_OPTIONS)[number];
export const REVIEWS_STATUS_LABELS: Record<ReviewsStatus, string> = {
  none: "No",
  some: "Some",
  active: "Actively managed",
};

export const EMAIL_DOMAIN_STATUS_OPTIONS = ["own_domain", "personal", "mixed"] as const;
export type EmailDomainStatus = (typeof EMAIL_DOMAIN_STATUS_OPTIONS)[number];
export const EMAIL_DOMAIN_STATUS_LABELS: Record<EmailDomainStatus, string> = {
  own_domain: "Own domain",
  personal: "Personal email addresses",
  mixed: "Mixed",
};

export const STAFFING_FEELING_OPTIONS = ["understaffed", "about_right", "overstaffed"] as const;
export type StaffingFeeling = (typeof STAFFING_FEELING_OPTIONS)[number];
export const STAFFING_FEELING_LABELS: Record<StaffingFeeling, string> = {
  understaffed: "Understaffed",
  about_right: "About right",
  overstaffed: "Overstaffed",
};

export const TIME_TO_FILL_OPTIONS = ["under_2_weeks", "2_4_weeks", "1_3_months", "longer", "struggle"] as const;
export type TimeToFill = (typeof TIME_TO_FILL_OPTIONS)[number];
export const TIME_TO_FILL_LABELS: Record<TimeToFill, string> = {
  under_2_weeks: "Under 2 weeks",
  "2_4_weeks": "2-4 weeks",
  "1_3_months": "1-3 months",
  longer: "Longer",
  struggle: "We struggle to fill roles",
};
