# Resultados dos testes de desempenho WMS

Preencha após executar os passos do plano **Testes de desempenho WMS sem alterar o projeto** (ver [LENTIDAO_MAPA_WMS.md](LENTIDAO_MAPA_WMS.md) para contexto).

**Ambiente só pela URL:** para testar o mapa com interface mínima (sem menu), acesse na barra de endereços:
- Local: `http://localhost:3000/teste-desempenho-mapa`
- Produção: `https://seu-dominio.vercel.app/teste-desempenho-mapa`
Essa rota não aparece no menu do site.

## Tabela de resultados

| Teste | Sem filtro (ms) | Com CQL (ms) | Cold 1ª req (ms) | Tiles zoom 4 |
|-------|-----------------|--------------|------------------|--------------|
| Tempo total | ... | ... | ... | ... |
| TTFB | ... | ... | ... | ... |

## Passo 4 – URL e comando curl (GetMap)

Use a URL abaixo para medir tempo de um GetMap com **curl** (sem filtro CQL). BBOX cobre uma área do Brasil (zoom ~4).

**URL GetMap (um tile, sem CQL):**

```
https://opgt-geoserver-deploy-production.up.railway.app/geoserver/opgt/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=opgt%3Apa_br_malhafundiaria_2025_cdt&SRS=EPSG%3A4326&BBOX=-74,-34,-35,5&WIDTH=512&HEIGHT=512&FORMAT=image%2Fpng8&TRANSPARENT=true
```

**Exemplo de comando curl (PowerShell):**

```powershell
curl -o NUL -w "Total: %{time_total}s | TTFB: %{time_starttransfer}s`n" "https://opgt-geoserver-deploy-production.up.railway.app/geoserver/opgt/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=opgt%3Apa_br_malhafundiaria_2025_cdt&SRS=EPSG%3A4326&BBOX=-74,-34,-35,5&WIDTH=512&HEIGHT=512&FORMAT=image%2Fpng8&TRANSPARENT=true"
```

**Exemplo em bash (Linux/macOS):**

```bash
curl -o /dev/null -w "Total: %{time_total}s | TTFB: %{time_starttransfer}s\n" "https://opgt-geoserver-deploy-production.up.railway.app/geoserver/opgt/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=opgt%3Apa_br_malhafundiaria_2025_cdt&SRS=EPSG%3A4326&BBOX=-74,-34,-35,5&WIDTH=512&HEIGHT=512&FORMAT=image%2Fpng8&TRANSPARENT=true"
```

**Ping (latência de rede):**

```powershell
ping opgt-geoserver-deploy-production.up.railway.app
```

Anote o RTT médio (ms) na tabela ou abaixo.
