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
              {/* Illustration */}
              <div className="relative w-44 h-44 mx-auto mb-6">
                {/* Decorative sparkles */}
                <div className="absolute top-1 left-6 text-[#F59E0B] text-xl font-bold select-none">✦</div>
                <div className="absolute bottom-3 right-3 text-[#F59E0B] text-xs select-none">✦</div>
                <div className="absolute top-8 right-8 text-[#F59E0B] text-[10px] select-none">✦</div>
                {/* Main illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Document stack — back */}
                    <div className="w-28 h-36 bg-white rounded-xl shadow border border-[#E8ECF0] absolute -top-2 -left-2 rotate-[-7deg]" />
                    {/* Document — front */}
                    <div className="w-28 h-36 bg-white rounded-xl shadow border border-[#E8ECF0] relative z-10 flex flex-col gap-2 p-4 pt-5">
                      <div className="w-16 h-2 bg-[#E8ECF0] rounded-full" />
                      <div className="w-12 h-2 bg-[#E8ECF0] rounded-full" />
                      <div className="w-14 h-2 bg-[#E8ECF0] rounded-full" />
                    </div>
                    {/* Magnifier with red X */}
                    <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-white rounded-full border-2 border-[#E8ECF0] shadow-md flex items-center justify-center z-20">
                      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                        <circle cx="14" cy="14" r="9" stroke="#D1D5DB" strokeWidth="2.5"/>
                        <line x1="21" y1="21" x2="27" y2="27" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round"/>
                        <line x1="10" y1="10" x2="18" y2="18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
                        <line x1="18" y1="10" x2="10" y2="18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
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
    <div className="relative bg-white rounded-xl border border-[#E8ECF0] p-5 hover:border-[#C4B5FD]/60 hover:shadow-sm transition-all cursor-pointer" onClick={onView}>
      {/* Title row */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-[#1A1A2E] line-clamp-2 flex-1 pr-2 leading-snug">
          {assignment.title}
        </h3>
        {/* Three-dot menu */}
        <div
          className="relative flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onMenuToggle(assignment._id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-[#94A3B8]">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-50 w-40 bg-white rounded-xl border border-[#E8ECF0] shadow-lg py-1 overflow-hidden">
              <button
                onClick={() => { onMenuToggle(assignment._id); onView(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1A1A2E] hover:bg-[#F4F6F8] transition-colors text-left"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View Assignment
              </button>
              <div className="h-px bg-[#F4F6F8] mx-3" />
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#EF4444] hover:bg-red-50 transition-colors text-left"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty middle space (matches Figma minimal layout) */}
      <div className="flex-1" />

      {/* Date row */}
      <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-3 border-t border-[#F4F6F8] mt-4">
        <span>Assigned on · <span className="font-medium text-[#5A6478]">{formatDate(assignment.createdAt)}</span></span>
        <span>Due · <span className="font-medium text-[#5A6478]">{formatDate(assignment.dueDate)}</span></span>
      </div>
    </div>
  );
}
