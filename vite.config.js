import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@xmldom/xmldom/lib/index.js': path.resolve(__dirname, 'node_modules/@xmldom/xmldom/dist/index.mjs')
    },
  },
  optimizeDeps: {
    include: ['mammoth'],
    exclude: []
  }
});
