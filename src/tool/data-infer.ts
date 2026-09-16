// Pure, framework-free column type inference for the Data → SQL generator.
// Tool-specific.

export type ColumnType = 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'DATE' | 'TIMESTAMP' | 'TEXT';

export interface InferredColumn {
  name: string;
  type: ColumnType;
  /** True if any sampled value for this column was null/missing/empty. */
  nullable: boolean;
}

const INTEGER_RE = /^[+-]?\d+$/;
const FLOAT_RE = /^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
const BOOLEAN_STRINGS = new Set(['true', 'false']);

type ValueKind = ColumnType | 'NULL';

/**
 * Treats `null`, `undefined`, and `''` as "no value". An empty string is the
 * only way a CSV cell can represent a missing value, so it's treated the
 * same as JSON `null` for both type inference and NULL rendering.
 */
function isNullish(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function classifyValue(value: unknown): ValueKind {
  if (isNullish(value)) return 'NULL';
  if (typeof value === 'boolean') return 'BOOLEAN';
  if (typeof value === 'number') {
    return Number.isFinite(value) && Number.isInteger(value) ? 'INTEGER' : 'FLOAT';
  }

  const str = String(value).trim();
  if (BOOLEAN_STRINGS.has(str.toLowerCase())) return 'BOOLEAN';
  if (INTEGER_RE.test(str)) return 'INTEGER';
  if (FLOAT_RE.test(str)) return 'FLOAT';
  if (TIMESTAMP_RE.test(str)) return 'TIMESTAMP';
  if (DATE_RE.test(str)) return 'DATE';
  return 'TEXT';
}

/** Infers a single column's SQL type and nullability from its sampled values. */
export function inferColumnType(values: unknown[]): { type: ColumnType; nullable: boolean } {
  let nullable = false;
  const kinds = new Set<ColumnType>();

  for (const value of values) {
    const kind = classifyValue(value);
    if (kind === 'NULL') {
      nullable = true;
      continue;
    }
    kinds.add(kind);
  }

  if (kinds.size === 0) return { type: 'TEXT', nullable: true };
  if (kinds.size === 1) {
    const [only] = kinds;
    return { type: only, nullable };
  }

  const kindList = [...kinds];
  if (kindList.every((kind) => kind === 'INTEGER' || kind === 'FLOAT')) {
    return { type: 'FLOAT', nullable };
  }
  if (kindList.every((kind) => kind === 'DATE' || kind === 'TIMESTAMP')) {
    return { type: 'TIMESTAMP', nullable };
  }
  return { type: 'TEXT', nullable };
}

/** Collects column names across all rows, in order of first appearance. */
export function collectColumnNames(rows: Array<Record<string, unknown>>): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        names.push(key);
      }
    }
  }
  return names;
}

/** Infers a full column list (name, type, nullability) for a table of rows. */
export function inferColumns(
  rows: Array<Record<string, unknown>>,
  columnNames: string[],
): InferredColumn[] {
  return columnNames.map((name) => {
    const values = rows.map((row) => row[name]);
    const { type, nullable } = inferColumnType(values);
    return { name, type, nullable };
  });
}
