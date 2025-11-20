/**
 * Find Patterns - IRIS API Wrapper
 *
 * Discovers patterns in consensus, reflexion, and performance data
 */

import { apiRequest, buildQueryString } from './client';
import type { DiscoverPatternsArgs, PatternDiscovery } from './types';

/**
 * Discover patterns in the system
 *
 * @param args - Pattern discovery arguments
 * @returns Discovered patterns with confidence scores
 *
 * @example
 * ```typescript
 * const patterns = await findPatterns({
 *   analysisType: 'consensus',
 *   projectId: 'nfl-predictor',
 *   timeRange: '7d'
 * });
 *
 * patterns.patterns.forEach(pattern => {
 *   console.log(`${pattern.type}: ${pattern.description}`);
 *   console.log(`Confidence: ${pattern.confidence}, Impact: ${pattern.impact}`);
 * });
 * ```
 */
export async function findPatterns(
  args: DiscoverPatternsArgs
): Promise<PatternDiscovery> {
  const { analysisType, projectId, timeRange } = args;

  const queryParams = buildQueryString({
    projectId,
    timeRange
  });

  const result = await apiRequest<PatternDiscovery>(
    `/api/iris/patterns/${analysisType}${queryParams}`,
    { method: 'GET' }
  );

  return result;
}
