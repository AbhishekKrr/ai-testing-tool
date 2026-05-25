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

// Steps
const STEPS = ['Assignment Details', 'Review & Generate'];

export default function CreateAssignmentClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step] = useState(0);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
  const totalMarks = formData.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    updateFormField('file', f);
    if (f) {
      setFileName(f.name);
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        setFilePreview(url);
      } else {
        setFilePreview(null);
      }
    } else {
      setFileName('');
      setFilePreview(null);
    }
  }

  function addQuestionTypeRow() {
    const used = new Set(formData.questionTypes.map((q) => q.type));
    const next = QUESTION_TYPE_OPTIONS.find((t) => !used.has(t));
    if (next) addQuestionType({ type: next, count: 5, marks: 5 });
  }

  function validateForm(): string | null {
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.topic.trim()) return 'Topic is required';
    if (!formData.gradeLevel.trim()) return 'Grade/Class is required';
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
      fd.append('title', (formData.title.trim() || `${formData.subject} – ${formData.gradeLevel}`));
      fd.append('subject', formData.subject.trim());
      fd.append('topic', formData.topic.trim());
      fd.append('gradeLevel', formData.gradeLevel.trim());
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
        <h1 className="text-[22px] font-bold text-[#1A1A2E] mb-0.5">Create Assignment</h1>
        <p className="text-[13px] text-[#94A3B8] mb-6">Set up a new assignment for your students</p>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${i <= step ? 'bg-[#7C3AED]' : 'bg-[#E8ECF0]'}`} />
              <span className={`text-[12px] font-medium ${i === step ? 'text-[#7C3AED]' : 'text-[#94A3B8]'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#E8ECF0]" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden">
          <div className="px-6 pt-5 pb-2 border-b border-[#F4F6F8]">
            <h2 className="text-[15px] font-semibold text-[#1A1A2E]">Assignment Details</h2>
            <p className="text-[12px] text-[#94A3B8]">Basic information about your assignment</p>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* File upload */}
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E8ECF0] rounded-xl p-6 text-center cursor-pointer hover:border-[#7C3AED]/40 hover:bg-[#F9F8FF] transition-colors group"
              >
                {filePreview ? (
                  <img src={filePreview} alt="preview" className="max-h-32 mx-auto rounded-lg object-contain mb-2" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F6F8] flex items-center justify-center group-hover:bg-[#EDE9FF] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#94A3B8] group-hover:text-[#7C3AED] transition-colors">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#5A6478]">
                        {fileName || 'Choose a file or drag & drop it here'}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">JPEG, PNG, upto 5MB</p>
                    </div>
                    <button
                      type="button"
                      className="text-[12px] font-medium text-[#7C3AED] border border-[#7C3AED]/30 rounded-lg px-4 py-1.5 hover:bg-[#7C3AED]/5 transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
              {fileName && (
                <p className="text-[11px] text-[#94A3B8] mt-1 ml-1">{fileName}</p>
              )}
              <p className="text-[11px] text-[#94A3B8] mt-1 ml-1">
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

            {/* Subject + Topic + Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#5A6478] mb-1.5">
                  Subject <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateFormField('subject', e.target.value)}
                  placeholder="e.g., Science"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#5A6478] mb-1.5">
                  Topic / Chapter <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => updateFormField('topic', e.target.value)}
                  placeholder="e.g., Electricity"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#5A6478] mb-1.5">
                  Class / Grade <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.gradeLevel}
                  onChange={(e) => updateFormField('gradeLevel', e.target.value)}
                  placeholder="e.g., Grade 8"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#5A6478] mb-1.5">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  placeholder="e.g., Quiz on Electricity"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[12px] font-medium text-[#5A6478] mb-1.5">
                Due Date <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => updateFormField('dueDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition bg-white"
                  placeholder="DD-MM-YYYY"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>

            {/* Question Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-medium text-[#5A6478]">Question Type</label>
                <div className="flex items-center gap-4 text-[11px] text-[#94A3B8]">
                  <span>No. of Questions</span>
                  <span>Marks</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {formData.questionTypes.map((qt, idx) => (
                  <QuestionTypeRow
                    key={idx}
                    qt={qt}
                    index={idx}
                    usedTypes={formData.questionTypes.map((q) => q.type)}
                    onUpdate={(updated) => updateQuestionType(idx, updated)}
                    onRemove={() => removeQuestionType(idx)}
                    canRemove={formData.questionTypes.length > 1}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestionTypeRow}
                disabled={formData.questionTypes.length >= QUESTION_TYPE_OPTIONS.length}
                className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#7C3AED] hover:text-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <div className="w-5 h-5 rounded-full border-2 border-[#7C3AED] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="mt-4 flex items-center justify-end gap-6 text-[12px] text-[#5A6478]">
                <span>Total Questions : <strong className="text-[#1A1A2E]">{totalQuestions}</strong></span>
                <span>Total Marks : <strong className="text-[#1A1A2E]">{totalMarks}</strong></span>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-[12px] font-medium text-[#5A6478] mb-1.5">
                Additional Information <span className="text-[#94A3B8] font-normal">(For better output)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.additionalInstructions}
                  onChange={(e) => updateFormField('additionalInstructions', e.target.value)}
                  rows={3}
                  placeholder="e.g., Generate a question paper for a 3 hour exam duration..."
                  className="w-full px-3 py-2.5 pr-8 rounded-xl border border-[#E8ECF0] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none transition"
                />
                <button className="absolute right-3 bottom-3 text-[#94A3B8] hover:text-[#7C3AED] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8ECF0] bg-white text-[13px] font-medium text-[#5A6478] hover:bg-[#F4F6F8] transition-colors"
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

// ── Question Type Row ───────────────────────────────────────────────────────

interface QTRowProps {
  qt: QuestionTypeConfig;
  index: number;
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
    <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E8ECF0]">
      {/* Type dropdown */}
      <div className="flex-1 relative">
        <select
          value={qt.type}
          onChange={(e) => onUpdate({ ...qt, type: e.target.value as QuestionTypeName })}
          className="w-full appearance-none bg-white border border-[#E8ECF0] rounded-lg px-3 py-2 text-[12px] text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] cursor-pointer pr-7"
        >
          {available.map((t) => (
            <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Remove × */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="w-6 h-6 rounded-full border border-[#E8ECF0] flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors flex-shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* Count stepper */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => stepCount(-1)}
          className="w-6 h-6 rounded-md bg-white border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[13px] font-medium"
        >−</button>
        <span className="w-8 text-center text-[13px] font-semibold text-[#1A1A2E]">{qt.count}</span>
        <button
          type="button"
          onClick={() => stepCount(1)}
          className="w-6 h-6 rounded-md bg-white border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[13px] font-medium"
        >+</button>
      </div>

      {/* Marks stepper */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => stepMarks(-1)}
          className="w-6 h-6 rounded-md bg-white border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[13px] font-medium"
        >−</button>
        <span className="w-8 text-center text-[13px] font-semibold text-[#1A1A2E]">{qt.marks}</span>
        <button
          type="button"
          onClick={() => stepMarks(1)}
          className="w-6 h-6 rounded-md bg-white border border-[#E8ECF0] flex items-center justify-center text-[#5A6478] hover:bg-[#F4F6F8] transition-colors text-[13px] font-medium"
        >+</button>
      </div>
    </div>
  );
}
