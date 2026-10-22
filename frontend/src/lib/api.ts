export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'LinkedIn'
  | 'Cold Call'
  | 'Event'
  | 'Other'
  | '';

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  deal_value: string;
  notes: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadPayload {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
  deal_value?: string;
  notes?: string;
  follow_up_date?: string | null;
}

export interface LeadFilterParams {
  search?: string;
  status?: string;
  source?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
}

export interface DashboardStatusCount {
  status: LeadStatus | string;
  count: number;
}

export interface DashboardSourceCount {
  source: LeadSource | string;
  count: number;
}

export interface DashboardWeeklyCount {
  week: string;
  count: number;
}

export interface DashboardData {
  total_leads: number;
  won_leads: number;
  conversion_rate: number;
  pipeline_value: number;
  won_value: number;
  overdue_followups: number;
  by_status: DashboardStatusCount[];
  by_source: DashboardSourceCount[];
  per_week: DashboardWeeklyCount[];
}

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Won',
  'Lost',
];

export const LEAD_SOURCES: Exclude<LeadSource, ''>[] = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Event',
  'Other',
];

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown> | null;

  constructor(message: string, status: number, data: Record<string, unknown> | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError && error.data) {
    const messages: string[] = [];
    for (const [key, value] of Object.entries(error.data)) {
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${key}: ${value}`);
      } else if (value && typeof value === 'object') {
        messages.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://127.0.0.1:8000/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: Record<string, unknown> | null = null;
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const parsed = await response.json();
      if (parsed && typeof parsed === 'object') {
        errorData = parsed as Record<string, unknown>;
        if (typeof parsed.detail === 'string') {
          errorMessage = parsed.detail;
        } else if (typeof parsed.error === 'string') {
          errorMessage = parsed.error;
        }
      }
    } catch {
      // not JSON body
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  return JSON.parse(text) as T;
}

export const api = {
  getLeads: (params?: LeadFilterParams): Promise<Lead[]> => {
    if (!params) {
      return fetchApi<Lead[]>('/leads/');
    }
    const query = new URLSearchParams();
    if (params.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    if (params.status) {
      query.set('status', params.status);
    }
    if (params.source) {
      query.set('source', params.source);
    }
    if (params.created_after) {
      query.set('created_after', params.created_after);
    }
    if (params.created_before) {
      query.set('created_before', params.created_before);
    }
    if (params.ordering) {
      query.set('ordering', params.ordering);
    }
    const queryString = query.toString();
    return fetchApi<Lead[]>(`/leads/${queryString ? `?${queryString}` : ''}`);
  },
  getLead: (id: number | string): Promise<Lead> => fetchApi<Lead>(`/leads/${id}/`),
  createLead: (data: LeadPayload): Promise<Lead> =>
    fetchApi<Lead>('/leads/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLead: (id: number | string, data: Partial<LeadPayload>): Promise<Lead> =>
    fetchApi<Lead>(`/leads/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateLeadStatus: (id: number | string, status: LeadStatus | string): Promise<Lead> =>
    fetchApi<Lead>(`/leads/${id}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  deleteLead: (id: number | string): Promise<void> =>
    fetchApi<void>(`/leads/${id}/`, {
      method: 'DELETE',
    }),
  getDashboard: (): Promise<DashboardData> => fetchApi<DashboardData>('/dashboard/'),
};
