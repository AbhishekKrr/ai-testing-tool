'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ProgressBar } from '@/components/ui/ProgressBar';
import QuestionPaperView from '@/components/QuestionPaperView';
import { QuestionPaper } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

const STATUS_MESSAGES: Record<string, string> = {
  queued: 'Your request is in the queue…',
  processing: 'AI is generating your question paper…',
  completed: 'Question paper ready!',
  failed: 'Generation failed. Please try again.',
};

export default function ResultsClient({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const {
    jobStatus,
    jobProgress,
    questionPaper,
    currentAssignmentId,
    setJobInfo,
    setJobStatus,
    setQuestionPaper,
    resetJob,
  } = useAssignmentStore();

  // Start WebSocket listener
  useWebSocket();

  // Restore job info if navigated directly (e.g., page refresh)
  useEffect(() => {
    if (currentAssignmentId !== assignmentId) {
      setJobInfo(`gen-${assignmentId}`, assignmentId);
    }
  }, [assignmentId, currentAssignmentId, setJobInfo]);

  // Poll for results if WebSocket hasn't delivered
  const fetchPaper = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assignments/${assignmentId}/paper`);
      if (res.ok) {
        const data = await res.json() as { paper: QuestionPaper };
        setQuestionPaper(data.paper);
        setJobStatus('completed', 100);
      }
    } catch {
      // Silently fail; WebSocket will deliver
    }
  }, [assignmentId, setQuestionPaper, setJobStatus]);

  // If status is processing/queued and no paper, poll every 5s
  useEffect(() => {
    if (jobStatus === 'completed' || jobStatus === 'failed') return;

    const interval = setInterval(() => {
      void fetchPaper();
    }, 5000);

    return () => clearInterval(interval);
  }, [jobStatus, fetchPaper]);

  // Also try immediately when component mounts
  useEffect(() => {
    void fetchPaper();
  }, [fetchPaper]);

  function handleRegenerate() {
    resetJob();
    router.push('/create');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Status display */}
      {jobStatus !== 'completed' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            {/* Animated icon */}
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
              {jobStatus === 'failed' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-rose-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-500 animate-pulse">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5Z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {STATUS_MESSAGES[jobStatus ?? 'queued']}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {jobStatus === 'failed'
                  ? 'Something went wrong during generation.'
                  : 'This usually takes 15–30 seconds.'}
              </p>
            </div>

            {jobStatus !== 'failed' && (
              <ProgressBar
                progress={jobProgress}
                label="Generating question paper…"
              />
            )}

            {jobStatus === 'failed' && (
              <button
                onClick={handleRegenerate}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question paper */}
      {questionPaper && (
        <QuestionPaperView
          paper={questionPaper}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
