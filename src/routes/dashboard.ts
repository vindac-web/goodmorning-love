import express, { Request, Response, Router } from 'express';
import { requireAuth, checkPassword } from './dashboardAuth';
import {
  getQuestions,
  saveQuestions,
  getSettings,
  saveSettings,
  getTemplates,
  saveTemplates,
  getHistory,
  ScheduleSettings,
  addHistoryEntry
} from '../services/dataStore';
import { morningQuestions, myProfile, girlfriendProfile } from '../config/questions';
import config from '../config';
import { sendMorningQuestions, sendGirlfriendMessage } from '../services/goodMorningService';
import { AnswerSet } from '../utils/parseAnswers';
import { sendVoiceMessage } from '../services/messaging';
import { storeVoiceMessage } from './twiml';

const router: Router = express.Router();

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (checkPassword(password)) {
    if (req.session) {
      req.session.isAuthenticated = true;
    }
    return res.json({ success: true });
  } else {
    return res.status(401).json({ error: 'Invalid password' });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

// All routes below require authentication
router.use(requireAuth);

// Status endpoint
router.get('/status', (req: Request, res: Response) => {
  const settings = getSettings({
    morningTime: config.schedule.morningTime,
    girlfriendSendTime: config.schedule.girlfriendSendTime,
    timezone: config.schedule.timezone
  });

  const status = {
    running: true,
    schedule: settings,
    phoneNumbers: {
      my: myProfile.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
      girlfriend: girlfriendProfile.phoneNumber.replace(/\d(?=\d{4})/g, '*')
    },
    channels: {
      my: myProfile.preferredChannels,
      girlfriend: girlfriendProfile.preferredChannels
    }
  };

  res.json(status);
});

// Questions endpoints
router.get('/questions', (req: Request, res: Response) => {
  const questions = getQuestions(morningQuestions);
  res.json({ questions });
});

router.put('/questions', (req: Request, res: Response) => {
  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Questions must be an array' });
  }

  // Validate questions format
  for (const q of questions) {
    if (typeof q.number !== 'number' || typeof q.text !== 'string') {
      return res.status(400).json({ error: 'Invalid question format' });
    }
  }

  saveQuestions(questions);
  res.json({ success: true, questions });
});

// Settings endpoints
router.get('/settings', (req: Request, res: Response) => {
  const settings = getSettings({
    morningTime: config.schedule.morningTime,
    girlfriendSendTime: config.schedule.girlfriendSendTime,
    timezone: config.schedule.timezone
  });

  res.json(settings);
});

router.put('/settings', (req: Request, res: Response) => {
  const { morningTime, girlfriendSendTime, timezone } = req.body;

  if (!morningTime || !girlfriendSendTime || !timezone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(morningTime) || !timeRegex.test(girlfriendSendTime)) {
    return res.status(400).json({ error: 'Invalid time format (use HH:MM)' });
  }

  const settings: ScheduleSettings = {
    morningTime,
    girlfriendSendTime,
    timezone
  };

  saveSettings(settings);

  // Note: In a production app, we would restart the cron jobs here
  // For now, the app will need to be restarted to pick up new schedule

  res.json({ success: true, settings, note: 'Please restart the app to apply new schedule' });
});

// Templates endpoints
router.get('/templates', (req: Request, res: Response) => {
  const defaultTemplates = [
    `Good morning, beautiful! 💕\n\n{loveNote}\n\nToday I'm feeling especially grateful: {gratitude}\n\nI want you to know: {encouragement}\n\nHave an amazing day! I love you! ❤️`,
    `Hey love! ☀️\n\nJust wanted to tell you: {loveNote}\n\nThis morning I'm grateful for: {gratitude}\n\nRemember this: {encouragement}\n\nYou're amazing! Love you lots! 💕`,
    `Good morning sunshine! 🌅\n\n{loveNote}\n\nI'm grateful today because: {gratitude}\n\nI hope you remember: {encouragement}\n\nHave the best day ever! Love you! ❤️`
  ];

  const templates = getTemplates(defaultTemplates);
  res.json({ templates });
});

router.put('/templates', (req: Request, res: Response) => {
  const { templates } = req.body;

  if (!Array.isArray(templates)) {
    return res.status(400).json({ error: 'Templates must be an array' });
  }

  // Validate templates
  for (const template of templates) {
    if (typeof template !== 'string') {
      return res.status(400).json({ error: 'Each template must be a string' });
    }
  }

  saveTemplates(templates);
  res.json({ success: true, templates });
});

// History endpoint
router.get('/history', (req: Request, res: Response) => {
  const history = getHistory();

  // Support pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedHistory = history.slice(start, end);

  res.json({
    history: paginatedHistory,
    total: history.length,
    page,
    limit,
    totalPages: Math.ceil(history.length / limit)
  });
});

// Test endpoints
router.post('/test/questions', async (req: Request, res: Response) => {
  try {
    await sendMorningQuestions();
    res.json({ success: true, message: 'Morning questions sent' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/test/girlfriend', async (req: Request, res: Response) => {
  try {
    const { mediaUrl } = req.body;
    const testAnswers: AnswerSet = {
      loveNote: 'Your smile lights up my whole world',
      gratitude: "I'm grateful for your kindness and patience",
      encouragement: "You're going to crush it today, I believe in you"
    };

    await sendGirlfriendMessage(testAnswers, mediaUrl);
    res.json({ success: true, message: 'Test girlfriend message sent' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Random love GIF endpoint
const LOVE_GIFS = [
  'https://media.giphy.com/media/3oEjI5VtIhHvK37WYo/giphy.gif', // Hearts floating
  'https://media.giphy.com/media/l4FsAvJHInq9s25q0/giphy.gif', // Cute love hearts
  'https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif', // Love hearts popping
  'https://media.giphy.com/media/xUOxeZWKz8sD7SphGo/giphy.gif', // Romantic hearts
  'https://media.giphy.com/media/3o6ZsZdNs3yE5l6hWM/giphy.gif', // Love animation
  'https://media.giphy.com/media/l4FGni1RBAR2OWsGk/giphy.gif', // Cute hearts
  'https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif', // Love burst
  'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', // Hearts beating
  'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif', // Love sparkles
  'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif', // Romantic hearts animation
];

router.get('/media/random', (req: Request, res: Response) => {
  const randomGif = LOVE_GIFS[Math.floor(Math.random() * LOVE_GIFS.length)];
  res.json({ url: randomGif });
});

// Voice message test endpoint
router.post('/test/voice', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Store the voice message and get an ID
    const voiceMessageId = storeVoiceMessage(message);

    // Send the voice call
    await sendVoiceMessage(config.phoneNumbers.girlfriend, message, voiceMessageId);

    // Log to history
    addHistoryEntry({
      timestamp: new Date().toISOString(),
      type: 'girlfriend_message',
      channel: 'voice',
      status: 'sent',
      message: message,
    });

    res.json({ success: true, message: 'Voice message sent' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
