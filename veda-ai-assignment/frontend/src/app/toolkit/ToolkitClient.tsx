'use client';

import Link from 'next/link';
import AppShell from '@/components/AppShell';

const TOOLS = [
  {
    id: 'assessment',
    name: 'Assessment Creator',
    description: 'Generate structured AI-powered question papers from your curriculum material. Supports MCQs, short answers, long answers, and more.',
    emoji: '📝',
    color: '#7C3AED',
    bg: '#F0EDFF',
    available: true,
    href: '/create',
    badge: 'Active',
    badgeColor: '#22C55E',
    badgeBg: '#F0FDF4',
  },
  {
    id: 'lesson',
    name: 'Lesson Planner',
    description: 'Create structured, curriculum-aligned lesson plans with learning objectives, activities, and assessments.',
    emoji: '📖',
    color: '#3B82F6',
    bg: '#EFF6FF',
    available: false,
  },
  {
    id: 'rubric',
    name: 'Rubric Builder',
    description: 'Design detailed grading rubrics for consistent and transparent student evaluation.',
    emoji: '✅',
    color: '#22C55E',
    bg: '#F0FDF4',
    available: false,
  },
  {
    id: 'quiz',
    name: 'Quiz Generator',
    description: 'Instantly create engaging quizzes and MCQ sets for in-class or online assessments.',
    emoji: '🧩',
    color: '#F59E0B',
    bg: '#FFFBEB',
    available: false,
  },
  {
    id: 'feedback',
    name: 'Feedback Generator',
    description: 'Auto-generate personalised, constructive feedback for student submissions at scale.',
    emoji: '💬',
    color: '#F4642A',
    bg: '#FFF4EF',
    available: false,
  },
  {
    id: 'study',
    name: 'Study Material Creator',
    description: 'Turn any content into summaries, revision notes, and study guides for students.',
    emoji: '📚',
    color: '#EF4444',
    bg: '#FFF1F2',
    available: false,
  },
];

export default function ToolkitClient() {
  return (
    <AppShell breadcrumb="AI Teacher's Toolkit">
      <div className="p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[18px] font-bold text-[#1A1A2E]">AI Teacher's Toolkit</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">
            Powerful AI tools designed to save time and elevate your teaching.
          </p>
        </div>

        {/* Featured tool banner */}
        <div className="bg-gradient-to-r from-[#1A1A2E] to-[#2d1b69] rounded-xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-[#F0EDFF] px-2 py-0.5 rounded-full">
              Now Available
            </span>
            <h2 className="text-[16px] font-bold text-white mt-2 mb-1">Assessment Creator</h2>
            <p className="text-[12px] text-white/60 max-w-md leading-relaxed">
              Upload a PDF or describe your topic — our AI generates a full, structured question paper in seconds.
            </p>
          </div>
          <Link
            href="/create"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1A1A2E] text-[12px] font-bold hover:bg-[#F4F6F8] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Now
          </Link>
        </div>

        {/* Tools grid */}
        <h2 className="text-[13px] font-bold text-[#5A6478] mb-3 uppercase tracking-wider">All Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className={`bg-white rounded-xl border border-[#E8ECF0] p-5 flex flex-col transition-all ${
                tool.available ? 'hover:shadow-md hover:border-[#D1C4E9]' : 'opacity-60'
              }`}
            >
              {/* Icon + badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px]"
                  style={{ background: tool.bg }}
                >
                  {tool.emoji}
                </div>
                {tool.available ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#22C55E]">
                    Available
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F6F8] text-[#94A3B8]">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Text */}
              <h3 className="text-[14px] font-bold text-[#1A1A2E] mb-1.5">{tool.name}</h3>
              <p className="text-[12px] text-[#94A3B8] leading-relaxed flex-1 mb-4">{tool.description}</p>

              {/* CTA */}
              {tool.available && tool.href ? (
                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-1 text-[12px] font-bold hover:underline"
                  style={{ color: tool.color }}
                >
                  Get Started →
                </Link>
              ) : (
                <button className="inline-flex items-center gap-1 text-[12px] text-[#CBD5E1] font-medium cursor-not-allowed">
                  Notify me when ready
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
