# Testar GeoServer em outra infraestrutura (ex.: Brasil)

É possível apontar o painel para um GeoServer em outro servidor (por exemplo em região Brasil) para testar se o desempenho melhora.

## 1. Configurar a URL no projeto

Crie ou edite o arquivo **`.env.local`** na raiz do projeto (não é commitado):

```env
VITE_GEOSERVER_URL=https://seu-geoserver-brasil.exemplo.com/geoserver
```

- A URL deve terminar em **`/geoserver`** (sem barra no final).
- O workspace e a camada continuam **opgt/wms** (o path `/opgt/wms` é fixo no código).
- Reinicie o servidor de desenvolvimento (`npm run dev`) após alterar o `.env.local`.

Para **build de produção** (ex.: Vercel), defina a mesma variável no painel do provedor (Environment Variables). Ex.: `VITE_GEOSERVER_URL` = `https://...`.

## 2. Servidor alternativo: requisitos

O servidor que você colocar na URL precisa:

- Expor **WMS** no path `/geoserver/opgt/wms` (workspace `opgt`, camada publicada como antes).
- Ter a mesma **camada** (Malha Fundiária 2025, mesmo schema/atributos) para o mapa e os filtros funcionarem igual.
- Para **clique no polígono** (GetFeatureInfo): habilitar **CORS** para o domínio do front-end (ou o navegador bloqueará o `fetch`). No GeoServer isso costuma ser em “Settings” ou via headers no proxy reverso.

## 3. Opções de hospedagem com região Brasil

Algumas opções com datacenter em São Paulo (menor latência para usuários no Brasil):

| Provedor | Região | Uso típico |
|----------|--------|------------|
| **AWS** | sa-east-1 (São Paulo) | EC2 + Docker (GeoServer + PostGIS) ou ECS |
| **Google Cloud** | southamerica-east1 (São Paulo) | GCE + Docker ou Cloud Run (se adaptar GeoServer) |
| **Azure** | Brazil South (São Paulo) | VM + Docker |
| **Oracle Cloud** | Vinhedo (Brasil) | VM + Docker |
| **Locaweb / Locaweb Cloud** | Brasil | VPS ou cloud |
| **Umbler** | Brasil | PaaS; ver se suporta Docker/GeoServer |

Você precisa **subir o GeoServer + PostGIS** nesse servidor (por exemplo com Docker), carregar os mesmos dados da Malha Fundiária e publicar a camada no workspace `opgt` com o mesmo nome. Depois use a URL base desse serviço em `VITE_GEOSERVER_URL`.

## 4. Voltar ao servidor padrão (Railway)

Remova a variável ou deixe o `.env.local` sem `VITE_GEOSERVER_URL`. O projeto volta a usar o GeoServer em produção no Railway.
