# 👶 BabyVault — Product Requirements Document (PRD)

> Secure, private baby growth tracking platform. End-to-end encryption, family sharing, zero privacy compromise.

**Version**: v0.1.0 (MVP)
**Date**: 2026-02-27
**Authors**: Boss & 🦞

---

## 1. Product Overview

### 1.1 One-Sentence Positioning
**Safely record growth moments for monthly babies, photos and videos end-to-end encrypted, visible only to family.**

### 1.2 Target Users
- Parents of 0-36 month old babies (core: new parents)
- Concerned about privacy, don't want to hand over baby photos to third-party platforms
- Want grandparents/grandparents to see as well

### 1.3 Core Pain Points

| Pain Point | Current State | BabyVault Solution |
|------------|---------------|-------------------|
| Privacy anxiety | Platforms like Qinqinbaby/BabyTree store user photos, privacy terms unclear | End-to-end encryption, service can't see photos |
| Scattered records | Photos scattered across phone albums, WeChat, various apps | Unified entry, organized by months/milestones |
| Difficult family sharing | WeChat group images heavily compressed, elders don't know cloud storage | Family invitation codes, scan to join, original image sharing |
| Hard to retrieve memories | Finding "baby's first roll" photo takes forever | Tags + Milestones + Monthly timeline |

### 1.4 Four-Dimensional Evaluation

- 💪 **Value Clarity**: "Encrypt baby photos, only family can view" — clear in one sentence
- ⚡ **Value Timeline**: Instant — upload and encrypted, family visible instantly
- 💪 **Value Perception**: Monthly timeline, growth milestone badges, storage usage visualization
- 🗣️ **Value Discovery**: Mom groups word-of-mouth + Xiaohongshu/Douyin privacy anxiety topic traffic

---

## 2. Feature Planning

### 2.1 MVP (v0.1)

#### 📸 Photo/Capture Upload
- Call system camera for photos (`<input type="file" capture>`)
- Bulk selection from album uploads
- Client-side AES-256-GCM encryption before upload
- Support photos and short videos (≤60 seconds)
- Upload progress display
- Auto-extract EXIF dates

#### 📅 Monthly Timeline
- Automatic grouping by months (birth → 1 month → 2 months → ...)
- Waterfall/grid display
- Click to view large images (client decrypted display)
- Swipe left/right to switch months

#### 🏷️ Milestone Records
- Preset milestone templates: first smile, roll over, sit up, crawl, stand, walk, talk...
- Custom milestones
- Associated photos/videos
- Milestone badge display

#### 👨‍👩‍👧 Family Sharing
- Create family group (auto-generated invitation code/QR code)
- Scan to join family group
- Family member roles: Admin (parents) / Members (grandparents/friends)
- Shared key mechanism: Admin distributes decryption keys through secure channel when inviting
- Members can only view, admins can upload/delete

#### 🔐 Security
- Registration/Login: Phone + verification code (domestic) / Email (overseas)
- End-to-end encryption:
  - Generate RSA key pair during registration, encrypt private key with user password
  - One AES symmetric key per family group
  - Invite members using their public key to encrypt family key transmission
  - Media files encrypted with family AES key before upload
- Zero-knowledge server: Store ciphertext only

#### ⚙️ Settings
- Baby profile (name/nickname, birthday, gender)
- Storage usage view
- Data export (encrypted package download)
- Account management

### 2.2 Future Version Planning

| Version | Features | Description |
|---------|----------|-------------|
| v0.2 | AI Growth Reports | Auto-generate monthly growth summaries |
| v0.2 | Height/Weight Curves | WHO standard curve comparison |
| v0.3 | Smart Albums | Client-side face detection automatic classification |
| v0.3 | Growth Comparison | Same pose, different months comparison images |
| v0.4 | Printing Service | Photo books/calendars one-click order |
| v0.4 | Time Capsule | Letters to future baby, timed unlock |

---

## 3. Technical Architecture

### 3.1 Overall Architecture

```
┌─────────────────────┐
│   PWA (React 19)    │
│  Capture/Browse/Encrypt│
└──────────┬──────────┘
           │ HTTPS
┌──────────▼──────────┐
│  Cloudflare Workers  │
│    API Layer (Hono)  │
└──┬───────────────┬──┘
   │               │
┌──▼──┐       ┌───▼───┐
│  D1  │       │  R2   │
│Metadata│      │Ciphertext Media│
│SQLite│       │ Storage │
└──────┘       └───────┘
```

### 3.2 Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | React 19 + TypeScript + Vite 7 | Mature ecosystem, good PWA support |
| UI | Tailwind CSS 4 + Radix UI | Fast development + accessibility |
| PWA | vite-plugin-pwa (Workbox) | Offline cache, native experience |
| Encryption | Web Crypto API | Native browser, good performance |
| Backend | Cloudflare Workers + Hono | Zero maintenance, global edge |
| Database | Cloudflare D1 (SQLite) | Metadata storage, free quota sufficient |
| Media Storage | Cloudflare R2 | Free outbound traffic |
| Authentication | Self-built JWT + phone/email OTP | Lightweight, no third-party dependency |
| Deployment | Wrangler CLI + GitHub Actions | Automated CI/CD |

### 3.3 End-to-End Encryption Flow

```
Registration:
  Generate RSA-OAEP key pair → Encrypt private key with PBKDF2(password) → Upload public key + encrypted private key to server

Create Family:
  Generate AES-256-GCM family key → Encrypt one copy with own public key → Store on server

Invite Member:
  Get other's public key → Encrypt family key with their public key → Upload

Upload Photo:
  Original → AES-256-GCM(family key) encrypted → Upload ciphertext to R2
  Thumbnail → Same encryption → Upload

View Photo:
  Download ciphertext → AES-256-GCM(family key) decrypt → Display
```

### 3.4 Data Model

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  public_key TEXT NOT NULL,        -- RSA public key
  encrypted_private_key TEXT NOT NULL, -- Encrypted RSA private key
  created_at INTEGER NOT NULL
);

-- Babies
CREATE TABLE babies (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,               -- Encrypted storage
  birthday TEXT NOT NULL,            -- Encrypted storage
  gender TEXT,
  created_at INTEGER NOT NULL
);

-- Families
CREATE TABLE families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

-- Family Members
CREATE TABLE family_members (
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- admin | member
  encrypted_family_key TEXT NOT NULL,  -- Family key encrypted with member's public key
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (family_id, user_id)
);

-- Media
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  type TEXT NOT NULL,               -- photo | video
  r2_key TEXT NOT NULL,             -- R2 storage path
  r2_thumb_key TEXT,                -- Thumbnail path
  encrypted_metadata TEXT,          -- Encrypted EXIF/description, etc.
  size INTEGER NOT NULL,
  taken_at INTEGER,                 -- Shooting time
  month_age INTEGER,                -- Auto-calculated months
  created_at INTEGER NOT NULL
);

-- Milestones
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  type TEXT NOT NULL,               -- preset | custom
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  media_ids TEXT,                   -- JSON array
  note TEXT,                        -- Encrypted storage
  created_at INTEGER NOT NULL
);
```

---

## 4. API Design

### 4.1 Authentication

```
POST /api/auth/send-code     # Send verification code
POST /api/auth/verify         # Code login/register
POST /api/auth/refresh        # Refresh Token
```

### 4.2 Families

```
POST   /api/families                  # Create family
GET    /api/families/:id              # Get family info
POST   /api/families/:id/invite       # Generate invitation
POST   /api/families/:id/join         # Join family
DELETE /api/families/:id/members/:uid # Remove member
```

### 4.3 Babies

```
POST   /api/families/:fid/babies      # Add baby
PUT    /api/families/:fid/babies/:id   # Edit baby info
GET    /api/families/:fid/babies       # Get baby list
```

### 4.4 Media

```
POST   /api/media/upload-url    # Get R2 pre-signed upload URL
POST   /api/media               # Create media record
GET    /api/media?baby_id=&month_age=  # Query by months
GET    /api/media/:id           # Get single item (with pre-signed download URL)
DELETE /api/media/:id           # Delete
```

### 4.5 Milestones

```
POST   /api/milestones          # Create milestone
GET    /api/milestones?baby_id= # Query milestones
PUT    /api/milestones/:id      # Edit
DELETE /api/milestones/:id      # Delete
```

---

## 5. User Experience

### 5.1 Core Flows

```
First-time use:
  Open web → Phone login → Create baby (name + birthday) → Auto-create family group
  → Take first photo → 🎉 Celebration animation → Guide to share invitation code with family

Daily use:
  Open app → See monthly timeline → Tap + take photo/select photo → Auto-upload encrypted
  → Optionally add description/mark milestone

Family join:
  Receive invitation link → Open → Login/register → Auto-join family → See all photos
```

### 5.2 Design Principles

1. **Minimal** — Open and shoot, one-step upload, no extra operations
2. **Warm** — Duolingo style, rounded corners, soft colors, celebration animations
3. **Secure** — 🔒 everywhere, transparent encryption status
4. **Month-focused** — Everything organized around "how many months old is baby"

### 5.3 Color Scheme

- Primary: Soft blue `#6CB4EE` (security + gender neutral)
- Accent: Warm yellow `#FFD966` (warmth + vitality)
- Background: Off-white `#FFF8F0`
- Dark mode: Deep blue-gray `#1A1B2E`

---

## 6. Business Model

### 6.1 Free Version
- 1 baby
- 1 GB storage
- 3 family members
- Basic milestone templates

### 6.2 Premium Version (¥9.9/month or ¥99/year)
- Unlimited baby count
- 50 GB storage
- 10 family members
- All milestone templates
- AI growth reports
- Data export

### 6.3 Cost Structure

| Item | Free User Cost | Paid User Cost |
|------|----------------|----------------|
| R2 Storage (1GB) | ¥0.00 (within free quota) | ¥0.10/month |
| R2 Storage (50GB) | — | ¥5.25/month |
| D1 | Within free quota | Within free quota |
| Workers | Within free quota | Within free quota |
| SMS Verification | ¥0.05/per message | ¥0.05/per message |

**Gross margin**: Paid user ¥99/year - Storage cost ¥63/year ≈ **36% gross margin** (conservative estimate, most users won't use full 50GB)

---

## 7. MVP Milestones

| Phase | Content | Timeline |
|-------|---------|----------|
| **M1** | Project initialization + authentication + basic UI | 1 week |
| **M2** | Encryption upload + R2 storage + monthly timeline | 1 week |
| **M3** | Family sharing + key distribution | 1 week |
| **M4** | Milestones + PWA offline + polish | 1 week |
| **Launch** | Beta testing (try with own family first) | Week 5 |

---

## 8. Competitor Analysis

| Feature | Qinqinbaby | BabyTree | Google Photos | **BabyVault** |
|---------|------------|----------|---------------|---------------|
| End-to-end encryption | ❌ | ❌ | ❌ | ✅ |
| Monthly timeline | ✅ | ✅ | ❌ | ✅ |
| Family sharing | ✅ | ❌ | ✅ | ✅ |
| Milestones | ✅ | ✅ | ❌ | ✅ |
| Ad-free | ❌ | ❌ | ✅ | ✅ |
| Data exportable | ❌ | ❌ | ✅ | ✅ |
| Transparent privacy policy | 😐 | 😐 | 😐 | ✅ Open source auditable |

**Core differentiation: End-to-end encryption + Zero-knowledge server + Data sovereignty to users**

---

## 9. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Encryption causes slow experience | User churn | Thumbnail preload + Web Worker background decryption |
| User forgets password, loses private key | Permanent data loss | Recovery code mechanism (12-word mnemonic backup) |
| R2 free quota exhausted | Rising costs | Monitor usage + paid conversion guidance |
| PWA poor iOS experience | iOS user experience | iOS 16.4+ supports push, continuous follow-up |
| SMS verification costs | Fraudulent usage | Frequency limits + captcha |

---

*Made with 🦞 by BabyVault Team*