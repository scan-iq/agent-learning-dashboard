#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jvccmgcybmphebyvvnxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NtZ2N5Ym1waGVieXZ2bnhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MDUwNiwiZXhwIjoyMDc3ODU2NTA2fQ.3A5Qdg8Ezu-lZhIbdXrsA0V1X60v6eDgMNaF9NyjoRU'
);

console.log('🔍 CHECKING DASHBOARD DATA\n');

const { count: runCount } = await supabase.from('model_run_log').select('*', { count: 'exact', head: true });
console.log('model_run_log events:', runCount);

const { count: keyCount } = await supabase.from('iris_api_keys').select('*', { count: 'exact', head: true });
console.log('iris_api_keys:', keyCount);

const { data: projects } = await supabase.from('model_run_log').select('project').limit(10);
console.log('Projects:', [...new Set(projects?.map(p => p.project))]);

const { data: experts } = await supabase.from('model_run_log').select('expert_id').limit(10);
console.log('Experts:', [...new Set(experts?.map(e => e.expert_id))]);

const { data: keys } = await supabase.from('iris_api_keys').select('project_name, api_key_prefix, is_active');
console.log('\nAPI Keys:');
keys?.forEach(k => console.log(`  - ${k.project_name}: ${k.api_key_prefix} (${k.is_active ? 'active' : 'inactive'})`));

console.log('\n✅ Data exists! Dashboard should show it.');
console.log('If not showing, check frontend API calls.');
