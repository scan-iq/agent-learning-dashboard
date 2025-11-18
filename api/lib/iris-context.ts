/**
 * IRIS Context Integration - Telemetry & Event Tracking
 * Uses agent-learning-core v0.4.4 IrisContextCollector
 * This is the PROPER way to collect telemetry - not manual Supabase!
 */

import {
  IrisContextCollector,
  createIrisContextCollector,
  GlobalMetricsCollector,
  createGlobalMetrics,
  AgentDBSingleton,
} from '@foxruv/agent-learning-core';

// Singleton instances (proper pattern!)
let contextCollector: IrisContextCollector | null = null;
let metricsCollector: GlobalMetricsCollector | null = null;
let agentdb: any | null = null;

const AGENTDB_PATH = process.env.AGENTDB_PATH || './data/iris-prime.agentdb';

/**
 * Initialize IRIS Context system (call once on server startup)
 */
export async function initializeIrisContext() {
  if (contextCollector) return { contextCollector, metricsCollector, agentdb };

  console.log('🚀 Initializing IRIS Context system with v0.4.4...');

  // 1. Initialize AgentDB using SINGLETON (83% fewer connections!)
  agentdb = await AgentDBSingleton.getInstance(AGENTDB_PATH);
  console.log('✅ AgentDB Singleton ready');

  // 2. Initialize IrisContextCollector (event & performance tracking)
  contextCollector = createIrisContextCollector({
    dbPath: AGENTDB_PATH,
    enableTelemetry: true,
    enableTriggerDetection: true,
  });
  console.log('✅ IrisContextCollector ready');

  // 3. Initialize GlobalMetricsCollector (cross-project telemetry)
  metricsCollector = createGlobalMetrics({
    agentdb,
    enableDriftMonitoring: true,
    aggregationInterval: 3600000, // 1 hour
  });
  console.log('✅ GlobalMetricsCollector ready');

  console.log('🎉 IRIS Context system fully initialized!');

  return { contextCollector, metricsCollector, agentdb };
}

/**
 * Get initialized IRIS Context collector
 */
export function getContextCollector(): IrisContextCollector {
  if (!contextCollector) {
    throw new Error('IrisContextCollector not initialized. Call initializeIrisContext() first.');
  }
  return contextCollector;
}

/**
 * Get initialized metrics collector
 */
export function getMetricsCollector(): GlobalMetricsCollector {
  if (!metricsCollector) {
    throw new Error('GlobalMetricsCollector not initialized. Call initializeIrisContext() first.');
  }
  return metricsCollector;
}

/**
 * Get AgentDB instance
 */
export function getAgentDB() {
  if (!agentdb) {
    throw new Error('AgentDB not initialized. Call initializeIrisContext() first.');
  }
  return agentdb;
}
