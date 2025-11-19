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
        const response = await irisApi.getAnalytics();
        // Handle wrapped response {success: true, data: {...}}
        const backendData = response.data || response;

        console.log('📡 Raw backend data:', {
          hasOverview: !!backendData.overview,
          hasTokens: !!backendData.tokens,
          hasPerformance: !!backendData.performance,
          hasRecent: !!backendData.recent,
          keys: Object.keys(backendData),
        });

        // Transform backend structure to match frontend expectations
        const transformed: IrisAnalytics = {
          overview: {
            totalProjects: 1, // Single project per API key
            totalRuns: backendData.overview?.totalModelRuns || 0,
            totalCost: backendData.tokens?.totalCostUsd || 0,
            avgConfidence: backendData.performance?.avgConfidence || 0,
            successRate: backendData.performance?.successRate || 0,
            totalReflexions: backendData.overview?.totalReflexions || 0,
            totalConsensus: backendData.overview?.totalConsensusDecisions || 0,
          },

          tokenUsage: {
            totalTokens: (backendData.tokens?.totalTokensIn || 0) + (backendData.tokens?.totalTokensOut || 0),
            inputTokens: backendData.tokens?.totalTokensIn || 0,
            outputTokens: backendData.tokens?.totalTokensOut || 0,
            byModel: [], // Backend doesn't provide this yet
            byProject: [{
              project: backendData.projectName || backendData.projectId || 'Unknown',
              tokens: (backendData.tokens?.totalTokensIn || 0) + (backendData.tokens?.totalTokensOut || 0),
              cost: backendData.tokens?.totalCostUsd || 0,
            }],
            overTime: [], // Backend doesn't provide time series yet
          },

          costs: {
            totalCost: backendData.tokens?.totalCostUsd || 0,
            byModel: [], // Backend doesn't provide this yet
            byProject: [{
              project: backendData.projectName || backendData.projectId || 'Unknown',
              cost: backendData.tokens?.totalCostUsd || 0,
              runs: backendData.overview?.totalModelRuns || 0,
            }],
            overTime: [], // Backend doesn't provide time series yet
          },

          performance: {
            avgLatency: backendData.performance?.avgLatencyMs || 0,
            avgTokensPerRun: backendData.tokens?.avgTokensPerRun || 0,
            avgCostPerRun: backendData.overview?.totalModelRuns > 0
              ? (backendData.tokens?.totalCostUsd || 0) / backendData.overview.totalModelRuns
              : 0,
            successRate: backendData.performance?.successRate || 0,
            errorRate: 1 - (backendData.performance?.successRate || 0),
          },

          modelRuns: (backendData.recent?.modelRuns || []).map((run: any) => ({
            id: `run-${run.timestamp}`,
            project: backendData.projectName || backendData.projectId || 'Unknown',
            model: run.expertId || 'unknown',
            timestamp: run.timestamp,
            success: run.outcome === 'success',
            confidence: run.confidence || 0,
            latency: 0, // Not in backend data
            tokens: run.tokensUsed || 0,
            cost: run.costUsd || 0,
          })),

          reflexions: (backendData.recent?.reflexions || []).map((ref: any) => ({
            id: `ref-${ref.timestamp}`,
            project: backendData.projectName || backendData.projectId || 'Unknown',
            category: ref.type || 'unknown',
            impact: ref.impactScore || 0,
            reusedCount: 0, // Not in recent data
            timestamp: ref.timestamp,
          })),

          consensus: (backendData.recent?.consensusDecisions || []).map((cons: any) => ({
            id: `cons-${cons.timestamp}`,
            project: backendData.projectName || backendData.projectId || 'Unknown',
            participants: cons.expertsCount || 0,
            confidence: cons.confidence || 0,
            agreement: 1 - (cons.disagreement || 0),
            timestamp: cons.timestamp,
          })),

          projects: [{
            id: backendData.projectId || 'unknown',
            name: backendData.projectName || backendData.projectId || 'Unknown Project',
            totalRuns: backendData.overview?.totalModelRuns || 0,
            successRate: backendData.performance?.successRate || 0,
            avgConfidence: backendData.performance?.avgConfidence || 0,
            totalCost: backendData.tokens?.totalCostUsd || 0,
            lastRun: backendData.recent?.modelRuns?.[0]?.timestamp || new Date().toISOString(),
            health: (backendData.performance?.successRate || 0) > 0.8
              ? 'healthy'
              : (backendData.performance?.successRate || 0) > 0.5
                ? 'warning'
                : 'critical',
          }],
        };

        console.log('✅ Transformed analytics data:', {
          totalRuns: transformed.overview.totalRuns,
          totalCost: transformed.costs.totalCost,
          modelRuns: transformed.modelRuns.length,
          reflexions: transformed.reflexions.length,
          consensus: transformed.consensus.length,
          projects: transformed.projects.length,
        });

        return transformed;
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
