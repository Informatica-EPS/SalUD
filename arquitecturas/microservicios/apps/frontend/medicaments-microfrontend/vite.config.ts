import { defineConfig } from 'vitest/config'; 
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'medicaments_app',
      filename: 'remoteEntry.js',
      exposes: {
        './MedicamentsModule': './src/MedicamentsModule.tsx',
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
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',
    port: 8081,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 8081,
    cors: true,
    strictPort: true,
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});