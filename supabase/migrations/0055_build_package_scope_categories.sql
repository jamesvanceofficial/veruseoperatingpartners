-- Stage 9 follow-up — an audit of a real generated build package found
-- nearly every scope item landing on "software" by default. Widens
-- scope_category to distinguish deliverable types that were all
-- collapsing into one bucket, and re-categorizes every already-generated
-- scope item by its exact, known description text — see
-- categorizeScopeItem() in src/modules/buildPackages/generatePlan.ts for
-- the same mapping every future package is generated with. "support" is
-- dropped: no deliverable text this app has ever generated matched it.

alter table public.build_package_scope_items
  drop constraint build_package_scope_items_category_check;

alter table public.build_package_scope_items
  add constraint build_package_scope_items_category_check
    check (scope_category in (
      'website', 'software', 'systems_process', 'sop_documents',
      'automation', 'dashboards_reporting', 'people_hiring',
      'training_handover', 'portal'
    ));

update public.build_package_scope_items set scope_category = 'people_hiring' where description in (
  'Written job descriptions for every role',
  'A repeatable hiring pipeline',
  'A structured onboarding track for new hires',
  'A regular performance review cadence'
);

update public.build_package_scope_items set scope_category = 'training_handover' where description in (
  'Train the team on the new systems',
  'Hand over'
);

update public.build_package_scope_items set scope_category = 'systems_process' where description in (
  'Confirm scope',
  'Map current state',
  'Gather access and information',
  'Agree on success measures',
  'Workflow mapping across core operations',
  'Quality checkpoints built into the workflow',
  'A regular leadership meeting cadence with a standing agenda',
  'A communication process for company updates',
  'A sales-to-fulfillment handoff process',
  'Employee access provisioning and deprovisioning process',
  'Update and patching schedule',
  'Consistent brand applied across channels',
  'A regular cadence to revisit and update the plan',
  'An org structure that doesn''t route every decision through the owner',
  'Scope defined individually based on the client''s needs'
);

update public.build_package_scope_items set scope_category = 'automation' where description in (
  'Connected data flow between core tools — no duplicate entry',
  'Automated alerts for what needs attention',
  'Lead follow-up sequences',
  'A content and posting calendar',
  'A follow-up sequence for leads who aren''t ready to buy'
);

update public.build_package_scope_items set scope_category = 'dashboards_reporting' where description in (
  'A leadership scorecard to track what matters',
  'Monthly P&L review rhythm',
  'Margin visibility by product or service line',
  'A working budget tracked against actuals',
  'Lead-source tracking tied to actual customers'
);

update public.build_package_scope_items set scope_category = 'portal' where description in (
  'Portal access and permissions setup',
  'Defining what each user type can see',
  'Login and account management',
  'Data walls that keep one customer''s information separate from another''s'
);

-- Everything else (already-correct "software"/"sop_documents" items like
-- "The system those processes run inside" or "Document everything," and
-- any generated "<task> automation" line, which already matched the old
-- automation rule) is untouched — only the genuinely miscategorized rows
-- above are rewritten.
