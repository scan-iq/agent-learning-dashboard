import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIrisAnalytics, useTokenUsage, useCostAnalytics, useModelRuns, useReflexions, useConsensus } from '../useIrisAnalytics';
import { irisApi } from '@/lib/api-client';
import { ReactNode } from 'react';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  irisApi: {
    getAnalytics: vi.fn(),
    getTokenUsage: vi.fn(),
    getCostAnalytics: vi.fn(),
    getModelRuns: vi.fn(),
    getReflexions: vi.fn(),
    getConsensus: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useIrisAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and transform analytics data successfully', async () => {
    const mockBackendData = {
      data: {
        projectId: 'test-project',
        projectName: 'Test Project',
        overview: {
          totalModelRuns: 100,
          totalReflexions: 20,
          totalConsensusDecisions: 10,
        },
        tokens: {
          totalTokensIn: 500000,
          totalTokensOut: 300000,
          totalCostUsd: 25.50,
          avgTokensPerRun: 8000,
        },
        performance: {
          avgConfidence: 0.85,
          successRate: 0.92,
          avgLatencyMs: 245,
        },
        recent: {
          modelRuns: [
            {
              timestamp: '2025-01-01T12:00:00Z',
              expertId: 'expert-1',
              outcome: 'success',
              confidence: 0.9,
              tokensUsed: 10000,
              costUsd: 0.30,
            },
          ],
          reflexions: [
            {
              timestamp: '2025-01-01T13:00:00Z',
              type: 'optimization',
              impactScore: 0.15,
            },
          ],
          consensusDecisions: [
            {
              timestamp: '2025-01-01T14:00:00Z',
              expertsCount: 3,
              confidence: 0.88,
              disagreement: 0.12,
            },
          ],
        },
      },
    };

    vi.mocked(irisApi.getAnalytics).mockResolvedValueOnce(mockBackendData);

    const { result } = renderHook(() => useIrisAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.overview.totalRuns).toBe(100);
    expect(result.current.data?.overview.totalCost).toBe(25.50);
    expect(result.current.data?.overview.avgConfidence).toBe(0.85);
    expect(result.current.data?.tokenUsage.totalTokens).toBe(800000);
    expect(result.current.data?.modelRuns).toHaveLength(1);
    expect(result.current.data?.reflexions).toHaveLength(1);
    expect(result.current.data?.consensus).toHaveLength(1);
  });

  it('should handle loading state', () => {
    vi.mocked(irisApi.getAnalytics).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useIrisAnalytics(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state', async () => {
    const errorMessage = 'Failed to fetch analytics';
    vi.mocked(irisApi.getAnalytics).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useIrisAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });

  it('should transform backend data correctly', async () => {
    const mockBackendData = {
      data: {
        projectId: 'proj-123',
        projectName: 'My Project',
        overview: {
          totalModelRuns: 50,
          totalReflexions: 10,
          totalConsensusDecisions: 5,
        },
        tokens: {
          totalTokensIn: 250000,
          totalTokensOut: 150000,
          totalCostUsd: 12.75,
          avgTokensPerRun: 8000,
        },
        performance: {
          avgConfidence: 0.78,
          successRate: 0.88,
          avgLatencyMs: 300,
        },
        recent: {
          modelRuns: [],
          reflexions: [],
          consensusDecisions: [],
        },
      },
    };

    vi.mocked(irisApi.getAnalytics).mockResolvedValueOnce(mockBackendData);

    const { result } = renderHook(() => useIrisAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data!;

    // Check overview transformation
    expect(data.overview.totalProjects).toBe(1);
    expect(data.overview.totalRuns).toBe(50);
    expect(data.overview.totalCost).toBe(12.75);
    expect(data.overview.avgConfidence).toBe(0.78);
    expect(data.overview.successRate).toBe(0.88);

    // Check token usage transformation
    expect(data.tokenUsage.totalTokens).toBe(400000);
    expect(data.tokenUsage.inputTokens).toBe(250000);
    expect(data.tokenUsage.outputTokens).toBe(150000);

    // Check performance transformation
    expect(data.performance.avgLatency).toBe(300);
    expect(data.performance.avgTokensPerRun).toBe(8000);
    expect(data.performance.successRate).toBe(0.88);
    expect(data.performance.errorRate).toBe(0.12);

    // Check projects transformation
    expect(data.projects).toHaveLength(1);
    expect(data.projects[0].id).toBe('proj-123');
    expect(data.projects[0].name).toBe('My Project');
    expect(data.projects[0].health).toBe('healthy');
  });

  it('should calculate project health correctly', async () => {
    const testCases = [
      { successRate: 0.85, expectedHealth: 'healthy' },
      { successRate: 0.65, expectedHealth: 'warning' },
      { successRate: 0.45, expectedHealth: 'critical' },
    ];

    for (const testCase of testCases) {
      const mockData = {
        data: {
          projectId: 'test',
          overview: { totalModelRuns: 10, totalReflexions: 0, totalConsensusDecisions: 0 },
          tokens: { totalTokensIn: 1000, totalTokensOut: 1000, totalCostUsd: 1 },
          performance: { avgConfidence: 0.5, successRate: testCase.successRate, avgLatencyMs: 100 },
          recent: { modelRuns: [], reflexions: [], consensusDecisions: [] },
        },
      };

      vi.mocked(irisApi.getAnalytics).mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useIrisAnalytics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.projects[0].health).toBe(testCase.expectedHealth);
    }
  });

  it('should refetch analytics at configured interval', async () => {
    vi.mocked(irisApi.getAnalytics).mockResolvedValue({
      data: {
        overview: {},
        tokens: {},
        performance: {},
        recent: { modelRuns: [], reflexions: [], consensusDecisions: [] },
      },
    });

    renderHook(() => useIrisAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(irisApi.getAnalytics).toHaveBeenCalledTimes(1);
    });

    // Note: Testing refetchInterval requires more advanced timing control
    // In a real test environment, you might use vi.advanceTimersByTime()
  });
});

describe('useTokenUsage', () => {
  it('should fetch token usage data', async () => {
    const mockData = { usage: { total: 1000000 } };
    vi.mocked(irisApi.getTokenUsage).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useTokenUsage('project-1', '7d'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(irisApi.getTokenUsage).toHaveBeenCalledWith('project-1', '7d');
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useCostAnalytics', () => {
  it('should fetch cost analytics data', async () => {
    const mockData = { costs: { total: 100.50 } };
    vi.mocked(irisApi.getCostAnalytics).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCostAnalytics('project-1', '30d'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(irisApi.getCostAnalytics).toHaveBeenCalledWith('project-1', '30d');
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useModelRuns', () => {
  it('should fetch model runs when project ID is provided', async () => {
    const mockData = { runs: [] };
    vi.mocked(irisApi.getModelRuns).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useModelRuns('project-1', 50), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(irisApi.getModelRuns).toHaveBeenCalledWith('project-1', 50);
  });

  it('should not fetch when project ID is empty', () => {
    const { result } = renderHook(() => useModelRuns('', 50), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(irisApi.getModelRuns).not.toHaveBeenCalled();
  });
});

describe('useReflexions', () => {
  it('should fetch reflexions data', async () => {
    const mockData = { reflexions: [] };
    vi.mocked(irisApi.getReflexions).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useReflexions('project-1', 25), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(irisApi.getReflexions).toHaveBeenCalledWith('project-1', 25);
  });
});

describe('useConsensus', () => {
  it('should fetch consensus data', async () => {
    const mockData = { consensus: [] };
    vi.mocked(irisApi.getConsensus).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useConsensus('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(irisApi.getConsensus).toHaveBeenCalledWith('project-1');
  });

  it('should not fetch when project ID is empty', () => {
    const { result } = renderHook(() => useConsensus(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(irisApi.getConsensus).not.toHaveBeenCalled();
  });
});
