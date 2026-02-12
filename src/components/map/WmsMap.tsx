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
  CATEGORIA_FUNDIARIA_GRADUAL_ORDER,
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
const MIN_WMS_ZOOM = 4;

/** Timeout em ms após o qual consideramos falha (GeoServer inativo) */
const LOAD_TIMEOUT_MS = 30000;

/** Número de tentativas automáticas antes de mostrar erro ao usuário */
const MAX_AUTO_RETRIES = 2;

/** Intervalo em ms entre tentativas automáticas */
const AUTO_RETRY_DELAY_MS = 12000;

/** Intervalo em ms entre cada categoria no carregamento gradual */
const GRADUAL_LAYER_DELAY_MS = 2000;

/**
 * Componente WMS que usa L.tileLayer.wms diretamente.
 *
 * O estilo 'malha_categorias' foi registrado no GeoServer como default,
 * com cores distintas por categoria fundiária e fill-opacity 0.7.
 * Só carrega tiles a partir do zoom 6 para evitar sobrecarga no servidor.
 * Mostra indicador de loading enquanto tiles estão carregando.
 * Em caso de timeout ou muitos tiles com erro, mostra estado de erro e botão "Tentar novamente".
 */
function WmsLayer({
  cqlFilter,
  showLoadingIndicator = true,
  layerId,
  onLoadingChange,
}: {
  cqlFilter?: string | null;
  /** Quando false, não exibe spinner/erro (útil no carregamento gradual). */
  showLoadingIndicator?: boolean;
  /** Identificador da camada; usado com onLoadingChange para reportar carregamento ao pai. */
  layerId?: string;
  /** Chamado quando o estado de carregamento dos tiles muda (para agregar no pai). */
  onLoadingChange?: (id: string, loading: boolean) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);
  const [isVisible, setIsVisible] = useState(map.getZoom() >= MIN_WMS_ZOOM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const [retryInSeconds, setRetryInSeconds] = useState<number | null>(null);
  const pendingTilesRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tilesStartedRef = useRef(0);
  const tilesErroredRef = useRef(0);
  const autoRetriesUsedRef = useRef(0);

  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearAutoRetryTimeout = useCallback(() => {
    if (autoRetryTimeoutRef.current) {
      clearTimeout(autoRetryTimeoutRef.current);
      autoRetryTimeoutRef.current = null;
    }
  }, []);

  /** Marca falha: faz auto-retry até MAX_AUTO_RETRIES vezes; depois mostra erro. */
  const setErrorOrAutoRetry = useCallback(() => {
    clearLoadingTimeout();
    setLoading(false);
    if (autoRetriesUsedRef.current < MAX_AUTO_RETRIES) {
      autoRetriesUsedRef.current++;
      setIsAutoRetrying(true);
      setRetryInSeconds(Math.ceil(AUTO_RETRY_DELAY_MS / 1000));
      autoRetryTimeoutRef.current = setTimeout(() => {
        autoRetryTimeoutRef.current = null;
        setRetryCount((c) => c + 1);
        setIsAutoRetrying(false);
        setRetryInSeconds(null);
      }, AUTO_RETRY_DELAY_MS);
    } else {
      setError(true);
    }
  }, [clearLoadingTimeout]);

  // Monitora zoom para mostrar/esconder layer
  useEffect(() => {
    const onZoom = () => setIsVisible(map.getZoom() >= MIN_WMS_ZOOM);
    map.on('zoomend', onZoom);
    return () => { map.off('zoomend', onZoom); };
  }, [map]);

  // Countdown para mensagem "Tentando novamente em X s"
  useEffect(() => {
    if (retryInSeconds == null || retryInSeconds <= 0) return;
    const id = setInterval(() => {
      setRetryInSeconds((s) => (s != null && s > 0 ? s - 1 : null));
    }, 1000);
    return () => clearInterval(id);
  }, [retryInSeconds]);

  // Cria/remove o layer WMS quando isVisible, cqlFilter ou retryCount muda
  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    clearLoadingTimeout();
    clearAutoRetryTimeout();
    setError(false);
    setIsAutoRetrying(false);
    setRetryInSeconds(null);

    if (!isVisible) {
      setLoading(false);
      if (layerId) onLoadingChange?.(layerId, false);
      return;
    }

    const params: Record<string, string | boolean | number> = {
      layers: GEOSERVER_LAYERS.malhafundiaria.name,
      format: 'image/png8',      // PNG 8-bit — ~70% menor que png24, suficiente para mapas temáticos
      transparent: true,
      version: '1.1.1',
      srs: 'EPSG:4326',
      tiled: true,               // Ativa GWC (GeoServer tile caching)
      tilesOrigin: '-180,-90',   // Alinha grid de tiles para cache
    };

    if (cqlFilter) {
      params.CQL_FILTER = cqlFilter;
    }

    const wmsLayer = L.tileLayer.wms(WMS_TILES_URL, {
      ...params,
      tileSize: 512,             // Tiles maiores = menos requests (4x menos que 256)
      detectRetina: false,       // Evita tiles 2x que dobram o tempo de render
      updateWhenIdle: true,      // Só pede tiles quando o pan termina (reduz carga no GeoServer)
      updateWhenZooming: false,  // Só atualiza tiles ao fim do zoom (evita muitas requisições durante animação)
    } as L.WMSOptions);

    pendingTilesRef.current = 0;
    tilesStartedRef.current = 0;
    tilesErroredRef.current = 0;

    const trySetErrorFromTiles = () => {
      const started = tilesStartedRef.current;
      const errored = tilesErroredRef.current;
      if (started >= 2 && errored / started > 0.5) {
        setErrorOrAutoRetry();
      }
    };

    wmsLayer.on('tileloadstart', () => {
      pendingTilesRef.current++;
      tilesStartedRef.current++;
      setLoading(true);
      if (layerId) onLoadingChange?.(layerId, true);
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (pendingTilesRef.current > 0) {
            setErrorOrAutoRetry();
          }
        }, LOAD_TIMEOUT_MS);
      }
    });

    wmsLayer.on('tileload', () => {
      pendingTilesRef.current = Math.max(0, pendingTilesRef.current - 1);
      if (pendingTilesRef.current === 0) {
        autoRetriesUsedRef.current = 0;
        clearLoadingTimeout();
        setLoading(false);
        if (layerId) onLoadingChange?.(layerId, false);
      }
    });

    wmsLayer.on('tileerror', () => {
      pendingTilesRef.current = Math.max(0, pendingTilesRef.current - 1);
      tilesErroredRef.current++;
      trySetErrorFromTiles();
      if (pendingTilesRef.current === 0) {
        clearLoadingTimeout();
        setLoading(false);
        if (layerId) onLoadingChange?.(layerId, false);
      }
    });

    wmsLayer.on('load', () => {
      pendingTilesRef.current = 0;
      autoRetriesUsedRef.current = 0;
      clearLoadingTimeout();
      setLoading(false);
      if (layerId) onLoadingChange?.(layerId, false);
    });

    wmsLayer.addTo(map);
    layerRef.current = wmsLayer;

    return () => {
      clearLoadingTimeout();
      clearAutoRetryTimeout();
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      setLoading(false);
      if (layerId) onLoadingChange?.(layerId, false);
    };
  }, [map, cqlFilter, isVisible, retryCount, layerId, onLoadingChange, clearLoadingTimeout, clearAutoRetryTimeout, setErrorOrAutoRetry]);

  const handleRetry = useCallback(() => {
    autoRetriesUsedRef.current = 0;
    setError(false);
    setRetryCount((c) => c + 1);
  }, []);

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

  // Estado de erro (timeout ou muitos tiles falharam) — só exibe quando não está em modo gradual (evita sobreposição)
  if (error && showLoadingIndicator) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          padding: '10px 14px',
          borderRadius: 6,
          fontWeight: 500,
          color: '#333',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          maxWidth: 280,
        }}
      >
        <p style={{ margin: 0, marginBottom: 6, fontSize: '11px', lineHeight: 1.4 }}>
          Não foi possível carregar a camada no momento. O servidor pode estar sobrecarregado ou temporariamente indisponível.
        </p>
        <p style={{ margin: 0, marginBottom: 8, fontSize: '10px', color: '#6b7280', lineHeight: 1.4 }}>
          Recomendamos selecionar região, estado ou camada nos filtros para melhor desempenho.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fff',
            background: '#2d6a4f',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Tentativa automática em andamento — só exibe quando não está em modo gradual (evita sobreposição com card "Carregando camadas")
  if (isAutoRetrying && showLoadingIndicator) {
    const sec = retryInSeconds ?? Math.ceil(AUTO_RETRY_DELAY_MS / 1000);
    return (
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          background: 'rgba(255,255,255,0.92)',
          padding: '10px 14px',
          borderRadius: 6,
          fontWeight: 500,
          color: '#333',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          maxWidth: 300,
        }}
      >
        <span
          className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary mt-0.5"
          style={{ animation: 'wms-gradual-spin 0.7s linear infinite' }}
          aria-hidden
        />
        <div>
          <p style={{ margin: 0, marginBottom: 4, fontSize: '11px', lineHeight: 1.4 }}>
            O carregamento está demorando. Nova tentativa automática em {sec} s.
          </p>
          <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', lineHeight: 1.4 }}>
            Recomendamos selecionar região, estado ou camada nos filtros para melhor desempenho.
          </p>
        </div>
        <style>{`@keyframes wms-gradual-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Indicador de carregamento
  if (loading && showLoadingIndicator) {
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
  /** CQL só escopo+biomas (sem categoria); usado no carregamento gradual. */
  scopeOnlyCql?: string | null;
  /** Se true e scopeOnlyCql presente, carrega uma categoria por vez em vez de todas de uma vez. */
  useGradualLoad?: boolean;
  /** Se false, não carrega a camada WMS (evita pedir Brasil inteiro); mostra overlay pedindo região/estado. */
  wmsEnabled?: boolean;
  /** Callback quando clica num polígono e obtém dados */
  onFeatureClick?: (properties: Record<string, unknown>) => void;
  /** Altura mínima do mapa */
  minHeight?: string;
  /** Classe CSS adicional */
  className?: string;
  /** Bounding box para flyToBounds (null = volta ao Brasil) */
  bounds?: [[number, number], [number, number]] | null;
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

/**
 * Monta uma WmsLayer por categoria, com atraso entre cada uma, para não sobrecarregar o GeoServer.
 * O card de status permanece com spinner até as camadas visíveis terminarem de carregar os tiles.
 */
function GradualWmsLayers({ scopeOnlyCql }: { scopeOnlyCql: string | null }) {
  const total = CATEGORIA_FUNDIARIA_GRADUAL_ORDER.length;
  const [visibleCount, setVisibleCount] = useState(1); // primeira categoria já visível
  const [loadingByLayer, setLoadingByLayer] = useState<Record<string, boolean>>({});

  const onLoadingChange = useCallback((id: string, loading: boolean) => {
    setLoadingByLayer((prev) => (prev[id] === loading ? prev : { ...prev, [id]: loading }));
  }, []);

  useEffect(() => {
    if (visibleCount >= total) return;
    const t = setTimeout(
      () => setVisibleCount((c) => Math.min(c + 1, total)),
      GRADUAL_LAYER_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [visibleCount, total]);

  const visibleCats = CATEGORIA_FUNDIARIA_GRADUAL_ORDER.slice(0, visibleCount);
  const anyVisibleLoading = visibleCats.some((cat) => loadingByLayer[cat] !== false);
  const showCard = visibleCount < total || anyVisibleLoading;

  return (
    <>
      {visibleCats.map((cat) => {
        const cql = scopeOnlyCql
          ? `${scopeOnlyCql} AND categoria_fundiaria_v2025 = '${cat}'`
          : `categoria_fundiaria_v2025 = '${cat}'`;
        return (
          <WmsLayer
            key={cat}
            layerId={cat}
            cqlFilter={cql}
            showLoadingIndicator={false}
            onLoadingChange={onLoadingChange}
          />
        );
      })}
      {showCard && (
        <div
          className="flex items-start gap-3 py-2 pl-3 pr-4 rounded-lg border border-border border-l-4 border-l-primary bg-white/95 font-medium text-text"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1000,
            fontSize: '11px',
            lineHeight: 1.4,
            boxShadow: '0 2px 8px rgba(61, 90, 69, 0.08), 0 1px 2px rgba(0,0,0,0.04)',
            maxWidth: 280,
          }}
        >
          <span
            className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary mt-0.5"
            style={{ animation: 'wms-gradual-spin 0.7s linear infinite' }}
            aria-hidden
          />
          <div>
            <p style={{ margin: 0, marginBottom: 4, fontSize: '10px', lineHeight: 1.4 }}>
              Carregando camadas ({visibleCount}/{total})…
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', lineHeight: 1.4 }}>
              Use região, estado ou camada nos filtros para otimizar o carregamento.
            </p>
          </div>
          <style>{`@keyframes wms-gradual-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}

/** URL do GeoJSON de limites dos estados (mesma fonte do BrasilMap). */
const BRAZIL_STATES_GEOJSON_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

/** Zoom a partir do qual os nomes dos estados são exibidos. */
const MIN_ZOOM_STATE_LABELS = 4;

/**
 * Camada de recorte: limites dos estados com nomes conforme o zoom.
 * Linhas separando cada estado; rótulos (nome/UF) visíveis a partir de MIN_ZOOM_STATE_LABELS.
 */
function StatesBoundariesLayer() {
  const map = useMap();
  const boundariesRef = useRef<L.Layer | null>(null);
  const labelsRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(BRAZIL_STATES_GEOJSON_URL)
      .then((res) => res.json())
      .then((geojson: GeoJSON.GeoJSON) => {
        if (cancelled || !map) return;

        const style: L.PathOptions = {
          color: '#5a7a63',
          weight: 1.2,
          fillOpacity: 0,
          opacity: 0.9,
        };

        const labelGroup = L.layerGroup();
        labelsRef.current = labelGroup;
        if (map.getZoom() >= MIN_ZOOM_STATE_LABELS) labelGroup.addTo(map);

        const boundariesLayer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
          style: () => style,
          onEachFeature: (feature, layer) => {
            const props = feature.properties as Record<string, string> | undefined;
            const name = props?.name || props?.Nome || props?.sigla || props?.id || '';
            if (!name) return;
            const bounds = (layer as L.Polygon).getBounds();
            const center = bounds.getCenter();
            const marker = L.marker(center, {
              icon: L.divIcon({
                html: `<span style="
                  font-size: 11px;
                  font-weight: 600;
                  color: #2F4636;
                  text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 1px 2px rgba(0,0,0,0.1);
                  white-space: nowrap;
                  pointer-events: none;
                ">${name}</span>`,
                className: 'boundary-label',
                iconSize: undefined,
                iconAnchor: undefined,
              }),
            });
            labelGroup.addLayer(marker);
          },
        });
        boundariesLayer.addTo(map);
        boundariesRef.current = boundariesLayer;
      })
      .catch((err) => console.warn('States boundaries GeoJSON:', err));

    return () => {
      cancelled = true;
      boundariesRef.current?.remove();
      boundariesRef.current = null;
      labelsRef.current?.remove();
      labelsRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const onZoom = () => {
      const show = map.getZoom() >= MIN_ZOOM_STATE_LABELS;
      if (show) labelsRef.current?.addTo(map);
      else labelsRef.current?.remove();
    };
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);

  return null;
}

/** Overlay quando não há escopo (região/estado): evita carregar WMS do Brasil inteiro. */
function WmsScopeRequiredOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(248, 249, 246, 0.85)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 320,
          padding: '20px 24px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          fontSize: '14px',
          color: '#333',
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          Selecione uma região ou estado no topo
        </p>
        <p style={{ margin: '8px 0 0', fontWeight: 400, color: '#555' }}>
          para visualizar os polígonos da malha fundiária.
        </p>
      </div>
    </div>
  );
}

/** Controla viewport do mapa com base no escopo geográfico (bounds ou Brasil) */
function BoundsUpdater({ bounds }: { bounds?: [[number, number], [number, number]] | null }) {
  const map = useMap();
  const prevBoundsRef = useRef<[[number, number], [number, number]] | null | undefined>(undefined);

  useEffect(() => {
    // Ignora a chamada inicial (não animar ao montar)
    if (prevBoundsRef.current === undefined) {
      prevBoundsRef.current = bounds ?? null;
      return;
    }

    if (bounds) {
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 10, duration: 0.8 });
    } else if (prevBoundsRef.current) {
      // Voltar ao Brasil
      map.flyTo(BRAZIL_CENTER, BRAZIL_ZOOM, { duration: 0.8 });
    }

    prevBoundsRef.current = bounds ?? null;
  }, [map, bounds]);

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
  scopeOnlyCql,
  useGradualLoad = false,
  wmsEnabled = true,
  onFeatureClick,
  minHeight = '500px',
  className = '',
  bounds,
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

  const effectiveCqlForClick = useGradualLoad ? scopeOnlyCql ?? undefined : cqlFilter;
  const useGradual = wmsEnabled && useGradualLoad;

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
        <BoundsUpdater bounds={bounds} />

        {/* Base tiles — CartoDB Voyager (fronteiras e labels mais visíveis) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Camada WMS só quando há escopo (região/estado) — evita carregar Brasil inteiro na abertura */}
        {wmsEnabled ? (
          useGradual ? (
            <>
              <GradualWmsLayers key={scopeOnlyCql ?? 'brasil'} scopeOnlyCql={scopeOnlyCql ?? null} />
              <ClickHandler onFeatureInfo={handleFeatureInfo} cqlFilter={effectiveCqlForClick ?? null} />
            </>
          ) : (
            <>
              <WmsLayer cqlFilter={cqlFilter} />
              <ClickHandler onFeatureInfo={handleFeatureInfo} cqlFilter={cqlFilter} />
            </>
          )
        ) : (
          <WmsScopeRequiredOverlay />
        )}

        {/* Recorte de estados: linhas e nomes conforme zoom */}
        <StatesBoundariesLayer />

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
