/**
 * Detect Drift - IRIS API Wrapper
 *
 * Detects model drift in expert models
 */

import { apiRequest } from './client';
import type { DriftAlert, DetectDriftArgs } from './types';

/**
 * Detect drift in an expert model
 *
 * @param args - Drift detection arguments
 * @returns Drift alert with severity and affected metrics
 *
 * @example
 * ```typescript
 * const alert = await detectDrift({
 *   expertId: 'expert-001',
 *   version: 'v1.2.0',
 *   threshold: 0.15
 * });
 *
 * if (alert.severity === 'critical') {
 *   console.log('Critical drift detected!');
 *   console.log('Affected metrics:', alert.affectedMetrics);
 * }
 * ```
 */
export async function detectDrift(
  args: DetectDriftArgs
): Promise<DriftAlert> {
  const { expertId, version, threshold = 0.1 } = args;

  const result = await apiRequest<DriftAlert>(
    `/api/iris/drift/${expertId}/${version}`,
    {
      method: 'POST',
      body: { threshold }
    }
  );

  return result;
}
