#!/usr/bin/env node
/**
 * Populate ALL dashboard tables with test data
 * Creates: expert_signatures, iris_reports, reflexion_bank, iris_telemetry
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jvccmgcybmphebyvvnxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NtZ2N5Ym1waGVieXZ2bnhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MDUwNiwiZXhwIjoyMDc3ODU2NTA2fQ.3A5Qdg8Ezu-lZhIbdXrsA0V1X60v6eDgMNaF9NyjoRU'
);

console.log('🚀 POPULATING DASHBOARD TABLES\n');

// 1. Expert Signatures
console.log('1️⃣ Creating expert_signatures...');
const experts = [
  { project: 'nfl-predictor', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', expert_id: 'TheAnalyst', version: '1.0.0', active: true, signature_data: { prompt: 'NFL analyst' }, training_accuracy: 0.95, validation_accuracy: 0.92, performance_metrics: { accuracy: 0.95 } },
  { project: 'nfl-predictor', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', expert_id: 'TheGambler', version: '1.0.0', active: true, signature_data: { prompt: 'NFL gambler' }, training_accuracy: 0.88, validation_accuracy: 0.85, performance_metrics: { accuracy: 0.88 } },
  { project: 'agent-learning-core', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', expert_id: 'PatternDiscovery', version: '1.0.0', active: true, signature_data: { prompt: 'Pattern finder' }, training_accuracy: 0.91, validation_accuracy: 0.89, performance_metrics: { accuracy: 0.91 } }
];

const { error: expertError } = await supabase.from('expert_signatures').upsert(experts, { onConflict: 'project,expert_id,version' });
console.log(expertError ? `   ❌ ${expertError.message}` : `   ✅ Created ${experts.length} experts\n`);

// 2. IRIS Reports
console.log('2️⃣ Creating iris_reports...');
const reports = [
  { project: 'nfl-predictor', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', overall_health: 'healthy', health_score: 95, drift_alerts: 0, prompt_recommendations: 1, rotation_recommendations: 0, metadata: {} },
  { project: 'agent-learning-core', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', overall_health: 'warning', health_score: 82, drift_alerts: 2, prompt_recommendations: 0, rotation_recommendations: 1, metadata: {} }
];

const { error: reportError } = await supabase.from('iris_reports').insert(reports);
console.log(reportError ? `   ❌ ${reportError.message}` : `   ✅ Created ${reports.length} reports\n`);

// 3. Reflexion Bank
console.log('3️⃣ Creating reflexion_bank entries...');
const reflexions = [
  { project: 'nfl-predictor', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', task_type: 'prediction', reasoning: { pattern: 'confidence_calibration' }, outcome: { success: true }, is_successful: true, impact_score: 0.92 },
  { project: 'agent-learning-core', tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff', task_type: 'pattern_discovery', reasoning: { pattern: 'cross_project_transfer' }, outcome: { success: true }, is_successful: true, impact_score: 0.88 }
];

const { error: reflexionError } = await supabase.from('reflexion_bank').insert(reflexions);
console.log(reflexionError ? `   ❌ ${reflexionError.message}` : `   ✅ Created ${reflexions.length} reflexions\n`);

// 4. IRIS Telemetry/Events
console.log('4️⃣ Creating iris_telemetry/iris_events...');
const telemetryEvents = [
  { project_id: 'nfl-predictor', event_type: 'expert_run', severity: 'info', message: 'TheAnalyst completed prediction', metadata: { expert: 'TheAnalyst', confidence: 0.95 } },
  { project_id: 'agent-learning-core', event_type: 'drift_detected', severity: 'warning', message: 'PatternDiscovery showing drift', metadata: { expert: 'PatternDiscovery', drift: 0.05 } }
];

// Try iris_telemetry first
let { error: telemetryError } = await supabase.from('iris_telemetry').insert(telemetryEvents);

// If that fails, try iris_events
if (telemetryError) {
  const { error: eventsError } = await supabase.from('iris_events').insert(telemetryEvents);
  console.log(eventsError ? `   ❌ ${eventsError.message}` : `   ✅ Created events\n`);
} else {
  console.log(`   ✅ Created telemetry events\n`);
}

// 5. Verify
console.log('5️⃣ Verifying data...');
const { count: expertCount } = await supabase.from('expert_signatures').select('*', { count: 'exact', head: true });
const { count: reportCount } = await supabase.from('iris_reports').select('*', { count: 'exact', head: true });
const { count: reflexionCount } = await supabase.from('reflexion_bank').select('*', { count: 'exact', head: true });

console.log(`   ✅ expert_signatures: ${expertCount}`);
console.log(`   ✅ iris_reports: ${reportCount}`);
console.log(`   ✅ reflexion_bank: ${reflexionCount}\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ DASHBOARD DATA POPULATED!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 Next: Copy this API key to dashboard:');
console.log('   iris_3534c1f6f24b93ee88787d9efa9f9ca56b0bb47db1480ce1673336b9a0769db8\n');

console.log('📋 In dashboard:');
console.log('   1. Click "Settings" or "API Keys"');
console.log('   2. Paste the API key above');
console.log('   3. Save');
console.log('   4. Refresh - you should see data!\n');
