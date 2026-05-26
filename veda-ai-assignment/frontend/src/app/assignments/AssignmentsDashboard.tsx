'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  dueDate: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export default function AssignmentsDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assignments`);
      if (res.ok) {
        const data = await res.json() as Assignment[];
        setAssignments(data);
      }
    } catch {
      // Backend offline — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAssignments(); }, [fetchAssignments]);

  // Close context menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleDelete(id: string) {
    setActiveMenu(null);
    try {
      await fetch(`${BACKEND_URL}/api/assignments/${id}`, { method: 'DELETE' });
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch { /* noop */ }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '-');
    } catch { return dateStr; }
  }

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = !loading && filtered.length === 0 && searchQuery === '';

  return (
    <AppShell breadcrumb="Assignment">
      <div className="p-6 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          /* ── EMPTY STATE ─────────────────────────────────────────────── */
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center max-w-sm">
              {/* Illustration — matches Figma sketch style */}
              <div className="relative w-52 h-48 mx-auto mb-6 flex items-center justify-center">
                <svg width="210" height="190" viewBox="0 0 210 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Back document (rotated, sketch style) */}
                  <rect x="30" y="18" width="72" height="90" rx="6" stroke="#CBD5E1" strokeWidth="1.5" fill="white" transform="rotate(-8 30 18)"/>
                  {/* Lines on back doc */}
                  <line x1="38" y1="42" x2="76" y2="38" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 38 42)"/>
                  <line x1="38" y1="52" x2="68" y2="49" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 38 52)"/>
                  {/* Front document */}
                  <rect x="52" y="10" width="74" height="96" rx="6" stroke="#CBD5E1" strokeWidth="1.5" fill="white"/>
                  {/* Lines on front doc */}
                  <line x1="62" y1="28" x2="116" y2="28" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="62" y1="38" x2="108" y2="38" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="62" y1="48" x2="112" y2="48" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="62" y1="58" x2="100" y2="58" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  {/* Pencil / pen sketch stroke in top-left */}
                  <path d="M18 30 Q22 22 28 28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <line x1="16" y1="32" x2="20" y2="28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>

                  {/* Big magnifier */}
                  <circle cx="118" cy="118" r="46" stroke="#C4C9D4" strokeWidth="3" fill="white"/>
                  {/* Magnifier handle */}
                  <line x1="154" y1="154" x2="176" y2="176" stroke="#C4C9D4" strokeWidth="5" strokeLinecap="round"/>
                  {/* Red X inside magnifier */}
                  <line x1="100" y1="100" x2="136" y2="136" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="136" y1="100" x2="100" y2="136" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>

                  {/* Sparkle dots */}
                  <path d="M168 30 L170 24 L172 30 L178 32 L172 34 L170 40 L168 34 L162 32 Z" fill="#F59E0B" opacity="0.8"/>
                  <circle cx="30" cy="148" r="3" fill="#94C5F8" opacity="0.7"/>
                  <circle cx="185" cy="80" r="3.5" fill="#94A3B8" opacity="0.5"/>
                  <path d="M50 160 L51.5 155 L53 160 L58 161.5 L53 163 L51.5 168 L50 163 L45 161.5 Z" fill="#F59E0B" opacity="0.6" transform="scale(0.6) translate(38 105)"/>
                </svg>
              </div>

              <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-2">No assignments yet</h2>
              <p className="text-[13px] text-[#94A3B8] leading-relaxed mb-6">
                Create your first assignment to start collecting and grading student
                submissions. You can set up rubrics, define marking criteria, and let AI
                assist with grading.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-[13px] font-semibold hover:bg-[#2a2a4e] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Your First Assignment
              </Link>
            </div>
          </div>
        ) : (
          /* ── FILLED STATE ────────────────────────────────────────────── */
          <div>
            {/* Page header */}
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[18px] font-bold text-[#1A1A2E]">Assignments</h1>
              {assignments.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#22C55E] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {Math.min(assignments.length, 99)}
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#94A3B8] mb-5">
              Manage and create assignments for your classes.
            </p>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-4">
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#5A6478] border border-[#E8ECF0] rounded-lg px-3 py-2 hover:bg-[#F4F6F8] transition-colors bg-white">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter By
              </button>
              <div className="relative flex-1 max-w-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8ECF0] rounded-lg text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* Grid of cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" ref={menuRef}>
              {filtered.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  isMenuOpen={activeMenu === assignment._id}
                  onMenuToggle={(id) => setActiveMenu((prev) => (prev === id ? null : id))}
                  onView={() => {
                    setActiveMenu(null);
                    router.push(`/results/${assignment._id}`);
                  }}
                  onDelete={() => void handleDelete(assignment._id)}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* No search results */}
            {filtered.length === 0 && searchQuery && (
              <div className="text-center py-16 text-[#94A3B8] text-[14px]">
                No assignments match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}

        {/* Floating Create button (filled state) */}
        {!isEmpty && !loading && (
          <Link
            href="/create"
            className="fixed bottom-8 left-1/2 -translate-x-1/2 ml-[120px] flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A2E] text-white text-[13px] font-semibold shadow-lg hover:bg-[#2a2a4e] transition-all hover:shadow-xl no-print"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Assignment
          </Link>
        )}
      </div>
    </AppShell>
  );
}

// ── Assignment Card ─────────────────────────────────────────────────────────

interface CardProps {
  assignment: Assignment;
  isMenuOpen: boolean;
  onMenuToggle: (id: string) => void;
  onView: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
}

function AssignmentCard({ assignment, isMenuOpen, onMenuToggle, onView, onDelete, formatDate }: CardProps) {
  return (
    <div className="relative bg-white rounded-xl border border-[#E8ECF0] p-5 hover:shadow-sm transition-all cursor-pointer group" onClick={onView}>
      {/* Title + three-dot */}
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-[14px] font-bold text-[#1A1A2E] line-clamp-2 flex-1 pr-2 leading-snug">
          {assignment.title}
        </h3>
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMenuToggle(assignment._id)}
            className="w-7 h-7 flex items-center justify-center text-[#94A3B8] hover:text-[#5A6478] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-50 w-40 bg-white rounded-xl border border-[#E8ECF0] shadow-lg py-1 overflow-hidden">
              <button
                onClick={() => { onMenuToggle(assignment._id); onView(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1A1A2E] hover:bg-[#F4F6F8] transition-colors text-left"
              >
                View Assignment
              </button>
              <div className="h-px bg-[#F4F6F8] mx-3" />
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#EF4444] hover:bg-red-50 transition-colors text-left"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom date row — matches Figma "Assigned on · date   Due · date" */}
      <div className="flex items-center justify-between text-[12px] text-[#94A3B8]">
        <span><span className="font-semibold text-[#5A6478]">Assigned on</span> · {formatDate(assignment.createdAt)}</span>
        <span><span className="font-semibold text-[#5A6478]">Due</span> · {formatDate(assignment.dueDate)}</span>
      </div>
    </div>
  );
}
