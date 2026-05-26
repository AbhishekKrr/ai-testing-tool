'use client';

import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
  topRight?: React.ReactNode;
  activeNavOverride?: string;
  sidebarCtaLabel?: string;
  sidebarCtaHref?: string;
}

export default function AppShell({
  children,
  breadcrumb = 'Assignment',
  topRight,
  activeNavOverride,
  sidebarCtaLabel,
  sidebarCtaHref,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5]">
      <Sidebar
        activeOverride={activeNavOverride}
        ctaLabel={sidebarCtaLabel}
        ctaHref={sidebarCtaHref}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar — matches Figma header exactly */}
        <header className="flex items-center justify-between h-[52px] px-6 bg-white border-b border-[#E8ECF0] flex-shrink-0 no-print">
          {/* Left: back arrow + breadcrumb */}
          <div className="flex items-center gap-2 text-[#5A6478]">
            <button className="hover:text-[#1A1A2E] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <div className="flex items-center gap-1.5 text-[13px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94A3B8]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="font-medium text-[#1A1A2E]">{breadcrumb}</span>
            </div>
          </div>

          {/* Right: extra actions + bell + user */}
          <div className="flex items-center gap-2">
            {topRight}

            {/* Notification bell with red dot */}
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5A6478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] border border-white" />
            </button>

            {/* User avatar with dropdown */}
            <button className="flex items-center gap-2 hover:bg-[#F4F6F8] rounded-lg px-2 py-1 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#F4642A] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                J
              </div>
              <span className="text-[13px] font-medium text-[#1A1A2E]">John Doe</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
