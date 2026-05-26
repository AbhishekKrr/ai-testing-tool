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
        <path d="M12 2a1 1 0 0 1 .894.553l2.447 4.9 5.406.785a1 1 0 0 1 .554 1.705l-3.91 3.81.923 5.382a1 1 0 0 1-1.45 1.054L12 17.77l-4.864 2.56a1 1 0 0 1-1.45-1.054l.922-5.382-3.91-3.81a1 1 0 0 1 .554-1.705l5.406-.785L11.106 2.553A1 1 0 0 1 12 2z"/>
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

interface SidebarProps {
  /** Override the active nav item (e.g. '/toolkit' on output page) */
  activeOverride?: string;
  /** Override the CTA button label and href */
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Sidebar({ activeOverride, ctaLabel = 'Create Assignment', ctaHref = '/create' }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (activeOverride) return href === activeOverride;
    if (href === '/home') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E8ECF0] flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5 mb-2">
          {/* VedaAI icon — open-book / V shape on orange */}
          <div className="w-8 h-8 rounded-lg bg-[#FF5C35] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {/* Stylised open book: two pages fanned out */}
              <path d="M12 5 L5 9 L5 19 L12 15 L12 5Z"  fill="white" opacity="0.9"/>
              <path d="M12 5 L19 9 L19 19 L12 15 L12 5Z" fill="white" opacity="0.65"/>
            </svg>
          </div>
          <span className="font-bold text-[17px] text-[#1A1A2E] tracking-tight">VedaAI</span>
        </div>
        {/* Badge */}
        <div className="ml-[42px]">
          <span className="inline-block text-[9px] font-bold text-white bg-[#7C3AED] rounded px-1.5 py-[2px] leading-none tracking-wide">
            Puffyin69
          </span>
        </div>
      </div>

      {/* ── CTA button ── */}
      <div className="px-4 pb-3">
        <Link
          href={ctaHref}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-[10px] bg-[#1A1A2E] text-white text-[13px] font-semibold hover:bg-[#2a2a4e] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {ctaLabel}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
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

      {/* ── Bottom: Settings + User ── */}
      <div className="border-t border-[#E8ECF0]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-5 py-3 text-[13px] font-medium text-[#5A6478] hover:bg-[#F4F6F8] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </Link>
        <div className="flex items-center gap-3 px-4 py-3 bg-[#FAFBFC]">
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-[12px] font-bold">
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
