import Anthropic from '@anthropic-ai/sdk';
import { AssignmentInput, QuestionPaper, Section, Question, QuestionType } from '../types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { v4: uuidv4 } = require('uuid') as { v4: () => string };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TYPE_LABELS: Record<QuestionType['type'], string> = {
  mcq: 'Multiple Choice Questions',
  short_answer: 'Short Answer Questions',
  long_answer: 'Long Answer Questions',
  true_false: 'True/False Questions',
  fill_blank: 'Fill in the Blank Questions',
};

const SECTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const TYPE_INSTRUCTIONS: Record<QuestionType['type'], string> = {
  mcq: 'Attempt all questions. Choose the best answer.',
  short_answer: 'Attempt all questions. Answer in 2-3 sentences.',
  long_answer: 'Attempt all questions. Answer in detail.',
  true_false: 'State whether the following statements are True or False.',
  fill_blank: 'Fill in the blanks with appropriate words.',
};

function buildPrompt(input: AssignmentInput): string {
  const sections = input.questionTypes.map((qt, i) => {
    return `Section ${SECTION_LABELS[i]} – ${TYPE_LABELS[qt.type]}: ${qt.count} questions, ${qt.marks} marks each`;
  });

  return `You are an expert educator creating a formal examination question paper.

Assignment Details:
- Title: ${input.title}
- Subject: ${input.subject}
- Topic: ${input.topic}
- Grade Level: ${input.gradeLevel}
- Total Marks: ${input.totalMarks}
${input.additionalInstructions ? `- Special Instructions: ${input.additionalInstructions}` : ''}
${input.fileContent ? `- Reference Material:\n${input.fileContent.slice(0, 3000)}` : ''}

Generate the following sections:
${sections.join('\n')}

CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code blocks.
The JSON must strictly follow this schema:

{
  "title": "string (exam paper title)",
  "subject": "string",
  "gradeLevel": "string",
  "totalMarks": number,
  "duration": "string (e.g., '2 hours')",
  "sections": [
    {
      "title": "Section A",
      "instruction": "string",
      "questionType": "mcq|short_answer|long_answer|true_false|fill_blank",
      "totalMarks": number,
      "questions": [
        {
          "text": "string (the full question text)",
          "difficulty": "easy|medium|hard",
          "marks": number,
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],  // only for mcq
          "answer": "string (model answer, optional)"
        }
      ]
    }
  ]
}

Rules:
1. Questions must be relevant to the topic: "${input.topic}"
2. Vary difficulty (mix of easy/medium/hard) realistically
3. MCQ must have exactly 4 options labeled A, B, C, D
4. True/False questions should have "answer" as "True" or "False"
5. Fill-in-blank questions should use underscores (___) in text
6. Marks per question must match the specified marks
7. Do NOT include section labels in question text
8. Return ONLY the JSON object`;
}

interface RawQuestion {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  answer?: string;
}

interface RawSection {
  title: string;
  instruction: string;
  questionType: QuestionType['type'];
  totalMarks: number;
  questions: RawQuestion[];
}

interface RawPaper {
  title: string;
  subject: string;
  gradeLevel: string;
  totalMarks: number;
  duration?: string;
  sections: RawSection[];
}

function parsePaper(raw: RawPaper, assignmentId: string): QuestionPaper {
  const sections: Section[] = raw.sections.map((rawSection, sIdx) => {
    const questions: Question[] = rawSection.questions.map((q) => ({
      id: uuidv4(),
      text: q.text,
      type: rawSection.questionType,
      difficulty: q.difficulty ?? 'medium',
      marks: q.marks,
      options: q.options,
      answer: q.answer,
    }));

    return {
      id: uuidv4(),
      title: rawSection.title ?? `Section ${SECTION_LABELS[sIdx]}`,
      instruction: rawSection.instruction ?? TYPE_INSTRUCTIONS[rawSection.questionType],
      questionType: rawSection.questionType,
      totalMarks: rawSection.totalMarks,
      questions,
    };
  });

  return {
    id: uuidv4(),
    assignmentId,
    title: raw.title,
    subject: raw.subject,
    gradeLevel: raw.gradeLevel,
    totalMarks: raw.totalMarks,
    duration: raw.duration,
    sections,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateQuestionPaper(
  input: AssignmentInput,
  assignmentId: string
): Promise<QuestionPaper> {
  const prompt = buildPrompt(input);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  // Extract JSON from the response (strip any accidental markdown wrapping)
  let jsonText = content.text.trim();
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  let rawPaper: RawPaper;
  try {
    rawPaper = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse AI response as JSON: ${err}`);
  }

  return parsePaper(rawPaper, assignmentId);
}
