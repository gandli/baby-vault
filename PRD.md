# PRD — BabyVault

## 1. Overview

**Product Name:** BabyVault
**Tagline:** Baby growth records that stay at home — privacy-first, AI-powered.
**Target Users:** New parents (0-3 years) who want organized growth records without uploading to the cloud.

## 2. Problem Statement

New parents take thousands of photos/videos but they end up scattered across phone galleries, family chats, and social media. Existing baby apps (亲宝宝, BabyTree) upload everything to the cloud, raising privacy concerns about children's biometric data. Parents also struggle with "what should I do with my baby today?"

## 3. Design Principles

### 🤱 One-Handed Operation (First Priority)
- All core actions reachable by thumb
- Large tap targets, bottom navigation, swipe gestures
- One-tap photo capture with voice memo (no typing required)
- Milestone check-off: single tap, no forms
- Designed for: one hand holding baby, one hand on phone

### 🏠 Data Stays Home
- Local/LAN storage only (Mac Mini, NAS, or device)
- Zero cloud upload by default
- Optional: Tailscale for remote access (E2E encrypted)

### 🧒 Age-Appropriate Intelligence
- AI recommendations adapt to exact age (months + days)
- Milestone tracking calibrated to WHO standards

## 4. Core Features

### 4.1 Growth Timeline
- Photos/videos auto-archived by baby's age
- Voice memos: "8 months 15 days — first time standing for 3 seconds"
- AI auto-tagging: people (baby/dad/mom/grandparents), scenes (indoor/outdoor/bath)
- Swipeable timeline from birth to now

### 4.2 Milestone Tracker
- Four dimensions: gross motor / fine motor / language / social
- Each milestone can bind photo/video as evidence
- Celebration card on achievement 🎉 (shareable to family)
- WHO standard reference — no anxiety, "every baby has their own pace"

### 4.3 Daily Play Recommendations
- 2-3 parent-child activities per day based on current age + achieved milestones
- Each activity includes: target skill, instructions, duration, props (common household items)
- Example: "8mo → upgraded peek-a-boo: hide toy under towel, trains object permanence"

### 4.4 Feeding Diary
- New food introduction log with date
- Allergy reaction marking (rash/diarrhea/refusal)
- Auto-generated "tried" and "to-try" food lists

### 4.5 Monthly Growth Report
- AI-generated: new skills, weight/height curve, play completion rate
- Exportable PDF for sharing with family
- "8-month summary: learned to sit independently, started saying mama, tried 12 new foods"

## 5. Storage Architecture

```
iPhone/iPad (App)
    │
    ├── Home WiFi → Auto-sync to Mac Mini / NAS
    │   ├── Original photos/videos (LAN transfer, fast)
    │   ├── AI processing (tagging/face) runs locally
    │   └── Storage: ~/BabyVault/{name}/YYYY-MM/
    │
    ├── Away from home → Local cache
    │   └── Auto-upload when back on home WiFi
    │
    └── Optional: Family sharing
        ├── LAN: Grandparents' iPad direct access
        └── Remote: Tailscale mesh (E2E encrypted, no cloud)
```

## 6. Technical Stack

| Layer | Solution | Rationale |
|-------|----------|-----------|
| App | Flutter | Cross-platform, familiar |
| Local sync | WebDAV + Bonjour auto-discovery | Zero-config, same WiFi auto-connect |
| Server | Mac Mini lightweight HTTP service | Already owned |
| AI tagging | Core ML + Vision Framework | Fully offline, privacy safe |
| Database | SQLite (local) | Lightweight, reliable |
| Remote access | Tailscale (optional) | E2E encrypted, no public IP needed |

## 7. Monetization

| Tier | Price | Features |
|------|-------|----------|
| Free | ¥0 | Basic recording + milestones + 1 daily activity |
| Family | ¥68/yr | Unlimited activities + monthly reports + multi-baby + family sharing |
| Lifetime | ¥168 once | All features forever |

**No data selling. No ads.** This IS the selling point.

## 8. MVP Scope (4 Weeks)

| Week | Deliverable |
|------|-------------|
| 1 | Flutter project + age calculator + photo recording |
| 2 | 4-dimension milestone system + check-off |
| 3 | LAN sync (Mac Mini WebDAV + Bonjour auto-discovery) |
| 4 | AI play recommendations (age-based game database) |

## 9. Competitive Advantage

| | 亲宝宝 | 宝宝树 | BabyVault |
|---|---|---|---|
| Storage | ☁️ Cloud | ☁️ Cloud | 🏠 Local |
| Privacy | ❌ Ads + analytics | ❌ Ads | ✅ Zero upload |
| AI play | ❌ | ❌ | ✅ Age-specific |
| One-handed | ❌ | ❌ | ✅ Core principle |
| Milestone tracking | Basic | Basic | ✅ 4D + media binding |
| Offline | ❌ | ❌ | ✅ Fully offline |

## 10. Hero Tagline

> **"Baby's first steps shouldn't live on someone else's server."**
