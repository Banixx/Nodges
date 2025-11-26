import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({

  base: '/Nodges/',
  

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  
  optimizeDeps: {
    include: ['three'],
  },
});
