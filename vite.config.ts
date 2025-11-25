import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Erforderlich für Vue Single-File-Components
import path from 'path';

export default defineConfig({
  // Wichtig für GitHub Pages: Setze den Basis-Pfad auf den Namen deines Repositories
  // Beispiel: Wenn dein Repo https://github.com/Banixx/Nodges ist:
  base: '/Nodges/',
  // Falls du eine Benutzer-/Organisationsseite nutzt (Repo-Name: dein-benutzername.github.io):
  // base: '/',

  // Plugin für Vue SFCs (erforderlich für Vue-Projekte, auch mit TypeScript)
  plugins: [vue()],

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

  // Optional: Beschleunigt den Build, indem Three.js vorab optimiert wird
  optimizeDeps: {
    include: ['three'],
  },
});
