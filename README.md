# SQL Converter

Convert SQL between dialects, or turn CSV/JSON data into `CREATE TABLE` and
`INSERT` statements — fast, free, and 100% client-side. Your input is never
sent over the network; everything runs in your browser.

**Live:** https://techshield-tech.github.io/sql-converter/

Part of [MMOALL Developer Tools](https://mmoall.com/tools).

## Features

Two independent modes, switchable via tabs:

### Dialect Conversion

- Parses SQL with a chosen source dialect and regenerates it for a chosen
  target dialect, powered by [`node-sql-parser`](https://github.com/taozhi8833998/node-sql-parser).
- Source and target dialect selects cover every dialect the installed
  `node-sql-parser` version supports: Athena, BigQuery, DB2, FlinkSQL, Hive,
  MariaDB, MySQL, Noql, PostgresQL, Redshift, Snowflake, SQLite, TransactSQL
  (SQL Server), and Trino. A swap button flips source/target.
- Clearly labeled as best-effort: highly dialect-specific features
  (proprietary functions, non-standard syntax) may not translate perfectly —
  always review the output before running it.
- Clean parse-error messages, with line/column when `node-sql-parser` reports
  one, instead of a raw stack trace.

### Data → SQL

- Input is CSV text or a JSON array of objects, with an auto-detect option
  (or pick the format explicitly).
- Infers a column type per column — `INTEGER`, `FLOAT`, `BOOLEAN`,
  `DATE`/`TIMESTAMP`, or `TEXT` as the fallback — by sampling every value in
  that column, and marks a column nullable if any sampled value was
  null/missing/empty.
- Generates a `CREATE TABLE` statement plus batched `INSERT` statements for a
  chosen target dialect (MySQL, MariaDB, PostgresQL, Redshift, SQLite,
  TransactSQL, BigQuery, or Snowflake), with identifier quoting (backticks,
  double quotes, or `[brackets]`) and value escaping/`NULL` handling correct
  for that dialect.
- Configurable table name and rows-per-`INSERT` batch size.
- An empty CSV cell or JSON `null` is treated as SQL `NULL`.

### General

- 100% client-side — no network calls, ever.
- `node-sql-parser` and the CSV parser (`papaparse`) are lazy-loaded via
  dynamic `import()`, so the first paint stays fast.
- Copy output to clipboard, clear input/output, or load a representative
  sample for either mode.
- Responsive down to 360px viewport width.

## Embedding

This tool can be embedded in an iframe, e.g. on mmoall.com. In embed mode it
renders only the tool itself (no header/footer) on a transparent background.

```html
<iframe
  id="sql-converter"
  src="https://techshield-tech.github.io/sql-converter/?embed=1&theme=dark"
  style="width: 100%; border: 0;"
  title="SQL Converter"
></iframe>

<script>
  const iframe = document.getElementById('sql-converter');

  // Resize the iframe to fit its content.
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'mmoall-tool:height' && data.slug === 'sql-converter') {
      iframe.style.height = `${data.height}px`;
    }
    if (data && data.type === 'mmoall-tool:ready' && data.slug === 'sql-converter') {
      // The tool has mounted and is ready.
    }
  });

  // Push a theme change into the iframe (only accepted from an allowed origin).
  iframe.contentWindow.postMessage({ type: 'mmoall-tool:theme', theme: 'dark' }, '*');
</script>
```

### Contract

- `?embed=1` in the URL renders only the tool (no chrome), transparent
  background.
- `?theme=light` / `?theme=dark` sets the initial theme; otherwise it follows
  `prefers-color-scheme`.
- The page listens for `window.postMessage({type:'mmoall-tool:theme', theme})`
  from the parent frame to change theme at runtime. Only messages whose
  `event.origin` is `https://mmoall.com`, `https://www.mmoall.com`, or
  `http://localhost:3000` are accepted.
- On mount (embed mode only), the page posts
  `{type:'mmoall-tool:ready', slug:'sql-converter'}` to `window.parent`.
- Whenever its rendered height changes (embed mode only), the page posts
  `{type:'mmoall-tool:height', slug:'sql-converter', height}` to
  `window.parent`.

## Local development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

Deployment to GitHub Pages happens automatically via
`.github/workflows/deploy.yml` on every push to `main`.

## License

MIT — see [LICENSE](./LICENSE).
