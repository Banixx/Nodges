import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({

  base: './',


  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },


  optimizeDeps: {
    include: ['three'],
  },
});
