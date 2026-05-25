import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'easy' | 'medium' | 'hard' | 'default';
  className?: string;
}

const variantClasses: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  hard: 'bg-rose-100 text-rose-800 border border-rose-200',
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
