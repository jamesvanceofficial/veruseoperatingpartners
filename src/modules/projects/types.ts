import type { ProjectStatus, Priority } from "./labels";

export type Project = {
  id: string;
  org_id: string;
  build_package_id: string | null;
  build_package_phase_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  owner: string | null;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectListRow = {
  id: string;
  org_id: string;
  orgName: string;
  name: string;
  status: ProjectStatus;
  priority: Priority;
  ownerName: string | null;
  due_date: string | null;
  /** completed / total tasks, 0 when the project has no tasks. Computed at read time, never stored. */
  completionPct: number;
};

export type ProjectDetail = {
  project: Project;
  orgName: string;
  ownerName: string | null;
  categoryName: string | null;
  buildPackageTierLabel: string | null;
  phaseName: string | null;
  tasks: import("@/modules/tasks/types").Task[];
  completionPct: number;
};
