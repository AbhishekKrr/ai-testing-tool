import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Assignment } from '../models/Assignment';
import { QuestionPaperModel } from '../models/QuestionPaper';
import { getGenerationQueue } from '../queues/generationQueue';
import { getJobStatus, cacheGet } from '../services/cacheService';
import { QuestionType } from '../types';

const router = Router();

// Multer: in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/octet-stream' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, text, and image files are supported'));
    }
  },
});

interface AssignmentBody {
  title?: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  dueDate: string;
  questionTypes: string | QuestionType[];
  additionalInstructions?: string;
}

// POST /api/assignments — create assignment and queue generation job
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  const body = req.body as AssignmentBody;

  // Parse questionTypes if sent as a JSON string (multipart/form-data)
  let questionTypes: QuestionType[];
  if (typeof body.questionTypes === 'string') {
    try {
      questionTypes = JSON.parse(body.questionTypes) as QuestionType[];
    } catch {
      res.status(400).json({ error: 'Invalid questionTypes format' });
      return;
    }
  } else {
    questionTypes = body.questionTypes ?? [];
  }

  // Validation — only hard requirements
  if (!body.dueDate) { res.status(400).json({ error: 'Due date is required' }); return; }
  if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
    res.status(400).json({ error: 'At least one question type is required' });
    return;
  }

  for (const qt of questionTypes) {
    if (!qt.type) { res.status(400).json({ error: 'Question type is required' }); return; }
    if (!qt.count || qt.count < 1) { res.status(400).json({ error: 'Question count must be at least 1' }); return; }
    if (!qt.marks || qt.marks < 1) { res.status(400).json({ error: 'Marks must be at least 1' }); return; }
  }

  // Extract text from uploaded file
  let fileContent: string | undefined;
  if (req.file) {
    // Only extract text from text/PDF files; skip binary (images)
    if (
      req.file.mimetype === 'text/plain' ||
      req.file.mimetype === 'application/pdf' ||
      req.file.mimetype === 'application/octet-stream'
    ) {
      fileContent = req.file.buffer.toString('utf-8').slice(0, 5000);
    }
  }

  // Compute total marks
  const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  // Create assignment — title/subject/topic/gradeLevel are optional and will be
  // updated by the worker after AI generation completes
  const assignment = await Assignment.create({
    title:      body.title?.trim() || 'Generating…',
    subject:    body.subject?.trim() || '',
    topic:      body.topic?.trim() || '',
    gradeLevel: body.gradeLevel?.trim() || '',
    dueDate:    body.dueDate,
    questionTypes,
    totalMarks,
    additionalInstructions: body.additionalInstructions?.trim(),
    fileContent,
    status: 'pending',
  });

  // Enqueue generation job
  const queue = getGenerationQueue();
  const job = await queue.add(
    'generate',
    { assignmentId: assignment._id.toString() },
    { jobId: `gen-${assignment._id}` }
  );

  // Update assignment with jobId
  await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

  res.status(201).json({
    assignmentId: assignment._id,
    jobId: job.id,
    status: 'queued',
    message: 'Assignment created and generation queued',
  });
});

// GET /api/assignments — list all assignments
router.get('/', async (_req: Request, res: Response) => {
  const assignments = await Assignment.find()
    .sort({ createdAt: -1 })
    .select('-fileContent')
    .limit(50);
  res.json(assignments);
});

// GET /api/assignments/:id — get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id).select('-fileContent');
  if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return; }
  res.json(assignment);
});

// GET /api/assignments/:id/paper — get the generated question paper
router.get('/:id/paper', async (req: Request, res: Response) => {
  // Try cache first
  const cached = await cacheGet<unknown>(`paper:${req.params.id}`);
  if (cached) {
    res.json({ source: 'cache', paper: cached });
    return;
  }

  const paper = await QuestionPaperModel.findOne({ assignmentId: req.params.id });
  if (!paper) { res.status(404).json({ error: 'Question paper not found' }); return; }

  res.json({ source: 'db', paper });
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  await Assignment.findByIdAndDelete(req.params.id);
  await QuestionPaperModel.deleteOne({ assignmentId: req.params.id });
  res.json({ success: true });
});

// GET /api/assignments/job/:jobId/status — poll job status from Redis
router.get('/job/:jobId/status', async (req: Request, res: Response) => {
  const jobId = String(req.params['jobId'] ?? '');
  const status = await getJobStatus(jobId);
  if (!status) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(status);
});

export default router;
