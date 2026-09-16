// Dialect styling (identifier quoting, column type names, boolean literals)
// for the Data → SQL generator. Tool-specific.
//
// This is a deliberately smaller, hand-picked list than CONVERTER_DIALECTS
// in dialects.ts (see the task brief: "reuse the target dialect list from
// Mode 1 where sensible, or a simplified list appropriate for generic SQL
// generation") — each entry below has its own well-known quoting/type rules
// baked in by hand, which is more reliable than mapping all fourteen
// node-sql-parser dialects (several of which, e.g. Noql or FlinkSQL, aren't
// meaningful targets for a generic CREATE TABLE/INSERT generator).

import type { ColumnType } from './data-infer';

export type IdentifierQuoteStyle = 'backtick' | 'double' | 'bracket';

export interface DataSqlDialectStyle {
  value: string;
  label: string;
  identifierQuote: IdentifierQuoteStyle;
  types: Record<ColumnType, string>;
  formatBoolean: (value: boolean) => string;
}

function quoteIdentifier(name: string, style: IdentifierQuoteStyle): string {
  switch (style) {
    case 'backtick':
      return '`' + name.replace(/`/g, '``') + '`';
    case 'bracket':
      return '[' + name.replace(/]/g, ']]') + ']';
    case 'double':
      return '"' + name.replace(/"/g, '""') + '"';
    default:
      return name;
  }
}

const trueFalse = (value: boolean): string => (value ? 'TRUE' : 'FALSE');
const oneZero = (value: boolean): string => (value ? '1' : '0');

export const DATA_SQL_DIALECTS: DataSqlDialectStyle[] = [
  {
    value: 'mysql',
    label: 'MySQL',
    identifierQuote: 'backtick',
    types: {
      INTEGER: 'INT',
      FLOAT: 'DOUBLE',
      BOOLEAN: 'TINYINT(1)',
      DATE: 'DATE',
      TIMESTAMP: 'DATETIME',
      TEXT: 'TEXT',
    },
    formatBoolean: oneZero,
  },
  {
    value: 'mariadb',
    label: 'MariaDB',
    identifierQuote: 'backtick',
    types: {
      INTEGER: 'INT',
      FLOAT: 'DOUBLE',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      TIMESTAMP: 'DATETIME',
      TEXT: 'TEXT',
    },
    formatBoolean: oneZero,
  },
  {
    value: 'postgresql',
    label: 'PostgresQL',
    identifierQuote: 'double',
    types: {
      INTEGER: 'INTEGER',
      FLOAT: 'NUMERIC',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      TIMESTAMP: 'TIMESTAMP',
      TEXT: 'TEXT',
    },
    formatBoolean: trueFalse,
  },
  {
    value: 'redshift',
    label: 'Redshift',
    identifierQuote: 'double',
    types: {
      INTEGER: 'INTEGER',
      FLOAT: 'NUMERIC',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      TIMESTAMP: 'TIMESTAMP',
      TEXT: 'VARCHAR(MAX)',
    },
    formatBoolean: trueFalse,
  },
  {
    value: 'sqlite',
    label: 'SQLite',
    identifierQuote: 'double',
    types: {
      INTEGER: 'INTEGER',
      FLOAT: 'REAL',
      BOOLEAN: 'BOOLEAN',
      DATE: 'TEXT',
      TIMESTAMP: 'TEXT',
      TEXT: 'TEXT',
    },
    formatBoolean: oneZero,
  },
  {
    value: 'transactsql',
    label: 'TransactSQL (SQL Server)',
    identifierQuote: 'bracket',
    types: {
      INTEGER: 'INT',
      FLOAT: 'FLOAT',
      BOOLEAN: 'BIT',
      DATE: 'DATE',
      TIMESTAMP: 'DATETIME2',
      TEXT: 'NVARCHAR(MAX)',
    },
    formatBoolean: oneZero,
  },
  {
    value: 'bigquery',
    label: 'BigQuery',
    identifierQuote: 'backtick',
    types: {
      INTEGER: 'INT64',
      FLOAT: 'FLOAT64',
      BOOLEAN: 'BOOL',
      DATE: 'DATE',
      TIMESTAMP: 'TIMESTAMP',
      TEXT: 'STRING',
    },
    formatBoolean: trueFalse,
  },
  {
    value: 'snowflake',
    label: 'Snowflake',
    identifierQuote: 'double',
    types: {
      INTEGER: 'INTEGER',
      FLOAT: 'FLOAT',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      TIMESTAMP: 'TIMESTAMP_NTZ',
      TEXT: 'VARCHAR',
    },
    formatBoolean: trueFalse,
  },
];

export function getDataSqlDialect(value: string): DataSqlDialectStyle {
  const found = DATA_SQL_DIALECTS.find((dialect) => dialect.value === value);
  return found ?? DATA_SQL_DIALECTS[0];
}

export { quoteIdentifier };
