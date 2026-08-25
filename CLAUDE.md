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
  `/login`, `/reset-password`, `/update-password`.
- Everything under the `(app)` route group requires a session (enforced
  again at the layout level via `redirect()` as defense in depth, not just
  the proxy).

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
`.glass-panel-strong` utility classes), soft radial gradients, tight
spacing, restrained glow (`.glow-gold-hover`, `.glow-gold-focus`). Every
screen builds from `src/shared/ui/*` primitives (Card, Table, Button,
FormField/Input/Select, Badge, EmptyState, PageShell, AppShell, BrandMark)
— never a one-off styled div. No stock SaaS blue, no cartoon icons.

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
  source, `referred_by_org_id` (self-FK), `assigned_owner` (FK profiles),
  notes, created_at, updated_at. Read = default (was already staff-only
  write until Stage 3 added write policies).
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
- `assessment_questions` — question bank structure only, NOT seeded yet
  (question bank is Stage 7). Read = all authenticated.
- `assessments` — one row per assessment sitting: org_id, opportunity_id,
  conducted_by, status, started_at/completed_at, enterprise_score, band_id,
  recommended_build_tier, price_paid, notes.
- `assessment_answers` — one row per question answered per assessment.
  Snapshots `question_text_snapshot`/`category_id_snapshot`/`weight_snapshot`
  at answer time so a completed assessment stays accurate even if the live
  question bank changes later — this is what makes re-running an assessment
  and comparing it to a prior one safe.
- `assessment_category_scores` — per-assessment, per-category rollup:
  raw_score, weighted_score, bottleneck_rank.
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
