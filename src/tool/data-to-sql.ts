// Generates CREATE TABLE + INSERT statements from parsed row data. Tool-specific.

import type { ColumnType, InferredColumn } from './data-infer';
import { inferColumns } from './data-infer';
import type { DataSqlDialectStyle } from './data-sql-dialects';
import { quoteIdentifier } from './data-sql-dialects';
import type { DataSourceFormat } from './data-parse';
import { parseData } from './data-parse';

export interface DataToSqlOptions {
  raw: string;
  format: DataSourceFormat;
  tableName: string;
  dialect: DataSqlDialectStyle;
  /** Rows per INSERT statement. Values below 1 are treated as 1. */
  batchSize: number;
}

export interface DataToSqlResult {
  sql: string;
  rowCount: number;
  columns: InferredColumn[];
}

function isNullish(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function escapeStringLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function toFiniteNumber(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function isTruthyBooleanString(value: unknown): boolean {
  const str = String(value).trim().toLowerCase();
  return str === 'true' || str === '1';
}

function formatValue(value: unknown, type: ColumnType, dialect: DataSqlDialectStyle): string {
  if (isNullish(value)) return 'NULL';

  switch (type) {
    case 'INTEGER': {
      const num = toFiniteNumber(value);
      return num === null ? 'NULL' : String(Math.trunc(num));
    }
    case 'FLOAT': {
      const num = toFiniteNumber(value);
      return num === null ? 'NULL' : String(num);
    }
    case 'BOOLEAN': {
      const bool = typeof value === 'boolean' ? value : isTruthyBooleanString(value);
      return dialect.formatBoolean(bool);
    }
    case 'DATE':
    case 'TIMESTAMP':
    case 'TEXT':
    default:
      return escapeStringLiteral(String(value));
  }
}

function buildCreateTable(
  tableName: string,
  columns: InferredColumn[],
  dialect: DataSqlDialectStyle,
): string {
  const quotedTable = quoteIdentifier(tableName, dialect.identifierQuote);
  const columnLines = columns.map((column) => {
    const typeName = dialect.types[column.type];
    const notNull = column.nullable ? '' : ' NOT NULL';
    return `  ${quoteIdentifier(column.name, dialect.identifierQuote)} ${typeName}${notNull}`;
  });
  return `CREATE TABLE ${quotedTable} (\n${columnLines.join(',\n')}\n);`;
}

function buildInsertStatements(
  tableName: string,
  columns: InferredColumn[],
  rows: Array<Record<string, unknown>>,
  dialect: DataSqlDialectStyle,
  batchSize: number,
): string[] {
  if (rows.length === 0) return [];

  const quotedTable = quoteIdentifier(tableName, dialect.identifierQuote);
  const quotedColumns = columns
    .map((column) => quoteIdentifier(column.name, dialect.identifierQuote))
    .join(', ');
  const safeBatchSize = Math.max(1, Math.floor(batchSize) || 1);

  const statements: string[] = [];
  for (let offset = 0; offset < rows.length; offset += safeBatchSize) {
    const batch = rows.slice(offset, offset + safeBatchSize);
    const tuples = batch.map((row) => {
      const values = columns.map((column) => formatValue(row[column.name], column.type, dialect));
      return `  (${values.join(', ')})`;
    });
    statements.push(
      `INSERT INTO ${quotedTable} (${quotedColumns}) VALUES\n${tuples.join(',\n')};`,
    );
  }
  return statements;
}

/** Parses `options.raw` and generates a CREATE TABLE + batched INSERT statements. */
export async function generateSqlFromData(options: DataToSqlOptions): Promise<DataToSqlResult> {
  const { rows, columnNames } = await parseData(options.raw, options.format);
  const tableName = options.tableName.trim() || 'my_table';
  const columns = inferColumns(rows, columnNames);

  const createTable = buildCreateTable(tableName, columns, options.dialect);
  const inserts = buildInsertStatements(tableName, columns, rows, options.dialect, options.batchSize);

  const sql = [createTable, ...inserts].join('\n\n');
  return { sql, rowCount: rows.length, columns };
}
