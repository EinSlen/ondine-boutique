import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(ICI, '..', 'outils', '.env'), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_TOKEN, 'Content-Type': 'application/json' };

export const ICI_DIR = ICI;
export const STORE = env.SHOPIFY_STORE;

export const gql = async (query, variables = {}) => {
  const r = await fetch(`${base}/graphql.json`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
};

export const rest = async (method, p, body) => {
  const r = await fetch(`${base}/${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${t.slice(0, 500)}`);
  return t ? JSON.parse(t) : {};
};
