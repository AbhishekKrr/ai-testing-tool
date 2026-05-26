'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

interface SidebarProps {
  activeOverride?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onClose?: () => void;
}

export default function Sidebar({
  activeOverride,
  ctaLabel = 'Create Assignment',
  ctaHref = '/create',
  onClose,
}: SidebarProps) {
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
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: 'My Groups',
      href: '/groups',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
    },
    {
      label: 'My Library',
      href: '/library',
      libraryBadge: assignmentCount > 0 ? assignmentCount : undefined,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
  ];

  const textStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-bricolage)',
    fontWeight: active ? 600 : 400,
    fontSize: '16px',
    lineHeight: '140%',
    letterSpacing: '-0.04em',
    color: active ? '#303030' : 'rgba(94, 94, 94, 0.8)',
  });

  return (
    <aside
      style={{
        width: '304px',
        height: '100%',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Logo row (with close button on mobile) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', order: 99,
              width: '32px', height: '32px', flexShrink: 0,
              background: '#F0F0F0', borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        <div
          style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: 'linear-gradient(180deg, #E56820 0%, #D45E3E 100%)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path d="M2 2 L6.5 15 L11 6 L15.5 15 L20 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-bricolage)',
          fontWeight: 700,
          fontSize: '26px',
          lineHeight: '1',
          letterSpacing: '-0.06em',
          color: '#303030',
        }}>
          VedaAI
        </span>
      </div>

      {/* ── CTA Button ── */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href={ctaHref}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', height: '42px',
            background: '#272727',
            borderRadius: '100px',
            boxShadow: '0px 16px 48px rgba(255,255,255,0.12), 0px 32px 48px rgba(255,255,255,0.2), inset 0px -1px 3.5px rgba(177,177,177,0.6), inset 0px 0px 34.5px rgba(255,255,255,0.25)',
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
            fontSize: '15px',
            color: '#FFFFFF',
            letterSpacing: '-0.04em',
            textDecoration: 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {ctaLabel}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const badge = 'badge' in item ? item.badge : undefined;
          const libraryBadge = 'libraryBadge' in item ? item.libraryBadge : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: active ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ color: active ? '#303030' : 'rgba(94,94,94,0.8)', flexShrink: 0, display: 'flex' }}>
                {item.icon}
              </span>
              <span style={{ ...textStyle(active), flex: 1 }}>
                {item.label}
              </span>
              {/* Assignments — round red badge */}
              {badge !== undefined && (
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#EF4444', color: '#FFFFFF',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {badge > 99 ? '99' : badge}
                </span>
              )}
              {/* My Library — orange rectangle badge (Figma: #FF5623, border-radius: 8px) */}
              {libraryBadge !== undefined && (
                <span style={{
                  height: '20px', borderRadius: '8px',
                  background: '#FF5623',
                  boxShadow: 'inset 0px 0px 32.3px rgba(255,161,10,0.25)',
                  padding: '0px 10px',
                  fontFamily: 'var(--font-bricolage)', fontWeight: 600, fontSize: '14px',
                  letterSpacing: '-0.04em', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {libraryBadge > 99 ? '99+' : libraryBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Settings link */}
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(94,94,94,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 400, fontSize: '16px', lineHeight: '140%', letterSpacing: '-0.04em', color: 'rgba(94,94,94,0.8)' }}>
            Settings
          </span>
        </Link>

        {/* ── School card — Frame 39959: #F0F0F0, border-radius: 16px, padding: 12px ── */}
        <div style={{
          background: '#F0F0F0',
          borderRadius: '16px',
          padding: '12px',
          display: 'flex', flexDirection: 'column', gap: '0px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            {/* Avatar circle — 44×44 with initials */}
            <div style={{
              width: '44px', height: '44px', flexShrink: 0,
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #E56820 0%, #D45E3E 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>D</span>
            </div>
            {/* School info */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: 'var(--font-bricolage)', fontWeight: 700, fontSize: '16px',
                lineHeight: '140%', letterSpacing: '-0.04em', color: '#303030',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                Delhi Public School
              </span>
              <span style={{
                fontFamily: 'var(--font-bricolage)', fontWeight: 400, fontSize: '14px',
                lineHeight: '140%', letterSpacing: '-0.04em', color: '#5E5E5E',
              }}>
                Bokaro Steel City
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
