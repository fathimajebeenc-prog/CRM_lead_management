import React, { useState } from 'react';
import type {
  Lead,
  LeadPayload,
  LeadSource,
  LeadStatus,
} from '../lib/api';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  api,
  formatApiError,
} from '../lib/api';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadToEdit: Lead | null;
}

interface LeadFormInnerProps {
  leadToEdit: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LeadFormInner: React.FC<LeadFormInnerProps> = ({ leadToEdit, onClose, onSuccess }) => {
  const isEditing = Boolean(leadToEdit);

  const [name, setName] = useState(leadToEdit?.name || '');
  const [company, setCompany] = useState(leadToEdit?.company || '');
  const [email, setEmail] = useState(leadToEdit?.email || '');
  const [phone, setPhone] = useState(leadToEdit?.phone || '');
  const [source, setSource] = useState<LeadSource>(leadToEdit ? leadToEdit.source : 'Website');
  const [status, setStatus] = useState<LeadStatus>(leadToEdit ? leadToEdit.status : 'New');
  const [dealValue, setDealValue] = useState(leadToEdit?.deal_value || '0.00');
  const [notes, setNotes] = useState(leadToEdit?.notes || '');
  const [followUpDate, setFollowUpDate] = useState(leadToEdit?.follow_up_date || '');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    const numericDeal = Number(dealValue);
    if (isNaN(numericDeal) || numericDeal < 0) {
      errors.dealValue = 'Deal value must be a number greater than or equal to 0.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const payload: LeadPayload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source,
      status,
      deal_value: dealValue ? String(Number(dealValue).toFixed(2)) : '0.00',
      notes: notes.trim(),
      follow_up_date: followUpDate ? followUpDate : null,
    };

    try {
      if (isEditing && leadToEdit) {
        await api.updateLead(leadToEdit.id, payload);
      } else {
        await api.createLead(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setApiError(formatApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-left border border-slate-200 transition-all transform animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Lead' : 'Add New Lead'}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEditing
              ? 'Update the details for this lead.'
              : 'Fill in the information to add a new lead.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {apiError && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <svg
            className="w-5 h-5 text-rose-500 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <span className="font-medium">Error saving lead:</span> {apiError}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
              }}
              placeholder="e.g. John Doe"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
                fieldErrors.name
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
              placeholder="name@company.com"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
                fieldErrors.email
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">None / Unspecified</option>
              {LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Deal Value ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={dealValue}
              onChange={(e) => {
                setDealValue(e.target.value);
                if (fieldErrors.dealValue) setFieldErrors({ ...fieldErrors, dealValue: '' });
              }}
              placeholder="0.00"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${
                fieldErrors.dealValue
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300'
              }`}
            />
            {fieldErrors.dealValue && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.dealValue}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific context or notes..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-xs shadow-indigo-200"
          >
            {isSubmitting && (
              <svg
                className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            )}
            {isEditing ? 'Save Changes' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leadToEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <LeadFormInner
        key={leadToEdit ? String(leadToEdit.id) : 'new-lead'}
        leadToEdit={leadToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
};
