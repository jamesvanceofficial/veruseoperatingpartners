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

- `src/app/(marketing)/` — the public VERUS website (Stage 18), no auth,
  at `/` and its sibling pages. See "The Public Website (Stage 18)" below.
- `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`, same
  semantics) gates everything else: unauthenticated requests to any
  non-public path redirect to `/login?next=<path>`. Public paths: `/`,
  `/login`, `/reset-password`, `/update-password`, `/scan`, `/assessment`,
  and the Stage 18 marketing pages (`/what-we-do`, `/the-assessment`,
  `/builds`, `/systems-and-support`, `/case-studies`, `/about`,
  `/contact`) — plus, unconditionally, `/sitemap.xml` and any
  `/opengraph-image*` path (Next's file-convention SEO routes, which
  crawlers/unfurlers must reach with no session).
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

Organizations, Opportunities, Assessments (any status), and Build
Packages are deletable, staff only, from each record's own detail page —
`src/shared/ui/DangerZone.tsx`, a deliberately unstyled/muted text control
set off by a hairline, never a prominent button. It always confirms via
`window.confirm()` with a message the caller builds server-side naming
exactly what else goes, with real counts (`getOrganizationDeletePreview`/
`getOpportunityDeletePreview`/`getBuildPackageDeletePreview` in each
module's `data.ts`; assessments only need `getAnswerCount` since
answers/scores cascade 1:1). The actual delete is usually a single
`admin.from(table).delete().eq("id", id)` — every org-scoped table's
`org_id` FK is `ON DELETE CASCADE` (an assessment's `opportunity_id`,
by contrast, is `ON DELETE SET NULL` — deleting an opportunity unlinks
assessments/build packages/meetings/communication log from it, never
deletes them), so the DB does the cascade; the API route never has to
hand-delete children. Contacts already had delete (`ContactsPanel.tsx`,
plain `window.confirm`) — copy its route pattern, not its confirm-message
shape, for anything new.

**Build Package delete is the one exception with real follow-up logic**,
not just a cascade delete — `deleteBuildPackage()` in `buildPackages/data.ts`
also moves the linked opportunity (if any) back to `build_package_proposed`
via the same `transitionStage()` helper every other stage change uses
(logged in `opportunity_stage_history` like any other move), undoing the
forward move creation made. The confirm message names phase/scope-item
counts plus how many of those items already have progress recorded
(status other than `not_started`), so deleting a partially-worked package
is never a silent loss. The source assessment is never touched by this —
nothing in the delete path writes to `assessments`/`assessment_answers`/
`assessment_category_scores` — so its score, recommendation, and answers
are exactly what they were, and a fresh build package can be created from
it immediately (verified directly: created, marked progress, deleted,
confirmed the assessment's score/tier/reasoning/answer count were
byte-for-byte identical before and after, then created a second package
from the same assessment and confirmed it started clean — 0% progress,
every item `not_started`, no rows anywhere still referencing the deleted
package's id).

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

**Support tier value justification + ladder (Stage 20)**, in the client
report's Recommended Path section, right after the subscription card:
`supportTierValue.ts` gives each of Base/Growth/Pro/Enterprise (never
Custom — quoted, no fixed numbers to justify) a static "what this would
cost otherwise" breakdown (`SUPPORT_TIER_VALUE`) — market-rate hosting/
infra, the SaaS licenses the system replaces, and that tier's included
ongoing work converted to hours at `AGENCY_HOURLY_RATE` ($125/hr) — plus
a one-sentence "who this tier is for" and "when you outgrow it."
`getSupportTierValueJustification()` sums the three into a market total;
every tier's price sits genuinely below it (verified: 25-51% below
market, strictly increasing up the ladder — $475/$1,150/$3,075/$5,125
market value for $350/$750/$1,500/$2,500 actual price). The client report
shows ALL FOUR tiers as a ladder (`ClientReportView.tsx`), not just
theirs — a "Your tier" badge marks the recommended/effective one, and
between each adjacent pair a delta line shows the exact price jump plus
2-3 concrete NEW items that tier adds, reusing the same
`BASE_ITEMS`/`GROWTH_ITEMS`/`PRO_ITEMS`/`ENTERPRISE_ITEMS` arrays the
cumulative included-scope lists are built from (now exported from
`buildTiers.ts` for this) rather than restating what's new in prose.
Fixed a pre-existing content bug while touching this: Pro's "12 change
requests per month" sat in the same cumulative included list as Growth's
"5 change requests per month" with nothing distinguishing which applied
— reworded to "12 change requests per month (up from 5)".

**Support pricing model replaced (Stage 21)** — researched against market
rates, this is the locked model; it fully supersedes Stage 20's numbers
and architecture. `SUPPORT_TIER_INFO` in `buildTiers.ts` is now base fee
plus per-seat overage, not flat: Base $500/mo (10 seats, $35/extra seat, 2
included hrs/mo, 2-business-day response), Growth $1,200/mo (25 seats,
$30/extra, 6 hrs, next-business-day), Pro $2,500/mo (50 seats, $25/extra,
12 hrs, same-business-day), Enterprise $4,000+/mo (unlimited seats, 24
hrs, same-day with a dedicated contact), Custom quoted. This ALSO fixed
the Stage 20 stacking bug at its root: the old model built each tier's
included-scope list by spreading cumulative increment arrays
(`BASE_ITEMS`/`GROWTH_ITEMS`/`PRO_ITEMS`/`ENTERPRISE_ITEMS`, now deleted),
which let a higher tier's line (e.g. "12 hours") sit alongside a lower
tier's un-superseded line (e.g. "2 hours") in the same list. Every tier
now states its seats/extra-seat-rate/included-hours/response-time as
single explicit fields on `SupportTierInfo` — structurally impossible to
duplicate — plus a hand-written `whatsNewFromPreviousTier: string[] |
null` the ladder's delta line reads directly instead of diffing arrays.
Scope itself is reorganized under four fixed headings per tier
(`SupportTierScope`: `keepingItRunning`, `keepingItCurrent`,
`keepingItUsed`, `access`) instead of a flat included/excluded list, shown
both in the client report's Recommended Path subscription card (the
client's own effective tier, in full) and in `BuildRecommendationPanel.tsx`
(the internal admin view, same structure, plus the raw seats/rate/hours/
response fields for staff). `supportTierValue.ts`'s
`getSupportTierValueJustification()` now also computes `costPerUser`
(price ÷ includedSeats, `null` for Enterprise's unlimited seats) and reads
`includedHoursPerMonth` straight from `SUPPORT_TIER_INFO` instead of a
separate hours table, so the displayed hours and the market-value math can
never drift apart; the agency rate moved to `AGENCY_HOURLY_RATE` ($150/hr,
was $125), and a new `MANAGED_IT_PER_USER_RANGE` ($100-250/user/mo)
constant backs the report's "your cost per seat lands below market"
sentence — verified for all four tiers (cost-per-user comes out to
$48-50/seat, comfortably under $100). `supportAddOns.ts` (new) holds the
flat-fee add-on list (additional seats at the tier rate, client/partner
portal $400/mo, marketing $2,000/mo, SEO $1,200/mo, social $900/mo,
bookkeeping $700/mo, additional automation builds $500 each, additional
dev hours $175/hr) and the VA staffing program (a $1,000 one-time
per-VA assignment fee covering sourcing/screening/training plus one free
30-day replacement, then hourly billing at a $10-$17.50/hr rate card by
role, 20 hrs/week minimum, plainly stated terms that VERUS trains the
system but doesn't supervise the VA day-to-day) — both rendered in a new
"Available Add-ons" section on the client report, positioned right after
the Support Ladder. The Combined First-Year Investment figure needed no
code change — it reads `SUPPORT_TIER_INFO[tier].price` live, so it picked
up the new prices automatically; reverified directly rather than assumed.
**Known limitation**: `Assessment.build_recommendation_reasoning` /
`support_recommendation_reasoning` are one-time TEXT snapshots taken at
assessment-completion time (see the Migrations rule's snapshot pattern) —
they do NOT retroactively update when this static pricing config changes.
Any already-completed assessment (as of this stage, RBL Safety LLC's real
Full Assessment) will keep showing its OLD reasoning prose with the old
prices, while the live tier-lookup-driven parts of its report (the ladder,
value justification, add-ons) correctly show the new ones — a genuine,
not-yet-resolved inconsistency for that one real record, left alone per
the scope rule rather than silently recomputed.

**Pricing release control (Stage 22)** — findings and price are two
separate moments; a new `pricing_released`/`pricing_released_at`/
`pricing_released_by` triple on `assessments` (off by default) decides
which the client sees. While off, the client report
(`/business-assessments/[id]/report`) and the completed-assessment view
reached via the public share link (`/assessment/[token]`, which renders
`AssessmentReportView`) show every diagnostic section — score,
categories, constraints, business profile, scope of work — with every
dollar figure replaced by a deliberate placeholder instead of a blank or
broken layout: whole pricing-only blocks (the exec summary cost card, the
Support Ladder, Available Add-ons, Combined First-Year Investment) become
a single `PricingGateCard` reading "Investment reviewed together."; a
price embedded inline in an otherwise-useful card (the build/support tier
headline price, the extra-seat-rate stat) is swapped for the same phrase
in place; a price woven into freeform copy (a scope-list item's "($35/mo
per additional seat)" aside, or the stored `build_recommendation_reasoning`/
`support_recommendation_reasoning` snapshot text) is stripped by
`redactPriceMentions()` — both live in the new shared `pricingGate.ts`,
imported by both `ClientReportView.tsx` and `BuildRecommendationPanel.tsx`
so the two surfaces redact identically. Staff always sees full pricing
regardless of the flag — `BuildRecommendationPanel`'s `showPricing = canEdit
|| pricingReleased`, and `canEdit` is already exactly "is VERUS staff" at
every call site, so this same one prop also correctly gates the internal
`/business-assessments/[id]` page for a `client_owner`/`client_user` who
navigates there directly, not just the two surfaces named in the request —
a client viewer is a client viewer regardless of route. Toggled from the
internal assessment view via `PricingReleaseControl.tsx` (staff-only,
"Release pricing to client" / "Hide pricing from client", one click each
way) → `POST /api/assessments/[id]/pricing-release` (staff-guarded, same
`requireStaff()` pattern as every other mutation route) →
`setPricingReleased()` in `data.ts`, which stamps who/when on release and
clears both back to null on hide — the fields always describe the CURRENT
state, never a history of past releases, same convention as
`build_tier_override_by`/`_at`. Verified end-to-end: rendered the actual
`ClientReportView` and `AssessmentReportView` component trees (the latter
via a stubbed `AppRouterContext.Provider`, since `BuildRecommendationPanel`
is a client component that calls `useRouter()`) against a real completed
throwaway Full Assessment with pricing hidden — confirmed zero literal
`$` characters anywhere in the gated client report while every diagnostic
section still rendered — then released pricing and confirmed real dollar
figures and the redacted asides both came back, then hid it again and
confirmed `pricing_released_at`/`_by` cleared to null, then confirmed an
unauthenticated `POST` to the release endpoint is rejected with 401. This
pass caught and fixed two real leaks the first implementation missed:
`BuildRecommendationPanel`'s build-tier `ScopeList` (whose last item is
`buildTiers.ts`'s `subscriptionScopeLine()`, e.g. "...then Growth at
$1,200/mo") and the stored `support_recommendation_reasoning` snapshot
text — both were rendered unredacted before the fix.

**Cover page (Stage 23)** — two changes to the front cover only (the back
page is untouched). `BrandMark` (`src/shared/ui/BrandMark.tsx`) gained a
`"cover"` size — `h-20` for the real uploaded logo, `text-[34px]` for the
text-mark fallback — substantially bigger than `"lg"` (`h-10`/`text-[20px]`),
which every in-app header still uses; the fallback-to-text-if-no-logo
behavior already existed in `BrandMark` and needed no change, only a
bigger variant. "Confidential" moved out of the centered title block to
its own top-of-page line (`.section-label`, no `cr-tone-gold` — muted, not
gold) — the cover section is now `flex flex-col` with that line first and
a `flex-1` wrapper centering the logo/title/date block in the remaining
space, so it reads as a document marking rather than a subtitle both on
screen and under the existing `.cr-cover { height: 9.2in }` print rule.
The running footer already said "{orgName} · Confidential" on every page
before this stage — unchanged. Verified two ways: rendered the actual
`ClientReportView` cover directly and confirmed "Confidential" precedes
"Business Assessment" in the HTML with no `cr-tone-gold` nearby, and
separately uploaded a real throwaway PNG to the `brand` storage bucket,
pointed `app_settings.logo_url` at it, and confirmed the actual running
container renders it via a real `<img>` tag on a live public page
(`/scan`) — `BrandMark`'s `createServerSupabase()`/`cookies()` call only
works inside a genuine Next.js request, so the image-rendering branch
can't be exercised by a raw script render the way the text-fallback
branch can; this is why that half of the check ran against the live
container instead. Cleaned up the test logo and reset `app_settings` back
to `null` (its real state — no logo has been uploaded yet) afterward.

## Build Packages (Stage 9)

Manages the actual work VERUS sells after an assessment is accepted —
`src/modules/buildPackages/`. The only creation path is FROM a completed
Full Assessment: one click (`CreateBuildPackageButton.tsx`, a plain POST,
no intermediate form) carries over the effective build tier
(`build_tier_override ?? recommended_build_tier`), that tier's price
(`BUILD_TIER_INFO[tier].price`), and the assessment's already-computed
Scope of Work — nothing retyped. Lands on the new package's detail page;
deposit/balance/dates/status/notes get filled in afterward via the edit
form, which is the only form this stage has (see below for why "create"
isn't a separate form page).

**Scope items come from each phase's own deliverables, not the flat
Recommended-Path scope list** — a deliberate design decision, not an
oversight. `effectiveScope.ts`'s `included` array (Website, CRM, SOPs,
Dashboards, Setup, Implementation, the subscription line) is a flat,
marketing-style summary built for the client report's tier comparison; it
has no natural per-phase grouping. `scopeOfWork.ts`'s phases, by contrast,
already carry their own itemized `whatWeDo` deliverables per bottleneck
category (plus Foundation & Scope Lock / Portal / Training & Handover) —
exactly the granularity a trackable build checklist needs. So
`generateBuildPackagePlan()` in `generatePlan.ts` (pure function, no DB)
turns each phase's `whatWeDo` items into that phase's scope items.
**Categorization (fixed after an audit of a real generated package found
nearly every item landing on "software" by default)**: every deliverable
string this app can ever generate is static copy — `reportCopy.ts`'s
`CATEGORY_BUILD_DELIVERABLES` per bottleneck category, the fixed
scope-lock/portal/handover phase text in `scopeOfWork.ts`, or a generated
"`<automation task> automation`" line — never freeform text. So
`categorizeScopeItem()` maps every one of those known strings to its
actual category BY HAND in an exact-match table (`DELIVERABLE_CATEGORY_MAP`
in `generatePlan.ts`), across all nine `scope_category` values (website,
software, systems_process, sop_documents, automation,
dashboards_reporting, people_hiring, training_handover, portal) — a
keyword/phase-kind guess only fires as a defensive fallback for a string
that isn't in the table (e.g. if `reportCopy.ts`'s copy changes later),
and should never fire for anything generated today. Automation deliverables from the
business profile (Stage 18) don't correspond to any bottleneck-category
phase, so they attach to Training & Handover, where automations actually
get wired up and validated at the end of a build. The subscription line is
never carried over as a scope item at all — it's a different, ongoing
product (see `subscriptions`/`subscription_line_items`), not build scope.
A Custom build has no fixed phase structure (`computeScopeOfWork()`
returns null), so it gets one fallback "Build" phase (week 1-1) holding
the generic "scoped individually" line plus any automation deliverables,
so the one-click flow never silently drops data for Custom.

Creating a package also moves its linked opportunity (via the assessment's
`opportunity_id`, if any) to `build_package_sold` through the existing
`transitionStage()` helper — the same one the kanban and edit-form stage
changes use, so the transition is logged in `opportunity_stage_history`
exactly once, however it happened.

**Pages**: `/build-packages` (list, filterable by status/org — no create
button, since creation always starts from an assessment or the org tab);
`/build-packages/[id]` (detail — org/tier/status header, Stat row for
price/payment status/overall progress/first billing date, a payment/dates
Card, then every phase as its own card with a progress bar and its scope
items, each with a staff-only status `<select>` that PATCHes immediately);
`/build-packages/[id]/edit` (the one form — org/assessment/tier are always
shown read-only and are never editable, since they're what the generated
phases were built from; price/deposit/balance+paid/dates/status/notes are
the only ever-editable fields). Organizations gained a real `build-packages`
tab (`ORG_TABS`/`BUILT_TAB_SLUGS` in `organizations/tabs.ts`) listing that
client's packages, plus a "Start one" section listing the org's completed
Full Assessments — each shows "Create build package" if it doesn't have
one yet, or "View build package →" if it does (multiple packages per
assessment aren't blocked at the DB level, e.g. a genuine re-build, but
the UI nudges toward one per assessment).

**Payment status** (`unpaid`/`deposit_paid`/`paid_in_full`) is computed at
read time from `deposit_paid_at`/`balance_paid_at` in
`buildPackages/data.ts` — never a stored column, same "derived, not
redundant" convention as an assessment's effective tier. Saving the edit
form with "paid" checked sets the `_paid_at` timestamp only if it wasn't
already set (preserves the real original paid-at across later edits);
unchecking it clears the timestamp back to null, mirroring how a tier
override clears when reverted.

**Progress** rolls up from scope-item status: a phase's `progressPct` is
`complete / total` for its own items; a package's `overallProgressPct` is
the same ratio across every phase. Both computed at read time in
`getBuildPackageDetail()`, never stored.

**Connected to the client report's billing date (requirement carried over
from Stage 14's "no build-package/handover date tracked anywhere yet"
limitation)**: `computeFirstBillingDate()` in `assessments/buildTiers.ts`
adds `STABILIZATION_PERIOD_DAYS` to a build package's `handover_date`.
`getAssessmentReport()` now also returns `buildPackageHandoverDate` (the
most recent linked package's `handover_date`, queried directly rather
than through the buildPackages module to avoid a circular import, since
`buildPackages/data.ts` itself calls `getAssessmentReport()`). Both
`ClientReportView.tsx`'s subscription card and `BuildRecommendationPanel.tsx`'s
"First billing" cell show the real computed date once handover_date is
set, falling back to the original "N days after handover" phrasing until
then — verified both ways directly (rendered the actual report component
tree before and after setting a real handover_date and confirmed the text
switches over correctly, not assumed from the ternary alone).

## Projects and Tasks (Stage 10)

`src/modules/projects/` and `src/modules/tasks/` — the actual delivery
work, one project per build-package phase, one task per scope item.

**Generation** (`generateProjectsFromBuildPackage()` in `projects/data.ts`,
triggered by a single "Generate Projects" button on the build package
detail page, staff only): one project per phase (name, `build_package_id`,
`build_package_phase_id`, `category_id` — resolved by looking up
`assessment_categories` by the phase's `category_name`, null for
scope-lock/portal/handover/custom phases, which have no category), one
task per scope item in that phase (title = the scope item's description,
`scope_item_id` set, status carried over from the scope item's CURRENT
status via `scopeItemStatusToTaskStatus()` — not always blank, since a
build package might already have some progress recorded before Generate
Projects is ever clicked). Phase week ranges (1-based, relative) become
real calendar dates via `phaseDatesFrom()`, anchored to the build
package's own `start_date` — a project/task gets real
`start_date`/`due_date` only when that anchor exists; with no
`start_date` set yet, dates stay null rather than guessing (Stage 10's
literal "carrying the phase week ranges across as dates where they
exist"). Blocked from running twice on the same build package
(`getProjectCountForBuildPackage() > 0` → rejected) so re-clicking never
piles up duplicates; a second, independently-created build package (e.g.
after Stage 9's delete-and-recreate flow) generates its own fully
separate set of projects with no cross-contamination — verified directly.

**The two-way status sync (requirement 6)** is the one place this stage
has real bidirectional logic, not just CRUD: `updateTask()`
(`tasks/data.ts`) and `updateScopeItemStatus()` (`buildPackages/data.ts`)
each do a single direct write to the OTHER table when the linked side
exists — neither ever calls back into the other, so they can't loop.
`tasks/scopeItemSync.ts` holds the one-way-each mapping: task
`open`/`in_progress`/`complete` maps cleanly to scope item
`not_started`/`in_progress`/`complete` in both directions; a task set to
`blocked` or `cancelled` has no clean scope-item equivalent, so it leaves
the scope item exactly as it was rather than forcing a guess onto
build-tracking data (verified directly: marking a task "blocked" does not
touch its scope item's status). Deleting a task never deletes its linked
scope item (only unlinks by removing the task) — the delete-confirmation
message says so explicitly when a task has one.

**Completion percentage** (a project field, per requirement 2) is always
computed at read time from its tasks — `complete / total`, 0 with no
tasks — never stored, same convention as a build package's own progress
rollup.

**Pages**: `/projects` (list, filterable by client/status),
`/projects/[id]` (detail — completion/owner/dates Stat row, build
package/phase/category fields, then its task list with an inline
staff-only status `<select>` per task that PATCHes immediately and
triggers the scope-item sync same as anywhere else), `/projects/new` +
`/projects/[id]/edit` (one `ProjectForm`, org/build-package/phase are a
cascading dependent-dropdown chain exactly like `OpportunityForm`'s
org→contacts pattern — picking an org loads its build packages via
`GET /api/organizations/[id]/build-packages`, picking a build package
loads its phases via `GET /api/build-packages/[id]/phases`); `/tasks`
(list with "My Tasks"/"Overdue" quick-filter chips plus org and build
package dropdowns — a build-package filter resolves through that
package's projects since tasks don't carry `build_package_id` directly),
`/tasks/new` + `/tasks/[id]/edit` (one `TaskForm`; tasks have no separate
detail page — edit doubles as it, per the same reasoning as
`build_packages`, and carries the `DangerZone` for delete). Organizations
gained real `projects`/`tasks` tabs (`ORG_TABS`/`BUILT_TAB_SLUGS` in
`organizations/tabs.ts`).

**Delete** (staff only, `DangerZone`, same style as everywhere else):
a project's confirm message names its task count (tasks cascade via the
existing `project_id` FK, verified directly); a task's confirm message
flags when it's tracking a build-package scope item, since deleting the
task does NOT delete that scope item — only removes the link.

## Meetings and Accountability (Stage 11)

`src/modules/meetings/` — every meeting is an executive operating record,
not scratch notes: Agenda, Notes, Decisions, and Action Items are always
four visually separate sections on the detail page (`RecordSection`
components plus a dedicated `MeetingActionItemsPanel`), never one
freeform blob.

**Related record** is one of opportunity/build_package/project, at most
one at a time — the form presents this as a single "Related to" type
picker plus a dependent record dropdown (not three separate always-visible
fields), reusing the exact cascading-dropdown pattern `OpportunityForm`
established for org→contacts: picking a type fetches that org's records
through the same lightweight option endpoints Stage 9/10 already built
(`/api/organizations/[id]/opportunities`, `.../build-packages`,
`.../projects`). `getMeetingDetail()` resolves whichever FK is set into
one display label (e.g. "Build Package: Growth Build").

**Attendees** are contacts, staff, or free-text guests in one list —
`meeting_attendees` already had exactly this shape from the Stage-1
foundation migrations (`contact_id`/`profile_id`/`display_name`), so this
stage only needed the UI. Saving a meeting always replaces the full
attendee list (`replaceAttendees()`: delete all, re-insert what's
submitted) rather than diffing — the list is always small enough that a
full replace is simpler and cannot drift.

**Action items → tasks (requirement 3)**: `convertActionItemToTask()`
carries description/assignee/due date straight into a new task (org_id
and project_id inherited from the meeting), then stamps
`meeting_action_items.linked_task_id` — idempotent, so re-clicking an
already-converted item returns the existing task instead of creating a
duplicate (verified directly). That link is forward-only (action item →
task), so "linked back to the meeting it came from" is served by a
reverse lookup instead of a second column: `getMeetingForTask()` queries
`meeting_action_items` for a row whose `linked_task_id` matches, and the
task's edit page shows an "Originated from meeting: X →" line when one
exists. Deleting a meeting cascades its attendees and action items (both
FK'd to `meeting_id` `on delete cascade`) but never touches a task an
action item was already converted to — verified directly: delete the
meeting, confirm the action item row is gone, confirm the task survives.

**Pages**: `/meetings` (list, filterable by client/type),
`/meetings/[id]` (detail — the executive-record layout above, plus
attendee badges and the action items panel), `/meetings/new` +
`/meetings/[id]/edit` (one `MeetingForm`). Organizations gained a real
`meetings` tab. Delete is staff-only `DangerZone`, confirming with real
attendee/action-item counts and stating plainly that an already-converted
task is not affected.

`formatDateTime()`/`toDatetimeLocalValue()` (new, in `shared/format.ts`)
are the first date+time (not just date) helpers in the app — meetings are
the first record type that needed a real time, not just a day.

## The Public Website (Stage 18)

`src/app/(marketing)/` — what paid traffic lands on: Home (`/`), What We
Do, The Business Assessment, Build Packages (`/builds` — the internal
build-package list already owns `/build-packages`), Software Systems &
Support (`/systems-and-support` — the internal nav already owns
`/software-support`), Case Studies, About James Vance, Contact/Apply.
One shared `(marketing)/layout.tsx` wraps all of them in
`MarketingHeader`/`MarketingFooter` (`src/modules/marketing/`) — a
distinct, lighter chrome from both the authenticated `(app)` shell and
`/scan`'s deliberately nav-free minimal header, which stays untouched.
`MarketingHeader` is `"use client"` (the mobile hamburger menu needs
state) but never imports `BrandMark` directly — `BrandMark` is itself an
async Server Component (reads `app_settings` via a cookie-based client),
and a client module can only ever receive a Server Component as a prop,
never import and instantiate one — same `brand: React.ReactNode` prop
pattern `AppShell` already used. This broke the build once already; fixed
by rendering `<BrandMark>` in the (Server Component) layout and passing
it down, not inside the header itself.

**Positioning language is locked** — `marketing/positioning.ts` holds it
word for word (`POSITIONING.notConsulting`, `.approach`,
`.systemsAndProcesses`, `.whoWeServe`, `.delivery`), reused verbatim
across Home/What We Do/About rather than retyped. Do not rephrase it,
including `.approach`'s slightly unusual phrasing — it was given exactly
as locked text, not paraphraseable copy.

**Case studies** (`marketing/caseStudies.ts`) — RBL Safety and Radiant
Moments, written as "what was built" / "what changed," no invented
numbers, no testimonials. Each carries a `quotePlaceholder` field
(`"[Client quote to be added]"`) rendered on the Case Studies page,
clearly marked rather than left blank or faked — replace with a real
quote once one exists, never fill it with an invented one in the
meantime.

**Pricing pages never show a price list** (requirement 5) — `/builds`
and `/systems-and-support` pull tier content live from
`BUILD_TIER_INFO`/`SUPPORT_TIER_INFO` (so it can never drift from what
the client report says) but never render `.price`/`.priceLabel`, and run
every included/scope-list string through the same `redactPriceMentions()`
used for Stage 22's pricing-release gating to strip any embedded dollar
figure (e.g. the build tier's trailing subscription line, or a support
tier's "($35/mo per additional seat)" aside) — seats/hours/response-time
numbers stay visible since they're quantities, not prices, matching the
Stage 22 convention exactly. **A real leak this caught**: redacting the
*visible text* isn't enough if a list item's ORIGINAL unredacted string is
still used as the React `key` prop — React key values get serialized into
the page's HTML/RSC payload for hydration, so the raw "$500/mo" was
reaching the page source even though the rendered text correctly showed
"the reviewed rate." Fixed by keying every such list off the redacted
string instead of the raw one. Caught by grepping the actual live HTML
response for known dollar amounts after deploy, not by reading the
component code and assuming it was correct. The Business Assessment page
(`/the-assessment`) is the one deliberate exception — it states $2,500
plainly, per requirement 5, and also reads real category names/weights
and band labels live from `assessment_categories`/`assessment_bands` via
the admin client (same reasoning as `/scan`: that RLS is `to authenticated`
only, so an anon page has to read it through the admin client, same as
the public quick-scan flow already does), degrading gracefully to a
category-list-free version of the page if the read ever fails.

**Contact/Apply (requirement 6)** — `marketing/data.ts`'s
`submitContactInquiry()` needed zero schema changes: every form field
maps onto an existing `organizations`/`contacts`/`opportunities` column.
Revenue range (a bucket, not a number) goes into `organizations.notes`
as self-reported text, exactly like the Quick Scan flow already does for
the same reason — same precedent, not a new pattern. Runs via
`POST /api/public/contact`, admin client, no staff guard (same reasoning
as `/api/public/scan`: every write-RLS policy on these tables is
staff-only, so an anon request via the request-scoped client would have
zero access regardless). Lands on `/contact/thank-you`, which points back
at `/scan` while they wait.

**"Notify me" is email via Resend** (`marketing/notify.ts`,
`notifyNewLead()`) — the `resend` npm package, gated behind
`RESEND_API_KEY`/`LEAD_NOTIFICATION_FROM`/`LEAD_NOTIFICATION_TO` env vars
(gitignored `.env.local`, never committed). Never blocks or fails the
form submission — the CRM record is already saved by the time this runs,
so a missing key or a Resend outage degrades to "no email sent," not a
lost lead or a 500 to the visitor. There was no notification
infrastructure anywhere in this app before this stage (the existing Quick
Scan lead-capture flow just relies on checking the CRM Pipeline) — this
was a deliberate, asked-first decision, not assumed.

**SEO** (requirement 8): every marketing page has its own real
`title`/`description`/`openGraph` metadata export. `src/app/layout.tsx`
gained `metadataBase` (required — without it, Next silently resolves
Open Graph image URLs to `localhost` in production, breaking every
social-share preview; caught from the build's own warning, not assumed).
`src/app/(marketing)/opengraph-image.tsx` generates one shared branded OG
image for the whole site via `next/og`'s `ImageResponse` (no static
asset — it's built from the same locked palette in `globals.css`, so it
can't drift from the brand). `src/app/sitemap.ts` lists every marketing
page plus `/scan`, not `/contact/thank-you` (a post-submission utility
page, not meant to be indexed).

**Mobile** (requirement 7): every layout in this stage is mobile-first
Tailwind (`grid-cols-1` before any `sm:`/`lg:` override, no fixed pixel
widths anywhere in `(marketing)/` or `modules/marketing/` — verified by
grep, not assumed) and reuses `.page-container`'s existing responsive
`--page-pad` (48px → 20px under 640px, from Stage 1). `MarketingHeader`
collapses to a hamburger menu below `lg:`. Per the standing verification
rules, this app never uses Playwright/screenshots — so "tested at 375px"
here means confirmed responsive-by-construction (real breakpoints, no
fixed widths, the shared mobile padding override) via curl and code
review, not a rendered visual check; James does that part.

**Known placeholder, not fabricated**: the About page's biographical
content about James Vance is deliberately generic — restating VERUS's
locked positioning/approach rather than inventing specific unverifiable
history (past roles, years of experience, credentials), since none were
given and this app has no verified facts about his background beyond
running VERUS. Replace with real specifics when they're provided, same
philosophy as the `VERUS_CONTACT` placeholder in the client report.

**Visual overhaul — real product visuals, layout variety, expanded
content, restrained motion (Stage 24)**. The marketing site's original
pass (above) was every section centered with no visuals; this stage fixed
that without touching the locked design tokens or positioning language.

*Hero visuals are the real report components, not screenshots.*
`BandScale`, `CategoryBars`, and `RankedBottleneckList` were extracted out
of `ClientReportView.tsx`/`AssessmentReportView.tsx` into standalone,
prop-driven components under `modules/assessments/` — both report views
were refactored to import and render the SAME extracted components, so
the marketing site can never visually drift from what a real client
actually sees. `AnimatedScoreGauge` (`modules/marketing/animation/`) wraps
the real `ScoreGauge` (unmodified, still used as-is by `QuickScanResult`)
and RAF-drives its `score` prop from 0 to target on scroll-in, rather than
duplicating the SVG. `marketing/sampleAssessment.ts` is the one fictional
dataset on the site — real category names/weights and real band
thresholds, but the per-category scores and the resulting enterprise
score/band/bottleneck ranking are all computed programmatically through
the actual scoring formulas (`categoryScore/10*weight` summed;
`(10-score)*weight` for bottleneck impact), never a hand-picked number, so
it can't be internally inconsistent under scrutiny. `ReportPreviewFrame`
composes `AnimatedScoreGauge` + `RankedBottleneckList` against that sample
data inside a CSS 3D-tilted panel (`[perspective:1600px]` +
`rotateY/rotateX`, no library) as the "shown at an angle" report preview.
Case studies deliberately got NO fabricated chart/score against the real
RBL Safety/Radiant Moments records — attaching sample data to a real
client would misrepresent an actual score; their expansion (a new
`situation` field, full Built/Changed layout) is real content only.

*Layout variety*: `TwoColSection` (visual/text, `reverse` to flip),
`PullQuote`, and `StatBand` are the new alternating-layout primitives used
across Home/What We Do/The Assessment in place of "centered heading over
cards"; background plane alternates between the base gradient and
`--surface` per section so sections read as distinct bands.

*Motion*: `modules/marketing/animation/` — `useInView` (one-shot
`IntersectionObserver`, disconnects after first trigger),
`FadeUp` (opacity/translate on scroll-in), `AnimatedNumber` (RAF count-up,
ease-out cubic), all respecting `prefers-reduced-motion` (both a JS
`matchMedia` check and Tailwind's `motion-reduce:` variant) — reduced
motion jumps straight to the end state, never gets stuck mid-animation.
Home, The Assessment, Case Studies, and What We Do got full content and
layout rewrites; Build Packages, Software Systems & Support, About, and
Contact got the `FadeUp` motion treatment applied for site-wide
consistency but no content or layout changes, since they weren't named in
this stage's content-expansion scope.

*Content*: Home added a plain-spoken who-this-is-for/who-this-is-not-for
section and a real 6-question FAQ (`WHO_THIS_IS_FOR`/
`WHO_THIS_IS_NOT_FOR`/`FAQ_ITEMS` in `positioning.ts`) via a client-side
`FaqAccordion`. The Assessment page shows one real seeded question
(`SAMPLE_QUESTION` in `sampleAssessment.ts`) with all four answer choices,
plus an explanation of the 0-3 answer ladder. What We Do added a
per-build-category breakdown (websites/software/SOPs/dashboards/
automations/documentation/ongoing support), each with concrete
`includes` bullets, alternating sides via `TwoColSection`.

**Verifying the report-view refactor against real data**: because
`BandScale`/`CategoryBars`/`RankedBottleneckList` now back BOTH the
marketing site and the one real completed Full Assessment in the database
(RBL Safety LLC), the standing no-Playwright rule's usual verification
(typecheck/build/curl) can't render an authenticated internal page. Closed
that gap with a one-off script (written under the project root, deleted
before commit) using `renderToReadableStream` — not `renderToStaticMarkup`,
which can't await async Server Components like `BrandMark` — to render
`ClientReportView` and `RankedBottleneckList` directly against
`getAssessmentReport()`'s real output for RBL Safety LLC via the admin
client, confirming full output length, all ten category names, the band
scale, and the ranked list all render correctly, and that no internal-only
string (`Save`/`Delete`/`Override`) leaks into the client-facing view.
This is direct DB-backed server rendering, not a browser or screenshot —
consistent with the standing verification rules, and the closest
equivalent to a real request this app's rules allow for a page a live curl
can't reach.

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
- `RESEND_API_KEY` / `LEAD_NOTIFICATION_FROM` / `LEAD_NOTIFICATION_TO`
  (Stage 18) — server-only, used by `src/modules/marketing/notify.ts` to
  email James when the public Contact/Apply form is submitted. Loaded via
  `env_file: .env.local` at runtime like `SUPABASE_SECRET_KEY` — no
  `docker-compose.yml` change needed when these get filled in, just a
  redeploy. All three are blank until real values are provided; the form
  degrades to "lead saved to CRM, no email sent" until then, never a
  broken submission.

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
  recommended`, computed at read time, never stored redundantly. Stage 22:
  `pricing_released`/`pricing_released_at`/`pricing_released_by` (FK
  profiles) — see the Client Report section's Stage 22 entry. Fixed
  scope-per-tier and pricing live as static config in
  `src/modules/assessments/buildTiers.ts`, not in the database — as of
  Stage 21 each support tier states its own complete, standalone scope
  under four headings (`SupportTierScope`), never built from shared
  cumulative arrays (that pattern is what caused Stage 20's stacking bug;
  see the Stage 21 entry above) the way build tiers' included/excluded
  lists still are. The monthly support
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
- `build_packages` — org_id, opportunity_id, `assessment_id` (Stage 9 — the
  source assessment it was created FROM, nullable FK, `on delete set
  null`), tier (foundation/growth/enterprise/custom), status (proposed/
  sold/in_progress/complete/cancelled), price, deposit/balance amounts +
  `deposit_paid_at`/`balance_paid_at` (whether-paid is `IS NOT NULL` on
  these, same convention as `share_token_revoked_at` — never a separate
  boolean column), start_date, target_completion_date, `handover_date`
  (Stage 9 — what the 90-day subscription billing counts from, see
  `computeFirstBillingDate()` in `assessments/buildTiers.ts`), notes.
  **Note**: `actual_completion_date` also exists on this table (from the
  original Stage-1 migration) but is unused everywhere in the app —
  `handover_date` was added instead of repurposing it, since renaming a
  column in place is against the migrations rule and reusing an
  differently-named column under a new meaning in code, with nothing in
  the schema itself hinting at that, would be a real trap for whoever
  reads this schema next.
- `build_package_scope_items` — one row per tracked deliverable
  (website/software/systems_process/sop_documents/automation/
  dashboards_reporting/people_hiring/training_handover/portal — widened
  from an original six-value set that let almost everything collapse into
  "software"; see `categorizeScopeItem()` under Build Packages below),
  status (not_started/in_progress/complete), nested under a
  `build_package_phases` row via `phase_id` (Stage 9, `not null`, `on
  delete cascade`).
- `build_package_phases` (Stage 9) — one row per phase carried over from
  the source assessment's already-computed Scope of Work
  (`computeScopeOfWork()` in `assessments/scopeOfWork.ts`) at build-package
  creation time: phase_number, name, week_start, week_end, kind
  (scope-lock/bottleneck/portal/handover/custom), category_name/
  category_score (set for a bottleneck phase, null otherwise). A snapshot,
  not a live link — same snapshot philosophy as `assessment_answers` — so
  a later change to the question bank or tier config never rewrites an
  already-sold package's phases. See the "Build Packages (Stage 9)"
  section below for how phases/scope items are actually generated.
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
- `projects` — org_id, build_package_id, `build_package_phase_id`/
  `category_id` (Stage 10, both nullable FKs — see the Projects and Tasks
  section), name, description, status, `priority` (Stage 10, added — the
  original migration only had it on tasks), owner, start_date, `due_date`
  (Stage 10 — the original `target_end_date`/`actual_end_date` were never
  used anywhere and are left as unused leftovers rather than repurposed,
  same reasoning as `build_packages.actual_completion_date` in Stage 9),
  completion percentage always computed at read time from its tasks,
  never stored.
- `tasks` — project_id (nullable), org_id (nullable — supports purely
  internal tasks), title, description, assignee, status, priority,
  due_date, completed_at, `notes` (Stage 10, added), `scope_item_id`
  (Stage 10, nullable FK to `build_package_scope_items` — see the
  Projects and Tasks section for the two-way status sync this drives).
  Staff-only write, no exceptions (see decision above re: Stage 17).
- `meetings` — org_id (nullable — supports internal meetings), opportunity_id,
  `build_package_id` (Stage 11, added), project_id — at most one of these
  three is expected set at a time (app-level convention, not a DB
  constraint), title, meeting_type (Stage 11 replaced the original
  four-value placeholder set with the real nine: discovery_call/
  assessment_review/build_kickoff/weekly_client_meeting/
  internal_verus_review/monthly_business_review/support_review/
  build_review/sop_systems_review — table was empty in production so this
  was a straight replacement, not a data migration), `scheduled_at`
  (date+time in one timestamptz, no separate columns needed), agenda,
  notes, decisions, `follow_up_date` (Stage 11, added), created_by.
- `meeting_attendees` — meeting_id, contact_id (nullable), profile_id
  (nullable), display_name (for attendees not in the system). Already
  matched Stage 11's requirements exactly when it shipped in the Stage-1
  foundation migrations — no schema change needed, only a UI.
- `meeting_action_items` — meeting_id, description, assignee, due_date,
  status, linked_task_id (nullable promotion to a real task — forward-only;
  see the Meetings and Accountability section for how a task finds its
  way back to the meeting it came from). Also already matched Stage 11's
  requirements exactly — no schema change needed.
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
