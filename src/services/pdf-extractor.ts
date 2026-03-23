import { PDFParse } from 'pdf-parse';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();

  if (!result.text || result.text.trim().length === 0) {
    throw new Error(
      'Could not extract text from this PDF. It might be image-based or scanned. ' +
        'Please use a text-based PDF.',
    );
  }

  return result.text;
}
