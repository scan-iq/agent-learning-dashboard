#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const supabase = createClient(
  'https://jvccmgcybmphebyvvnxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NtZ2N5Ym1waGVieXZ2bnhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MDUwNiwiZXhwIjoyMDc3ODU2NTA2fQ.3A5Qdg8Ezu-lZhIbdXrsA0V1X60v6eDgMNaF9NyjoRU'
);

console.log('🔑 CREATING VALID sk_live_ API KEY\n');

// Generate key with correct format
const bytes = randomBytes(32);
const newKey = 'sk_live_' + bytes.toString('base64url').substring(0, 32);
const hash = createHash('sha256').update(newKey).digest('hex');

console.log('Generated key:', newKey);
console.log('Hash:', hash.substring(0, 20) + '...\n');

// Insert into database
const { data, error } = await supabase.from('iris_api_keys').insert({
  project_id: 'nfl-predictor',
  project_name: 'Dashboard Access',
  api_key_hash: hash,
  api_key_prefix: newKey.substring(0, 15) + '...',
  label: 'Dashboard Key - Nov 19',
  is_active: true
}).select().single();

if (error) {
  console.log('❌ Error:', error.message);
  console.log('\nTrying project_config table instead...');

  const { data: data2, error: error2 } = await supabase.from('project_config').insert({
    id: 'dashboard-' + Date.now(),
    name: 'Dashboard Access',
    api_key: newKey,
    settings: {}
  }).select().single();

  if (error2) {
    console.log('❌ Error:', error2.message);
  } else {
    console.log('✅ Key created in project_config!');
  }
} else {
  console.log('✅ Key created successfully!');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 PASTE THIS IN BROWSER CONSOLE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`localStorage.setItem('iris_api_key', '${newKey}')`);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Then refresh: https://agent-learning-dashboard.vercel.app/\n');
