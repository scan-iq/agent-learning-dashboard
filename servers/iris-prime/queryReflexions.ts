/**
 * Query Reflexions - IRIS API Wrapper
 *
 * Queries reflexion patterns with filtering
 */

import { apiRequest, buildQueryString } from './client';
import type { QueryReflexionsArgs, ReflexionQuery } from './types';

/**
 * Query reflexion patterns
 *
 * @param args - Reflexion query arguments
 * @returns Matching reflexion patterns with metadata
 *
 * @example
 * ```typescript
 * const reflexions = await queryReflexions({
 *   projectId: 'nfl-predictor',
 *   pattern: 'consensus_disagreement',
 *   minImpact: 0.7,
 *   limit: 50
 * });
 *
 * console.log(`Found ${reflexions.totalCount} reflexions`);
 *
 * reflexions.patterns.forEach(pattern => {
 *   console.log(`Pattern: ${pattern.pattern}`);
 *   console.log(`Impact: ${pattern.impact}, Frequency: ${pattern.frequency}`);
 * });
 * ```
 */
export async function queryReflexions(
  args: QueryReflexionsArgs = {}
): Promise<ReflexionQuery> {
  const { projectId, pattern, minImpact, limit, offset } = args;

  const queryParams = buildQueryString({
    projectId,
    pattern,
    minImpact,
    limit,
    offset
  });

  const result = await apiRequest<ReflexionQuery>(
    `/api/iris/reflexions${queryParams}`,
    { method: 'GET' }
  );

  return result;
}
