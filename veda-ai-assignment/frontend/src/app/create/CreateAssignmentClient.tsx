'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { QuestionTypeName, QUESTION_TYPE_LABELS, QuestionTypeConfig } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

const QUESTION_TYPE_OPTIONS: QuestionTypeName[] = [
  'mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blank',
];

/* ── Exact Figma tokens ──────────────────────────────── */
const C_PRIMARY   = '#303030';
const C_MUTED     = 'rgba(94, 94, 94, 0.8)';
const C_MUTED55   = 'rgba(94, 94, 94, 0.55)';
const C_DISABLED  = '#A9A9A9';
const C_BORDER    = '#DADADA';
const FONT        = 'var(--font-bricolage)';

/* ── CountStepper ─────────────────────────────────────── */
function CountStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{
      width: '100px', height: '44px', flexShrink: 0,
      padding: '11px 8px',
      background: '#FFFFFF',
      borderRadius: '100px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', padding: 0 }}
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
          <path d="M0 1H10" stroke={C_BORDER} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', padding: 0 }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 0V10M0 5H10" stroke={C_BORDER} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function CreateAssignmentClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const {
    formData, isSubmitting, submitError,
    updateFormField, addQuestionType, updateQuestionType,
    removeQuestionType, setSubmitting, setSubmitError, setJobInfo,
  } = useAssignmentStore();

  const totalQuestions = formData.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks     = formData.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    updateFormField('file', f);
    setFileName(f ? f.name : '');
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) { updateFormField('file', f); setFileName(f.name); }
  }
  function addQuestionTypeRow() {
    const used = new Set(formData.questionTypes.map((q) => q.type));
    const next = QUESTION_TYPE_OPTIONS.find((t) => !used.has(t));
    if (next) addQuestionType({ type: next, count: 5, marks: 5 });
  }
  function validateForm(): string | null {
    if (!formData.dueDate) return 'Due date is required';
    if (formData.questionTypes.length === 0) return 'Add at least one question type';
    for (const qt of formData.questionTypes) {
      if (qt.count < 1) return 'Question count must be ≥ 1';
      if (qt.marks < 1) return 'Marks must be ≥ 1';
    }
    return null;
  }
  async function handleSubmit() {
    const err = validateForm();
    if (err) { setSubmitError(err); return; }
    setSubmitting(true); setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append('dueDate', formData.dueDate);
      fd.append('questionTypes', JSON.stringify(formData.questionTypes));
      if (formData.additionalInstructions.trim()) fd.append('additionalInstructions', formData.additionalInstructions.trim());
      if (formData.file) fd.append('file', formData.file);
      const res  = await fetch(`${BACKEND_URL}/api/assignments`, { method: 'POST', body: fd });
      const data = await res.json() as { assignmentId: string; jobId: string; error?: string };
      if (!res.ok) { setSubmitError(data.error ?? 'Failed to create'); return; }
      setJobInfo(data.jobId, data.assignmentId);
      router.push(`/results/${data.assignmentId}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Network error');
    } finally { setSubmitting(false); }
  }

  return (
    <AppShell>
      <div style={{ padding: '32px 32px 48px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', marginBottom: '0px' }}>
          {/* Live green dot */}
          <div style={{
            width: '12px', height: '12px', flexShrink: 0,
            background: '#4BC26D',
            border: '4px solid rgba(75, 194, 109, 0.4)',
            borderRadius: '50%',
            boxShadow: '0px 16px 48px rgba(0,0,0,0.12)',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '20px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
              Create Assignment
            </span>
            <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_MUTED55 }}>
              Set up a new assignment for your students
            </span>
          </div>
        </div>

        {/* ── Step indicator — two thick lines ── */}
        <div style={{ display: 'flex', width: '100%', margin: '16px 0 24px' }}>
          <div style={{ flex: 1, borderTop: '5px solid #5E5E5E', borderRadius: '2px 0 0 2px' }} />
          <div style={{ flex: 1, borderTop: '5px solid #DADADA', borderRadius: '0 2px 2px 0' }} />
        </div>

        {/* ── Form card ── */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '32px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>

          {/* Section header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '20px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
              Assignment Details
            </span>
            <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_MUTED }}>
              Basic information about your assignment
            </span>
          </div>

          {/* ── Form fields ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* File Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', background: '#FFFFFF',
                  border: '1.75px dashed rgba(0, 0, 0, 0.2)',
                  borderRadius: '24px',
                  padding: '24px 32px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                  cursor: 'pointer',
                }}
              >
                {/* Cloud icon in white square */}
                <div style={{ width: '40px', height: '40px', background: '#FFFFFF', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
                    {fileName || 'Choose a file or drag & drop it here'}
                  </span>
                  <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_DISABLED }}>
                    JPEG, PNG, upto 10MB
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{ padding: '8px 24px', background: '#F6F6F6', borderRadius: '48px', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 500, fontSize: '14px', letterSpacing: '-0.04em', color: C_PRIMARY }}
                >
                  Browse Files
                </button>
              </div>

              <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: 'rgba(48, 48, 48, 0.6)' }}>
                Upload images of your preferred document/image
              </span>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Due Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
                Due Date
              </span>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={formData.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => updateFormField('dueDate', e.target.value)}
                  style={{
                    width: '100%', height: '44px',
                    padding: '11px 48px 11px 16px',
                    border: `1.25px solid ${C_BORDER}`,
                    borderRadius: '100px',
                    background: 'transparent',
                    fontFamily: FONT, fontWeight: 500, fontSize: '16px', letterSpacing: '-0.04em',
                    color: formData.dueDate ? C_PRIMARY : C_DISABLED,
                    outline: 'none', appearance: 'none', boxSizing: 'border-box',
                  }}
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>

            {/* Question Type + Counters */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '32px' }}>

                {/* LEFT — type pills */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY, height: '22px', display: 'flex', alignItems: 'center' }}>
                    Question Type
                  </span>

                  {formData.questionTypes.map((qt, idx) => {
                    const available = QUESTION_TYPE_OPTIONS.filter(
                      (t) => t === qt.type || !formData.questionTypes.map((q) => q.type).includes(t)
                    );
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '44px' }}>
                        <div style={{ flex: 1, position: 'relative', height: '44px' }}>
                          <select
                            value={qt.type}
                            onChange={(e) => updateQuestionType(idx, { ...qt, type: e.target.value as QuestionTypeName })}
                            style={{
                              width: '100%', height: '44px',
                              padding: '11px 36px 11px 16px',
                              background: '#FFFFFF', borderRadius: '100px', border: 'none',
                              fontFamily: FONT, fontWeight: 500, fontSize: '16px', letterSpacing: '-0.04em', color: C_PRIMARY,
                              appearance: 'none', cursor: 'pointer', outline: 'none',
                            }}
                          >
                            {available.map((t) => (
                              <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
                            ))}
                          </select>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C_PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                        {formData.questionTypes.length > 1 ? (
                          <button type="button" onClick={() => removeQuestionType(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', flexShrink: 0, color: C_PRIMARY }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        ) : <div style={{ width: '16px', flexShrink: 0 }} />}
                      </div>
                    );
                  })}

                  {/* Add Question Type */}
                  {formData.questionTypes.length < QUESTION_TYPE_OPTIONS.length && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }}>
                      <button type="button" onClick={addQuestionTypeRow}
                        style={{ width: '36px', height: '36px', background: '#2B2B2B', borderRadius: '48px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
                        Add Question Type
                      </span>
                    </div>
                  )}
                </div>

                {/* RIGHT — No. of Questions + Marks columns */}
                <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                  {/* No. of Questions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY, height: '22px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      No. of Questions
                    </span>
                    {formData.questionTypes.map((qt, idx) => (
                      <CountStepper key={idx} value={qt.count} onChange={(v) => updateQuestionType(idx, { ...qt, count: v })} />
                    ))}
                  </div>

                  {/* Marks */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY, height: '22px', display: 'flex', alignItems: 'center' }}>
                      Marks
                    </span>
                    {formData.questionTypes.map((qt, idx) => (
                      <CountStepper key={idx} value={qt.marks} onChange={(v) => updateQuestionType(idx, { ...qt, marks: v })} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '110%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
                  Total Questions : {totalQuestions}
                </span>
                <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: '16px', lineHeight: '110%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
                  Total Marks : {totalMarks}
                </span>
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: C_PRIMARY }}>
                Additional Information{' '}
                <span style={{ fontWeight: 400, color: C_MUTED }}>(For better output)</span>
              </span>
              <div style={{
                position: 'relative',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.25)',
                border: `1.25px dashed ${C_BORDER}`,
                borderRadius: '16px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: '102px',
              }}>
                <textarea
                  value={formData.additionalInstructions}
                  onChange={(e) => updateFormField('additionalInstructions', e.target.value)}
                  rows={3}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  style={{
                    width: '100%', border: 'none', background: 'transparent',
                    resize: 'none', outline: 'none',
                    fontFamily: FONT, fontWeight: 500, fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.04em',
                    color: 'rgba(48, 48, 48, 0.6)',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" style={{ width: '36px', height: '36px', background: '#F0F0F0', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C_PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div style={{ padding: '12px 16px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '16px', fontFamily: FONT, fontSize: '14px', color: '#EF4444', letterSpacing: '-0.04em' }}>
              {submitError}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '12px 24px', height: '46px',
                background: '#FFFFFF', borderRadius: '48px', border: 'none', cursor: 'pointer',
                fontFamily: FONT, fontWeight: 500, fontSize: '16px', letterSpacing: '-0.04em', color: C_PRIMARY,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C_PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Previous
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '12px 24px', height: '46px',
                background: isSubmitting ? '#555' : '#181818',
                borderRadius: '48px', border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: FONT, fontWeight: 500, fontSize: '16px', letterSpacing: '-0.04em', color: '#FFFFFF',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Generating…' : 'Continue'}
              {!isSubmitting && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

// Keep for TS — not used but may be imported elsewhere
export type { QuestionTypeConfig };
