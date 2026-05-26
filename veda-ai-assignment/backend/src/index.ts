import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

import assignmentRoutes from './routes/assignments';
import { setSocketServer, startWorker } from './workers/generationWorker';
import { getRedis } from './services/cacheService';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? '*';
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/veda-ai';

// Log env on startup to help debug deploy issues
console.log('[Config] PORT:', PORT);
console.log('[Config] FRONTEND_URL:', FRONTEND_URL);
console.log('[Config] MONGODB_URI:', MONGODB_URI ? 'set' : 'MISSING');
console.log('[Config] REDIS_URL:', process.env.REDIS_URL ? 'set' : 'MISSING');
console.log('[Config] GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'set' : 'MISSING');

async function bootstrap(): Promise<void> {
  // ── Express app ──────────────────────────────────────────────
  const app = express();
  const httpServer = http.createServer(app);

  // ── CORS — allow any vercel.app subdomain + localhost ────────
  const allowedOrigins = [
    'http://localhost:3000',
    FRONTEND_URL,
  ].filter(Boolean);

  function corsOriginFn(
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    // Allow if it matches an allowed origin or any vercel.app deploy
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return cb(null, true);
    }
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  }

  const io = new SocketServer(httpServer, {
    cors: {
      origin: corsOriginFn,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
    // Allow client to subscribe to a specific assignment
    socket.on('subscribe:assignment', (assignmentId: string) => {
      void socket.join(`assignment:${assignmentId}`);
    });
  });

  // Share socket server with worker
  setSocketServer(io);

  // ── Middleware ───────────────────────────────────────────────
  app.use(cors({ origin: corsOriginFn, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Routes ───────────────────────────────────────────────────
  app.use('/api/assignments', assignmentRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── MongoDB ──────────────────────────────────────────────────
  await mongoose.connect(MONGODB_URI);
  console.log('[MongoDB] Connected to', MONGODB_URI);

  // ── Redis (warm up connection) ────────────────────────────────
  const redis = getRedis();
  await redis.connect().catch(() => { /* already connected or will lazy connect */ });

  // ── BullMQ Worker ─────────────────────────────────────────────
  startWorker();

  // ── Start server ─────────────────────────────────────────────
  httpServer.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] WebSocket ready`);
    console.log(`[Server] Accepting requests from ${FRONTEND_URL}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
