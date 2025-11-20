#!/usr/bin/env tsx
/**
 * Create API key and populate dashboard with test data
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';

const supabaseUrl = process.env.FOXRUV_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 CREATING API KEY & POPULATING DASHBOARD');
console.log('==========================================\n');

async function setup() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Create API key for nfl-predictor
  console.log('1️⃣ Creating API key for nfl-predictor...');

  const apiKey = `iris_${randomBytes(32).toString('hex')}`;
  const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

  const { data: keyData, error: keyError } = await supabase
    .from('iris_api_keys')
    .insert({
      project_id: 'nfl-predictor',
      project_name: 'NFL Predictor API',
      api_key_hash: apiKeyHash,
      api_key_prefix: apiKey.substring(0, 12) + '...',
      label: 'Test Key',
      is_active: true
    })
    .select()
    .single();

  if (keyError) {
    if (keyError.message.includes('duplicate')) {
      console.log('   ⚠️  API key already exists\n');
    } else {
      console.log('   ❌ Error:', keyError.message, '\n');
    }
  } else {
    console.log(`   ✅ Created: ${apiKey.substring(0, 20)}...\n`);
    console.log(`   💾 Save this key: ${apiKey}\n`);
  }

  // 2. Check table schema
  console.log('2️⃣ Checking model_run_log schema...');

  const { data: sampleData } = await supabase
    .from('model_run_log')
    .select('*')
    .limit(1);

  if (sampleData && sampleData.length > 0) {
    console.log('   ✅ Table exists, columns:', Object.keys(sampleData[0]).join(', '));
  } else {
    console.log('   ⚠️  No existing data, will attempt insert...');
  }

  // 3. Insert sample telemetry
  console.log('\n3️⃣ Inserting sample telemetry...');

  const sampleEvents = [
    {
      project_id: 'nfl-predictor',
      tenant_id: 'foxruv',
      expert_id: 'TheAnalyst',
      expert_version: '1.0.0',
      confidence: 0.95,
      outcome: 'success',
      latency_ms: 150,
      tokens_in: 500,
      tokens_out: 200,
      cost_usd: 0.001
    },
    {
      project_id: 'nfl-predictor',
      tenant_id: 'foxruv',
      expert_id: 'makePrediction',
      expert_version: '1.0.0',
      confidence: 0.88,
      outcome: 'success',
      latency_ms: 220,
      tokens_in: 450,
      tokens_out: 180,
      cost_usd: 0.0009
    },
    {
      project_id: 'nfl-predictor',
      tenant_id: 'foxruv',
      expert_id: 'predictGame',
      expert_version: '1.0.0',
      confidence: 0.90,
      outcome: 'success',
      latency_ms: 180,
      tokens_in: 480,
      tokens_out: 190,
      cost_usd: 0.00095
    }
  ];

  const { data: insertData, error: insertError } = await supabase
    .from('model_run_log')
    .insert(sampleEvents)
    .select();

  if (insertError) {
    console.log('   ❌ Insert failed:', insertError.message);
    console.log('   Available columns might be:', insertError.hint);
  } else {
    console.log(`   ✅ Inserted ${insertData?.length || 0} sample events\n`);
  }

  // 4. Verify data
  console.log('4️⃣ Verifying dashboard data...');

  const { count, error: countError } = await supabase
    .from('model_run_log')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', 'nfl-predictor');

  if (!countError) {
    console.log(`   ✅ Total events in Supabase: ${count}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SETUP COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Next: Refresh your dashboard - you should see:');
  console.log('   - Project: nfl-predictor');
  console.log('   - API Keys: 1 key');
  console.log(`   - Events: ${count || 'some'} telemetry entries`);
  console.log('   - Experts: TheAnalyst, makePrediction, predictGame\n');

  agentdb.close();
}

setup().catch(console.error);
