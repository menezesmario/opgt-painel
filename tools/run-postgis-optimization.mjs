#!/usr/bin/env node
/**
 * OPGT - Execução da Otimização PostGIS Fase 1
 *
 * Executa o script SQL de otimização e registra logs detalhados.
 *
 * Uso:
 *   $env:DATABASE_URL="postgresql://..."; node tools/run-postgis-optimization.mjs
 *
 * Ou no Railway CLI:
 *   railway run node tools/run-postgis-optimization.mjs
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;

// Obter caminho do script SQL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlScriptPath = join(__dirname, '..', 'scripts', 'postgis_otimizar_malha_fase1.sql');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

async function runOptimization() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    log('❌ ERRO: Variável DATABASE_URL não definida!', colors.red);
    log('Configure: $env:DATABASE_URL="postgresql://user:pass@host:port/database"', colors.yellow);
    process.exit(1);
  }

  log('\n' + '='.repeat(60), colors.cyan);
  log('🚀 OPGT - Otimização PostGIS Fase 1', colors.bright);
  log('='.repeat(60) + '\n', colors.cyan);

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: false, // Railway proxy não usa SSL
  });

  try {
    // Conectar ao banco
    log('📡 Conectando ao PostgreSQL...', colors.cyan);
    await client.connect();
    log('✅ Conectado com sucesso!\n', colors.green);

    // Ler script SQL
    log('📄 Lendo script SQL...', colors.cyan);
    const sqlScript = readFileSync(sqlScriptPath, 'utf-8');

    // Dividir em comandos individuais (separados por ponto-e-vírgula)
    // Remover linhas que são só comentário do início de cada bloco
    const commands = sqlScript
      .split(';')
      .map((cmd) =>
        cmd
          .trim()
          .replace(/^(\s*--[^\n]*\n)+/g, '')
          .trim()
      )
      .filter((cmd) => cmd.length > 0);

    log(`📝 ${commands.length} comandos SQL encontrados\n`, colors.green);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const cmdPreview = cmd.substring(0, 80).replace(/\n/g, ' ') + '...';

      log(`\n[${i + 1}/${commands.length}] Executando:`, colors.yellow);
      log(`   ${cmdPreview}`, colors.reset);

      const startTime = Date.now();

      try {
        const result = await client.query(cmd + ';');
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Mostrar resultado se houver rows
        if (result.rows && result.rows.length > 0) {
          log(`   ✅ Sucesso (${duration}s) - ${result.rows.length} resultado(s):`, colors.green);
          console.table(result.rows.slice(0, 5)); // Mostrar até 5 linhas
          if (result.rows.length > 5) {
            log(`   ... e mais ${result.rows.length - 5} resultado(s)`, colors.reset);
          }
        } else {
          log(`   ✅ Sucesso (${duration}s)`, colors.green);
        }
      } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Alguns "erros" são esperados (ex: índice já existe)
        if (error.message.includes('already exists')) {
          log(`   ⚠️  Aviso (${duration}s): ${error.message}`, colors.yellow);
        } else {
          log(`   ❌ Erro (${duration}s):`, colors.red);
          log(`   ${error.message}`, colors.red);

          // Perguntar se deve continuar
          log('\n⚠️  Erro encontrado. Deseja continuar? (Ctrl+C para cancelar)', colors.yellow);
          // Aguardar 3 segundos
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ Otimização concluída!', colors.green);
    log('='.repeat(60) + '\n', colors.cyan);

    // Verificar estatísticas finais
    log('📊 Verificando estatísticas finais...', colors.cyan);
    const statsQuery = `
      SELECT
        pg_size_pretty(pg_total_relation_size('pa_br_malhafundiaria_2025_cdt')) AS tamanho_total,
        pg_size_pretty(pg_relation_size('pa_br_malhafundiaria_2025_cdt')) AS tamanho_dados,
        pg_size_pretty(pg_indexes_size('pa_br_malhafundiaria_2025_cdt')) AS tamanho_indices;
    `;

    const stats = await client.query(statsQuery);
    log('\n📈 Estatísticas da tabela:', colors.green);
    console.table(stats.rows);

    // Verificar índices (pg_stat_user_indexes usa indexrelname)
    const indexQuery = `
      SELECT
        indexrelname AS indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) AS tamanho
      FROM pg_stat_user_indexes
      WHERE relname = 'pa_br_malhafundiaria_2025_cdt'
      ORDER BY pg_relation_size(indexrelid) DESC;
    `;

    const indexes = await client.query(indexQuery);
    log('\n🔍 Índices criados:', colors.green);
    console.table(indexes.rows);
  } catch (error) {
    log('\n❌ ERRO FATAL:', colors.red);
    log(error.message, colors.red);
    if (error.stack) {
      log('\n' + error.stack, colors.reset);
    }
    process.exit(1);
  } finally {
    await client.end();
    log('\n📡 Desconectado do banco.\n', colors.cyan);
  }
}

// Executar
runOptimization();
