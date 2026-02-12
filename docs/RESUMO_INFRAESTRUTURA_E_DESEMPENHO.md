# Resumo da infraestrutura OPGT Painel e desempenho do mapa

Documento de referência para responder dúvidas sobre **onde está cada serviço**, **por que o mapa pode demorar** e **quais opções existem para melhorar** (incluindo custo).

---

## 1. Visão geral da infraestrutura

| Camada | Tecnologia | Onde está hospedado | Observação |
|--------|------------|---------------------|------------|
| **Front-end (painel)** | React + Vite, Leaflet | **Vercel** | Build e deploy automático a partir do GitHub; CDN global. |
| **Servidor de mapas** | GeoServer (WMS/WFS) | **Railway** (Pro) | Container; URL: `opgt-geoserver-deploy-production.up.railway.app/geoserver`. |
| **Banco de dados geo** | PostgreSQL + PostGIS | **Railway** | Serviço separado no mesmo projeto; GeoServer conecta via connection string. |
| **Dados do mapa** | Malha Fundiária 2025 | PostGIS | ~174.723 polígonos; publicados como camada WMS no workspace `opgt`. |
| **Tiles de base** | CartoDB Voyager | CDN externa | Base do mapa (ruas, labels); não passa pelo nosso servidor. |

**Fluxo do mapa:**
- O navegador carrega o painel na **Vercel**.
- Os **tiles WMS** (imagens dos polígonos) são pedidos **diretamente ao Railway** (não passam pela Vercel), para evitar CORS e sobrecarga no proxy.
- O **GetFeatureInfo** (clique no polígono) usa o proxy da Vercel que encaminha para o GeoServer no Railway (`vercel.json`).
- Cada tile é uma requisição **GetMap** ao GeoServer, que consulta o PostGIS, aplica filtros (CQL), renderiza a imagem e devolve PNG.

---

## 2. Por que a demora? (processamento dos polígonos)

Sim, a demora está **ligada ao processamento dos polígonos**, mas não só a isso. Em resumo:

1. **GeoServer + PostGIS (Railway)**  
   Para cada tile, o GeoServer:
   - Recebe o bbox (área do tile) e o CQL (filtro por região, bioma, categoria).
   - Consulta o PostGIS (174k+ polígonos, recorte espacial, estilos).
   - Renderiza a imagem (PNG) e envia.
   O tempo por tile depende de **CPU, RAM e disco** do container no Railway e da **complexidade da consulta** (quantos polígonos entram no bbox).

2. **Lugar onde o GeoServer está hospedado**  
   - **Região do servidor:** Se o Railway estiver em datacenter fora do Brasil (ex.: EUA), a **latência de rede** entre o usuário e o servidor soma ao tempo de cada requisição.
   - **Recursos do plano:** No Railway Pro o serviço não pausa, mas CPU/RAM são limitados pelo plano; mais recursos costumam melhorar o tempo de resposta por tile.

3. **Quantidade de tiles e filtros**  
   - Na vista “Brasil” (zoom 4) o mapa pede **vários tiles** de uma vez (dezenas).
   - Cada combinação de **filtro** (região, estado, bioma, categoria) gera URLs diferentes; o **cache de tiles (GWC)** do GeoServer normalmente não reaproveita entre filtros, então muitos tiles são **renderizados sob demanda**.

4. **Front-end**  
   Já foram feitas otimizações: `updateWhenIdle`, `updateWhenZooming: false`, carregamento gradual por categoria, região padrão Sudeste, etc. A lentidão que sobra costuma estar no **servidor (GeoServer/Railway)** ou na **rede**.

Conclusão: **a demora é em grande parte do processamento no GeoServer (e onde ele está hospedado)**, não apenas “dos polígonos” de forma abstrata: é o tempo de **calcular e desenhar** cada tile no servidor + o tempo de **rede** até o usuário.

---

## 3. Opções para processar mais rápido

### A. Hospedagem / infraestrutura

| Opção | O que faz | Impacto esperado |
|-------|-----------|------------------|
| **Mais recursos no Railway** | Subir de plano (mais CPU/RAM para o serviço GeoServer) | Menor tempo por tile; custo sobe conforme o plano. |
| **GeoServer em região Brasil** | Rodar GeoServer (e PostGIS) em provedor com datacenter no Brasil (AWS sa-east-1, GCP southamerica-east1, Azure Brazil South, Oracle Vinhedo, etc.) | Reduz **latência de rede** para usuários no Brasil; tempo por tile pode ser parecido, mas a soma “rede + processamento” cai. |
| **VPS/cloud com mais recurso** | Migrar GeoServer + PostGIS para EC2, DigitalOcean, etc., com instância maior | Mais controle sobre CPU/RAM; possível melhorar tempo de processamento por tile. |

### B. GeoServer e cache

| Opção | O que faz | Impacto esperado |
|-------|-----------|------------------|
| **Cache de tiles (GWC)** | Configurar GeoServer Web Cache para pré-gerar ou cachear tiles dos zooms e estilos mais usados | Tiles já prontos = resposta muito mais rápida; menos carga no PostGIS. Com muitos filtros CQL, o ganho é maior para zooms/views “fixas” (ex.: Brasil sem filtro). |
| **Índice espacial GIST + VACUUM/CLUSTER** | No PostGIS: `CREATE INDEX GIST (geom)`, `CLUSTER`, `VACUUM ANALYZE` na tabela da malha | **10–100x** em consultas por bbox se o índice não existir; ver `docs/POSTGIS_OTIMIZACAO_FASE1.md` e `scripts/postgis_otimizar_malha_fase1.sql`. |
| **Otimizar estilo e layer** | Simplificar estilo (menos regras), generalização por zoom | Pode reduzir tempo de renderização por tile. |

### C. Front-end (já aplicado no projeto)

- Carregamento gradual por categoria; região padrão; `updateWhenIdle` e `updateWhenZooming: false`; zoom mínimo para WMS; feedback de loading e retry.  
- Detalhes em `docs/LENTIDAO_MAPA_WMS.md`.

---

## 4. Contratar outro serviço/hospedagem – faz diferença?

**Sim.** Principalmente em dois casos:

1. **Servidor na região Brasil**  
   Reduz atraso de rede (latência). Mesmo que o tempo de processamento no GeoServer seja igual, o usuário recebe o tile mais rápido.

2. **Servidor com mais CPU/RAM (ou plano maior no Railway)**  
   O GeoServer processa cada tile mais rápido; com muitos acessos simultâneos, evita fila e timeouts.

**Teria como contratar algo que torne mais rápido?**  
Sim: por exemplo, subir o GeoServer (e o PostGIS) em uma VPS/cloud em São Paulo (AWS, GCP, Azure, Oracle, Locaweb, etc.) com instância adequada e, se possível, GWC habilitado. O painel continua na Vercel; só se altera a URL do GeoServer (variável `VITE_GEOSERVER_URL`). Há doc em `docs/GEOSERVER_URL_ALTERNATIVA.md` e `docs/MIGRAR_GEOSERVER_RAILWAY_PARA_AWS_DO.md`.

---

## 5. O aumento de custo é significativo?

- **Depende do provedor e do plano.**  
  - **Railway:** Subir de plano (mais recursos para o mesmo serviço) costuma ser um aumento **moderado** (ordem de dezenas de dólares/reais por mês, não costuma ser “10x”).  
  - **AWS/GCP/Azure/Oracle em região Brasil:** Você paga por instância (EC2, GCE, etc.) + disco + tráfego. Valores típicos para uma instância pequena/média (GeoServer + PostGIS) ficam na faixa de dezenas a poucas centenas de reais por mês, conforme tamanho e uso.  
  - **DigitalOcean / Locaweb / outros:** Faixas parecidas; há planos fixos que facilitam o orçamento.

- **Resumo:** O aumento **não costuma ser de ordem de magnitude** (ex.: 10x) a menos que se suba para instâncias grandes ou múltiplos nós. Para “um servidor um pouco mais forte” ou “mesmo serviço em região Brasil”, o custo costuma ser **moderado** (dezenas a ~centenas de reais/mês, conforme escolha). Vale **cotar** um plano acima do atual no Railway e, se quiser testar região Brasil, uma instância pequena em provedor com datacenter no Brasil e comparar ganho de velocidade x custo.

---

## 6. Referências no repositório

| Documento | Conteúdo |
|-----------|----------|
| `docs/LENTIDAO_MAPA_WMS.md` | Análise da lentidão, causas, mitigações já aplicadas, procedimento de verificação no Railway. |
| `docs/GEOSERVER_URL_ALTERNATIVA.md` | Como apontar o painel para outro GeoServer (ex.: em região Brasil); variável `VITE_GEOSERVER_URL`. |
| `docs/MIGRAR_GEOSERVER_RAILWAY_PARA_AWS_DO.md` | O que copiar do Railway (PostGIS + GeoServer) para AWS ou Digital Ocean. |
| `src/config/geoserver.ts` | URL padrão do GeoServer (Railway), uso de `VITE_GEOSERVER_URL`, paths WMS/WFS. |
| `vercel.json` | Rewrite do proxy `/geoserver` para o GeoServer no Railway (usado para GetFeatureInfo). |

---

## 7. Resposta objetiva para o stakeholder

**Por que demora?**  
Principalmente pelo **processamento no servidor** (GeoServer consulta o PostGIS, aplica filtros e gera cada imagem de tile) e pela **rede** entre o usuário e o servidor. O lugar onde o GeoServer está hospedado (hoje Railway) influencia: região longe do Brasil aumenta latência; poucos recursos (CPU/RAM) aumentam o tempo por tile.

**Opções para ficar mais rápido?**  
(1) Subir de plano no Railway (mais CPU/RAM); (2) Colocar o GeoServer (e o banco) em **região Brasil** (AWS, GCP, Azure, etc.) para reduzir latência; (3) Configurar **cache de tiles (GWC)** no GeoServer; (4) Otimizar estilo e índices no PostGIS.

**Dá para contratar hospedagem que torne mais rápido?**  
Sim. Principalmente servidor em região Brasil e/ou com mais recursos. O painel continua na Vercel; só se aponta o painel para a nova URL do GeoServer.

**O aumento de custo é significativo?**  
Depende do provedor. Subir um pouco de plano ou usar uma VPS/instância em região Brasil costuma ser um aumento **moderado** (dezenas a poucas centenas de reais/mês), não costuma ser ordem de magnitude. Vale cotar e comparar ganho de velocidade com o custo.
