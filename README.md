# CV Tailor Bot

Telegram bot that tailors your CV to a specific job description using Claude AI.

Upload your CV as a PDF, paste the job description, and get back a new PDF with your experience reframed to match the role — without inventing skills you don't have.

## What it does

1. **Parses** your PDF CV into structured sections (summary, experience, skills, education, etc.)
2. **Analyzes** the job description to identify key requirements and terminology
3. **Rewrites** your CV to better match the role:
   - Rephrases the summary to emphasize relevant experience
   - Reorders and rewords work experience bullets to highlight matching achievements
   - Moves relevant skills to the top of the list
   - Aligns terminology with the JD (e.g. "unit tests" -> "automated testing")
4. **Generates** a clean PDF and sends it back in the chat

### What it does NOT do

- Never adds skills or technologies you didn't mention
- Never invents job positions, companies, or metrics
- Never changes dates, company names, or education facts
- Same content, better packaging for the target role

## Tech stack

- **TypeScript** + **Node.js**
- **grammY** — Telegram bot framework
- **Claude API** (Anthropic) — CV analysis and rewriting
- **pdf-parse** — PDF text extraction
- **PDFKit** — PDF generation

## Setup

### Prerequisites

- Node.js 18+
- Telegram bot token (from [@BotFather](https://t.me/BotFather))
- Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
git clone <repo-url>
cd pdf-editor
npm install
```

### Configuration

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

```
BOT_TOKEN=your-telegram-bot-token
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
node dist/index.js
```

## Usage

1. Open your bot in Telegram
2. Send `/start`
3. Send your CV as a PDF file
4. Paste the job description text
5. Wait for the tailored CV PDF

Send `/cancel` at any point to restart the flow.

## Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `npm run dev`    | Start with hot reload     |
| `npm run build`  | Compile TypeScript        |
| `npm run lint`   | Run ESLint                |
| `npm run format` | Format code with Prettier |
