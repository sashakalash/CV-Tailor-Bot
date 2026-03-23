import PDFDocument from 'pdfkit';
import type { CvData } from '../types/cv.js';

const COLORS = {
  primary: '#1a1a2e',
  secondary: '#4a4a6a',
  accent: '#0066cc',
  text: '#333333',
  light: '#888888',
  line: '#cccccc',
} as const;

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.8);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.primary).text(title.toUpperCase());
  doc
    .moveTo(MARGIN, doc.y + 2)
    .lineTo(MARGIN + CONTENT_WIDTH, doc.y + 2)
    .strokeColor(COLORS.line)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.4);
}

export function generateCvPdf(cv: CvData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      info: { Title: `${cv.name} - CV`, Author: cv.name },
    });

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header: Name
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(cv.name, { align: 'center' });

    // Title
    if (cv.title) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.secondary)
        .text(cv.title, { align: 'center' });
    }

    // Contact line 1: email | phone | location
    const line1Parts: string[] = [];
    if (cv.email) line1Parts.push(cv.email);
    if (cv.phone) line1Parts.push(cv.phone);
    if (cv.location) line1Parts.push(cv.location);

    if (line1Parts.length > 0) {
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(COLORS.light)
        .text(line1Parts.join('  |  '), {
          align: 'center',
          link: cv.email ? `mailto:${cv.email}` : undefined,
        });
    }

    // Contact line 2: linkedin | github (centered, clickable, displayed without https://)
    if (cv.linkedin || cv.github) {
      doc.moveDown(0.1);
      doc.fontSize(9).font('Helvetica');

      const links: Array<{ label: string; url: string }> = [];
      if (cv.linkedin) {
        const label = cv.linkedin.replace(/^https?:\/\//, '');
        const url = cv.linkedin.startsWith('http') ? cv.linkedin : `https://${cv.linkedin}`;
        links.push({ label, url });
      }
      if (cv.github) {
        const label = cv.github.replace(/^https?:\/\//, '');
        const url = cv.github.startsWith('http') ? cv.github : `https://${cv.github}`;
        links.push({ label, url });
      }

      // Render as centered text with link on the entire line (first link URL)
      // Both URLs are visible as text, so users can copy-paste even if only one is clickable
      const sep = '  |  ';
      const fullText = links.map((l) => l.label).join(sep);
      doc.fillColor(COLORS.accent).text(fullText, { align: 'center', link: links[0].url });

      doc.moveDown(0.5);
    }

    // Summary
    if (cv.summary) {
      addSectionTitle(doc, 'Professional Summary');
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.text).text(cv.summary, {
        lineGap: 2,
      });
    }

    // Skills
    if (cv.skills.length > 0) {
      addSectionTitle(doc, 'Skills');

      for (const category of cv.skills) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(COLORS.secondary)
          .text(`${category.category}: `, { continued: true })
          .font('Helvetica')
          .fillColor(COLORS.text)
          .text(category.items.join(', '));
        doc.moveDown(0.2);
      }
    }

    // Experience
    if (cv.experience.length > 0) {
      addSectionTitle(doc, 'Experience');

      for (const exp of cv.experience) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.primary).text(exp.role);
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(COLORS.accent)
          .text(exp.company, { continued: true })
          .fillColor(COLORS.light)
          .text(`  |  ${exp.period}`);
        doc.moveDown(0.2);

        for (const bullet of exp.bullets) {
          doc.fontSize(9).font('Helvetica').fillColor(COLORS.text).text(`•  ${bullet}`, {
            indent: 10,
            lineGap: 1,
          });
        }
        doc.moveDown(0.4);
      }
    }

    // Education
    if (cv.education.length > 0) {
      addSectionTitle(doc, 'Education');

      for (const edu of cv.education) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.primary).text(edu.degree);
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(COLORS.accent)
          .text(edu.institution, { continued: true })
          .fillColor(COLORS.light)
          .text(edu.year ? `  |  ${edu.year}` : '');
        doc.moveDown(0.3);
      }
    }

    // Languages
    if (cv.languages && cv.languages.length > 0) {
      addSectionTitle(doc, 'Languages');
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.text).text(cv.languages.join(', '));
    }

    doc.end();
  });
}
