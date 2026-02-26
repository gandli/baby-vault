# 👶 BabyVault

**Secure, private baby growth journal. End-to-end encrypted, family sharing, zero privacy compromise.**

## What is BabyVault?

A PWA for parents to capture and organize their baby's growth moments — photos, videos, and milestones — with end-to-end encryption. The server never sees your baby's photos.

## Key Features

- 📸 **Photo & Video Capture** — Snap or upload, auto-organized by month age
- 🔐 **End-to-End Encryption** — Client-side AES-256-GCM, zero-knowledge server
- 👨‍👩‍👧 **Family Sharing** — Invite grandparents via QR code, secure key exchange
- 🏷️ **Milestones** — First smile, first steps — tag and celebrate every moment
- 📅 **Month-Age Timeline** — Everything organized around "how old is baby now"
- 📱 **PWA** — Install on any device, works offline

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 + Tailwind CSS 4 |
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (zero egress fees) |
| Encryption | Web Crypto API (client-side E2EE) |
| PWA | vite-plugin-pwa (Workbox) |

## Why BabyVault?

| | BabyVault | Qinbaobao | Google Photos |
|--|-----------|-----------|---------------|
| E2E Encryption | ✅ | ❌ | ❌ |
| Month-Age Timeline | ✅ | ✅ | ❌ |
| Family Sharing | ✅ | ✅ | ✅ |
| Ad-Free | ✅ | ❌ | ✅ |
| Data Export | ✅ | ❌ | ✅ |
| Open Source | ✅ | ❌ | ❌ |

## Documentation

- [Product Requirements Document (PRD)](./PRD.md)

## License

MIT

---

Made with 🦞 by BabyVault Team
