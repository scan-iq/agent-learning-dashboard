import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { renderWithProviders, createMockAnalytics } from '@/test/utils';
import { useIrisAnalytics } from '@/hooks/useIrisAnalytics';

// Mock the hook
vi.mock('@/hooks/useIrisAnalytics');

// Mock Recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    } as any);

    const { container } = renderWithProviders(<AnalyticsDashboard />);

    // Should show skeleton loaders - check for skeleton class
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to load analytics';
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
      isError: true,
      isSuccess: false,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    expect(screen.getByText('Failed to Load Analytics')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render null when data is undefined', () => {
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    const { container } = renderWithProviders(<AnalyticsDashboard />);
    expect(container.firstChild).toBeNull();
  });

  it('should render overview cards with correct data', () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    // Check Total Runs card
    expect(screen.getByText('Total Runs')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    // Check Total Cost card
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('$45.67')).toBeInTheDocument();

    // Check Avg Confidence card
    expect(screen.getByText('Avg Confidence')).toBeInTheDocument();
    expect(screen.getByText('87.0%')).toBeInTheDocument();

    // Check Token Usage card
    expect(screen.getByText('Token Usage')).toBeInTheDocument();
    expect(screen.getByText('1.50M')).toBeInTheDocument();
  });

  it('should render tabs for different analytics sections', () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    expect(screen.getByRole('tab', { name: /token usage/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /costs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /recent runs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /reflexions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /consensus/i })).toBeInTheDocument();
  });

  it('should display model runs in the Recent Runs tab', async () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    // Click on Recent Runs tab
    const runsTab = screen.getByRole('tab', { name: /recent runs/i });
    runsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Recent Model Runs')).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('project-1'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('claude-3-opus'))).toBeInTheDocument();
      expect(screen.getByText((content, element) => content.includes('92.0%'))).toBeInTheDocument();
    });
  });

  it('should display reflexions in the Reflexions tab', async () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    const reflexionsTab = screen.getByRole('tab', { name: /reflexions/i });
    reflexionsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Reflexion Insights')).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('optimization'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('15.0%'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('5x'))).toBeInTheDocument();
    });
  });

  it('should display consensus data in the Consensus tab', async () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    const consensusTab = screen.getByRole('tab', { name: /consensus/i });
    consensusTab.click();

    await waitFor(() => {
      expect(screen.getByText('Consensus Decisions')).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('3 models'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('91.0%'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('87.0%'))).toBeInTheDocument();
    });
  });

  it('should display projects overview', () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    expect(screen.getByText('Projects Overview')).toBeInTheDocument();
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('healthy')).toBeInTheDocument();
    expect(screen.getByText('Runs:')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('Success Rate:')).toBeInTheDocument();
    expect(screen.getByText('95.0%')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    const emptyData = createMockAnalytics({
      modelRuns: [],
      reflexions: [],
      consensus: [],
      projects: [],
    });

    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: emptyData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    // Should still render overview cards
    expect(screen.getByText('Total Runs')).toBeInTheDocument();
  });

  it('should display success rate correctly', () => {
    const mockData = createMockAnalytics({
      overview: {
        totalRuns: 100,
        successRate: 0.856,
      },
    });

    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    // Should show success rate with 1 decimal place
    expect(screen.getByText(/Success Rate: 85\.6%/i)).toBeInTheDocument();
  });

  it('should display cost per run correctly', () => {
    const mockData = createMockAnalytics({
      performance: {
        avgCostPerRun: 0.3045,
      },
    });

    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    // Should show cost with 4 decimal places
    expect(screen.getByText(/Avg per run: \$0\.3045/i)).toBeInTheDocument();
  });

  it('should handle zero values correctly', () => {
    const zeroData = createMockAnalytics({
      overview: {
        totalRuns: 0,
        totalCost: 0,
        avgConfidence: 0,
        successRate: 0,
      },
      tokenUsage: {
        totalTokens: 0,
      },
      performance: {
        avgCostPerRun: 0,
      },
    });

    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: zeroData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('should render charts in token usage tab', async () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    // Token Usage tab should be active by default
    await waitFor(() => {
      expect(screen.getByText('Token Usage Over Time')).toBeInTheDocument();
      expect(screen.getByText('Token Usage by Model')).toBeInTheDocument();
      expect(screen.getAllByTestId('area-chart')).toHaveLength(1);
      expect(screen.getAllByTestId('bar-chart')).toHaveLength(1);
    });
  });

  it('should render charts in costs tab', async () => {
    const mockData = createMockAnalytics();
    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    const costsTab = screen.getByRole('tab', { name: /costs/i });
    costsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Cost Trends')).toBeInTheDocument();
      expect(screen.getByText('Cost by Project')).toBeInTheDocument();
      expect(screen.getAllByTestId('line-chart')).toHaveLength(1);
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(1);
    });
  });

  it('should display badge colors for project health', () => {
    const mockData = createMockAnalytics({
      projects: [
        {
          id: 'p1',
          name: 'Healthy Project',
          health: 'healthy' as const,
          totalRuns: 100,
          successRate: 0.95,
          avgConfidence: 0.9,
          totalCost: 10,
          lastRun: '2025-01-01T00:00:00Z',
        },
        {
          id: 'p2',
          name: 'Warning Project',
          health: 'warning' as const,
          totalRuns: 50,
          successRate: 0.7,
          avgConfidence: 0.6,
          totalCost: 5,
          lastRun: '2025-01-01T00:00:00Z',
        },
        {
          id: 'p3',
          name: 'Critical Project',
          health: 'critical' as const,
          totalRuns: 25,
          successRate: 0.4,
          avgConfidence: 0.3,
          totalCost: 2,
          lastRun: '2025-01-01T00:00:00Z',
        },
      ],
    });

    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    expect(screen.getByText('Healthy Project')).toBeInTheDocument();
    expect(screen.getByText('Warning Project')).toBeInTheDocument();
    expect(screen.getByText('Critical Project')).toBeInTheDocument();
  });

  it('should handle model run with failed status', async () => {
    const mockData = createMockAnalytics({
      modelRuns: [
        {
          id: 'run-fail',
          project: 'test-project',
          model: 'gpt-4',
          timestamp: '2025-01-01T12:00:00Z',
          success: false,
          confidence: 0,
          latency: 100,
          tokens: 5000,
          cost: 0.15,
        },
      ],
    });

    vi.mocked(useIrisAnalytics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any);

    renderWithProviders(<AnalyticsDashboard />);

    const runsTab = screen.getByRole('tab', { name: /recent runs/i });
    runsTab.click();

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('test-project'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('gpt-4'))).toBeInTheDocument();
    });
  });
});
