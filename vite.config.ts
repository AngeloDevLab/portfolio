import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  css: { devSourcemap: true },
  build: {
    rolldownOptions: {
      input: ['index.html', 'imprint.html', 'privacy.html'],
    },
  },
});
