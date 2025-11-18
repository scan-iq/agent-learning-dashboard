#!/usr/bin/env tsx
/**
 * IRIS Prime Dashboard Data Population
 * Master orchestrator using agentic-flow and agentdb
 *
 * Populates all tables:
 * - model_run_logs (expert invocation tracking)
 * - consensus_lineage (expert participation)
 * - system_events (real-time events)
 * - anomalies (drift detection)
 */

import { initializeAgentDB } from './init-agentdb';
import { initializeReasoningBank, executeTaskWithMemory, syncMemoriesToSupabase } from './reasoning-bank-integration';
import { generateSampleRuns } from './model-run-logger';
import { generateSampleConsensus } from './consensus-tracker';
import { generateSampleEvents } from './system-events-logger';
import { generateSampleAnomalies } from './anomaly-detector';

async function populateAllData() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  IRIS PRIME DASHBOARD - DATA POPULATION');
  console.log('  Using: agentic-flow + agentdb + Supabase');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Initialize AgentDB
    console.log('STEP 1: Initialize AgentDB');
    console.log('─────────────────────────────────────────────────────');
    const agentdb = await initializeAgentDB();
    console.log('');

    // Step 2: Initialize agentic-flow ReasoningBank
    console.log('STEP 2: Initialize agentic-flow ReasoningBank');
    console.log('─────────────────────────────────────────────────────');
    const reasoningBank = await initializeReasoningBank();
    console.log('');

    // Step 3: Execute sample tasks with ReasoningBank
    console.log('STEP 3: Execute tasks with ReasoningBank memory');
    console.log('─────────────────────────────────────────────────────');

    await executeTaskWithMemory(
      'evaluate-nfl-predictor',
      'iris-prime',
      'Evaluate NFL predictor project and identify improvements',
      'nfl-predictor-api'
    );

    await executeTaskWithMemory(
      'evaluate-microbiome',
      'iris-prime',
      'Evaluate microbiome analytics project performance',
      'microbiome-analytics'
    );

    // Sync memories to Supabase reflexion_bank
    await syncMemoriesToSupabase(reasoningBank);
    console.log('');

    // Step 4: Populate model_run_logs
    console.log('STEP 4: Generate model run logs');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleRuns();
    console.log('');

    // Step 5: Populate consensus_lineage
    console.log('STEP 5: Generate consensus lineage');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleConsensus();
    console.log('');

    // Step 6: Populate system_events
    console.log('STEP 6: Generate system events');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleEvents();
    console.log('');

    // Step 7: Detect and log anomalies
    console.log('STEP 7: Detect anomalies');
    console.log('─────────────────────────────────────────────────────');
    await generateSampleAnomalies();
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🎉 DATA POPULATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('✅ AgentDB initialized with:');
    console.log('   - ReflexionMemory (self-critique patterns)');
    console.log('   - SkillLibrary (learned capabilities)');
    console.log('   - CausalMemoryGraph (decision tracking)');
    console.log('   - CausalRecall (reasoning chains)');
    console.log('   - NightlyLearner (background consolidation)\n');

    console.log('✅ Agentic-flow ReasoningBank:');
    console.log('   - Closed-loop memory system');
    console.log('   - Task execution with memory context');
    console.log('   - Memories synced to Supabase\n');

    console.log('✅ Supabase tables populated:');
    console.log('   - model_run_logs: ~50 expert invocations');
    console.log('   - consensus_lineage: ~35 consensus decisions');
    console.log('   - system_events: ~8 real-time events');
    console.log('   - anomalies: Drift detection alerts\n');

    console.log('🚀 Dashboard now has full data!');
    console.log('   Visit: https://iris-prime-console.vercel.app/\n');

  } catch (error) {
    console.error('\n❌ Error during data population:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  populateAllData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { populateAllData };
