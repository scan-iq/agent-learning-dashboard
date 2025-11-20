#!/usr/bin/env tsx
/**
 * Initialize AgentDB for IRIS Dashboard
 * Creates local AgentDB instance with all controllers
 * Run this locally (not in Vercel serverless)
 */

import { createDatabase } from 'agentdb';
import {
  ReflexionMemory,
  SkillLibrary,
  CausalMemoryGraph,
  CausalRecall,
  NightlyLearner,
} from 'agentdb';
import path from 'path';
import fs from 'fs';

const AGENTDB_PATH = process.env.AGENTDB_PATH || './data/iris-prime.agentdb';

async function initializeAgentDB() {
  console.log('🚀 Initializing AgentDB for IRIS Dashboard...');
  console.log('📁 Database path:', AGENTDB_PATH);

  // Ensure data directory exists
  const dbDir = path.dirname(AGENTDB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created data directory:', dbDir);
  }

  // Create AgentDB instance
  const db = createDatabase({
    dbPath: AGENTDB_PATH,
    verbose: true,
  });

  console.log('✅ AgentDB instance created');

  // Initialize ReflexionMemory (self-critique and learning)
  console.log('\n📚 Initializing ReflexionMemory...');
  const reflexionMemory = new ReflexionMemory({
    dbPath: AGENTDB_PATH,
    maxMemories: 1000,
    similarityThreshold: 0.75,
  });
  console.log('✅ ReflexionMemory ready');

  // Initialize SkillLibrary (learned capabilities)
  console.log('\n🎯 Initializing SkillLibrary...');
  const skillLibrary = new SkillLibrary({
    dbPath: AGENTDB_PATH,
    maxSkills: 500,
  });
  console.log('✅ SkillLibrary ready');

  // Initialize CausalMemoryGraph (decision tracking)
  console.log('\n🔗 Initializing CausalMemoryGraph...');
  const causalGraph = new CausalMemoryGraph({
    dbPath: AGENTDB_PATH,
  });
  console.log('✅ CausalMemoryGraph ready');

  // Initialize CausalRecall (retrieve causal chains)
  console.log('\n🔍 Initializing CausalRecall...');
  const causalRecall = new CausalRecall({
    dbPath: AGENTDB_PATH,
  });
  console.log('✅ CausalRecall ready');

  // Initialize NightlyLearner (background learning)
  console.log('\n🌙 Initializing NightlyLearner...');
  const nightlyLearner = new NightlyLearner({
    dbPath: AGENTDB_PATH,
    learningRate: 0.01,
  });
  console.log('✅ NightlyLearner ready');

  console.log('\n🎉 AgentDB fully initialized!');
  console.log('\nControllers available:');
  console.log('  - ReflexionMemory: Self-critique and pattern learning');
  console.log('  - SkillLibrary: Automated skill composition');
  console.log('  - CausalMemoryGraph: Decision cause-effect tracking');
  console.log('  - CausalRecall: Retrieve reasoning chains');
  console.log('  - NightlyLearner: Background consolidation');

  return {
    db,
    reflexionMemory,
    skillLibrary,
    causalGraph,
    causalRecall,
    nightlyLearner,
  };
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  initializeAgentDB()
    .then(() => {
      console.log('\n✅ AgentDB initialization complete!');
      console.log('Database location:', path.resolve(AGENTDB_PATH));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ AgentDB initialization failed:', error);
      process.exit(1);
    });
}

export { initializeAgentDB };
