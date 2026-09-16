// Dialect conversion: parse SQL with a source dialect and regenerate it with
// a target dialect, via node-sql-parser. Tool-specific.
//
// node-sql-parser is lazy-loaded (dynamic import) so it never lands in the
// initial bundle. Verified against node-sql-parser@5.4.0's own
// node_modules/node-sql-parser/types.d.ts: `Parser#astify(sql, opt)` returns
// an AST (or AST[] for multiple statements), `Parser#sqlify(ast, opt)` turns
// it back into a SQL string, and both accept `{ database: string }` to pick
// the dialect.

import type { AST, Parser as SqlParser } from 'node-sql-parser';
import { describeSqlError, formatSqlErrorInfo } from './sql-parse-error';

let parserCtorPromise: Promise<typeof SqlParser> | null = null;

async function loadParserCtor(): Promise<typeof SqlParser> {
  if (!parserCtorPromise) {
    parserCtorPromise = import('node-sql-parser').then((mod) => mod.Parser);
  }
  return parserCtorPromise;
}

export interface ConvertSqlResult {
  sql: string;
}

/**
 * Converts `sql` from `sourceDialect` to `targetDialect`.
 *
 * Throws a plain `Error` whose message is already a clean, display-ready
 * string (line/column included when node-sql-parser reports one) — callers
 * can show `error.message` directly without touching a raw stack trace.
 */
export async function convertSqlDialect(
  sql: string,
  sourceDialect: string,
  targetDialect: string,
): Promise<ConvertSqlResult> {
  const Parser = await loadParserCtor();
  const parser = new Parser();

  let ast: AST[] | AST;
  try {
    ast = parser.astify(sql, { database: sourceDialect });
  } catch (err) {
    throw new Error(formatSqlErrorInfo(describeSqlError(err)));
  }

  try {
    const output = parser.sqlify(ast, { database: targetDialect });
    return { sql: output };
  } catch (err) {
    const info = describeSqlError(err);
    throw new Error(`Could not generate SQL for the target dialect: ${formatSqlErrorInfo(info)}`);
  }
}
