import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mf/insights/',
  plugins: [
    react({ exclude: [/\/node_modules\//, /\/src\/insights\//] }),
    federation({
      name: 'insights',
      filename: 'remoteEntry.js',
      exposes: {
        './elements': './src/elements.tsx',
      },
      shared: ['react', 'react-dom'],
      dts: false,
    }),
  ],
  server: { port: 4202, strictPort: true },
});
