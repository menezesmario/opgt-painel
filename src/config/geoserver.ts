/**
 * Configuração de conexão com o GeoServer
 * Dados servidos via WMS/WFS do PostGIS (174.723 polígonos da Malha Fundiária 2025)
 *
 * Para testar outra infraestrutura (ex.: servidor em região Brasil), defina no .env.local:
 *   VITE_GEOSERVER_URL=https://seu-geoserver-brasil.exemplo.com/geoserver
 * A URL deve terminar em /geoserver (sem barra final). Workspace e camada continuam opgt/wms.
 */

const GEOSERVER_DEFAULT = 'https://opgt-geoserver-deploy-production.up.railway.app/geoserver';
const GEOSERVER_DIRECT = (import.meta.env.VITE_GEOSERVER_URL ?? GEOSERVER_DEFAULT).replace(/\/$/, '');

// Proxy unificado: Vite proxy em dev, Vercel rewrite em prod (só quando usa URL padrão)
export const GEOSERVER_BASE = '/geoserver';

// URL direta para tiles WMS (carregados via <img>, não precisa de CORS)
// Usar GeoWebCache se habilitado (padrão: false até GWC ser configurado no GeoServer)
const USE_GEOWEBCACHE = import.meta.env.VITE_USE_GEOWEBCACHE === 'true';
export const WMS_TILES_URL = USE_GEOWEBCACHE
  ? `${GEOSERVER_DIRECT}/gwc/service/wms`
  : `${GEOSERVER_DIRECT}/opgt/wms`;

// URL para fetch (GetFeatureInfo, WFS): com VITE_GEOSERVER_URL usa o mesmo servidor (é preciso CORS no servidor); senão usa proxy
export const WMS_URL = import.meta.env.VITE_GEOSERVER_URL ? `${GEOSERVER_DIRECT}/opgt/wms` : `${GEOSERVER_BASE}/opgt/wms`;
export const WFS_URL = import.meta.env.VITE_GEOSERVER_URL ? `${GEOSERVER_DIRECT}/opgt/wfs` : `${GEOSERVER_BASE}/opgt/wfs`;

export const GEOSERVER_LAYERS = {
  malhafundiaria: {
    name: 'opgt:malhafundiaria_postgis',
    title: 'Malha Fundiária 2025',
    nativeName: 'pa_br_malhafundiaria_2025_cdt',
    srs: 'EPSG:4674',
    attributes: {
      bioma: 'bioma',
      municipio: 'cd_mun',
      categoriaFundiaria: 'categoria_fundiaria_v2025',
      categoriaDeclaratoria: 'categoria_declaratoria_v2025',
      area: 'area_ha',
      geom: 'geom',
    },
  },
} as const;

/** Centro do Brasil para o mapa */
export const BRAZIL_CENTER: [number, number] = [-14.235, -51.925];
export const BRAZIL_ZOOM = 4;
export const BRAZIL_BOUNDS: [[number, number], [number, number]] = [
  [-33.75, -73.99],
  [5.27, -32.38],
];

/** Cores para categorias fundiárias — alinham com a paleta do projeto */
export const CATEGORIA_FUNDIARIA_COLORS: Record<string, string> = {
  'IRP': '#e63946',
  'ASRFG': '#f4a261',
  'TIH': '#2a9d8f',
  'UCUS': '#264653',
  'GPFPND': '#e9c46a',
  'UCPI': '#606c38',
  'ASSA': '#bc6c25',
  'GP': '#8338ec',
  'MD': '#fb5607',
  'ASSB': '#ff006e',
  'OUTROS': '#7a8570',
  'AU': '#808080',
  'TINH': '#5a7a63',
  'AM': '#4a4a4a',
  'TQND': '#96694A',
  'TQD': '#b0804d',
};

/** Ordem das categorias para carregamento gradual (uma camada por vez). Apenas códigos simples (sem vírgula). */
export const CATEGORIA_FUNDIARIA_GRADUAL_ORDER: string[] = Object.keys(CATEGORIA_FUNDIARIA_COLORS).filter(
  (k) => !k.includes(',')
);

/** Labels legíveis para as categorias fundiárias */
export const CATEGORIA_FUNDIARIA_LABELS: Record<string, string> = {
  'IRP': 'Imóvel Rural Particular',
  'ASRFG': 'Assentamento Reforma Agrária (Federal)',
  'TIH': 'Terra Indígena Homologada',
  'UCUS': 'UC Uso Sustentável',
  'GPFPND': 'Gleba Pública Federal Não Destinada',
  'UCPI': 'UC Proteção Integral',
  'ASSA': 'Assentamento (Estadual)',
  'GP': 'Gleba Pública',
  'MD': 'Militar/Defesa',
  'ASSB': 'Assentamento (Outro)',
  'OUTROS': 'Outros',
  'AU': 'Área Urbana',
  'TINH': 'Terra Indígena Não Homologada',
  'AM': 'Área Militar',
  'TQND': 'Território Quilombola Não Delimitado',
  'TQD': 'Território Quilombola Delimitado',
  'IRP,UCPI': 'IRP sobreposto a UCPI',
  'IRP,UCUS': 'IRP sobreposto a UCUS',
  'TIH,UCPI': 'TI Homologada sobreposta a UCPI',
  'TINH,UCPI': 'TI Não Homologada sobreposta a UCPI',
  'TINH,UCUS': 'TI Não Homologada sobreposta a UCUS',
};

/** Cores para biomas */
export const BIOMA_COLORS: Record<string, string> = {
  'Amazônia': '#2d6a4f',
  'Cerrado': '#d4a373',
  'Mata Atlântica': '#588157',
  'Caatinga': '#e9c46a',
  'Pampa': '#a7c957',
  'Pantanal': '#457b9d',
};

/** Dados pré-agregados da Malha Fundiária (PostGIS) */
export const MALHA_STATS = {
  total: {
    registros: 174723,
    area_ha: 851095084,
  },
  por_bioma: [
    { bioma: 'Amazônia', registros: 24094, area_ha: 420858154 },
    { bioma: 'Cerrado', registros: 39208, area_ha: 198465475 },
    { bioma: 'Mata Atlântica', registros: 70985, area_ha: 110665873 },
    { bioma: 'Caatinga', registros: 31701, area_ha: 86273241 },
    { bioma: 'Pampa', registros: 5302, area_ha: 19393752 },
    { bioma: 'Pantanal', registros: 638, area_ha: 15085878 },
  ],
  por_categoria: [
    { sigla: 'IRP', nome: 'Imóvel Rural Particular', registros: 33818, area_ha: 265687013 },
    { sigla: 'ASRFG', nome: 'Assentamento Reforma Agrária', registros: 36106, area_ha: 230137521 },
    { sigla: 'TIH', nome: 'Terra Indígena Homologada', registros: 1755, area_ha: 100793740 },
    { sigla: 'UCUS', nome: 'UC Uso Sustentável', registros: 1445, area_ha: 50538073 },
    { sigla: 'GPFPND', nome: 'Gleba Pública Federal', registros: 3084, area_ha: 46384193 },
    { sigla: 'UCPI', nome: 'UC Proteção Integral', registros: 5746, area_ha: 39666388 },
    { sigla: 'ASSA', nome: 'Assentamento Estadual', registros: 13032, area_ha: 28805847 },
    { sigla: 'GP', nome: 'Gleba Pública', registros: 8671, area_ha: 22312084 },
    { sigla: 'MD', nome: 'Militar/Defesa', registros: 27489, area_ha: 16684351 },
    { sigla: 'OUTROS', nome: 'Outros', registros: 9005, area_ha: 9568257 },
  ],
  por_declaratoria: [
    { sigla: 'AUSENTE', nome: 'Ausente', registros: 37019, area_ha: 286048066 },
    { sigla: 'UNI_IRU_GDE', nome: 'Imóvel Rural Grande', registros: 25464, area_ha: 204584359 },
    { sigla: 'UNI_IRU_PEQ', nome: 'Imóvel Rural Pequeno', registros: 33556, area_ha: 119167684 },
    { sigla: 'MULTI', nome: 'Múltipla', registros: 33814, area_ha: 100384304 },
    { sigla: 'UNI_IRU_MED', nome: 'Imóvel Rural Médio', registros: 28477, area_ha: 88264589 },
    { sigla: 'UNI_PCT', nome: 'Povos e Comunidades Tradicionais', registros: 3217, area_ha: 27481187 },
    { sigla: 'UNI_AST', nome: 'Assentamento', registros: 13176, area_ha: 25164897 },
  ],
} as const;
