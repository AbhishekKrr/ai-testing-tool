'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { JobProgress, QuestionPaper } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function useWebSocket() {
  const { setJobStatus, setQuestionPaper, currentAssignmentId } = useAssignmentStore();
  const subscribedRef = useRef<string | null>(null);

  const handleProgress = useCallback(
    (data: JobProgress) => {
      if (data.assignmentId !== currentAssignmentId) return;
      setJobStatus(data.status, data.progress);
    },
    [currentAssignmentId, setJobStatus]
  );

  const handleCompleted = useCallback(
    (data: JobProgress) => {
      if (data.assignmentId !== currentAssignmentId) return;
      setJobStatus('completed', 100);
      if (data.result) {
        setQuestionPaper(data.result as QuestionPaper);
      }
    },
    [currentAssignmentId, setJobStatus, setQuestionPaper]
  );

  const handleFailed = useCallback(
    (data: JobProgress) => {
      if (data.assignmentId !== currentAssignmentId) return;
      setJobStatus('failed', 0);
    },
    [currentAssignmentId, setJobStatus]
  );

  useEffect(() => {
    const s = getSocket();

    s.on('job:progress', handleProgress);
    s.on('job:completed', handleCompleted);
    s.on('job:failed', handleFailed);

    // Subscribe to assignment room
    if (currentAssignmentId && subscribedRef.current !== currentAssignmentId) {
      s.emit('subscribe:assignment', currentAssignmentId);
      subscribedRef.current = currentAssignmentId;
    }

    return () => {
      s.off('job:progress', handleProgress);
      s.off('job:completed', handleCompleted);
      s.off('job:failed', handleFailed);
    };
  }, [currentAssignmentId, handleProgress, handleCompleted, handleFailed]);

  return { socket: getSocket() };
}
