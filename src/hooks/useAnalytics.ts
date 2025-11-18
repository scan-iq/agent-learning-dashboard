/**
 * React Query hooks for analytics data
 * Calls API routes - NO server-side code imported!
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';

/**
 * Hook for health trends over time
 */
export function useHealthTrends(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['health-trends', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/health-trends?projectId=${projectId}&hours=${hours}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook for success rate trends over time
 */
export function useSuccessRateTrends(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['success-rate-trends', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/success-rate?projectId=${projectId}&hours=${hours}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}

/**
 * Hook for latency trends over time
 */
export function useLatencyTrends(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['latency-trends', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/latency?projectId=${projectId}&hours=${hours}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}

/**
 * Hook for reflexion impact statistics
 */
export function useReflexionImpact(projectId: string | null) {
  return useQuery({
    queryKey: ['reflexion-impact', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/reflexion-impact?projectId=${projectId}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Hook for expert performance stats
 */
export function useExpertPerformance(projectId: string | null) {
  return useQuery({
    queryKey: ['expert-performance', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/expert-stats?projectId=${projectId}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}

/**
 * Hook for individual expert performance trends
 */
export function useExpertPerformanceTrends(
  projectId: string | null,
  expertId: string | null,
  hours: number = 24
) {
  return useQuery({
    queryKey: ['expert-performance-trends', projectId, expertId, hours],
    queryFn: async () => {
      if (!projectId || !expertId) return [];
      const response = await fetch(`/api/analytics/expert-performance?projectId=${projectId}&expertId=${expertId}&hours=${hours}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId && !!expertId,
    staleTime: 60000,
  });
}

/**
 * Hook for token consumption trends
 */
export function useTokenConsumption(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['token-consumption', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/token-consumption?projectId=${projectId}&hours=${hours}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}

/**
 * Hook for error distribution
 */
export function useErrorDistribution(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['error-distribution', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/analytics/error-distribution?projectId=${projectId}&hours=${hours}`);
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}
