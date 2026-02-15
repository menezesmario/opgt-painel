#!/usr/bin/env node
/**
 * OPGT - Migração Automatizada Railway → Vultr
 *
 * Este script executa TODA a migração via SSH:
 * 1. Conecta ao servidor Vultr
 * 2. Instala dependências (Docker, Docker Compose, etc)
 * 3. Faz dump do PostgreSQL direto do Railway para o Vultr
 * 4. Transfere arquivos de configuração
 * 5. Faz deploy completo
 * 6. Testa endpoints
 *
 * Uso:
 *   node tools/migrate-to-vultr.mjs
 *
 * Credenciais: use variáveis de ambiente (VULTR_HOST, VULTR_PASSWORD, etc.)
 * para não versionar senhas no repositório.
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { Client } from 'ssh2';
import { resolve } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

// ========================================
// CONFIGURAÇÃO (preferir env em produção)
// ========================================

const VULTR_CONFIG = {
  host: process.env.VULTR_HOST || '216.238.112.41',
  username: process.env.VULTR_USER || 'root',
  password: process.env.VULTR_PASSWORD || '2cL+yrAk}Ym-bhDK',
};

const RAILWAY_DATABASE_URL =
  process.env.RAILWAY_DATABASE_URL ||
  'postgresql://postgres:opgt2026pg@caboose.proxy.rlwy.net:43729/opgt_geodata';

const POSTGRES_PASSWORD = process.env.OPGT_POSTGRES_PASSWORD || 'OpgtPostgres2026!@#';
const GEOSERVER_PASSWORD = process.env.OPGT_GEOSERVER_PASSWORD || 'OpgtGeoserver2026!@#';

// ========================================
// CORES PARA OUTPUT
// ========================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

// ========================================
// FUNÇÃO PARA EXECUTAR COMANDOS SSH
// ========================================

async function execSSH(conn, command, options = {}) {
  const { silent = false, returnOutput = false, allowFailure = false } = options;

  return new Promise((resolvePromise, reject) => {
    let output = '';
    let errorOutput = '';

    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      stream.on('close', (code, signal) => {
        if (code !== 0 && !allowFailure) {
          reject(new Error(`Command failed with code ${code}: ${errorOutput || output}`));
        } else {
          resolvePromise(returnOutput ? output : true);
        }
      });

      stream.on('data', (data) => {
        const text = data.toString();
        output += text;
        if (!silent) {
          process.stdout.write(text);
        }
      });

      stream.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        if (!silent) {
          process.stderr.write(text);
        }
      });
    });
  });
}

// ========================================
// FUNÇÃO PARA TRANSFERIR ARQUIVO
// ========================================

async function transferFile(conn, localPath, remotePath) {
  return new Promise((resolvePromise, reject) => {
    conn.sftp((err, sftp) => {
      if (err) {
        reject(err);
        return;
      }

      const content = readFileSync(localPath);

      sftp.writeFile(remotePath, content, (err) => {
        if (err) {
          reject(err);
        } else {
          resolvePromise();
        }
      });
    });
  });
}

// ========================================
// ETAPAS DA MIGRAÇÃO
// ========================================

async function step1_setupServer(conn) {
  log('\n' + '='.repeat(60), colors.cyan);
  log('ETAPA 1: Setup do Servidor Vultr', colors.bold);
  log('='.repeat(60) + '\n', colors.cyan);

  log('📦 Atualizando sistema...', colors.yellow);
  await execSSH(conn, 'apt update && DEBIAN_FRONTEND=noninteractive apt upgrade -y');

  log('\n🐳 Instalando Docker...', colors.yellow);
  await execSSH(conn, 'curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh');

  log('\n📦 Instalando Docker Compose...', colors.yellow);
  await execSSH(
    conn,
    'curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose'
  );
  await execSSH(conn, 'chmod +x /usr/local/bin/docker-compose');

  log('\n🛠️  Instalando ferramentas...', colors.yellow);
  await execSSH(conn, 'DEBIAN_FRONTEND=noninteractive apt install -y postgresql-client git htop ncdu');

  log('\n🔥 Configurando firewall...', colors.yellow);
  await execSSH(conn, 'ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable');

  log('\n📁 Criando estrutura de diretórios...', colors.yellow);
  await execSSH(conn, 'mkdir -p ~/opgt/backups ~/opgt/logs ~/opgt/ssl');

  log('\n✅ Setup do servidor concluído!\n', colors.green);
}

async function step2_transferConfigs(conn) {
  log('\n' + '='.repeat(60), colors.cyan);
  log('ETAPA 2: Transferir Arquivos de Configuração', colors.bold);
  log('='.repeat(60) + '\n', colors.cyan);

  const deployPath = resolve(process.cwd(), 'deploy');

  log('📤 Transferindo docker-compose.yml...', colors.yellow);
  await transferFile(conn, resolve(deployPath, 'docker-compose.vultr.yml'), '/root/opgt/docker-compose.yml');

  log('📤 Transferindo nginx.conf...', colors.yellow);
  await transferFile(conn, resolve(deployPath, 'nginx.conf'), '/root/opgt/nginx.conf');

  log('📝 Criando arquivo .env...', colors.yellow);
  const envContent = `POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
GEOSERVER_ADMIN_PASSWORD=${GEOSERVER_PASSWORD}
`;
  const tmpEnv = resolve(tmpdir(), `opgt-env-${randomBytes(8).toString('hex')}`);
  writeFileSync(tmpEnv, envContent);
  try {
    await transferFile(conn, tmpEnv, '/root/opgt/.env');
  } finally {
    if (existsSync(tmpEnv)) unlinkSync(tmpEnv);
  }

  log('✅ Arquivos transferidos!\n', colors.green);
}

async function step3_dumpDatabase(conn) {
  log('\n' + '='.repeat(60), colors.cyan);
  log('ETAPA 3: Dump do PostgreSQL (Railway → Vultr)', colors.bold);
  log('='.repeat(60) + '\n', colors.cyan);

  log('💾 Fazendo dump do banco de dados...', colors.yellow);
  log('⏱️  Isso pode levar 5-10 minutos (~1-2 GB)...', colors.yellow);

  const urlEscaped = RAILWAY_DATABASE_URL.replace(/"/g, '\\"');
  await execSSH(conn, `pg_dump "${urlEscaped}" > /root/opgt/backups/opgt_postgis_dump.sql`);

  log('\n📊 Verificando tamanho do dump...', colors.yellow);
  const sizeResult = await execSSH(conn, 'ls -lh /root/opgt/backups/opgt_postgis_dump.sql | awk \'{print $5}\'', {
    returnOutput: true,
    silent: true,
  });
  log(`✅ Dump criado! Tamanho: ${sizeResult.trim()}\n`, colors.green);
}

async function step4_deployServices(conn) {
  log('\n' + '='.repeat(60), colors.cyan);
  log('ETAPA 4: Deploy dos Serviços Docker', colors.bold);
  log('='.repeat(60) + '\n', colors.cyan);

  log('🚀 Subindo PostgreSQL...', colors.yellow);
  await execSSH(conn, 'cd /root/opgt && docker-compose up -d postgis');

  log('\n⏱️  Aguardando PostgreSQL ficar pronto (30s)...', colors.yellow);
  await new Promise((r) => setTimeout(r, 30000));

  log('📥 Restaurando dump no PostgreSQL...', colors.yellow);
  log('⏱️  Isso pode levar 5-10 minutos...', colors.yellow);
  await execSSH(conn, 'cd /root/opgt && docker exec -i opgt-postgis psql -U postgres -d opgt_geodata < /root/opgt/backups/opgt_postgis_dump.sql');

  log('\n✅ Verificando restauração...', colors.yellow);
  const countResult = await execSSH(
    conn,
    "docker exec opgt-postgis psql -U postgres -d opgt_geodata -t -c \"SELECT count(*) FROM pa_br_malhafundiaria_2025_cdt;\"",
    { returnOutput: true, silent: true }
  );
  log(`✅ Polígonos restaurados: ${countResult.trim()}\n`, colors.green);

  log('🚀 Subindo GeoServer e Nginx...', colors.yellow);
  await execSSH(conn, 'cd /root/opgt && docker-compose up -d');

  log('\n⏱️  Aguardando serviços (60s)...', colors.yellow);
  await new Promise((r) => setTimeout(r, 60000));

  log('✅ Serviços deployados!\n', colors.green);
}

async function step5_testEndpoints(conn) {
  log('\n' + '='.repeat(60), colors.cyan);
  log('ETAPA 5: Testes de Funcionalidade', colors.bold);
  log('='.repeat(60) + '\n', colors.cyan);

  log('🧪 Testando GeoServer web interface...', colors.yellow);
  const webTest = await execSSH(conn, 'curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/geoserver/web/', {
    returnOutput: true,
    silent: true,
    allowFailure: true,
  });
  if (webTest.trim() === '200') {
    log('✅ GeoServer web interface: OK', colors.green);
  } else {
    log(`⚠️  GeoServer web interface: HTTP ${webTest.trim()}`, colors.yellow);
  }

  log('🧪 Testando endpoint WMS...', colors.yellow);
  const wmsTest = await execSSH(
    conn,
    'curl -s "http://localhost:8080/geoserver/opgt/wms?service=WMS&request=GetCapabilities" | grep -c "pa_br_malhafundiaria_2025_cdt" || true',
    { returnOutput: true, silent: true, allowFailure: true }
  );
  if (parseInt(wmsTest.trim(), 10) > 0) {
    log('✅ Layer encontrada no WMS: OK', colors.green);
  } else {
    log('⚠️  Layer não encontrada - configurar workspace/layer no GeoServer', colors.yellow);
  }

  log('\n✅ Testes concluídos!\n', colors.green);
}

async function step6_summary() {
  const host = VULTR_CONFIG.host;

  log('\n' + '='.repeat(60), colors.cyan);
  log('🎉 MIGRAÇÃO CONCLUÍDA', colors.bold);
  log('='.repeat(60) + '\n', colors.cyan);

  log('📋 PRÓXIMOS PASSOS MANUAIS:', colors.cyan);
  log('', colors.reset);
  log('1. Configurar layer no GeoServer:', colors.reset);
  log(`   http://${host}/geoserver`, colors.reset);
  log(`   Login: admin / (senha definida no .env)`, colors.reset);
  log('', colors.reset);
  log('2. Atualizar frontend (Vercel / .env):', colors.reset);
  log(`   VITE_GEOSERVER_URL=http://${host}/geoserver`, colors.reset);
  log('', colors.reset);
  log('3. Testar mapa no painel', colors.reset);
  log('', colors.reset);
  log('4. Monitorar logs:', colors.reset);
  log(`   ssh root@${host}`, colors.reset);
  log('   cd ~/opgt && docker-compose logs -f', colors.reset);
  log('', colors.reset);
  log('✅ Railway continua rodando como backup.', colors.green);
  log('', colors.reset);
}

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function migrate() {
  log('\n' + '█'.repeat(60), colors.cyan);
  log('███  OPGT - MIGRAÇÃO AUTOMATIZADA RAILWAY → VULTR  ███', colors.bold);
  log('█'.repeat(60) + '\n', colors.cyan);

  log('🔌 Conectando ao servidor Vultr...', colors.yellow);

  const conn = new Client();

  return new Promise((resolvePromise, reject) => {
    conn.on('ready', async () => {
      log('✅ Conectado ao Vultr!\n', colors.green);

      try {
        await step1_setupServer(conn);
        await step2_transferConfigs(conn);
        await step3_dumpDatabase(conn);
        await step4_deployServices(conn);
        await step5_testEndpoints(conn);
        await step6_summary();

        conn.end();
        resolvePromise();
      } catch (error) {
        log(`\n❌ ERRO: ${error.message}`, colors.red);
        conn.end();
        reject(error);
      }
    });

    conn.on('error', (err) => {
      log(`\n❌ Erro de conexão: ${err.message}`, colors.red);
      reject(err);
    });

    conn.connect(VULTR_CONFIG);
  });
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
