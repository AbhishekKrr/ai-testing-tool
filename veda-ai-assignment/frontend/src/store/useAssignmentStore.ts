'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AssignmentFormData,
  QuestionPaper,
  JobStatus,
  QuestionTypeConfig,
} from '@/types';

interface AssignmentState {
  formData: AssignmentFormData;
  isSubmitting: boolean;
  submitError: string | null;
  currentJobId: string | null;
  currentAssignmentId: string | null;
  jobStatus: JobStatus | null;
  jobProgress: number;
  questionPaper: QuestionPaper | null;

  updateFormField: <K extends keyof AssignmentFormData>(
    key: K,
    value: AssignmentFormData[K]
  ) => void;
  addQuestionType: (qt: QuestionTypeConfig) => void;
  updateQuestionType: (index: number, qt: QuestionTypeConfig) => void;
  removeQuestionType: (index: number) => void;
  resetForm: () => void;
  setSubmitting: (v: boolean) => void;
  setSubmitError: (err: string | null) => void;
  setJobInfo: (jobId: string, assignmentId: string) => void;
  setJobStatus: (status: JobStatus, progress?: number) => void;
  setQuestionPaper: (paper: QuestionPaper) => void;
  resetJob: () => void;
}

const DEFAULT_FORM: AssignmentFormData = {
  dueDate: '',
  questionTypes: [{ type: 'mcq', count: 5, marks: 2 }],
  additionalInstructions: '',
  file: null,
};

export const useAssignmentStore = create<AssignmentState>()(
  devtools(
    (set) => ({
      formData: { ...DEFAULT_FORM },
      isSubmitting: false,
      submitError: null,
      currentJobId: null,
      currentAssignmentId: null,
      jobStatus: null,
      jobProgress: 0,
      questionPaper: null,

      updateFormField: (key, value) =>
        set((state) => ({
          formData: { ...state.formData, [key]: value },
        })),

      addQuestionType: (qt) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: [...state.formData.questionTypes, qt],
          },
        })),

      updateQuestionType: (index, qt) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.map((q, i) =>
              i === index ? qt : q
            ),
          },
        })),

      removeQuestionType: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.filter((_, i) => i !== index),
          },
        })),

      resetForm: () => set({ formData: { ...DEFAULT_FORM } }),

      setSubmitting: (v) => set({ isSubmitting: v }),
      setSubmitError: (err) => set({ submitError: err }),

      setJobInfo: (jobId, assignmentId) =>
        set({
          currentJobId: jobId,
          currentAssignmentId: assignmentId,
          jobStatus: 'queued',
          jobProgress: 0,
        }),

      setJobStatus: (status, progress) =>
        set({ jobStatus: status, jobProgress: progress ?? 0 }),

      setQuestionPaper: (paper) => set({ questionPaper: paper }),

      resetJob: () =>
        set({
          currentJobId: null,
          currentAssignmentId: null,
          jobStatus: null,
          jobProgress: 0,
          questionPaper: null,
          submitError: null,
        }),
    }),
    { name: 'AssignmentStore' }
  )
);
