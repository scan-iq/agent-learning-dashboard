/**
 * React Query hooks for IRIS Prime dashboard
 * Uses agent-learning-core for data access
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Project, OverviewMetrics, IrisEvent, ProjectDetails } from '@/types/iris';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  getOverviewMetrics,
  getAllProjectsSummary,
  getRecentEvents,
  getAnomalies,
  getLatestIrisReport,
  getIrisReportHistory,
  getProjectExpertStats,
  initSupabase,
  type StoredIrisReport,
  type SystemEvent,
  type Anomaly,
} from '@foxruv/agent-learning-core';

// API Base URL (fallback)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Initialize Supabase on module load with browser-safe config
if (isSupabaseConfigured()) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    initSupabase(supabaseUrl, supabaseKey, {
      projectId: 'iris-prime-console',
      tenantId: 'default',
    });
  }
}

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
 * Transform project summary from agent-learning-core to frontend Project type
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
    avg_latency: 0, // Will be populated from expert stats if needed
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
 * Transform agent anomaly to frontend Anomaly type
 * Note: Types are now the same, so this is just a pass-through
 */
function transformAnomaly(anomaly: Anomaly): Anomaly {
  return anomaly;
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
 */
export function useIrisOverview(): UseQueryResult<IrisOverviewData> {
  return useQuery({
    queryKey: irisQueryKeys.overview,
    queryFn: async () => {
      // Use agent-learning-core functions if Supabase is configured
      if (isSupabaseConfigured()) {
        try {
          // Fetch all data in parallel
          const [metrics, projectSummaries, events, anomalies] = await Promise.all([
            getOverviewMetrics(),
            getAllProjectsSummary(),
            getRecentEvents(undefined, 20),
            getAnomalies(undefined, 20),
          ]);

          console.log('✅ Fetched overview data:', {
            metrics,
            projects: projectSummaries.length,
            events: events.length,
            anomalies: anomalies.length,
          });

          return {
            metrics,
            projects: projectSummaries.map(transformProjectSummary),
            events: events.map(transformEvent),
            anomalies: anomalies.map(transformAnomaly),
          };
        } catch (error) {
          console.error('Error fetching overview data:', error);
          throw error;
        }
      }

      // Fallback to empty data if Supabase is not configured
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
    },
    refetchInterval: 30000,
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
      if (!projectId || !isSupabaseConfigured()) return null;

      try {
        // Fetch project data in parallel
        const [report, history, expertStats] = await Promise.all([
          getLatestIrisReport(projectId),
          getIrisReportHistory({ projectId, limit: 10 }),
          getProjectExpertStats(projectId),
        ]);

        if (!report) return null;

        // Transform to ProjectDetails type
        const projectDetails: ProjectDetails = {
          id: projectId,
          name: projectId,
          status: report.overall_health as ProjectDetails['status'],
          health_score: report.health_score,
          last_run: report.created_at,
          total_runs: history.length,
          success_rate: report.avg_success_rate || 0,
          active_experts: report.total_experts || 0,
          reflexions_count: report.total_reflexions || 0,
          avg_latency: 0,
          recent_errors: [], // Can be populated from logs if needed
          expert_performance: expertStats.map(stat => ({
            expert_id: stat.expertId,
            name: stat.expertName,
            accuracy: stat.accuracy,
            calls: stat.calls,
          })),
          recent_reflexions: [], // Can be populated from reflexions table if needed
          consensus_history: [], // Can be populated from consensus table if needed
        };

        return projectDetails;
      } catch (error) {
        console.error(`Error fetching project details for ${projectId}:`, error);
        return null;
      }
    },
    enabled: !!projectId && isSupabaseConfigured(),
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
        const response = await fetch(`${API_BASE}/api/iris/anomalies`);
        if (!response.ok) throw new Error('Failed to fetch anomalies');
        const data = await response.json();
        return data.data || [];
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
        const response = await fetch(`${API_BASE}/api/iris/events?limit=20`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        return data.data || [];
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
        const response = await fetch(`${API_BASE}/api/iris/patterns`);
        if (!response.ok) throw new Error('Failed to fetch patterns');
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching patterns:', error);
        return [];
      }
    },
    staleTime: 30000,
  });
}
