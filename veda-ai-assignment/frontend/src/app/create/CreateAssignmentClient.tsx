'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { QuestionTypeName, QUESTION_TYPE_LABELS, QuestionTypeConfig } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

const QUESTION_TYPE_OPTIONS: QuestionTypeName[] = [
  'mcq',
  'short_answer',
  'long_answer',
  'true_false',
  'fill_blank',
];

export default function CreateAssignmentClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const {
    formData,
    isSubmitting,
    submitError,
    updateFormField,
    addQuestionType,
    updateQuestionType,
    removeQuestionType,
    setSubmitting,
    setSubmitError,
    setJobInfo,
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
    if (f) {
      updateFormField('file', f);
      setFileName(f.name);
    }
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
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append('dueDate', formData.dueDate);
      fd.append('questionTypes', JSON.stringify(formData.questionTypes));
      if (formData.additionalInstructions.trim()) {
        fd.append('additionalInstructions', formData.additionalInstructions.trim());
      }
      if (formData.file) fd.append('file', formData.file);

      const res = await fetch(`${BACKEND_URL}/api/assignments`, {
        method: 'POST', body: fd,
      });
      const data = await res.json() as { assignmentId: string; jobId: string; error?: string };

      if (!res.ok) { setSubmitError(data.error ?? 'Failed to create'); return; }
      setJobInfo(data.jobId, data.assignmentId);
      router.push(`/results/${data.assignmentId}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell breadcrumb="Assignment">
      <div className="max-w-2xl mx-auto px-6 py-6">

        {/* Page title */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />
          <h1 className="text-[20px] font-bold text-[#1A1A2E]">Create Assignment</h1>
        </div>
        <p className="text-[13px] text-[#94A3B8] mb-5">Set up a new assignment for your students</p>

        {/* Step progress bar — dark thin line, matches Figma */}
        <div className="w-full h-[3px] bg-[#E8ECF0] mb-6 overflow-hidden">
          <div className="h-full bg-[#1A1A2E]" style={{ width: '50%' }} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-[#F4F6F8]">
            <h2 className="text-[15px] font-semibold text-[#1A1A2E]">Assignment Details</h2>
            <p className="text-[12px] text-[#94A3B8]">Basic information about your assignment.</p>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* ── File Upload ── */}
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#CBD5E1] rounded-xl py-10 text-center cursor-pointer hover:border-[#7C3AED]/40 hover:bg-[#F9F8FF] transition-colors bg-white"
              >
                <div className="flex flex-col items-center gap-2.5">
                  {/* Upload cloud icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <div>
                    <p className="text-[13px] text-[#5A6478] font-medium">
                      {fileName || 'Choose a file or drag & drop it here'}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">JPEG, PNG, upto 10MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="mt-1 text-[12px] font-medium text-[#5A6478] border border-[#CBD5E1] rounded-lg px-5 py-1.5 hover:bg-[#F4F6F8] transition-colors bg-white"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1.5">
                Upload images of your preferred document/image
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* ── Due Date ── */}
            <div>
              <label className="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => updateFormField('dueDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition bg-white appearance-none"
                  placeholder="DD-MM-YYYY"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>

            {/* ── Question Type ── */}
            <div>
              {/* Column headers */}
              <div className="flex items-center mb-2">
                <span className="text-[12px] font-semibold text-[#1A1A2E] flex-1">Question Type</span>
                <span className="text-[11px] text-[#94A3B8] w-28 text-center">No. of Questions</span>
                <span className="text-[11px] text-[#94A3B8] w-20 text-center">Marks</span>
                <span className="w-5" /> {/* spacer for remove × */}
              </div>

              <div className="space-y-2">
                {formData.questionTypes.map((qt, idx) => (
                  <QuestionTypeRow
                    key={idx}
                    qt={qt}
                    usedTypes={formData.questionTypes.map((q) => q.type)}
                    onUpdate={(updated) => updateQuestionType(idx, updated)}
                    onRemove={() => removeQuestionType(idx)}
                    canRemove={formData.questionTypes.length > 1}
                  />
                ))}
              </div>

              {/* Add Question Type */}
              <button
                type="button"
                onClick={addQuestionTypeRow}
                disabled={formData.questionTypes.length >= QUESTION_TYPE_OPTIONS.length}
                className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A2E] hover:text-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                Add Question Type
              </button>

              {/* Totals — stacked, right-aligned */}
              <div className="mt-4 flex flex-col items-end gap-0.5 text-[12px]">
                <span className="text-[#5A6478]">
                  Total Questions : <strong className="text-[#1A1A2E]">{totalQuestions}</strong>
                </span>
                <span className="text-[#5A6478]">
                  Total Marks : <strong className="text-[#1A1A2E]">{totalMarks}</strong>
                </span>
              </div>
            </div>

            {/* ── Additional Information ── */}
            <div>
              <label className="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                Additional Information{' '}
                <span className="font-normal text-[#94A3B8]">(For better output)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.additionalInstructions}
                  onChange={(e) => updateFormField('additionalInstructions', e.target.value)}
                  rows={4}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="w-full px-3 py-2.5 pr-8 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none transition"
                />
                {/* mic icon */}
                <button className="absolute right-3 bottom-3 text-[#94A3B8] hover:text-[#7C3AED] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="mt-4 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
            </svg>
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#E8ECF0] bg-white text-[13px] font-medium text-[#5A6478] hover:bg-[#F4F6F8] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Previous
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-[13px] font-semibold hover:bg-[#2a2a4e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating…
              </>
            ) : (
              <>
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

// ── Question Type Row ────────────────────────────────────────────────────────

interface QTRowProps {
  qt: QuestionTypeConfig;
  usedTypes: QuestionTypeName[];
  onUpdate: (qt: QuestionTypeConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function QuestionTypeRow({ qt, usedTypes, onUpdate, onRemove, canRemove }: QTRowProps) {
  const available = QUESTION_TYPE_OPTIONS.filter((t) => t === qt.type || !usedTypes.includes(t));

  function stepCount(delta: number) {
    onUpdate({ ...qt, count: Math.max(1, qt.count + delta) });
  }
  function stepMarks(delta: number) {
    onUpdate({ ...qt, marks: Math.max(1, qt.marks + delta) });
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-[#F4F6F8] last:border-b-0">
      {/* Type dropdown */}
      <div className="flex-1 relative">
        <select
          value={qt.type}
          onChange={(e) => onUpdate({ ...qt, type: e.target.value as QuestionTypeName })}
          className="w-full appearance-none bg-transparent border border-[#E8ECF0] rounded-lg px-3 py-2 text-[12px] text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] cursor-pointer pr-6 bg-white"
        >
          {available.map((t) => (
            <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Remove × */}
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="w-5 h-5 flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] transition-colors flex-shrink-0 text-[15px] font-medium"
          title="Remove"
        >
          ×
        </button>
      ) : (
        <div className="w-5 flex-shrink-0" />
      )}

      {/* Count stepper */}
      <div className="flex items-center gap-1 w-28 justify-center flex-shrink-0">
        <button
          type="button"
          onClick={() => stepCount(-1)}
          className="w-6 h-6 rounded border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[14px] leading-none bg-white"
        >−</button>
        <span className="w-8 text-center text-[13px] font-semibold text-[#1A1A2E] tabular-nums">{qt.count}</span>
        <button
          type="button"
          onClick={() => stepCount(1)}
          className="w-6 h-6 rounded border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[14px] leading-none bg-white"
        >+</button>
      </div>

      {/* Marks stepper */}
      <div className="flex items-center gap-1 w-20 justify-center flex-shrink-0">
        <button
          type="button"
          onClick={() => stepMarks(-1)}
          className="w-6 h-6 rounded border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[14px] leading-none bg-white"
        >−</button>
        <span className="w-8 text-center text-[13px] font-semibold text-[#1A1A2E] tabular-nums">{qt.marks}</span>
        <button
          type="button"
          onClick={() => stepMarks(1)}
          className="w-6 h-6 rounded border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[14px] leading-none bg-white"
        >+</button>
      </div>
    </div>
  );
}
