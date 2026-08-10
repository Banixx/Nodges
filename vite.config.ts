import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';

// LightRAG laeuft bei Nutzung des DevContainers auf dem Windows-Host.
// `localhost` wuerde hier auf den Container selbst zeigen.
const lightRagProxyTarget = process.env.VITE_LIGHTRAG_PROXY_TARGET || 'http://host.docker.internal:8000';

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

        server.middlewares.use('/api/create_database', bodyParser.json({ limit: '50mb' }));
        server.middlewares.use('/api/create_database', (req: any, res: any) => {
          if (req.method === 'POST') {
            try {
              const { dbName, content } = req.body;
              if (!dbName) {
                res.statusCode = 400;
                res.end('Missing dbName');
                return;
              }
              const safeName = dbName.endsWith('.json') ? dbName : `${dbName}.json`;
              const targetPath = path.resolve(__dirname, './public/data/databases', safeName);
              const targetDir = path.dirname(targetPath);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              const defaultGraphData = content || JSON.stringify({
                system: { name: dbName, version: '1.0' },
                dataModel: { entityTypes: [], relationshipTypes: [] },
                entities: [],
                relationships: []
              }, null, 2);

              fs.writeFileSync(targetPath, defaultGraphData);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'success', path: `databases/${safeName}` }));
            } catch (err) {
              res.statusCode = 500;
              res.end('Error creating database: ' + String(err));
            }
          } else {
            res.statusCode = 405;
            res.end('Method not allowed');
          }
        });

        server.middlewares.use('/api/delete_file', bodyParser.json());
        server.middlewares.use('/api/delete_file', (req: any, res: any) => {
          if (req.method === 'POST' || req.method === 'DELETE') {
            try {
              const { filename } = req.body || {};
              if (!filename) {
                res.statusCode = 400;
                res.end('Missing filename');
                return;
              }
              const targetPath = path.resolve(__dirname, './public/data', filename);
              if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'success', message: 'File deleted successfully' }));
              } else {
                res.statusCode = 404;
                res.end('File not found');
              }
            } catch (err) {
              res.statusCode = 500;
              res.end('Error deleting file: ' + String(err));
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
    proxy: {
      '/lightrag-api': {
        target: lightRagProxyTarget,
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
