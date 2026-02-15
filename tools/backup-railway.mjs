#!/usr/bin/env node
/**
 * Backup completo do Railway antes da migração
 * Exporta: PostgreSQL dump, variáveis de ambiente, metadados do banco
 *
 * Uso: DATABASE_URL="postgresql://..." node tools/backup-railway.mjs
 */

import pg from 'pg';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const { Client } = pg;
const BACKUP_DIR = './migration-backup';
const TIMESTAMP = new Date().toISOString().split('T')[0];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function backup() {
  console.log('🔄 Iniciando backup do Railway...\n');

  const backupPath = join(BACKUP_DIR, TIMESTAMP);
  mkdirSync(backupPath, { recursive: true });

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL não definida!');
    process.exit(1);
  }

  // 1. Backup PostgreSQL (pg_dump -f é multiplataforma)
  console.log('1️⃣ Fazendo dump do PostgreSQL...');
  const dumpPath = join(backupPath, 'opgt_postgis_dump.sql');
  try {
    execSync(`pg_dump "${DATABASE_URL.replace(/"/g, '\\"')}" -f "${dumpPath}"`, {
      stdio: 'inherit',
      shell: true,
    });
    console.log('✅ Dump PostgreSQL criado\n');
  } catch (error) {
    console.error('❌ Erro no dump:', error.message);
    process.exit(1);
  }

  // 2. Backup variáveis de ambiente (apenas chaves, sem senhas em claro no exemplo)
  console.log('2️⃣ Salvando variáveis de ambiente...');
  const envVars = {
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? '[REDACTED]' : undefined,
    JAVA_OPTS: process.env.JAVA_OPTS,
  };
  writeFileSync(join(backupPath, 'env-vars.json'), JSON.stringify(envVars, null, 2));
  console.log('✅ Variáveis salvas\n');

  // 3. Metadados do banco
  console.log('3️⃣ Salvando metadados...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: false,
  });

  await client.connect();

  const stats = await client.query(`
    SELECT
      count(*) AS total_rows,
      pg_size_pretty(pg_total_relation_size('pa_br_malhafundiaria_2025_cdt')) AS tamanho_total,
      pg_size_pretty(pg_relation_size('pa_br_malhafundiaria_2025_cdt')) AS tamanho_dados,
      pg_size_pretty(pg_indexes_size('pa_br_malhafundiaria_2025_cdt')) AS tamanho_indices
    FROM pa_br_malhafundiaria_2025_cdt;
  `);

  const indexes = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'pa_br_malhafundiaria_2025_cdt';
  `);

  const postgisVersion = await client.query('SELECT postgis_version();');
  const metadata = {
    timestamp: new Date().toISOString(),
    table_stats: stats.rows[0],
    indexes: indexes.rows,
    postgis_version: postgisVersion.rows[0],
  };

  writeFileSync(join(backupPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
  await client.end();
  console.log('✅ Metadados salvos\n');

  // 4. Checklist de migração
  const dumpSize = existsSync(dumpPath) ? formatBytes(statSync(dumpPath).size) : 'N/A';
  const row = stats.rows[0];
  const checklist = `# CHECKLIST DE MIGRAÇÃO - ${TIMESTAMP}

## Arquivos de Backup Gerados:
- [x] opgt_postgis_dump.sql (${dumpSize})
- [x] env-vars.json
- [x] metadata.json

## Informações do Sistema Atual:
- Total de polígonos: ${row.total_rows}
- Tamanho total: ${row.tamanho_total}
- Índices: ${indexes.rows.length}

## Próximos Passos:
1. [ ] Criar VM no Vultr São Paulo
2. [ ] Instalar Docker + Docker Compose
3. [ ] Transferir backup via scp
4. [ ] Restaurar PostgreSQL
5. [ ] Configurar GeoServer
6. [ ] Testar endpoints WMS
7. [ ] Atualizar DNS
8. [ ] Monitorar por 48h

## Rollback (se necessário):
1. Reverter DNS para Railway
2. TTL configurado: 300s (5 minutos para propagação)
`;

  writeFileSync(join(backupPath, 'CHECKLIST.md'), checklist);

  console.log('✅ BACKUP COMPLETO!\n');
  console.log('📁 Arquivos em:', backupPath);
  console.log('📋 Leia o CHECKLIST.md para próximos passos\n');
}

backup().catch((err) => {
  console.error(err);
  process.exit(1);
});
