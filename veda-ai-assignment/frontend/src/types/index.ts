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

export interface AssignmentFormData {
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
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
  mcq: 'Multiple Choice (MCQ)',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
};

export const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12',
  'Undergraduate', 'Postgraduate',
];
