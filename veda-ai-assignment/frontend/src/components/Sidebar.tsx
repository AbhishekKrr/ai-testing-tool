'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

interface SidebarProps {
  activeOverride?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Sidebar({ activeOverride, ctaLabel = 'Create Assignment', ctaHref = '/create' }: SidebarProps) {
  const pathname = usePathname();
  const [assignmentCount, setAssignmentCount] = useState<number>(0);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/assignments`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: unknown[]) => setAssignmentCount(data.length))
      .catch(() => {});
  }, []);

  function isActive(href: string) {
    if (activeOverride) return href === activeOverride;
    if (href === '/home') return pathname === '/';
    return pathname.startsWith(href);
  }

  const navItems = [
    {
      label: 'Home',
      href: '/home',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: 'My Groups',
      href: '/groups',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: 'Assignments',
      href: '/assignments',
      badge: assignmentCount > 0 ? assignmentCount : undefined,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      label: "AI Teacher's Toolkit",
      href: '/toolkit',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      label: 'My Library',
      href: '/library',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[200px] flex-shrink-0 bg-white border-r border-[#E8ECF0] flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1.5">
          {/* VedaAI icon — orange rounded square with white W/book shape */}
          <div className="w-8 h-8 rounded-lg bg-[#F4642A] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {/* Stylised double-V / open book — two white triangles */}
              <path d="M5 7 L9 17 L12 11 L15 17 L19 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="font-bold text-[16px] text-[#1A1A2E] tracking-tight">VedaAI</span>
        </div>
        {/* Puffyin69 badge */}
        <div className="ml-10">
          <span className="inline-block text-[9px] font-bold text-white bg-[#7C3AED] rounded-sm px-1.5 py-[2px] leading-none tracking-wide uppercase">
            Puffyin69
          </span>
        </div>
      </div>

      {/* ── CTA button ── */}
      <div className="px-3 pb-3">
        <Link
          href={ctaHref}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full bg-[#1A1A2E] text-white text-[12px] font-semibold hover:bg-[#2a2a4e] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {ctaLabel}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const badge = 'badge' in item ? item.badge : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-[#F0EDFF] text-[#7C3AED]'
                  : 'text-[#5A6478] hover:bg-[#F4F6F8] hover:text-[#1A1A2E]'
              }`}
            >
              <span className={`flex-shrink-0 ${active ? 'text-[#7C3AED]' : 'text-[#94A3B8]'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {badge !== undefined && (
                <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
                  {badge > 99 ? '99' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div className="border-t border-[#E8ECF0]">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-5 py-3 text-[13px] font-medium text-[#5A6478] hover:bg-[#F4F6F8] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-3 bg-[#FAFBFC]">
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#F4642A] to-[#e05520] flex items-center justify-center text-white text-[11px] font-bold">
              D
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#1A1A2E] truncate">Delhi Public School</p>
            <p className="text-[10px] text-[#94A3B8] truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
