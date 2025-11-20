#!/usr/bin/env tsx
/**
 * Quick dashboard population with correct schema
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.FOXRUV_SUPABASE_URL!,
  process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY!
);

console.log('🚀 QUICK DASHBOARD POPULATE\n');

// Match actual schema: project, expert_id, version, confidence, latency_ms, outcome
const events = [
  { project: 'nfl-predictor', tenant_id: 'foxruv', expert_id: 'TheAnalyst', version: '1.0.0', confidence: 0.95, latency_ms: 150, outcome: 'success', tokens_in: 500, tokens_out: 200, cost_usd: 0.001 },
  { project: 'nfl-predictor', tenant_id: 'foxruv', expert_id: 'TheAnalyst', version: '1.0.0', confidence: 0.92, latency_ms: 180, outcome: 'success', tokens_in: 520, tokens_out: 210, cost_usd: 0.0011 },
  { project: 'nfl-predictor', tenant_id: 'foxruv', expert_id: 'TheAnalyst', version: '1.0.0', confidence: 0.88, latency_ms: 220, outcome: 'success', tokens_in: 480, tokens_out: 195, cost_usd: 0.00095 },
  { project: 'nfl-predictor', tenant_id: 'foxruv', expert_id: 'makePrediction', version: '1.0.0', confidence: 0.90, latency_ms: 200, outcome: 'success', tokens_in: 510, tokens_out: 205, cost_usd: 0.001 },
  { project: 'nfl-predictor', tenant_id: 'foxruv', expert_id: 'predictGame', version: '1.0.0', confidence: 0.87, latency_ms: 190, outcome: 'success', tokens_in: 495, tokens_out: 198, cost_usd: 0.00099 },
  { project: 'agent-learning-core', tenant_id: 'foxruv', expert_id: 'PatternDiscovery', version: '1.0.0', confidence: 0.93, latency_ms: 160, outcome: 'success', tokens_in: 600, tokens_out: 250, cost_usd: 0.0015 },
  { project: 'microbiome', tenant_id: 'foxruv', expert_id: 'HealthAnalyst', version: '1.0.0', confidence: 0.91, latency_ms: 210, outcome: 'success', tokens_in: 800, tokens_out: 300, cost_usd: 0.002 }
];

const { data, error } = await supabase
  .from('model_run_log')
  .insert(events)
  .select();

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log(`✅ Inserted ${data?.length} events\n`);
}

// Verify
const { count } = await supabase
  .from('model_run_log')
  .select('*', { count: 'exact', head: true });

console.log(`📊 Total events in dashboard: ${count}\n`);

// Check API keys
const { data: keys } = await supabase
  .from('iris_api_keys')
  .select('*')
  .eq('is_active', true);

console.log(`🔑 Active API keys: ${keys?.length || 0}\n`);

console.log('✅ Dashboard should now show:');
console.log('   - Projects: nfl-predictor, agent-learning-core, microbiome');
console.log('   - Experts: TheAnalyst, makePrediction, PatternDiscovery, HealthAnalyst');
console.log(`   - Events: ${count}`);
console.log('   - API Keys: ' + (keys?.length || 0));
