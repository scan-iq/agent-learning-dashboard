/**
 * IRIS REST API Client
 *
 * Frontend wrapper for IRIS API that mirrors the MCP server pattern
 * but calls REST endpoints instead of running an MCP server.
 *
 * This provides the same developer UX as MCP tools but works in browser/frontend.
 *
 * @example
 * ```typescript
 * import * as iris from '@/servers/iris-prime';
 *
 * // Evaluate a project
 * const report = await iris.evaluateProject({ projectId: 'nfl-predictor' });
 *
 * // Detect model drift
 * const drift = await iris.detectDrift({
 *   expertId: 'expert-001',
 *   version: 'v1.2.0'
 * });
 *
 * // Find patterns
 * const patterns = await iris.findPatterns({ analysisType: 'consensus' });
 *
 * // Get metrics
 * const metrics = await iris.getMetrics({ timeRange: '24h' });
 * ```
 */

// Export all API functions
export { evaluateProject } from './evaluateProject';
export { detectDrift } from './detectDrift';
export { findPatterns } from './findPatterns';
export { getMetrics } from './getMetrics';
export { getConsensusLineage } from './getConsensusLineage';
export { queryReflexions } from './queryReflexions';
export { getExpertSignatures } from './getExpertSignatures';
export { submitTelemetry } from './submitTelemetry';

// Export types
export type {
  EvaluationResult,
  DriftAlert,
  PatternDiscovery,
  GlobalMetrics,
  ConsensusLineage,
  ReflexionQuery,
  ExpertSignature,
  TelemetryEvent,
  ApiError,
  EvaluateProjectArgs,
  DetectDriftArgs,
  DiscoverPatternsArgs,
  GetMetricsArgs,
  GetConsensusLineageArgs,
  QueryReflexionsArgs,
  GetExpertSignaturesArgs,
  SubmitTelemetryArgs
} from './types';

// Export client utilities
export { apiRequest, buildQueryString, IrisApiError } from './client';
