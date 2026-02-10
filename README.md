# OPGT - Observatório de Políticas de Governança de Terras

Website oficial do OPGT, observatório independente dedicado ao monitoramento técnico das políticas de governança fundiária no Brasil.

## Stack Técnica

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router DOM** - Navegação SPA

## Estrutura do Projeto

```
opgt-website/
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Footer, PageLayout
│   │   ├── ui/             # Card, Button, Tag, etc.
│   │   └── sections/       # Hero, StatsGrid, ContentGrid, Newsletter
│   ├── pages/              # Todas as páginas do site
│   ├── data/               # Dados estáticos (indicadores, equipe, etc.)
│   ├── types/              # TypeScript types
│   ├── App.tsx             # App principal com Router
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── index.html              # HTML template
├── tailwind.config.js      # Configuração Tailwind
├── vite.config.ts          # Configuração Vite
└── package.json
```

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O site estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

### Preview da Build

```bash
npm run preview
```

## Páginas Implementadas

- **/** - Home (estatísticas, atualizações, políticas)
- **/sobre** - Quem Somos (missão, equipe, metodologia, parcerias)
- **/politicas** - Políticas Monitoradas (sistemas e normativas)
- **/dashboard** - Dashboard (placeholder, lançamento em Jan/2026)
- **/relatorios** - Publicações (relatórios, notas técnicas, newsletter)
- **/metodologia** - Metodologia (princípios, fontes, limitações)
- **/glossario** - Glossário (termos técnicos com busca)
- **/imprensa** - Sala de Imprensa (releases, contatos, kit)
- **/contato** - Contato (formulário e informações)

## Design System

### Cores

- **Primary**: #1a1a1a (textos, header)
- **Accent**: #0066cc (CTAs, links)
- **Background**: #ffffff / #f8f9fa (alternado)
- **Border**: #e1e4e8
- **Text**: #24292e / #586069 / #959da5

### Componentes

- **Card**: Variantes default, stat, content, publication
- **Button**: Primary e secondary
- **Tag**: Badges para categorização
- **Hero**: Seção hero genérica
- **StatsGrid**: Grid de estatísticas
- **ContentGrid**: Grid genérico de conteúdo
- **Newsletter**: Formulário de newsletter

## Dados

Os dados são gerenciados através de arquivos TypeScript em `src/data/`:

- `indicators.ts` - Estatísticas principais
- `team.ts` - Membros da equipe
- `policies.ts` - Políticas monitoradas
- `glossary.ts` - Termos do glossário
- `publications.ts` - Relatórios e notas técnicas

## Contribuindo

Este é um projeto institucional do OPGT. Para sugestões ou correções, entre em contato através do site.

## Licença

© 2026 OPGT - Observatório de Políticas de Governança de Terras. Todos os direitos reservados.

Desenvolvido por [Molécula Mídia](https://moleculamidia.com.br)
Financiado por [Landesa Fund](https://landesa.org)
