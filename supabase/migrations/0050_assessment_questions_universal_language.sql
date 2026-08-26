-- Rewords the questions that assumed a specific kind of business (physical
-- inventory, shipping, a storefront) to measure the same underlying
-- process-maturity signal in industry-neutral language. Text only — same
-- category, weight, is_quick_scan flag, and 4-option 0/1/2/3 answer scale
-- for every one of these.

update public.assessment_questions set question_text =
  'Is there a clear, written process for how a job or order moves from "started" to "finished"?'
  where id = 'e4edba69-43ee-4ec3-8183-0b3461cd6038';

update public.assessment_questions set question_text =
  'Is there a defined process for recurring purchasing — the things you buy or reorder again and again — or does someone just "handle it"?'
  where id = 'db07d574-6963-4da4-ba14-7686faf85aff';

update public.assessment_questions set question_text =
  'Do you have a checklist or process for quality control before work reaches the customer?'
  where id = 'db7ec233-925c-4326-9e2b-d60e4e46d72f';

update public.assessment_questions set question_text =
  'Is there a documented routine for how your team starts and wraps up each work day?'
  where id = '5e4d6b2a-f02b-448e-bc92-1f3db7c7fe52';

update public.assessment_questions set question_text =
  'Do you have a written process for handling a refund, a cancellation, or a customer wanting to undo something already purchased?'
  where id = '9e4fa828-8b87-43a1-b3bc-00015730b669';

update public.assessment_questions set question_text =
  'Is there a system that alerts you automatically when something needs attention — a task overdue, a lead going cold, an invoice unpaid, that kind of thing?'
  where id = '6e272b3d-bdfe-4004-98b6-6fa8eab2d664';
