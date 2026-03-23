import { InputFile } from 'grammy';
import type { BotConversation, BotConversationContext } from '../types/context.js';
import { downloadTelegramFile } from '../utils/file.js';
import { extractPdfText } from '../services/pdf-extractor.js';
import { extractCvStructure, rewriteCvForJd } from '../services/cv-analyzer.js';
import { generateCvPdf } from '../services/pdf-generator.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function cvEdit(
  conversation: BotConversation,
  ctx: BotConversationContext,
): Promise<void> {
  await ctx.reply(
    'Welcome to *CV Editor Bot*\\!\n\n' +
      'I will tailor your CV to match a specific job description\\.\n\n' +
      '1\\. Send me your CV as a PDF file\n' +
      '2\\. Paste the job description\n' +
      '3\\. Get a tailored CV back\n\n' +
      'Send a PDF to get started\\!',
    { parse_mode: 'MarkdownV2' },
  );

  // Step 1: Wait for PDF
  const pdfCtx = await conversation.waitFor('message:document', {
    otherwise: (c) => c.reply('Please send a PDF file.'),
  });

  const doc = pdfCtx.message.document;
  if (doc.mime_type !== 'application/pdf') {
    await pdfCtx.reply('That is not a PDF file. Please send /start to try again.');
    return;
  }

  if (doc.file_size && doc.file_size > MAX_FILE_SIZE) {
    await pdfCtx.reply('File is too large (max 5MB). Please send /start to try again.');
    return;
  }

  await pdfCtx.reply('Extracting text from your CV...');

  // Extract PDF text
  let rawText: string;
  try {
    const buffer = await downloadTelegramFile(pdfCtx, doc.file_id);
    rawText = await extractPdfText(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await pdfCtx.reply(`Failed to extract text from PDF: ${message}\n\nSend /start to try again.`);
    return;
  }

  // Parse CV structure with Claude
  await pdfCtx.reply('Parsing your CV structure...');

  let cvData;
  try {
    cvData = await conversation.external(() => extractCvStructure(rawText));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await pdfCtx.reply(`Failed to parse CV: ${message}\n\nSend /start to try again.`);
    return;
  }

  const skillCount = cvData.skills.reduce((acc, cat) => acc + cat.items.length, 0);
  await pdfCtx.reply(
    `Got it! Found ${cvData.experience.length} roles, ${skillCount} skills, ` +
      `${cvData.education.length} education entries.\n\n` +
      'Now paste the job description (as text).\n' +
      'Send /done when finished.',
  );

  // Step 2: JD loop — allow multiple JDs against the same CV
  while (true) {
    const jdCtx = await conversation.waitFor('message:text', {
      otherwise: (c) => c.reply('Please send the job description as a text message.'),
    });

    const jdText = jdCtx.message.text;

    if (jdText === '/done') {
      await jdCtx.reply('Thanks for using CV Editor Bot! Send /start to edit another CV.');
      return;
    }

    if (jdText.length < 50) {
      await jdCtx.reply(
        'That seems too short for a job description. Please paste the full JD text.',
      );
      continue;
    }

    await jdCtx.reply('Tailoring your CV to match the job description... This takes ~15 seconds.');

    let rewrittenCv;
    try {
      rewrittenCv = await conversation.external(() => rewriteCvForJd(cvData, jdText));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await jdCtx.reply(`Failed to rewrite CV: ${message}\n\nTry pasting the JD again.`);
      continue;
    }

    await jdCtx.reply('Generating your tailored PDF...');

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await conversation.external(() => generateCvPdf(rewrittenCv));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await jdCtx.reply(`Failed to generate PDF: ${message}`);
      continue;
    }

    await jdCtx.replyWithDocument(
      new InputFile(pdfBuffer, `${rewrittenCv.name.replace(/\s+/g, '_')}_CV.pdf`),
      { caption: 'Here is your tailored CV! Send another JD to reprocess, or /done to finish.' },
    );
  }
}
