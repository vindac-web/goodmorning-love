import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// Store voice messages temporarily (auto-expire after 5 minutes)
interface VoiceMessage {
  message: string;
  expiresAt: number;
}

const voiceMessages = new Map<string, VoiceMessage>();

// Clean up expired messages every minute
setInterval(() => {
  const now = Date.now();
  for (const [id, msg] of voiceMessages.entries()) {
    if (now > msg.expiresAt) {
      voiceMessages.delete(id);
    }
  }
}, 60000);

// Store a voice message and get an ID
export function storeVoiceMessage(message: string): string {
  const id = Math.random().toString(36).substring(2, 15);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  voiceMessages.set(id, { message, expiresAt });
  return id;
}

// TwiML voice endpoint
router.get('/voice/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const voiceMsg = voiceMessages.get(id);

  if (!voiceMsg) {
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">This message has expired.</Say>
</Response>`);
    return;
  }

  // Generate TwiML with the message
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(voiceMsg.message)}</Say>
</Response>`);

  // Clean up after use
  voiceMessages.delete(id);
});

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
