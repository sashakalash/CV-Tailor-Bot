import { createBot } from './bot.js';
import { IS_DEBUG } from './config.js';

const bot = createBot();

bot.catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Bot error:', message);
  if (IS_DEBUG) {
    console.error(err);
  }
});

bot.start({
  onStart: () => {
    console.log('CV Editor Bot is running...');
    if (IS_DEBUG) {
      console.log('DEBUG MODE ENABLED');
      console.log('TAILOR_BOT_TOKEN:', '[set]');
      console.log('ANTHROPIC_API_KEY:', '[set]');
    }
  },
});

// Graceful shutdown
const shutdown = (): void => {
  bot.stop();
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
