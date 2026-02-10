import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Tag from '../components/ui/Tag';
import Disclaimer from '../components/ui/Disclaimer';
import Skeleton from '../components/ui/Skeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  MALHA_STATS,
  BIOMA_COLORS,
  CATEGORIA_FUNDIARIA_COLORS,
  CATEGORIA_FUNDIARIA_LABELS,
} from '../config/geoserver';

// Lazy loading do mapa WMS (componente pesado com Leaflet)
const WmsMap = lazy(() => import('../components/map/WmsMap'));

/**
 * Visualização Geo — Mapa interativo com dados reais do GeoServer/PostGIS
 * Exibe a Malha Fundiária 2025 com 174.723 polígonos via WMS
 */
const VisualizacaoGeo: React.FC = () => {
  const [selectedBiomas, setSelectedBiomas] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [clickedFeature, setClickedFeature] = useState<Record<string, unknown> | null>(null);

  const formatHa = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' ha';
  const formatNum = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  // Constrói o filtro CQL baseado na seleção
  const buildCqlFilter = (): string | null => {
    const parts: string[] = [];
    if (selectedBiomas.length > 0) {
      const list = selectedBiomas.map((b) => `'${b}'`).join(',');
      parts.push(`bioma IN (${list})`);
    }
    if (selectedCategoria) {
      parts.push(`categoria_fundiaria_v2025 = '${selectedCategoria}'`);
    }
    return parts.length > 0 ? parts.join(' AND ') : null;
  };

  const handleBiomaToggle = (bioma: string) => {
    setSelectedBiomas((prev) =>
      prev.includes(bioma) ? prev.filter((b) => b !== bioma) : [...prev, bioma]
    );
  };

  const handleCategoriaChange = (cat: string) => {
    setSelectedCategoria(cat);
  };

  const clearFilters = () => {
    setSelectedBiomas([]);
    setSelectedCategoria('');
    setClickedFeature(null);
  };

  const hasFilters = selectedBiomas.length > 0 || !!selectedCategoria;
  const cqlFilter = buildCqlFilter();

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl">
            <Tag variant="primary" className="mb-4">Visualização Geoespacial</Tag>
            <h1 className="text-display-xl text-text mb-6">
              Mapa da Malha Fundiária
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Visualização interativa com dados reais de 174.723 polígonos da Malha Fundiária 2025,
              servidos diretamente do PostGIS via GeoServer.
              Clique no mapa para detalhes de cada polígono.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-white rounded text-body-sm text-text-secondary border border-border">
                <strong className="text-primary">Fonte:</strong> iGPP / OPGT
              </span>
              <span className="px-3 py-1.5 bg-white rounded text-body-sm text-text-secondary border border-border">
                <strong className="text-primary">Ano:</strong> 2025
              </span>
              <span className="px-3 py-1.5 bg-white rounded text-body-sm text-text-secondary border border-border">
                <strong className="text-primary">Registros:</strong> {formatNum(MALHA_STATS.total.registros)}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Conteúdo Principal */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Sidebar Esquerda — Filtros */}
            <div className="lg:col-span-3 space-y-4">
              {/* Stats */}
              <Card variant="elevated">
                <h3 className="text-display-sm text-text mb-4">Resumo Brasil</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-body-xs text-text-muted uppercase">Polígonos</div>
                    <div className="text-display-sm font-semibold text-primary">
                      {formatNum(MALHA_STATS.total.registros)}
                    </div>
                  </div>
                  <div>
                    <div className="text-body-xs text-text-muted uppercase">Área Total</div>
                    <div className="text-display-sm font-semibold text-primary">
                      {(MALHA_STATS.total.area_ha / 1_000_000).toFixed(0)} M ha
                    </div>
                  </div>
                </div>
              </Card>

              {/* Filtro por Bioma */}
              <Card variant="elevated">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-body-md font-semibold text-text">Filtrar por Bioma</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-body-xs text-red-500 hover:text-red-700 transition-colors">
                      Limpar
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {MALHA_STATS.por_bioma.map((item) => (
                    <label
                      key={item.bioma}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all
                        ${selectedBiomas.includes(item.bioma)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30 bg-white'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBiomas.includes(item.bioma)}
                        onChange={() => handleBiomaToggle(item.bioma)}
                        className="accent-primary"
                      />
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: BIOMA_COLORS[item.bioma] || '#999' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm text-text">{item.bioma}</div>
                        <div className="text-body-xs text-text-muted">
                          {(item.area_ha / 1_000_000).toFixed(0)} M ha
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Filtro por Categoria Fundiária */}
              <Card variant="elevated">
                <h3 className="text-body-md font-semibold text-text mb-3">Categoria Fundiária</h3>
                <select
                  value={selectedCategoria}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-body-sm text-text focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Todas as categorias</option>
                  {MALHA_STATS.por_categoria.map((cat) => (
                    <option key={cat.sigla} value={cat.sigla}>
                      {cat.sigla} — {cat.nome}
                    </option>
                  ))}
                </select>
              </Card>
            </div>

            {/* Mapa Principal */}
            <div className="lg:col-span-6">
              <Card variant="elevated" className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-display-sm text-text">Malha Fundiária 2025</h3>
                    <p className="text-body-sm text-text-secondary">
                      {hasFilters ? 'Filtro aplicado — ' : ''}Clique em um polígono para detalhes
                    </p>
                  </div>
                  {hasFilters && (
                    <Tag variant="primary" className="text-xs">Filtro ativo</Tag>
                  )}
                </div>
                <ErrorBoundary fallback={<div className="h-[500px] flex items-center justify-center text-text-muted">Erro ao carregar mapa</div>}>
                  <Suspense fallback={<Skeleton variant="map" className="h-[500px]" />}>
                    <WmsMap
                      cqlFilter={cqlFilter}
                      onFeatureClick={setClickedFeature}
                      minHeight="500px"
                    />
                  </Suspense>
                </ErrorBoundary>
              </Card>
            </div>

            {/* Sidebar Direita — Detalhes */}
            <div className="lg:col-span-3 space-y-4">
              <Card variant="elevated">
                <h3 className="text-body-md font-semibold text-text mb-4">Detalhes do Polígono</h3>
                {clickedFeature ? (
                  <div className="space-y-4">
                    {clickedFeature.bioma != null && (
                      <div>
                        <div className="text-body-xs text-text-muted uppercase">Bioma</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BIOMA_COLORS[String(clickedFeature.bioma)] || '#999' }} />
                          <span className="text-body-md font-medium text-text">{String(clickedFeature.bioma)}</span>
                        </div>
                      </div>
                    )}
                    {clickedFeature.categoria_fundiaria_v2025 != null && (() => {
                      const cat = String(clickedFeature.categoria_fundiaria_v2025);
                      return (
                        <div>
                          <div className="text-body-xs text-text-muted uppercase">Categoria Fundiária</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORIA_FUNDIARIA_COLORS[cat] || '#999' }} />
                            <div>
                              <span className="text-body-md font-semibold text-text">{cat}</span>
                              <div className="text-body-xs text-text-secondary">
                                {CATEGORIA_FUNDIARIA_LABELS[cat] || ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {clickedFeature.categoria_declaratoria_v2025 != null && (
                      <div>
                        <div className="text-body-xs text-text-muted uppercase">Cat. Declaratória</div>
                        <div className="text-body-md text-text mt-1">{String(clickedFeature.categoria_declaratoria_v2025)}</div>
                      </div>
                    )}
                    {clickedFeature.cd_mun != null && (
                      <div>
                        <div className="text-body-xs text-text-muted uppercase">Cód. Município</div>
                        <div className="text-body-md text-text mt-1">{String(clickedFeature.cd_mun)}</div>
                      </div>
                    )}
                    {clickedFeature.area_ha != null && (
                      <div className="pt-3 border-t border-border">
                        <div className="text-body-xs text-text-muted uppercase">Área</div>
                        <div className="text-display-sm font-semibold text-primary mt-1">
                          {formatHa(Number(clickedFeature.area_ha))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <p className="text-body-sm text-text-secondary">Clique em um polígono no mapa para ver os detalhes</p>
                  </div>
                )}
              </Card>

              {/* Legenda biomas */}
              <Card variant="elevated">
                <h3 className="text-body-md font-semibold text-text mb-3">Biomas</h3>
                <div className="space-y-2">
                  {MALHA_STATS.por_bioma.map((item) => (
                    <div key={item.bioma} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BIOMA_COLORS[item.bioma] || '#999' }} />
                        <span className="text-body-sm text-text">{item.bioma}</span>
                      </div>
                      <span className="text-body-xs text-text-muted">{(item.area_ha / 1_000_000).toFixed(0)}M ha</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Link para Dashboard */}
          <div className="mt-8 text-center relative z-10">
            <p className="text-body-md text-text-secondary mb-4">
              Para análises detalhadas com gráficos e regionalizações, acesse o Dashboard completo.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Acessar Dashboard Completo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Disclaimer */}
          <Disclaimer
            text="Dados provenientes da base da Malha Fundiária 2025 (iGPP/OPGT). Os polígonos são servidos em tempo real via PostGIS/GeoServer. A visualização pode apresentar lentidão em zooms muito abertos devido ao volume de dados (174.723 polígonos)."
            className="mt-8 relative z-10"
          />
        </Container>
      </section>
    </main>
  );
};

export default VisualizacaoGeo;
