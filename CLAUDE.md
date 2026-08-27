@AGENTS.md

# VERUS OS (COMPASS)

Internal command center for **VERUS Operating Company** — NOT the same
project as the existing `verus-compass`/`oil-oasis` app
(`/root/frank-dev/oil-oasis`), which serves VERUS Energy Partners (a
different VERUS business, oil & gas). Never touch that project from here.

Operating flow this product exists to run: Lead → Discovery → Business
Assessment → Enterprise Score → Build Recommendation → Proposal → Build
Package → Client Onboarding → Projects → Tasks → Meetings → KPIs → Support
Subscription → Retention/Upsell.

## Definition of done (standing rule — every task, every time, unasked)

A task is **not done** until every one of these has actually happened, in
this order:

1. Coded.
2. `npm run typecheck` — clean.
3. `npm run build` — clean.
4. Deployed — `bash deploy.sh`.
5. Container confirmed healthy — `docker ps` shows `healthy`, and
   `docker logs verus-os --tail N` shows no new errors from the deploy.
6. Verified working on the live site — `curl` status checks against the
   actual running container at minimum; a real end-to-end exercise of the
   changed behavior (e.g. hitting the actual API route, not just guessing
   from the code) whenever the change is reachable that way. If something
   fails here, fix it and re-run from step 2 — do not commit a fix you
   haven't rebuilt and reverified.
7. Committed — `git add -A` (never selective/partial staging — everything
   changed goes in) and pushed to `origin/main`.
8. **Drift check** — after pushing, confirm local and remote agree and
   that what's running is what's committed:
   - `git status --short` is empty (nothing left uncommitted).
   - `git rev-parse HEAD` matches `git rev-parse origin/main` (the push
     actually landed and origin/main is what you think it is).
   - No edits were made to the working tree between the deploy in step 4
     and the commit in step 7 — the commit must capture exactly what was
     deployed and verified, not a "close enough" approximation of it.

Never report work as finished before this entire chain has completed.
Never stop partway and describe remaining steps as if they were done.

## Scope rule

**Never build anything not explicitly requested.** This product is built in
stages. If a feature isn't in the current stage's instructions, it doesn't
get built yet — no placeholder screens for future stages beyond an honest
empty shell if one was explicitly asked for, no speculative schema, no
"while I'm in here" additions.

## Standing rules

- Never use Playwright, Puppeteer, headless browsers, or screenshots to
  verify work. Verification is limited to: `npm run typecheck`,
  `npm run build`, `curl` for status codes, reading files, and direct
  database queries. James does the visual checking.
- No background agents. Work in the foreground so failures surface
  immediately.
- Do not install browser-testing packages.

## Naming / hosting (decided — do not deviate)

- Folder: `/opt/verus-os`
- Container: `verus-os`
- Port: `3009` (host) → `3000` (container)
- Domain: `verusoperatingpartners.com`, with `www` redirecting (301) to the
  bare domain
- ONE Next.js app serves BOTH the public marketing site (at `/`, no auth)
  AND COMPASS (behind `/login`)
- Product name shown inside the authenticated app: **COMPASS**
- Traefik routing is a FILE-PROVIDER route at
  `/docker/traefik/dynamic/verus-os.yml` — NOT docker labels. Docker-label
  auto-discovery has previously failed silently for a new container on this
  VPS's Traefik instance (root cause never found on a prior project); this
  file-provider pattern is the proven-working one. Deploy with
  `bash deploy.sh` (which just runs `docker compose up -d --build`).

## Public / private routing split

- `src/app/page.tsx` — public landing page, no auth, at `/`.
- `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`, same
  semantics) gates everything else: unauthenticated requests to any
  non-public path redirect to `/login?next=<path>`. Public paths: `/`,
  `/login`, `/reset-password`, `/update-password`, `/scan`, `/assessment`.
- Everything under the `(app)` route group requires a session (enforced
  again at the layout level via `redirect()` as defense in depth, not just
  the proxy).
- `/scan` (Stage 7) — the free Quick Scan, public, no auth. `/assessment/[token]`
  (Stage 7) — the share-link runner for a Full Assessment sent to a
  client. Both live outside `(app)`, both do every read/write through
  `src/shared/supabase/admin.ts` (never the request-scoped client — RLS on
  the assessment tables is `to authenticated` only, so an anon request has
  zero access via the normal client regardless). `/assessment/[token]`'s
  only authorization is resolving the token to one assessment id in
  `getAssessmentByToken()`; nothing downstream ever accepts a client-
  supplied assessment id. See `/api/public/*` route handlers.

## Design tokens

CSS variables in `src/app/globals.css` — the single source of truth for the
brand palette, never hardcode a hex value in a component:

```
--navy: #071526;      --navy-2: #0d2238;    --black: #02060d;
--gold: #d4af37;      --gold-light: #f1d27a; --cream: #f7f5ef;
--muted: #a9b4c2;     --green: #4fb27a;     --yellow: #d6b650;
--red: #d35d5d;
```

Dark executive/PE-dashboard feel: glassmorphism (`.glass-panel` /
`.glass-panel-strong` utility classes), soft radial gradients deepening
toward the bottom, tight spacing, restrained glow (`.glow-gold-hover`,
`.glow-gold-focus`). Every screen builds from `src/shared/ui/*` primitives
(Card, Table, Button, FormField/Input/Select/Textarea, Badge, EmptyState,
Stat, PageShell, AppShell, BrandMark, LinkButton) — never a one-off styled
div. No stock SaaS blue, no cartoon icons.

Page width/padding is one system, `.page-container` (globals.css):
`max-width: var(--page-max)` (1800px) centered, `padding-inline:
var(--page-pad)` (48px) — used by PageShell and every page that builds its
own header instead of using PageShell (organization/opportunity detail
layouts). A section that needs to escape the padding without escaping the
cap (the kanban board) uses `.bleed-x`, which cancels exactly
`var(--page-pad)` — never hand-roll a different negative margin. Every
label/eyebrow/column-header uses `.section-label`, not a repeated Tailwind
string, so hierarchy can't drift. Every input/select/textarea uses
`.field-control` (+ `.field-select` for the hand-drawn chevron on
selects) — never bare browser chrome.

## Role model

Four roles (`src/shared/roles.ts`): `verus_admin`, `verus_staff`,
`client_owner`, `client_user`.

- `verus_admin`/`verus_staff` see everything — not scoped to a single org.
- `client_owner`/`client_user` are scoped to exactly one `org_id` (set on
  their `profiles` row) and must NEVER see another org's data. Every table
  that holds org-scoped data gets an `org_id` column and an RLS policy
  using the `fn_is_verus_staff()` / `fn_my_org_id()` helpers from migration
  `0001` — copy that pattern for every new table, never a bespoke
  predicate.
- Enforce role checks server-side (API routes / Server Components), never
  in the client only — see `src/app/api/settings/brand-logo/route.ts` for
  the pattern (get session → look up `profiles.role` → reject before doing
  anything with the admin/secret-key client).

## Delete

Organizations, Opportunities, and Assessments (any status) are deletable,
staff only, from each record's own detail page — `src/shared/ui/DangerZone.tsx`,
a deliberately unstyled/muted text control set off by a hairline, never a
prominent button. It always confirms via `window.confirm()` with a message
the caller builds server-side naming exactly what else goes, with real
counts (`getOrganizationDeletePreview`/`getOpportunityDeletePreview` in
each module's `data.ts`; assessments only need `getAnswerCount` since
answers/scores cascade 1:1). The actual delete is always a single
`admin.from(table).delete().eq("id", id)` — every org-scoped table's
`org_id` FK is `ON DELETE CASCADE` (an assessment's `opportunity_id`,
by contrast, is `ON DELETE SET NULL` — deleting an opportunity unlinks
assessments/build packages/meetings/communication log from it, never
deletes them), so the DB does the cascade; the API route never has to
hand-delete children. Contacts already had delete (`ContactsPanel.tsx`,
plain `window.confirm`) — copy its route pattern, not its confirm-message
shape, for anything new.

## Client Report (Stage 16)

`/business-assessments/[id]/report` (`ClientReportView.tsx`) is a
distinct, executive-document view of a completed Full Assessment —
never quick_scan, gated 404 otherwise. It shares no markup with the
internal admin screen (`AssessmentReportView.tsx`): no override
dropdowns, no Save, no Delete, nothing an internal user would need —
verified by rendering the actual component tree against real data and
grepping the output for exactly those strings. Reached via a "Client
report ↗" button on the internal detail page (opens in a new tab, shown
only once an assessment is completed), with a "Download PDF" button on
the report itself that's just `PrintButton` — `window.print()` and the
browser's own Save-as-PDF, since this project doesn't use a headless-
browser/PDF-generation dependency for anything.

On screen it stays the normal dark COMPASS theme. Printing is handled by
the `.client-report` block in `globals.css` (scoped so it can never
affect any other page's printing) — it redefines the SAME CSS custom
properties every component already reads color from (`--cream`,
`--muted`, `--navy`, `--gold`, etc.) to a print-safe light palette, so no
component needs print-specific markup; `.cr-tone-{green,yellow,red,gold}`
restore a tone-bearing element's real color where the blanket
`.glass-panel *` override would otherwise flatten it to plain text.
`.cr-avoid-break` / `.cr-page-break` are the page-break primitives every
section is built from. Page numbers use the CSS `counter(page)` trick in
a `position: fixed` footer — best-effort (Chromium's print/Save-as-PDF
honors it; it degrades to a blank page-number span where a browser
doesn't, not a broken layout) since this project has no way to generate
PDFs itself to guarantee it, and browser print/PDF rendering isn't
something the standing verification rules can check directly (no
Playwright/screenshots) — only James's own print/PDF check can confirm
the visual rendering actually looks right.

All report copy — the category weighting rationale, the tone-aware
"what this score means" blurb per category, and each category's typical-
cost/fix-involves pair for the Three Biggest Constraints section — lives
in `reportCopy.ts`, written once and reused for every client, same
pattern as `buildTiers.ts`/`bottleneckCopy.ts`. `BuildTierInfo.timeline`
(also `buildTiers.ts`) is a new static per-tier field for the Recommended
Path section — there's no real build-package timeline tracked anywhere
yet. The back page's VERUS contact details are a placeholder
(`VERUS_CONTACT` in `reportCopy.ts`) — only the company name and the
`verusoperatingpartners.com` domain are verified facts; there's no real
phone/email on file anywhere in this app, so none is fabricated. Replace
`VERUS_CONTACT` with real contact details before this goes to an actual
client.

**Scope of Work (Stage 17)**, between Recommended Path and What Happens
Next: build phases generated from THIS assessment's own bottleneck
ranking, not a template — `computeScopeOfWork()` in `scopeOfWork.ts`
(pure function). A fixed 1-week Foundation & Scope Lock phase, then one
phase per top-ranked bottleneck category (however many `TIER_PHASE_PLAN`
says that tier's scope and budget actually cover — foundation: 1,
growth: 2, enterprise: 4; Custom returns `null` and the section falls
back to a one-line "scoped individually" note instead of the phase
table), then a fixed Training & Handover phase. Week ranges always sum
to exactly the tier's planned `totalWeeks` (`splitWeeks()` distributes
any remainder week to the earlier — i.e. higher-ranked — phases, so the
biggest constraint gets the most time) — kept inside the human `timeline`
range string on the same tier in `buildTiers.ts` by construction, not
independently. Per-category phase name/deliverables/artifact/dependency
copy lives in `reportCopy.ts` alongside the other per-category report
content. Verified by computing the plan directly for every tier
(including the fewer-real-bottlenecks-than-tier-capacity edge case) and
confirming the weeks always sum correctly and the phase order always
matches the assessment's actual ranking, plus a full component-tree
render confirming the section lands between the other two by name.

**Portal and automation scope (Stage 18)** — need-based, never tier-gated.
`assessment_operational_needs` (same shape/RLS as the other three
business-profile tables) captures `portal_need` (customers/partners/
both/no) + `portal_details` free text, and `automation_tasks` (a
multi-select of ten common ones, see `AUTOMATION_TASKS` in `labels.ts`) +
`automation_tasks_other` free text — asked in the same pre-questions step
as financial/presence/workforce. `BUILD_TIER_INFO` in `buildTiers.ts` no
longer mentions portals at all (removed from Foundation's and Growth's
`excluded`, and from Enterprise's unconditional `included` — a business
either needs one or it doesn't, regardless of tier). The actual per-
assessment scope is computed by `getEffectiveBuildScope()` in
`effectiveScope.ts`: starts from `BUILD_TIER_INFO[tier].included`, pulls
off the subscription line (always last), appends a tier-scaled portal
line from `PORTAL_SCOPE_BY_TIER` when `needsPortal()` is true (view-only
at Foundation, +document exchange at Growth, full multi-role at
Enterprise), appends one named deliverable per selected automation task,
then puts the subscription line back — so it's always last regardless of
what got injected. Every consumer of "the build's scope"
(`BuildRecommendationPanel.tsx`, `ClientReportView.tsx`'s Recommended
Path) reads scope through this function now, never
`BUILD_TIER_INFO[tier].included` directly, so a client's actual
portal/automation needs show up consistently everywhere scope is
displayed — and live-update with the override dropdown in
`BuildRecommendationPanel.tsx`, same as before. `computeScopeOfWork()`
also takes `operationalNeeds` now: when a portal's needed it inserts a
dedicated "Client & Partner Portal" phase (real deliverables: access and
permissions, per-user-type visibility, login/account management, and the
data walls between customers) positioned after the bottleneck phases and
before Training & Handover, and EXTENDS the plan's `totalWeeks` by a
tier-scaled amount (`PORTAL_PHASE_WEEKS`) rather than eating into
bottleneck-phase time, since it's real additional scope. `computeBuildRecommendation()`
takes `hasPortalNeed`/`automationTaskCount` and pushes `needTier` up
(capped at 2 when both apply together) the same way weak margin / no web
presence already did, so a business needing a portal plus several
automations lands on a higher tier than one needing neither — verified
directly (same base inputs, tier jumped from foundation to enterprise).

## Migrations rule

**Every schema change lands as a numbered SQL file under
`supabase/migrations/` first, additive only (never drop/rename a column in
place).** Migrations are then run directly against `DATABASE_URL` (present
in `.env.local`, gitignored) — the file is still the source of truth and
must exist and be committed before (or in the same change as) running it.
This project has the automatic-RLS event trigger enabled — every new table
starts with RLS ON and returns nothing until you write an explicit policy
for it. Never ship a table without one.

The app must degrade gracefully when a migration hasn't been run yet
(`relation does not exist`, Postgres error code `42P01`) — see
`src/shared/session.ts`'s `getMyProfile()` for the pattern: return a typed
"not configured" result, never let a missing table crash a page.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — read
  ONLY via static `process.env.X` member access in
  `src/shared/supabase/env.ts` (never a dynamic `process.env[name]` lookup
  — that exact pattern silently broke login on a prior project because
  Next.js can only inline `NEXT_PUBLIC_*` vars into the browser bundle for
  a statically-analyzable expression).
- `SUPABASE_SECRET_KEY` — server-only, used by `src/shared/supabase/admin.ts`
  (the full-access client). Never import `admin.ts` from a `"use client"`
  file, never send this key to the browser.
- Build-time: `docker-compose.yml` passes the two `NEXT_PUBLIC_*` vars as
  Docker build ARGs (baked into the client bundle at `npm run build` time,
  standard Next.js requirement) via a plain `.env` file at the project root
  (compose's own variable-substitution file — separate from `.env.local`,
  which is what the running container loads via `env_file:`). Both are
  gitignored; never commit either, never echo their contents.

## Database tables (update this list every time a migration adds one)

Default RLS shape (call out every deviation): **read** = staff see all
rows, `client_owner`/`client_user` see only rows where `org_id =
fn_my_org_id()`. **write** (insert/update/delete) = staff only
(`fn_is_verus_staff()`). Client write access across the whole schema is
deferred to Stage 17 (client portal) — every table below is staff-write-only
today, no exceptions.

- `organizations` — full CRM entity (Stage 3): name, type (prospect /
  active_client / former_client / referral_partner / vendor /
  strategic_opportunity), status, industry, website, phone,
  primary_address, employee_count_estimate, annual_revenue_estimate,
  `location_count` (Stage 8 — input to the build recommendation
  algorithm), source, `referred_by_org_id` (self-FK), `assigned_owner` (FK
  profiles), notes, created_at, updated_at. Read = default (was already
  staff-only write until Stage 3 added write policies).
- `profiles` — id (= `auth.users.id`), full_name, email, role, org_id,
  created_at. `client_owner`/`client_user` require a non-null `org_id`.
  Write: staff can insert/update any profile; a user can update their own
  row but a trigger (`fn_prevent_self_role_change`) blocks changing their
  own `role`/`org_id`.
- `app_settings` — singleton row (`id = 1`), `logo_url`, `updated_at`.
  Publicly readable — writes go through `/api/settings/brand-logo` (service
  role, bypasses RLS; no RLS write policy needed or added).
- `contacts` — org_id, full_name, title, contact_role, email, phone,
  is_primary, notes.
- `opportunities` — org_id, name, primary_contact_id, stage (Lead → ... →
  Support Subscription Active / Lost / Nurture), owner, source,
  expected_value, probability, pain_points, business_goals, next_action,
  next_action_date, notes, lost_reason, stage_changed_at (Stage 6 added
  name/pain_points/business_goals/next_action/next_action_date/notes).
- `opportunity_stage_history` — immutable append log of stage transitions.
  Insert-only (staff); no update/delete policy exists at all.
- `assessment_categories` — the 10 VERUS categories, seeded with locked
  weights (Operations 20, Systems 15, People 15, Leadership 12, Sales 10,
  Finance 10, Technology 8, Marketing 5, Vision 3, Enterprise Readiness 2 —
  sums to 100). Read = all authenticated (taxonomy, not org data).
- `assessment_bands` — seeded: Founder Dependent 0-39, Emerging Operator
  40-59, Growth Company 60-79, System-Driven Company 80-89, Enterprise
  Ready 90-100. Read = all authenticated.
- `assessment_questions` — 120 questions seeded (Stage 7, version 1): 12
  per category, `answer_options` (jsonb, exactly 4 `{value,label}` choices
  worth 0/1/2/3 — nothing in place / ad hoc / documented / documented and
  running well), `is_quick_scan` flags the 2-per-category subset the free
  Quick Scan uses. Read = all authenticated.
- `assessments` — one row per assessment sitting: org_id, opportunity_id,
  conducted_by, status, `assessment_type` (quick_scan/full, Stage 7),
  started_at/completed_at, enterprise_score, band_id, price_paid, notes,
  `share_token`/`share_token_expires_at`/`share_token_revoked_at` (Stage 7
  — the public `/assessment/[token]` runner's only credential). Stage 8
  (Build Recommendation Engine — Full Assessment only, computed once at
  completion, never for quick_scan): `recommended_build_tier` (foundation/
  growth/enterprise/custom), `recommended_build_price`,
  `build_recommendation_reasoning`, `recommended_support_tier` (base/
  growth/pro/enterprise/custom), `recommended_support_price`,
  `support_recommendation_reasoning`; staff override, recorded
  independently for build and support: `build_tier_override`/
  `build_tier_override_by` (FK profiles)/`build_tier_override_at`,
  `support_tier_override`/`support_tier_override_by` (FK profiles)/
  `support_tier_override_at` — effective tier is always `override ??
  recommended`, computed at read time, never stored redundantly. Fixed
  scope-per-tier (included/excluded, concrete seat/response-time/change-
  request numbers) and pricing live as static config in
  `src/modules/assessments/buildTiers.ts`, not in the database — support
  tiers are cumulative (`SUPPORT_TIER_INFO[tier].included` for Growth/Pro/
  Enterprise literally contains every item from the tier(s) below it, via
  `BASE_ITEMS`/`GROWTH_ITEMS`/`PRO_ITEMS`/`ENTERPRISE_ITEMS` in that file,
  never restated by hand) the way build tiers aren't. The monthly support
  product is always labeled "Software, Systems & Support Subscription"
  (`SUPPORT_SUBSCRIPTION_NAME` in that same file) — never a "Compass
  subscription". Stage 14: the subscription is bundled with every build,
  not an optional add-on — `DEFAULT_SUPPORT_TIER_FOR_BUILD` (also in
  `buildTiers.ts`) pairs foundation→base/growth→growth/enterprise→pro/
  custom→custom, and each `BUILD_TIER_INFO[tier].included` ends with a
  line naming that pairing and its price, built from `SUPPORT_TIER_INFO`
  rather than typed out by hand. `STABILIZATION_PERIOD_DAYS` (90) is
  covered by the build price — the subscription starts billing that many
  days after handover, which is why `BuildRecommendationPanel.tsx` shows
  it as "what keeps running and when it starts billing," not a
  recommendation to accept or decline. There's no build-package/handover
  date tracked anywhere yet (Build Packages hasn't shipped as its own
  stage), so the panel states the 90-day timing relative to handover
  rather than showing a fabricated calendar date — once a real handover
  date exists somewhere, that's where a literal first-billing date should
  be computed from, not before. The panel also shows a live First-Year
  Value (`buildInfo.price + supportInfo.price * 9`, the 9 months billed
  after the included period) driven by the same live-selected tiers as
  the scope lists.
- `assessment_answers` — one row per question answered per assessment.
  Snapshots `question_text_snapshot`/`category_id_snapshot`/`weight_snapshot`/
  `answer_options_snapshot` (Stage 7) at answer time — re-captured from the
  live question on every save while the assessment is still open, so a
  completed assessment stays accurate even after the question bank
  changes later. Unique on `(assessment_id, question_id)` — NOT partial;
  a partial unique index can't be an `ON CONFLICT` target for the
  upsert in `saveAnswer()` (Postgres requires the predicate to match
  exactly), and it was never needed since Postgres already treats every
  NULL as distinct from every other NULL in a unique index.
  `is_not_applicable` (Stage 11) marks a question as genuinely not
  applying to this business — `answer_value` stays null, distinct from a
  question with no row at all (never answered yet). `saveAnswer()` always
  writes `carried_forward_at: null` AND `is_not_applicable` on every save,
  so re-answering a not-applicable question (or a carried-forward one)
  always clears both flags in the same write.
- `assessment_category_scores` — per-assessment, per-category rollup:
  raw_score, weighted_score, bottleneck_rank, `not_applicable_count`
  (Stage 11). Scoring engine (Stage 7, `src/modules/assessments/scoring.ts`,
  pure functions, no DB access): category score = sum(answers) / (questions
  answered × 3) × 10; enterprise score = sum over categories of (category
  score / 10 × weight); bottleneck rank = (10 − category score) × weight,
  highest first. Same formulas for Quick Scan and Full — they're
  answered-count-relative, not fixed to a bank size. Not-applicable answers
  are excluded from `computeScores()`'s input entirely (same as
  never-answered — answer_value is null either way), never counted as a
  zero. `CategoryScoreDetail.lowConfidence` (computed at read time in
  `getAssessmentReport()`, not stored) is true when
  `not_applicable_count / totalQuestionCount > 1/3` for that category —
  shown as a "Low confidence" badge on both the Full report and the Quick
  Scan result. `AssessmentReport.notApplicableCount` is the assessment-wide
  total, queried independently (not summed from categoryScores) so a
  category with EVERY question marked not applicable — which then has no
  score row at all, same as one with zero real answers — still counts
  toward it.
- `assessment_financial_profiles` / `assessment_business_presence` /
  `assessment_workforce` (Stage 12) — one row per assessment
  (`assessment_id` unique FK), every column nullable, captured as a
  point-in-time snapshot on a FULL assessment only (never quick_scan,
  never on the organization record — the whole point is comparing them
  across reassessments). RLS mirrors `assessment_answers`: no denormalized
  `org_id`, an EXISTS join through the parent assessment instead, staff
  write-only. Financial: last/current year revenue, gross/net margin,
  net profit last year, monthly overhead, payroll % of revenue, cash on
  hand, AR outstanding, largest customer % of revenue, owner's comp.
  Average revenue per employee is never stored — always computed
  (`revenuePerEmployeeFrom()` in `profileData.ts`) from revenue ÷ real
  headcount. Presence: physical location (yes/no/home_based) + address,
  website + URL, `social_channels` (text[] — linkedin/facebook/instagram/
  tiktok/youtube/twitter/google_business/none), reviews status, email
  domain status. Workforce: W2/1099/VA/management counts, staffing
  feeling, hiring status + roles + time-to-fill, 12-month turnover %.
  `realHeadcountFrom()` (W2 + contractors + VAs) is used instead of
  `organizations.employee_count_estimate` wherever it's available, both
  for revenue-per-employee and for build recommendation sizing — see
  `buildRecommendation.ts`, where confirmed real revenue/headcount from
  these tables outweighs the organization's self-reported estimates, and
  a weak net margin or no website + no Google Business Profile pushes the
  recommendation up a tier the same way a severe bottleneck does. The
  runner shows this as a "before the questions begin" step
  (`BusinessProfileForm.tsx`) that only appears on a truly fresh session
  (nothing answered yet) — otherwise reachable via "Edit business profile"
  in the sidebar — and the report shows it via `BusinessProfilePanels.tsx`,
  which renders each of the three panels only if something was actually
  saved for it.
- `build_packages` — org_id, opportunity_id, tier (foundation/growth/
  enterprise/custom), status, price, deposit/balance amounts + paid_at,
  timeline dates, notes.
- `build_package_scope_items` — flexible scope line items per build
  package (website/software/sop_documents/automation/dashboards/support).
- `subscriptions` — org_id, build_package_id, plan_name, status, seats,
  start_date, renewal_date, cancelled_at. Never stores a price directly.
- `subscription_line_items` — **where MRR lives**: monthly_price *
  quantity per priced component (base_plan/addon/module/upgrade), open
  `end_date` = still active. MRR per client = sum where `end_date is
  null`, grouped by the parent subscription's org_id.
- `revenue_transactions` — append-only money ledger: assessment_fee /
  build_deposit / build_balance / subscription_charge / vendor_commission /
  refund, amount, direction (in/out), polymorphic `related_table` +
  `related_id` (no enforced FK — deliberate), status.
- `vendor_agreements` — org_id (the vendor/affiliate), agreement_type
  (referral_partner/vendor/white_label), commission_type, commission_value,
  terms, status.
- `vendor_revenue_events` — vendor_agreement_id, source_org_id (the client
  that generated it), amount, event_date, status, revenue_transaction_id.
  Read = staff + the vendor's own org only (never the source client's org —
  would leak the vendor's commission rate).
- `projects` — org_id, build_package_id, name, description, status, dates,
  owner.
- `tasks` — project_id (nullable), org_id (nullable — supports purely
  internal tasks), title, description, assignee, status, priority,
  due_date, completed_at. Staff-only write, no exceptions (see decision
  above re: Stage 17).
- `meetings` — org_id (nullable — supports internal meetings), opportunity_id,
  project_id, title, meeting_type (discovery/check_in/qbr/internal), agenda,
  notes, decisions, created_by.
- `meeting_attendees` — meeting_id, contact_id (nullable), profile_id
  (nullable), display_name (for attendees not in the system).
- `meeting_action_items` — meeting_id, description, assignee, due_date,
  status, linked_task_id (nullable promotion to a real task).
- `kpi_definitions` — name, unit, scope (verus_internal/client),
  higher_is_better. `client`-scope defs are readable by all authenticated
  users; `verus_internal` defs are staff-only read.
- `kpi_values` — time series: kpi_definition_id, org_id (nullable = VERUS
  internal KPI), period_start/end, value, recorded_by.
- `sops` — internal master SOP library. Staff-only read AND write — never
  client-visible.
- `client_sop_deliverables` — org_id, source_sop_id (nullable), the
  client-facing customized artifact delivered as part of a build package.
- `documents` — org_id (nullable = internal-only), title, category,
  file_url, uploaded_by, polymorphic `related_table`/`related_id`.
- `client_health_scores` — org_id, period, score, status (green/yellow/red),
  factors (jsonb), notes. Staff-only read AND write — internal scoring
  tool, not shown to clients.
- `support_tickets` — org_id, subscription_id (nullable), subject,
  description, priority, status, opened_by, assigned_to, opened_at,
  resolved_at, resolution_notes. Read = default org scoping (clients will
  see their own once the portal ships); write = staff only for now.
- `support_ticket_replies` — ticket_id, author, body — threaded replies on
  a support ticket.
- `communication_log` — org_id, opportunity_id (nullable), contact_id
  (nullable), type (call/email/note), direction (inbound/outbound,
  nullable for notes), subject, body, occurred_at, logged_by. **Staff-only
  read AND write** — deliberately not the default org-scoping every other
  table uses.
- Storage bucket `brand` (public) — the one working Settings feature this
  stage: brand logo upload, staff-only write.

## Known stage-1 limitation

Sidebar nav (`src/shared/nav.ts`) is currently the same flat list for every
authenticated role — Stage 1 didn't ask for per-role nav filtering. If a
future stage needs it, add it deliberately; don't assume it's already
there.
