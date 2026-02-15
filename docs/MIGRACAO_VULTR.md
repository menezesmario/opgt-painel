# Migração Railway → Vultr São Paulo

**Data:** 14/02/2026  
**Status:** ✅ Completa e funcionando

## Infraestrutura Nova

### Servidor Vultr
- **Location:** São Paulo, Brasil 🇧🇷
- **IP:** 216.238.123.122
- **Specs:** 2 vCPU, 8 GB RAM, 50 GB NVMe
- **Custo:** $60/mês
- **Latência:** ~5-20ms (vs. 120-180ms Railway)

### Stack Técnico
- PostgreSQL/PostGIS 16-3.4
- GeoServer 2.24.0 (Kartoza)
- Nginx (reverse proxy)
- Docker Compose

### URLs de Acesso
- GeoServer Web: http://216.238.123.122/geoserver/web/
- WMS Endpoint: http://216.238.123.122/geoserver/opgt/wms
- Health Check: http://216.238.123.122/health

## Credenciais

### GeoServer
- Username: admin
- Password: OpgtGeoserver2026!@#

### PostgreSQL
- Host: 216.238.123.122
- Port: 5432
- Database: opgt_geodata
- User: postgres
- Password: OpgtPostgres2026!@#

## Dados Migrados

- ✅ 174.723 polígonos (Malha Fundiária Brasil 2025)
- ✅ 13 GB de dados geoespaciais
- ✅ 7 índices espaciais (incluindo GIST)
- ✅ Todas as estruturas e metadados

## Performance

| Métrica | Railway (antes) | Vultr SP (depois) | Melhoria |
|---------|----------------|-------------------|----------|
| Latência | 120-180ms | 5-20ms | 10-30x ✅ |
| Tile rendering | ~2-6s | ~1-3s | 2-3x ✅ |
| Localização | US-East | São Paulo 🇧🇷 | ✅ |

## Configuração Local

Para desenvolvimento local apontando para Vultr:

1. Edite `.env.local`:
```env
VITE_GEOSERVER_URL=http://216.238.123.122/geoserver
VITE_USE_GEOWEBCACHE=false
```

2. Reinicie o dev server:
```bash
npm run dev
```

## Configuração Produção (Vercel)

Variáveis de ambiente no Vercel:

```
VITE_GEOSERVER_URL=http://216.238.123.122/geoserver
VITE_USE_GEOWEBCACHE=false
```
