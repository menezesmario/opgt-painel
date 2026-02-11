import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy para GeoServer — evita CORS em dev (mesmo padrão do Vercel em prod)
      '/geoserver': {
        target: 'https://opgt-geoserver-deploy-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
