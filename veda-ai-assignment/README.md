# VedaAI – AI Assessment Creator

A full-stack application that allows teachers to create structured question papers using AI. Built with Next.js 16, Express 5, MongoDB, Redis, BullMQ, and Claude AI.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Create Page  │  │ Results Page │  │   Zustand Store   │  │
│  │ (Form + UX)  │  │ (Live Paper) │  │  (Global State)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                   │              │
│         │         WebSocket (socket.io-client) │              │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │ REST API         │ WS Events          │
          ▼                 ▼                   │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express 5)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ REST Routes  │  │  Socket.IO   │  │   BullMQ Worker   │  │
│  │ /api/assign  │  │  (WS Server) │  │ (AI Generation)   │  │
│  └──────┬───────┘  └──────────────┘  └────────┬──────────┘  │
│         │                                     │              │
│  ┌──────▼────────────────────────────────────▼──────────┐   │
│  │ Services: MongoDB (data) · Redis (cache) · BullMQ (q) │  │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Claude AI (Sonnet)  │
│  Structured prompt  │
│  → JSON response    │
└─────────────────────┘
```

### Request Flow

1. Teacher fills the assignment form → submits
2. Frontend `POST /api/assignments` (with optional PDF/text)
3. Backend creates MongoDB document + enqueues BullMQ job
4. Returns `{ assignmentId, jobId }` → frontend navigates to `/results/:id`
5. **Worker** picks up the job:
   - Builds structured prompt from assignment data
   - Calls Claude Sonnet 4.6 API
   - Parses JSON response into typed `QuestionPaper` model
   - Saves to MongoDB
   - Emits `job:completed` via Socket.IO
6. Frontend receives WebSocket event → renders paper instantly
7. Redis caches the paper for subsequent fetches

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- MongoDB running locally (`mongodb://localhost:27017`)
- Redis running locally (`redis://localhost:6379`)
- Anthropic API key

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
veda-ai-assignment/
├── backend/
│   └── src/
│       ├── index.ts              # Express + Socket.IO bootstrap
│       ├── types/index.ts        # Shared TypeScript types
│       ├── models/
│       │   ├── Assignment.ts     # MongoDB Assignment schema
│       │   └── QuestionPaper.ts  # MongoDB QuestionPaper schema
│       ├── routes/
│       │   └── assignments.ts    # REST API endpoints
│       ├── queues/
│       │   └── generationQueue.ts # BullMQ queue setup
│       ├── workers/
│       │   └── generationWorker.ts # BullMQ worker (AI calls here)
│       └── services/
│           ├── aiService.ts      # Claude API + prompt engineering
│           └── cacheService.ts   # Redis helper
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx        # Root layout with nav
        │   ├── page.tsx          # Landing page
        │   ├── create/page.tsx   # Assignment creation form
        │   └── results/[id]/
        │       ├── page.tsx      # Server component (awaits params)
        │       └── ResultsClient.tsx # Client component (WS + polling)
        ├── components/
        │   ├── AssignmentForm.tsx    # Multi-section form
        │   ├── QuestionPaperView.tsx # Paper renderer + print
        │   └── ui/
        │       ├── Badge.tsx         # Difficulty badge
        │       └── ProgressBar.tsx   # Job progress bar
        ├── hooks/
        │   └── useWebSocket.ts   # Socket.IO client hook
        ├── store/
        │   └── useAssignmentStore.ts # Zustand global store
        └── types/index.ts        # Frontend types
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| Real-time | Socket.IO (client + server) |
| Backend | Express 5, TypeScript |
| Database | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| Queue | BullMQ |
| AI | Anthropic Claude claude-sonnet-4-6 |

---

## 🤖 AI Approach

### Prompt Engineering

The prompt is fully structured — it tells Claude:
- Subject, topic, grade level, instructions
- Exactly how many questions per section and at what marks
- Required output schema (JSON only, no markdown)
- Constraints: MCQ must have 4 options, difficulty must vary, etc.

### Response Parsing

The response is:
1. Extracted with a regex to strip any accidental markdown wrapping
2. Parsed as JSON
3. Mapped through `parsePaper()` which:
   - Assigns UUIDs to every question and section
   - Validates and defaults missing fields
   - Returns a strongly-typed `QuestionPaper` object

The UI **never renders raw LLM text** — only the parsed structure.

---

## ✨ Features

- **Multi-type question support**: MCQ, short answer, long answer, true/false, fill-in-blank
- **Real-time progress**: WebSocket updates as AI generates
- **Structured paper view**: Sections, difficulty badges, marks
- **Student info fields**: Name, roll number, section
- **PDF export**: Browser print with optimized print styles
- **Redis caching**: Papers cached for fast re-fetching
- **File upload**: Optional PDF/text reference material
- **Form validation**: Client + server side

---

## 🔑 Environment Variables

### Backend (`.env`)
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/veda-ai
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```
