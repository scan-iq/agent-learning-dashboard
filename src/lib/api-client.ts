/**
 * Centralized API Client for IRIS Console
 * Handles all communication with the backend API
 */

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'https://iris-prime-api.vercel.app';
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

/**
 * Get API key from local storage or session storage
 * Users should generate this from the API Keys page
 */
function getApiKey(): string | null {
  return localStorage.getItem('iris_api_key') || sessionStorage.getItem('iris_api_key');
}

/**
 * Set API key in local storage
 */
export function setApiKey(key: string, remember: boolean = true): void {
  if (remember) {
    localStorage.setItem('iris_api_key', key);
  } else {
    sessionStorage.setItem('iris_api_key', key);
  }
}

/**
 * Clear stored API key
 */
export function clearApiKey(): void {
  localStorage.removeItem('iris_api_key');
  sessionStorage.removeItem('iris_api_key');
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

/**
 * Make authenticated API request to backend
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add Authorization header if API key is available
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * IRIS API Client
 */
export const irisApi = {
  /**
   * Get comprehensive analytics data
   */
  getAnalytics: () => apiRequest<any>('/api/iris/analytics'),

  /**
   * Get overview/dashboard data
   */
  getOverview: () => apiRequest<any>('/api/iris/overview'),

  /**
   * Get all projects
   */
  getProjects: () => apiRequest<any>('/api/iris/projects'),

  /**
   * Get project details by ID
   */
  getProjectDetails: (projectId: string) =>
    apiRequest<any>(`/api/iris/projects/${projectId}`),

  /**
   * Get recent events
   */
  getEvents: (limit: number = 50) =>
    apiRequest<any>(`/api/iris/events?limit=${limit}`),

  /**
   * Get model runs for a project
   */
  getModelRuns: (projectId: string, limit: number = 100) =>
    apiRequest<any>(`/api/iris/model-runs?projectId=${projectId}&limit=${limit}`),

  /**
   * Get reflexions for a project
   */
  getReflexions: (projectId: string, limit: number = 50) =>
    apiRequest<any>(`/api/iris/reflexions?projectId=${projectId}&limit=${limit}`),

  /**
   * Get consensus data for a project
   */
  getConsensus: (projectId: string) =>
    apiRequest<any>(`/api/iris/consensus?projectId=${projectId}`),

  /**
   * Trigger evaluation for all projects
   */
  evaluateAll: () =>
    apiRequest<any>('/api/iris/evaluate', { method: 'POST' }),

  /**
   * Trigger evaluation for a specific project
   */
  evaluateProject: (projectId: string) =>
    apiRequest<any>(`/api/iris/evaluate/${projectId}`, { method: 'POST' }),

  /**
   * Trigger auto-retrain
   */
  retrain: (projectId?: string) =>
    apiRequest<any>('/api/iris/retrain', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  /**
   * Find patterns across projects
   */
  findPatterns: () =>
    apiRequest<any>('/api/iris/patterns'),

  /**
   * Get rotation report for a project
   */
  getRotationReport: (projectId: string) =>
    apiRequest<any>(`/api/iris/rotation?projectId=${projectId}`),

  /**
   * Get token usage statistics
   */
  getTokenUsage: (projectId?: string, timeRange?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (timeRange) params.append('timeRange', timeRange);
    return apiRequest<any>(`/api/iris/token-usage?${params.toString()}`);
  },

  /**
   * Get cost analytics
   */
  getCostAnalytics: (projectId?: string, timeRange?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (timeRange) params.append('timeRange', timeRange);
    return apiRequest<any>(`/api/iris/costs?${params.toString()}`);
  },
};

/**
 * Admin API Client (requires admin API key)
 */
export const adminApi = {
  /**
   * Get API keys for a project
   */
  getApiKeys: (projectId: string, adminKey: string) =>
    apiRequest<any>(`/api/admin/api-keys?projectId=${projectId}`, {
      headers: { 'X-Admin-Key': adminKey },
    }),

  /**
   * Create new API key
   */
  createApiKey: (
    projectId: string,
    projectName: string,
    label: string,
    adminKey: string
  ) =>
    apiRequest<any>('/api/admin/api-keys', {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      body: JSON.stringify({ projectId, projectName, label }),
    }),

  /**
   * Revoke API key
   */
  revokeApiKey: (keyId: string, adminKey: string) =>
    apiRequest<any>('/api/admin/api-keys', {
      method: 'DELETE',
      headers: { 'X-Admin-Key': adminKey },
      body: JSON.stringify({ keyId }),
    }),
};

/**
 * Export API base URL for direct use if needed
 */
export { API_BASE, ENABLE_MOCK };
