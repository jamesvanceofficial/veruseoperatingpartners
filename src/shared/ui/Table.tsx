import { cn } from "./cn";

export type TableColumn<T> = {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
};

export function Table<T extends { id: string }>({ columns, rows }: { columns: TableColumn<T>[]; rows: T[] }) {
  return (
    <div className="glass-panel overflow-hidden">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-[var(--hairline)]">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn("section-label px-5 py-3", c.align === "right" ? "text-right" : "text-left")}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="row-hover-lift border-b border-[var(--hairline)] last:border-0">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-5 py-3", c.align === "right" ? "text-right font-tabular" : "text-left")}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
