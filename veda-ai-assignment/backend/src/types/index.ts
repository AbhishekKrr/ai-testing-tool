export interface QuestionType {
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blank';
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string; // extracted text from uploaded PDF/txt
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType['type'];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[]; // for MCQ
  answer?: string;    // optional model answer
}

export interface Section {
  id: string;
  title: string;         // e.g. "Section A"
  instruction: string;   // e.g. "Attempt all questions"
  questionType: QuestionType['type'];
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

export interface JobStatus {
  jobId: string;
  assignmentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: QuestionPaper;
  error?: string;
}
