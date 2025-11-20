#!/usr/bin/env tsx
/**
 * Simplified Data Population for IRIS Dashboard
 * Uses AgentDB locally, syncs to Supabase - no agentic-flow server conflicts
 */

import { generateSampleRuns } from './model-run-logger';
import { generateSampleConsensus } from './consensus-tracker';
import { generateSampleEvents } from './system-events-logger';
import { generateSampleAnomalies } from './anomaly-detector';

async function populateSimple() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  IRIS DASHBOARD - DATA POPULATION (Simplified)');
  console.log('  Using: AgentDB + Supabase (no port conflicts)');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Populate model_run_logs
    console.log('STEP 1: Generate model run logs');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleRuns();
    console.log('');

    // Step 2: Populate consensus_lineage
    console.log('STEP 2: Generate consensus lineage');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleConsensus();
    console.log('');

    // Step 3: Populate system_events
    console.log('STEP 3: Generate system events');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleEvents();
    console.log('');

    // Step 4: Detect and log anomalies
    console.log('STEP 4: Detect anomalies');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleAnomalies();
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🎉 DATA POPULATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('✅ AgentDB used for:');
    console.log('   - CausalMemoryGraph: Decision tracking in model runs');
    console.log('   - CausalMemoryGraph: Consensus causality tracking');
    console.log('   - ReflexionMemory: Learning from system events');
    console.log('   - ExplainableRecall: Anomaly pattern matching\n');

    console.log('✅ Supabase tables populated:');
    console.log('   - model_run_logs: ~50 expert invocations');
    console.log('   - consensus_lineage: ~35 consensus decisions');
    console.log('   - system_events: ~8 real-time events');
    console.log('   - anomalies: Drift detection alerts\n');

    console.log('🚀 Dashboard now has full data!');
    console.log('   Visit: https://iris-prime-console.vercel.app/\n');
    console.log('📊 Try the dashboard buttons:');
    console.log('   - Evaluate All (shows new iris_reports)');
    console.log('   - Auto Retrain (retrains low-performing experts)');
    console.log('   - Find Patterns (shows discovered patterns)');
    console.log('   - Rotation Report (expert recommendations)');
    console.log('   - View Details (full project data with events)\n');

  } catch (error) {
    console.error('\n❌ Error during data population:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  populateSimple()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { populateSimple };
