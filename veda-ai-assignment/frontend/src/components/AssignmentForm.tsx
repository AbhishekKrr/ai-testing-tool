'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import {
  QUESTION_TYPE_LABELS,
  GRADE_LEVELS,
  QuestionTypeName,
  QuestionTypeConfig,
} from '@/types';

const QUESTION_TYPES: QuestionTypeName[] = [
  'mcq',
  'short_answer',
  'long_answer',
  'true_false',
  'fill_blank',
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export default function AssignmentForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

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

  const totalMarks = formData.questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marks,
    0
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    updateFormField('file', f);
    setFileName(f ? f.name : '');
  }

  function addNewQuestionType() {
    const used = new Set(formData.questionTypes.map((q) => q.type));
    const next = QUESTION_TYPES.find((t) => !used.has(t));
    if (next) {
      addQuestionType({ type: next, count: 5, marks: 2 });
    }
  }

  function validateForm(): string | null {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.topic.trim()) return 'Topic is required';
    if (!formData.gradeLevel) return 'Grade level is required';
    if (!formData.dueDate) return 'Due date is required';
    if (formData.questionTypes.length === 0)
      return 'Add at least one question type';
    for (const qt of formData.questionTypes) {
      if (qt.count < 1) return 'Question count must be at least 1';
      if (qt.marks < 1) return 'Marks must be at least 1';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) { setSubmitError(err); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('subject', formData.subject.trim());
      fd.append('topic', formData.topic.trim());
      fd.append('gradeLevel', formData.gradeLevel);
      fd.append('dueDate', formData.dueDate);
      fd.append('questionTypes', JSON.stringify(formData.questionTypes));
      if (formData.additionalInstructions.trim()) {
        fd.append('additionalInstructions', formData.additionalInstructions.trim());
      }
      if (formData.file) {
        fd.append('file', formData.file);
      }

      const res = await fetch(`${BACKEND_URL}/api/assignments`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json() as { assignmentId: string; jobId: string; error?: string };

      if (!res.ok) {
        setSubmitError(data.error ?? 'Failed to create assignment');
        return;
      }

      setJobInfo(data.jobId, data.assignmentId);
      router.push(`/results/${data.assignmentId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Header info ─────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-800">Assignment Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              placeholder="e.g., Mid-Term Examination"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => updateFormField('subject', e.target.value)}
              placeholder="e.g., Mathematics"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Topic / Chapter <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => updateFormField('topic', e.target.value)}
              placeholder="e.g., Quadratic Equations"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Grade Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.gradeLevel}
              onChange={(e) => updateFormField('gradeLevel', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition"
            >
              <option value="">Select grade level</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => updateFormField('dueDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>
        </div>
      </section>

      {/* ── Question types ───────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Question Types</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total marks: <strong className="text-indigo-600">{totalMarks}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={addNewQuestionType}
            disabled={formData.questionTypes.length >= QUESTION_TYPES.length}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Add Type
          </button>
        </div>

        <div className="space-y-3">
          {formData.questionTypes.map((qt, index) => (
            <QuestionTypeRow
              key={index}
              qt={qt}
              index={index}
              usedTypes={formData.questionTypes.map((q) => q.type)}
              onUpdate={(updated) => updateQuestionType(index, updated)}
              onRemove={() => removeQuestionType(index)}
              canRemove={formData.questionTypes.length > 1}
            />
          ))}
        </div>
      </section>

      {/* ── Additional options ───────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-800">Additional Options</h2>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reference Material <span className="text-slate-400 font-normal">(optional – PDF or text)</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.14 7.84" />
            </svg>
            {fileName ? (
              <p className="text-sm text-indigo-700 font-medium">{fileName}</p>
            ) : (
              <>
                <p className="text-sm text-slate-600">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF or TXT, max 5MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Additional Instructions <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={formData.additionalInstructions}
            onChange={(e) => updateFormField('additionalInstructions', e.target.value)}
            rows={3}
            placeholder="e.g., Focus on real-world application problems. Include a diagram-based question."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none transition"
          />
        </div>
      </section>

      {/* ── Error ────────────────────────────────────────── */}
      {submitError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
          {submitError}
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating Assignment…
          </span>
        ) : (
          '✨ Generate Question Paper'
        )}
      </button>
    </form>
  );
}

// ── Sub-component: single question type row ─────────────────────────────────

interface QuestionTypeRowProps {
  qt: QuestionTypeConfig;
  index: number;
  usedTypes: QuestionTypeName[];
  onUpdate: (qt: QuestionTypeConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function QuestionTypeRow({ qt, usedTypes, onUpdate, onRemove, canRemove }: QuestionTypeRowProps) {
  const availableTypes = QUESTION_TYPES.filter(
    (t) => t === qt.type || !usedTypes.includes(t)
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      {/* Type selector */}
      <select
        value={qt.type}
        onChange={(e) => onUpdate({ ...qt, type: e.target.value as QuestionTypeName })}
        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      >
        {availableTypes.map((t) => (
          <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
        ))}
      </select>

      {/* Count */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-slate-500 whitespace-nowrap">Qty</label>
        <input
          type="number"
          min={1}
          max={50}
          value={qt.count}
          onChange={(e) => onUpdate({ ...qt, count: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-16 px-2 py-2 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      {/* Marks */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-slate-500 whitespace-nowrap">Marks each</label>
        <input
          type="number"
          min={1}
          max={100}
          value={qt.marks}
          onChange={(e) => onUpdate({ ...qt, marks: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-16 px-2 py-2 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      {/* Sub-total */}
      <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap">
        = {qt.count * qt.marks} marks
      </span>

      {/* Remove */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
          title="Remove"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
