/**
 * React Query hooks for IRIS Prime dashboard
 * Calls API routes - NO server-side code imported!
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Project, OverviewMetrics, IrisEvent, ProjectDetails } from '@/types/iris';

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
        const response = await fetch('/api/overview');

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

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
