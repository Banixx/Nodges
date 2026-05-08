import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['three'],
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Erzwingt Polling, falls Windows-Dateisystem-Events nicht durchgereicht werden
    watch: {
      usePolling: true,
      interval: 500,
    },
    // Stellt sicher, dass HMR über die korrekte Adresse verbunden wird
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Verhindert Cache-Probleme bei CSS durch explizites Manifest
    manifest: true,
    emptyOutDir: true,
  },

  optimizeDeps: {
    include: ['three'],
    // Erzwingt Neu-Kompilierung der Abhängigkeiten bei Start
    force: true,
  },
});