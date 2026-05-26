'use client';

import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
  topRight?: React.ReactNode;
  activeNavOverride?: string;
  sidebarCtaLabel?: string;
  sidebarCtaHref?: string;
}

const FONT = 'var(--font-bricolage)';

export default function AppShell({
  children,
  breadcrumb = 'Assignment',
  topRight,
  activeNavOverride,
  sidebarCtaLabel,
  sidebarCtaHref,
}: AppShellProps) {
  const router = useRouter();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #EEEEEE 0%, #DADADA 100%)' }}
    >
      {/* ── Floating sidebar — 12px gap from edges ── */}
      <div className="no-print" style={{ padding: '12px 0 12px 12px', flexShrink: 0 }}>
        <Sidebar
          activeOverride={activeNavOverride}
          ctaLabel={sidebarCtaLabel}
          ctaHref={sidebarCtaHref}
        />
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ padding: '12px 12px 0 12px' }}
      >
        {/* ── Floating header pill ── */}
        <header
          className="no-print"
          style={{
            height: '56px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px 0 24px',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '16px',
          }}
        >
          {/* Back button — white circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '40px', height: '40px' }}>
            <button
              onClick={() => router.back()}
              style={{
                width: '40px', height: '40px', flexShrink: 0,
                background: '#FFFFFF',
                borderRadius: '100px',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {/* Arrow left — #303030 */}
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#303030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Breadcrumb — flex-grow: 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {/* Grid / dashboard icon (4 squares, color: #A9A9A9) */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2"  y="2"  width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
              <rect x="12" y="2"  width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
              <rect x="2"  y="12" width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
              <rect x="12" y="12" width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
            </svg>

            <span style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '19px',
              letterSpacing: '-0.04em',
              color: '#A9A9A9',
            }}>
              {breadcrumb}
            </span>
          </div>

          {/* Extra slot */}
          {topRight}

          {/* Bell — #F6F6F6 circle, 36×36 */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button style={{
              width: '36px', height: '36px',
              background: '#F6F6F6',
              borderRadius: '100px',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            {/* Red dot — #FF5623, top:1px left:27px from button origin */}
            <span style={{
              position: 'absolute',
              width: '8px', height: '8px',
              background: '#FF5623',
              borderRadius: '50%',
              top: '1px', left: '27px',
            }} />
          </div>

          {/* User button — white card with drop-shadow */}
          <button
            style={{
              display: 'flex', alignItems: 'center',
              padding: '6px 12px',
              gap: '8px',
              width: '157px', height: '44px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: 'none', cursor: 'pointer',
              filter: 'drop-shadow(0px 16px 48px rgba(0,0,0,0.12)) drop-shadow(0px 32px 48px rgba(0,0,0,0.2))',
              flexShrink: 0,
            }}
          >
            {/* Avatar — #F6F6F6 circle */}
            <div style={{
              width: '32px', height: '32px', flexShrink: 0,
              background: '#F6F6F6',
              borderRadius: '100px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '12px', color: '#303030' }}>J</span>
            </div>

            {/* Name + chevron */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
              <span style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '19px',
                letterSpacing: '-0.04em',
                color: '#303030',
              }}>
                John Doe
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polyline points="6 9 12 15 18 9" stroke="#303030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </header>

        {/* ── Scrollable page content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
