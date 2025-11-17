/**
 * Mock diagnostic data for anomaly investigation
 * TODO: Replace with real diagnostic data from agent-learning-core
 */

import { DiagnosticData } from '@/types/diagnostics';

export const mockDiagnosticData: Record<string, DiagnosticData> = {
  'anom-001': {
    id: 'anom-001',
    anomaly_type: 'latency_spike',
    root_cause: 'Database connection pool exhaustion',
    affected_components: [
      { name: 'PostgreSQL Connection Pool', status: 'degraded', details: 'Pool utilization at 98%' },
      { name: 'Query Optimizer', status: 'healthy', details: 'Operating normally' },
      { name: 'Cache Layer', status: 'degraded', details: 'High miss rate detected' },
    ],
    impact_analysis: {
      severity: 'high',
      affected_experts: ['DataProcessor', 'QueryOptimizer', 'CacheManager'],
      estimated_impact: '24% reduction in throughput',
      user_impact: 'Delayed responses for 15% of queries',
    },
    remediation_actions: [
      {
        id: 'rem-001',
        title: 'Increase Connection Pool Size',
        description: 'Scale PostgreSQL connection pool from 50 to 100 connections',
        estimated_time: '5 minutes',
        risk_level: 'low',
        success_rate: 95,
        steps: [
          'Update database.config.ts pool size parameter',
          'Apply configuration change',
          'Monitor connection metrics',
          'Verify latency improvement',
        ],
      },
      {
        id: 'rem-002',
        title: 'Optimize Slow Queries',
        description: 'Add indexes to frequently accessed tables',
        estimated_time: '15 minutes',
        risk_level: 'medium',
        success_rate: 88,
        steps: [
          'Analyze slow query log',
          'Generate index recommendations',
          'Create indexes on identified columns',
          'Update query statistics',
        ],
      },
      {
        id: 'rem-003',
        title: 'Restart Cache Layer',
        description: 'Clear and restart Redis cache to resolve miss rate',
        estimated_time: '2 minutes',
        risk_level: 'low',
        success_rate: 92,
        steps: [
          'Drain cache gracefully',
          'Clear stale entries',
          'Restart Redis service',
          'Warm cache with frequently accessed data',
        ],
      },
    ],
    similar_incidents: [
      { id: 'inc-042', timestamp: '2024-03-10T14:22:00Z', resolution: 'Increased pool size', outcome: 'success' },
      { id: 'inc-038', timestamp: '2024-03-05T09:15:00Z', resolution: 'Added query indexes', outcome: 'success' },
    ],
  },
  'anom-002': {
    id: 'anom-002',
    anomaly_type: 'health_drop',
    root_cause: 'Model drift in prediction accuracy',
    affected_components: [
      { name: 'NFL Game Predictor', status: 'degraded', details: 'Accuracy dropped from 96% to 78%' },
      { name: 'Feature Extraction', status: 'healthy', details: 'Processing normally' },
      { name: 'Training Pipeline', status: 'healthy', details: 'No issues detected' },
    ],
    impact_analysis: {
      severity: 'critical',
      affected_experts: ['GamePredictor', 'StatisticsAnalyzer'],
      estimated_impact: '18% accuracy reduction',
      user_impact: 'Unreliable game outcome predictions',
    },
    remediation_actions: [
      {
        id: 'rem-004',
        title: 'Retrain Model with Recent Data',
        description: 'Update training dataset with latest game statistics',
        estimated_time: '45 minutes',
        risk_level: 'medium',
        success_rate: 90,
        steps: [
          'Fetch recent game data from API',
          'Validate and clean training data',
          'Run retraining pipeline',
          'Evaluate new model performance',
          'Deploy updated model',
        ],
      },
      {
        id: 'rem-005',
        title: 'Apply Drift Correction',
        description: 'Use IRIS drift detection to apply correction factors',
        estimated_time: '10 minutes',
        risk_level: 'low',
        success_rate: 85,
        steps: [
          'Run drift detection analysis',
          'Calculate correction factors',
          'Apply corrections to current model',
          'Monitor prediction accuracy',
        ],
      },
    ],
    similar_incidents: [
      { id: 'inc-051', timestamp: '2024-03-12T16:30:00Z', resolution: 'Model retraining', outcome: 'success' },
    ],
  },
  'anom-003': {
    id: 'anom-003',
    anomaly_type: 'expert_failure',
    root_cause: 'API rate limit exceeded',
    affected_components: [
      { name: 'External Data API', status: 'critical', details: 'Rate limit: 429 errors' },
      { name: 'Retry Logic', status: 'healthy', details: 'Functioning but overwhelmed' },
      { name: 'Circuit Breaker', status: 'open', details: 'Preventing further failures' },
    ],
    impact_analysis: {
      severity: 'medium',
      affected_experts: ['DataFetcher'],
      estimated_impact: '100% failure rate for external data',
      user_impact: 'Incomplete data for microbiome analysis',
    },
    remediation_actions: [
      {
        id: 'rem-006',
        title: 'Implement Request Throttling',
        description: 'Add rate limiting to prevent API overload',
        estimated_time: '20 minutes',
        risk_level: 'low',
        success_rate: 95,
        steps: [
          'Configure rate limiter with API limits',
          'Add request queue for backpressure',
          'Update retry strategy',
          'Monitor request success rate',
        ],
      },
      {
        id: 'rem-007',
        title: 'Switch to Backup Data Source',
        description: 'Use cached data while API recovers',
        estimated_time: '5 minutes',
        risk_level: 'low',
        success_rate: 88,
        steps: [
          'Enable fallback to cached data',
          'Validate cache freshness',
          'Resume normal operations',
        ],
      },
    ],
    similar_incidents: [
      { id: 'inc-047', timestamp: '2024-03-08T11:45:00Z', resolution: 'Added throttling', outcome: 'success' },
    ],
  },
};
