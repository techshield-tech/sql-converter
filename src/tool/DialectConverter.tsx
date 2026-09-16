// Mode 1: parse SQL with a source dialect and regenerate it for a target
// dialect (node-sql-parser, lazy-loaded). Tool-specific.

import { useCallback, useEffect, useState } from 'react';
import { Button, CopyButton, ErrorBox, Panel, Select, TextArea, Toolbar } from '@mmoall/tool-kit';
import { CONVERTER_DIALECTS } from './dialects';
import { convertSqlDialect } from './sql-dialect-convert';
import { SAMPLE_SQL } from './sample';
import { Notice } from './Notice';

export function DialectConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sourceDialect, setSourceDialect] = useState('mysql');
  const [targetDialect, setTargetDialect] = useState('postgresql');
  const [isConverting, setIsConverting] = useState(false);

  const runConvert = useCallback(async () => {
    if (input.trim() === '') {
      setOutput('');
      setError(null);
      return;
    }
    setIsConverting(true);
    try {
      const result = await convertSqlDialect(input, sourceDialect, targetDialect);
      setOutput(result.sql);
      setError(null);
    } catch (err) {
      setOutput('');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConverting(false);
    }
  }, [input, sourceDialect, targetDialect]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        void runConvert();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runConvert]);

  const handleSwapDialects = useCallback(() => {
    setSourceDialect(targetDialect);
    setTargetDialect(sourceDialect);
  }, [sourceDialect, targetDialect]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_SQL);
    setOutput('');
    setError(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Notice>
        Dialect conversion is best-effort: your SQL is re-parsed and regenerated for the target
        dialect, so highly dialect-specific features (proprietary functions, non-standard syntax) may
        not translate perfectly. Always review the output before running it.
      </Notice>

      <Toolbar>
        <Select
          aria-label="Source dialect"
          value={sourceDialect}
          onChange={(event) => setSourceDialect(event.target.value)}
          options={CONVERTER_DIALECTS}
        />
        <Button
          variant="ghost"
          onClick={handleSwapDialects}
          aria-label="Swap source and target dialects"
          title="Swap source and target dialects"
        >
          ⇄
        </Button>
        <Select
          aria-label="Target dialect"
          value={targetDialect}
          onChange={(event) => setTargetDialect(event.target.value)}
          options={CONVERTER_DIALECTS}
        />
        <Button variant="primary" onClick={() => void runConvert()} disabled={isConverting}>
          {isConverting ? 'Converting…' : 'Convert'}
        </Button>
        <Button variant="ghost" onClick={handleLoadSample}>
          Load sample
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      </Toolbar>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Input SQL">
          <TextArea
            aria-label="Source SQL input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste SQL here…"
            className="min-h-[240px]"
          />
        </Panel>

        <Panel title="Output SQL" actions={<CopyButton getText={() => output} />}>
          <TextArea
            aria-label="Converted SQL output"
            value={output}
            readOnly
            placeholder="Converted SQL will appear here…"
            className="min-h-[240px]"
          />
        </Panel>
      </div>
    </div>
  );
}
