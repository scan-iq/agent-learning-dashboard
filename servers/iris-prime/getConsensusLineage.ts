/**
 * Get Consensus Lineage - IRIS API Wrapper
 *
 * Retrieves the decision lineage for a consensus event
 */

import { apiRequest, buildQueryString } from './client';
import type { GetConsensusLineageArgs, ConsensusLineage } from './types';

/**
 * Get consensus lineage for a decision
 *
 * @param args - Consensus lineage arguments
 * @returns Complete lineage tree with expert votes and decision path
 *
 * @example
 * ```typescript
 * const lineage = await getConsensusLineage({
 *   consensusId: 'consensus-xyz',
 *   depth: 10
 * });
 *
 * console.log(`Decision: ${lineage.decision}`);
 * console.log(`Confidence: ${lineage.confidence}`);
 * console.log('Experts involved:', lineage.expertsInvolved.length);
 *
 * lineage.lineageTree.forEach(step => {
 *   console.log(`Step ${step.step}: ${step.action}`);
 * });
 * ```
 */
export async function getConsensusLineage(
  args: GetConsensusLineageArgs
): Promise<ConsensusLineage> {
  const { consensusId, depth } = args;

  const queryParams = buildQueryString({ depth });

  const result = await apiRequest<ConsensusLineage>(
    `/api/iris/consensus/${consensusId}/lineage${queryParams}`,
    { method: 'GET' }
  );

  return result;
}
