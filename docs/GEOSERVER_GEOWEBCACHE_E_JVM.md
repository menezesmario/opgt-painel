# GeoServer: GeoWebCache (GWC) e configuração JVM

Otimizações no GeoServer para reduzir tempo de resposta dos tiles em **10–100x** para requisições repetidas (cache) e melhorar estabilidade (memória JVM).

---

## 1. Habilitar GeoWebCache para a layer da Malha Fundiária

### 1.1 Acessar o GeoServer Admin

- URL: `https://opgt-geoserver-deploy-production.up.railway.app/geoserver`
- Login: usuário e senha de admin do GeoServer

### 1.2 Configurar cache na layer

**Menu:** Tile Caching → Tile Layers → localize a layer da Malha (ex.: `pa_br_malhafundiaria_2025_cdt` ou o nome publicado no workspace `opgt`).

| Configuração        | Valor           | Motivo |
|---------------------|-----------------|--------|
| **Enabled**         | ✅ Ativo        | Ativa o cache |
| **Tile Image Formats** | `image/png8` | Menor tamanho que PNG24 |
| **Metatiling**      | `4x4`           | Renderiza 16 tiles de uma vez |
| **Gutter**          | `10 pixels`     | Evita cortes em bordas |
| **Gridsets**        | `EPSG:900913` (Web Mercator) | Compatível com Leaflet |
| **Zoom levels**     | `0–18`          | Ajuste se necessário |
| **Disk quota**      | ex.: `500 MB`   | Limite de disco para cache |

### 1.3 Seed do cache (pré-gerar tiles)

**Menu:** Tile Caching → Seed/Truncate → selecione a layer.

| Campo               | Valor |
|---------------------|--------|
| **Number of tasks** | `4` |
| **Type of operation** | `Seed` |
| **Grid Set**        | `EPSG:900913` |
| **Format**          | `image/png8` |
| **Zoom start**      | `0` |
| **Zoom stop**       | `10` (Brasil até nível municipal) |
| **Bounding box**    | Padrão (Brasil) |

Clique em **Submit**. Pode levar ~10–30 min e gerar da ordem de 500 MB–1 GB de tiles.

**Nota:** Com **CQL_FILTER** (região, bioma, categoria), cada combinação gera tiles diferentes; o cache ajuda mais para vistas sem filtro ou para filtros muito usados. O frontend já está configurado para usar o endpoint GWC quando o cache estiver habilitado.

---

## 2. Configurar JVM do GeoServer (Railway)

No painel do **Railway**: projeto → serviço **opgt-geoserver-deploy** → **Variables**.

Adicione ou edite:

```bash
JAVA_OPTS=-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:SoftRefLRUPolicyMSPerMB=36000 -Dsun.java2d.renderer=org.marlin.pisces.MarlinRenderingEngine
```

- **-Xms1024m -Xmx2048m:** heap mínima 1 GB, máxima 2 GB (ajuste conforme plano Railway).
- **-XX:+UseG1GC:** coletor G1.
- **-XX:SoftRefLRUPolicyMSPerMB=36000:** recomendado para GeoServer.
- **MarlinRenderingEngine:** melhora renderização de vetores.

Depois, faça **Redeploy** do serviço para aplicar.

---

## 3. Frontend: uso do GeoWebCache

O painel está configurado para pedir tiles pelo **endpoint GWC** quando disponível:

- **Sem cache (WMS direto):** `…/geoserver/opgt/wms`
- **Com cache (GWC):** `…/geoserver/gwc/service/wms`

A URL base dos tiles é definida em `src/config/geoserver.ts` (`WMS_TILES_URL`). Com GWC habilitado e seed feito, as requisições passam pelo cache e tendem a ser muito mais rápidas.

Para forçar apenas WMS direto (sem GWC), use no `.env.local`:

```bash
VITE_USE_GEOWEBCACHE=false
```

---

## Referência

- Resumo de infra e desempenho: `docs/RESUMO_INFRAESTRUTURA_E_DESEMPENHO.md`
- Lentidão do mapa: `docs/LENTIDAO_MAPA_WMS.md`
