import config from './config';
import { createServer } from './server';
import { initializeScheduler } from './services/scheduler';

async function main() {
  try {
    console.log('Starting GoodMorning Love app...');

    // Create and start Express server
    const app = createServer();
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log(`Webhook endpoint: http://localhost:${config.port}/webhook/twilio`);
    });

    // Initialize scheduler
    initializeScheduler();

    console.log('GoodMorning Love app started successfully!');
    console.log(`Morning questions will be sent at ${config.schedule.morningTime} ${config.schedule.timezone}`);
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
}

main();
