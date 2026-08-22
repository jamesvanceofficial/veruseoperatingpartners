import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="glass-panel fade-scale-in flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h3 className="text-[14px] font-semibold text-[var(--cream)]">{title}</h3>
      {description ? <p className="max-w-sm text-[12.5px] text-[var(--muted)]">{description}</p> : null}
      {actionLabel ? (
        <Button variant="primary" className="mt-2" onClick={onAction} disabled={!onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
