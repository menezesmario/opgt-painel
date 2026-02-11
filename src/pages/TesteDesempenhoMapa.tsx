import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import WmsMap from '../components/map/WmsMap';
import { useGeoFilters } from '../hooks/useGeoFilters';
import ErrorBoundary from '../components/ErrorBoundary';
import Skeleton from '../components/ui/Skeleton';

/**
 * Página acessível apenas pela URL (/teste-desempenho-mapa).
 * Não aparece no menu — uso: testar desempenho do WMS (aba Rede, tempo por tile).
 * Mesma camada e filtros do Mapa Fundiário do Dashboard.
 */
const TesteDesempenhoMapa: React.FC = () => {
  const geo = useGeoFilters();

  return (
    <div className="min-h-screen flex flex-col bg-bg-alt">
      <div className="flex-shrink-0 px-4 py-2 bg-white border-b border-border flex items-center justify-between gap-4">
        <span className="text-body-sm text-text-muted">
          Ambiente de teste — desempenho WMS. Abra DevTools (F12) → Rede e filtre por &quot;wms&quot; ou pelo domínio do GeoServer.
        </span>
        <Link
          to="/dashboard"
          className="text-body-sm font-medium text-primary hover:underline"
        >
          Voltar ao Dashboard
        </Link>
      </div>
      <div className="flex-1 relative">
        <ErrorBoundary fallback={
          <div className="h-full flex items-center justify-center text-text-muted p-4">
            Erro ao carregar mapa. <Link to="/dashboard" className="text-primary ml-1">Voltar</Link>
          </div>
        }>
          <Suspense fallback={<Skeleton variant="map" className="h-full min-h-[70vh]" />}>
            <WmsMap
              cqlFilter={geo.cqlFilter}
              bounds={geo.bounds}
              minHeight="calc(100vh - 52px)"
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TesteDesempenhoMapa;
