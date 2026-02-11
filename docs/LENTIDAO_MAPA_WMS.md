# Análise da lentidão no mapa (camada WMS)

## Resumo

A lentidão ao carregar os polígonos da Malha Fundiária no mapa tende a vir de **vários fatores**, não só do front-end. Abaixo estão as causas mais prováveis e o que já foi verificado no código.

---

## 1. Servidor GeoServer (Railway)

- **Ambiente:** Railway **Pro** (serviços não são pausados por inatividade).
- **URL dos tiles:** `https://opgt-geoserver-deploy-production.up.railway.app/geoserver/opgt/wms`
- Os tiles WMS são pedidos **diretamente** ao Railway (sem passar pelo Vercel), para evitar CORS nas imagens.
- Cada tile é uma requisição GetMap ao GeoServer, que precisa **renderizar** a camada PostGIS (174.723 polígonos) para o bbox daquele tile.
- Com **CQL_FILTER** (filtro por bioma, categoria, estado/região), cada combinação de filtro gera URLs diferentes; o cache de tiles (GWC) normalmente não ajuda, então quase todo tile é renderizado sob demanda.
- **Possíveis causas no servidor:**
  - Erros na aplicação (GeoServer/Tomcat) — ver Deploy Logs no Railway.
  - Limites de memória/CPU do container (ex.: GeoServer com muitas camadas).
  - Rede/latência entre o usuário e o Railway.
  - Ausência de cache (GWC) para os filtros usados ou para zoom 4 (vista Brasil).

**Conclusão:** Se a lentidão aparece também em **produção** e em outros ambientes, é forte indício de que o gargalo está no **GeoServer/Railway** (tempo de resposta por tile), e não apenas no código do painel.

---

## 2. Número de tiles e zoom inicial

- **Zoom inicial do mapa:** 4 (vista do Brasil).
- **Tamanho do tile:** 512px.
- Na vista Brasil (zoom 4), o Leaflet pede **vários tiles** de uma vez (ordem de dezenas, dependendo do tamanho do container). Cada um é uma requisição ao GeoServer.
- Quanto **mais zoomado** (zoom 5, 6…), mais tiles entram na tela, mas cada tile cobre uma área menor e o GeoServer pode responder um pouco mais rápido por tile (menos geometria por bbox). O efeito líquido (muitos tiles vs. tempo por tile) depende do servidor.

**No código:** Já se usa `tileSize: 512` e `format: 'image/png8'` para reduzir quantidade e tamanho de requisições.

---

## 3. Comportamento do Leaflet (pan e zoom)

- Por padrão, o **GridLayer** (base do TileLayer.WMS) tem:
  - **updateWhenIdle:** `false` em desktop → tiles são pedidos **durante** o arraste (pan).
  - **updateWhenZooming:** `true` → tiles são atualizados **a cada nível inteiro de zoom** durante a animação.
- Isso gera **muitas requisições** em sequência quando o usuário move ou dá zoom no mapa; com um GeoServer lento, a sensação é de travamento/lentidão.

**Mitigação no front-end:** Foi ativado no WMS:
- `updateWhenIdle: true` → só pedir novos tiles **depois** que o pan terminar.
- `updateWhenZooming: false` → só atualizar tiles **no fim** da animação de zoom.

Assim reduz-se o número de requisições durante a interação; o custo é que, ao arrastar ou dar zoom, os novos polígonos só aparecem quando o movimento termina.

---

## 4. Recriação do layer ao mudar filtro

- Sempre que **cqlFilter** ou **isVisible** mudam, o layer WMS é **removido e criado de novo** e todos os tiles da view atual são pedidos outra vez.
- Ex.: usuário escolhe Região “Norte” e depois Estado “PA” → duas mudanças de filtro → duas recriações completas do layer e duas levas de tiles. Isso é esperado (o CQL muda), mas aumenta a carga no GeoServer quando o usuário altera filtros com frequência.

---

## 5. O que não parece ser a causa

- **Proxy/Vercel:** Os tiles WMS usam a URL **direta** do Railway; o proxy (`/geoserver`) é usado só para GetFeatureInfo (clique no polígono). Portanto a lentidão dos tiles não vem do proxy do painel.
- **Código do painel:** O fluxo (useEffect, dependências, criação do layer) está coerente; não há indício de loops ou pedidos em duplicata por bug no React.

---

## Recomendações

1. **Servidor (GeoServer/Railway):**
   - Medir tempo de resposta de um GetMap (um tile) com e sem CQL_FILTER (ex.: via aba Rede do navegador ou curl).
   - Verificar se há GWC configurado e se há cache para a camada e zooms usados.
   - No Railway Pro, conferir métricas (CPU/memória) e logs em caso de lentidão ou falhas.

2. **Front-end (já aplicado):**
   - `updateWhenIdle: true` e `updateWhenZooming: false` no layer WMS para reduzir requisições durante pan/zoom.

3. **Opcional no front-end (se quiser aliviar mais o servidor):**
   - Aumentar o zoom mínimo em que a camada WMS aparece (ex.: só a partir do zoom 5 ou 6), reduzindo carga na vista Brasil (zoom 4). Trade-off: usuário precisa dar zoom para ver os polígonos.

4. **Rede:**
   - Se o GeoServer estiver em outra região (ex.: EUA) e os usuários no Brasil, a latência de rede pode ser relevante; considerar deploy do GeoServer mais próximo do público-alvo.

---

## Boas práticas de carregamento e UX (aplicadas no painel)

Para evitar primeiro carregamento pesado e melhorar a experiência:

1. **Visualização geral do Brasil sem obrigar região/estado**
   - O mapa **sempre** exibe a camada WMS (não há overlay obrigando a escolher região/estado).
   - Em **"O Brasil"** (sem região/estado) ou em qualquer escopo, quando **nenhuma categoria** está selecionada, usa-se **carregamento gradual** (uma categoria por vez), evitando uma única requisição pesada.

2. **Região padrão na abertura**
   - Na primeira abertura do Mapa Fundiário, o escopo inicial é **Sudeste** (região), em vez de vazio.
   - O primeiro carregamento fica limitado a uma região, reduzindo tempo e carga no servidor. O usuário pode trocar de região/estado ou limpar para "Brasil" (e aí verá o overlay até escolher de novo um escopo).

3. **Limitação de exibição**
   - Não há limite de *número* de polígonos por tile (isso é controlado pelo GeoServer por bbox + CQL). A limitação é **geográfica**: só solicitamos tiles quando há filtro de região ou estado, evitando a vista "Brasil inteiro" sem filtro.

4. **Carregamento gradual por categoria**
   - Quando **nenhuma categoria** está selecionada (todas as categorias), o painel adiciona **uma camada WMS por categoria** a cada 2 segundos, na ordem de `CATEGORIA_FUNDIARIA_GRADUAL_ORDER`. Vale tanto para **Brasil inteiro** quanto para **região/estado** selecionado: o mapa vai "preenchendo" aos poucos e o GeoServer recebe requisições distribuídas no tempo. Se o usuário escolher **uma categoria** no drawer, volta ao carregamento em uma única camada.

5. **Resumo**
   - Boa prática: **primeiro carregamento limitado a um escopo** (região/estado), **nunca** carregar toda a malha sem restrição geográfica; usar overlay claro quando não houver escopo; **gradual por categoria** quando exibir todas as categorias no escopo.

---

## Se o mapa ficar em "Carregando camada..." sem parar

O painel exibe um indicador de erro e botão "Tentar novamente" após 30 segundos sem resposta. Se isso acontecer com frequência:

1. **Verificar o GeoServer no Railway**
   - Acesse o painel do [Railway](https://railway.app) e abra o projeto do GeoServer.
   - Confira se o serviço `opgt-geoserver-deploy-production` está **Online**. No plano Pro não há pausa por inatividade; se a página não carrega, o problema costuma ser da aplicação (erros no GeoServer/Tomcat).
   - Veja os **Deploy Logs** do serviço: stack traces (ex.: `ErrorReportValve`, `StandardEngineValve`) indicam falhas internas; a primeira linha do erro costuma mostrar a causa (ex.: OutOfMemoryError, falha de conexão com PostGIS).

2. **Reativar o serviço**
   - Use **Restart** para subir de novo o container com a mesma imagem (recomendado como primeiro passo).
   - Se não resolver, use **Redeploy** para refazer o build/deploy.

3. **Testar a URL**
   - Abra no navegador: `https://opgt-geoserver-deploy-production.up.railway.app/geoserver/web/`
   - Se não carregar em até ~30s, o servidor está indisponível; após reiniciar no Railway, teste de novo.
