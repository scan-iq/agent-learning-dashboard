/**
 * Get Metrics - IRIS API Wrapper
 *
 * Retrieves global system metrics and statistics
 */

import { apiRequest, buildQueryString } from './client';
import type { GetMetricsArgs, GlobalMetrics } from './types';

/**
 * Get global system metrics
 *
 * @param args - Metrics query arguments
 * @returns Global metrics including health, performance, and activity stats
 *
 * @example
 * ```typescript
 * const metrics = await getMetrics({
 *   timeRange: '24h',
 *   projectId: 'nfl-predictor' // optional
 * });
 *
 * console.log(`Total Projects: ${metrics.totalProjects}`);
 * console.log(`Success Rate: ${metrics.successRate}%`);
 * console.log(`Avg Health Score: ${metrics.avgHealthScore}`);
 * ```
 */
export async function getMetrics(
  args: GetMetricsArgs = {}
): Promise<GlobalMetrics> {
  const { timeRange = '24h', projectId } = args;

  const queryParams = buildQueryString({
    timeRange,
    projectId
  });

  const result = await apiRequest<GlobalMetrics>(
    `/api/iris/metrics${queryParams}`,
    { method: 'GET' }
  );

  return result;
}
