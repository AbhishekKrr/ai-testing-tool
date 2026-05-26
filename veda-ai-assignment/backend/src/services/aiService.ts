import Anthropic from '@anthropic-ai/sdk';
import { AssignmentInput, QuestionPaper, Section, Question, QuestionType } from '../types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { v4: uuidv4 } = require('uuid') as { v4: () => string };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TYPE_LABELS: Record<QuestionType['type'], string> = {
  mcq:          'Multiple Choice Questions',
  short_answer: 'Short Answer Questions',
  long_answer:  'Long Answer Questions',
  true_false:   'True/False Questions',
  fill_blank:   'Fill in the Blank Questions',
};

const SECTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const TYPE_INSTRUCTIONS: Record<QuestionType['type'], string> = {
  mcq:          'Attempt all questions. Choose the best answer from the options given.',
  short_answer: 'Attempt all questions. Answer in 2–3 sentences.',
  long_answer:  'Attempt all questions. Answer in detail with examples.',
  true_false:   'State whether the following statements are True or False.',
  fill_blank:   'Fill in the blanks with the most appropriate word or phrase.',
};

function buildPrompt(input: AssignmentInput): string {
  const sections = input.questionTypes.map((qt, i) =>
    `Section ${SECTION_LABELS[i]} – ${TYPE_LABELS[qt.type]}: ${qt.count} question${qt.count > 1 ? 's' : ''}, ${qt.marks} mark${qt.marks > 1 ? 's' : ''} each`
  );

  // Build context from whatever is available
  const contextLines: string[] = [];
  if (input.subject)    contextLines.push(`Subject: ${input.subject}`);
  if (input.topic)      contextLines.push(`Topic/Chapter: ${input.topic}`);
  if (input.gradeLevel) contextLines.push(`Grade/Class: ${input.gradeLevel}`);
  if (input.additionalInstructions) contextLines.push(`Teacher's Instructions: ${input.additionalInstructions}`);
  if (input.fileContent) contextLines.push(`Reference Material (extract):\n${input.fileContent.slice(0, 3000)}`);

  const contextStr = contextLines.length > 0
    ? contextLines.join('\n')
    : 'Create a comprehensive and educationally appropriate question paper. Determine a suitable subject and grade level.';

  return `You are an expert educator creating a formal examination question paper for Indian school students (CBSE/ICSE/State Board).

Context provided by the teacher:
${contextStr}

Total Marks: ${input.totalMarks}

Generate the following sections:
${sections.join('\n')}

CRITICAL: Return ONLY valid JSON — no markdown, no explanation, no code blocks.
The JSON must strictly follow this schema:

{
  "title": "string — descriptive title, e.g. 'Quiz on Electricity – Grade 8 Science'",
  "subject": "string — infer from context if not stated, e.g. 'Science', 'Mathematics'",
  "gradeLevel": "string — infer from context if not stated, e.g. 'Grade 8', 'Class 10'",
  "totalMarks": number,
  "duration": "string — e.g. '45 minutes', '1 hour', '3 hours'",
  "sections": [
    {
      "title": "Section A",
      "instruction": "string",
      "questionType": "mcq|short_answer|long_answer|true_false|fill_blank",
      "totalMarks": number,
      "questions": [
        {
          "text": "string — the full question text",
          "difficulty": "easy|medium|hard",
          "marks": number,
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "answer": "string — correct/model answer (required for every question)"
        }
      ]
    }
  ]
}

Rules (strictly enforce):
1. Every single question MUST have an "answer" field with the correct answer
2. Vary difficulty: mix easy / medium / hard across questions
3. MCQ: exactly 4 options labeled A, B, C, D; "answer" must be the letter only (e.g. "A")
4. True/False: "answer" must be exactly "True" or "False"
5. Fill-in-blank: use underscores (___) in the question text for the blank
6. Each question's marks must match the section's specified marks per question
7. Questions must be factually accurate and educationally appropriate
8. Do NOT wrap JSON in markdown code fences
9. Return ONLY the JSON object, nothing else`;
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

  // Strip any accidental markdown wrapping
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
