'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  dueDate: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
const FONT = 'var(--font-bricolage)';

export default function AssignmentsDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assignments`);
      if (res.ok) {
        const data = await res.json() as Assignment[];
        setAssignments(data);
      }
    } catch {
      // Backend offline — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAssignments(); }, [fetchAssignments]);

  // Close context menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleDelete(id: string) {
    setActiveMenu(null);
    try {
      await fetch(`${BACKEND_URL}/api/assignments/${id}`, { method: 'DELETE' });
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch { /* noop */ }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '-');
    } catch { return dateStr; }
  }

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = !loading && filtered.length === 0 && searchQuery === '';

  return (
    <AppShell breadcrumb="Assignment">
      {/* ── keyframes for spinner ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ padding: '21px 0 0 0', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {loading ? (
          /* ── LOADING ── */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div style={{
              width: '32px', height: '32px',
              border: '2px solid #303030', borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>

        ) : isEmpty ? (
          /* ── EMPTY STATE ── */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              {/* Illustration */}
              <div style={{ width: '210px', height: '190px', margin: '0 auto 24px' }}>
                <svg width="210" height="190" viewBox="0 0 210 190" fill="none">
                  <rect x="30" y="18" width="72" height="90" rx="6" stroke="#CBD5E1" strokeWidth="1.5" fill="white" transform="rotate(-8 30 18)"/>
                  <line x1="38" y1="42" x2="76" y2="38" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 38 42)"/>
                  <line x1="38" y1="52" x2="68" y2="49" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 38 52)"/>
                  <rect x="52" y="10" width="74" height="96" rx="6" stroke="#CBD5E1" strokeWidth="1.5" fill="white"/>
                  <line x1="62" y1="28" x2="116" y2="28" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="62" y1="38" x2="108" y2="38" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="62" y1="48" x2="112" y2="48" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="62" y1="58" x2="100" y2="58" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="118" cy="118" r="46" stroke="#C4C9D4" strokeWidth="3" fill="white"/>
                  <line x1="154" y1="154" x2="176" y2="176" stroke="#C4C9D4" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="100" y1="100" x2="136" y2="136" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="136" y1="100" x2="100" y2="136" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M168 30 L170 24 L172 30 L178 32 L172 34 L170 40 L168 34 L162 32 Z" fill="#F59E0B" opacity="0.8"/>
                  <circle cx="30" cy="148" r="3" fill="#94C5F8" opacity="0.7"/>
                </svg>
              </div>

              <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: '20px', lineHeight: '140%', letterSpacing: '-0.04em', color: '#303030', margin: '0 0 8px' }}>
                No assignments yet
              </h2>
              <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.04em', color: 'rgba(94,94,94,0.55)', margin: '0 0 24px' }}>
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              <Link
                href="/create"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 24px',
                  background: '#272727',
                  borderRadius: '48px',
                  fontFamily: FONT, fontWeight: 500, fontSize: '16px', letterSpacing: '-0.04em',
                  color: '#FFFFFF', textDecoration: 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Your First Assignment
              </Link>
            </div>
          </div>

        ) : (
          /* ── FILLED STATE ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>

            {/* ── Header row ── */}
            <div style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center',
              padding: '0px 8px', gap: '16px', height: '50px', flexShrink: 0,
            }}>
              {/* Green dot + text block */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                {/* Ellipse 10 — green dot */}
                <div style={{
                  width: '12px', height: '12px', flexShrink: 0,
                  background: '#4BC26D',
                  border: '4px solid rgba(75,194,109,0.4)',
                  borderRadius: '50%',
                }} />
                {/* Title + subtitle */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>
                  <span style={{
                    fontFamily: FONT, fontWeight: 700, fontSize: '20px',
                    lineHeight: '140%', letterSpacing: '-0.04em', color: '#303030',
                  }}>
                    Assignments
                  </span>
                  <span style={{
                    fontFamily: FONT, fontWeight: 400, fontSize: '14px',
                    lineHeight: '140%', letterSpacing: '-0.04em', color: 'rgba(94,94,94,0.55)',
                  }}>
                    Manage and create assignments for your classes.
                  </span>
                </div>
              </div>
            </div>

            {/* ── Toolbar bar ── */}
            <div style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              padding: '0px 16px', gap: '36px',
              height: '64px', flexShrink: 0,
              background: '#FFFFFF', borderRadius: '20px',
            }}>
              {/* Filter By */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A9A9A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span style={{
                  fontFamily: FONT, fontWeight: 700, fontSize: '14px',
                  lineHeight: '140%', letterSpacing: '-0.04em', color: '#A9A9A9',
                }}>
                  Filter By
                </span>
              </div>

              {/* Search pill */}
              <div style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center',
                padding: '11px 16px', gap: '10px',
                width: '380px', height: '44px', flexShrink: 0,
                border: '1px solid rgba(0,0,0,0.2)', borderRadius: '100px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A9A9A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none', outline: 'none', background: 'transparent', flex: 1,
                    fontFamily: FONT, fontWeight: 700, fontSize: '14px',
                    lineHeight: '140%', letterSpacing: '-0.04em', color: '#303030',
                  }}
                />
              </div>
            </div>

            {/* ── Cards grid ── */}
            <div
              ref={menuRef}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                alignContent: 'start',
                overflowY: 'auto',
                flex: 1,
                paddingBottom: '21px',
              }}
            >
              {filtered.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  isMenuOpen={activeMenu === assignment._id}
                  onMenuToggle={(id) => setActiveMenu((prev) => (prev === id ? null : id))}
                  onView={() => {
                    setActiveMenu(null);
                    router.push(`/results/${assignment._id}`);
                  }}
                  onDelete={() => void handleDelete(assignment._id)}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* No search results */}
            {filtered.length === 0 && searchQuery && (
              <div style={{
                textAlign: 'center', padding: '64px 0',
                fontFamily: FONT, fontSize: '14px', color: 'rgba(94,94,94,0.55)',
              }}>
                No assignments match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ── Assignment Card ─────────────────────────────────────────────────────────

interface CardProps {
  assignment: Assignment;
  isMenuOpen: boolean;
  onMenuToggle: (id: string) => void;
  onView: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
}

function AssignmentCard({ assignment, isMenuOpen, onMenuToggle, onView, onDelete, formatDate }: CardProps) {
  return (
    <div
      onClick={onView}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
        padding: '24px', gap: '48px',
        background: '#FFFFFF', borderRadius: '24px',
        cursor: 'pointer', position: 'relative',
      }}
    >
      {/* Inner content frame */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '40px', width: '100%',
      }}>

        {/* ── Title row ── */}
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', gap: '39px',
        }}>
          <span style={{
            fontFamily: FONT, fontWeight: 800, fontSize: '24px',
            lineHeight: '120%', letterSpacing: '-0.04em', color: '#303030',
            flex: 1,
          }}>
            {assignment.title}
          </span>

          {/* Three-dot menu */}
          <div style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onMenuToggle(assignment._id)}
              style={{
                width: '24px', height: '24px',
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}
            >
              {/* Vertical three-dot icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#A9A9A9">
                <circle cx="12" cy="5"  r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>

            {/* Dropdown — Classes Dropdown */}
            {isMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '28px', zIndex: 50,
                width: '140px',
                background: '#FFFFFF',
                boxShadow: '0px 16px 48px rgba(0,0,0,0.2), 0px 32px 48px rgba(0,0,0,0.05)',
                borderRadius: '16px',
                padding: '8px',
                display: 'flex', flexDirection: 'column', gap: '4px',
              }}>
                {/* View Assignment */}
                <button
                  onClick={() => { onMenuToggle(assignment._id); onView(); }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0px 8px', height: '32px', width: '100%',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    borderRadius: '8px', textAlign: 'left',
                    fontFamily: FONT, fontWeight: 500, fontSize: '14px',
                    lineHeight: '140%', letterSpacing: '-0.04em', color: '#303030',
                  }}
                >
                  View Assignment
                </button>
                {/* Delete */}
                <button
                  onClick={onDelete}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0px 8px', height: '32px', width: '100%',
                    border: 'none', background: '#F6F6F6', cursor: 'pointer',
                    borderRadius: '8px', textAlign: 'left',
                    fontFamily: FONT, fontWeight: 500, fontSize: '14px',
                    lineHeight: '140%', letterSpacing: '-0.04em', color: '#C53535',
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Date row ── */}
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', gap: '10px',
        }}>
          <span style={{
            fontFamily: FONT, fontWeight: 800, fontSize: '16px',
            lineHeight: '120%', letterSpacing: '-0.04em', color: '#303030',
          }}>
            Assigned on : {formatDate(assignment.createdAt)}
          </span>
          <span style={{
            fontFamily: FONT, fontWeight: 800, fontSize: '16px',
            lineHeight: '120%', letterSpacing: '-0.04em', color: '#303030',
            flexShrink: 0,
          }}>
            Due : {formatDate(assignment.dueDate)}
          </span>
        </div>

      </div>
    </div>
  );
}
