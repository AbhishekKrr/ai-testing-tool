'use client';

import React, { useRef, useState } from 'react';
import { QuestionPaper, Question, Section, Difficulty } from '@/types';
import { Badge } from './ui/Badge';

interface QuestionPaperViewProps {
  paper: QuestionPaper;
  onRegenerate?: () => void;
}

export default function QuestionPaperView({ paper, onRegenerate }: QuestionPaperViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  function handlePrint() {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  }

  return (
    <div className="space-y-4">
      {/* ── Action bar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <h2 className="text-lg font-semibold text-slate-800">Generated Question Paper</h2>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
              </svg>
              Regenerate
            </button>
          )}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1Zm2 0h6v3H7V4Zm-1 9v-1h8v1H6Zm2-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* ── The actual paper ───────────────────────────── */}
      <div
        ref={printRef}
        id="question-paper"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Paper header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-8 print:bg-none print:text-black print:border-b-2 print:border-black">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{paper.title}</h1>
            <p className="text-indigo-200 print:text-gray-600">
              {paper.subject} &bull; {paper.gradeLevel}
            </p>
            <div className="flex items-center justify-center gap-6 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 opacity-80">
                  <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                </svg>
                Total Marks: <strong>{paper.totalMarks}</strong>
              </span>
              {paper.duration && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 opacity-80">
                    <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
                  </svg>
                  Time: <strong>{paper.duration}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StudentField
              label="Student Name"
              value={studentName}
              onChange={setStudentName}
            />
            <StudentField
              label="Roll Number"
              value={rollNumber}
              onChange={setRollNumber}
            />
            <StudentField
              label="Section"
              value={section}
              onChange={setSection}
            />
          </div>
        </div>

        {/* General instructions */}
        <div className="px-8 py-4 bg-amber-50 border-b border-amber-100">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">General Instructions</p>
          <ul className="text-sm text-amber-900 space-y-0.5 list-disc list-inside">
            <li>All questions are compulsory unless stated otherwise.</li>
            <li>Write legibly and clearly. Marks will be deducted for illegible answers.</li>
            <li>Use of electronic devices is strictly prohibited.</li>
          </ul>
        </div>

        {/* Sections */}
        <div className="p-8 space-y-10 print:p-4">
          {paper.sections.map((s, i) => (
            <SectionView key={s.id} section={s} sectionIndex={i} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          Generated by VedaAI &bull; {new Date(paper.generatedAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
}

// ── Student field ───────────────────────────────────────────────────────────

function StudentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full border-b-2 border-slate-300 focus:border-indigo-500 bg-transparent px-1 py-1 text-sm outline-none transition print:border-b print:border-black"
        />
      </div>
    </div>
  );
}

// ── Section view ────────────────────────────────────────────────────────────

function SectionView({
  section,
  sectionIndex,
}: {
  section: Section;
  sectionIndex: number;
}) {
  const sectionLabel = String.fromCharCode(65 + sectionIndex); // A, B, C…

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-start justify-between pb-3 border-b-2 border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Section {sectionLabel} — {section.title.replace(/^Section [A-Z] ?[–-]? ?/i, '')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{section.instruction}</p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg whitespace-nowrap ml-4">
          {section.totalMarks} marks
        </span>
      </div>

      {/* Questions */}
      <ol className="space-y-5">
        {section.questions.map((q, qi) => (
          <QuestionView
            key={q.id}
            question={q}
            questionNumber={qi + 1}
          />
        ))}
      </ol>
    </div>
  );
}

// ── Question view ───────────────────────────────────────────────────────────

function QuestionView({
  question,
  questionNumber,
}: {
  question: Question;
  questionNumber: number;
}) {
  const difficultyLabel = {
    easy: 'Easy',
    medium: 'Moderate',
    hard: 'Hard',
  }[question.difficulty] ?? question.difficulty;

  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {questionNumber}
      </span>
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-800 leading-relaxed flex-1">{question.text}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant={question.difficulty as Difficulty}>
              {difficultyLabel}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>
        </div>

        {/* MCQ options */}
        {question.type === 'mcq' && question.options && question.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
            {question.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer group">
                <span className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 flex-shrink-0 transition" />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.type === 'true_false' && (
          <div className="flex gap-4 pl-1">
            {['True', 'False'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <span className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 flex-shrink-0 transition" />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short / long answer lines */}
        {(question.type === 'short_answer' || question.type === 'long_answer') && (
          <div className="space-y-2 pl-1">
            {Array.from({ length: question.type === 'short_answer' ? 3 : 6 }).map((_, i) => (
              <div key={i} className="border-b border-slate-300 h-6" />
            ))}
          </div>
        )}

        {/* Fill blank — just empty line */}
        {question.type === 'fill_blank' && (
          <div className="pl-1">
            <div className="border-b border-slate-300 h-6 w-48" />
          </div>
        )}
      </div>
    </li>
  );
}
