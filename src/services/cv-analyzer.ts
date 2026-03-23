import Anthropic from '@anthropic-ai/sdk';
import { cvDataSchema, type CvData } from '../types/cv.js';
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_MODEL } from '../prompts/extract.js';
import { REWRITE_SYSTEM_PROMPT, REWRITE_MODEL } from '../prompts/rewrite.js';

const client = new Anthropic();

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\n?/g, '')
    .replace(/\n?```$/g, '')
    .trim();
}

function parseAndValidate(raw: string): CvData {
  const cleaned = stripCodeFences(raw);
  const parsed = JSON.parse(cleaned);
  const result = cvDataSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error.issues)}`);
  }

  return result.data;
}

async function callClaude(
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return block.text;
}

export async function extractCvStructure(rawText: string): Promise<CvData> {
  const raw = await callClaude(EXTRACTION_MODEL, EXTRACTION_SYSTEM_PROMPT, rawText);

  try {
    return parseAndValidate(raw);
  } catch (firstError) {
    // Retry once with error feedback
    const retryMessage =
      'Your previous response did not match the required schema.\n' +
      `Error: ${firstError instanceof Error ? firstError.message : String(firstError)}\n\n` +
      `Original CV text:\n${rawText}\n\n` +
      'Please fix and return ONLY valid JSON.';

    const retryRaw = await callClaude(EXTRACTION_MODEL, EXTRACTION_SYSTEM_PROMPT, retryMessage);
    return parseAndValidate(retryRaw);
  }
}

export async function rewriteCvForJd(cv: CvData, jobDescription: string): Promise<CvData> {
  const userMessage = `## Original CV\n${JSON.stringify(cv)}\n\n## Job Description\n${jobDescription}`;

  const raw = await callClaude(REWRITE_MODEL, REWRITE_SYSTEM_PROMPT, userMessage);

  try {
    return parseAndValidate(raw);
  } catch (firstError) {
    // Retry once
    const retryMessage =
      'Your previous response did not match the required schema.\n' +
      `Error: ${firstError instanceof Error ? firstError.message : String(firstError)}\n\n` +
      `${userMessage}\n\n` +
      'Please fix and return ONLY valid JSON.';

    const retryRaw = await callClaude(REWRITE_MODEL, REWRITE_SYSTEM_PROMPT, retryMessage);
    return parseAndValidate(retryRaw);
  }
}
