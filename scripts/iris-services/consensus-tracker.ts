#!/usr/bin/env tsx
/**
 * Consensus Lineage Tracker - Track expert participation using AgentDB
 * Populates consensus_lineage table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { CausalMemoryGraph, CausalRecall } from 'agentdb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AGENTDB_PATH = process.env.AGENTDB_PATH || './data/iris-prime.agentdb';

interface ConsensusDecision {
  project: string;
  task_id: string;
  experts_involved: string[];
  expert_outputs: Record<string, any>;
  final_decision: any;
  confidence: number;
  agreement_rate: number;
  metadata?: any;
}

/**
 * Record consensus decision to AgentDB and Supabase
 */
async function recordConsensusDecision(decision: ConsensusDecision) {
  console.log(`📊 Recording consensus: ${decision.project}/${decision.task_id}`);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.FOXRUV_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Store in AgentDB CausalMemoryGraph (tracks consensus causality)
  const causalGraph = new CausalMemoryGraph({ dbPath: AGENTDB_PATH });
  await causalGraph.init();

  const consensusNode = {
    id: `consensus-${decision.task_id}`,
    type: 'consensus_decision',
    content: `Consensus reached with ${decision.agreement_rate * 100}% agreement`,
    causes: decision.experts_involved.map(e => `expert-${e}`),
    effects: [], // Future decisions influenced by this
    confidence: decision.confidence,
    metadata: {
      project: decision.project,
      taskId: decision.task_id,
      expertsInvolved: decision.experts_involved,
      agreementRate: decision.agreement_rate,
    },
  };

  await causalGraph.addNode(consensusNode);

  // Link expert outputs as causes
  for (const expertId of decision.experts_involved) {
    await causalGraph.addEdge(`expert-${expertId}`, consensusNode.id, {
      weight: 1.0,
      label: 'contributed_to',
    });
  }

  console.log('✅ Logged to AgentDB CausalMemoryGraph');

  // 2. Store in Supabase consensus_lineage table
  const { error } = await supabase.from('consensus_lineage').insert({
    project: decision.project,
    task_id: decision.task_id,
    experts_involved: decision.experts_involved,
    expert_outputs: decision.expert_outputs,
    final_decision: decision.final_decision,
    confidence_score: decision.confidence,
    agreement_rate: decision.agreement_rate,
    metadata: decision.metadata,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Supabase error:', error);
    throw error;
  }

  console.log('✅ Logged to Supabase consensus_lineage');
}

/**
 * Generate sample consensus decisions for testing
 */
async function generateSampleConsensus() {
  console.log('\n🎲 Generating sample consensus decisions...\n');

  const decisions: ConsensusDecision[] = [];

  // NFL Predictor consensus decisions
  for (let i = 0; i < 20; i++) {
    const analystScore = 21 + Math.random() * 14; // 21-35
    const gamblerScore = 17 + Math.random() * 21; // 17-38

    const consensusScore = (analystScore + gamblerScore) / 2;

    decisions.push({
      project: 'nfl-predictor-api',
      task_id: `nfl-task-${i}`,
      experts_involved: ['TheAnalyst', 'TheGambler'],
      expert_outputs: {
        TheAnalyst: { prediction: analystScore, confidence: 0.72 },
        TheGambler: { prediction: gamblerScore, confidence: 0.58 },
      },
      final_decision: { prediction: consensusScore, method: 'average' },
      confidence: 0.65,
      agreement_rate: Math.abs(analystScore - gamblerScore) < 7 ? 0.8 : 0.6,
      metadata: {
        game: `Sample Game ${i}`,
        timestamp_offset_hours: Math.round(Math.random() * 168), // Last week
      },
    });
  }

  // Microbiome consensus decisions (single expert, still tracked)
  for (let i = 0; i < 15; i++) {
    decisions.push({
      project: 'microbiome-analytics',
      task_id: `microbiome-task-${i}`,
      experts_involved: ['ClinicalExpert'],
      expert_outputs: {
        ClinicalExpert: {
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          confidence: 0.89,
        },
      },
      final_decision: {
        risk_level: 'medium',
        recommendation: 'Further analysis recommended',
      },
      confidence: 0.89,
      agreement_rate: 1.0, // Single expert always agrees
      metadata: {
        sample_id: `sample-${i}`,
        timestamp_offset_hours: Math.round(Math.random() * 168),
      },
    });
  }

  // Log all decisions
  for (const decision of decisions) {
    await recordConsensusDecision(decision);
  }

  console.log(`\n✅ Generated ${decisions.length} consensus decisions`);
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  generateSampleConsensus()
    .then(() => {
      console.log('\n🎉 Consensus tracking complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { recordConsensusDecision, generateSampleConsensus };
