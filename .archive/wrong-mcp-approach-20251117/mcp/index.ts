/**
 * IRIS MCP Client - Programmatic MCP Invocation
 *
 * This module provides utilities to call IRIS MCP server programmatically
 * and format results for Claude's context.
 *
 * Pattern: Similar to gdrive.getDocument() and salesforce.updateRecord()
 * from the screenshot - call MCP tools via code, format results, feed
 * back as text with "(loaded into model context)" marker.
 *
 * This keeps heavy operations OUT of Claude's direct MCP context while
 * still providing rich, formatted data for LLM comprehension.
 *
 * @example
 * ```typescript
 * import { IrisMCPClient, formatEvaluationForContext } from './mcp';
 *
 * const client = new IrisMCPClient();
 * await client.start();
 *
 * const evaluation = await client.evaluateProject('nfl-predictor');
 * const formatted = formatEvaluationForContext(evaluation);
 *
 * console.log(formatted);
 * // Outputs rich formatted text for Claude to understand
 *
 * await client.shutdown();
 * ```
 */

// Export main client
export { IrisMCPClient } from './iris-mcp-client';

// Export types
export type {
  MCPRequest,
  MCPResponse,
  MCPToolCall,
  EvaluationResult,
  DriftAlert
} from './iris-mcp-client';

// Export context formatters
export {
  formatEvaluationForContext,
  formatDriftAlertForContext,
  formatConsensusLineageForContext,
  formatReflexionsForContext,
  formatGlobalMetricsForContext,
  formatPatternDiscoveryForContext,
  formatGenericDataForContext
} from './load-to-context';

// Convenience function to create and start client
export async function createIrisMCPClient(): Promise<IrisMCPClient> {
  const { IrisMCPClient } = await import('./iris-mcp-client');
  const client = new IrisMCPClient();
  await client.start();
  return client;
}

// Convenience function for one-shot evaluations
export async function quickEvaluate(projectId: string): Promise<string> {
  const { IrisMCPClient } = await import('./iris-mcp-client');
  const { formatEvaluationForContext } = await import('./load-to-context');

  const client = new IrisMCPClient();
  try {
    await client.start();
    const evaluation = await client.evaluateProject(projectId);
    return formatEvaluationForContext(evaluation);
  } finally {
    await client.shutdown();
  }
}

// Convenience function for one-shot drift detection
export async function quickDriftCheck(expertId: string, version: string): Promise<string> {
  const { IrisMCPClient } = await import('./iris-mcp-client');
  const { formatDriftAlertForContext } = await import('./load-to-context');

  const client = new IrisMCPClient();
  try {
    await client.start();
    const alert = await client.detectDrift(expertId, version);
    return formatDriftAlertForContext(alert);
  } finally {
    await client.shutdown();
  }
}

// Convenience function for metrics
export async function quickMetrics(timeRange?: string): Promise<string> {
  const { IrisMCPClient } = await import('./iris-mcp-client');
  const { formatGlobalMetricsForContext } = await import('./load-to-context');

  const client = new IrisMCPClient();
  try {
    await client.start();
    const metrics = await client.getGlobalMetrics(timeRange);
    return formatGlobalMetricsForContext(metrics);
  } finally {
    await client.shutdown();
  }
}

/**
 * Helper to batch multiple MCP calls efficiently
 *
 * @example
 * ```typescript
 * const results = await batchMCPCalls([
 *   { method: 'evaluateProject', args: ['project-1'] },
 *   { method: 'evaluateProject', args: ['project-2'] },
 *   { method: 'getGlobalMetrics', args: ['24h'] }
 * ]);
 * ```
 */
export async function batchMCPCalls(calls: Array<{
  method: keyof IrisMCPClient;
  args: any[];
}>): Promise<any[]> {
  const { IrisMCPClient } = await import('./iris-mcp-client');

  const client = new IrisMCPClient();
  try {
    await client.start();

    const results = await Promise.all(
      calls.map(({ method, args }) => {
        const fn = client[method as any];
        if (typeof fn !== 'function') {
          throw new Error(`Unknown method: ${String(method)}`);
        }
        return fn.apply(client, args);
      })
    );

    return results;
  } finally {
    await client.shutdown();
  }
}
