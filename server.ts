import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { connectToDatabase } from './server/db.ts';
import { createApiRouter } from './server/routes.ts';

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  // Initiate MongoDB Atlas connection in background so server binds port 3000 immediately
  connectToDatabase().catch((err) => {
    console.error('MongoDB Atlas connection failed:', err instanceof Error ? err.message : err);
  });

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Mount REST API routes
  app.use('/api', createApiRouter());

  // Global API error handler
  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  if (!isProduction) {
    // Development mode: mount Vite middleware inside Express on port 3000
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static frontend assets from dist/
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tiffinbox Stories server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Tiffinbox Stories server:', error);
  process.exit(1);
});
