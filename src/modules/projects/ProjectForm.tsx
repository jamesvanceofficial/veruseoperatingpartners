"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from "./labels";
import type { Project } from "./types";
import type { StaffOption, OrgOption } from "@/modules/organizations/types";

export function ProjectForm({
  mode,
  project,
  orgOptions,
  lockedOrg,
  staffOptions,
  initialBuildPackageOptions,
  initialPhaseOptions,
}: {
  mode: "create" | "edit";
  project?: Project;
  orgOptions: OrgOption[];
  lockedOrg?: { id: string; name: string };
  staffOptions: StaffOption[];
  initialBuildPackageOptions: { id: string; label: string }[];
  initialPhaseOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState(lockedOrg?.id ?? project?.org_id ?? "");
  const [buildPackageOptions, setBuildPackageOptions] = useState(initialBuildPackageOptions);
  const [buildPackageId, setBuildPackageId] = useState(project?.build_package_id ?? "");
  const [phaseOptions, setPhaseOptions] = useState(initialPhaseOptions);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOrgChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newOrgId = e.target.value;
    setOrgId(newOrgId);
    setBuildPackageId("");
    setPhaseOptions([]);
    if (!newOrgId) {
      setBuildPackageOptions([]);
      return;
    }
    setLoadingChildren(true);
    try {
      const res = await fetch(`/api/organizations/${newOrgId}/build-packages`);
      const payload = await res.json().catch(() => ({ data: [] }));
      setBuildPackageOptions(res.ok ? (payload.data ?? []) : []);
    } catch {
      setBuildPackageOptions([]);
    } finally {
      setLoadingChildren(false);
    }
  }

  async function handleBuildPackageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newBuildPackageId = e.target.value;
    setBuildPackageId(newBuildPackageId);
    if (!newBuildPackageId) {
      setPhaseOptions([]);
      return;
    }
    setLoadingChildren(true);
    try {
      const res = await fetch(`/api/build-packages/${newBuildPackageId}/phases`);
      const payload = await res.json().catch(() => ({ data: [] }));
      setPhaseOptions(res.ok ? (payload.data ?? []) : []);
    } catch {
      setPhaseOptions([]);
    } finally {
      setLoadingChildren(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      orgId: String(form.get("orgId") ?? ""),
      buildPackageId: String(form.get("buildPackageId") ?? ""),
      buildPackagePhaseId: String(form.get("buildPackagePhaseId") ?? ""),
      owner: String(form.get("owner") ?? ""),
      priority: String(form.get("priority") ?? ""),
      status: String(form.get("status") ?? ""),
      startDate: String(form.get("startDate") ?? ""),
      dueDate: String(form.get("dueDate") ?? ""),
    };

    const url = mode === "create" ? "/api/projects" : `/api/projects/${project!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      const id = mode === "create" ? payload.data.id : project!.id;
      router.push(`/projects/${id}`);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Project name" htmlFor="name">
            <Input id="name" name="name" required defaultValue={project?.name ?? ""} />
          </FormField>

          {lockedOrg ? (
            <FormField label="Organization" htmlFor="orgId_display">
              <Input id="orgId_display" value={lockedOrg.name} disabled />
              <input type="hidden" name="orgId" value={lockedOrg.id} />
            </FormField>
          ) : (
            <FormField label="Organization" htmlFor="orgId">
              <Select id="orgId" name="orgId" required value={orgId} onChange={handleOrgChange}>
                <option value="">Select an organization…</option>
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Build package" htmlFor="buildPackageId" hint={loadingChildren ? "Loading…" : "Optional — links this project to a signed build package."}>
            <Select key={orgId} id="buildPackageId" name="buildPackageId" value={buildPackageId} onChange={handleBuildPackageChange}>
              <option value="">None</option>
              {buildPackageOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Phase" htmlFor="buildPackagePhaseId" hint="Optional — which phase of the build package this project delivers.">
            <Select key={buildPackageId} id="buildPackagePhaseId" name="buildPackagePhaseId" defaultValue={project?.build_package_phase_id ?? ""}>
              <option value="">None</option>
              {phaseOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Owner" htmlFor="owner">
            <Select id="owner" name="owner" defaultValue={project?.owner ?? ""}>
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name ?? s.email ?? "Unnamed"}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" required defaultValue={project?.priority ?? "medium"}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" required defaultValue={project?.status ?? "not_started"}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Start date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={project?.start_date ?? ""} />
          </FormField>

          <FormField label="Due date" htmlFor="dueDate">
            <Input id="dueDate" name="dueDate" type="date" defaultValue={project?.due_date ?? ""} />
          </FormField>
        </div>

        <FormField label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
