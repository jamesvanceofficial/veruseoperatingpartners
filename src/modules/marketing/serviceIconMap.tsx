import { MarketingIcon, PersonalAssistantIcon, AdministrationIcon, VirtualAssistanceIcon } from "./ServiceIcons";

/** Slug → diagram for each ServiceArea, kept next to the icons so services.ts stays a plain data module (no JSX). */
export const SERVICE_ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  marketing: MarketingIcon,
  "personal-assistants": PersonalAssistantIcon,
  administration: AdministrationIcon,
  "virtual-assistance": VirtualAssistanceIcon,
};
