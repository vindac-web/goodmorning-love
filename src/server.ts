import express, { Express, Request, Response } from 'express';
import webhookRouter from './routes/webhook';

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Webhook routes
  app.use('/webhook', webhookRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
