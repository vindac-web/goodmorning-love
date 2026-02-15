import cron from 'node-cron';
import config from '../config';
import { sendMorningQuestions } from './goodMorningService';

export function initializeScheduler(): void {
  const [hours, minutes] = config.schedule.morningTime.split(':');

  // Create cron expression: minutes hours * * *
  const cronExpression = `${minutes} ${hours} * * *`;

  console.log(
    `Scheduling morning questions for ${config.schedule.morningTime} ${config.schedule.timezone}`
  );

  // Schedule the job
  cron.schedule(
    cronExpression,
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
      timezone: config.schedule.timezone,
    }
  );

  console.log('Scheduler initialized successfully');
}

// Helper function for manual testing
export async function triggerMorningQuestions(): Promise<void> {
  console.log('Manually triggering morning questions...');
  await sendMorningQuestions();
}
