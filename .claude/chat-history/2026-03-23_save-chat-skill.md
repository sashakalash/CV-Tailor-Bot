# Save Chat Skill Setup

**Date**: 2026-03-23

## Goal

Create a reusable `/save-chat` slash command that saves conversation context before restarting Claude.

## Key Decisions

- Made it a **global** command (`~/.claude/commands/save-chat.md`) so it's available across all projects
- Chat history files are saved **per-project** in `.claude/chat-history/`
- Added multilingual description (EN + RU) for discoverability: "save chat, store chat, сохрани чат, сохрани переписку"
- Used frontmatter `description` field for skill matching

## What Was Done

1. Created `~/.claude/commands/save-chat.md` — global slash command that instructs Claude to summarize and save the current conversation
2. Added frontmatter with `description` for skill matching
3. The skill saves structured summaries with: Date, Goal, Key decisions, What was done, Current state, Next steps

## Current State

- `/save-chat` is working and available globally in all projects
- No other work was done in this session — this was the only task

## Next Steps

- Nothing pending — skill is ready to use
