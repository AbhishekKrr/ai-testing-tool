'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className="w-10 h-5 rounded-full relative flex-shrink-0 transition-colors"
      style={{ background: on ? '#7C3AED' : '#E8ECF0' }}
    >
      <div
        className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
        style={{ left: on ? 'calc(100% - 18px)' : '2px' }}
      />
    </div>
  );
}

export default function SettingsClient() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell breadcrumb="Settings">
      <div className="p-6 max-w-2xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[18px] font-bold text-[#1A1A2E]">Settings</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">Manage your profile, school info, and preferences.</p>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl border border-[#E8ECF0] p-5 mb-4">
          <h2 className="text-[13px] font-bold text-[#1A1A2E] mb-4">Profile</h2>

          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#F4F6F8]">
            <div className="w-14 h-14 rounded-full bg-[#F4642A] flex items-center justify-center text-white text-[20px] font-bold flex-shrink-0">
              J
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1A1A2E]">John Doe</p>
              <p className="text-[12px] text-[#94A3B8]">Teacher · Delhi Public School</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: 'John Doe', type: 'text' },
              { label: 'Email Address', value: 'john@dps.edu.in', type: 'email' },
              { label: 'School Name', value: 'Delhi Public School', type: 'text' },
              { label: 'City', value: 'Bokaro Steel City', type: 'text' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[11px] font-semibold text-[#5A6478] mb-1.5 uppercase tracking-wide">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E8ECF0] text-[13px] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Preferences */}
        <div className="bg-white rounded-xl border border-[#E8ECF0] p-5 mb-4">
          <h2 className="text-[13px] font-bold text-[#1A1A2E] mb-4">AI Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">Default Question Count</p>
                <p className="text-[11px] text-[#94A3B8]">Number of questions per generated paper</p>
              </div>
              <input
                type="number"
                defaultValue={10}
                min={1}
                max={50}
                className="w-20 px-3 py-1.5 rounded-lg border border-[#E8ECF0] text-[13px] text-[#1A1A2E] text-center focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">Default Difficulty</p>
                <p className="text-[11px] text-[#94A3B8]">Preferred difficulty mix for generated questions</p>
              </div>
              <select className="px-3 py-1.5 rounded-lg border border-[#E8ECF0] text-[13px] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] bg-white">
                <option>Mixed</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">Include Answer Key</p>
                <p className="text-[11px] text-[#94A3B8]">Show answers at the bottom of each generated paper</p>
              </div>
              <Toggle on={true} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">Auto-detect Subject from File</p>
                <p className="text-[11px] text-[#94A3B8]">AI detects subject and grade level from uploaded PDFs</p>
              </div>
              <Toggle on={true} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-[#E8ECF0] p-5 mb-6">
          <h2 className="text-[13px] font-bold text-[#1A1A2E] mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { label: 'Assignment generated', desc: 'When AI finishes generating a question paper', on: true },
              { label: 'Due date reminders', desc: '24 hours before an assignment due date', on: false },
              { label: 'New student submissions', desc: 'When students submit answers for grading', on: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A2E]">{n.label}</p>
                  <p className="text-[11px] text-[#94A3B8]">{n.desc}</p>
                </div>
                <Toggle on={n.on} />
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
              saved
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#1A1A2E] text-white hover:bg-[#2a2a4e]'
            }`}
          >
            {saved ? '✓ Changes Saved' : 'Save Changes'}
          </button>
          {saved && (
            <p className="text-[12px] text-[#22C55E] font-medium animate-pulse">All changes saved successfully.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
