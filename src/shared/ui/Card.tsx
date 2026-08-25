import { cn } from "./cn";

export function Card({
  children,
  className,
  strong,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div className={cn(strong ? "glass-panel-strong" : "glass-panel", "fade-scale-in p-6", className)}>
      {children}
    </div>
  );
}
