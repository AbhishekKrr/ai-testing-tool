import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Assignment } from '../models/Assignment';
import { QuestionPaperModel } from '../models/QuestionPaper';
import { getGenerationQueue } from '../queues/generationQueue';
import { getJobStatus, cacheGet } from '../services/cacheService';
import { AssignmentInput, QuestionType } from '../types';

const router = Router();

// Multer: in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/octet-stream'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are supported'));
    }
  },
});

// POST /api/assignments — create assignment and queue generation job
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  const body = req.body as AssignmentInput & { questionTypes: string | QuestionType[] };

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

  // Validation
  if (!body.title?.trim()) { res.status(400).json({ error: 'Title is required' }); return; }
  if (!body.subject?.trim()) { res.status(400).json({ error: 'Subject is required' }); return; }
  if (!body.topic?.trim()) { res.status(400).json({ error: 'Topic is required' }); return; }
  if (!body.gradeLevel?.trim()) { res.status(400).json({ error: 'Grade level is required' }); return; }
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
    fileContent = req.file.buffer.toString('utf-8').slice(0, 5000);
  }

  // Compute total marks
  const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  // Create assignment
  const assignment = await Assignment.create({
    title: body.title.trim(),
    subject: body.subject.trim(),
    topic: body.topic.trim(),
    gradeLevel: body.gradeLevel.trim(),
    dueDate: body.dueDate,
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
