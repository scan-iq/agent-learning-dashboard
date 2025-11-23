/**
 * React Query hooks for IRIS dashboard
 * Calls API routes - NO server-side code imported!
 *
 * NOTE: This hooks file uses internal API routes (/api/overview, /api/project-details, etc.)
 * For backend IRIS API integration, use useIrisAnalytics.ts instead
 *
 * ENHANCED: Now supports real-time updates via midstreamer WebSocket/SSE
 */

import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { Project, OverviewMetrics, IrisEvent, ProjectDetails } from '@/types/iris';
import { irisApi } from '@/lib/api-client';
import { useMidstreamer } from '@/hooks/useMidstreamer';

/**
 * Type imports only (not bundled into browser)
 */
type Anomaly = any; // Will get from API
type SystemEvent = any;
type StoredIrisReport = any;

/**
 * Overview data structure
 */
export interface IrisOverviewData {
  metrics: OverviewMetrics;
  projects: Project[];
  events: IrisEvent[];
  anomalies: Anomaly[];
}

/**
 * Transform project summary to frontend Project type
 */
function transformProjectSummary(summary: any): Project {
  return {
    id: summary.project,
    name: summary.project,
    status: summary.overallHealth,
    health_score: summary.latestHealthScore,
    last_run: summary.lastReportDate,
    total_runs: summary.totalRuns,
    success_rate: summary.avgSuccessRate,
    active_experts: summary.activeExperts,
    reflexions_count: summary.totalReflexions,
    avg_latency: 0,
  };
}

/**
 * Transform system event to frontend IrisEvent type
 */
function transformEvent(event: SystemEvent): IrisEvent {
  return {
    id: event.id,
    timestamp: event.timestamp,
    project: event.project,
    event_type: event.event_type as IrisEvent['event_type'],
    severity: event.severity as IrisEvent['severity'],
    message: event.message,
    metadata: event.metadata,
  };
}

/**
 * Query keys for react-query
 */
export const irisQueryKeys = {
  overview: ['iris-overview'],
  project: (id: string) => ['project-details', id],
  anomalies: ['anomalies'],
  events: ['events'],
  patterns: ['patterns'],
};

/**
 * Main hook for dashboard overview data
 * Calls /api/overview endpoint (server-side)
 */
export function useIrisOverview(): UseQueryResult<IrisOverviewData> {
  return useQuery({
    queryKey: irisQueryKeys.overview,
    queryFn: async () => {
      try {
        const data = await irisApi.getOverview();

        console.log('✅ Fetched overview data from API:', {
          metrics: data.metrics,
          projects: data.projects.length,
          events: data.events.length,
          anomalies: data.anomalies.length,
        });

        return {
          metrics: data.metrics || {},
          projects: Array.isArray(data.projects) ? data.projects.map(transformProjectSummary) : [],
          events: Array.isArray(data.events) ? data.events.map(transformEvent) : [],
          anomalies: Array.isArray(data.anomalies) ? data.anomalies : [],
        };
      } catch (error) {
        console.error('Error fetching overview data:', error);

        // Return empty data on error
        return {
          metrics: {
            total_projects: 0,
            healthy_projects: 0,
            warning_projects: 0,
            critical_projects: 0,
            total_runs_today: 0,
            avg_success_rate: 0,
            active_experts: 0,
            total_reflexions: 0,
          },
          projects: [],
          events: [],
          anomalies: [],
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}

/**
 * Hook for individual project data
 */
export function useProjectDetails(projectId: string | null): UseQueryResult<ProjectDetails | null> {
  return useQuery({
    queryKey: irisQueryKeys.project(projectId || ''),
    queryFn: async () => {
      if (!projectId) return null;

      try {
        const response = await fetch(`/api/project-details?id=${projectId}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Error fetching project details for ${projectId}:`, error);
        return null;
      }
    },
    enabled: !!projectId,
    staleTime: 15000,
  });
}

/**
 * Hook for anomaly data
 */
export function useAnomalies() {
  return useQuery({
    queryKey: irisQueryKeys.anomalies,
    queryFn: async () => {
      try {
        const response = await fetch('/api/anomalies');
        if (!response.ok) throw new Error('Failed to fetch anomalies');
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching anomalies:', error);
        return [];
      }
    },
    staleTime: 20000,
  });
}

/**
 * Hook for events data
 */
export function useEvents() {
  return useQuery({
    queryKey: irisQueryKeys.events,
    queryFn: async () => {
      try {
        const response = await fetch('/api/events?limit=20');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

/**
 * Hook for patterns data
 */
export function usePatterns() {
  return useQuery({
    queryKey: irisQueryKeys.patterns,
    queryFn: async () => {
      try {
        const response = await fetch('/api/patterns');
        if (!response.ok) throw new Error('Failed to fetch patterns');
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching patterns:', error);
        return [];
      }
    },
    staleTime: 30000,
  });
}

/**
 * REAL-TIME ENHANCED HOOKS
 * These hooks combine React Query (for initial load) with midstreamer (for live updates)
 */

/**
 * Real-time overview hook with hybrid polling + WebSocket/SSE
 * - Uses React Query for initial data load and caching
 * - Switches to midstreamer for real-time incremental updates
 * - Automatically merges real-time updates with cached data
 * - Falls back to polling if WebSocket/SSE connection fails
 */
export function useRealtimeOverview(options?: {
  enableRealtime?: boolean;
  realtimeEndpoint?: string;
}): UseQueryResult<IrisOverviewData> & { isLive: boolean } {
  const { enableRealtime = true, realtimeEndpoint = '/api/stream/overview' } = options || {};
  const queryClient = useQueryClient();

  // Initial load via React Query (with 30s polling fallback)
  const queryResult = useIrisOverview();

  // Real-time updates via midstreamer
  const {
    data: realtimeData,
    isConnected: isLive,
  } = useMidstreamer<Partial<IrisOverviewData>>(realtimeEndpoint, {
    reconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

  /**
   * Merge real-time updates into React Query cache
   * This creates a seamless experience where initial data comes from REST API
   * and subsequent updates stream in via WebSocket/SSE
   */
  const mergeRealtimeData = useCallback((
    cachedData: IrisOverviewData | undefined,
    liveData: Partial<IrisOverviewData> | null
  ): IrisOverviewData | undefined => {
    if (!liveData || !cachedData) return cachedData;

    return {
      // Merge metrics (real-time takes precedence)
      metrics: liveData.metrics || cachedData.metrics,

      // Merge projects (update existing, add new)
      projects: liveData.projects
        ? mergeArrays(cachedData.projects, liveData.projects, 'id')
        : cachedData.projects,

      // Prepend new events to existing events
      events: liveData.events
        ? [...liveData.events, ...cachedData.events].slice(0, 100)
        : cachedData.events,

      // Merge anomalies
      anomalies: liveData.anomalies
        ? mergeArrays(cachedData.anomalies, liveData.anomalies, 'id')
        : cachedData.anomalies,
    };
  }, []);

  /**
   * Update React Query cache when real-time data arrives
   */
  useEffect(() => {
    if (!enableRealtime || !realtimeData || !isLive) return;

    queryClient.setQueryData<IrisOverviewData>(
      irisQueryKeys.overview,
      (oldData) => mergeRealtimeData(oldData, realtimeData)
    );

    console.log('✅ Real-time update applied to cache');
  }, [realtimeData, isLive, enableRealtime, queryClient, mergeRealtimeData]);

  /**
   * Disable React Query polling when real-time connection is active
   * This prevents redundant polling when we have live updates
   */
  useEffect(() => {
    if (isLive && enableRealtime) {
      console.log('🔴 Disabling React Query polling (real-time active)');
      queryClient.setQueryDefaults(irisQueryKeys.overview, {
        refetchInterval: false,
      });
    } else {
      console.log('🟢 Enabling React Query polling (real-time inactive)');
      queryClient.setQueryDefaults(irisQueryKeys.overview, {
        refetchInterval: 30000,
      });
    }
  }, [isLive, enableRealtime, queryClient]);

  return {
    ...queryResult,
    isLive: enableRealtime && isLive,
  };
}

/**
 * Real-time events hook with incremental updates
 */
export function useRealtimeEvents(options?: {
  enableRealtime?: boolean;
  realtimeEndpoint?: string;
}) {
  const { enableRealtime = true, realtimeEndpoint = '/api/stream/events' } = options || {};
  const queryClient = useQueryClient();

  // Initial load via React Query
  const queryResult = useEvents();

  // Real-time updates via midstreamer
  const {
    data: realtimeEvent,
    isConnected: isLive,
  } = useMidstreamer<IrisEvent>(realtimeEndpoint, {
    reconnect: true,
    reconnectInterval: 3000,
  });

  // Prepend new events to cache
  useEffect(() => {
    if (!enableRealtime || !realtimeEvent || !isLive) return;

    queryClient.setQueryData<IrisEvent[]>(
      irisQueryKeys.events,
      (oldData = []) => [realtimeEvent, ...oldData].slice(0, 100)
    );
  }, [realtimeEvent, isLive, enableRealtime, queryClient]);

  return {
    ...queryResult,
    isLive: enableRealtime && isLive,
  };
}

/**
 * Helper: Merge arrays by unique identifier
 * Updates existing items and adds new ones
 */
function mergeArrays<T extends Record<string, any>>(
  existing: T[],
  incoming: T[],
  idKey: keyof T
): T[] {
  const merged = new Map<any, T>();

  // Add existing items
  existing.forEach((item) => merged.set(item[idKey], item));

  // Update with incoming items (newer data wins)
  incoming.forEach((item) => merged.set(item[idKey], item));

  return Array.from(merged.values());
}
