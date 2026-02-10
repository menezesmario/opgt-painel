import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  WMS_URL,
  WMS_TILES_URL,
  GEOSERVER_LAYERS,
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  CATEGORIA_FUNDIARIA_LABELS,
} from '../../config/geoserver';
// Leaflet CSS imported via index.css

// Fix Leaflet default icon issue (CDN fallback)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/** Zoom mínimo para carregar a camada WMS (evita OOM com 174k polígonos) */
const MIN_WMS_ZOOM = 5;

/**
 * Componente WMS que usa L.tileLayer.wms diretamente.
 *
 * O estilo 'malha_categorias' foi registrado no GeoServer como default,
 * com cores distintas por categoria fundiária e fill-opacity 0.7.
 * Só carrega tiles a partir do zoom 6 para evitar sobrecarga no servidor.
 * Mostra indicador de loading enquanto tiles estão carregando.
 */
function WmsLayer({ cqlFilter }: { cqlFilter?: string | null }) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);
  const [isVisible, setIsVisible] = useState(map.getZoom() >= MIN_WMS_ZOOM);
  const [loading, setLoading] = useState(false);
  const pendingTilesRef = useRef(0);

  // Monitora zoom para mostrar/esconder layer
  useEffect(() => {
    const onZoom = () => setIsVisible(map.getZoom() >= MIN_WMS_ZOOM);
    map.on('zoomend', onZoom);
    return () => { map.off('zoomend', onZoom); };
  }, [map]);

  // Cria/remove o layer WMS quando isVisible ou cqlFilter muda
  useEffect(() => {
    // Remove layer anterior se existe
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!isVisible) {
      setLoading(false);
      return;
    }

    const params: Record<string, string | boolean> = {
      layers: GEOSERVER_LAYERS.malhafundiaria.name,
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      srs: 'EPSG:4326',
    };

    if (cqlFilter) {
      params.CQL_FILTER = cqlFilter;
    }

    const wmsLayer = L.tileLayer.wms(WMS_TILES_URL, params);

    // Tracking de loading
    pendingTilesRef.current = 0;

    wmsLayer.on('tileloadstart', () => {
      pendingTilesRef.current++;
      setLoading(true);
    });

    wmsLayer.on('tileload', () => {
      pendingTilesRef.current = Math.max(0, pendingTilesRef.current - 1);
      if (pendingTilesRef.current === 0) setLoading(false);
    });

    wmsLayer.on('tileerror', () => {
      pendingTilesRef.current = Math.max(0, pendingTilesRef.current - 1);
      if (pendingTilesRef.current === 0) setLoading(false);
    });

    wmsLayer.on('load', () => {
      pendingTilesRef.current = 0;
      setLoading(false);
    });

    wmsLayer.addTo(map);
    layerRef.current = wmsLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      setLoading(false);
    };
  }, [map, cqlFilter, isVisible]);

  // Mensagem de zoom mínimo
  if (!isVisible) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '8px 20px',
          borderRadius: 8,
          fontSize: '13px',
          fontWeight: 500,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}
      >
        Aplique zoom para visualizar os polígonos da malha fundiária
      </div>
    );
  }

  // Indicador de carregamento
  if (loading) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          padding: '6px 14px',
          borderRadius: 6,
          fontSize: '12px',
          fontWeight: 500,
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid #ccc',
            borderTopColor: '#2d6a4f',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'wms-spin 0.8s linear infinite',
          }}
        />
        Carregando camada...
        <style>{`@keyframes wms-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return null;
}

interface FeatureInfo {
  latlng: L.LatLng;
  properties: Record<string, unknown>;
}

interface WmsMapProps {
  /** Filtro CQL para a camada WMS (ex: "bioma = 'Amazônia'") */
  cqlFilter?: string | null;
  /** Callback quando clica num polígono e obtém dados */
  onFeatureClick?: (properties: Record<string, unknown>) => void;
  /** Altura mínima do mapa */
  minHeight?: string;
  /** Classe CSS adicional */
  className?: string;
}

/** Componente interno para lidar com cliques e GetFeatureInfo */
function ClickHandler({ onFeatureInfo, cqlFilter }: { onFeatureInfo: (info: FeatureInfo) => void; cqlFilter?: string | null }) {
  useMapEvents({
    click: async (e) => {
      const map = e.target;
      const size = map.getSize();
      const bounds = map.getBounds();
      const point = map.latLngToContainerPoint(e.latlng);

      const params = new URLSearchParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetFeatureInfo',
        layers: GEOSERVER_LAYERS.malhafundiaria.name,
        query_layers: GEOSERVER_LAYERS.malhafundiaria.name,
        info_format: 'application/json',
        feature_count: '1',
        x: Math.round(point.x).toString(),
        y: Math.round(point.y).toString(),
        width: size.x.toString(),
        height: size.y.toString(),
        srs: 'EPSG:4326',
        bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
      });

      // Incluir CQL_FILTER no GetFeatureInfo para consistência com a camada visível
      if (cqlFilter) {
        params.set('CQL_FILTER', cqlFilter);
      }

      try {
        const res = await fetch(`${WMS_URL}?${params}`);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          onFeatureInfo({
            latlng: e.latlng,
            properties: data.features[0].properties,
          });
        }
      } catch (err) {
        console.error('GetFeatureInfo error:', err);
      }
    },
  });
  return null;
}

/** Componente para invalidar tamanho do mapa quando redimensionado */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const formatHa = (v: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v) + ' ha';

/**
 * WmsMap — Mapa Leaflet com camada WMS do GeoServer
 *
 * Exibe a Malha Fundiária 2025 com dados reais do PostGIS.
 * Suporta filtros CQL, clique para detalhes (GetFeatureInfo).
 */
const WmsMap: React.FC<WmsMapProps> = ({
  cqlFilter,
  onFeatureClick,
  minHeight = '500px',
  className = '',
}) => {
  const [popup, setPopup] = useState<FeatureInfo | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleFeatureInfo = useCallback(
    (info: FeatureInfo) => {
      setPopup(info);
      onFeatureClick?.(info.properties);
    },
    [onFeatureClick]
  );

  return (
    <div className={`w-full ${className}`} style={{ minHeight }}>
      <MapContainer
        center={BRAZIL_CENTER}
        zoom={BRAZIL_ZOOM}
        className="w-full h-full rounded-lg"
        style={{ minHeight, background: '#f8f9f6' }}
        maxZoom={18}
        minZoom={3}
        ref={mapRef}
      >
        <MapResizer />

        {/* Base tiles — CartoDB Voyager (fronteiras e labels mais visíveis) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Camada WMS do GeoServer — estilo malha_categorias (cores por categoria fundiária) */}
        <WmsLayer cqlFilter={cqlFilter} />

        {/* Handler de clique para GetFeatureInfo */}
        <ClickHandler onFeatureInfo={handleFeatureInfo} cqlFilter={cqlFilter} />

        {/* Popup com detalhes do polígono */}
        {popup && (
          <Popup
            position={popup.latlng}
            eventHandlers={{ remove: () => setPopup(null) }}
          >
            <div className="min-w-[220px]">
              <h4 className="text-body-md font-semibold text-text mb-2 pb-1 border-b-2 border-primary">
                Detalhes do Polígono
              </h4>
              <table className="w-full text-body-sm">
                <tbody>
                  {popup.properties.bioma != null && (
                    <tr>
                      <td className="py-1 pr-3 text-text-muted font-medium">Bioma</td>
                      <td className="py-1 text-text">{String(popup.properties.bioma ?? '')}</td>
                    </tr>
                  )}
                  {popup.properties.cd_mun != null && (
                    <tr>
                      <td className="py-1 pr-3 text-text-muted font-medium">Município</td>
                      <td className="py-1 text-text">{String(popup.properties.cd_mun ?? '')}</td>
                    </tr>
                  )}
                  {popup.properties.categoria_fundiaria_v2025 != null && (() => {
                    const cat = String(popup.properties.categoria_fundiaria_v2025 ?? '');
                    return (
                      <tr>
                        <td className="py-1 pr-3 text-text-muted font-medium">Cat. Fundiária</td>
                        <td className="py-1 text-text">
                          <span className="font-medium">{cat}</span>
                          <br />
                          <span className="text-body-xs text-text-secondary">
                            {CATEGORIA_FUNDIARIA_LABELS[cat] || ''}
                          </span>
                        </td>
                      </tr>
                    );
                  })()}
                  {popup.properties.categoria_declaratoria_v2025 != null && (
                    <tr>
                      <td className="py-1 pr-3 text-text-muted font-medium">Cat. Declaratória</td>
                      <td className="py-1 text-text">{String(popup.properties.categoria_declaratoria_v2025 ?? '')}</td>
                    </tr>
                  )}
                  {popup.properties.area_ha != null && (
                    <tr>
                      <td className="py-1 pr-3 text-text-muted font-medium">Área</td>
                      <td className="py-1 text-text font-semibold">
                        {formatHa(Number(popup.properties.area_ha))}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default WmsMap;
