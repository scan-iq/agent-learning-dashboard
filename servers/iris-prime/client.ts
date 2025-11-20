/**
 * IRIS REST API Client
 *
 * Base client for making authenticated requests to the IRIS API
 * Handles errors, retries, and response parsing
 */

import type { ApiError } from './types';

// Get API base URL from environment
const API_BASE = import.meta.env.VITE_IRIS_API_BASE || 'http://localhost:3001';

export class IrisApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'IrisApiError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Make authenticated request to IRIS API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = 30000,
    retries = 2
  } = options;

  const url = `${API_BASE}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...(body && { body: JSON.stringify(body) })
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: response.statusText,
          timestamp: new Date().toISOString()
        }));

        throw new IrisApiError(
          errorData.error || `HTTP ${response.status}`,
          errorData.code,
          errorData.details,
          response.status
        );
      }

      // Parse successful response
      const data: T = await response.json();
      return data;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof IrisApiError && error.status && error.status < 500) {
        throw error;
      }

      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new IrisApiError('Request timeout', 'TIMEOUT', { timeout });
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed
  throw lastError || new IrisApiError('Unknown error occurred', 'UNKNOWN');
}

/**
 * Get authentication token from storage
 * Override this based on your auth strategy
 */
function getAuthToken(): string | null {
  // TODO: Implement based on your auth system
  // Example: return localStorage.getItem('iris_auth_token');
  return null;
}

/**
 * Construct query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
