import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Create a new QueryClient for testing with disabled retries
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * Render with QueryClient provider
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Render with QueryClient and Router providers
 */
export function renderWithRouter(
  ui: ReactElement,
  {
    route = '/',
    ...renderOptions
  }: { route?: string } & Omit<RenderOptions, 'wrapper'> = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Wait for async updates to complete
 */
export const waitForNextUpdate = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock fetch response helper
 */
export const mockFetchResponse = (data: any, ok: boolean = true) => {
  return Promise.resolve({
    ok,
    json: async () => data,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
  } as Response);
};

/**
 * Mock fetch error helper
 */
export const mockFetchError = (message: string = 'Network error') => {
  return Promise.reject(new Error(message));
};

/**
 * Create mock analytics data
 */
export const createMockAnalytics = (overrides = {}) => ({
  overview: {
    totalProjects: 3,
    totalRuns: 150,
    totalCost: 45.67,
    avgConfidence: 0.87,
    successRate: 0.94,
    totalReflexions: 42,
    totalConsensus: 28,
  },
  tokenUsage: {
    totalTokens: 1500000,
    inputTokens: 900000,
    outputTokens: 600000,
    byModel: [
      { model: 'claude-3-opus', tokens: 800000, cost: 25.0 },
      { model: 'gpt-4', tokens: 700000, cost: 20.67 },
    ],
    byProject: [
      { project: 'project-1', tokens: 800000, cost: 24.0 },
      { project: 'project-2', tokens: 700000, cost: 21.67 },
    ],
    overTime: [
      { timestamp: '2025-01-01T00:00:00Z', tokens: 500000, cost: 15.0 },
      { timestamp: '2025-01-02T00:00:00Z', tokens: 600000, cost: 18.0 },
    ],
  },
  costs: {
    totalCost: 45.67,
    byModel: [
      { model: 'claude-3-opus', cost: 25.0, runs: 75 },
      { model: 'gpt-4', cost: 20.67, runs: 75 },
    ],
    byProject: [
      { project: 'project-1', cost: 24.0, runs: 80 },
      { project: 'project-2', cost: 21.67, runs: 70 },
    ],
    overTime: [
      { timestamp: '2025-01-01T00:00:00Z', cost: 15.0 },
      { timestamp: '2025-01-02T00:00:00Z', cost: 18.0 },
    ],
  },
  performance: {
    avgLatency: 234.5,
    avgTokensPerRun: 10000,
    avgCostPerRun: 0.304,
    successRate: 0.94,
    errorRate: 0.06,
  },
  modelRuns: [
    {
      id: 'run-1',
      project: 'project-1',
      model: 'claude-3-opus',
      timestamp: '2025-01-01T12:00:00Z',
      success: true,
      confidence: 0.92,
      latency: 230,
      tokens: 12000,
      cost: 0.36,
    },
    {
      id: 'run-2',
      project: 'project-2',
      model: 'gpt-4',
      timestamp: '2025-01-01T13:00:00Z',
      success: true,
      confidence: 0.88,
      latency: 245,
      tokens: 9500,
      cost: 0.285,
    },
  ],
  reflexions: [
    {
      id: 'ref-1',
      project: 'project-1',
      category: 'optimization',
      impact: 0.15,
      reusedCount: 5,
      timestamp: '2025-01-01T14:00:00Z',
    },
  ],
  consensus: [
    {
      id: 'cons-1',
      project: 'project-1',
      participants: 3,
      confidence: 0.91,
      agreement: 0.87,
      timestamp: '2025-01-01T15:00:00Z',
    },
  ],
  projects: [
    {
      id: 'project-1',
      name: 'Test Project 1',
      totalRuns: 80,
      successRate: 0.95,
      avgConfidence: 0.89,
      totalCost: 24.0,
      lastRun: '2025-01-01T16:00:00Z',
      health: 'healthy' as const,
    },
  ],
  ...overrides,
});

/**
 * Create mock overview data
 */
export const createMockOverview = (overrides = {}) => ({
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
      id: 'proj-1',
      name: 'Project 1',
      status: 'healthy',
      health_score: 0.95,
      last_run: '2025-01-01T12:00:00Z',
      total_runs: 150,
      success_rate: 0.96,
      active_experts: 3,
      reflexions_count: 15,
      avg_latency: 230,
    },
  ],
  events: [
    {
      id: 'evt-1',
      timestamp: '2025-01-01T12:00:00Z',
      project: 'project-1',
      event_type: 'evaluation_complete' as const,
      severity: 'info' as const,
      message: 'Evaluation completed successfully',
      metadata: {},
    },
  ],
  anomalies: [],
  ...overrides,
});

/**
 * Create mock WebSocket message
 */
export const createMockWebSocketMessage = (type: string, data: any) => ({
  type,
  timestamp: new Date().toISOString(),
  data,
});
