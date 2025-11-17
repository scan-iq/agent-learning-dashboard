/**
 * Get Expert Signatures - IRIS Prime API Wrapper
 *
 * Retrieves cryptographic signatures and metadata for expert models
 */

import { apiRequest, buildQueryString } from './client';
import type { GetExpertSignaturesArgs, ExpertSignature } from './types';

/**
 * Get expert model signatures
 *
 * @param args - Expert signature arguments
 * @returns Expert signature with model metadata and performance
 *
 * @example
 * ```typescript
 * const signature = await getExpertSignatures({
 *   expertId: 'expert-001',
 *   version: 'v1.2.0'
 * });
 *
 * console.log(`Model: ${signature.signature.modelType}`);
 * console.log(`Accuracy: ${signature.signature.performance.accuracy}`);
 * console.log(`Latency: ${signature.signature.performance.latency}ms`);
 * ```
 */
export async function getExpertSignatures(
  args: GetExpertSignaturesArgs
): Promise<ExpertSignature> {
  const { expertId, version } = args;

  const queryParams = buildQueryString({ version });

  const result = await apiRequest<ExpertSignature>(
    `/api/iris/experts/${expertId}/signature${queryParams}`,
    { method: 'GET' }
  );

  return result;
}
