import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Tag from '../components/ui/Tag';
import Disclaimer from '../components/ui/Disclaimer';
import Skeleton from '../components/ui/Skeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import ScopeBar from '../components/geo/ScopeBar';
import SummaryStrip from '../components/geo/SummaryStrip';
import FilterDrawer from '../components/geo/FilterDrawer';
import ActiveFilterChips from '../components/geo/ActiveFilterChips';
import { useGeoFilters } from '../hooks/useGeoFilters';
import {
  MALHA_STATS,
  BIOMA_COLORS,
  CATEGORIA_FUNDIARIA_COLORS,
  CATEGORIA_FUNDIARIA_LABELS,
} from '../config/geoserver';

// Lazy loading do mapa WMS (componente pesado com Leaflet)
const WmsMap = lazy(() => import('../components/map/WmsMap'));

const formatHa = (v: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' ha';

/**
 * Visualização Geo — Mapa interativo com dados reais do GeoServer/PostGIS
 * Layout: ScopeBar → SummaryStrip → Mapa full-width → FilterDrawer
 */
const VisualizacaoGeo: React.FC = () => {
  const {
    state,
    dispatch,
    cqlFilter,
    scopeOnlyCql,
    useGradualLoad,
    activeFilterCount,
    scopeLabel,
    scopeSublabel,
    bounds,
  } = useGeoFilters();

  const { clickedFeature } = state;

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-12 lg:py-16">
        <Container>
          <div className="max-w-4xl">
            <Tag variant="primary" className="mb-4">Visualização Geoespacial</Tag>
            <h1 className="text-display-xl text-text mb-4">
              Mapa da Malha Fundiária
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Visualização interativa com dados reais de 174.723 polígonos da Malha Fundiária 2025,
              servidos diretamente do PostGIS via GeoServer.
            </p>
          </div>
        </Container>
      </section>

      {/* Scope Bar — sticky */}
      <ScopeBar
        selectedRegiao={state.selectedRegiao}
        selectedEstado={state.selectedEstado}
        onRegiaoChange={(regiao) => dispatch({ type: 'SET_REGIAO', regiao })}
        onEstadoChange={(estado) => dispatch({ type: 'SET_ESTADO', estado })}
        onResetToBrasil={() => dispatch({ type: 'RESET_TO_BRASIL' })}
        onOpenDrawer={() => dispatch({ type: 'TOGGLE_DRAWER' })}
        activeFilterCount={activeFilterCount}
      />

      {/* Summary Strip — métricas dinâmicas */}
      <SummaryStrip
        scopeLabel={scopeLabel}
        scopeSublabel={scopeSublabel}
        registros={MALHA_STATS.total.registros}
        area_ha={MALHA_STATS.total.area_ha}
        biomaCount={MALHA_STATS.por_bioma.length}
        categoriaCount={MALHA_STATS.por_categoria.length}
      />

      {/* Mapa */}
      <section className="py-5 bg-bg-alt">
        <Container>
          {/* Mapa com chips sobrepostos */}
          <div className="relative bg-white border border-border rounded-lg overflow-hidden shadow-card">
            {/* Active filter chips */}
            <ActiveFilterChips
              selectedBiomas={state.selectedBiomas}
              selectedCategoria={state.selectedCategoria}
              onRemoveBioma={(bioma) => dispatch({ type: 'REMOVE_BIOMA', bioma })}
              onRemoveCategoria={() => dispatch({ type: 'REMOVE_CATEGORIA' })}
            />

            <ErrorBoundary fallback={<div className="h-[75vh] flex items-center justify-center text-text-muted">Erro ao carregar mapa</div>}>
              <Suspense fallback={<Skeleton variant="map" className="h-[75vh]" />}>
                <WmsMap
                  cqlFilter={cqlFilter}
                  scopeOnlyCql={scopeOnlyCql}
                  useGradualLoad={useGradualLoad}
                  wmsEnabled
                  onFeatureClick={(props) => dispatch({ type: 'SET_FEATURE', feature: props })}
                  bounds={bounds}
                  minHeight="75vh"
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Detalhes do polígono clicado — abaixo do mapa */}
          {clickedFeature && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-border shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-body-md font-semibold text-text">Detalhes do Polígono</h4>
                <button
                  onClick={() => dispatch({ type: 'SET_FEATURE', feature: null })}
                  className="text-body-xs text-text-muted hover:text-text transition-colors"
                >
                  Fechar
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {clickedFeature.bioma != null && (
                  <div>
                    <div className="text-body-xs text-text-muted uppercase">Bioma</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BIOMA_COLORS[String(clickedFeature.bioma)] || '#999' }} />
                      <span className="text-body-sm font-medium text-text">{String(clickedFeature.bioma)}</span>
                    </div>
                  </div>
                )}
                {clickedFeature.categoria_fundiaria_v2025 != null && (() => {
                  const cat = String(clickedFeature.categoria_fundiaria_v2025);
                  return (
                    <div>
                      <div className="text-body-xs text-text-muted uppercase">Cat. Fundiária</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORIA_FUNDIARIA_COLORS[cat] || '#999' }} />
                        <span className="text-body-sm font-medium text-text">{cat} — {CATEGORIA_FUNDIARIA_LABELS[cat] || ''}</span>
                      </div>
                    </div>
                  );
                })()}
                {clickedFeature.cd_mun != null && (
                  <div>
                    <div className="text-body-xs text-text-muted uppercase">Cód. Município</div>
                    <div className="text-body-sm text-text mt-1">{String(clickedFeature.cd_mun)}</div>
                  </div>
                )}
                {clickedFeature.area_ha != null && (
                  <div>
                    <div className="text-body-xs text-text-muted uppercase">Área</div>
                    <div className="text-body-sm font-semibold text-primary mt-1">{formatHa(Number(clickedFeature.area_ha))}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Barra de fonte de dados */}
          <div className="mt-3 flex items-center justify-between px-4 py-3 bg-white border border-border rounded-md text-[0.78rem] text-text-muted">
            <span>
              Dados: base da Malha Fundiária 2025 (iGPP/OPGT) · Atualização semestral · Próxima: Jun/2026
            </span>
            <Link to="/metodologia" className="text-primary font-semibold hover:underline hidden sm:inline">
              Consultar Metodologia ›
            </Link>
          </div>
        </Container>
      </section>

      {/* Link para Dashboard */}
      <section className="py-12 bg-bg">
        <Container>
          <div className="text-center">
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

          <Disclaimer
            text="Dados provenientes da base da Malha Fundiária 2025 (iGPP/OPGT). Os polígonos são servidos em tempo real via PostGIS/GeoServer. A visualização pode apresentar lentidão em zooms muito abertos devido ao volume de dados (174.723 polígonos)."
            className="mt-8"
          />
        </Container>
      </section>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={state.isDrawerOpen}
        onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
        onApply={(biomas, categoria) =>
          dispatch({ type: 'APPLY_DRAWER_FILTERS', biomas, categoria })
        }
        initialBiomas={state.selectedBiomas}
        initialCategoria={state.selectedCategoria}
      />
    </main>
  );
};

export default VisualizacaoGeo;
