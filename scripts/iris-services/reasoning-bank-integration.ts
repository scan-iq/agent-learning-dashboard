#!/usr/bin/env tsx
/**
 * Agentic-Flow ReasoningBank Integration for IRIS Prime
 * Implements closed-loop memory system with self-improvement
 */

import { reasoningbank } from 'agentic-flow';

const { runTask, initialize, HybridReasoningBank } = reasoningbank;
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REASONING_BANK_PATH = process.env.REASONING_BANK_PATH || './data/reasoning.db';

/**
 * Initialize agentic-flow ReasoningBank
 */
async function initializeReasoningBank() {
  console.log('🧠 Initializing agentic-flow ReasoningBank...');
  console.log('📁 Database path:', REASONING_BANK_PATH);

  // Initialize agentic-flow system
  await initialize({
    dbPath: REASONING_BANK_PATH,
    enableLearning: true,
    enableConsolidation: true,
  });

  console.log('✅ ReasoningBank initialized');

  // Create HybridReasoningBank instance
  const reasoningBank = new HybridReasoningBank({
    dbPath: REASONING_BANK_PATH,
    maxMemories: 1000,
    consolidationInterval: 3600000, // 1 hour
  });

  await reasoningBank.init();
  console.log('✅ HybridReasoningBank ready');

  return reasoningBank;
}

/**
 * Execute a task with ReasoningBank memory
 */
async function executeTaskWithMemory(
  taskId: string,
  agentId: string,
  query: string,
  domain: string
) {
  console.log(`\n🎯 Executing task: ${taskId}`);
  console.log(`   Agent: ${agentId}`);
  console.log(`   Domain: ${domain}`);

  const result = await runTask({
    taskId,
    agentId,
    query,
    domain,
    executeFn: async (memories) => {
      console.log(`📖 Retrieved ${memories.length} relevant memories`);

      // Simulate task execution with memory context
      const memoryContext = memories.map(m => m.content).join('\n');

      // This would normally call an LLM with memory context
      // For demo, we return structured result
      return {
        verdict: 'success',
        insights: `Executed with ${memories.length} memories`,
        confidence: 0.85,
      };
    },
  });

  console.log('✅ Task complete:', result.verdict);
  console.log(`   New memories: ${result.newMemories.length}`);
  console.log(`   Used memories: ${result.usedMemories.length}`);
  console.log(`   Consolidated: ${result.consolidated}`);

  return result;
}

/**
 * Sync ReasoningBank memories to Supabase
 */
async function syncMemoriesToSupabase(reasoningBank: HybridReasoningBank) {
  console.log('\n🔄 Syncing ReasoningBank memories to Supabase...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.FOXRUV_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.FOXRUV_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get all memories from ReasoningBank
  const memories = await reasoningBank.retrieveAll();

  console.log(`📚 Found ${memories.length} memories to sync`);

  // Sync to reflexion_bank table
  for (const memory of memories) {
    await supabase.from('reflexion_bank').upsert({
      id: memory.id,
      project: memory.domain || 'iris-prime-console',
      pattern: memory.content,
      strategy: memory.strategy || 'reasoning_bank',
      impact_score: memory.confidence || 0.75,
      reused_count: memory.usageCount || 0,
      created_at: memory.timestamp || new Date().toISOString(),
      metadata: {
        taskId: memory.taskId,
        agentId: memory.agentId,
        consolidated: memory.consolidated,
      },
    });
  }

  console.log('✅ Memories synced to Supabase');
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  (async () => {
    try {
      const reasoningBank = await initializeReasoningBank();

      // Example: Execute a sample task
      const result = await executeTaskWithMemory(
        'evaluate-nfl-predictor',
        'iris-prime',
        'Evaluate NFL predictor project health and identify improvement opportunities',
        'nfl-predictor-api'
      );

      // Sync to Supabase
      await syncMemoriesToSupabase(reasoningBank);

      console.log('\n🎉 ReasoningBank integration complete!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error);
      process.exit(1);
    }
  })();
}

export { initializeReasoningBank, executeTaskWithMemory, syncMemoriesToSupabase };
