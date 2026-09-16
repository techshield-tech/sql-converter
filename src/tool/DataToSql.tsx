// Mode 2: turn CSV or a JSON array of objects into CREATE TABLE + INSERT
// statements. Tool-specific.

import { useCallback, useEffect, useState } from 'react';
import { Button, CopyButton, ErrorBox, Panel, Select, TextArea, Toolbar } from '@mmoall/tool-kit';
import type { SelectOption } from '@mmoall/tool-kit';
import { DATA_SQL_DIALECTS, getDataSqlDialect } from './data-sql-dialects';
import { detectDataFormat, type DataSourceFormat } from './data-parse';
import { generateSqlFromData } from './data-to-sql';
import { SAMPLE_CSV, SAMPLE_JSON } from './sample';
import { Notice } from './Notice';

type FormatChoice = DataSourceFormat | 'auto';

const FORMAT_OPTIONS: SelectOption[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON array' },
];

const DIALECT_OPTIONS: SelectOption[] = DATA_SQL_DIALECTS.map((dialect) => ({
  value: dialect.value,
  label: dialect.label,
}));

const DEFAULT_BATCH_SIZE = 500;

export function DataToSql() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState<FormatChoice>('auto');
  const [tableName, setTableName] = useState('my_table');
  const [dialectValue, setDialectValue] = useState(DATA_SQL_DIALECTS[0].value);
  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
  const [output, setOutput] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const runGenerate = useCallback(async () => {
    if (input.trim() === '') {
      setOutput('');
      setSummary(null);
      setError(null);
      return;
    }
    setIsGenerating(true);
    try {
      const resolvedFormat = format === 'auto' ? detectDataFormat(input) : format;
      const dialect = getDataSqlDialect(dialectValue);
      const result = await generateSqlFromData({
        raw: input,
        format: resolvedFormat,
        tableName,
        dialect,
        batchSize,
      });
      setOutput(result.sql);
      setSummary(
        `Detected ${resolvedFormat.toUpperCase()} · ${result.columns.length} column${result.columns.length === 1 ? '' : 's'} · ${result.rowCount} row${result.rowCount === 1 ? '' : 's'}`,
      );
      setError(null);
    } catch (err) {
      setOutput('');
      setSummary(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  }, [input, format, tableName, dialectValue, batchSize]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        void runGenerate();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runGenerate]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setSummary(null);
    setError(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(format === 'json' ? SAMPLE_JSON : SAMPLE_CSV);
    setOutput('');
    setSummary(null);
    setError(null);
  }, [format]);

  return (
    <div className="flex flex-col gap-4">
      <Notice>
        Column types (integer, float, boolean, date/timestamp, text) are inferred by sampling every
        row's values in each column. Review the generated CREATE TABLE before relying on it.
      </Notice>

      <Toolbar>
        <Select
          aria-label="Input format"
          value={format}
          onChange={(event) => setFormat(event.target.value as FormatChoice)}
          options={FORMAT_OPTIONS}
        />
        <Select
          aria-label="Target SQL dialect"
          value={dialectValue}
          onChange={(event) => setDialectValue(event.target.value)}
          options={DIALECT_OPTIONS}
        />
        <label className="flex items-center gap-1.5 text-sm text-[var(--color-fg)]">
          Table
          <input
            type="text"
            aria-label="Table name"
            value={tableName}
            onChange={(event) => setTableName(event.target.value)}
            className="w-28 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-[var(--color-fg)]">
          Rows/INSERT
          <input
            type="number"
            aria-label="Rows per INSERT statement"
            min={1}
            value={batchSize}
            onChange={(event) => setBatchSize(Math.max(1, Math.floor(Number(event.target.value)) || 1))}
            className="w-20 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <Button variant="primary" onClick={() => void runGenerate()} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Generate SQL'}
        </Button>
        <Button variant="ghost" onClick={handleLoadSample}>
          Load sample
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      </Toolbar>

      {error && <ErrorBox>{error}</ErrorBox>}
      {summary && !error && <p className="text-xs text-[var(--color-muted)]">{summary}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Input data (CSV or JSON array)">
          <TextArea
            aria-label="CSV or JSON data input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste CSV or a JSON array of objects here…"
            className="min-h-[240px]"
          />
        </Panel>

        <Panel title="Generated SQL" actions={<CopyButton getText={() => output} />}>
          <TextArea
            aria-label="Generated SQL output"
            value={output}
            readOnly
            placeholder="CREATE TABLE and INSERT statements will appear here…"
            className="min-h-[240px]"
          />
        </Panel>
      </div>
    </div>
  );
}
