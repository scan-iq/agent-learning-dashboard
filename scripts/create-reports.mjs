#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jvccmgcybmphebyvvnxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NtZ2N5Ym1waGVieXZ2bnhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4MDUwNiwiZXhwIjoyMDc3ODU2NTA2fQ.3A5Qdg8Ezu-lZhIbdXrsA0V1X60v6eDgMNaF9NyjoRU'
);

console.log('📊 CREATING IRIS REPORTS\n');

// Get expert_signatures table schema first
const { data: schemaCheck } = await supabase.from('iris_reports').select('*').limit(1);
console.log('iris_reports schema:', schemaCheck ? Object.keys(schemaCheck[0] || {}) : 'empty');

// Create reports for each project
const reports = [
  {
    tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff',
    project: 'nfl-predictor-api',
    overall_health: 'healthy',
    health_score: 95,
    metadata: { experts: 2, runs: 10 }
  },
  {
    tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff',
    project: 'microbiome-analytics',
    overall_health: 'healthy',
    health_score: 92,
    metadata: { experts: 1, runs: 5 }
  },
  {
    tenant_id: '2560eb3f-c891-4dc9-9711-924d1c8989ff',
    project: 'agent-learning-core',
    overall_health: 'warning',
    health_score: 85,
    metadata: { experts: 19, runs: 285 }
  }
];

const { data, error } = await supabase.from('iris_reports').insert(reports).select();

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log(`✅ Created ${data.length} reports\n`);
}

// Verify
const { data: allReports } = await supabase.from('iris_reports').select('project, overall_health, health_score');
console.log('All reports:');
allReports?.forEach(r => console.log(`  ${r.project}: ${r.overall_health} (${r.health_score})`));

console.log('\n✅ Refresh dashboard - should show 3 projects now!');
