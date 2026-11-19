import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile({
        removeViteModuleLoader: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      outDir: 'github-pages',
      emptyOutDir: true,
      copyPublicDir: false,
      assetsInlineLimit: 100000000,
      cssCodeSplit: false,
    },
  };
});
