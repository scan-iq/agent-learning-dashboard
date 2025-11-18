#!/usr/bin/env tsx
/**
 * Anomaly Detector - Drift detection using AgentDB pattern matching
 * Populates anomalies table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { ExplainableRecall } from 'agentdb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AGENTDB_PATH = process.env.AGENTDB_PATH || './data/iris-prime.agentdb';

type AnomalyType = 'accuracy_drop' | 'latency_spike' | 'error_rate_increase' | 'consensus_divergence';

interface Anomaly {
  project: string;
  anomaly_type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_expert?: string;
  metric_value: number;
  threshold: number;
  detected_at: string;
  metadata?: any;
}

/**
 * Detect anomalies using AgentDB ExplainableRecall
 */
async function detectAnomalies(project: string) {
  console.log(`🔍 Detecting anomalies for: ${project}`);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.FOXRUV_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Use AgentDB ExplainableRecall to find similar past patterns
  const explainableRecall = new ExplainableRecall({
    dbPath: AGENTDB_PATH,
  });

  // Get current expert performance
  const { data: experts } = await supabase
    .from('expert_signatures')
    .select('*')
    .eq('project', project)
    .eq('active', true);

  const anomalies: Anomaly[] = [];

  // Check each expert for anomalies
  for (const expert of experts || []) {
    const metrics = expert.performance_metrics || {};
    const accuracy = metrics.accuracy ||
                    metrics.clinical_accuracy ||
                    metrics.win_rate ||
                    0;

    // Detect accuracy drops
    if (accuracy < 0.7) {
      anomalies.push({
        project,
        anomaly_type: 'accuracy_drop',
        severity: accuracy < 0.5 ? 'critical' : accuracy < 0.6 ? 'high' : 'medium',
        description: `${expert.expert_id} accuracy below threshold: ${(accuracy * 100).toFixed(1)}%`,
        affected_expert: expert.expert_id,
        metric_value: accuracy,
        threshold: 0.7,
        detected_at: new Date().toISOString(),
        metadata: {
          expertVersion: expert.version,
          performanceMetrics: metrics,
        },
      });
    }

    // Query AgentDB for similar past patterns
    const similarPatterns = await explainableRecall.retrieve({
      query: `Expert ${expert.expert_id} performance pattern`,
      topK: 5,
      explain: true,
    });

    console.log(`   Found ${similarPatterns.length} similar patterns for ${expert.expert_id}`);
  }

  // 2. Store anomalies in Supabase
  for (const anomaly of anomalies) {
    const { error } = await supabase.from('anomalies').insert({
      project: anomaly.project,
      anomaly_type: anomaly.anomaly_type,
      severity: anomaly.severity,
      description: anomaly.description,
      affected_expert: anomaly.affected_expert,
      metric_value: anomaly.metric_value,
      threshold: anomaly.threshold,
      status: 'active',
      metadata: anomaly.metadata,
      detected_at: anomaly.detected_at,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('❌ Supabase error:', error);
    } else {
      console.log(`✅ Anomaly logged: ${anomaly.description}`);
    }
  }

  return anomalies;
}

/**
 * Generate sample anomalies for all projects
 */
async function generateSampleAnomalies() {
  console.log('\n🎲 Generating sample anomalies...\n');

  const projects = ['nfl-predictor-api', 'microbiome-analytics'];

  for (const project of projects) {
    const anomalies = await detectAnomalies(project);
    console.log(`   Detected ${anomalies.length} anomalies for ${project}`);
  }

  console.log('\n✅ Anomaly detection complete!');
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  generateSampleAnomalies()
    .then(() => {
      console.log('\n🎉 Anomaly detection complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { detectAnomalies, generateSampleAnomalies };
