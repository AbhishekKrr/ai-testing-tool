export type QuestionTypeName =
  | 'mcq'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_blank';

export interface QuestionTypeConfig {
  type: QuestionTypeName;
  count: number;
  marks: number;
}

// Only fields actually shown in the create form (matching Figma)
export interface AssignmentFormData {
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  file: File | null;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  type: QuestionTypeName;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questionType: QuestionTypeName;
  totalMarks: number;
  questions: Question[];
}

export interface QuestionPaper {
  id: string;
  assignmentId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  totalMarks: number;
  duration?: string;
  sections: Section[];
  generatedAt: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobProgress {
  jobId: string;
  assignmentId: string;
  status: JobStatus;
  progress?: number;
  result?: QuestionPaper;
  paperId?: string;
  error?: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionTypeName, string> = {
  mcq:          'Multiple Choice Questions',
  short_answer: 'Short Questions',
  long_answer:  'Long Answer Questions',
  true_false:   'True or False',
  fill_blank:   'Fill in the Blanks',
};
