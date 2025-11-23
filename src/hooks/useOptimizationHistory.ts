/**
 * React Query hook for optimization history data
 * Fetches optimization runs with filtering and sorting support
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  OptimizationRun,
  OptimizationFilters,
  OptimizationMetrics,
  OptimizationTrend,
  SortField,
  SortOrder,
} from '@/types/optimization';

/**
 * Response type from optimization history API
 */
export interface OptimizationHistoryResponse {
  runs: OptimizationRun[];
  metrics: OptimizationMetrics;
  trends: OptimizationTrend[];
  total_count: number;
}

/**
 * Query parameters for optimization history
 */
export interface OptimizationQueryParams {
  filters?: OptimizationFilters;
  sortField?: SortField;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: OptimizationQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.filters?.expert_type) {
    searchParams.append('expert_type', params.filters.expert_type);
  }
  if (params.filters?.date_from) {
    searchParams.append('date_from', params.filters.date_from);
  }
  if (params.filters?.date_to) {
    searchParams.append('date_to', params.filters.date_to);
  }
  if (params.filters?.min_improvement !== undefined) {
    searchParams.append('min_improvement', params.filters.min_improvement.toString());
  }
  if (params.filters?.optimizer_type) {
    searchParams.append('optimizer_type', params.filters.optimizer_type);
  }
  if (params.sortField) {
    searchParams.append('sort_field', params.sortField);
  }
  if (params.sortOrder) {
    searchParams.append('sort_order', params.sortOrder);
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', params.offset.toString());
  }

  return searchParams.toString();
}

/**
 * Query keys for react-query
 */
export const optimizationQueryKeys = {
  all: ['optimization-history'] as const,
  list: (params: OptimizationQueryParams) => [...optimizationQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...optimizationQueryKeys.all, 'detail', id] as const,
};

/**
 * Main hook for fetching optimization history
 */
export function useOptimizationHistory(
  params: OptimizationQueryParams = {}
): UseQueryResult<OptimizationHistoryResponse> {
  return useQuery({
    queryKey: optimizationQueryKeys.list(params),
    queryFn: async () => {
      try {
        const queryString = buildQueryString(params);
        const url = `/api/optimization-history${queryString ? `?${queryString}` : ''}`;

        console.log('🔍 Fetching optimization history:', url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        console.log('✅ Fetched optimization history:', {
          runs: data.runs?.length || 0,
          metrics: data.metrics,
          trends: data.trends?.length || 0,
        });

        return {
          runs: Array.isArray(data.runs) ? data.runs : [],
          metrics: data.metrics || {
            total_optimizations: 0,
            avg_improvement: 0,
            total_cost: 0,
            avg_duration_ms: 0,
            best_improvement: 0,
            optimizer_distribution: {
              dspy: 0,
              manual: 0,
              auto: 0,
            },
          },
          trends: Array.isArray(data.trends) ? data.trends : [],
          total_count: data.total_count || 0,
        };
      } catch (error) {
        console.error('Error fetching optimization history:', error);

        // Return empty data on error
        return {
          runs: [],
          metrics: {
            total_optimizations: 0,
            avg_improvement: 0,
            total_cost: 0,
            avg_duration_ms: 0,
            best_improvement: 0,
            optimizer_distribution: {
              dspy: 0,
              manual: 0,
              auto: 0,
            },
          },
          trends: [],
          total_count: 0,
        };
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook for fetching a single optimization run
 */
export function useOptimizationRun(id: string | null): UseQueryResult<OptimizationRun | null> {
  return useQuery({
    queryKey: optimizationQueryKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      try {
        const response = await fetch(`/api/optimization-history/${id}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Error fetching optimization run ${id}:`, error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 60000,
  });
}
