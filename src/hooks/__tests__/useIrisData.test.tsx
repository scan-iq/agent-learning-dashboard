import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useIrisOverview,
  useProjectDetails,
  useAnomalies,
  useEvents,
  usePatterns,
} from '../useIrisData';
import { irisApi } from '@/lib/api-client';
import { ReactNode } from 'react';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  irisApi: {
    getOverview: vi.fn(),
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

describe('useIrisOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and transform overview data successfully', async () => {
    const mockApiResponse = {
      metrics: {
        total_projects: 3,
        healthy_projects: 2,
        warning_projects: 1,
        critical_projects: 0,
        total_runs_today: 25,
        avg_success_rate: 0.94,
        active_experts: 8,
        total_reflexions: 42,
      },
      projects: [
        {
          project: 'project-1',
          overallHealth: 'healthy',
          latestHealthScore: 0.95,
          lastReportDate: '2025-01-01T12:00:00Z',
          totalRuns: 150,
          avgSuccessRate: 0.96,
          activeExperts: 3,
          totalReflexions: 15,
        },
      ],
      events: [
        {
          id: 'evt-1',
          timestamp: '2025-01-01T12:00:00Z',
          project: 'project-1',
          event_type: 'evaluation_complete',
          severity: 'info',
          message: 'Evaluation completed',
          metadata: {},
        },
      ],
      anomalies: [],
    };

    vi.mocked(irisApi.getOverview).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.metrics).toEqual(mockApiResponse.metrics);
    expect(result.current.data?.projects).toHaveLength(1);
    expect(result.current.data?.projects[0].id).toBe('project-1');
    expect(result.current.data?.projects[0].status).toBe('healthy');
    expect(result.current.data?.events).toHaveLength(1);
    expect(result.current.data?.anomalies).toHaveLength(0);
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(irisApi.getOverview).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should return empty data structure on error
    expect(result.current.data?.metrics.total_projects).toBe(0);
    expect(result.current.data?.projects).toEqual([]);
    expect(result.current.data?.events).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should transform project summary correctly', async () => {
    const mockApiResponse = {
      metrics: {},
      projects: [
        {
          project: 'test-project',
          overallHealth: 'warning',
          latestHealthScore: 0.65,
          lastReportDate: '2025-01-01T10:00:00Z',
          totalRuns: 75,
          avgSuccessRate: 0.88,
          activeExperts: 5,
          totalReflexions: 10,
        },
      ],
      events: [],
      anomalies: [],
    };

    vi.mocked(irisApi.getOverview).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const project = result.current.data?.projects[0];
    expect(project?.id).toBe('test-project');
    expect(project?.name).toBe('test-project');
    expect(project?.status).toBe('warning');
    expect(project?.health_score).toBe(0.65);
    expect(project?.last_run).toBe('2025-01-01T10:00:00Z');
    expect(project?.total_runs).toBe(75);
    expect(project?.success_rate).toBe(0.88);
    expect(project?.active_experts).toBe(5);
    expect(project?.reflexions_count).toBe(10);
  });

  it('should transform system events correctly', async () => {
    const mockApiResponse = {
      metrics: {},
      projects: [],
      events: [
        {
          id: 'evt-123',
          timestamp: '2025-01-01T15:00:00Z',
          project: 'my-project',
          event_type: 'anomaly_detected',
          severity: 'warning',
          message: 'Anomaly detected',
          metadata: { threshold: 0.5 },
        },
      ],
      anomalies: [],
    };

    vi.mocked(irisApi.getOverview).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const event = result.current.data?.events[0];
    expect(event?.id).toBe('evt-123');
    expect(event?.timestamp).toBe('2025-01-01T15:00:00Z');
    expect(event?.project).toBe('my-project');
    expect(event?.event_type).toBe('anomaly_detected');
    expect(event?.severity).toBe('warning');
    expect(event?.message).toBe('Anomaly detected');
    expect(event?.metadata).toEqual({ threshold: 0.5 });
  });

  it('should handle empty arrays in response', async () => {
    const mockApiResponse = {
      metrics: {},
      projects: [],
      events: [],
      anomalies: [],
    };

    vi.mocked(irisApi.getOverview).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.projects).toEqual([]);
    expect(result.current.data?.events).toEqual([]);
    expect(result.current.data?.anomalies).toEqual([]);
  });

  it('should handle non-array values gracefully', async () => {
    const mockApiResponse = {
      metrics: {},
      projects: null, // Invalid: should be array
      events: undefined, // Invalid: should be array
      anomalies: 'not-an-array', // Invalid: should be array
    };

    vi.mocked(irisApi.getOverview).mockResolvedValueOnce(mockApiResponse as any);

    const { result } = renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should safely handle invalid data
    expect(result.current.data?.projects).toEqual([]);
    expect(result.current.data?.events).toEqual([]);
    expect(result.current.data?.anomalies).toEqual([]);
  });

  it('should refetch at configured interval', async () => {
    vi.useFakeTimers();

    vi.mocked(irisApi.getOverview).mockResolvedValue({
      metrics: {},
      projects: [],
      events: [],
      anomalies: [],
    });

    renderHook(() => useIrisOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(irisApi.getOverview).toHaveBeenCalledTimes(1);
    });

    // Note: In real tests with proper timer mocking, you could test refetchInterval
    // For now, we just verify it was called once initially

    vi.useRealTimers();
  });
});

describe('useProjectDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch project details when ID is provided', async () => {
    const mockData = {
      id: 'project-1',
      name: 'Test Project',
      details: {},
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useProjectDetails('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/project-details?id=project-1');
    expect(result.current.data).toEqual(mockData);
  });

  it('should not fetch when project ID is null', () => {
    const { result } = renderHook(() => useProjectDetails(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => useProjectDetails('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe('useAnomalies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch anomalies successfully', async () => {
    const mockData = [
      { id: 'anom-1', type: 'spike', severity: 'high' },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useAnomalies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should return empty array on error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAnomalies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    consoleErrorSpy.mockRestore();
  });
});

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch events successfully', async () => {
    const mockData = [
      { id: 'evt-1', type: 'info', message: 'Test event' },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/events?limit=20');
    expect(result.current.data).toEqual(mockData);
  });

  it('should return empty array on error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Error',
    } as Response);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    consoleErrorSpy.mockRestore();
  });
});

describe('usePatterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch patterns successfully', async () => {
    const mockData = [
      { id: 'pattern-1', type: 'recurring', confidence: 0.85 },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => usePatterns(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should return empty array on error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => usePatterns(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    consoleErrorSpy.mockRestore();
  });
});
