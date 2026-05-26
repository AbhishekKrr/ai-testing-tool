import { Worker, Job } from 'bullmq';
import { getRedis, setJobStatus } from '../services/cacheService';
import { generateQuestionPaper } from '../services/aiService';
import { Assignment } from '../models/Assignment';
import { QuestionPaperModel } from '../models/QuestionPaper';
import { GENERATION_QUEUE, GenerationJobData } from '../queues/generationQueue';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export function setSocketServer(socketServer: SocketServer): void {
  io = socketServer;
}

function emit(event: string, data: unknown): void {
  if (io) {
    io.emit(event, data);
  }
}

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;
  const jobId = job.id ?? 'unknown';

  console.log(`[Worker] Processing job ${jobId} for assignment ${assignmentId}`);

  // Update status: processing
  await Promise.all([
    Assignment.findByIdAndUpdate(assignmentId, { status: 'processing', jobId }),
    setJobStatus(jobId, { jobId, assignmentId, status: 'processing', progress: 10 }),
  ]);

  emit('job:progress', { jobId, assignmentId, status: 'processing', progress: 10 });

  // Fetch assignment from DB
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  emit('job:progress', { jobId, assignmentId, status: 'processing', progress: 30 });
  await job.updateProgress(30);

  // Generate question paper via AI
  const questionPaper = await generateQuestionPaper(
    {
      title:                   assignment.title,
      subject:                 assignment.subject,
      topic:                   assignment.topic,
      gradeLevel:              assignment.gradeLevel,
      dueDate:                 assignment.dueDate,
      questionTypes:           assignment.questionTypes,
      totalMarks:              assignment.totalMarks,
      additionalInstructions:  assignment.additionalInstructions,
      fileContent:             assignment.fileContent,
    },
    assignmentId
  );

  emit('job:progress', { jobId, assignmentId, status: 'processing', progress: 80 });
  await job.updateProgress(80);

  // Store question paper
  const saved = await QuestionPaperModel.create(questionPaper);

  // Back-fill assignment with AI-determined title / subject / gradeLevel
  await Assignment.findByIdAndUpdate(assignmentId, {
    status:     'completed',
    title:      questionPaper.title      || assignment.title,
    subject:    questionPaper.subject    || assignment.subject,
    gradeLevel: questionPaper.gradeLevel || assignment.gradeLevel,
  });

  // Update job status in cache
  await setJobStatus(jobId, {
    jobId,
    assignmentId,
    status: 'completed',
    progress: 100,
    result: questionPaper,
  });

  emit('job:completed', {
    jobId,
    assignmentId,
    status: 'completed',
    progress: 100,
    paperId: saved._id,
    result: questionPaper,
  });

  console.log(`[Worker] Job ${jobId} completed. Paper ID: ${saved._id}`);
}

export function startWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    processJob,
    {
      connection: getRedis(),
      concurrency: 2,
    }
  );

  worker.on('failed', async (job, err) => {
    const jobId = job?.id ?? 'unknown';
    const assignmentId = job?.data.assignmentId ?? 'unknown';
    console.error(`[Worker] Job ${jobId} failed:`, err.message);

    if (assignmentId !== 'unknown') {
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' }).catch(() => null);
    }

    await setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'failed',
      error: err.message,
    }).catch(() => null);

    emit('job:failed', { jobId, assignmentId, status: 'failed', error: err.message });
  });

  worker.on('error', (err) => {
    console.error('[Worker] Error:', err.message);
  });

  console.log('[Worker] Started, listening for jobs...');
  return worker;
}
