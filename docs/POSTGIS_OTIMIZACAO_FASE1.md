# Fase 1 — Otimização PostGIS (índice GIST + CLUSTER + VACUUM)

Otimizações no banco PostGIS que alimenta o GeoServer para **reduzir drasticamente** o tempo das consultas WMS (bounding box). Estimativa: **10–100x** no tempo por tile quando o índice espacial não existia.

**Tempo estimado:** ~30 min (compatível com Railway).  
**Script:** `scripts/postgis_otimizar_malha_fase1.sql`

---

## O que o script faz

| Passo | Comando | Efeito |
|-------|---------|--------|
| 1 | `CREATE INDEX ... GIST (geom)` | Índice espacial para consultas por bbox. Sem ele, o PostGIS faz sequential scan em 174k+ linhas. |
| 2 | `ALTER TABLE ... geom SET NOT NULL` | Permite que o planner use melhor o índice. Se existirem linhas com `geom` NULL, este comando falha; nesse caso trate os NULLs ou pule o passo. |
| 3 | `CLUSTER ... USING idx_...` | Reordena as linhas no disco pela proximidade espacial; reduz I/O randômico em 2–5x em consultas por área. |
| 4 | `VACUUM ANALYZE` | Atualiza estatísticas da tabela para o planner escolher o índice. |

---

## Como executar no Railway (PostGIS)

**Serviço no Railway:** `opgt-postgis`  
**Banco:** `opgt_geodata`  
**Usuário:** `postgres` (e senha nas Variables do serviço)  
**Tabela da malha:** `public.pa_br_malhafundiaria_2025_cdt` (já configurada no script)

O script `scripts/postgis_otimizar_malha_fase1.sql` já está com o nome correto da tabela. Para listar tabelas de outro banco (ex.: após migração), use:
`DATABASE_URL="postgresql://user:senha@host:port/db" node tools/list-postgis-tables.mjs`

1. **Executar o SQL**  
   - **Opção A – psql (local):**  
     `psql "postgresql://postgres:SENHA@HOST:PORT/opgt_geodata?sslmode=require" -f scripts/postgis_otimizar_malha_fase1.sql`  
     Substitua `SENHA`, `HOST` e `PORT` pelos valores das Variables do Railway (ou use a connection string completa que o Railway mostrar em Connect).
   - **Opção B – pgAdmin / DBeaver:** conecte com host, porta, usuário `postgres`, banco `opgt_geodata` e execute o conteúdo do script.
   - **Opção C – Railway:** se o serviço tiver **Shell**, abra e use `psql` de dentro do container (geralmente `psql -U postgres -d opgt_geodata`) e cole os comandos do script.

2. **Sobre o CLUSTER**  
   O `CLUSTER` reordena a tabela inteira e **bloqueia** a tabela por alguns minutos. Convém rodar em janela de baixo uso. Se não puder, você pode pular o `CLUSTER` e rodar só o índice + `ALTER COLUMN` + `VACUUM ANALYZE`; o índice GIST já traz o maior ganho.

---

## Depois de rodar

- Não é necessário reiniciar o GeoServer; ele passa a usar o índice nas próximas consultas.
- Para validar: compare o tempo de um GetMap (um tile) antes e depois (aba Rede do navegador ou `curl`); ou use `EXPLAIN ANALYZE` no PostGIS para a query que o GeoServer gera para um bbox.

---

## Referência

- Script SQL: `scripts/postgis_otimizar_malha_fase1.sql`
- Listar tabelas (Node): `node tools/list-postgis-tables.mjs` (definir `DATABASE_URL`)
- Contexto geral: `docs/RESUMO_INFRAESTRUTURA_E_DESEMPENHO.md` e `docs/LENTIDAO_MAPA_WMS.md`
