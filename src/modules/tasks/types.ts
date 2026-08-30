import type { TaskStatus, Priority } from "./labels";

export type Task = {
  id: string;
  project_id: string | null;
  org_id: string | null;
  title: string;
  description: string | null;
  assignee: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  /** Set when this task was generated from a build package's scope item — see updateTaskStatus()/updateScopeItemStatus() for the two-way status sync this drives. */
  scope_item_id: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskListRow = Task & {
  orgName: string | null;
  projectName: string | null;
  assigneeName: string | null;
};
