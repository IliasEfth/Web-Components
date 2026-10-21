import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { remoteEntries } from './src/remote-entries.ts';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'backoffice',
      remotes: {
        insights: {
          type: 'module',
          name: 'insights',
          entry: remoteEntries.insights,
        },
      },
      shared: ['react', 'react-dom'],
      shareStrategy: 'loaded-first',
      dts: false,
    }),
  ],
  server: { port: 4200, strictPort: true },
});
