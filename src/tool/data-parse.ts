// Parses CSV or a JSON array of objects into a flat row/column shape the
// Data → SQL generator can consume. Tool-specific.
//
// papaparse is lazy-loaded (dynamic import) so it never lands in the initial
// bundle. Verified against node_modules/@types/papaparse's ParseConfig<T> and
// ParseResult<T> (papaparse@5.7.0): `Papa.parse(csvString, { header: true,
// skipEmptyLines: true })` parses synchronously (no `download`/`worker`
// option set) and returns `{ data, errors, meta: { fields } }`.

import type { ParseResult } from 'papaparse';
import { collectColumnNames } from './data-infer';

export type DataSourceFormat = 'csv' | 'json';

export interface ParsedRows {
  rows: Array<Record<string, unknown>>;
  columnNames: string[];
}

/** Best-effort guess at whether `raw` is JSON or CSV, for the "Auto" option. */
export function detectDataFormat(raw: string): DataSourceFormat {
  const trimmed = raw.trim();
  return trimmed.startsWith('[') || trimmed.startsWith('{') ? 'json' : 'csv';
}

async function parseCsv(raw: string): Promise<ParsedRows> {
  const { parse } = await import('papaparse');
  const result: ParseResult<Record<string, string>> = parse(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    const where = typeof first.row === 'number' ? ` (row ${first.row + 1})` : '';
    throw new Error(`CSV parse error: ${first.message}${where}`);
  }
  if (result.data.length === 0) {
    throw new Error('No data rows found. The first CSV row is used as the header.');
  }

  const columnNames = result.meta.fields ?? collectColumnNames(result.data);
  return { rows: result.data, columnNames };
}

function parseJson(raw: string): ParsedRows {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse error: ${message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of objects, e.g. [{"id": 1, "name": "Ada"}].');
  }
  if (parsed.length === 0) {
    throw new Error('The JSON array is empty — nothing to convert.');
  }
  if (!parsed.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    throw new Error('Every item in the JSON array must be an object, e.g. {"id": 1, "name": "Ada"}.');
  }

  const rows = parsed as Array<Record<string, unknown>>;
  return { rows, columnNames: collectColumnNames(rows) };
}

/** Parses `raw` as either CSV or a JSON array of objects. */
export async function parseData(raw: string, format: DataSourceFormat): Promise<ParsedRows> {
  if (raw.trim() === '') {
    throw new Error('Paste some CSV or JSON data first.');
  }
  return format === 'csv' ? parseCsv(raw) : parseJson(raw);
}
