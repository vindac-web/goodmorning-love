import cron from 'node-cron';
import config from '../config';
import { sendMorningQuestions, sendPendingGirlfriendMessage } from './goodMorningService';
import { getSettings } from './dataStore';

export function initializeScheduler(): void {
  // Get schedule settings from data store (or use config defaults)
  const settings = getSettings({
    morningTime: config.schedule.morningTime,
    girlfriendSendTime: config.schedule.girlfriendSendTime,
    timezone: config.schedule.timezone,
  });

  // Schedule morning questions
  const [morningHours, morningMinutes] = settings.morningTime.split(':');
  const morningCronExpression = `${morningMinutes} ${morningHours} * * *`;

  console.log(
    `Scheduling morning questions for ${settings.morningTime} ${settings.timezone}`
  );

  cron.schedule(
    morningCronExpression,
    async () => {
      console.log('Running scheduled morning questions job...');
      try {
        await sendMorningQuestions();
        console.log('Morning questions sent successfully');
      } catch (error) {
        console.error('Error sending morning questions:', error);
      }
    },
    {
      timezone: settings.timezone,
    }
  );

  // Schedule girlfriend message delivery
  const [girlfriendHours, girlfriendMinutes] = settings.girlfriendSendTime.split(':');
  const girlfriendCronExpression = `${girlfriendMinutes} ${girlfriendHours} * * *`;

  console.log(
    `Scheduling girlfriend message delivery for ${settings.girlfriendSendTime} ${settings.timezone}`
  );

  cron.schedule(
    girlfriendCronExpression,
    async () => {
      console.log('Running scheduled girlfriend message delivery job...');
      try {
        await sendPendingGirlfriendMessage();
        console.log('Girlfriend message delivery job completed');
      } catch (error) {
        console.error('Error sending girlfriend message:', error);
      }
    },
    {
      timezone: settings.timezone,
    }
  );

  console.log('Scheduler initialized successfully');
}

// Helper function for manual testing
export async function triggerMorningQuestions(): Promise<void> {
  console.log('Manually triggering morning questions...');
  await sendMorningQuestions();
}
