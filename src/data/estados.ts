/**
 * Dados de estados e regiões do Brasil
 * Mapeamento UF → código IBGE (2 dígitos) → nome → região
 * Usado para filtros CQL no WMS (cd_mun LIKE 'XX%')
 */

export interface Estado {
  uf: string;
  nome: string;
  codigoIBGE: string; // 2 dígitos — prefixo do cd_mun
  regiao: string;
}

export const REGIOES = [
  'Norte',
  'Nordeste',
  'Centro-Oeste',
  'Sudeste',
  'Sul',
] as const;

export type Regiao = (typeof REGIOES)[number];

export const ESTADOS: Estado[] = [
  // Norte
  { uf: 'AC', nome: 'Acre', codigoIBGE: '12', regiao: 'Norte' },
  { uf: 'AP', nome: 'Amapá', codigoIBGE: '16', regiao: 'Norte' },
  { uf: 'AM', nome: 'Amazonas', codigoIBGE: '13', regiao: 'Norte' },
  { uf: 'PA', nome: 'Pará', codigoIBGE: '15', regiao: 'Norte' },
  { uf: 'RO', nome: 'Rondônia', codigoIBGE: '11', regiao: 'Norte' },
  { uf: 'RR', nome: 'Roraima', codigoIBGE: '14', regiao: 'Norte' },
  { uf: 'TO', nome: 'Tocantins', codigoIBGE: '17', regiao: 'Norte' },
  // Nordeste
  { uf: 'AL', nome: 'Alagoas', codigoIBGE: '27', regiao: 'Nordeste' },
  { uf: 'BA', nome: 'Bahia', codigoIBGE: '29', regiao: 'Nordeste' },
  { uf: 'CE', nome: 'Ceará', codigoIBGE: '23', regiao: 'Nordeste' },
  { uf: 'MA', nome: 'Maranhão', codigoIBGE: '21', regiao: 'Nordeste' },
  { uf: 'PB', nome: 'Paraíba', codigoIBGE: '25', regiao: 'Nordeste' },
  { uf: 'PE', nome: 'Pernambuco', codigoIBGE: '26', regiao: 'Nordeste' },
  { uf: 'PI', nome: 'Piauí', codigoIBGE: '22', regiao: 'Nordeste' },
  { uf: 'RN', nome: 'Rio Grande do Norte', codigoIBGE: '24', regiao: 'Nordeste' },
  { uf: 'SE', nome: 'Sergipe', codigoIBGE: '28', regiao: 'Nordeste' },
  // Centro-Oeste
  { uf: 'DF', nome: 'Distrito Federal', codigoIBGE: '53', regiao: 'Centro-Oeste' },
  { uf: 'GO', nome: 'Goiás', codigoIBGE: '52', regiao: 'Centro-Oeste' },
  { uf: 'MT', nome: 'Mato Grosso', codigoIBGE: '51', regiao: 'Centro-Oeste' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', codigoIBGE: '50', regiao: 'Centro-Oeste' },
  // Sudeste
  { uf: 'ES', nome: 'Espírito Santo', codigoIBGE: '32', regiao: 'Sudeste' },
  { uf: 'MG', nome: 'Minas Gerais', codigoIBGE: '31', regiao: 'Sudeste' },
  { uf: 'RJ', nome: 'Rio de Janeiro', codigoIBGE: '33', regiao: 'Sudeste' },
  { uf: 'SP', nome: 'São Paulo', codigoIBGE: '35', regiao: 'Sudeste' },
  // Sul
  { uf: 'PR', nome: 'Paraná', codigoIBGE: '41', regiao: 'Sul' },
  { uf: 'RS', nome: 'Rio Grande do Sul', codigoIBGE: '43', regiao: 'Sul' },
  { uf: 'SC', nome: 'Santa Catarina', codigoIBGE: '42', regiao: 'Sul' },
];

/** Retorna estados de uma região */
export const getEstadosByRegiao = (regiao: string): Estado[] =>
  ESTADOS.filter((e) => e.regiao === regiao);

/**
 * Constrói filtro CQL para cd_mun baseado nos estados selecionados.
 * cd_mun é INTEGER no PostGIS (código IBGE de 7 dígitos, ex: 1501402 = Belém/PA).
 * Usa comparação numérica (range) em vez de LIKE para compatibilidade e performance.
 * Código IBGE "15" (2 dígitos) → cd_mun >= 1500000 AND cd_mun < 1600000
 */
export const buildEstadoCqlFilter = (codigosIBGE: string[]): string | null => {
  if (codigosIBGE.length === 0) return null;

  const buildRange = (code: string) => {
    const prefix = parseInt(code, 10);
    const min = prefix * 100000;       // ex: 15 → 1500000
    const max = (prefix + 1) * 100000; // ex: 15 → 1600000
    return `(cd_mun >= ${min} AND cd_mun < ${max})`;
  };

  if (codigosIBGE.length === 1) return buildRange(codigosIBGE[0]);

  const parts = codigosIBGE.map(buildRange);
  return `(${parts.join(' OR ')})`;
};
