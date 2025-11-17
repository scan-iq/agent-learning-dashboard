/**
 * Utilities to format MCP results for Claude's context
 *
 * Converts raw IRIS Prime data into rich, formatted text that Claude can understand.
 * This creates the "(loaded into model context)" pattern from the screenshot.
 *
 * Each formatter returns human-readable text optimized for LLM comprehension.
 */

import { EvaluationResult, DriftAlert } from './iris-mcp-client';

/**
 * Format project evaluation results for Claude's context
 *
 * @example
 * ```
 * IRIS Prime Project Evaluation
 * ═══════════════════════════════════════
 * Project: nfl-predictor
 * Overall Health Score: 92/100 ★★★★★
 *
 * Performance Metrics:
 * • Accuracy:     95/100 ████████████████████
 * • Performance:  88/100 ████████████████
 * • Reliability:  93/100 ██████████████████
 * ```
 */
export function formatEvaluationForContext(report: EvaluationResult): string {
  const { projectId, healthScore, metrics, recommendations, timestamp } = report;

  const stars = '★'.repeat(Math.floor(healthScore / 20));
  const emptyStars = '☆'.repeat(5 - Math.floor(healthScore / 20));

  const formatMetric = (name: string, score: number) => {
    const bars = '█'.repeat(Math.floor(score / 5));
    const spaces = ' '.repeat(20 - Math.floor(score / 5));
    return `• ${name.padEnd(14)} ${score}/100 ${bars}${spaces}`;
  };

  let output = `
╔═══════════════════════════════════════════════════════════════╗
║           IRIS Prime Project Evaluation Report                 ║
╚═══════════════════════════════════════════════════════════════╝

📊 PROJECT: ${projectId}
📅 EVALUATED: ${new Date(timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OVERALL HEALTH SCORE: ${healthScore}/100 ${stars}${emptyStars}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PERFORMANCE METRICS:

${formatMetric('Accuracy', metrics.accuracy)}
${formatMetric('Performance', metrics.performance)}
${formatMetric('Reliability', metrics.reliability)}
`;

  if (recommendations && recommendations.length > 0) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDATIONS:

`;
    recommendations.forEach((rec, i) => {
      output += `${i + 1}. ${rec}\n`;
    });
  }

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Format drift detection alert for Claude's context
 *
 * @example
 * ```
 * ⚠️  DRIFT ALERT - HIGH SEVERITY
 * Expert: sentiment-analyzer-v2
 * Drift Score: 0.73 (ATTENTION REQUIRED)
 *
 * Affected Metrics:
 * • accuracy_score
 * • f1_score
 * ```
 */
export function formatDriftAlertForContext(alert: DriftAlert): string {
  const { expertId, version, driftScore, affectedMetrics, severity, timestamp } = alert;

  const severityIcon = {
    low: '✓',
    medium: '⚡',
    high: '⚠️',
    critical: '🚨'
  }[severity];

  const severityLabel = severity.toUpperCase();

  let output = `
╔═══════════════════════════════════════════════════════════════╗
║               IRIS Prime Drift Detection Alert                 ║
╚═══════════════════════════════════════════════════════════════╝

${severityIcon}  SEVERITY: ${severityLabel}
📅 DETECTED: ${new Date(timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 EXPERT MODEL:
   ID:      ${expertId}
   Version: ${version}

📊 DRIFT SCORE: ${(driftScore * 100).toFixed(1)}%
`;

  if (driftScore > 0.7) {
    output += `   Status:  🚨 CRITICAL - Immediate action required\n`;
  } else if (driftScore > 0.5) {
    output += `   Status:  ⚠️  WARNING - Investigation recommended\n`;
  } else if (driftScore > 0.3) {
    output += `   Status:  ⚡ MONITOR - Watch for further drift\n`;
  } else {
    output += `   Status:  ✓ ACCEPTABLE - Within normal range\n`;
  }

  if (affectedMetrics && affectedMetrics.length > 0) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 AFFECTED METRICS:
`;
    affectedMetrics.forEach(metric => {
      output += `   • ${metric}\n`;
    });
  }

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Format consensus lineage for Claude's context
 */
export function formatConsensusLineageForContext(lineage: any): string {
  const { consensusId, decisions, votes, timestamp } = lineage;

  let output = `
╔═══════════════════════════════════════════════════════════════╗
║            IRIS Prime Consensus Lineage Report                 ║
╚═══════════════════════════════════════════════════════════════╝

🔗 CONSENSUS ID: ${consensusId}
📅 TIMESTAMP: ${new Date(timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DECISION TRAIL:
`;

  if (decisions && Array.isArray(decisions)) {
    decisions.forEach((decision: any, i: number) => {
      output += `
${i + 1}. ${decision.description || 'Decision'}
   Expert:     ${decision.expertId}
   Confidence: ${(decision.confidence * 100).toFixed(1)}%
   Outcome:    ${decision.outcome}
`;
    });
  }

  if (votes) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗳️  VOTING RESULTS:
   Total Votes:     ${votes.total || 0}
   Agreement:       ${((votes.agreement || 0) * 100).toFixed(1)}%
   Final Decision:  ${votes.outcome || 'N/A'}
`;
  }

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Format reflexion patterns for Claude's context
 */
export function formatReflexionsForContext(reflexions: any[]): string {
  let output = `
╔═══════════════════════════════════════════════════════════════╗
║              IRIS Prime Reflexion Patterns                     ║
╚═══════════════════════════════════════════════════════════════╝

📊 TOTAL PATTERNS: ${reflexions.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 PATTERN ANALYSIS:
`;

  reflexions.forEach((pattern: any, i: number) => {
    output += `
${i + 1}. ${pattern.name || 'Pattern'}
   Category:    ${pattern.category || 'N/A'}
   Frequency:   ${pattern.frequency || 0} occurrences
   Confidence:  ${((pattern.confidence || 0) * 100).toFixed(1)}%
   Impact:      ${pattern.impact || 'Unknown'}

   Description: ${pattern.description || 'No description'}
`;

    if (pattern.examples && pattern.examples.length > 0) {
      output += `   Examples:    ${pattern.examples.join(', ')}\n`;
    }
  });

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Format global metrics for Claude's context
 */
export function formatGlobalMetricsForContext(metrics: any): string {
  const { systemHealth, performance, usage, timestamp } = metrics;

  let output = `
╔═══════════════════════════════════════════════════════════════╗
║              IRIS Prime Global Metrics                         ║
╚═══════════════════════════════════════════════════════════════╝

📅 SNAPSHOT: ${new Date(timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏥 SYSTEM HEALTH:
   Overall:         ${systemHealth?.overall || 'N/A'}
   Active Experts:  ${systemHealth?.activeExperts || 0}
   Error Rate:      ${((systemHealth?.errorRate || 0) * 100).toFixed(2)}%
   Uptime:          ${systemHealth?.uptime || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ PERFORMANCE:
   Avg Response:    ${performance?.avgResponse || 'N/A'}ms
   Throughput:      ${performance?.throughput || 0} req/sec
   Peak Load:       ${performance?.peakLoad || 'N/A'}
   Cache Hit Rate:  ${((performance?.cacheHitRate || 0) * 100).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 USAGE STATISTICS:
   Total Requests:  ${usage?.totalRequests || 0}
   Active Users:    ${usage?.activeUsers || 0}
   Data Processed:  ${usage?.dataProcessed || 'N/A'}
   Storage Used:    ${usage?.storageUsed || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Format pattern discovery results for Claude's context
 */
export function formatPatternDiscoveryForContext(patterns: any): string {
  const { discovered, clusters, insights, timestamp } = patterns;

  let output = `
╔═══════════════════════════════════════════════════════════════╗
║           IRIS Prime Pattern Discovery Results                 ║
╚═══════════════════════════════════════════════════════════════╝

📅 ANALYSIS DATE: ${new Date(timestamp).toLocaleString()}
🔍 PATTERNS DISCOVERED: ${discovered?.length || 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 KEY PATTERNS:
`;

  if (discovered && Array.isArray(discovered)) {
    discovered.slice(0, 10).forEach((pattern: any, i: number) => {
      output += `
${i + 1}. ${pattern.name || 'Unnamed Pattern'}
   Type:        ${pattern.type || 'N/A'}
   Strength:    ${((pattern.strength || 0) * 100).toFixed(1)}%
   Occurrences: ${pattern.occurrences || 0}
   Insight:     ${pattern.insight || 'No insight available'}
`;
    });
  }

  if (clusters && clusters.length > 0) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 PATTERN CLUSTERS:
`;
    clusters.forEach((cluster: any, i: number) => {
      output += `   ${i + 1}. ${cluster.name}: ${cluster.size} patterns\n`;
    });
  }

  if (insights && insights.length > 0) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 KEY INSIGHTS:
`;
    insights.forEach((insight: string, i: number) => {
      output += `   ${i + 1}. ${insight}\n`;
    });
  }

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Generic formatter for any IRIS Prime data
 */
export function formatGenericDataForContext(title: string, data: any): string {
  let output = `
╔═══════════════════════════════════════════════════════════════╗
║  ${title.padEnd(60)} ║
╚═══════════════════════════════════════════════════════════════╝

`;

  if (typeof data === 'object' && data !== null) {
    output += formatObjectRecursive(data, 0);
  } else {
    output += `${data}\n`;
  }

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

/**
 * Helper to recursively format objects
 */
function formatObjectRecursive(obj: any, indent: number): string {
  const spaces = '  '.repeat(indent);
  let output = '';

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      output += `${spaces}[${i}]:\n`;
      if (typeof item === 'object' && item !== null) {
        output += formatObjectRecursive(item, indent + 1);
      } else {
        output += `${spaces}  ${item}\n`;
      }
    });
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        output += `${spaces}${key}:\n`;
        output += formatObjectRecursive(value, indent + 1);
      } else if (Array.isArray(value)) {
        output += `${spaces}${key}: [${value.length} items]\n`;
        output += formatObjectRecursive(value, indent + 1);
      } else {
        output += `${spaces}${key}: ${value}\n`;
      }
    });
  }

  return output;
}
