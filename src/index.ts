import { createBot } from './bot.js';

const bot = createBot();

bot.catch((err) => {
  console.error('Bot error:', err);
});

// eslint-disable-next-line no-console
bot.start({ onStart: () => console.log('CV Editor Bot is running...') });

// Graceful shutdown
const shutdown = (): void => {
  bot.stop();
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
