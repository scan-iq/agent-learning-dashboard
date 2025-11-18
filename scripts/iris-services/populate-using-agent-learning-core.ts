#!/usr/bin/env tsx
/**
 * Populate Dashboard Data Using agent-learning-core v0.4.4
 * This runs LOCALLY (not in Vercel) and uses full agent-learning-core capabilities
 * Then writes enriched data to Supabase for dashboard to display
 */

import {
  initSupabase,
  irisPrime,
  storeIrisReport,
  getOverviewMetrics,
  getAllProjectsSummary,
  createGlobalMetrics,
  createConsensusLineageTracker,
  createReflexionMonitor,
} from '@foxruv/agent-learning-core';
// Environment variables loaded from .env automatically by tsx

async function populateData() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  IRIS PRIME - Data Population using v0.4.4');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.FOXRUV_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    initSupabase(supabaseUrl, supabaseKey, {
      projectId: 'iris-prime-console',
      tenantId: 'default',
    });

    console.log('✅ Supabase initialized\n');

    // STEP 1: Run IRIS Prime evaluation on all projects
    console.log('STEP 1: Evaluate all projects with IRIS Prime');
    console.log('─────────────────────────────────────────────────────');

    const crossProjectReport = await irisPrime.evaluateAllProjects();

    console.log('✅ Cross-project evaluation complete:');
    console.log(`   Projects evaluated: ${crossProjectReport.projects?.length || 0}`);
    console.log(`   Transfer opportunities: ${crossProjectReport.transferOpportunities || 0}`);
    console.log(`   Total drift alerts: ${crossProjectReport.totalDriftAlerts || 0}\n`);

    // STEP 2: Evaluate each project individually for detailed reports
    console.log('STEP 2: Generate detailed reports per project');
    console.log('─────────────────────────────────────────────────────');

    const projects = await getAllProjectsSummary();

    for (const project of projects || []) {
      console.log(`\nEvaluating: ${project.project}`);

      const report = await irisPrime.evaluateProject(project.project);

      console.log(`  Health: ${report.overallHealth} (${report.healthScore.toFixed(1)}%)`);
      console.log(`  Drift alerts: ${report.driftAlerts?.length || 0}`);
      console.log(`  Prompt recommendations: ${report.promptRecommendations?.length || 0}`);
      console.log(`  Transferable patterns: ${report.transferablePatterns?.length || 0}`);

      // Store report in Supabase
      await storeIrisReport(report);
      console.log(`  ✅ Report stored in iris_reports table`);
    }

    // STEP 3: Get overview metrics
    console.log('\nSTEP 3: Fetch overview metrics');
    console.log('─────────────────────────────────────────────────────');

    const metrics = await getOverviewMetrics();

    console.log('✅ Overview metrics:');
    console.log(`   Total projects: ${metrics.total_projects}`);
    console.log(`   Healthy: ${metrics.healthy_projects}`);
    console.log(`   Warning: ${metrics.warning_projects}`);
    console.log(`   Critical: ${metrics.critical_projects}`);
    console.log(`   Active experts: ${metrics.active_experts}`);
    console.log(`   Total reflexions: ${metrics.total_reflexions}\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🎉 DATA POPULATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('✅ Used agent-learning-core v0.4.4:');
    console.log('   - irisPrime singleton for evaluation');
    console.log('   - Full drift detection');
    console.log('   - Pattern discovery');
    console.log('   - Rotation recommendations');
    console.log('   - Prompt recommendations\n');

    console.log('✅ Data stored in Supabase:');
    console.log('   - iris_reports table has detailed evaluations');
    console.log('   - Each report includes drift alerts, patterns, recommendations\n');

    console.log('🚀 Dashboard will now show this rich data!');
    console.log('   Visit: https://iris-prime-console.vercel.app/\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  populateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { populateData };
