import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// Obtener la URL base de la API desde las variables de entorno
const MEDICAMENTS_URL = import.meta.env.VITE_MEDICAMENTS_REMOTE_URL || 'http://localhost:8081/assets/remoteEntry.js';

export default defineConfig({
   plugins: [
      react(),
      federation({
         name: 'host_app',
         remotes: {
            medicamentsApp: MEDICAMENTS_URL,
         },
         shared: {
            react: {
               singleton: true,
               requiredVersion: '^18.3.1',
            },
            'react-dom': {
               singleton: true,
               requiredVersion: '^18.3.1',
            },
            'react-router-dom': {
               singleton: true,
               requiredVersion: '^7.6.0',
            },
            '@mui/material': {
               singleton: true,
            },
            '@emotion/react': {
               singleton: true,
            },
            '@emotion/styled': {
               singleton: true,
            },
         },
      }),
   ],
   base: '/',
   build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
   },
   server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8080'),
      cors: true,
   },
   preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8080'),
      cors: true,
      strictPort: true,
   },
});