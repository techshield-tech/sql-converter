// Small neutral (non-alarming) info banner, distinct from shell/ui.tsx's
// ErrorBox which is styled for actual errors. Tool-specific.

import type { ReactNode } from 'react';

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-muted)]">
      {children}
    </div>
  );
}
