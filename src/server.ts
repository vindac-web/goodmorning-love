import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import webhookRouter from './routes/webhook';
import dashboardRouter from './routes/dashboard';
import twimlRouter from './routes/twiml';
import {
  sendMorningQuestions,
  sendPendingGirlfriendMessage,
  sendGirlfriendMessage,
} from './services/goodMorningService';
import { AnswerSet } from './utils/parseAnswers';
import { ensureDataDir } from './services/dataStore';

export function createServer(): Express {
  const app = express();

  // Ensure data directory exists
  ensureDataDir();

  // Trust proxy for Railway deployment
  app.set('trust proxy', 1);

  // Session middleware for dashboard authentication
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Middleware
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dashboard routes and static files
  app.use('/api/dashboard', dashboardRouter);
  app.use('/dashboard', express.static(path.join(__dirname, 'public')));

  // Redirect /dashboard to /dashboard/index.html
  app.get('/dashboard', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // TwiML routes
  app.use('/twiml', twimlRouter);

  // Webhook routes
  app.use('/webhook', webhookRouter);

  // Test endpoints for manual triggering
  app.post('/test/send-questions', async (req: Request, res: Response) => {
    try {
      await sendMorningQuestions();
      res.json({ success: true, message: 'Morning questions sent' });
    } catch (error) {
      res.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post('/test/send-girlfriend', async (req: Request, res: Response) => {
    try {
      await sendPendingGirlfriendMessage();
      res.json({ success: true, message: 'Girlfriend message sent' });
    } catch (error) {
      res.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post('/test/send-test-girlfriend', async (req: Request, res: Response) => {
    try {
      // Use provided answers or default test answers
      const testAnswers: AnswerSet = req.body.loveNote
        ? {
            loveNote: req.body.loveNote,
            gratitude: req.body.gratitude,
            encouragement: req.body.encouragement,
          }
        : {
            loveNote: 'Your smile lights up my whole world',
            gratitude: "I'm grateful for your kindness and patience",
            encouragement: "You're going to crush it today, I believe in you",
          };

      await sendGirlfriendMessage(testAnswers);
      res.json({ success: true, message: 'Test girlfriend message sent' });
    } catch (error) {
      res.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
