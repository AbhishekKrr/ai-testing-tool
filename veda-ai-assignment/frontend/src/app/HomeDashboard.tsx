'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  dueDate: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

function StatusPill({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    completed: ['#22C55E', '#F0FDF4'],
    pending: ['#F59E0B', '#FFFBEB'],
    processing: ['#7C3AED', '#F0EDFF'],
    failed: ['#EF4444', '#FFF1F2'],
  };
  const [color, bg] = map[status] ?? map.pending;
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 capitalize" style={{ color, background: bg }}>
      {status}
    </span>
  );
}

export default function HomeDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assignments`);
      if (res.ok) setAssignments(await res.json() as Assignment[]);
    } catch { /* offline */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAssignments(); }, [fetchAssignments]);

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const inProgress = assignments.filter((a) => a.status === 'pending' || a.status === 'processing').length;
  const failed = assignments.filter((a) => a.status === 'failed').length;

  const recent = assignments.slice(0, 5);

  function formatDate(d: string) {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  const stats = [
    { label: 'Total Assignments', value: total, emoji: '📋', color: '#7C3AED', bg: '#F0EDFF' },
    { label: 'Completed', value: completed, emoji: '✅', color: '#22C55E', bg: '#F0FDF4' },
    { label: 'In Progress', value: inProgress, emoji: '⏳', color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Failed', value: failed, emoji: '❌', color: '#EF4444', bg: '#FFF1F2' },
  ];

  return (
    <AppShell breadcrumb="Home">
      <div className="p-6 space-y-6">

        {/* Welcome banner */}
        <div>
          <h1 className="text-[20px] font-bold text-[#1A1A2E]">Good morning, John 👋</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">Here's an overview of your class activity.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E8ECF0] p-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] mb-3"
                style={{ background: s.bg }}
              >
                {s.emoji}
              </div>
              <p className="text-[26px] font-bold text-[#1A1A2E] leading-none">
                {loading ? '–' : s.value}
              </p>
              <p className="text-[12px] text-[#94A3B8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent assignments */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8ECF0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8ECF0]">
              <h2 className="text-[14px] font-bold text-[#1A1A2E]">Recent Assignments</h2>
              <Link href="/assignments" className="text-[12px] text-[#7C3AED] font-semibold hover:underline">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <p className="text-[13px] font-semibold text-[#1A1A2E]">No assignments yet</p>
                <p className="text-[12px] text-[#94A3B8]">Create your first assignment to get started.</p>
                <Link href="/create" className="mt-2 text-[12px] text-[#7C3AED] font-semibold hover:underline">
                  Create Assignment →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F6F8]">
                {recent.map((a) => (
                  <Link
                    key={a._id}
                    href={`/results/${a._id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFBFC] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F0EDFF] flex-shrink-0 flex items-center justify-center">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#1A1A2E] truncate group-hover:text-[#7C3AED] transition-colors">
                          {a.title || 'Untitled Assignment'}
                        </p>
                        <p className="text-[11px] text-[#94A3B8]">Due {formatDate(a.dueDate)}</p>
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar widgets */}
          <div className="space-y-4">

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-[#E8ECF0] p-4">
              <h2 className="text-[13px] font-bold text-[#1A1A2E] mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/create"
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg bg-[#1A1A2E] text-white text-[12px] font-semibold hover:bg-[#2a2a4e] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create Assignment
                </Link>
                <Link
                  href="/assignments"
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border border-[#E8ECF0] text-[#5A6478] text-[12px] font-medium hover:bg-[#F4F6F8] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  All Assignments
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border border-[#E8ECF0] text-[#5A6478] text-[12px] font-medium hover:bg-[#F4F6F8] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  My Library
                </Link>
                <Link
                  href="/groups"
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border border-[#E8ECF0] text-[#5A6478] text-[12px] font-medium hover:bg-[#F4F6F8] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  My Groups
                </Link>
              </div>
            </div>

            {/* AI tip card */}
            <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-xl p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Pro Tip</p>
              <h3 className="text-[13px] font-bold mb-2">Upload Study Material</h3>
              <p className="text-[11px] opacity-75 leading-relaxed mb-3">
                Attach a PDF when creating assignments — AI generates context-aware questions from your material.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-white/90 hover:text-white underline underline-offset-2"
              >
                Try it now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
