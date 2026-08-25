-- assessment_bands.description existed since Stage 3 (migration 0013) but
-- was never populated. The quick-scan result page pulls the plain-
-- language "what this band means" sentence from here rather than
-- hardcoding it in a component.
update public.assessment_bands set description =
  'Your business runs almost entirely on you. If you stepped away for even a few weeks, most of it would stop functioning — this is the most common stage, and the most fragile.'
  where label = 'Founder Dependent';

update public.assessment_bands set description =
  'Some real structure is starting to exist, but it is inconsistent. A handful of things are documented and repeatable, but most of the business still depends on people remembering how it works.'
  where label = 'Emerging Operator';

update public.assessment_bands set description =
  'Real systems now run a majority of the business. Things keep moving without you in the room most of the time, though a few key areas still depend heavily on specific people.'
  where label = 'Growth Company';

update public.assessment_bands set description =
  'Your business runs on documented, repeatable systems more than on any one person — including you. This is what makes a business scalable, sellable, and resilient.'
  where label = 'System-Driven Company';

update public.assessment_bands set description =
  'Your business operates like a mature enterprise: documented, systemized, and not dependent on any single person, including the owner. Very few businesses reach this tier.'
  where label = 'Enterprise Ready';
