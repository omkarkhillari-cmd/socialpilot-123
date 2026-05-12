# SocialPilot — AI Social Media Content Pipeline

> An AI-powered social media content studio for brands and creators. Generate platform-perfect posts, captions, threads, campaigns, and images using **Google Gemini AI**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [AI Integration](#ai-integration)
- [Deployment](#deployment)

---

## Overview

SocialPilot is a full-stack AI SaaS application that helps businesses and creators generate complete social media content pipelines. Users create brand workspaces, then use Gemini AI to produce content tailored to specific platforms, tones, and objectives — with real-time streaming, content history, scheduling UI, and multi-format export.

---

## Features

### ✅ Core Features
| Feature | Status |
|---|---|
| JWT Authentication (signup/login) | ✅ |
| Protected dashboard | ✅ |
| Multiple brand workspaces | ✅ |
| Content history per workspace | ✅ |
| Platform selector (Instagram, LinkedIn, Twitter/X, Facebook, TikTok) | ✅ |
| Tone/style selector (8 tones) | ✅ |
| AI text generation via Gemini 1.5 Flash | ✅ |
| AI image generation via Gemini 2.0 Flash | ✅ |
| Save / Edit / Delete / Regenerate content | ✅ |
| Content approval workflow | ✅ |
| Scheduling UI with calendar view | ✅ |
| Export as Markdown (.md) | ✅ |
| Export as JSON | ✅ |
| Export as PDF (client-side, jsPDF) | ✅ |
| Dark / Light mode | ✅ |
| Analytics dashboard (Recharts) | ✅ |
| Real-time AI streaming (SSE) | ✅ |
| Prompt templates | ✅ |
| Reel / video scripts | ✅ |
| Campaign concept generator | ✅ |
| Hashtag generator (tiered) | ✅ |
| Carousel slide text | ✅ |

---

## Tech Stack

### Frontend
- **React 18** + Vite
- **TailwindCSS** — utility-first styling with dark mode
- **Zustand** — lightweight global state (auth, theme)
- **TanStack Query (React Query)** — server state, caching, mutations
- **React Router v6** — client-side routing
- **Recharts** — analytics charts
- **date-fns** — calendar utilities
- **jsPDF** — client-side PDF export
- **Framer Motion** — animations
- **react-hot-toast** — notifications

### Backend
- **Node.js + Express** — REST API
- **@google/generative-ai** — Gemini SDK (text + image)
- **jsonwebtoken + bcryptjs** — authentication
- **Zod** — request validation
- **express-rate-limit + helmet** — security
- **In-memory store** — simulated DB (swap for PostgreSQL/MongoDB)

---

## Project Structure

```
socialpilot/
├── package.json                    # Root scripts (concurrently)
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                # Express app entry, middleware setup
│       ├── models/
│       │   └── store.js            # In-memory DB (users, workspaces, content, schedules)
│       ├── middleware/
│       │   ├── auth.js             # JWT verify middleware + token generator
│       │   └── errorHandler.js     # Centralised error handler + createError helper
│       ├── services/
│       │   └── gemini.js           # All Gemini AI logic (text, stream, image, hashtags, campaign)
│       └── routes/
│           ├── auth.js             # POST /signup, /login, GET /me, PUT /profile
│           ├── workspace.js        # CRUD /workspaces
│           ├── content.js          # CRUD /content + approve
│           ├── ai.js               # POST /generate, /generate/stream, /generate/image, /regenerate
│           ├── schedule.js         # CRUD /schedule
│           └── export.js           # GET /export/workspace/:id/markdown|json, /content/:id/pdf-data
│
└── frontend/
    ├── package.json
    ├── vite.config.js              # Vite + proxy /api → backend
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx                # React root, QueryClient, Toaster
        ├── App.jsx                 # Router, protected/public routes
        ├── styles/
        │   └── globals.css         # Tailwind base + custom component classes
        ├── contexts/
        │   ├── authStore.js        # Zustand auth store (persisted)
        │   └── themeStore.js       # Zustand theme store (dark/light)
        ├── services/
        │   └── api.js              # Axios instance + all API call functions + SSE streaming
        ├── utils/
        │   └── constants.js        # Platform/tone/type configs, formatters, PDF generator, downloadFile
        └── components/
            ├── shared/
            │   └── LandingPage.jsx
            ├── auth/
            │   ├── LoginPage.jsx
            │   └── SignupPage.jsx
            ├── dashboard/
            │   ├── DashboardLayout.jsx   # Sidebar, top bar, dark mode toggle
            │   └── AnalyticsPage.jsx     # Recharts dashboard
            ├── workspace/
            │   ├── WorkspacesPage.jsx    # Grid of workspaces, create modal, stats
            │   └── WorkspaceDetail.jsx   # Edit workspace settings
            ├── content/
            │   ├── ContentGenerator.jsx  # Main AI generation UI (text + image tabs)
            │   └── ContentHistory.jsx    # Filterable content list, edit/approve/export
            └── scheduling/
                └── SchedulePage.jsx      # Calendar view + upcoming list + schedule modal
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone & Install

```bash
git clone <repo-url>
cd socialpilot

# Install root deps (concurrently)
npm install

# Install backend + frontend deps
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

`backend/.env`:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run Development Servers

```bash
# From project root — starts both backend and frontend
npm run dev

# Or run separately:
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:5173
```

### 4. Open the App

Navigate to **http://localhost:5173** and create an account.

> **Demo account**: Use the "Try with demo account" button on the login page (requires a demo account to exist — or just sign up).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key from AI Studio |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (min 32 chars in production) |
| `PORT` | ❌ | API server port (default: 3001) |
| `FRONTEND_URL` | ❌ | CORS origin (default: http://localhost:5173) |
| `NODE_ENV` | ❌ | `development` or `production` |

---

## API Reference

### Authentication
```
POST   /api/auth/signup          { name, email, password }
POST   /api/auth/login           { email, password }
GET    /api/auth/me              → current user
PUT    /api/auth/profile         { name }
```

### Workspaces
```
GET    /api/workspaces           → list user's workspaces
POST   /api/workspaces           { name, industry, brandVoice, targetAudience, ... }
GET    /api/workspaces/:id
PUT    /api/workspaces/:id
DELETE /api/workspaces/:id
```

### AI Generation
```
GET    /api/ai/config            → platforms, tones, content types, templates
POST   /api/ai/generate          { workspaceId, platform, tone, contentType, topic, ... }
POST   /api/ai/generate/stream   SSE stream of same params
POST   /api/ai/generate/image    { workspaceId, prompt, style, platform }
POST   /api/ai/regenerate/:id    regenerate existing content item
```

### Content Management
```
GET    /api/content/workspace/:id  ?platform=&status=&contentType=&search=
GET    /api/content/:id
PUT    /api/content/:id          { generatedContent, status, notes, tags }
DELETE /api/content/:id
POST   /api/content/:id/approve
```

### Scheduling
```
GET    /api/schedule/workspace/:id
POST   /api/schedule             { workspaceId, platform, content, scheduledAt, ... }
PUT    /api/schedule/:id
DELETE /api/schedule/:id
```

### Export
```
GET    /api/export/workspace/:id/markdown   → .md file download
GET    /api/export/workspace/:id/json       → .json file download
GET    /api/export/content/:id/pdf-data     → data for client-side PDF
```

---

## Architecture

```
Browser (React SPA)
    │
    ├── Zustand stores (auth token, theme)
    ├── TanStack Query (cache, mutations)
    └── Axios + SSE fetch
            │
            ▼
    Express API (Node.js)
            │
    ┌───────┴───────┐
    │               │
  Routes        Middleware
  auth.js       auth.js (JWT)
  workspace.js  errorHandler.js
  content.js    helmet, cors
  ai.js         rate-limit
  schedule.js
  export.js
    │
    ├── models/store.js   (In-memory DB — swap for Postgres/Mongo)
    └── services/gemini.js
                │
                ▼
        Google Gemini API
        ├── gemini-1.5-flash  (text, streaming)
        └── gemini-2.0-flash-preview-image-generation (images)
```

### Key Design Decisions

- **Service layer isolation**: All Gemini logic lives in `services/gemini.js`. Swapping AI providers only requires changes there.
- **Reusable prompt templates**: Platform/tone configs drive prompt construction — no hardcoded strings in route handlers.
- **SSE streaming**: The `/generate/stream` endpoint uses `model.generateContentStream()` and writes SSE chunks, enabling word-by-word UI updates.
- **In-memory store**: Provides the same interface as a real DB (`createUser`, `findUserByEmail`, etc.) — swap `store.js` for a Prisma/Mongoose adapter without changing routes.
- **Client-side PDF**: jsPDF runs in the browser, avoiding server-side PDF dependencies.
- **Centralized API layer**: All fetch logic in `services/api.js` with a single Axios instance — token injection and 401 handling in interceptors.

---

## Database Design

The in-memory store mirrors this relational schema (ready for PostgreSQL via Prisma):

```sql
users
  id UUID PK
  name TEXT
  email TEXT UNIQUE
  password TEXT (bcrypt)
  avatar TEXT
  createdAt TIMESTAMP

workspaces
  id UUID PK
  userId UUID FK → users
  name TEXT
  description TEXT
  industry TEXT
  brandVoice TEXT
  targetAudience TEXT
  website TEXT
  color TEXT
  contentCount INT
  createdAt / updatedAt TIMESTAMP

content_items
  id UUID PK
  workspaceId UUID FK → workspaces
  userId UUID FK → users
  platform ENUM
  tone ENUM
  contentType ENUM
  topic TEXT
  generatedContent TEXT
  imageData TEXT (base64)
  status ENUM (draft|approved|published|archived)
  notes TEXT
  tags TEXT[]
  createdAt / updatedAt TIMESTAMP

scheduled_posts
  id UUID PK
  workspaceId UUID FK → workspaces
  contentId UUID FK? → content_items
  platform ENUM
  content TEXT
  scheduledAt TIMESTAMP
  status ENUM (scheduled|published|cancelled)
  title TEXT
  createdAt TIMESTAMP

prompt_templates
  id UUID PK
  name TEXT
  platform TEXT
  tone TEXT
  promptPrefix TEXT
  category TEXT
```

---

## AI Integration

### Text Generation (`gemini-1.5-flash`)

Prompts are built dynamically by `buildContentPrompt()` using:
- Brand context (name, industry, voice, audience)
- Platform config (characteristics, format guidelines, max length)
- Tone descriptor
- Content type instruction
- User's topic/brief

### Streaming

Uses Gemini's `generateContentStream()` API. The backend streams SSE events (`data: {"chunk":"..."}`) and the frontend appends chunks to state in real time.

### Image Generation (`gemini-2.0-flash-preview-image-generation`)

Uses `responseModalities: ['IMAGE', 'TEXT']` to generate images from text prompts. Returns base64 inline data rendered as `<img src="data:...">`.

### Hashtag Generator

Prompts Gemini to return structured JSON with three tiers: branded, niche, and broad — plus a recommended mix.

### Campaign Generator

Returns a full JSON campaign object: name, tagline, theme, content pillars, weekly plan, hashtags, KPIs, and creative ideas.

---

## Deployment

### Swap the In-Memory DB for PostgreSQL

1. Add Prisma: `npm install prisma @prisma/client`
2. Define `schema.prisma` using the schema above
3. Replace `models/store.js` with a `models/prisma.js` adapter exposing the same method signatures

### Docker (optional)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY src ./src
EXPOSE 3001
CMD ["node", "src/index.js"]
```

### Environment for Production

```env
NODE_ENV=production
JWT_SECRET=<64-char random string>
GEMINI_API_KEY=<your key>
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://...   # when using Prisma
```

---

## License

MIT — use freely for personal or commercial projects.
