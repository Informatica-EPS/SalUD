import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), '');
   return {
      plugins: [
         react(),
         federation({
            name: 'host_app',
            remotes: {
               medicamentsApp: env.VITE_MEDICAMENTS_REMOTE_URL ? `${env.VITE_MEDICAMENTS_REMOTE_URL}/assets/remoteEntry.js` : 'http://localhost:8081/assets/remoteEntry.js',
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
   };
});