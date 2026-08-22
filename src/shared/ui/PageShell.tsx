export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div>
        <h1 className="text-[19px] font-semibold text-[var(--cream)]">{title}</h1>
        <p className="text-[12.5px] text-[var(--muted)]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
