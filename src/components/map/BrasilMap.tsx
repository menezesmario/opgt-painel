import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { EstadoData, UF_NAMES, CamadaId, CAMADAS, ESTADO_AREAS_HA } from '../../types/dashboard';
import Card from '../ui/Card';

// URL do GeoJSON simplificado do Brasil (estados)
const BRAZIL_GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

export type MapMode = 'hectares' | 'cobertura_pct';

interface BrasilMapProps {
  estados: EstadoData[];
  selectedUf?: string | null;
  onStateClick?: (uf: string) => void;
  /** ID da camada a ser visualizada. Default: 'sigef' */
  layerId?: CamadaId;
  /** Modo de visualização: hectares absolutos ou % cobertura. Default: 'hectares' */
  mode?: MapMode;
  /** Cor base para a escala (opcional, usa a cor da camada se não informado) */
  baseColor?: string;
}

// Função para extrair valor de área de uma camada em um estado
const getLayerValue = (estado: EstadoData, layerId: CamadaId): number => {
  switch (layerId) {
    case 'sigef':
      return estado.sigef.area_ha;
    case 'snci':
      return estado.snci.area_ha;
    case 'car':
      return estado.car.area_cadastrada_ha;
    case 'ti_homologada':
      return estado.areas_protegidas.ti_homologada.area_ha;
    case 'uc_protecao_integral':
      return estado.areas_protegidas.uc_protecao_integral.area_ha;
    case 'glebas_publicas':
      return estado.terras_publicas.glebas_publicas.area_ha;
    case 'fpnd':
      return estado.terras_publicas.fpnd.area_ha;
    case 'urbanas':
      return estado.outras_areas?.urbanas?.area_ha ?? 0;
    case 'militares':
      return 0; // Não disponível por estado
    default:
      return 0;
  }
};

// Gera escala de cores baseada em uma cor base
const generateColorScale = (baseColor: string): string[] => {
  // Para simplificar, usamos uma escala fixa de verdes ou âmbares
  // baseada na cor principal
  if (baseColor.includes('96694A') || baseColor.includes('B0825D')) {
    // Âmbar/marrom
    return ['#F5E6D3', '#D4B896', '#B0825D', '#96694A', '#7A5038'];
  }
  // Verde (default)
  return ['#C8E6C9', '#81C784', '#4CAF50', '#2E7D32', '#1B5E20'];
};

// Determina a cor baseada no valor e na escala
const getColorByValue = (value: number, maxValue: number, colorScale: string[]): string => {
  if (value <= 0 || maxValue <= 0) return '#E5E7EB';
  
  const ratio = value / maxValue;
  if (ratio >= 0.8) return colorScale[4];
  if (ratio >= 0.6) return colorScale[3];
  if (ratio >= 0.4) return colorScale[2];
  if (ratio >= 0.2) return colorScale[1];
  return colorScale[0];
};

// Determina a cor baseada na % de cobertura
const getColorByPct = (pct: number, colorScale: string[]): string => {
  if (pct <= 0) return '#E5E7EB';
  if (pct >= 0.5) return colorScale[4]; // >= 50%
  if (pct >= 0.3) return colorScale[3]; // >= 30%
  if (pct >= 0.15) return colorScale[2]; // >= 15%
  if (pct >= 0.05) return colorScale[1]; // >= 5%
  return colorScale[0]; // < 5%
};

const BrasilMap: React.FC<BrasilMapProps> = ({ 
  estados, 
  selectedUf, 
  onStateClick,
  layerId = 'sigef',
  mode = 'hectares',
  baseColor
}) => {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  // Obtém a cor da camada ou usa a fornecida
  const layerColor = baseColor ?? CAMADAS.find(c => c.id === layerId)?.cor ?? '#3D5A45';
  const colorScale = useMemo(() => generateColorScale(layerColor), [layerColor]);

  // Cria um mapa de UF -> dados do estado
  const estadosMap = useMemo(() => {
    const map = new Map<string, EstadoData>();
    estados.forEach((e) => map.set(e.uf, e));
    return map;
  }, [estados]);

  // Calcula o valor máximo para a escala (modo hectares)
  const maxValue = useMemo(() => {
    return Math.max(...estados.map(e => getLayerValue(e, layerId)));
  }, [estados, layerId]);

  const formatHa = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' ha';
  const formatPct = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(v);

  const handleGeographyClick = (geo: { properties?: Record<string, unknown> }) => {
    const props = geo.properties || {};
    const uf = (props.sigla || props.UF || props.uf || props.SIGLA || '') as string;
    if (uf && onStateClick) {
      onStateClick(uf);
    }
  };

  const handleMouseMove = (geo: { properties?: Record<string, unknown> }, event: React.MouseEvent<SVGPathElement>) => {
    const props = geo.properties || {};
    const uf = (
      props.sigla ||
      props.UF ||
      props.uf ||
      props.SIGLA ||
      (props.CD_UF ? String(props.CD_UF) : '') ||
      ''
    ) as string;

    if (uf) {
      const estadoData = estadosMap.get(uf);
      const nomeEstado = UF_NAMES[uf] || uf;
      const value = estadoData ? getLayerValue(estadoData, layerId) : 0;
      const areaEstado = ESTADO_AREAS_HA[uf] ?? 1;
      const pctCobertura = value / areaEstado;
      
      const displayValue = mode === 'hectares' 
        ? formatHa(value)
        : formatPct(pctCobertura);
      
      const container = event.currentTarget.closest('.relative') as HTMLElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setTooltip({ content: `${nomeEstado}: ${displayValue}`, x, y });
      }
    }
  };

  const handleMouseEnter = (geo: { properties?: Record<string, unknown> }, event: React.MouseEvent<SVGPathElement>) => {
    handleMouseMove(geo, event);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 850,
          center: [-54, -15]
        }}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={BRAZIL_GEO_URL}>
            {({ geographies }: { geographies: Array<{ rsmKey: string; properties?: Record<string, unknown> }> }) =>
              geographies.map((geo) => {
                const props = geo.properties || {};
                const uf = (
                  props.sigla ||
                  props.UF ||
                  props.uf ||
                  props.SIGLA ||
                  (props.CD_UF ? String(props.CD_UF) : '') ||
                  ''
                ) as string;

                const estadoData = uf ? estadosMap.get(uf) : null;
                const value = estadoData ? getLayerValue(estadoData, layerId) : 0;
                const areaEstado = ESTADO_AREAS_HA[uf] ?? 1;
                const pctCobertura = value / areaEstado;
                const isSelected = selectedUf === uf;

                // Cor baseada no modo
                let fillColor: string;
                if (isSelected) {
                  fillColor = '#96694A'; // Terra-ambar quando selecionado
                } else if (!estadoData) {
                  fillColor = '#E5E7EB'; // Cinza se não houver dados
                } else if (mode === 'hectares') {
                  fillColor = getColorByValue(value, maxValue, colorScale);
                } else {
                  fillColor = getColorByPct(pctCobertura, colorScale);
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 2 : 0.8}
                    style={{
                      default: {
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      },
                      hover: {
                        fill: isSelected ? '#96694A' : colorScale[3],
                        outline: 'none',
                        strokeWidth: 1.5
                      },
                      pressed: {
                        fill: '#96694A',
                        outline: 'none'
                      }
                    }}
                    onClick={() => handleGeographyClick(geo)}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseMove={(e) => handleMouseMove(geo, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-text text-white px-3 py-1.5 rounded-md text-body-sm font-medium shadow-lg whitespace-nowrap"
          style={{
            left: `${tooltip.x + 12}px`,
            top: `${tooltip.y - 8}px`,
            transform: 'translateY(-100%)'
          }}
        >
          {tooltip.content}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text"
            style={{ marginTop: '-1px' }}
          />
        </div>
      )}
    </div>
  );
};

// Componente de Legenda Dinâmica
interface MapLegendProps {
  /** ID da camada sendo visualizada */
  layerId?: CamadaId;
  /** Modo de visualização */
  mode?: MapMode;
  /** Cor base (opcional) */
  baseColor?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ 
  layerId = 'sigef', 
  mode = 'hectares',
  baseColor
}) => {
  const camada = CAMADAS.find(c => c.id === layerId);
  const layerColor = baseColor ?? camada?.cor ?? '#3D5A45';
  const colorScale = generateColorScale(layerColor);
  
  const rangesHectares = [
    { label: '> 80% do máximo', color: colorScale[4] },
    { label: '60 - 80%', color: colorScale[3] },
    { label: '40 - 60%', color: colorScale[2] },
    { label: '20 - 40%', color: colorScale[1] },
    { label: '< 20%', color: colorScale[0] }
  ];

  const rangesCobertura = [
    { label: '> 50% cobertura', color: colorScale[4] },
    { label: '30 - 50%', color: colorScale[3] },
    { label: '15 - 30%', color: colorScale[2] },
    { label: '5 - 15%', color: colorScale[1] },
    { label: '< 5%', color: colorScale[0] }
  ];

  const ranges = mode === 'hectares' ? rangesHectares : rangesCobertura;

  return (
    <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
      <h4 className="text-body-sm font-semibold text-text mb-1">{camada?.nome ?? 'Camada'}</h4>
      <p className="text-body-xs text-text-muted mb-3">
        {mode === 'hectares' ? 'Área em hectares' : '% de cobertura do estado'}
      </p>
      <div className="space-y-2">
        {ranges.map((range) => (
          <div key={range.label} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-sm border border-border"
              style={{ backgroundColor: range.color }}
            />
            <span className="text-body-sm text-text-secondary">{range.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Detalhes do Estado
interface EstadoDetailsProps {
  estado: EstadoData | null;
  /** ID da camada sendo visualizada */
  layerId?: CamadaId;
}

export const EstadoDetails: React.FC<EstadoDetailsProps> = ({ estado, layerId = 'sigef' }) => {
  if (!estado) {
    return (
      <Card variant="elevated" className="h-full">
        <div className="text-center py-12">
          <p className="text-body-md text-text-secondary">
            Clique em um estado no mapa para ver os detalhes
          </p>
        </div>
      </Card>
    );
  }

  const formatHa = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' ha';
  const formatNum = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);
  const formatPct = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(v);

  const camada = CAMADAS.find(c => c.id === layerId);
  const layerValue = getLayerValue(estado, layerId);
  const areaEstado = estado.area_total_ha ?? ESTADO_AREAS_HA[estado.uf] ?? 1;
  const pctCobertura = layerValue / areaEstado;

  // Dados complementares baseados na camada
  const getQuantidade = () => {
    switch (layerId) {
      case 'sigef':
        return estado.sigef.num_parcelas;
      case 'snci':
        return estado.snci.num_poligonos;
      case 'car':
        return estado.car.num_imoveis;
      case 'ti_homologada':
        return estado.areas_protegidas.ti_homologada.quantidade;
      case 'uc_protecao_integral':
        return estado.areas_protegidas.uc_protecao_integral.quantidade;
      case 'glebas_publicas':
        return estado.terras_publicas.glebas_publicas.quantidade;
      case 'fpnd':
        return estado.terras_publicas.fpnd.quantidade;
      default:
        return null;
    }
  };

  const quantidade = getQuantidade();

  return (
    <Card variant="elevated" className="h-full">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-display-md font-bold text-text">{estado.uf}</span>
            <span className="text-body-sm text-text-secondary">Código: {estado.codigo_ibge}</span>
          </div>
          <p className="text-body-md text-text-secondary mt-1">{UF_NAMES[estado.uf] ?? '—'}</p>
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-body-sm font-semibold text-text mb-3" style={{ color: camada?.cor }}>
            {camada?.nome}
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="text-body-sm text-text-muted">Área</div>
              <div className="text-display-sm font-semibold text-text">{formatHa(layerValue)}</div>
            </div>
            
            {quantidade != null && (
              <div>
                <div className="text-body-sm text-text-muted">
                  {camada?.temPoligonos ? 'Polígonos/Parcelas' : 'Registros'}
                </div>
                <div className="text-display-sm font-semibold text-text">{formatNum(quantidade)}</div>
              </div>
            )}

            <div>
              <div className="text-body-sm text-text-muted">Cobertura do Estado</div>
              <div className="text-display-sm font-semibold text-text">{formatPct(pctCobertura)}</div>
              <div className="mt-2 h-2 bg-bg-alt rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(pctCobertura * 100, 100)}%`,
                    backgroundColor: camada?.cor ?? '#3D5A45'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dados adicionais para SIGEF/CAR */}
        {(layerId === 'sigef' || layerId === 'car') && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-body-sm font-semibold text-text mb-3">Sobreposições</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-body-xs text-text-muted">TI sobre CAR</div>
                <div className="text-body-md font-semibold text-[#3D5A45]">
                  {formatPct(estado.sobreposicoes.tih_por_car ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-body-xs text-text-muted">UC sobre CAR</div>
                <div className="text-body-md font-semibold text-[#2563EB]">
                  {formatPct(estado.sobreposicoes.ucpi_por_car ?? 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BrasilMap;
