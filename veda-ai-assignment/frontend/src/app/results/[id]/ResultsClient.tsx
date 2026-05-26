'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { QuestionPaper, Question, Section } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
const FONT = 'var(--font-bricolage)';

export default function ResultsClient({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const {
    jobStatus, jobProgress, questionPaper,
    currentAssignmentId, setJobInfo, setJobStatus, setQuestionPaper, resetJob,
  } = useAssignmentStore();
  useWebSocket();

  const [studentName, setStudentName]       = useState('');
  const [rollNumber, setRollNumber]         = useState('');
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
      breadcrumb="Results"
      topRight={
        <button
          onClick={() => router.push('/assignments')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px',
            background: '#F6F6F6',
            borderRadius: '100px',
            border: 'none', cursor: 'pointer',
            fontFamily: FONT, fontWeight: 500, fontSize: '13px',
            letterSpacing: '-0.04em', color: '#303030',
          }}
          className="no-print"
        >
          ← All Assignments
        </button>
      }
    >
      {/* spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ padding: '21px 0 32px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Status card (loading / failed) ── */}
        {jobStatus !== 'completed' && (
          <div style={{
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '32px',
            padding: '32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            textAlign: 'center',
          }}>
            {jobStatus === 'failed' ? (
              /* ── Failed state ── */
              <>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '18px', color: '#303030', margin: '0 0 6px', letterSpacing: '-0.04em' }}>
                    Generation Failed
                  </p>
                  <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', color: 'rgba(94,94,94,0.8)', margin: 0, letterSpacing: '-0.04em' }}>
                    Something went wrong. Please try again.
                  </p>
                </div>
                <button
                  onClick={handleRegenerate}
                  style={{
                    padding: '12px 28px', background: '#181818', borderRadius: '48px',
                    border: 'none', cursor: 'pointer',
                    fontFamily: FONT, fontWeight: 500, fontSize: '15px', color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                  }}
                >
                  Try Again
                </button>
              </>
            ) : (
              /* ── Generating state ── */
              <>
                {/* Animated green indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '12px', height: '12px', flexShrink: 0,
                    background: '#4BC26D', border: '4px solid rgba(75,194,109,0.4)', borderRadius: '50%',
                  }} />
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '18px', color: '#303030', letterSpacing: '-0.04em' }}>
                    Generating your question paper…
                  </span>
                </div>
                <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', color: 'rgba(94,94,94,0.55)', margin: 0, letterSpacing: '-0.04em' }}>
                  This usually takes 15–30 seconds. Hang tight!
                </p>
                {/* Progress bar */}
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', color: 'rgba(94,94,94,0.8)' }}>Progress</span>
                    <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: '12px', color: '#303030' }}>{jobProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#DADADA', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '100px',
                      background: 'linear-gradient(90deg, #4BC26D, #E56820)',
                      width: `${jobProgress}%`, transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
                {/* Spinner */}
                <div style={{
                  width: '32px', height: '32px',
                  border: '2px solid #DADADA', borderTopColor: '#303030',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
              </>
            )}
          </div>
        )}

        {/* ── Question Paper Card ── */}
        {questionPaper && (
          <div
            id="question-paper"
            style={{
              background: '#FFFFFF',
              borderRadius: '32px',
              overflow: 'hidden',
            }}
            className="print-paper"
          >
            {/* ── Action bar (no-print) ── */}
            <div
              className="no-print"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 28px',
                borderBottom: '1px solid #F0F0F0',
                background: 'rgba(255,255,255,0.9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4BC26D' }} />
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: '14px', color: '#303030', letterSpacing: '-0.04em' }}>
                  Question Paper Ready
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Regenerate */}
                <button
                  onClick={handleRegenerate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', background: '#F6F6F6', borderRadius: '100px',
                    border: 'none', cursor: 'pointer',
                    fontFamily: FONT, fontWeight: 500, fontSize: '13px', color: '#303030',
                    letterSpacing: '-0.04em',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                  </svg>
                  Regenerate
                </button>
                {/* Download as PDF */}
                <button
                  onClick={handlePrint}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 20px', background: '#181818', borderRadius: '100px',
                    border: 'none', cursor: 'pointer',
                    fontFamily: FONT, fontWeight: 500, fontSize: '13px', color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download as PDF
                </button>
              </div>
            </div>

            {/* ── Paper content ── */}
            <div style={{ padding: '40px 48px', maxWidth: '720px', margin: '0 auto' }}>

              {/* School header */}
              <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #303030' }}>
                <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '18px', color: '#303030', margin: '0 0 4px', letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                  Delhi Public School, Sector-4, Bokaro
                </h1>
                <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: '13px', color: '#5E5E5E', margin: 0 }}>
                  Subject: {questionPaper.subject} &nbsp;|&nbsp; Class: {questionPaper.gradeLevel}
                </p>
              </div>

              {/* Time + Marks row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: FONT, fontSize: '13px', color: '#303030' }}>
                  Time Allowed: <strong>{questionPaper.duration ?? '3 Hours'}</strong>
                </span>
                <span style={{ fontFamily: FONT, fontSize: '13px', color: '#303030' }}>
                  Maximum Marks: <strong>{questionPaper.totalMarks}</strong>
                </span>
              </div>

              {/* General instruction */}
              <p style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 500, color: '#303030', marginBottom: '20px', fontStyle: 'italic' }}>
                General Instructions: All questions are compulsory unless stated otherwise. Read each question carefully before answering.
              </p>

              {/* ── Student fields ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E8E8E8' }}>
                {[
                  { label: 'Name', value: studentName, setter: setStudentName, printVal: studentName || '___________________________________' },
                  { label: 'Roll Number', value: rollNumber, setter: setRollNumber, printVal: rollNumber || '__________________' },
                  { label: `Class: ${questionPaper.gradeLevel} | Section`, value: studentSection, setter: setStudentSection, printVal: studentSection || '________', width: '100px' },
                ].map(({ label, value, setter, printVal, width }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT, fontSize: '13px', color: '#303030' }}>
                    <span style={{ fontWeight: 600, flexShrink: 0, minWidth: '110px' }}>{label}:</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="no-print"
                      style={{
                        flex: width ? undefined : 1, width: width,
                        background: 'transparent',
                        border: 'none', borderBottom: '1.5px solid #303030',
                        outline: 'none', fontFamily: FONT, fontSize: '13px', color: '#303030',
                        paddingBottom: '2px',
                      }}
                    />
                    <span className="print-only" style={{ fontFamily: FONT, fontSize: '13px' }}>{printVal}</span>
                  </div>
                ))}
              </div>

              {/* ── Sections ── */}
              {questionPaper.sections.map((section, si) => (
                <SectionBlock key={section.id} section={section} sectionIndex={si} />
              ))}

              {/* End of paper */}
              <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E8E8E8' }}>
                <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '13px', color: '#303030', letterSpacing: '-0.04em', margin: 0 }}>
                  *** End of Question Paper ***
                </p>
              </div>

              {/* ── Answer Key ── */}
              {questionPaper.sections.some(s => s.questions.some(q => q.answer)) && (
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '2px solid #303030' }}>
                  <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: '14px', color: '#303030', marginBottom: '12px', letterSpacing: '-0.04em' }}>
                    Answer Key:
                  </h3>
                  <ol style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px', margin: 0 }}>
                    {questionPaper.sections.flatMap((s) => s.questions).map((q, i) =>
                      q.answer ? (
                        <li key={q.id} style={{ fontFamily: FONT, fontSize: '12px', color: '#303030', lineHeight: '1.5' }}>
                          <strong>{i + 1}.</strong> {q.answer}
                        </li>
                      ) : null
                    )}
                  </ol>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ── Section block ─────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  mcq:          'Multiple Choice Questions',
  short_answer: 'Short Answer Questions',
  long_answer:  'Long Answer Questions',
  true_false:   'True or False',
  fill_blank:   'Fill in the Blanks',
};

function SectionBlock({ section, sectionIndex }: { section: Section; sectionIndex: number }) {
  const letter = String.fromCharCode(65 + sectionIndex);
  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h2 style={{
          fontFamily: FONT, fontWeight: 800, fontSize: '14px', color: '#303030',
          textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px',
        }}>
          Section {letter}
        </h2>
        <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: '13px', color: '#303030', margin: '0 0 2px' }}>
          {TYPE_LABEL[section.questionType] ?? section.title}
        </p>
        <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: '12px', color: '#5E5E5E', fontStyle: 'italic', margin: 0 }}>
          {section.instruction}
        </p>
        <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: '12px', color: '#303030', margin: '4px 0 0' }}>
          [{section.questions.length} Question{section.questions.length > 1 ? 's' : ''} — {section.totalMarks} Marks]
        </p>
      </div>

      {/* Questions */}
      <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {section.questions.map((q, qi) => (
          <QuestionItem key={q.id} question={q} number={qi + 1} />
        ))}
      </ol>
    </div>
  );
}

// ── Question item ─────────────────────────────────────────────────────────────

const DIFF_STYLE: Record<string, React.CSSProperties> = {
  easy:   { background: 'rgba(75,194,109,0.12)', color: '#2D9B4C', border: '1px solid rgba(75,194,109,0.3)' },
  medium: { background: 'rgba(245,158,11,0.12)', color: '#B45309', border: '1px solid rgba(245,158,11,0.3)' },
  hard:   { background: 'rgba(239,68,68,0.12)',  color: '#C53535', border: '1px solid rgba(239,68,68,0.3)' },
};
const DIFF_LABEL: Record<string, string> = { easy: 'Easy', medium: 'Moderate', hard: 'Challenging' };

function QuestionItem({ question, number }: { question: Question; number: number }) {
  const diff = question.difficulty ?? 'medium';
  const diffStyle = DIFF_STYLE[diff] ?? DIFF_STYLE.medium;

  return (
    <li style={{ display: 'flex', gap: '10px', fontFamily: FONT, fontSize: '13px', color: '#303030', lineHeight: '1.6' }}>
      <span style={{ fontWeight: 700, flexShrink: 0, minWidth: '20px' }}>{number}.</span>
      <div style={{ flex: 1 }}>
        {/* Question text + tags */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <span style={{ flex: 1 }}>{question.text}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Difficulty badge */}
            <span style={{
              ...diffStyle,
              padding: '2px 8px', borderRadius: '100px',
              fontFamily: FONT, fontWeight: 600, fontSize: '11px',
              letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>
              {DIFF_LABEL[diff] ?? diff}
            </span>
            {/* Marks */}
            <span style={{
              background: '#F6F6F6', color: '#5E5E5E',
              border: '1px solid #E8E8E8',
              padding: '2px 8px', borderRadius: '100px',
              fontFamily: FONT, fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap',
            }}>
              {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
            </span>
          </div>
        </div>

        {/* MCQ Options */}
        {question.type === 'mcq' && question.options && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px', marginTop: '4px', paddingLeft: '4px' }}>
            {question.options.map((opt, i) => (
              <span key={i} style={{ fontFamily: FONT, fontSize: '12px', color: '#5E5E5E' }}>
                {String.fromCharCode(97 + i)}) {opt}
              </span>
            ))}
          </div>
        )}

        {/* True/False options */}
        {question.type === 'true_false' && (
          <div style={{ display: 'flex', gap: '24px', marginTop: '4px', paddingLeft: '4px' }}>
            {['True', 'False'].map((opt) => (
              <span key={opt} style={{ fontFamily: FONT, fontSize: '12px', color: '#5E5E5E' }}>
                ○ {opt}
              </span>
            ))}
          </div>
        )}

        {/* Answer lines for short/long */}
        {(question.type === 'short_answer' || question.type === 'long_answer') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {Array.from({ length: question.type === 'short_answer' ? 2 : 5 }).map((_, i) => (
              <div key={i} style={{ borderBottom: '1px solid #DADADA', height: '20px' }} />
            ))}
          </div>
        )}

        {/* Fill in the blank line */}
        {question.type === 'fill_blank' && (
          <div style={{ borderBottom: '1px solid #DADADA', height: '20px', width: '200px', marginTop: '8px' }} />
        )}
      </div>
    </li>
  );
}
