// Per-tool metadata. This is the ONE file (together with the `base` in
// vite.config.ts, index.html's <title>/meta tags, README.md, and everything
// under src/tool/) that changes when this template is copied to a sibling
// tool repo.

export type ToolCategory = 'JSON' | 'JWT' | 'SQL' | 'Docker' | 'Git' | 'Web';

export interface ToolConfig {
  /** Unique identifier used in embed postMessage payloads and URLs. */
  slug: string;
  /** Display name shown in the header. */
  name: string;
  /** Short description used for meta tags and listings. */
  description: string;
  /** One of the shared MMOALL tool categories. */
  category: ToolCategory;
  /** Keywords for search/SEO purposes. */
  keywords: string[];
}

export const toolConfig: ToolConfig = {
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
};
