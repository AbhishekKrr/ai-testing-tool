'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';

const GROUPS = [
  { id: '1', name: 'Class 10 – A', subject: 'Science', students: 32, grade: '10th', color: '#7C3AED', bg: '#F0EDFF' },
  { id: '2', name: 'Class 10 – B', subject: 'Commerce', students: 30, grade: '10th', color: '#3B82F6', bg: '#EFF6FF' },
  { id: '3', name: 'Class 11 – A', subject: 'Science', students: 28, grade: '11th', color: '#22C55E', bg: '#F0FDF4' },
  { id: '4', name: 'Class 11 – B', subject: 'Humanities', students: 25, grade: '11th', color: '#F59E0B', bg: '#FFFBEB' },
  { id: '5', name: 'Class 12 – A', subject: 'Science', students: 30, grade: '12th', color: '#F4642A', bg: '#FFF4EF' },
  { id: '6', name: 'Class 12 – B', subject: 'Commerce', students: 27, grade: '12th', color: '#EF4444', bg: '#FFF1F2' },
];

export default function GroupsClient() {
  const [search, setSearch] = useState('');
  const totalStudents = GROUPS.reduce((s, g) => s + g.students, 0);

  const filtered = GROUPS.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell breadcrumb="My Groups">
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <h1 className="text-[18px] font-bold text-[#1A1A2E]">My Groups</h1>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1A2E] text-white text-[12px] font-semibold hover:bg-[#2a2a4e] transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Group
          </button>
        </div>
        <p className="text-[13px] text-[#94A3B8] mb-5">
          {GROUPS.length} groups · {totalStudents} students total
        </p>

        {/* Search */}
        <div className="relative max-w-xs mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search groups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8ECF0] rounded-lg text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-[#E8ECF0] p-5 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: g.bg }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={g.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: g.color, background: g.bg }}
                >
                  {g.grade}
                </span>
              </div>

              <h3 className="text-[14px] font-bold text-[#1A1A2E] mb-1 group-hover:text-[#7C3AED] transition-colors">
                {g.name}
              </h3>
              <p className="text-[12px] text-[#94A3B8] mb-4">{g.subject}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  <span className="text-[12px] text-[#5A6478] font-medium">{g.students} students</span>
                </div>
                <button
                  className="text-[12px] font-semibold hover:underline"
                  style={{ color: g.color }}
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[14px] text-[#94A3B8]">
            No groups match &quot;{search}&quot;
          </div>
        )}
      </div>
    </AppShell>
  );
}
