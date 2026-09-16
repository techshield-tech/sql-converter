// Per-tool metadata. This is the ONE file (together with `src/tool/`,
// `index.html`'s fallback <title>, and this repo's README) that changes
// when this template is copied to a new tool repo.

// Imports from '@mmoall/tool-kit/config' (a plain-JS-backed subpath), not
// the main '@mmoall/tool-kit' barrel — this file is also reachable from
// vite.config.ts's config-load chain, which cannot load the main barrel's
// .ts source from inside node_modules. See '@mmoall/tool-kit/config's
// source comment for why.
import { defineToolConfig } from '@mmoall/tool-kit/config';

export const toolConfig = defineToolConfig({
  slug: 'sql-converter',
  name: 'SQL Converter',
  description:
    'Convert SQL between dialects, or turn CSV/JSON data into CREATE TABLE and INSERT statements — fast, free, and 100% client-side.',
  category: 'SQL',
  keywords: [
    'sql converter',
    'sql dialect converter',
    'sql translator',
    'csv to sql',
    'json to sql',
    'create table generator',
    'sql insert generator',
    'online sql tool',
  ],
});
