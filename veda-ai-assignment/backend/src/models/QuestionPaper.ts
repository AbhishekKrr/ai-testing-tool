import mongoose, { Schema, Document } from 'mongoose';
import { QuestionPaper, Section, Question } from '../types';

export interface IQuestionPaper extends Omit<QuestionPaper, 'id'>, Document {}

const QuestionSchema = new Schema<Question>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blank'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  marks: { type: Number, required: true },
  options: [{ type: String }],
  answer: { type: String },
});

const SectionSchema = new Schema<Section>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questionType: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  questions: [QuestionSchema],
});

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: String },
    sections: [SectionSchema],
    generatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

export const QuestionPaperModel = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
