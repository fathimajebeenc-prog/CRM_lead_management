import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import type { DashboardData } from '../lib/api';
import { api, formatApiError } from '../lib/api';

const STATUS_ORDER = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

const STATUS_COLORS: Record<string, string> = {
  New: '#3b82f6',
  Contacted: '#a855f7',
  Qualified: '#f59e0b',
  Proposal: '#6366f1',
  Won: '#10b981',
  Lost: '#f43f5e',
};

const SOURCE_COLORS: Record<string, string> = {
  Website: '#6366f1',
  Referral: '#3b82f6',
  LinkedIn: '#0ea5e9',
  'Cold Call': '#f59e0b',
  Event: '#ec4899',
  Other: '#8b5cf6',
};

const FALLBACK_PALETTE = ['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const formatMoney = (val: number | string | undefined | null): string => {
  const num = Number(val ?? 0);
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatWeekLabel = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  // Status chart data ordered strictly from New to Lost
  const sortedStatusData = [...(data?.by_status || [])].sort((a, b) => {
    const idxA = STATUS_ORDER.indexOf(a.status);
    const idxB = STATUS_ORDER.indexOf(b.status);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  // Source chart data
  const sourceChartData = (data?.by_source || []).filter((item) => item.count > 0);
  const totalSourceCount = sourceChartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sales pipeline performance, conversion rates, and revenue metrics.
          </p>
        </div>
        <button
          onClick={() => void fetchDashboardData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <svg
            className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-rose-500 shrink-0 mt-0.5"
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
            <div>
              <h3 className="text-sm font-semibold text-rose-900">Failed to load dashboard data</h3>
              <p className="text-sm text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => void fetchDashboardData()}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition-colors shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs animate-pulse"
              >
                <div className="h-3 bg-slate-200 rounded-sm w-24 mb-3" />
                <div className="h-7 bg-slate-200 rounded-sm w-32 mb-2" />
                <div className="h-3 bg-slate-100 rounded-sm w-20" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs animate-pulse h-80">
              <div className="h-4 bg-slate-200 rounded-sm w-36 mb-6" />
              <div className="h-56 bg-slate-100 rounded-lg" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs animate-pulse h-80">
              <div className="h-4 bg-slate-200 rounded-sm w-36 mb-6" />
              <div className="h-56 bg-slate-100 rounded-lg" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs animate-pulse h-80">
            <div className="h-4 bg-slate-200 rounded-sm w-44 mb-6" />
            <div className="h-56 bg-slate-100 rounded-lg" />
          </div>
        </div>
      )}

      {/* Main dashboard content */}
      {data && (
        <div className="space-y-6">
          {/* 5 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Total Leads */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Leads
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {data.total_leads.toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {data.won_leads.toLocaleString()} won leads
              </div>
            </div>

            {/* 2. Conversion Rate % */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Conversion Rate
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {data.conversion_rate}%
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Won vs total leads
              </div>
            </div>

            {/* 3. Pipeline Value */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pipeline Value
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {formatMoney(data.pipeline_value)}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Active opportunities
              </div>
            </div>

            {/* 4. Won Value */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Won Value
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {formatMoney(data.won_value)}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Closed-won revenue
              </div>
            </div>

            {/* 5. Overdue Follow-ups */}
            <div
              className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between ${
                data.overdue_followups > 0
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      data.overdue_followups > 0 ? 'text-rose-700' : 'text-slate-500'
                    }`}
                  >
                    Overdue Follow-ups
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      data.overdue_followups > 0
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div
                  className={`mt-2 text-2xl font-bold ${
                    data.overdue_followups > 0 ? 'text-rose-700' : 'text-slate-900'
                  }`}
                >
                  {data.overdue_followups.toLocaleString()}
                </div>
              </div>
              <div
                className={`mt-2 text-xs ${
                  data.overdue_followups > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'
                }`}
              >
                {data.overdue_followups > 0 ? 'Requires attention' : 'All up to date'}
              </div>
            </div>
          </div>

          {/* 3 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Bar Chart: Leads by Status (New to Lost) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Leads by Status</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pipeline progression from New to Lost
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="status"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                      }}
                      labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                    />
                    <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                      {sortedStatusData.map((entry) => (
                        <Cell
                          key={`status-bar-${entry.status}`}
                          fill={STATUS_COLORS[entry.status] || '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Donut Chart: Leads by Source */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Leads by Source</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Distribution across acquisition channels</p>
                </div>
              </div>
              <div className="h-72 w-full flex items-center justify-center">
                {totalSourceCount === 0 ? (
                  <div className="text-center text-sm text-slate-400">
                    No leads recorded by source yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        dataKey="count"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {sourceChartData.map((entry, index) => (
                          <Cell
                            key={`source-cell-${entry.source}`}
                            fill={
                              SOURCE_COLORS[entry.source] ||
                              FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* 3. Line Chart: Leads per Week */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Leads Created per Week</h2>
                <p className="text-xs text-slate-500 mt-0.5">Weekly volume trend over the last 8 weeks</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.per_week} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={formatWeekLabel}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                    labelFormatter={(val) => `Week of ${formatWeekLabel(String(val))}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Leads"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
