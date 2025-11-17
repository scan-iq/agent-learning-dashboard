/**
 * React Query hooks for IRIS Prime dashboard
 * Connects to @foxruv/agent-learning-core Supabase backend
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getIrisReportSummary,
  compareProjectHealth,
  getCriticalReports,
  getIrisReportHistory,
  isSupabaseInitialized,
  type StoredIrisReport,
  type IrisReportSummary,
} from '@foxruv/agent-learning-core';
import { Project, OverviewMetrics, IrisEvent } from '@/types/iris';
import { Anomaly } from '@/lib/mock-data';

// Transform Supabase data to dashboard format
function transformToDashboardProjects(comparison: Awaited<ReturnType<typeof compareProjectHealth>>): Project[] {
  return comparison.map((proj) => ({
    id: proj.project,
    name: proj.project
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    status: proj.overallHealth === 'critical' ? 'critical' :
            proj.overallHealth === 'degraded' ? 'warning' : 'healthy',
    health_score: proj.latestHealthScore,
    last_run: formatTimeAgo(proj.lastReportDate),
    total_runs: 0, // Would need telemetry integration
    success_rate: proj.latestHealthScore, // Approximation
    active_experts: 0, // Would need expert signatures query
    reflexions_count: 0, // Would need reflexions query
    avg_latency: 0, // Would need telemetry integration
  }));
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function transformToEvents(reports: StoredIrisReport[]): IrisEvent[] {
  return reports.slice(0, 10).map((report, idx) => ({
    id: report.id,
    timestamp: report.created_at || new Date().toISOString(),
    project: report.project,
    event_type: report.report_type === 'project_evaluation' ? 'evaluation' :
                report.report_type === 'auto_retrain' ? 'retrain' :
                report.report_type === 'rotation' ? 'rotation' : 'reflexion',
    severity: report.overall_health === 'critical' ? 'critical' :
              report.overall_health === 'degraded' ? 'warning' : 'info',
    message: getEventMessage(report),
    metadata: { health_score: report.health_score },
  }));
}

function getEventMessage(report: StoredIrisReport): string {
  switch (report.report_type) {
    case 'project_evaluation':
      return `Project evaluation completed - Health: ${report.overall_health}`;
    case 'auto_retrain':
      return 'Expert retraining initiated';
    case 'rotation':
      return 'Expert rotation report generated';
    case 'pattern_transfer':
      return 'New pattern learned and stored';
    default:
      return 'System update';
  }
}

function transformToAnomalies(criticalReports: StoredIrisReport[]): Anomaly[] {
  return criticalReports.map((report, idx) => ({
    id: report.id,
    timestamp: report.created_at || new Date().toISOString(),
    project: report.project,
    type: idx % 3 === 0 ? 'health_drop' : idx % 3 === 1 ? 'latency_spike' : 'expert_failure',
    severity: report.overall_health === 'critical' ? 'critical' : 'warning',
    metric: 'Health Score',
    value: report.health_score,
    expected: 85,
    deviation: report.health_score - 85,
    description: `Health score ${report.overall_health}`,
    resolved: false,
  }));
}

interface IrisOverviewData {
  metrics: OverviewMetrics;
  projects: Project[];
  events: IrisEvent[];
  anomalies: Anomaly[];
}

/**
 * Main hook for dashboard overview data
 */
export function useIrisOverview(): UseQueryResult<IrisOverviewData> {
  return useQuery({
    queryKey: ['iris-overview'],
    queryFn: async () => {
      // Check if Supabase is initialized
      if (!isSupabaseInitialized()) {
        console.warn('Supabase not initialized - returning empty data');
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

      try {
        // Fetch data from multiple sources
        const [projectComparison, criticalReports, recentReports] = await Promise.all([
          compareProjectHealth(),
          getCriticalReports({ limit: 10 }),
          getIrisReportHistory({ limit: 20 }),
        ]);

        // Transform to dashboard format
        const projects = transformToDashboardProjects(projectComparison);
        const events = transformToEvents(recentReports);
        const anomalies = transformToAnomalies(criticalReports);

        // Calculate overview metrics
        const metrics: OverviewMetrics = {
          total_projects: projects.length,
          healthy_projects: projects.filter(p => p.status === 'healthy').length,
          warning_projects: projects.filter(p => p.status === 'warning').length,
          critical_projects: projects.filter(p => p.status === 'critical').length,
          total_runs_today: recentReports.length,
          avg_success_rate: projects.length > 0
            ? projects.reduce((sum, p) => sum + p.success_rate, 0) / projects.length
            : 0,
          active_experts: 0, // Would need expert signatures integration
          total_reflexions: 0, // Would need reflexions integration
        };

        return {
          metrics,
          projects,
          events,
          anomalies,
        };
      } catch (error) {
        console.error('Error fetching IRIS overview:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Hook for individual project data
 */
export function useProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: ['project-details', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      try {
        const summary = await getIrisReportSummary(projectId, 7);
        const history = await getIrisReportHistory({
          projectId,
          limit: 10,
        });

        return {
          summary,
          history,
        };
      } catch (error) {
        console.error(`Error fetching project details for ${projectId}:`, error);
        throw error;
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
    queryKey: ['anomalies'],
    queryFn: async () => {
      try {
        const criticalReports = await getCriticalReports({ limit: 20 });
        return transformToAnomalies(criticalReports);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}

/**
 * Hook for recent events
 */
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const reports = await getIrisReportHistory({ limit: 20 });
        return transformToEvents(reports);
      } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
