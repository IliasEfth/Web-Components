import { federation } from '@module-federation/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { remoteEntries } from './src/remote-entries.ts';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('shop-') },
      },
    }),
    federation({
      name: 'backoffice_vue',
      remotes: {
        insights: { type: 'module', name: 'insights', entry: remoteEntries.insights },
        notes: { type: 'module', name: 'notes', entry: remoteEntries.notes },
      },
      shared: ['vue'],
      shareStrategy: 'loaded-first',
      dts: false,
    }),
  ],
  server: { port: 4400, strictPort: true },
});
