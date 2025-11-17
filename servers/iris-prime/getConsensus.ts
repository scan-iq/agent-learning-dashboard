/**
 * Consensus Wrapper
 * Multi-agent consensus and decision tracking
 */

import { callMCPTool } from './client';

export interface GetConsensusArgs {
  decisionId?: string;
  projectId?: string;
  topic?: string;
  status?: 'pending' | 'reached' | 'failed';
  limit?: number;
}

export interface AgentVote {
  agentId: string;
  agentType: string;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface ConsensusDecision {
  id: string;
  projectId: string;
  topic: string;
  description: string;

  status: 'pending' | 'reached' | 'failed';
  requiredVotes: number;
  currentVotes: number;

  votes: AgentVote[];

  result?: {
    decision: 'approved' | 'rejected';
    confidence: number;
    reasoning: string;
    finalizedAt: string;
  };

  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface ConsensusQuery {
  decisions: ConsensusDecision[];
  totalCount: number;

  summary: {
    pending: number;
    reached: number;
    failed: number;
    avgConfidence: number;
  };
}

/**
 * Get consensus decisions
 */
export async function getConsensus(
  args: GetConsensusArgs = {}
): Promise<ConsensusQuery> {
  const result = await callMCPTool<ConsensusQuery>('iris_get_consensus', {
    decision_id: args.decisionId,
    project_id: args.projectId,
    topic: args.topic,
    status: args.status,
    limit: args.limit ?? 50,
  });

  return result;
}

/**
 * Create new consensus decision
 */
export async function createConsensusDecision(args: {
  projectId: string;
  topic: string;
  description: string;
  requiredVotes?: number;
  agentTypes?: string[];
}): Promise<ConsensusDecision> {
  const result = await callMCPTool<ConsensusDecision>(
    'iris_create_consensus',
    {
      project_id: args.projectId,
      topic: args.topic,
      description: args.description,
      required_votes: args.requiredVotes ?? 3,
      agent_types: args.agentTypes,
    }
  );

  return result;
}

/**
 * Submit agent vote on decision
 */
export async function submitVote(args: {
  decisionId: string;
  agentId: string;
  agentType: string;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
}): Promise<{ success: boolean; consensusReached: boolean }> {
  const result = await callMCPTool<{
    success: boolean;
    consensusReached: boolean;
  }>('iris_submit_vote', {
    decision_id: args.decisionId,
    agent_id: args.agentId,
    agent_type: args.agentType,
    vote: args.vote,
    confidence: args.confidence,
    reasoning: args.reasoning,
  });

  return result;
}

/**
 * Get pending decisions requiring votes
 */
export async function getPendingDecisions(
  projectId?: string
): Promise<ConsensusDecision[]> {
  const result = await getConsensus({
    projectId,
    status: 'pending',
  });

  return result.decisions;
}

/**
 * Get decision by ID
 */
export async function getDecision(
  decisionId: string
): Promise<ConsensusDecision> {
  const result = await getConsensus({ decisionId });

  if (result.decisions.length === 0) {
    throw new Error(`Decision ${decisionId} not found`);
  }

  return result.decisions[0];
}

/**
 * Check if consensus has been reached
 */
export async function hasConsensus(decisionId: string): Promise<boolean> {
  const decision = await getDecision(decisionId);
  return decision.status === 'reached';
}
