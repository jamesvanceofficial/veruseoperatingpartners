"use client";

import { Button } from "./Button";

export function PrintButton({ children = "Print" }: { children?: React.ReactNode }) {
  return (
    <Button type="button" variant="secondary" className="no-print" onClick={() => window.print()}>
      {children}
    </Button>
  );
}
