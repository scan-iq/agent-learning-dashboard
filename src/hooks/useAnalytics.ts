/**
 * React Query hooks for analytics data
 * Uses agent-learning-core for data access
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getHealthTrends,
  getSuccessRateTrends,
  getLatencyTrends,
  getReflexionImpactStats,
  getProjectExpertStats,
  getExpertPerformanceTrends,
  getTokenConsumptionTrends,
  getErrorDistribution,
} from '@foxruv/agent-learning-core';

/**
 * Hook for health trends over time
 */
export function useHealthTrends(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['health-trends', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      return await getHealthTrends(projectId, hours);
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
      return await getSuccessRateTrends(projectId, hours);
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
      return await getLatencyTrends(projectId, hours);
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
      return await getReflexionImpactStats(projectId);
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
      return await getProjectExpertStats(projectId);
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
      return await getExpertPerformanceTrends(projectId, expertId, hours);
    },
    enabled: !!projectId && !!expertId,
    staleTime: 60000,
  });
}

/**
 * Hook for token consumption trends
 */
export function useTokenConsumptionTrends(projectId: string | null, hours: number = 24) {
  return useQuery({
    queryKey: ['token-consumption-trends', projectId, hours],
    queryFn: async () => {
      if (!projectId) return [];
      return await getTokenConsumptionTrends(projectId, hours);
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}

/**
 * Hook for error distribution
 */
export function useErrorDistribution(projectId: string | null) {
  return useQuery({
    queryKey: ['error-distribution', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return await getErrorDistribution(projectId);
    },
    enabled: !!projectId,
    staleTime: 120000,
  });
}

/**
 * Hook for all analytics data at once (for dashboard)
 */
export function useProjectAnalytics(projectId: string | null, hours: number = 24) {
  const healthTrends = useHealthTrends(projectId, hours);
  const successRateTrends = useSuccessRateTrends(projectId, hours);
  const latencyTrends = useLatencyTrends(projectId, hours);
  const reflexionImpact = useReflexionImpact(projectId);
  const expertPerformance = useExpertPerformance(projectId);
  const tokenConsumption = useTokenConsumptionTrends(projectId, hours);
  const errorDistribution = useErrorDistribution(projectId);

  return {
    healthTrends,
    successRateTrends,
    latencyTrends,
    reflexionImpact,
    expertPerformance,
    tokenConsumption,
    errorDistribution,
    isLoading:
      healthTrends.isLoading ||
      successRateTrends.isLoading ||
      latencyTrends.isLoading ||
      reflexionImpact.isLoading ||
      expertPerformance.isLoading ||
      tokenConsumption.isLoading ||
      errorDistribution.isLoading,
    isError:
      healthTrends.isError ||
      successRateTrends.isError ||
      latencyTrends.isError ||
      reflexionImpact.isError ||
      expertPerformance.isError ||
      tokenConsumption.isError ||
      errorDistribution.isError,
  };
}
