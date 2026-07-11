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
              const dir = path.resolve(__dirname, './public/data/generated');
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              fs.writeFileSync(path.resolve(dir, filename), content);
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