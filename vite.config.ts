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

        server.middlewares.use('/api/list_files', (req: any, res: any) => {
          if (req.method === 'GET') {
            const getFiles = (dir: string, prefix = ''): string[] => {
              let results: string[] = [];
              if (!fs.existsSync(dir)) return results;
              const list = fs.readdirSync(dir);
              list.forEach(file => {
                const filePath = path.resolve(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                  results = results.concat(getFiles(filePath, prefix + file + '/'));
                } else if (file.endsWith('.json')) {
                  results.push(prefix + file);
                }
              });
              return results;
            };
            try {
              const dataDir = path.resolve(__dirname, './public/data');
              const files = getFiles(dataDir);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(files));
            } catch (err) {
              res.statusCode = 500;
              res.end('Error listing files: ' + String(err));
            }
          }
        });
      }
    }
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/lightrag-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lightrag-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res: any) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'offline', lightrag_engine_active: false }));
            }
          });
        }
      }
    },
    watch: {
      usePolling: true,
      interval: 500,
      ignored: ['**/public/data/generated/**', '**/public/data/b10/**', '**/public/data/b12/**'],
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