/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base do GeoServer para testar outra infra (ex.: servidor em região Brasil). Ex.: https://seu-geoserver.exemplo.com/geoserver */
  readonly VITE_GEOSERVER_URL?: string;
  /** 'true' = usar GeoWebCache para tiles; omitir ou 'false' = WMS direto. */
  readonly VITE_USE_GEOWEBCACHE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
