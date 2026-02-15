import { Router, Request, Response } from 'express';
import { handleUserReply } from '../services/goodMorningService';

const router = Router();

router.post('/twilio', async (req: Request, res: Response) => {
  try {
    const { From, To, Body } = req.body;

    console.log(`Received message from ${From}: ${Body}`);

    // Handle the user's reply
    await handleUserReply(From, Body);

    // Respond with minimal TwiML
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
