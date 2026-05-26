'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  status: string;
  createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
const TABS = ['All', 'Completed', 'In Progress', 'Failed'] as const;

function StatusDot({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    completed: ['#22C55E', '#F0FDF4'],
    pending: ['#F59E0B', '#FFFBEB'],
    processing: ['#7C3AED', '#F0EDFF'],
    failed: ['#EF4444', '#FFF1F2'],
  };
  const [color, bg] = map[status] ?? map.pending;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
      style={{ color, background: bg }}
    >
      {status}
    </span>
  );
}

export default function LibraryClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All');
  const [search, setSearch] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assignments`);
      if (res.ok) setAssignments(await res.json() as Assignment[]);
    } catch { /* offline */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter((a) => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Completed' && a.status === 'completed') ||
      (activeTab === 'In Progress' && (a.status === 'pending' || a.status === 'processing')) ||
      (activeTab === 'Failed' && a.status === 'failed');
    const matchesSearch =
      (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.subject || '').toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function formatDate(d: string) {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  return (
    <AppShell breadcrumb="My Library">
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <h1 className="text-[18px] font-bold text-[#1A1A2E]">My Library</h1>
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1A2E] text-white text-[12px] font-semibold hover:bg-[#2a2a4e] transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Assignment
          </Link>
        </div>
        <p className="text-[13px] text-[#94A3B8] mb-5">All your generated question papers in one place.</p>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#F4F6F8] p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-[#1A1A2E] shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#5A6478]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-56">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search papers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8ECF0] rounded-lg text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#F4F6F8] flex items-center justify-center mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-[#1A1A2E]">No papers here</p>
            <p className="text-[12px] text-[#94A3B8]">Your generated question papers will appear here.</p>
            <Link href="/create" className="mt-2 text-[12px] text-[#7C3AED] font-bold hover:underline">
              Create your first →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <Link
                key={a._id}
                href={`/results/${a._id}`}
                className="bg-white rounded-xl border border-[#E8ECF0] p-5 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#F0EDFF] flex-shrink-0 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-bold text-[#1A1A2E] leading-snug group-hover:text-[#7C3AED] transition-colors line-clamp-2">
                      {a.title || 'Untitled Assignment'}
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      {a.subject || 'General'}{a.gradeLevel ? ` · ${a.gradeLevel}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#94A3B8]">{formatDate(a.createdAt)}</span>
                  <StatusDot status={a.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
