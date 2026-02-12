#!/usr/bin/env node
/**
 * Verificar se GeoWebCache está configurado corretamente
 */

const GEOSERVER_URL = 'https://opgt-geoserver-deploy-production.up.railway.app';

async function checkGWC() {
  console.log('🔍 Diagnóstico GeoWebCache\n');

  // Teste 1: GetCapabilities do GWC
  console.log('1️⃣ Verificando GetCapabilities do GWC...');
  try {
    const response = await fetch(
      `${GEOSERVER_URL}/geoserver/gwc/service/wmts?REQUEST=GetCapabilities`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (response.ok) {
      const text = await response.text();
      if (text.includes('pa_br_malhafundiaria_2025_cdt')) {
        console.log('✅ Layer encontrada no GWC');
      } else {
        console.log('❌ Layer NÃO está no GWC');
        console.log('   → Precisa habilitar em Tile Layers');
      }
    } else {
      console.log('❌ GWC não respondeu:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }

  // Teste 2: Comparar WMS direto vs GWC
  console.log('\n2️⃣ Comparando WMS direto vs GWC...');

  const params =
    'service=WMS&version=1.1.0&request=GetMap&layers=opgt:pa_br_malhafundiaria_2025_cdt&bbox=-50,-25,-49,-24&width=256&height=256&srs=EPSG:4326&format=image/png';

  // WMS direto
  console.log('\n   WMS direto (/geoserver/opgt/wms):');
  try {
    const start = Date.now();
    const response = await fetch(`${GEOSERVER_URL}/geoserver/opgt/wms?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    const duration = Date.now() - start;

    if (response.ok) {
      console.log(`   ✅ Funcionando (${duration}ms)`);
      console.log(`   Tamanho: ${response.headers.get('content-length')} bytes`);
    } else {
      console.log(`   ❌ Status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
  }

  // GWC
  console.log('\n   GWC (/geoserver/gwc/service/wms):');
  try {
    const start = Date.now();
    const response = await fetch(
      `${GEOSERVER_URL}/geoserver/gwc/service/wms?${params}`,
      { signal: AbortSignal.timeout(15000) }
    );
    const duration = Date.now() - start;

    if (response.ok) {
      const cacheResult = response.headers.get('x-gwc-cache-result');
      console.log(`   ✅ Funcionando (${duration}ms)`);
      console.log(`   Cache: ${cacheResult || 'N/A'}`);
      console.log(`   Tamanho: ${response.headers.get('content-length')} bytes`);
    } else {
      const text = await response.text();
      console.log(`   ❌ Status ${response.status}`);
      if (text.includes('IllegalStateException')) {
        console.log('   ⚠️  Erro de configuração - layer não está pronta para GWC');
      }
    }
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNÓSTICO:');
  console.log('   - Se WMS direto funciona mas GWC falha:');
  console.log('     → Desabilitar GWC temporariamente');
  console.log('     → Usar WMS direto por enquanto');
  console.log('   - Se ambos funcionam:');
  console.log('     → Pode ativar VITE_USE_GEOWEBCACHE=true');
  console.log('='.repeat(60) + '\n');
}

checkGWC();
