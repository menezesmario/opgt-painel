// Tipos TypeScript para os dados do Dashboard OPGT

export interface DashboardMetadata {
  fonte: string;
  atualizacao: string;
  frequencia: string;
  nota: string;
  ano_ref: number; // 2025 ou 2026
  disclaimer?: string; // Texto do iGPP sobre os dados
}

export interface AreaQuantidade {
  area_ha: number;
  quantidade?: number;
}

export interface SigefData {
  area_ha: number;
  num_parcelas: number;
}

export interface SnciData {
  area_ha: number;
  num_poligonos: number;
}

export interface CarData {
  area_cadastrada_ha: number;
  area_superficie_ha: number;
  area_sem_sobreposicao_ha?: number; // Área sem sobreposição entre CAR (dado iGPP)
  area_com_sobreposicao_ha?: number; // Área com sobreposição entre CAR (a confirmar com iGPP)
  num_imoveis: number;
  perc_sobreposicao?: number;
  ind_densidade_sobreposicao?: number;
}

export interface AreasProtegidas {
  ti_homologada: AreaQuantidade;
  ti_nao_homologada?: AreaQuantidade;
  uc_protecao_integral: AreaQuantidade;
  uc_uso_sustentavel?: AreaQuantidade;
}

export interface TerrasPublicas {
  glebas_publicas: AreaQuantidade;
  fpnd: AreaQuantidade;
  assentamentos_a?: AreaQuantidade;
  assentamentos_b?: AreaQuantidade;
}

export interface Quilombos {
  titulados: AreaQuantidade;
  nao_titulados: AreaQuantidade;
}

export interface OutrasAreas {
  urbanas: { area_ha: number };
  militares: AreaQuantidade;
}

export interface Sobreposicoes {
  sigef_por_car: number;
  car_por_sigef: number;
  car_match_sigef_snci?: number;
  gp_por_car: number;
  fpnd_por_car: number;
  tih_por_car: number;
  tinh_por_car?: number;
  ucpi_por_car: number;
  ucus_por_car?: number;
}

// Sobreposições em hectares (operações compostas)
export interface SobreposicoesHa {
  sigef_x_car_ha: number; // SIGEF × CAR em ha
  car_x_ti_ha?: number; // CAR × TIs em ha
  car_x_fpnd_ha?: number; // CAR × FPND em ha
  car_x_uc_ha?: number; // CAR × UCs em ha
  car_x_glebas_ha?: number; // CAR × Glebas Públicas em ha
}

// Indicadores adicionais (a definir com iGPP)
export interface Indicadores {
  tamanho_medio_sigef_ha?: number; // Tamanho médio polígonos SIGEF
  tamanho_medio_snci_ha?: number; // Tamanho médio polígonos SNCI
  indice_concentracao_sigef?: number; // Indicador de concentração SIGEF
}

export interface BrasilData {
  sigef: SigefData;
  snci: SnciData;
  car: CarData;
  areas_protegidas: AreasProtegidas;
  terras_publicas: TerrasPublicas;
  quilombos: Quilombos;
  outras_areas: OutrasAreas;
  sobreposicoes: Sobreposicoes;
  sobreposicoes_ha?: SobreposicoesHa; // Sobreposições em hectares
  indicadores?: Indicadores; // Indicadores adicionais
  area_total_brasil_ha?: number; // Área total do Brasil para % cobertura
}

export interface RegiaoData {
  codigo: number;
  nome: string; // "MATOPIBA" | "AMACRO" | "AMZL"
  sigef: SigefData;
  snci: SnciData;
  car: Omit<CarData, 'perc_sobreposicao' | 'ind_densidade_sobreposicao'>;
  areas_protegidas: {
    ti_homologada_ha: number;
    uc_protecao_integral_ha: number;
  };
  terras_publicas: {
    glebas_publicas_ha: number;
    fpnd_ha: number;
  };
  sobreposicoes: Pick<Sobreposicoes, 'gp_por_car' | 'fpnd_por_car' | 'tih_por_car' | 'ucpi_por_car'>;
}

// Regiões oficiais do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)
export interface RegiaoOficialData {
  nome: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  ufs: string[]; // Lista de UFs da região
  sigef: SigefData;
  snci: SnciData;
  car: {
    area_cadastrada_ha: number;
    area_sem_sobreposicao_ha?: number;
    num_imoveis: number;
  };
  areas_protegidas: {
    ti_homologada: AreaQuantidade;
    uc_protecao_integral: AreaQuantidade;
  };
  terras_publicas: {
    glebas_publicas: AreaQuantidade;
    fpnd: AreaQuantidade;
  };
  outras_areas: {
    urbanas: { area_ha: number };
  };
  sobreposicoes_ha?: SobreposicoesHa;
  indicadores?: Indicadores;
}

// Dados agregados da Amazônia Legal
export interface AmazoniaLegalData {
  nome: 'Amazônia Legal';
  ufs: string[]; // ['AC', 'AM', 'AP', 'MA', 'MT', 'PA', 'RO', 'RR', 'TO']
  sigef: SigefData;
  snci: SnciData;
  car: {
    area_cadastrada_ha: number;
    area_sem_sobreposicao_ha?: number;
    num_imoveis: number;
  };
  areas_protegidas: {
    ti_homologada: AreaQuantidade;
    uc_protecao_integral: AreaQuantidade;
  };
  terras_publicas: {
    glebas_publicas: AreaQuantidade;
    fpnd: AreaQuantidade;
  };
  outras_areas: {
    urbanas: { area_ha: number };
  };
  sobreposicoes_ha?: SobreposicoesHa;
  indicadores?: Indicadores;
}

export interface EstadoData {
  codigo_ibge: number;
  uf: string;
  area_total_ha?: number; // Área total do estado para cálculo de % cobertura
  sigef: SigefData;
  snci: SnciData;
  car: CarData;
  areas_protegidas: {
    ti_homologada: AreaQuantidade;
    uc_protecao_integral: AreaQuantidade;
  };
  terras_publicas: {
    glebas_publicas: AreaQuantidade;
    fpnd: AreaQuantidade;
  };
  outras_areas?: {
    urbanas?: { area_ha: number };
  };
  sobreposicoes: Sobreposicoes;
  sobreposicoes_ha?: SobreposicoesHa; // Sobreposições em hectares por estado
}

export interface MunicipioSample {
  codigo_ibge: number;
  nome: string;
  sigef_area_ha: number;
  car_area_ha: number;
  sobreposicao_car: number;
}

export interface DashboardData {
  metadata: DashboardMetadata;
  brasil: BrasilData;
  regioes: RegiaoData[]; // MATOPIBA, AMACRO, AMZL (regiões especiais)
  regioes_oficiais: RegiaoOficialData[]; // Norte, Nordeste, Centro-Oeste, Sudeste, Sul
  amazonia_legal: AmazoniaLegalData; // Agregado da Amazônia Legal
  estados: EstadoData[];
  municipios_sample: MunicipioSample[];
}

// Mapeamento de UF para nomes de estados
export const UF_NAMES: Record<string, string> = {
  RO: 'Rondônia',
  AC: 'Acre',
  AM: 'Amazonas',
  RR: 'Roraima',
  PA: 'Pará',
  AP: 'Amapá',
  TO: 'Tocantins',
  MA: 'Maranhão',
  PI: 'Piauí',
  CE: 'Ceará',
  RN: 'Rio Grande do Norte',
  PB: 'Paraíba',
  PE: 'Pernambuco',
  AL: 'Alagoas',
  SE: 'Sergipe',
  BA: 'Bahia',
  MG: 'Minas Gerais',
  ES: 'Espírito Santo',
  RJ: 'Rio de Janeiro',
  SP: 'São Paulo',
  PR: 'Paraná',
  SC: 'Santa Catarina',
  RS: 'Rio Grande do Sul',
  MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso',
  GO: 'Goiás',
  DF: 'Distrito Federal'
};

// Estados da Amazônia Legal
export const AMAZONIA_LEGAL_UFS = ['AC', 'AM', 'AP', 'MA', 'MT', 'PA', 'RO', 'RR', 'TO'] as const;

// Regiões geográficas
export const REGIOES_UFS: Record<string, string[]> = {
  Norte: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC']
};

// Áreas dos estados em hectares (fonte: IBGE)
export const ESTADO_AREAS_HA: Record<string, number> = {
  AC: 16422137,
  AL: 2777977,
  AM: 155932820,
  AP: 14281499,
  BA: 56473419,
  CE: 14890351,
  DF: 577900,
  ES: 4609503,
  GO: 34008669,
  MA: 33193602,
  MG: 58652121,
  MS: 35714561,
  MT: 90336619,
  PA: 124768951,
  PB: 5646860,
  PE: 9831107,
  PI: 25157747,
  PR: 19930792,
  RJ: 4377505,
  RN: 5281135,
  RO: 23759075,
  RR: 22429898,
  RS: 28173060,
  SC: 9573476,
  SE: 2191508,
  SP: 24821950,
  TO: 27762090
};

// Área total do Brasil em hectares
export const BRASIL_AREA_HA = 851487600;

// Área da Amazônia Legal em hectares
export const AMAZONIA_LEGAL_AREA_HA = 501006600;

// Tipos de camadas disponíveis no dashboard
export type CamadaId = 
  | 'sigef' 
  | 'snci' 
  | 'car' 
  | 'ti_homologada' 
  | 'uc_protecao_integral' 
  | 'glebas_publicas' 
  | 'fpnd' 
  | 'urbanas' 
  | 'militares';

// Definição das camadas para o dashboard
export interface CamadaDefinicao {
  id: CamadaId;
  nome: string;
  descricao: string;
  cor: string;
  temPoligonos: boolean;
  fonte?: string;
  status: 'disponivel' | 'a_confirmar' | 'placeholder';
}

export const CAMADAS: CamadaDefinicao[] = [
  { id: 'sigef', nome: 'SIGEF', descricao: 'Sistema de Gestão Fundiária', cor: '#3D5A45', temPoligonos: true, fonte: 'INCRA', status: 'disponivel' },
  { id: 'snci', nome: 'SNCI', descricao: 'Sistema Nacional de Cadastro de Imóveis', cor: '#96694A', temPoligonos: true, fonte: 'INCRA', status: 'disponivel' },
  { id: 'car', nome: 'CAR', descricao: 'Cadastro Ambiental Rural', cor: '#2E7D32', temPoligonos: false, fonte: 'SICAR', status: 'disponivel' },
  { id: 'ti_homologada', nome: 'Terras Indígenas', descricao: 'Terras Indígenas Homologadas', cor: '#8B4513', temPoligonos: true, fonte: 'FUNAI', status: 'disponivel' },
  { id: 'uc_protecao_integral', nome: 'UCs Proteção Integral', descricao: 'Unidades de Conservação de Proteção Integral', cor: '#1B5E20', temPoligonos: true, fonte: 'ICMBio/MMA', status: 'disponivel' },
  { id: 'glebas_publicas', nome: 'Glebas Públicas', descricao: 'Glebas Públicas Federais', cor: '#6B8E23', temPoligonos: true, fonte: 'SPU', status: 'a_confirmar' },
  { id: 'fpnd', nome: 'FPND', descricao: 'Florestas Públicas Não Destinadas', cor: '#228B22', temPoligonos: true, fonte: 'SFB', status: 'disponivel' },
  { id: 'urbanas', nome: 'Malha Urbana', descricao: 'Áreas Urbanas', cor: '#808080', temPoligonos: false, fonte: 'IBGE', status: 'disponivel' },
  { id: 'militares', nome: 'Áreas Militares', descricao: 'Áreas Militares e de Defesa', cor: '#4A4A4A', temPoligonos: true, fonte: 'SPU', status: 'a_confirmar' }
];