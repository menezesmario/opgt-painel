#!/usr/bin/env node
/** Executa scripts/drop_duplicate_index.sql - remover índice GIST duplicado. */
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '..', 'scripts', 'drop_duplicate_index.sql'), 'utf-8');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Defina DATABASE_URL');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: false });
await client.connect();

const commands = sql
  .split(';')
  .map((c) => c.trim().replace(/^(\s*--[^\n]*\n)+/g, '').trim())
  .filter((c) => c.length > 0);
for (const cmd of commands) {
  const res = await client.query(cmd + ';');
  if (res.rows && res.rows.length > 0) console.table(res.rows);
  else console.log(res.command || 'OK');
}
await client.end();
console.log('Concluído.');
