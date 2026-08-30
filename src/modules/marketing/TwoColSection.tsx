import { cn } from "@/shared/ui/cn";

/** The asymmetric visual+text section every alternating layout is built from — visual left, text right, or reversed. Never centered. */
export function TwoColSection({
  visual,
  reverse = false,
  className,
  children,
}: {
  visual: React.ReactNode;
  reverse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16", className)}>
      <div className={cn(reverse && "lg:order-2")}>{visual}</div>
      <div className={cn("flex flex-col gap-4", reverse && "lg:order-1")}>{children}</div>
    </div>
  );
}
