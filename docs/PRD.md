# 👶 BabyVault — 产品需求文档 (PRD)

> 安全、私密的宝宝成长记录平台。端到端加密，家人共享，零隐私妥协。

**版本**：v0.1.0（MVP）
**日期**：2026-02-27
**作者**：老板 & 🦞

---

## 1. 产品概述

### 1.1 一句话定位
**帮月龄宝宝的父母安全记录成长瞬间，照片视频端到端加密，只有家人能看。**

### 1.2 目标用户
- 0-36 月龄宝宝的父母（核心：新手爸妈）
- 关注隐私、不想把宝宝照片交给第三方平台
- 希望家人（爷爷奶奶/外公外婆）也能看到

### 1.3 核心痛点

| 痛点 | 现状 | BabyVault 方案 |
|------|------|----------------|
| 隐私焦虑 | 亲宝宝/宝宝树等平台存储用户照片，隐私条款模糊 | 端到端加密，服务端看不到照片 |
| 分散记录 | 照片在手机相册、微信、各种 App 里散落 | 统一入口，按月龄/里程碑组织 |
| 家人共享难 | 微信群发图压缩严重，长辈不会用云盘 | 家庭邀请码，扫码即加入，原图共享 |
| 回忆检索难 | 找"宝宝第一次翻身"的照片要翻半天 | 标签 + 里程碑 + 月龄时间线 |

### 1.4 四维评估

- 💪 **价值清晰度**：「加密保护宝宝照片，只有家人能看」— 一句话说清
- ⚡ **价值时间线**：即时 — 拍完就能看到加密上传、家人即时可见
- 💪 **价值感知**：月龄时间线、成长里程碑徽章、存储用量可视化
- 🗣️ **价值发现**：妈妈群口碑传播 + 小红书/抖音隐私焦虑话题引流

---

## 2. 功能规划

### 2.1 MVP（v0.1）

#### 📸 拍照/上传
- 调用系统相机拍照（`<input type="file" capture>`）
- 从相册批量选择上传
- 上传前客户端 AES-256-GCM 加密
- 支持照片和短视频（≤60 秒）
- 上传进度显示
- 自动提取 EXIF 日期

#### 📅 月龄时间线
- 按月龄自动分组（出生 → 1月龄 → 2月龄 → ...）
- 瀑布流/网格展示
- 点击查看大图（客户端解密后展示）
- 左右滑动切换月龄

#### 🏷️ 里程碑记录
- 预设里程碑模板：第一次微笑、翻身、坐起、爬行、站立、走路、说话...
- 自定义里程碑
- 关联照片/视频
- 里程碑徽章展示

#### 👨‍👩‍👧 家庭共享
- 创建家庭组（自动生成邀请码/二维码）
- 扫码加入家庭组
- 家庭成员角色：管理员（父母）/ 成员（长辈/亲友）
- 共享密钥机制：管理员邀请时通过安全通道分发解密密钥
- 成员只能查看，管理员可上传/删除

#### 🔐 安全
- 注册/登录：手机号 + 验证码（国内）/ 邮箱（海外）
- 端到端加密：
  - 注册时生成 RSA 密钥对，私钥用用户密码加密存储
  - 每个家庭组一个 AES 对称密钥
  - 邀请成员时用对方公钥加密家庭密钥传输
  - 媒体文件用家庭 AES 密钥加密后上传
- 服务端零知识：只存密文

#### ⚙️ 设置
- 宝宝资料（姓名/昵称、生日、性别）
- 存储用量查看
- 数据导出（加密包下载）
- 账号管理

### 2.2 后续版本规划

| 版本 | 功能 | 说明 |
|------|------|------|
| v0.2 | AI 成长报告 | 按月自动生成成长总结 |
| v0.2 | 身高体重曲线 | WHO 标准曲线对比 |
| v0.3 | 智能相册 | 客户端人脸检测自动分类 |
| v0.3 | 成长对比 | 同一姿势不同月龄对比图 |
| v0.4 | 打印服务 | 照片书/台历一键下单 |
| v0.4 | 时间胶囊 | 给未来宝宝的信，定时解锁 |

---

## 3. 技术架构

### 3.1 整体架构

```
┌─────────────────────┐
│   PWA (React 19)    │
│  拍照/浏览/加解密    │
└──────────┬──────────┘
           │ HTTPS
┌──────────▼──────────┐
│  Cloudflare Workers  │
│    API 层 (Hono)     │
└──┬───────────────┬──┘
   │               │
┌──▼──┐       ┌───▼───┐
│  D1  │       │  R2   │
│元数据│       │密文媒体│
│SQLite│       │ 存储   │
└──────┘       └───────┘
```

### 3.2 技术栈

| 层 | 技术 | 理由 |
|----|------|------|
| 前端 | React 19 + TypeScript + Vite 7 | 生态成熟，PWA 支持好 |
| UI | Tailwind CSS 4 + Radix UI | 快速开发 + 无障碍 |
| PWA | vite-plugin-pwa (Workbox) | 离线缓存，原生体验 |
| 加密 | Web Crypto API | 浏览器原生，性能好 |
| 后端 | Cloudflare Workers + Hono | 零运维，全球边缘 |
| 数据库 | Cloudflare D1 (SQLite) | 元数据存储，免费额度够 |
| 媒体存储 | Cloudflare R2 | 免出站流量费 |
| 认证 | 自建 JWT + 手机号/邮箱 OTP | 轻量，不依赖第三方 |
| 部署 | Wrangler CLI + GitHub Actions | 自动化 CI/CD |

### 3.3 端到端加密流程

```
注册：
  生成 RSA-OAEP 密钥对 → 私钥用 PBKDF2(密码) 加密 → 上传公钥+加密私钥到服务端

创建家庭：
  生成 AES-256-GCM 家庭密钥 → 用自己的公钥加密一份存服务端

邀请成员：
  获取对方公钥 → 用对方公钥加密家庭密钥 → 上传

上传照片：
  原图 → AES-256-GCM(家庭密钥) 加密 → 上传密文到 R2
  缩略图 → 同样加密 → 上传

浏览照片：
  下载密文 → AES-256-GCM(家庭密钥) 解密 → 显示
```

### 3.4 数据模型

```sql
-- 用户
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  public_key TEXT NOT NULL,        -- RSA 公钥
  encrypted_private_key TEXT NOT NULL, -- 加密的 RSA 私钥
  created_at INTEGER NOT NULL
);

-- 宝宝
CREATE TABLE babies (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,               -- 加密存储
  birthday TEXT NOT NULL,            -- 加密存储
  gender TEXT,
  created_at INTEGER NOT NULL
);

-- 家庭组
CREATE TABLE families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

-- 家庭成员
CREATE TABLE family_members (
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- admin | member
  encrypted_family_key TEXT NOT NULL,  -- 用该成员公钥加密的家庭密钥
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (family_id, user_id)
);

-- 媒体
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  type TEXT NOT NULL,               -- photo | video
  r2_key TEXT NOT NULL,             -- R2 存储路径
  r2_thumb_key TEXT,                -- 缩略图路径
  encrypted_metadata TEXT,          -- 加密的 EXIF/描述等
  size INTEGER NOT NULL,
  taken_at INTEGER,                 -- 拍摄时间
  month_age INTEGER,                -- 自动计算的月龄
  created_at INTEGER NOT NULL
);

-- 里程碑
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  type TEXT NOT NULL,               -- preset | custom
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  media_ids TEXT,                   -- JSON 数组
  note TEXT,                        -- 加密存储
  created_at INTEGER NOT NULL
);
```

---

## 4. API 设计

### 4.1 认证

```
POST /api/auth/send-code     # 发送验证码
POST /api/auth/verify         # 验证码登录/注册
POST /api/auth/refresh        # 刷新 Token
```

### 4.2 家庭

```
POST   /api/families                  # 创建家庭
GET    /api/families/:id              # 获取家庭信息
POST   /api/families/:id/invite       # 生成邀请
POST   /api/families/:id/join         # 加入家庭
DELETE /api/families/:id/members/:uid # 移除成员
```

### 4.3 宝宝

```
POST   /api/families/:fid/babies      # 添加宝宝
PUT    /api/families/:fid/babies/:id   # 编辑宝宝信息
GET    /api/families/:fid/babies       # 获取宝宝列表
```

### 4.4 媒体

```
POST   /api/media/upload-url    # 获取 R2 预签名上传 URL
POST   /api/media               # 创建媒体记录
GET    /api/media?baby_id=&month_age=  # 按月龄查询
GET    /api/media/:id           # 获取单条（含预签名下载 URL）
DELETE /api/media/:id           # 删除
```

### 4.5 里程碑

```
POST   /api/milestones          # 创建里程碑
GET    /api/milestones?baby_id= # 查询里程碑
PUT    /api/milestones/:id      # 编辑
DELETE /api/milestones/:id      # 删除
```

---

## 5. 用户体验

### 5.1 核心流程

```
首次使用：
  打开网页 → 手机号登录 → 创建宝宝(姓名+生日) → 自动创建家庭组
  → 拍第一张照片 → 🎉 庆祝动画 → 引导分享邀请码给家人

日常使用：
  打开 App → 看到月龄时间线 → 点 + 拍照/选照片 → 自动上传加密
  → 可选添加描述/标记里程碑

家人加入：
  收到邀请链接 → 打开 → 登录/注册 → 自动加入家庭 → 看到所有照片
```

### 5.2 设计原则

1. **极简** — 打开就能拍，一步上传，不要多余操作
2. **温暖** — Duolingo 风格，圆角、柔和配色、庆祝动画
3. **安全感** — 随处可见的🔒标识，加密状态透明
4. **月龄为轴** — 一切围绕「宝宝几个月了」组织

### 5.3 配色方案

- 主色：柔和蓝 `#6CB4EE`（安全感 + 性别中立）
- 辅色：暖黄 `#FFD966`（温暖 + 活力）
- 背景：米白 `#FFF8F0`
- 深色模式：深蓝灰 `#1A1B2E`

---

## 6. 商业模式

### 6.1 免费版
- 1 个宝宝
- 1 GB 存储
- 3 位家庭成员
- 基础里程碑模板

### 6.2 高级版（¥9.9/月 或 ¥99/年）
- 不限宝宝数量
- 50 GB 存储
- 10 位家庭成员
- 全部里程碑模板
- AI 成长报告
- 数据导出

### 6.3 成本结构

| 项目 | 免费用户成本 | 付费用户成本 |
|------|-------------|-------------|
| R2 存储 (1GB) | ¥0.00（免费额度内） | ¥0.10/月 |
| R2 存储 (50GB) | — | ¥5.25/月 |
| D1 | 免费额度内 | 免费额度内 |
| Workers | 免费额度内 | 免费额度内 |
| 短信验证码 | ¥0.05/条 | ¥0.05/条 |

**毛利**：付费用户 ¥99/年 - 存储成本 ¥63/年 ≈ **36% 毛利**（保守估算，多数用户用不满 50GB）

---

## 7. MVP 里程碑

| 阶段 | 内容 | 时间 |
|------|------|------|
| **M1** | 项目初始化 + 认证 + 基础 UI | 1 周 |
| **M2** | 加密上传 + R2 存储 + 月龄时间线 | 1 周 |
| **M3** | 家庭共享 + 密钥分发 | 1 周 |
| **M4** | 里程碑 + PWA 离线 + 打磨 | 1 周 |
| **发布** | 内测（自己家先用） | 第 5 周 |

---

## 8. 竞品对比

| 功能 | 亲宝宝 | 宝宝树 | Google Photos | **BabyVault** |
|------|--------|--------|---------------|---------------|
| 端到端加密 | ❌ | ❌ | ❌ | ✅ |
| 月龄时间线 | ✅ | ✅ | ❌ | ✅ |
| 家庭共享 | ✅ | ❌ | ✅ | ✅ |
| 里程碑 | ✅ | ✅ | ❌ | ✅ |
| 无广告 | ❌ | ❌ | ✅ | ✅ |
| 数据可导出 | ❌ | ❌ | ✅ | ✅ |
| 隐私政策透明 | 😐 | 😐 | 😐 | ✅ 开源可审计 |

**核心差异化：端到端加密 + 零知识服务端 + 数据主权归用户**

---

## 9. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 加密导致体验慢 | 用户流失 | 缩略图预加载 + Web Worker 后台解密 |
| 用户忘记密码丢失私钥 | 数据永久丢失 | 恢复码机制（12 词助记词备份） |
| R2 免费额度用完 | 成本上升 | 监控用量 + 付费转化引导 |
| PWA 在 iOS 体验差 | iOS 用户体验 | iOS 16.4+ 已支持推送，持续跟进 |
| 短信验证码成本 | 薅羊毛 | 频率限制 + 图形验证码 |

---

*Made with 🦞 by BabyVault Team*
