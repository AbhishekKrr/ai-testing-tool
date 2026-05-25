'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { QuestionPaper, Question, Section } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export default function ResultsClient({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const { jobStatus, jobProgress, questionPaper, currentAssignmentId, setJobInfo, setJobStatus, setQuestionPaper, resetJob } = useAssignmentStore();
  useWebSocket();

  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentSection, setStudentSection] = useState('');

  useEffect(() => {
    if (currentAssignmentId !== assignmentId) setJobInfo(`gen-${assignmentId}`, assignmentId);
  }, [assignmentId, currentAssignmentId, setJobInfo]);

  const fetchPaper = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assignments/${assignmentId}/paper`);
      if (res.ok) {
        const data = await res.json() as { paper: QuestionPaper };
        setQuestionPaper(data.paper);
        setJobStatus('completed', 100);
      }
    } catch { /* silent */ }
  }, [assignmentId, setQuestionPaper, setJobStatus]);

  useEffect(() => { void fetchPaper(); }, [fetchPaper]);

  useEffect(() => {
    if (jobStatus === 'completed' || jobStatus === 'failed') return;
    const t = setInterval(() => void fetchPaper(), 5000);
    return () => clearInterval(t);
  }, [jobStatus, fetchPaper]);

  function handlePrint() { window.print(); }

  function handleRegenerate() { resetJob(); router.push('/create'); }

  return (
    <AppShell
      breadcrumb="Assignment"
      topRight={
        <button
          onClick={() => router.push('/assignments')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#7C3AED] border border-[#7C3AED]/30 hover:bg-[#F0EDFF] transition-colors"
        >
          ← All Assignments
        </button>
      }
    >
      <div className="p-6">
        {/* AI message bubble (dark header) */}
        {(jobStatus !== 'completed' || questionPaper) && (
          <div className={`rounded-2xl p-5 mb-5 ${questionPaper ? 'bg-[#1A1A2E]' : 'bg-[#1A1A2E]/90'}`}>
            {questionPaper ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] text-white leading-relaxed">
                    Certainly! Here is a customised Question Paper for your{' '}
                    <strong>{questionPaper.gradeLevel}</strong> {questionPaper.subject} class:
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#1A1A2E] text-[12px] font-semibold hover:bg-[#F4F6F8] transition-colors no-print"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download as PDF
                </button>
              </div>
            ) : (
              /* Loading state */
              <div className="flex flex-col items-center py-8 text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="animate-pulse">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-[15px] mb-1">
                    {jobStatus === 'failed' ? 'Generation Failed' : 'Generating your question paper…'}
                  </p>
                  <p className="text-[#94A3B8] text-[13px]">
                    {jobStatus === 'failed'
                      ? 'Something went wrong. Please try again.'
                      : 'This usually takes 15–30 seconds. Hang tight!'}
                  </p>
                </div>
                {/* Progress bar */}
                {jobStatus !== 'failed' && (
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
                      <span>Progress</span><span>{jobProgress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-[#7C3AED] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${jobProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {jobStatus === 'failed' && (
                  <button
                    onClick={handleRegenerate}
                    className="px-5 py-2 rounded-xl bg-white text-[#1A1A2E] text-[13px] font-semibold hover:bg-[#F4F6F8] transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Question Paper */}
        {questionPaper && (
          <div id="question-paper" className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden print-paper">
            {/* Action bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#E8ECF0] bg-[#FAFBFC] no-print">
              <span className="text-[13px] font-semibold text-[#1A1A2E]">Question Paper Preview</span>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                Regenerate
              </button>
            </div>

            {/* Paper content */}
            <div className="px-10 py-8 max-w-3xl mx-auto">
              {/* School / Institution Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-[#1A1A2E]">
                <h1 className="text-[18px] font-bold text-[#1A1A2E] mb-0.5">Delhi Public School, Sector-4, Bokaro</h1>
                <p className="text-[13px] text-[#5A6478]">Subject: {questionPaper.subject}</p>
                <p className="text-[13px] text-[#5A6478]">Class: {questionPaper.gradeLevel}</p>
              </div>

              {/* Time + Marks row */}
              <div className="flex items-center justify-between mb-4 text-[13px]">
                <span className="text-[#1A1A2E]">
                  Time Allowed: <strong>{questionPaper.duration ?? '3 hours'}</strong>
                </span>
                <span className="text-[#1A1A2E]">
                  Maximum Marks: <strong>{questionPaper.totalMarks}</strong>
                </span>
              </div>

              {/* General instruction */}
              <p className="text-[13px] text-[#1A1A2E] mb-5 font-medium">
                All questions are compulsory unless stated otherwise.
              </p>

              {/* Student fields */}
              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#1A1A2E] font-medium w-28">Name:</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="flex-1 border-b border-[#1A1A2E] bg-transparent text-[#1A1A2E] text-[13px] focus:outline-none pb-0.5 no-print"
                    style={{ borderBottom: '1px solid #1A1A2E' }}
                    placeholder=""
                  />
                  <span className="print-only">{studentName || '___________________________'}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#1A1A2E] font-medium w-28">Roll Number:</span>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="flex-1 border-b border-[#1A1A2E] bg-transparent text-[#1A1A2E] text-[13px] focus:outline-none pb-0.5 no-print"
                    placeholder=""
                  />
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#1A1A2E] font-medium w-28">Class: {questionPaper.gradeLevel} Section:</span>
                  <input
                    type="text"
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    className="w-24 border-b border-[#1A1A2E] bg-transparent text-[#1A1A2E] text-[13px] focus:outline-none pb-0.5 no-print"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Sections */}
              {questionPaper.sections.map((section, si) => (
                <SectionBlock key={section.id} section={section} sectionIndex={si} />
              ))}

              {/* End */}
              <div className="text-center mt-8 pt-4 border-t border-[#E8ECF0]">
                <p className="text-[13px] font-semibold text-[#1A1A2E]">End of Question Paper</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ── Section ─────────────────────────────────────────────────────────────────

function SectionBlock({ section, sectionIndex }: { section: Section; sectionIndex: number }) {
  const label = String.fromCharCode(65 + sectionIndex);
  const typeLabel: Record<string, string> = {
    mcq: 'Multiple Choice Questions',
    short_answer: 'Short Answer Questions',
    long_answer: 'Long Answer Questions',
    true_false: 'True or False',
    fill_blank: 'Fill in the Blanks',
  };

  return (
    <div className="mb-8">
      <div className="text-center mb-2">
        <h2 className="text-[14px] font-bold text-[#1A1A2E] uppercase tracking-wide">
          Section {label}
        </h2>
        <p className="text-[12px] font-semibold text-[#1A1A2E]">
          {typeLabel[section.questionType] ?? section.title}
        </p>
        <p className="text-[12px] italic text-[#5A6478]">{section.instruction}</p>
      </div>

      <ol className="space-y-3 mt-4">
        {section.questions.map((q, qi) => (
          <QuestionItem key={q.id} question={q} number={qi + 1} />
        ))}
      </ol>
    </div>
  );
}

// ── Question ─────────────────────────────────────────────────────────────────

const DIFF_LABEL: Record<string, string> = {
  easy: 'Easy', medium: 'Moderate', hard: 'Challenging',
};

function QuestionItem({ question, number }: { question: Question; number: number }) {
  return (
    <li className="flex gap-2 text-[13px] text-[#1A1A2E] leading-relaxed">
      <span className="font-medium flex-shrink-0">{number}.</span>
      <div className="flex-1">
        <span className="text-[#5A6478] font-medium">[{DIFF_LABEL[question.difficulty] ?? question.difficulty}] </span>
        <span>{question.text}</span>
        <span className="ml-2 text-[#94A3B8] text-[12px]">[{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]</span>

        {/* MCQ Options */}
        {question.type === 'mcq' && question.options && (
          <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 pl-1">
            {question.options.map((opt, i) => (
              <span key={i} className="text-[12px] text-[#5A6478]">{opt}</span>
            ))}
          </div>
        )}

        {/* Answer lines for short/long */}
        {(question.type === 'short_answer' || question.type === 'long_answer') && (
          <div className="mt-2 space-y-2">
            {Array.from({ length: question.type === 'short_answer' ? 2 : 4 }).map((_, i) => (
              <div key={i} className="border-b border-[#D1D5DB] h-5" />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
