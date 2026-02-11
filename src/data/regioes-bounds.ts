/**
 * Bounding boxes para regiões e estados do Brasil
 * Formato: [[sul, oeste], [norte, leste]] (LatLngBoundsLiteral do Leaflet)
 * Usado para flyToBounds ao mudar escopo geográfico no mapa
 */

export type LatLngBounds = [[number, number], [number, number]];

/** Bounding boxes aproximados das 5 regiões geográficas */
export const REGIAO_BOUNDS: Record<string, LatLngBounds> = {
  Norte: [[-13.83, -73.99], [5.27, -44.0]],
  Nordeste: [[-18.35, -48.5], [-2.5, -34.8]],
  'Centro-Oeste': [[-24.1, -61.65], [-7.3, -45.9]],
  Sudeste: [[-25.3, -53.1], [-14.2, -39.7]],
  Sul: [[-33.75, -57.65], [-22.5, -48.0]],
};

/** Bounding boxes por código IBGE (2 dígitos) — todos os 27 estados */
export const ESTADO_BOUNDS: Record<string, LatLngBounds> = {
  // Norte
  '12': [[-11.15, -73.99], [-7.11, -66.62]],  // AC
  '16': [[-1.23, -51.65], [4.44, -49.88]],     // AP
  '13': [[-9.82, -73.79], [2.25, -56.10]],     // AM
  '15': [[-9.85, -58.90], [2.59, -46.06]],     // PA
  '11': [[-13.69, -66.62], [-7.97, -59.77]],   // RO
  '14': [[-1.58, -64.82], [5.27, -58.88]],     // RR
  '17': [[-13.47, -50.73], [-5.17, -45.73]],   // TO
  // Nordeste
  '27': [[-10.50, -37.56], [-8.81, -35.15]],   // AL
  '29': [[-18.35, -46.62], [-8.53, -37.34]],   // BA
  '23': [[-7.86, -41.42], [-2.78, -37.25]],    // CE
  '21': [[-10.26, -48.76], [-1.04, -41.82]],   // MA
  '25': [[-8.31, -38.77], [-6.02, -34.79]],    // PB
  '26': [[-9.48, -41.36], [-7.33, -34.86]],    // PE
  '22': [[-10.93, -45.99], [-2.74, -40.37]],   // PI
  '24': [[-6.98, -37.25], [-4.83, -34.95]],    // RN
  '28': [[-11.57, -38.25], [-9.51, -36.39]],   // SE
  // Centro-Oeste
  '53': [[-16.05, -48.29], [-15.26, -47.31]],  // DF
  '52': [[-19.50, -53.25], [-12.39, -45.91]],  // GO
  '51': [[-18.04, -61.63], [-7.35, -50.22]],   // MT
  '50': [[-24.07, -58.16], [-17.17, -53.26]],  // MS
  // Sudeste
  '32': [[-21.30, -41.87], [-17.89, -39.67]],  // ES
  '31': [[-22.92, -51.05], [-14.23, -39.86]],  // MG
  '33': [[-23.37, -44.89], [-20.76, -40.96]],  // RJ
  '35': [[-25.31, -53.11], [-19.78, -44.16]],  // SP
  // Sul
  '41': [[-26.72, -54.62], [-22.52, -48.02]],  // PR
  '43': [[-33.75, -57.65], [-27.08, -49.69]],  // RS
  '42': [[-29.39, -53.84], [-25.95, -48.55]],  // SC
};

/**
 * Resolve bounding box para o escopo geográfico atual.
 * Retorna null para "Brasil" (volta ao centro/zoom default).
 */
export function getBoundsForScope(
  regiao: string,
  estadoCodigoIBGE: string
): LatLngBounds | null {
  if (estadoCodigoIBGE) {
    return ESTADO_BOUNDS[estadoCodigoIBGE] || null;
  }
  if (regiao) {
    return REGIAO_BOUNDS[regiao] || null;
  }
  return null;
}
