import React, { useState, useEffect, useCallback } from 'react';
import type { Lead, Activity, LeadStatus } from '../lib/api';
import {
  api,
  formatApiError,
  getTodayString,
  isLeadOverdue,
  isLeadDueToday,
} from '../lib/api';
import { StatusBadge } from './StatusBadge';

export interface LeadDrawerProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated?: (lead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  isOpen,
  lead,
  onClose,
  onLeadUpdated,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const [noteText, setNoteText] = useState<string>('');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const todayStr = getTodayString();

  const fetchActivities = useCallback(async () => {
    if (!lead) return;
    setIsLoadingActivities(true);
    setActivityError(null);
    try {
      const data = await api.getActivities(lead.id);
      const sorted = (Array.isArray(data) ? [...data] : []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setActivities(sorted);
    } catch (err: unknown) {
      setActivityError(formatApiError(err));
    } finally {
      setIsLoadingActivities(false);
    }
  }, [lead]);

  useEffect(() => {
    if (isOpen && lead) {
      setNoteText('');
      setSubmitError(null);
      void fetchActivities();
    }
  }, [isOpen, lead, fetchActivities]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lead) {
    return null;
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed || isSubmittingNote) return;

    setIsSubmittingNote(true);
    setSubmitError(null);
    try {
      await api.createActivity(lead.id, trimmed);
      setNoteText('');
      await fetchActivities();
    } catch (err: unknown) {
      setSubmitError(formatApiError(err));
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      const updated = await api.updateLeadStatus(lead.id, newStatus);
      if (onLeadUpdated) {
        onLeadUpdated(updated);
      }
      await fetchActivities();
    } catch (err: unknown) {
      setActivityError(formatApiError(err));
    }
  };

  const formatCurrency = (val: string | number) => {
    const num = Number(val);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return dateStr;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${lead.name} details and activity timeline`}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{lead.name}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {lead.company || <span className="italic text-slate-400">No company</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close side drawer"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Details Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Lead Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Status</span>
                <StatusBadge status={lead.status} onChange={handleStatusChange} />
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Deal Value</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(lead.deal_value)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Email</span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-indigo-600 hover:text-indigo-800 break-all transition-colors"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Phone</span>
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Source</span>
                {lead.source ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    {lead.source}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Follow-up Date</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-700">{formatDate(lead.follow_up_date)}</span>
                  {isLeadOverdue(lead, todayStr) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                      Overdue
                    </span>
                  )}
                  {isLeadDueToday(lead, todayStr) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      Due today
                    </span>
                  )}
                </div>
              </div>
            </div>

            {lead.notes && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Notes</span>
                <p className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-150 whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* Activity Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Activity Timeline
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {activities.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void fetchActivities()}
                disabled={isLoadingActivities}
                className="text-xs text-slate-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1 transition-colors"
                title="Refresh activities"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isLoadingActivities ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            {/* "Add note" box */}
            <form onSubmit={handleAddNote} className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <label htmlFor="drawer-note-input" className="block text-xs font-semibold text-slate-700">
                Add note
              </label>
              <textarea
                id="drawer-note-input"
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note about this lead..."
                disabled={isSubmittingNote}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-900 placeholder-slate-400 disabled:bg-slate-100 resize-y"
              />
              {submitError && (
                <div className="p-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                  {submitError}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNote || !noteText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                >
                  {isSubmittingNote && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  Add note
                </button>
              </div>
            </form>

            {/* Timeline Items */}
            {isLoadingActivities ? (
              <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Loading timeline...</span>
              </div>
            ) : activityError ? (
              <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                <span>{activityError}</span>
                <button
                  type="button"
                  onClick={() => void fetchActivities()}
                  className="text-xs font-medium text-rose-700 underline hover:text-rose-900 cursor-pointer ml-2"
                >
                  Retry
                </button>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No activities yet. Add the first note above.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activities.map((activity) => {
                  const isNote = activity.type === 'note';
                  return (
                    <div key={activity.id} className="relative group">
                      {/* Timeline icon node with distinct icon & color */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border ring-4 ring-white shadow-2xs ${
                          isNote
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-purple-100 text-purple-700 border-purple-300'
                        }`}
                        title={activity.type}
                      >
                        {isNote ? (
                          /* Note icon */
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        ) : (
                          /* Status change icon */
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Activity card */}
                      <div
                        className={`p-3 rounded-lg border text-sm transition-shadow ${
                          isNote
                            ? 'bg-blue-50/40 border-blue-100'
                            : 'bg-purple-50/40 border-purple-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                              isNote
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-purple-100 text-purple-700 border-purple-200'
                            }`}
                          >
                            {activity.type}
                          </span>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDateTime(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-800 text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {activity.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
