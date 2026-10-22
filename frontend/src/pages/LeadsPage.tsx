import React, { useState, useEffect, useCallback } from 'react';
import type { Lead, LeadStatus } from '../lib/api';
import { api, formatApiError, LEAD_STATUSES, LEAD_SOURCES } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { LeadModal } from '../components/LeadModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [createdAfter, setCreatedAfter] = useState<string>('');
  const [createdBefore, setCreatedBefore] = useState<string>('');
  const [ordering, setOrdering] = useState<string>('-created_at');

  // Status update states
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  // Delete modal controls
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Debounce search input by 300 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLeads({
        search: debouncedSearch,
        status: statusFilter,
        source: sourceFilter,
        created_after: createdAfter,
        created_before: createdBefore,
        ordering,
      });
      setLeads(data);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, sourceFilter, createdAfter, createdBefore, ordering]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const refreshLeads = useCallback(async () => {
    await fetchLeads();
  }, [fetchLeads]);

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setCreatedAfter('');
    setCreatedBefore('');
    setOrdering('-created_at');
  };

  const handleStatusChange = async (leadId: number, newStatus: LeadStatus) => {
    setUpdatingStatusId(leadId);
    setStatusError(null);
    try {
      const updatedLead = await api.updateLeadStatus(leadId, newStatus);
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );
    } catch (err: unknown) {
      setStatusError(formatApiError(err));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleOpenAdd = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
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

  const hasActiveFilters = Boolean(
    searchInput ||
      statusFilter ||
      sourceFilter ||
      createdAfter ||
      createdBefore ||
      ordering !== '-created_at'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, track, and convert your business prospects in one place.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            type="button"
            onClick={refreshLeads}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh leads"
          >
            <svg
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
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
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add lead
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Above Table) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, company, email..."
              aria-label="Search"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              id="status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Status"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-slate-700"
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Source Dropdown */}
          <div>
            <select
              id="source"
              name="source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Source"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-slate-700"
            >
              <option value="">All sources</option>
              {LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              id="ordering"
              name="ordering"
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              aria-label="Sort by"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-slate-700"
            >
              <option value="-created_at">Newest</option>
              <option value="name">Name</option>
              <option value="-deal_value">Deal value high to low</option>
              <option value="follow_up_date">Follow-up date</option>
            </select>
          </div>
        </div>

        {/* Date Inputs, Clear Filters, and "N leads" Count */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Created From */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="created_after"
                className="text-xs font-medium text-slate-600 whitespace-nowrap"
              >
                Created from:
              </label>
              <input
                id="created_after"
                name="created_after"
                type="date"
                value={createdAfter}
                onChange={(e) => setCreatedAfter(e.target.value)}
                aria-label="Created from"
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-slate-700"
              />
            </div>

            {/* Created To */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="created_before"
                className="text-xs font-medium text-slate-600 whitespace-nowrap"
              >
                Created to:
              </label>
              <input
                id="created_before"
                name="created_before"
                type="date"
                value={createdBefore}
                onChange={(e) => setCreatedBefore(e.target.value)}
                aria-label="Created to"
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-slate-700"
              />
            </div>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>

          {/* Show "N leads" */}
          <div className="text-sm font-semibold text-slate-700">
            {leads.length} leads
          </div>
        </div>
      </div>

      {/* Status Update Error Banner */}
      {statusError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center justify-between">
          <span>Failed to update status: {statusError}</span>
          <button
            type="button"
            onClick={() => setStatusError(null)}
            className="text-rose-500 hover:text-rose-700 text-lg leading-none font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-4 animate-spin">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-slate-900">Loading leads...</h3>
            <p className="text-sm text-slate-500 mt-1">
              Fetching the latest prospects from the CRM database.
            </p>
          </div>
          <div className="divide-y divide-slate-100 p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between pt-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-sm w-36" />
                    <div className="h-3 bg-slate-200 rounded-sm w-24" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded-sm w-20" />
                <div className="h-4 bg-slate-200 rounded-sm w-16" />
                <div className="h-4 bg-slate-200 rounded-sm w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-xs border border-rose-200 p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Unable to load leads</h3>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <button
            type="button"
            onClick={refreshLeads}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            Try Again
          </button>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {hasActiveFilters ? 'No matching leads' : 'No leads yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No leads matched your current filters. Try adjusting your criteria or clearing filters.'
              : 'Get started by adding your first lead to track stages, values, and follow-ups.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Lead
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Deal Value
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Follow-up Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{lead.name}</div>
                      {lead.phone && (
                        <div className="text-xs text-slate-400 mt-0.5">{lead.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {lead.company || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {lead.source ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {lead.source}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={lead.status}
                        onChange={(newStatus) => handleStatusChange(lead.id, newStatus)}
                        disabled={updatingStatusId === lead.id}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900">
                      {formatCurrency(lead.deal_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {formatDate(lead.follow_up_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(lead)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(lead)}
                          className="px-2.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>
              Total leads: <strong className="text-slate-700">{leads.length}</strong>
            </span>
            <span>
              Total pipeline value:{' '}
              <strong className="text-slate-700">
                {formatCurrency(
                  leads.reduce((sum, lead) => sum + (Number(lead.deal_value) || 0), 0)
                )}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <LeadModal
        isOpen={isModalOpen}
        leadToEdit={leadToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setLeadToEdit(null);
        }}
        onSuccess={refreshLeads}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        lead={leadToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLeadToDelete(null);
        }}
        onSuccess={refreshLeads}
      />
    </div>
  );
};
