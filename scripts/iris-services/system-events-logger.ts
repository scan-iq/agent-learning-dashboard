#!/usr/bin/env tsx
/**
 * System Events Logger - Real-time event tracking
 * Populates system_events table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { ReflexionMemory } from 'agentdb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AGENTDB_PATH = process.env.AGENTDB_PATH || './data/iris-prime.agentdb';

type EventType = 'evaluation' | 'retrain' | 'rotation' | 'pattern_discovery' | 'drift_alert' | 'reflexion';
type Severity = 'info' | 'warning' | 'error' | 'critical';

interface SystemEvent {
  project: string;
  event_type: EventType;
  severity: Severity;
  message: string;
  metadata?: any;
}

/**
 * Log system event to AgentDB ReflexionMemory and Supabase
 */
async function logSystemEvent(event: SystemEvent) {
  console.log(`📢 Logging event: [${event.severity}] ${event.event_type} - ${event.message}`);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.FOXRUV_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Store in AgentDB ReflexionMemory (learn from events)
  const reflexionMemory = new ReflexionMemory({
    dbPath: AGENTDB_PATH,
    maxMemories: 1000,
  });

  // Add as reflexion if it's a learning opportunity
  if (event.event_type === 'drift_alert' || event.severity === 'error') {
    await reflexionMemory.add({
      id: `event-reflexion-${Date.now()}`,
      content: event.message,
      verdict: event.severity === 'error' ? 'failure' : 'success',
      confidence: event.severity === 'critical' ? 0.9 : 0.7,
      metadata: {
        eventType: event.event_type,
        project: event.project,
        ...event.metadata,
      },
    });

    console.log('✅ Logged to AgentDB ReflexionMemory');
  }

  // 2. Store in Supabase system_events table
  const { error } = await supabase.from('system_events').insert({
    project: event.project,
    event_type: event.event_type,
    severity: event.severity,
    message: event.message,
    metadata: event.metadata,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Supabase error:', error);
    throw error;
  }

  console.log('✅ Logged to Supabase system_events');
}

/**
 * Generate sample events for testing
 */
async function generateSampleEvents() {
  console.log('\n🎲 Generating sample system events...\n');

  const events: SystemEvent[] = [
    // Evaluation events
    {
      project: 'nfl-predictor-api',
      event_type: 'evaluation',
      severity: 'info',
      message: 'Project evaluation completed - overall health: GOOD',
      metadata: { healthScore: 72, expertsEvaluated: 2 },
    },
    {
      project: 'microbiome-analytics',
      event_type: 'evaluation',
      severity: 'info',
      message: 'Project evaluation completed - overall health: EXCELLENT',
      metadata: { healthScore: 89, expertsEvaluated: 1 },
    },

    // Retrain events
    {
      project: 'nfl-predictor-api',
      event_type: 'retrain',
      severity: 'info',
      message: 'TheGambler retrained: v2.1.3 → v2.1.4 (+8% improvement)',
      metadata: { expertId: 'TheGambler', oldVersion: 'v2.1.3', newVersion: 'v2.1.4', improvement: 0.08 },
    },

    // Drift alerts
    {
      project: 'nfl-predictor-api',
      event_type: 'drift_alert',
      severity: 'warning',
      message: 'TheGambler showing accuracy drift: 58% (below threshold 75%)',
      metadata: { expertId: 'TheGambler', currentAccuracy: 0.58, threshold: 0.75 },
    },

    // Pattern discovery
    {
      project: 'nfl-predictor-api',
      event_type: 'pattern_discovery',
      severity: 'info',
      message: 'Discovered 3 transferable patterns with 92% avg success rate',
      metadata: { patternsFound: 3, avgSuccessRate: 0.92 },
    },

    // Reflexion events
    {
      project: 'microbiome-analytics',
      event_type: 'reflexion',
      severity: 'info',
      message: 'New reflexion learned: Clinical assessment pattern (98% impact)',
      metadata: { reflexionId: '7a74a3fb-67d2-4b97-bac9-e71b31982776', impactScore: 0.98 },
    },

    // Rotation events
    {
      project: 'nfl-predictor-api',
      event_type: 'rotation',
      severity: 'warning',
      message: 'Rotation report: TheGambler recommended for replacement',
      metadata: { expertId: 'TheGambler', action: 'replace', confidence: 0.9 },
    },

    // Error events
    {
      project: 'nfl-predictor-api',
      event_type: 'evaluation',
      severity: 'error',
      message: 'Expert invocation failed: TheAnalyst timeout after 30s',
      metadata: { expertId: 'TheAnalyst', error: 'timeout', latency: 30000 },
    },
  ];

  // Log all events
  for (const event of events) {
    await logSystemEvent(event);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log(`\n✅ Generated ${events.length} system events`);
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  generateSampleEvents()
    .then(() => {
      console.log('\n🎉 System events logging complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { logSystemEvent, generateSampleEvents };
