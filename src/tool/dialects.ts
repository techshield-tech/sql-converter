// SQL dialect metadata. Tool-specific.
//
// The `value` strings are exactly the `database` option strings accepted by
// the installed `node-sql-parser` version (verified against
// node_modules/node-sql-parser/README.md and index.js for v5.4.0 — the
// library lower-cases whatever it's given before matching, so casing here is
// cosmetic, but these are the spellings the library's own docs use). This is
// the full "Supported Database SQL Syntax" list from that README.
export interface DialectOption {
  value: string;
  label: string;
}

export const CONVERTER_DIALECTS: DialectOption[] = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgresQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'transactsql', label: 'TransactSQL (SQL Server)' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'hive', label: 'Hive' },
  { value: 'redshift', label: 'Redshift' },
  { value: 'trino', label: 'Trino' },
  { value: 'athena', label: 'Athena' },
  { value: 'db2', label: 'DB2' },
  { value: 'flinksql', label: 'FlinkSQL' },
  { value: 'noql', label: 'Noql' },
];
