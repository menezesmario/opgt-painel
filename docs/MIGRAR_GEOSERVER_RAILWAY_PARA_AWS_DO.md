# Copiar GeoServer e banco de dados do Railway para AWS ou Digital Ocean

Sim, é possível. Abaixo está o que precisa ser copiado e o que você precisa ter em mãos (ou exportar) do Railway.

---

## O que existe hoje no Railway

1. **GeoServer** – servidor de mapas (WMS/WFS) que consome os dados do PostGIS.
2. **PostGIS** – banco PostgreSQL com extensão PostGIS contendo a camada da Malha Fundiária (174.723 polígonos e atributos).

Para ter uma “cópia” na AWS ou Digital Ocean você precisa replicar os dois: **banco (dump + restore)** e **GeoServer (config + mesmo workspace/camada)**.

---

## O que você precisa fornecer / exportar

### 1. Acesso e dados do Railway

| O que | Para quê |
|-------|----------|
| **Acesso ao projeto no Railway** (dashboard) | Ver serviços (GeoServer e PostGIS), variáveis de ambiente, portas. |
| **Connection string do PostGIS** | Host, porta, usuário, senha, nome do banco. Fica em “Variables” do serviço PostGIS no Railway. Formato típico: `postgresql://user:password@host:port/dbname`. |
| **Como o GeoServer está rodando** | Se é Docker, build do repositório, ou imagem. No Railway: aba “Settings” ou “Deploy” do serviço GeoServer. |
| **Configuração do GeoServer** (opcional mas útil) | Workspace `opgt`, store PostGIS, camada `malhafundiaria_postgis`, estilos (ex.: `malha_categorias`). Pode ser exportada via interface do GeoServer (Data / Layer / Style) ou por backup de diretório de dados. |

Sem a connection string do PostGIS você não consegue fazer dump do banco. Sem saber como o GeoServer está deployado (Docker, etc.), fica mais difícil replicar exatamente.

### 2. Dump do banco (PostgreSQL/PostGIS)

Você precisa de um **dump do banco** que está no Railway para restaurar na AWS ou Digital Ocean.

**Opção A – Railway oferece “Connect” / CLI:**

- Se o Railway expõe comando de shell ou “Connect” ao PostGIS, você pode rodar `pg_dump` de dentro da rede deles ou de um túnel.
- Exemplo (ajuste user/db/host):  
  `pg_dump -h host -U user -d dbname -Fc -f malha_fundiaria.dump`

**Opção B – Export pelo GeoServer (só geometria + atributos):**

- Se não tiver acesso direto ao PostGIS, mas tiver acesso ao GeoServer (admin), dá para exportar a camada como **Shapefile** ou **GeoJSON** (WFS ou “Export” na interface) e depois **importar** esse arquivo em um PostGIS novo na AWS/DO. Não é um “dump completo do banco”, mas é uma cópia dos dados da malha.

**O que você precisa “fornecer” na prática:**

- Ou o **arquivo de dump** (`.dump` ou `.sql`) do PostGIS,  
- Ou o **connection string** do PostGIS no Railway para alguém (ou você) rodar o `pg_dump` em um ambiente que consiga acessar esse host (por exemplo, de um túnel ou de um script que a Railway permita).

### 3. GeoServer

- **Se for Docker:** imagem ou `Dockerfile` + docker-compose (se existir) usados no Railway. Às vezes isso está num repositório Git ligado ao deploy.
- **Configuração:** workspace `opgt`, data store apontando para o PostGIS (nova connection string da AWS/DO), publicação da camada, estilos. Isso pode ser refeito na mão na nova instalação ou restaurado de um backup do diretório de dados do GeoServer (se você tiver acesso a ele no Railway).

---

## Passos gerais para ter a “cópia” na AWS ou Digital Ocean

1. **Obter do Railway**
   - Connection string do PostGIS.
   - (Recomendado) Dump do banco: `pg_dump` com formato custom `-Fc` ou SQL.
   - Forma de deploy do GeoServer (Docker/imagem/repo) e, se possível, export da config (workspace, store, layer, styles).

2. **Na AWS ou Digital Ocean**
   - Subir uma instância (EC2, Droplet, etc.) ou usar serviço gerenciado de PostgreSQL (ex.: RDS com PostGIS, ou Managed DB na DO).
   - Criar um banco PostGIS e **restaurar o dump**:  
     `pg_restore -h novo_host -U user -d dbname -Fc malha_fundiaria.dump` (ou `psql` se for `.sql`).
   - Instalar e configurar o GeoServer (ex.: via Docker) na mesma máquina ou em outra, apontando o data store para o **novo** PostGIS (nova connection string).
   - Publicar de novo a camada no workspace `opgt` (mesmo nome e atributos que o painel espera).
   - Habilitar CORS no GeoServer (ou no proxy reverso) para o domínio do front.

3. **No painel (este projeto)**
   - Usar a URL do novo GeoServer em `VITE_GEOSERVER_URL` (ver [GEOSERVER_URL_ALTERNATIVA.md](GEOSERVER_URL_ALTERNATIVA.md)).

---

## Resumo: o que você precisa fornecer

- **Connection string do PostGIS no Railway** (host, porta, usuário, senha, nome do banco), **ou** um **arquivo de dump** desse banco.
- **Como o GeoServer está rodando no Railway** (Docker, imagem, repositório) e, se possível, **export da configuração** (workspace opgt, store, camada, estilos).
- **Acesso** (ou ajuda de quem tem) para rodar `pg_dump` contra o PostGIS do Railway, se o dump ainda não existir.

Com o dump e a forma de deploy do GeoServer, qualquer pessoa com acesso à AWS ou Digital Ocean pode subir o banco e o GeoServer e você só precisa apontar o painel para a nova URL.
