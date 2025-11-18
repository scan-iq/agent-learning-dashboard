#!/usr/bin/env tsx
/**
 * Model Run Logger - Tracks expert invocations using AgentDB
 * Populates model_run_logs table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { CausalMemoryGraph } from 'agentdb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AGENTDB_PATH = process.env.AGENTDB_PATH || './data/iris-prime.agentdb';

interface ModelRun {
  project: string;
  expert_id: string;
  input: any;
  output: any;
  latency_ms: number;
  tokens_used?: number;
  success: boolean;
  error?: string;
  metadata?: any;
}

/**
 * Log a model run to both AgentDB (causal graph) and Supabase
 */
async function logModelRun(run: ModelRun) {
  console.log(`📝 Logging model run: ${run.project}/${run.expert_id}`);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.FOXRUV_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Store in AgentDB CausalMemoryGraph (tracks decision causality)
  const causalGraph = new CausalMemoryGraph({ dbPath: AGENTDB_PATH });

  const decisionNode = {
    id: `run-${Date.now()}`,
    type: 'expert_invocation',
    content: `${run.expert_id} called with latency ${run.latency_ms}ms`,
    causes: [], // Previous runs that influenced this
    effects: [], // Future decisions this influences
    confidence: run.success ? 0.9 : 0.3,
    metadata: {
      project: run.project,
      expertId: run.expert_id,
      latency: run.latency_ms,
      success: run.success,
    },
  };

  await causalGraph.addNode(decisionNode);
  console.log('✅ Logged to AgentDB CausalMemoryGraph');

  // 2. Store in Supabase model_run_logs table
  const { error } = await supabase.from('model_run_logs').insert({
    project: run.project,
    expert_id: run.expert_id,
    input_data: run.input,
    output_data: run.output,
    latency_ms: run.latency_ms,
    tokens_used: run.tokens_used,
    status: run.success ? 'success' : 'error',
    error_message: run.error,
    metadata: run.metadata,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Supabase error:', error);
    throw error;
  }

  console.log('✅ Logged to Supabase model_run_logs');
}

/**
 * Generate sample model runs for testing
 */
async function generateSampleRuns() {
  console.log('\n🎲 Generating sample model runs...\n');

  const projects = ['nfl-predictor-api', 'microbiome-analytics'];
  const experts = {
    'nfl-predictor-api': ['TheAnalyst', 'TheGambler'],
    'microbiome-analytics': ['ClinicalExpert'],
  };

  const runs: ModelRun[] = [];

  // Generate 50 sample runs across last 24 hours
  for (let i = 0; i < 50; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const projectExperts = experts[project as keyof typeof experts];
    const expert = projectExperts[Math.floor(Math.random() * projectExperts.length)];

    const success = Math.random() > 0.15; // 85% success rate
    const latency = 150 + Math.random() * 400; // 150-550ms

    runs.push({
      project,
      expert_id: expert,
      input: {
        query: `Sample query ${i}`,
        context: 'test_data',
      },
      output: success ? {
        prediction: 'sample_output',
        confidence: 0.7 + Math.random() * 0.3,
      } : null,
      latency_ms: Math.round(latency),
      tokens_used: Math.round(100 + Math.random() * 500),
      success,
      error: success ? undefined : 'Sample error',
      metadata: {
        timestamp_offset_hours: Math.round(Math.random() * 24),
      },
    });
  }

  // Log all runs
  for (const run of runs) {
    await logModelRun(run);
  }

  console.log(`\n✅ Generated ${runs.length} sample model runs`);
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  generateSampleRuns()
    .then(() => {
      console.log('\n🎉 Model run logging complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { logModelRun, generateSampleRuns };
