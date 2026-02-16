import express, { Express, Request, Response } from 'express';
import webhookRouter from './routes/webhook';
import {
  sendMorningQuestions,
  sendPendingGirlfriendMessage,
  sendGirlfriendMessage,
} from './services/goodMorningService';
import { AnswerSet } from './utils/parseAnswers';

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
