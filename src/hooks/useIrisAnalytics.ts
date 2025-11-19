/**
 * React Query hooks for IRIS Prime Analytics
 * Fetches data from backend /api/iris/analytics endpoint
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { irisApi } from '@/lib/api-client';

/**
 * Analytics data structure from backend
 */
export interface IrisAnalytics {
  overview: {
    totalProjects: number;
    totalRuns: number;
    totalCost: number;
    avgConfidence: number;
    successRate: number;
    totalReflexions: number;
    totalConsensus: number;
  };
  tokenUsage: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    byModel: Array<{
      model: string;
      tokens: number;
      cost: number;
    }>;
    byProject: Array<{
      project: string;
      tokens: number;
      cost: number;
    }>;
    overTime: Array<{
      timestamp: string;
      tokens: number;
      cost: number;
    }>;
  };
  costs: {
    totalCost: number;
    byModel: Array<{
      model: string;
      cost: number;
      runs: number;
    }>;
    byProject: Array<{
      project: string;
      cost: number;
      runs: number;
    }>;
    overTime: Array<{
      timestamp: string;
      cost: number;
    }>;
  };
  performance: {
    avgLatency: number;
    avgTokensPerRun: number;
    avgCostPerRun: number;
    successRate: number;
    errorRate: number;
  };
  modelRuns: Array<{
    id: string;
    project: string;
    model: string;
    timestamp: string;
    success: boolean;
    confidence: number;
    latency: number;
    tokens: number;
    cost: number;
  }>;
  reflexions: Array<{
    id: string;
    project: string;
    category: string;
    impact: number;
    reusedCount: number;
    timestamp: string;
  }>;
  consensus: Array<{
    id: string;
    project: string;
    participants: number;
    confidence: number;
    agreement: number;
    timestamp: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    totalRuns: number;
    successRate: number;
    avgConfidence: number;
    totalCost: number;
    lastRun: string;
    health: 'healthy' | 'warning' | 'critical';
  }>;
}

/**
 * Hook to fetch complete analytics data from backend
 */
export function useIrisAnalytics(): UseQueryResult<IrisAnalytics> {
  return useQuery({
    queryKey: ['iris-analytics'],
    queryFn: async () => {
      try {
        const data = await irisApi.getAnalytics();
        console.log('✅ Fetched analytics from backend:', {
          projects: data.projects?.length,
          modelRuns: data.modelRuns?.length,
          reflexions: data.reflexions?.length,
          totalCost: data.costs?.totalCost,
        });
        return data;
      } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 3,
  });
}

/**
 * Hook to fetch token usage data
 */
export function useTokenUsage(
  projectId?: string,
  timeRange?: string
): UseQueryResult<any> {
  return useQuery({
    queryKey: ['token-usage', projectId, timeRange],
    queryFn: () => irisApi.getTokenUsage(projectId, timeRange),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch cost analytics
 */
export function useCostAnalytics(
  projectId?: string,
  timeRange?: string
): UseQueryResult<any> {
  return useQuery({
    queryKey: ['cost-analytics', projectId, timeRange],
    queryFn: () => irisApi.getCostAnalytics(projectId, timeRange),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch model runs
 */
export function useModelRuns(projectId: string, limit: number = 100): UseQueryResult<any> {
  return useQuery({
    queryKey: ['model-runs', projectId, limit],
    queryFn: () => irisApi.getModelRuns(projectId, limit),
    enabled: !!projectId,
    staleTime: 20000,
  });
}

/**
 * Hook to fetch reflexions
 */
export function useReflexions(projectId: string, limit: number = 50): UseQueryResult<any> {
  return useQuery({
    queryKey: ['reflexions', projectId, limit],
    queryFn: () => irisApi.getReflexions(projectId, limit),
    enabled: !!projectId,
    staleTime: 20000,
  });
}

/**
 * Hook to fetch consensus data
 */
export function useConsensus(projectId: string): UseQueryResult<any> {
  return useQuery({
    queryKey: ['consensus', projectId],
    queryFn: () => irisApi.getConsensus(projectId),
    enabled: !!projectId,
    staleTime: 20000,
  });
}
