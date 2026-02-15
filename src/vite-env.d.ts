/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base do GeoServer (ex.: Vultr São Paulo). */
  readonly VITE_GEOSERVER_URL?: string;
  /** 'true' = usar GeoWebCache para tiles; omitir ou 'false' = WMS direto. */
  readonly VITE_USE_GEOWEBCACHE?: string;
  /** PostgreSQL - Vultr (se usado no frontend). */
  readonly VITE_POSTGRES_HOST?: string;
  readonly VITE_POSTGRES_PORT?: string;
  readonly VITE_POSTGRES_DATABASE?: string;
  readonly VITE_POSTGRES_USER?: string;
  readonly VITE_POSTGRES_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
