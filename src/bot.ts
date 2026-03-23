import { Bot } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { BOT_TOKEN } from './config.js';
import { cvEdit } from './conversations/cv-edit.js';
import type { BotContext } from './types/context.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(BOT_TOKEN);

  bot.use(conversations());
  bot.use(createConversation(cvEdit));

  bot.command('cancel', async (ctx) => {
    await ctx.conversation.exitAll();
    await ctx.reply('Cancelled. Send /start to begin again.');
  });

  bot.command('start', async (ctx) => {
    await ctx.conversation.exitAll();
    await ctx.conversation.enter('cvEdit');
  });

  bot.on('message', async (ctx) => {
    await ctx.reply('Send /start to begin editing your CV.');
  });

  return bot;
}
