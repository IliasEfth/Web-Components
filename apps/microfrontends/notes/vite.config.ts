import { federation } from '@module-federation/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('shop-') },
      },
    }),
    federation({
      name: 'notes',
      filename: 'remoteEntry.js',
      exposes: {
        './elements': './src/elements.ts',
      },
      shared: ['vue'],
      dts: false,
    }),
  ],
  server: { port: 4402, strictPort: true, origin: 'http://localhost:4402' },
});
