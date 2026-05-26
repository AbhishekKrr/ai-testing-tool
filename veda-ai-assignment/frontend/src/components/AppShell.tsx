'use client';

import { useState } from 'react';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #EEEEEE 0%, #DADADA 100%)' }}
    >
      {/* ── Sidebar — desktop only ── */}
      <div className="no-print sidebar-wrapper" style={{ padding: '12px 0 12px 12px', flexShrink: 0 }}>
        <Sidebar
          activeOverride={activeNavOverride}
          ctaLabel={sidebarCtaLabel}
          ctaHref={sidebarCtaHref}
        />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 no-print"
          style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{ padding: '12px', height: '100%', width: '304px' }}
            onClick={e => e.stopPropagation()}
          >
            <Sidebar
              activeOverride={activeNavOverride}
              ctaLabel={sidebarCtaLabel}
              ctaHref={sidebarCtaHref}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Right panel ── */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ padding: '12px 12px 0 12px' }}
      >
        {/* ── Header ── */}
        <header
          className="no-print"
          style={{
            height: '56px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px 0 12px',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '16px',
          }}
        >
          {/* Hamburger — mobile only */}
          <button
            className="mobile-hamburger"
            onClick={() => setDrawerOpen(true)}
            style={{
              width: '40px', height: '40px', flexShrink: 0,
              background: '#FFFFFF',
              borderRadius: '100px',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Back button — desktop only */}
          <button
            className="desktop-back"
            onClick={() => router.back()}
            style={{
              width: '40px', height: '40px', flexShrink: 0,
              background: '#FFFFFF',
              borderRadius: '100px',
              border: 'none', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#303030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2"  y="2"  width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
              <rect x="12" y="2"  width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
              <rect x="2"  y="12" width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
              <rect x="12" y="12" width="6" height="6" rx="0.5" stroke="#A9A9A9" strokeWidth="2"/>
            </svg>
            <span style={{
              fontFamily: FONT, fontWeight: 600, fontSize: '16px',
              letterSpacing: '-0.04em', color: '#A9A9A9',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {breadcrumb}
            </span>
          </div>

          {topRight}

          {/* Bell */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button style={{
              width: '36px', height: '36px',
              background: '#F6F6F6', borderRadius: '100px',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <span style={{
              position: 'absolute', width: '8px', height: '8px',
              background: '#FF5623', borderRadius: '50%',
              top: '1px', left: '22px',
            }} />
          </div>

          {/* User pill — desktop only */}
          <button
            className="desktop-user"
            style={{
              alignItems: 'center',
              padding: '6px 12px', gap: '8px',
              width: '157px', height: '44px',
              background: '#FFFFFF', borderRadius: '12px',
              border: 'none', cursor: 'pointer',
              filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.1))',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: '32px', height: '32px', flexShrink: 0,
              background: '#F6F6F6', borderRadius: '100px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '12px', color: '#303030' }}>J</span>
            </div>
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: '15px', letterSpacing: '-0.04em', color: '#303030', flex: 1, textAlign: 'left' }}>
              John Doe
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline points="6 9 12 15 18 9" stroke="#303030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        {/* ── Scrollable content — adds bottom padding on mobile for bottom nav ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Bottom nav — mobile only ── */}
      <nav
        className="bottom-nav-bar no-print"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#FFFFFF',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
          zIndex: 30,
        }}
      >
        {[
          { href: '/', label: 'Home', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { href: '/assignments', label: 'Assignments', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
          { href: '/create', label: 'Create', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>, primary: true },
          { href: '/toolkit', label: 'Toolkit', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
          { href: '/library', label: 'Library', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: item.primary ? '#FFFFFF' : '#5E5E5E',
              fontSize: '10px',
              fontFamily: FONT,
              fontWeight: 500,
            }}
          >
            {item.primary ? (
              <div style={{
                width: '44px', height: '44px',
                background: '#272727',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2px',
              }}>
                {item.icon}
              </div>
            ) : (
              <>
                {item.icon}
                <span>{item.label}</span>
              </>
            )}
          </a>
        ))}
      </nav>
    </div>
  );
}
