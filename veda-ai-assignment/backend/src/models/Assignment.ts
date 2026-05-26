import mongoose, { Schema, Document } from 'mongoose';
import { AssignmentInput, QuestionType } from '../types';

export interface IAssignment extends AssignmentInput, Document {
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
}

const QuestionTypeSchema = new Schema<QuestionType>({
  type: {
    type: String,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blank'],
    required: true,
  },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title:      { type: String, trim: true, default: 'Untitled Assignment' },
    subject:    { type: String, trim: true, default: '' },
    topic:      { type: String, trim: true, default: '' },
    gradeLevel: { type: String, trim: true, default: '' },
    dueDate:    { type: String, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    fileContent: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
