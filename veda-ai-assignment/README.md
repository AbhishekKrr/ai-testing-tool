# VedaAI – Assignment Creator

Built this for teachers to generate question papers without spending hours writing questions manually. You fill in what you want (subject, question types, marks), it calls an AI in the background and spits out a properly formatted paper ready to print.

## What it does

Teachers can create assignments by specifying question types (MCQ, short answer, long answer, true/false, fill in the blanks), how many questions per type, and marks. The AI generates a full question paper with sections, difficulty tags, and an answer key. The paper can be downloaded as a PDF directly from the browser.

Real-time progress updates via WebSocket so you're not just staring at a blank screen while it generates.

## Tech

- **Frontend** — Next.js, TypeScript, Tailwind, Zustand
- **Backend** — Express, Socket.IO, BullMQ (job queue)
- **DB** — MongoDB
- **Cache / Queue** — Redis
- **AI** — Groq (llama-3.3-70b)

## Running locally

You'll need Node 20+, and either Docker or cloud instances of MongoDB and Redis.

**Backend**

```bash
cd backend
cp .env.example .env
# fill in your keys
npm install
npm run dev
```

**Frontend**

```bash
cd frontend
cp .env.example .env.local
# set NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
npm install
npm run dev
```

Open `http://localhost:3000`

## Environment variables

Backend `.env`:
```
PORT=4000
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
GROQ_API_KEY=your_groq_key
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## How the generation works

When you submit the form, the backend creates an assignment record and pushes a job to a BullMQ queue. A worker picks it up, builds a prompt with all the constraints (question counts, marks, types), sends it to the Groq API, parses the JSON response, and saves the result to MongoDB. The frontend gets notified via WebSocket when it's done.

The AI is told to return strict JSON — sections, questions, options, answers, difficulty levels. The parser assigns IDs and fills in any missing defaults before it hits the UI.

## Known limitations

- PDF file upload is accepted but text extraction isn't implemented yet — only `.txt` files are actually read and passed to the AI as context
- The free Render tier spins down after inactivity so the first request after a while will be slow
