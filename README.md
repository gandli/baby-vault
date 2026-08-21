# 👶 BabyVault

**Private baby growth journal. Local-first, zero upload, works offline.**

## What is BabyVault?

A local-first PWA for parents to capture and organize their baby's growth moments — photos, videos, and milestones. All data stays in your browser (IndexedDB + localStorage); nothing is ever uploaded.

> Current status: **MVP** — timeline, milestones, and export are implemented. Cloud sync, E2E encryption, and family sharing are planned (see [PRD](./PRD.md)).

## Key Features

- 📸 **Photo & Video Capture** — Snap or upload, auto-organized by month age
- 🏷️ **Milestones** — First smile, first steps — tag and celebrate every moment
- 📅 **Month-Age Timeline** — Everything organized around "how old is baby now"
- 🌐 **Bilingual UI** — Chinese / English / Japanese interface
- 📤 **Data Export** — One-tap JSON export of everything you've saved
- 📱 **PWA** — Install on any device, works offline

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 + Tailwind CSS 4 |
| Storage | Browser IndexedDB + localStorage (zero upload) |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Vitest + React Testing Library |

## Why local-first?

| | BabyVault | Cloud baby apps |
|--|-----------|-----------------|
| Zero upload | ✅ | ❌ |
| Works offline | ✅ | ❌ |
| Ad-free | ✅ | ❌ |
| Data export | ✅ | varies |
| Open Source | ✅ | ❌ |

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run test:run # run tests once
```

Deployment to Cloudflare Pages runs automatically on push to `main` via GitHub Actions.

## Documentation

- [Product Requirements Document (PRD)](./PRD.md)
