import React, { useState } from 'react';
import type { LeadStatus } from '../lib/api';
import { LEAD_STATUSES } from '../lib/api';

export interface StatusBadgeProps {
  status: LeadStatus;
  onChange?: (newStatus: LeadStatus) => Promise<void> | void;
  disabled?: boolean;
}

const statusConfig: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  New: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  Contacted: {
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  Qualified: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  Proposal: {
    bg: 'bg-indigo-50 border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  Won: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Lost: {
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const config = statusConfig[status] || {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  };

  if (!onChange) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {status}
      </span>
    );
  }

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as LeadStatus;
    if (nextStatus === status) return;
    setIsUpdating(true);
    try {
      await onChange(nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} absolute left-2.5 pointer-events-none z-10 ${
          isUpdating ? 'animate-pulse' : ''
        }`}
      />
      <select
        value={status}
        disabled={disabled || isUpdating}
        onChange={handleChange}
        aria-label="Status"
        className={`appearance-none pl-6 pr-6 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 ${
          config.bg
        } ${config.text} ${
          disabled || isUpdating
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:brightness-95 hover:shadow-2xs'
        }`}
      >
        {LEAD_STATUSES.map((st) => (
          <option key={st} value={st} className="text-slate-900 bg-white font-normal">
            {st}
          </option>
        ))}
      </select>
      <svg
        className={`w-3 h-3 absolute right-2 pointer-events-none ${config.text}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};
