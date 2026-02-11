/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base do GeoServer para testar outra infra (ex.: servidor em região Brasil). Ex.: https://seu-geoserver.exemplo.com/geoserver */
  readonly VITE_GEOSERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
