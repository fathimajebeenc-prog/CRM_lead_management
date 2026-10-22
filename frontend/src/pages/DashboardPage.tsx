import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sales pipeline performance, conversion rates, and revenue metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-sm font-medium text-slate-500">Total Leads</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">Pipeline active leads</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-sm font-medium text-slate-500">Conversion Rate</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">Won vs total closed</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-sm font-medium text-slate-500">Pipeline Value</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-400">Total potential revenue</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Dashboard Coming Soon</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Interactive charts and metrics are being prepared. In the meantime, head over to the Leads
          page to manage your active pipeline.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            View Leads
          </Link>
        </div>
      </div>
    </div>
  );
};
