'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'My Groups',
    href: '/groups',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'My Library',
    href: '/library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E8ECF0] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E8ECF0]">
        <div className="flex items-center gap-2.5 mb-1">
          {/* VedaAI orange logo icon */}
          <div className="w-8 h-8 rounded-lg bg-[#FF5C35] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-[17px] text-[#1A1A2E] tracking-tight">VedaAI</span>
        </div>
        <span className="inline-block text-[10px] font-semibold text-white bg-[#7C3AED] rounded px-1.5 py-0.5 ml-10">
          Puffyin69
        </span>
      </div>

      {/* Create Assignment CTA */}
      <div className="px-4 py-4">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1A1A2E] text-white text-[13px] font-semibold hover:bg-[#2a2a4e] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Assignment
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-[#F0EDFF] text-[#7C3AED]'
                  : 'text-[#5A6478] hover:bg-[#F4F6F8] hover:text-[#1A1A2E]'
              }`}
            >
              <span className={active ? 'text-[#7C3AED]' : 'text-[#94A3B8]'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="border-t border-[#E8ECF0]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-6 py-3 text-[13px] font-medium text-[#5A6478] hover:bg-[#F4F6F8] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </Link>
        <div className="flex items-center gap-3 px-4 py-3 bg-[#FAFBFC]">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E8ECF0] flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#1A1A2E] truncate">Delhi Public School</p>
            <p className="text-[11px] text-[#94A3B8] truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
