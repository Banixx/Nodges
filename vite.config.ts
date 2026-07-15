import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['three'],
  },

  plugins: [
    {
      name: 'save-file-api',
      configureServer(server) {
        server.middlewares.use('/api/save_graph', bodyParser.json({ limit: '50mb' }));
        server.middlewares.use('/api/save_graph', (req: any, res: any) => {
          if (req.method === 'POST') {
            try {
              const { filename, content } = req.body;
              if (!filename || !content) {
                res.statusCode = 400;
                res.end('Missing filename or content');
                return;
              }
              const targetPath = path.resolve(__dirname, './public/data/generated', filename);
              const targetDir = path.dirname(targetPath);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              fs.writeFileSync(targetPath, content);
              res.statusCode = 200;
              res.end('File saved successfully');
            } catch (err) {
              res.statusCode = 500;
              res.end('Error saving file: ' + String(err));
            }
          } else {
            res.statusCode = 405;
            res.end('Method not allowed');
          }
        });
      }
    }
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 500,
      ignored: ['**/public/data/generated/**', '**/public/data/b10/**'],
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    manifest: true,
    emptyOutDir: true,
  },

  optimizeDeps: {
    include: ['three'],
    force: true,
  },
});