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

  // ── Socket.IO ────────────────────────────────────────────────
  const corsOrigin = FRONTEND_URL === '*' ? '*' : FRONTEND_URL;

  const io = new SocketServer(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
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
  app.use(cors({ origin: corsOrigin }));
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
