# Tile Expert Header — Angular Implementation

**Date**: 2026-03-23

## Goal

Implement a responsive header for the TILE.EXPERT website based on a Figma design (`.fig` file). Requirements from the technical assignment:

- Layout for 414px (mobile) and 1440px (desktop)
- Animated search bar expansion (Angular)
- Component-based architecture
- Project located in: `/Users/kalash/Development/AI/Remote.Team_technical_assignment_for_Front-End_Developer.fig/tile-expert-header/`

## Key Decisions

- **Angular 21** scaffolded with SCSS, no routing, no SSR
- **Standalone components** (Angular's modern approach, no NgModules)
- **Material Icons** loaded via Google Fonts CDN for header icons
- **CSS animations** for search bar expansion (cubic-bezier, 0.35s transition) instead of Angular Animations module — simpler, lighter
- **ESLint config adapted for Angular** from the shared React-based `~/.claude/eslint.config.mjs` — removed React/JSX plugins, kept all TS rules
- `.fig` file is proprietary binary (`fig-kiwi4`) — not parseable without Figma API. Design specs extracted visually from exported images and GIF

## What Was Done

### Components created (6):

- `header` — orchestrator, manages search expansion state via signal
- `logo` — TILE.EXPERT logo image
- `nav-menu` — 6 nav links (ССЫЛКИ, КОНТАКТЫ, ТЕГИ, ПРОСЬБЫ, ИЗБРАННОЕ, ПОСЕЩЕНИЯ) with dropdown arrows
- `search-bar` — animated expanding search with CSS transitions, auto-focus on expand
- `action-icons` — add, mail, notifications (red badge "3"), avatar
- `sub-header` — secondary nav row (Новости компании, Опросы, Заметки, Общие)

### Sizing adjustments (matched to Figma):

- Header bar: 40px height, 16px horizontal padding
- Logo: 20px height
- Nav: 12px font, 6px/8px padding
- Icons/avatar: 32×32px
- Sub-header: 6px/16px padding, 13px font

### Tooling set up:

- ESLint (flat config, TypeScript rules)
- Prettier (angular HTML parser, single quotes, 100 char width)
- Husky + lint-staged (pre-commit hook runs eslint --fix + prettier --write)
- `.eslintignore` and `.prettierignore` copied from `~/.claude/`

### Assets:

- Logo PNG and avatar PNG copied to `public/assets/images/`

## Current State

- **Build**: passes clean (`npx ng build`)
- **Lint**: passes clean (`npx eslint "src/**/*.ts"`)
- **Prettier**: all files formatted
- **Dev server**: was running on `http://localhost:4201`
- **Playwright**: installed + chromium downloaded, config file created, but **e2e test file was not written** (user interrupted)

## Next Steps

1. **Write Playwright e2e tests** — config exists at `playwright.config.ts`, needs `e2e/header.spec.ts`
2. **Visual QA** — compare rendered header against Figma at both breakpoints (414px, 1440px)
3. **Mobile hamburger menu** — CSS class `.header__burger` is styled but the button element is not in the template yet; nav menu should open as a dropdown/drawer on mobile
4. **Search animation refinement** — verify animation matches the GIF reference exactly (timing, easing)
5. **Git init + first commit** — repo was initialized for Husky but no commits yet
