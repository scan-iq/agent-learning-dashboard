/**
 * Evaluate Project - IRIS Prime API Wrapper
 *
 * Evaluates a project's health and provides recommendations
 */

import { apiRequest } from './client';
import type { EvaluationResult } from './types';

export interface EvaluateProjectArgs {
  projectId: string;
  includeRecommendations?: boolean;
}

/**
 * Evaluate a project and get health metrics
 *
 * @param args - Evaluation arguments
 * @returns Project evaluation with health score and recommendations
 *
 * @example
 * ```typescript
 * const report = await evaluateProject({
 *   projectId: 'nfl-predictor',
 *   includeRecommendations: true
 * });
 *
 * console.log(`Health Score: ${report.healthScore}`);
 * console.log(`Status: ${report.status}`);
 * console.log('Recommendations:', report.recommendations);
 * ```
 */
export async function evaluateProject(
  args: EvaluateProjectArgs
): Promise<EvaluationResult> {
  const { projectId, includeRecommendations = true } = args;

  const result = await apiRequest<EvaluationResult>(
    `/api/iris/evaluate/${projectId}?recommendations=${includeRecommendations}`,
    { method: 'POST' }
  );

  return result;
}
