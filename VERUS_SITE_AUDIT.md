# VERUS Site Audit — verusoperatingpartners.com

**Date:** 2026-10-31 · **Commit audited:** `d07f935` (Stage 39) · **Type:** read-only

## How this was checked

Nothing was changed, started, or installed for this audit. This file is the only thing written.

- Every route was requested over HTTPS against the live domain.
- The database was queried directly, read-only, for tables, row counts and newest rows.
- Every form's code path was traced from the browser to the database to the email call.
- The email provider (Resend) was checked with read-only API calls: the domain list and the send log. No email was sent.
- No forms were submitted and no one was logged in. Doing either would write data. So pages behind the login were confirmed to exist, compile, and redirect to the login, but were **not** clicked through while logged in during this audit.

---

## Headline findings (read these first)

1. **The site has never received a real lead.** Every Quick Scan and Contact record in the database is a test made on 2026-09-01. Nothing has been written to any table since 2026-09-01 (61 days). Either there's been no traffic that converts, or nobody has submitted anything. Traffic can't be measured: there's no access logging on the server and no analytics on the site.
2. **The pipelines themselves are built and wired end to end.** Quick Scan and Contact both save a full CRM record (company, contact, opportunity) and email James. Email sending is configured, the API key is valid, and the sending domain is verified.
3. **RBL Safety's real Full Assessment no longer exists.** CLAUDE.md describes RBL Safety LLC as having "the one real completed Full Assessment." It's gone. The RBL build package ($22,500, Growth, status "sold") is still there, but its assessment link is now empty, so it was deleted at some point.
4. **Stage 36 test data was left behind:**
   - 3 test companies: "Notify Test Co QS", "Notify Test Co Contact", "Notify Test Co Support"
   - 2 test logins
   - 1 test support ticket
5. **The CMC Property Services assessment is stuck.** It's a draft Full Assessment with 0 answers, and its client share link expired on 2026-09-27. That link now returns 404, so the client can't open it.
6. **The test client account has mismatched emails.** Its login email is `notifytest.client.…@example.com`, but its profile email is `jamesvanceofficial+notifytest@gmail.com`. Reply notifications go to the profile email.

---

## 1. Every page and route

"Works" means the live site returned the right response today. Public pages returned **200**. Login-protected pages returned **307 → /login**, which is correct when you're logged out. For login-protected pages, "Works" is **not** a logged-in click-through; see "How this was checked."

### Public marketing site (no login)

| Route | What it does | Works |
|---|---|---|
| `/` | Home page: hero, the problem, how it works, services, proof, FAQ, calls to action. | ✅ 200 |
| `/what-we-do` | Explains what VERUS builds, category by category. | ✅ 200 |
| `/the-assessment` | Explains the $2,500 Full Business Assessment, with live category weights from the database. | ✅ 200 |
| `/builds` | Build package tiers (Foundation/Growth/Enterprise/Custom), no prices shown. | ✅ 200 |
| `/systems-and-support` | Support subscription tiers, no prices shown. | ✅ 200 |
| `/services` | The four service areas (Marketing/SEO/Ads, Personal Assistants, Administration, Virtual Assistance). | ✅ 200 |
| `/case-studies` | RBL Safety and Radiant Moments write-ups. | ✅ 200 (contains placeholders, see §9) |
| `/about` | James's bio. | ✅ 200 |
| `/contact` | The Contact / Apply ("Book a Call") form. | ✅ 200 |
| `/contact/thank-you` | Shown after the contact form is submitted. | ✅ 200 |
| `/start` | Paid-traffic landing page. It isn't in the nav; it's for ads. | ✅ 200 |
| `/scan` | The free Quick Scan: contact details, then 20 questions, then an instant score. | ✅ 200 |
| `/assessment/[token]` | Private link a client uses to take a Full Assessment, or to view it once completed. | ✅ Northline link 200; bad token 404; CMC link 404 (expired) |
| `/proposal/[token]` | Private link where a client reads, accepts or declines a proposal. | ✅ route works (bad token 404); no proposals exist yet |
| `/login` | Client/Team login. | ✅ 200 |
| `/reset-password`, `/update-password` | Forgot-password flow, using Supabase's own email. | ✅ pages load; email delivery not tested |
| `/sitemap.xml`, `/icon`, Open Graph images | Search engine and social sharing files. | ✅ 200 |
| `www.` | Redirects to the bare domain. | ✅ 301 |

### Behind the Client/Team Login ("COMPASS")

| Route | What it does | Status |
|---|---|---|
| `/dashboard` | MRR, new MRR, software/service MRR, active subscriptions, renewals, open/overdue tickets. | Built (all figures are 0 today: no subscriptions) |
| `/crm-pipeline` (+ `/new`, `/[id]`, `/[id]/edit`) | Sales pipeline (opportunities) as a kanban board by stage. | Built |
| `/organizations` (+ `/new`, `/[id]`, `/[id]/edit`) | Client and prospect company records. | Built |
| `/organizations/[id]/…` tabs | Built tabs: Contacts, Opportunities, Assessments, Build Packages, Projects, Tasks, Meetings, Support Tickets, Subscription. | Built |
| Org tabs: KPIs, SOPs, Documents, Vendor Revenue | Show an empty "coming" placeholder. | **Placeholder only** |
| `/business-assessments` (+ `/new`, `/[id]`, `/[id]/report`) | Create and run assessments, view the internal report, view and print the client report, release pricing, override the recommendation. | Built |
| `/proposals` (+ `/[id]`, `/[id]/edit`) | Proposals generated from a completed assessment; share link; accept/decline tracking. | Built (0 proposals exist) |
| `/build-packages` (+ `/[id]`, `/[id]/edit`) | Sold build work: phases, scope items, payment status, progress. | Built (1 package: RBL) |
| `/projects` (+ `/new`, `/[id]`, `/[id]/edit`) | Delivery projects, generated one per build phase. | Built (0 projects) |
| `/tasks` (+ `/new`, `/[id]/edit`) | Task list with My Tasks / Overdue filters; syncs status with build scope items. | Built (0 tasks) |
| `/meetings` (+ `/new`, `/[id]`, `/[id]/edit`) | Meeting records: agenda, notes, decisions, action items that convert to tasks. | Built (0 meetings) |
| `/support-tickets` (+ `/new`, `/[id]`) | Support tickets with response-time deadlines and internal notes; clients can open and reply. | Built (1 test ticket) |
| `/subscriptions` (+ `/new`, `/[id]`, `/[id]/edit`) | Support subscriptions and their priced line items (where MRR comes from). | Built (0 subscriptions) |
| `/settings` | Upload the brand logo. That's the only setting. | Built (no logo uploaded; the site uses the text "VERUS" mark) |
| `/kpis` | KPI tracking. | **Placeholder only** ("Business and client performance metrics will surface here.") |
| `/sop-library` | SOP library. | **Placeholder only** |
| `/documents` | Shared documents and contracts. | **Placeholder only** |
| `/client-health` | Client health / retention scoring. | **Placeholder only** |
| `/website-funnel-builds` | Website and funnel builds list. | **Placeholder only** (still in the sidebar) |
| `/software-support` | Old stub, replaced by `/subscriptions`. | **Orphaned placeholder** (not in the nav, still reachable by URL) |

Minor: `/proposals` redirects to `/login` without remembering where you were going. That's because the public-path check treats anything starting with `/proposal` as public. The page is still protected by its own login check, so this isn't a security hole. It just doesn't return you to the page after you log in.

### API endpoints (54)

- **Public, no login:** `/api/public/scan`, `/api/public/contact`, `/api/public/assessment/[token]/…` (answer, profile, complete, clear-carried-forward) and `/api/public/proposal/[token]/accept|decline`.
- **Everything else** requires a login. Staff-only actions check the user's role on the server.
- **Code check:** every non-public route either checks the session or reads through the logged-in user's own permissions. When logged out, those reads return nothing.

---

## 2. Free Quick Scan (`/scan`), traced end to end

1. The visitor enters name, email, phone, company, industry and revenue range, then answers 20 questions (2 per category).
2. The browser sends it all to `POST /api/public/scan`. The server checks that name, company and a valid email are present and that all 20 questions are answered.
3. **Stored. Six kinds of record are created:**
   - `organizations`: new company, type "prospect", source "Website Quick Scan"; revenue range goes in notes.
   - `contacts`: the person, marked as primary owner.
   - `opportunities`: "<Company> — Quick Scan", stage **Lead**, source "website scan". It shows up in the CRM Pipeline.
   - `assessments`: a Quick Scan assessment, linked to that opportunity.
   - `assessment_answers`: one row per answer, 20 rows.
   - `assessment_category_scores`: per-category scores and bottleneck ranking. The 0–100 enterprise score and band are saved on the assessment.
4. **The visitor sees their result immediately** on the page: score, band, and category breakdown.
5. **James gets an email** via Resend, from the verusoperatingpartners.com address to James's Gmail. Subject: "New Quick Scan: <Company> — <score>/100", with contact details, score, band, top bottleneck, and a link into COMPASS.
6. **Where it stops:**
   - The visitor gets **no email**: no copy of their results and no follow-up.
   - **No automated follow-up** of any kind: no reminder, no sequence, and no task created for James.
   - The opportunity just sits at "Lead" until someone moves it by hand.
   - If the email fails, the scan is still saved; the failure is only logged.
7. **Real-world use:** exactly 1 Quick Scan exists, a test ("Notify Test Co QS", 2026-09-01, score 65). No real visitor has completed one.

## 3. Full Assessment, traced end to end

**Built: yes. Can be run: yes.**

1. **Started by staff** at `/business-assessments/new` by picking a company. It can be linked to an opportunity.
2. **Answered** one of two ways:
   - by staff inside COMPASS, or
   - by the client through a share link (`/assessment/[token]`), which staff generate, set an expiry for, and can revoke.
3. **What gets asked:**
   - A business-profile step first: financials, web presence, workforce, and portal/automation needs.
   - Then **120 questions** (12 per category × 10 categories).
   - Each answer is scored 0–3 or marked "not applicable."
4. **Saving:** answers save automatically as each one is clicked.
5. **Where answers and scores are stored:**
   - Answers go to `assessment_answers`. Each row keeps a snapshot of the question text and weight, so later edits to the question bank don't change old results.
   - Profile answers go to four tables: `assessment_financial_profiles`, `assessment_business_presence`, `assessment_workforce` and `assessment_operational_needs`.
   - On "Complete," the scores go to `assessment_category_scores` and onto the assessment row: enterprise score, band, and bottleneck ranks.
   - The build-tier and support-tier recommendation, with price and written reasoning, is also saved on the assessment row.
6. **What it produces at the end:**
   - The internal report, where staff can override the recommendation.
   - A client-facing **executive report** (`/business-assessments/[id]/report`). It's printed to PDF with the browser's own "Save as PDF"; there's no PDF generator in the app. Pricing is hidden until staff click "Release pricing."
   - One-click **Proposal** generation.
   - One-click **Build Package** creation.
7. **Not built:**
   - **Payment.** The $2,500 fee isn't collected anywhere. There's a `price_paid` field in the database, but nothing in the app ever fills it in.
   - **Notification.** Nobody is emailed when a client finishes a Full Assessment through the share link.
8. **Real-world use:**
   - **Northline Mechanical:** completed, score 45. This is the fictional demo company used for website screenshots.
   - **CMC Property Services LLC:** draft, 0 answers, link expired 2026-09-27.
   - The real RBL Safety assessment has been deleted (see headline finding 3).
   - The 4 profile tables have **0 rows**: Northline's assessment was completed without the profile step.

## 4. Contact / Book a Call form (`/contact`)

All "Book a Call" buttons on the site go to this form. **There is no calendar booking.** It's an application form, not a scheduler.

1. **Fields:**
   - About you: name, email, phone.
   - About your business: company, website, industry, revenue range, employee count.
   - What you need: biggest problem, what you want built, timeline.
2. The form posts to `POST /api/public/contact`. Name, company and a valid email are required.
3. **Stored. Three records are created:**
   - `organizations`: prospect, source "website"; revenue range goes in notes.
   - `contacts`: the person, as primary owner.
   - `opportunities`: "<Company> — Website Inquiry", stage **Lead**. "Biggest problem" goes to pain points, "what you want built" to business goals, and timeline to notes. Next action is set to "Follow up on website inquiry."
4. **James gets an email** via Resend: "New website inquiry: <Company>", with every field and a link to the company in COMPASS.
5. The visitor lands on `/contact/thank-you`, which points them to the Quick Scan.
6. **Where it stops:**
   - The visitor gets **no confirmation email**.
   - **No call is booked.**
   - **No automated follow-up**, and **no task** is created. The "next action" is a text field only; nothing reminds anyone.
7. **Real-world use:** 1 submission exists, a test ("Notify Test Co Contact", 2026-09-01). No real inquiries.

## 5. Database tables

39 tables, all in the app's Supabase Postgres. "Newest" is the most recent creation (or update) date. **Written?** means data has actually been written to the table in practice.

| Table | Holds | Rows | Newest | Written? |
|---|---|---|---|---|
| `app_settings` | Logo setting (one row) | 1 | 2026-08-27 | Yes (logo currently empty) |
| `organizations` | Companies (prospects/clients) | 6 | 2026-09-01 | **Yes**: Quick Scan, Contact form, staff |
| `contacts` | People at companies | 4 | 2026-09-01 | **Yes**: Quick Scan, Contact form, staff |
| `opportunities` | Pipeline deals | 3 | 2026-09-01 | **Yes**: Quick Scan, Contact form, staff |
| `opportunity_stage_history` | Log of pipeline stage moves | 8 | 2026-08-25 | Yes |
| `profiles` | Login accounts and roles | 3 | 2026-09-01 | Yes |
| `assessment_categories` | The 10 categories and weights (setup data) | 10 | 2026-08-25 | Setup only |
| `assessment_bands` | The 5 score bands (setup data) | 5 | 2026-08-25 | Setup only |
| `assessment_questions` | 120-question bank (setup data) | 120 | 2026-08-25 | Setup only |
| `assessments` | Each assessment taken | 3 | 2026-09-01 | **Yes** |
| `assessment_answers` | Each answer | 140 | 2026-09-01 | **Yes** |
| `assessment_category_scores` | Per-category scores and rank | 20 | 2026-09-01 | **Yes** |
| `assessment_financial_profiles` | Financials captured in a Full Assessment | 0 | — | Never |
| `assessment_business_presence` | Web/social presence captured | 0 | — | Never |
| `assessment_workforce` | Staffing captured | 0 | — | Never |
| `assessment_operational_needs` | Portal/automation needs captured | 0 | — | Never |
| `proposals` | Generated proposals | 0 | — | Never |
| `build_packages` | Sold builds | 1 | 2026-08-30 | Yes (RBL) |
| `build_package_phases` | Phases of a build | 4 | 2026-08-30 | Yes |
| `build_package_scope_items` | Deliverables in each phase | 15 | 2026-08-30 | Yes (none started) |
| `projects` | Delivery projects | 0 | — | Never |
| `tasks` | Tasks | 0 | — | Never |
| `meetings` | Meeting records | 0 | — | Never |
| `meeting_attendees` | Who attended | 0 | — | Never |
| `meeting_action_items` | Action items | 0 | — | Never |
| `subscriptions` | Support subscriptions | 0 | — | Never |
| `subscription_line_items` | Priced items (MRR source) | 0 | — | Never |
| `support_tickets` | Support requests | 1 | 2026-09-01 | Yes (test only) |
| `support_ticket_replies` | Ticket replies and internal notes | 1 | 2026-09-01 | Yes (test only) |
| `revenue_transactions` | Money ledger | 0 | — | **No code writes to it** |
| `vendor_agreements` | Referral/vendor deals | 0 | — | **No UI** |
| `vendor_revenue_events` | Vendor commissions | 0 | — | **No UI** |
| `kpi_definitions` | KPI definitions | 0 | — | **No UI** |
| `kpi_values` | KPI values over time | 0 | — | **No UI** |
| `sops` | Internal SOP library | 0 | — | **No UI** |
| `client_sop_deliverables` | SOPs delivered to clients | 0 | — | **No UI** |
| `documents` | Files/contracts | 0 | — | **No UI** |
| `client_health_scores` | Client health scoring | 0 | — | **No UI** |
| `communication_log` | Calls/emails/notes log | 0 | — | **No UI** (only referenced when deleting a company) |

Also: the `brand` file-storage bucket holds **0 files**.

**Nothing has been written to any table since 2026-09-01.**

## 6. Does it exist?

| Capability | Verdict | Notes |
|---|---|---|
| Leads / contacts list | **BUILT AND WORKING** | Website leads land as organizations + contacts + "Lead" opportunities. Only test leads so far. |
| CRM / pipeline | **BUILT AND WORKING** | `/crm-pipeline` kanban with full stage history. |
| Client records | **BUILT AND WORKING** | `/organizations` with tabs. Four tabs (KPIs, SOPs, Documents, Vendor Revenue) are placeholders. |
| Proposal generator | **BUILT AND WORKING** | From a completed Full Assessment, with share link and online accept/decline. **Never used.** "Send" only marks it sent; it **does not email** the proposal. |
| Invoicing | **DOES NOT EXIST** | Build packages track deposit/balance paid by hand-ticked checkboxes. No invoices, no payment collection, and the money ledger table is never written. |
| MRR tracking | **BUILT AND WORKING** | Subscriptions with line items; dashboard MRR figures. 0 subscriptions, so MRR shows $0. |
| Email sending | **BUILT AND WORKING** | Resend: Quick Scan alert, Contact alert, new support ticket alert (to James), and staff ticket reply (to the client). Key valid, domain verified. |
| Automated follow-up | **DOES NOT EXIST** | No sequences, reminders or scheduled jobs. Visitors get no emails at all. |
| Task management | **BUILT AND WORKING** | `/tasks` and `/projects`, plus meeting action items that convert to tasks. Never used. |

## 7. Behind the Client/Team Login

**Accounts:** 3 exist.

| Login email | Role | Company | Last sign-in | Notes |
|---|---|---|---|---|
| jamesvanceofficial@gmail.com | verus_admin | — | 2026-10-14 | James, the real admin account |
| notifytest.staff.1788229667@example.com | verus_staff | — | 2026-09-01 | **Leftover test account** |
| notifytest.client.1788229667@example.com | client_owner | Notify Test Co Support | 2026-09-01 | **Leftover test account.** Profile email is `jamesvanceofficial+notifytest@gmail.com` (doesn't match) |

**There's no sign-up page and no "invite user" screen.** Accounts can only be created directly in the database or in Supabase.

**Staff (admin or staff role):**

- **Can reach:** every page in §1 under the login.
- **Can do:** create, edit and delete companies, contacts, opportunities, assessments, proposals, build packages, projects, tasks, meetings, subscriptions and tickets; run assessments; generate share links; release pricing; generate proposals and build packages; upload the logo.

**Client (client_owner / client_user role):**

- **Navigation:** sees the **same full sidebar** as staff, because per-role navigation was never built.
- **What they see:** the database only ever returns their own company's data. Most pages are empty or read-only for them.
- **What they can do:** read their own records, and open and reply to support tickets for their own company. Nothing else; every other change is staff-only.

## 8. Outside services

| Service | Used for | Working? |
|---|---|---|
| **Supabase** (database, logins, file storage) | Everything | ✅ Working: live queries succeed and pages render from the database. |
| **Resend** (email) | Lead, Quick Scan and ticket notifications | ✅ Configured and the key is valid; verusoperatingpartners.com is **verified** (since 2026-09-01). Resend only keeps about 30 days of history: it shows **no VERUS-site emails since 2026-10-02**, which matches there being no submissions. Note: this Resend account is shared with your other businesses' apps. |
| **Supabase Auth email** | Password-reset emails | Configured by Supabase. **Not tested** (testing it would send an email). |
| **Google Fonts** (via Next.js) | Fonts, downloaded at build time | ✅ Working |
| **Traefik** (on this server) | HTTPS and routing | ✅ Working (200s, www → bare-domain redirect) |
| Payments (Stripe etc.) | — | **None connected** |
| Calendar / booking (Calendly etc.) | — | **None connected** |
| Analytics / tracking | — | **None connected.** No traffic or conversion data exists anywhere. |

## 9. Half-built, stubbed, or placeholder

**Pages that are placeholders only** (just an empty-state message):

- `/kpis`
- `/sop-library`
- `/documents`
- `/client-health`
- `/website-funnel-builds`
- `/software-support` (orphaned and not in the nav, but still reachable by URL)
- Organization tabs: KPIs, SOPs, Documents, Vendor Revenue

**Tables with no UI at all:** `revenue_transactions`, `vendor_agreements`, `vendor_revenue_events`, `kpi_definitions`, `kpi_values`, `sops`, `client_sop_deliverables`, `documents`, `client_health_scores`, `communication_log`.

**Visible placeholder text:**

- `/case-studies` shows **"[Client quote to be added]"** on both case studies (RBL Safety, Radiant Moments).
- The client report's back page uses a placeholder contact block (`VERUS_CONTACT` in `reportCopy.ts`): company name, domain, and "Schedule a call at verusoperatingpartners.com." There's no real phone or email anywhere.
- The home page services cards are deliberately text-only "until real screenshots are supplied."

**Half-built behaviour:**

- **"Book a Call"** is a form, not a booking. Nothing schedules a call.
- **Proposal "Send"** marks the proposal as sent but doesn't email it. Staff must copy the share link and send it by hand. James isn't notified when a client accepts or declines.
- **The $2,500 assessment fee** is never collected or recorded (`price_paid` is never set).
- **Build package payments** are hand-ticked checkboxes, with no invoice behind them.
- **Old recommendation text:** completed assessments keep the pricing text from when they were finished. It doesn't refresh when pricing config changes; known and documented.
- **No per-role sidebar:** clients see staff navigation items.
- **No user management:** no sign-up and no invite screen.
- **No visitor-facing email** of any kind: no scan results, no confirmation.
- **The dashboard** has real MRR and ticket figures, but the rest of the "single view of every deal, client, and system" isn't built.

**Stale or leftover data:**

- **Stage 36 test data:**
  - Companies "Notify Test Co QS", "Notify Test Co Contact", "Notify Test Co Support"
  - Their contacts, opportunities and Quick Scan assessment
  - The test support ticket and its reply
  - The two `notifytest` logins
- **RBL Safety:** the build package ($22,500, "sold") points to an assessment that no longer exists, and its opportunity is named "James Vance Test" at stage "assessment_sold."
- **CMC Property Services:** the draft assessment has 0 answers and an expired share link (2026-09-27).
- **CLAUDE.md is out of date:** it still describes RBL Safety's Full Assessment as existing.
