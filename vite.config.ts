import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [svelte(), cssInjectedByJsPlugin()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'makibishi.js',
      },
    },
  },
});
