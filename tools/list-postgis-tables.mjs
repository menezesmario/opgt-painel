#!/usr/bin/env node
/**
 * Lista tabelas do schema public no PostGIS (ex.: Railway).
 * Uso: definir DATABASE_URL e rodar:
 *   node tools/list-postgis-tables.mjs
 * Exemplo (não commitar a URL com senha):
 *   set DATABASE_URL=postgresql://postgres:SENHA@host:port/opgt_geodata
 *   node tools/list-postgis-tables.mjs
 */

import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Defina DATABASE_URL. Ex.:');
  console.error('  set DATABASE_URL=postgresql://postgres:SENHA@host:port/opgt_geodata');
  console.error('  node tools/list-postgis-tables.mjs');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  // Railway proxy pode não exigir SSL; se der erro de SSL, use ssl: false
  ssl: connectionString.includes('rlwy.net') ? false : undefined,
});

try {
  await client.connect();
  const res = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `);
  console.log('Tabelas (schema.table_name):');
  console.log('----------------------------');
  for (const row of res.rows) {
    console.log(`${row.table_schema}.${row.table_name}`);
  }
  if (res.rows.length === 0) {
    console.log('(nenhuma tabela encontrada)');
  }
} catch (err) {
  console.error('Erro:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
