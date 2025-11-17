/**
 * Example: Using Generated MCP Wrappers
 *
 * This demonstrates how to use the auto-generated MCP wrappers
 * for programmatic tool invocation.
 */

// Import generated wrappers
import {
  evaluateProject,
  detectDrift,
  getConsensus,
  queryReflexions,
  getMetrics,
  findPatterns,
  formatEvaluateProjectForContext,
  formatDetectDriftForContext,
} from '../servers/iris-prime';

import {
  query as querySupabase,
  subscribe as subscribeSupabase,
} from '../servers/supabase';

/**
 * Example 1: Simple Project Evaluation
 */
async function example1_simpleEvaluation() {
  console.log('📊 Example 1: Simple Project Evaluation\n');

  try {
    const result = await evaluateProject('nfl-predictor');

    console.log('Evaluation Result:');
    console.log(`  Score: ${result.score}`);
    console.log(`  Drift: ${result.drift}`);
    console.log(`  Status: ${result.status}`);
    console.log();

    // Format for Claude's context
    const formatted = formatEvaluateProjectForContext(result);
    console.log('Formatted for Claude:');
    console.log(formatted);
  } catch (error) {
    console.error('❌ Evaluation failed:', error);
  }
}

/**
 * Example 2: Drift Detection with Threshold
 */
async function example2_driftDetection() {
  console.log('\n🔍 Example 2: Drift Detection\n');

  try {
    const alert = await detectDrift('expert-123', 'v2.0.0', 0.15);

    if (alert.driftDetected) {
      console.log('⚠️  Drift detected!');
      console.log(`  Drift Score: ${alert.driftScore}`);
      console.log(`  Threshold: ${alert.threshold}`);
      console.log(`  Recommendations:`);
      alert.recommendations.forEach((rec: string) => {
        console.log(`    - ${rec}`);
      });
    } else {
      console.log('✅ No significant drift detected');
    }
  } catch (error) {
    console.error('❌ Drift detection failed:', error);
  }
}

/**
 * Example 3: Consensus Lineage Tracking
 */
async function example3_consensusTracking() {
  console.log('\n🤝 Example 3: Consensus Tracking\n');

  try {
    const lineage = await getConsensus('decision-456', 'expert-123');

    console.log('Consensus Information:');
    console.log(`  Decision ID: ${lineage.decisionId}`);
    console.log(`  Confidence: ${lineage.confidence}`);
    console.log(`  Expert Count: ${lineage.expertIds.length}`);
    console.log(`  Created: ${lineage.createdAt}`);
  } catch (error) {
    console.error('❌ Consensus tracking failed:', error);
  }
}

/**
 * Example 4: Batch Operations
 */
async function example4_batchOperations() {
  console.log('\n📦 Example 4: Batch Operations\n');

  try {
    // Evaluate multiple projects in parallel
    const projects = ['project-1', 'project-2', 'project-3'];

    console.log(`Evaluating ${projects.length} projects in parallel...`);

    const results = await Promise.all(
      projects.map(projectId => evaluateProject(projectId))
    );

    results.forEach((result, index) => {
      console.log(`\nProject ${projects[index]}:`);
      console.log(`  Score: ${result.score}`);
      console.log(`  Status: ${result.status}`);
    });
  } catch (error) {
    console.error('❌ Batch operations failed:', error);
  }
}

/**
 * Example 5: Metrics Dashboard
 */
async function example5_metricsDashboard() {
  console.log('\n📈 Example 5: Metrics Dashboard\n');

  try {
    const metrics = await getMetrics('24h');

    console.log('Global Metrics (Last 24 Hours):');
    console.log(`  Total Evaluations: ${metrics.totalEvaluations}`);
    console.log(`  Average Score: ${metrics.averageScore}`);
    console.log(`  Drift Alerts: ${metrics.driftAlerts}`);
    console.log(`  Active Projects: ${metrics.activeProjects}`);
  } catch (error) {
    console.error('❌ Metrics retrieval failed:', error);
  }
}

/**
 * Example 6: Pattern Discovery
 */
async function example6_patternDiscovery() {
  console.log('\n🔬 Example 6: Pattern Discovery\n');

  try {
    const patterns = await findPatterns('nfl-predictor', 0.7);

    console.log('Discovered Patterns:');
    patterns.forEach((pattern: any) => {
      console.log(`\n  Pattern: ${pattern.name}`);
      console.log(`  Support: ${pattern.support}`);
      console.log(`  Confidence: ${pattern.confidence}`);
      console.log(`  Description: ${pattern.description}`);
    });
  } catch (error) {
    console.error('❌ Pattern discovery failed:', error);
  }
}

/**
 * Example 7: Reflexion Monitoring
 */
async function example7_reflexionMonitoring() {
  console.log('\n🔄 Example 7: Reflexion Monitoring\n');

  try {
    const reflexions = await queryReflexions('expert-123', '7d');

    console.log('Reflexion Summary:');
    console.log(`  Total Reflexions: ${reflexions.total}`);
    console.log(`  Average Quality: ${reflexions.averageQuality}`);
    console.log(`  Improvement Rate: ${reflexions.improvementRate}`);
  } catch (error) {
    console.error('❌ Reflexion monitoring failed:', error);
  }
}

/**
 * Example 8: Supabase Integration
 */
async function example8_supabaseIntegration() {
  console.log('\n💾 Example 8: Supabase Integration\n');

  try {
    // Query recent evaluations
    const evaluations = await querySupabase('evaluations', {
      select: 'id,project_id,score,created_at',
      limit: 5,
      order: { column: 'created_at', ascending: false },
    });

    console.log('Recent Evaluations:');
    evaluations.forEach((eval: any) => {
      console.log(`  ${eval.project_id}: ${eval.score} (${eval.created_at})`);
    });
  } catch (error) {
    console.error('❌ Supabase query failed:', error);
  }
}

/**
 * Example 9: Real-time Monitoring
 */
async function example9_realtimeMonitoring() {
  console.log('\n⚡ Example 9: Real-time Monitoring\n');

  try {
    console.log('Subscribing to drift alerts...');

    const subscription = await subscribeSupabase('drift_alerts', 'INSERT', (payload: any) => {
      console.log('\n🚨 New Drift Alert:');
      console.log(`  Project: ${payload.new.project_id}`);
      console.log(`  Drift Score: ${payload.new.drift_score}`);
      console.log(`  Time: ${payload.new.created_at}`);
    });

    console.log('✅ Subscribed to real-time alerts');
    console.log('   (Run for 30 seconds...)');

    // Unsubscribe after 30 seconds
    setTimeout(() => {
      subscription.unsubscribe();
      console.log('\n✅ Unsubscribed from alerts');
    }, 30000);
  } catch (error) {
    console.error('❌ Real-time monitoring failed:', error);
  }
}

/**
 * Example 10: Full Monitoring Pipeline
 */
async function example10_fullPipeline() {
  console.log('\n🔄 Example 10: Full Monitoring Pipeline\n');

  const projectId = 'nfl-predictor';
  const expertId = 'expert-123';
  const version = 'v2.0.0';

  try {
    // Step 1: Evaluate project
    console.log('Step 1: Evaluating project...');
    const evaluation = await evaluateProject(projectId);
    console.log(`✅ Score: ${evaluation.score}`);

    // Step 2: Check for drift
    console.log('\nStep 2: Checking for drift...');
    const drift = await detectDrift(expertId, version, 0.15);
    if (drift.driftDetected) {
      console.log(`⚠️  Drift detected: ${drift.driftScore}`);
    } else {
      console.log('✅ No drift detected');
    }

    // Step 3: Get consensus
    console.log('\nStep 3: Checking consensus...');
    const consensus = await getConsensus(projectId, expertId);
    console.log(`✅ Confidence: ${consensus.confidence}`);

    // Step 4: Discover patterns
    console.log('\nStep 4: Discovering patterns...');
    const patterns = await findPatterns(projectId, 0.7);
    console.log(`✅ Found ${patterns.length} patterns`);

    // Step 5: Get metrics
    console.log('\nStep 5: Retrieving metrics...');
    const metrics = await getMetrics('24h');
    console.log(`✅ Processed ${metrics.totalEvaluations} evaluations`);

    console.log('\n✨ Pipeline complete!');
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🚀 IRIS Prime MCP Wrapper Examples\n');
  console.log('=' .repeat(60));

  try {
    await example1_simpleEvaluation();
    await example2_driftDetection();
    await example3_consensusTracking();
    await example4_batchOperations();
    await example5_metricsDashboard();
    await example6_patternDiscovery();
    await example7_reflexionMonitoring();
    await example8_supabaseIntegration();
    await example10_fullPipeline();

    // Note: example9_realtimeMonitoring runs for 30 seconds,
    // so we skip it in the batch run. Run it separately if needed.

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Examples failed:', error);
    process.exit(1);
  }
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_simpleEvaluation,
  example2_driftDetection,
  example3_consensusTracking,
  example4_batchOperations,
  example5_metricsDashboard,
  example6_patternDiscovery,
  example7_reflexionMonitoring,
  example8_supabaseIntegration,
  example9_realtimeMonitoring,
  example10_fullPipeline,
};
