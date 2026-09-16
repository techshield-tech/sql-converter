import { useState } from 'react';
import { DialectConverter } from './DialectConverter';
import { DataToSql } from './DataToSql';

type Mode = 'dialect' | 'data';

const TABS: { mode: Mode; label: string }[] = [
  { mode: 'dialect', label: 'Dialect Conversion' },
  { mode: 'data', label: 'Data → SQL' },
];

export function Tool() {
  const [mode, setMode] = useState<Mode>('dialect');

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Conversion mode"
        className="flex flex-wrap gap-1 border-b border-[var(--color-border)]"
      >
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            type="button"
            role="tab"
            aria-selected={mode === tab.mode}
            onClick={() => setMode(tab.mode)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              mode === tab.mode
                ? 'border-[var(--color-accent)] text-[var(--color-fg)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'dialect' ? <DialectConverter /> : <DataToSql />}
    </div>
  );
}
