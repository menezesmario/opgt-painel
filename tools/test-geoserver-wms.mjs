#!/usr/bin/env node

const GEOSERVER_URL = 'https://opgt-geoserver-deploy-production.up.railway.app';

async function testWMS() {
  console.log('🧪 Testando GeoServer WMS - Diagnóstico Detalhado\n');

  // Teste 1: GetCapabilities
  console.log('1️⃣ Testando GetCapabilities...');
  const capsUrl = `${GEOSERVER_URL}/geoserver/opgt/wms?service=WMS&version=1.1.0&request=GetCapabilities`;

  try {
    const response = await fetch(capsUrl);
    const text = await response.text();

    if (text.includes('pa_br_malhafundiaria_2025_cdt')) {
      console.log('✅ Layer encontrada no GetCapabilities\n');
    } else {
      console.log('❌ Layer NÃO encontrada\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Erro ao buscar GetCapabilities:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
  }

  // Teste 2: GetMap com tratamento de erro completo
  console.log('2️⃣ Testando GetMap (tile de teste)...');
  const mapUrl = `${GEOSERVER_URL}/geoserver/opgt/wms?service=WMS&version=1.1.0&request=GetMap&layers=opgt:pa_br_malhafundiaria_2025_cdt&bbox=-57.0,-34.0,-47.0,-24.0&width=256&height=256&srs=EPSG:4326&format=image/png`;

  console.log('URL completa:', mapUrl);
  console.log('\nTentando fetch...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(mapUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OPGT-Test/1.0',
      },
    });

    clearTimeout(timeoutId);

    console.log('✅ Resposta recebida!');
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('image/png')) {
      console.log('✅ Tile PNG retornado com sucesso');
      const buffer = await response.arrayBuffer();
      console.log('Tamanho da imagem:', buffer.byteLength, 'bytes');
    } else if (contentType?.includes('xml') || contentType?.includes('text')) {
      const text = await response.text();
      console.log('\n❌ GeoServer retornou erro XML/texto:');
      console.log(text);
    } else {
      console.log('⚠️  Tipo de conteúdo inesperado:', contentType);
    }
  } catch (error) {
    console.log('\n❌ Erro detalhado no GetMap:');
    console.log('Nome do erro:', error.name);
    console.log('Mensagem:', error.message);
    console.log('Código:', error.code);

    if (error.name === 'AbortError') {
      console.log('⏱️  Timeout de 30 segundos excedido');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Conexão recusada - GeoServer pode estar offline');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 Host não encontrado - problema de DNS');
    } else if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      console.log('🔒 Problema com certificado SSL');
    }

    console.log('\nStack completo:');
    console.log(error.stack);
  }

  // Teste 3: Testar URL mais simples
  console.log('\n3️⃣ Testando URL base do GeoServer...');
  try {
    const baseResponse = await fetch(`${GEOSERVER_URL}/geoserver/web/`);
    console.log('Status página web:', baseResponse.status);
    if (baseResponse.ok) {
      console.log('✅ GeoServer web interface acessível');
    }
  } catch (error) {
    console.log('❌ Erro ao acessar interface web:', error.message);
  }
}

testWMS();
