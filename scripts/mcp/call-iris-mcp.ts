#!/usr/bin/env node
/**
 * CLI script to call IRIS MCP server and output formatted results
 *
 * This demonstrates the pattern from the screenshot:
 * 1. Call MCP tool programmatically (gdrive.getDocument(), salesforce.updateRecord())
 * 2. Format results nicely
 * 3. Output with "(loaded into model context)" marker
 *
 * Usage:
 *   npx tsx scripts/mcp/call-iris-mcp.ts evaluate nfl-predictor
 *   npx tsx scripts/mcp/call-iris-mcp.ts drift sentiment-analyzer v2
 *   npx tsx scripts/mcp/call-iris-mcp.ts lineage consensus-123
 *   npx tsx scripts/mcp/call-iris-mcp.ts metrics 24h
 *   npx tsx scripts/mcp/call-iris-mcp.ts patterns behavioral
 */

import { IrisMCPClient } from '../../src/mcp/iris-mcp-client';
import {
  formatEvaluationForContext,
  formatDriftAlertForContext,
  formatConsensusLineageForContext,
  formatReflexionsForContext,
  formatGlobalMetricsForContext,
  formatPatternDiscoveryForContext,
  formatGenericDataForContext
} from '../../src/mcp/load-to-context';

const COMMANDS = {
  evaluate: 'Evaluate project health',
  drift: 'Detect model drift',
  lineage: 'Get consensus lineage',
  reflexions: 'Query reflexion patterns',
  metrics: 'Get global system metrics',
  patterns: 'Discover patterns',
  signatures: 'Get expert signatures',
  telemetry: 'Submit telemetry event',
  list: 'List available MCP tools'
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const command = args[0];

  if (!COMMANDS[command as keyof typeof COMMANDS]) {
    console.error(`❌ Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }

  const client = new IrisMCPClient();

  // Set up event handlers
  client.on('log', (message) => {
    if (process.env.DEBUG) {
      console.error(message);
    }
  });

  client.on('error', (error) => {
    console.error('❌ MCP Error:', error.message);
  });

  try {
    console.error('🚀 Starting IRIS MCP client...');
    await client.start();
    console.error('✅ Connected to IRIS MCP server\n');

    let result: string;

    switch (command) {
      case 'evaluate':
        result = await handleEvaluate(client, args[1]);
        break;

      case 'drift':
        result = await handleDrift(client, args[1], args[2]);
        break;

      case 'lineage':
        result = await handleLineage(client, args[1]);
        break;

      case 'reflexions':
        result = await handleReflexions(client, args.slice(1));
        break;

      case 'metrics':
        result = await handleMetrics(client, args[1]);
        break;

      case 'patterns':
        result = await handlePatterns(client, args[1]);
        break;

      case 'signatures':
        result = await handleSignatures(client, args[1]);
        break;

      case 'telemetry':
        result = await handleTelemetry(client, args.slice(1));
        break;

      case 'list':
        result = await handleList(client);
        break;

      default:
        throw new Error(`Command not implemented: ${command}`);
    }

    // Output the formatted result (this goes to stdout for piping)
    console.log(result);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  } finally {
    console.error('\n🔌 Shutting down MCP client...');
    await client.shutdown();
    console.error('✅ Disconnected');
  }
}

async function handleEvaluate(client: IrisMCPClient, projectId?: string): Promise<string> {
  if (!projectId) {
    throw new Error('Project ID required. Usage: call-iris-mcp.ts evaluate <projectId>');
  }

  console.error(`📊 Evaluating project: ${projectId}...`);
  const evaluation = await client.evaluateProject(projectId);
  return formatEvaluationForContext(evaluation);
}

async function handleDrift(client: IrisMCPClient, expertId?: string, version?: string): Promise<string> {
  if (!expertId || !version) {
    throw new Error('Expert ID and version required. Usage: call-iris-mcp.ts drift <expertId> <version>');
  }

  console.error(`🔍 Detecting drift for ${expertId} v${version}...`);
  const driftAlert = await client.detectDrift(expertId, version);
  return formatDriftAlertForContext(driftAlert);
}

async function handleLineage(client: IrisMCPClient, consensusId?: string): Promise<string> {
  if (!consensusId) {
    throw new Error('Consensus ID required. Usage: call-iris-mcp.ts lineage <consensusId>');
  }

  console.error(`🔗 Fetching consensus lineage: ${consensusId}...`);
  const lineage = await client.getConsensusLineage(consensusId);
  return formatConsensusLineageForContext(lineage);
}

async function handleReflexions(client: IrisMCPClient, filterArgs: string[]): Promise<string> {
  console.error(`🔍 Querying reflexion patterns...`);

  // Parse filter arguments (e.g., category:behavioral confidence:0.8)
  const filters: Record<string, any> = {};
  filterArgs.forEach(arg => {
    const [key, value] = arg.split(':');
    if (key && value) {
      filters[key] = isNaN(Number(value)) ? value : Number(value);
    }
  });

  const reflexions = await client.queryReflexions(filters);
  const reflexionArray = Array.isArray(reflexions) ? reflexions : [reflexions];
  return formatReflexionsForContext(reflexionArray);
}

async function handleMetrics(client: IrisMCPClient, timeRange?: string): Promise<string> {
  const range = timeRange || '24h';
  console.error(`📊 Fetching global metrics (${range})...`);

  const metrics = await client.getGlobalMetrics(range);
  return formatGlobalMetricsForContext(metrics);
}

async function handlePatterns(client: IrisMCPClient, analysisType?: string): Promise<string> {
  const type = analysisType || 'behavioral';
  console.error(`🔍 Discovering patterns (${type})...`);

  const patterns = await client.discoverPatterns(type);
  return formatPatternDiscoveryForContext(patterns);
}

async function handleSignatures(client: IrisMCPClient, expertId?: string): Promise<string> {
  if (!expertId) {
    throw new Error('Expert ID required. Usage: call-iris-mcp.ts signatures <expertId>');
  }

  console.error(`✍️  Fetching expert signatures: ${expertId}...`);
  const signatures = await client.getExpertSignatures(expertId);
  return formatGenericDataForContext('Expert Signatures', signatures);
}

async function handleTelemetry(client: IrisMCPClient, eventArgs: string[]): Promise<string> {
  console.error(`📡 Submitting telemetry event...`);

  // Parse event arguments (e.g., type:query expert:sentiment status:success)
  const event: Record<string, any> = {
    timestamp: new Date().toISOString()
  };

  eventArgs.forEach(arg => {
    const [key, value] = arg.split(':');
    if (key && value) {
      event[key] = isNaN(Number(value)) ? value : Number(value);
    }
  });

  const result = await client.submitTelemetry(event);
  return formatGenericDataForContext('Telemetry Submitted', result);
}

async function handleList(client: IrisMCPClient): Promise<string> {
  console.error(`📋 Listing available MCP tools...`);

  const tools = await client.listTools();

  let output = `
╔═══════════════════════════════════════════════════════════════╗
║              Available IRIS MCP Tools                    ║
╚═══════════════════════════════════════════════════════════════╝

Total Tools: ${tools.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  tools.forEach((tool: any, i: number) => {
    output += `${i + 1}. ${tool.name}\n`;
    if (tool.description) {
      output += `   ${tool.description}\n`;
    }
    output += '\n';
  });

  output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
`;

  return output;
}

function printUsage() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           IRIS MCP CLI - Call MCP Programmatically       ║
╚═══════════════════════════════════════════════════════════════╝

This script calls the IRIS MCP server programmatically and formats
results for Claude's context, following the pattern from the screenshot.

USAGE:
  npx tsx scripts/mcp/call-iris-mcp.ts <command> [arguments]

COMMANDS:
  evaluate <projectId>              Evaluate project health
  drift <expertId> <version>        Detect model drift
  lineage <consensusId>             Get consensus decision lineage
  reflexions [filters...]           Query reflexion patterns
  metrics [timeRange]               Get global system metrics (default: 24h)
  patterns [analysisType]           Discover patterns (default: behavioral)
  signatures <expertId>             Get expert signatures
  telemetry [key:value...]          Submit telemetry event
  list                              List available MCP tools

EXAMPLES:
  # Evaluate project health
  npx tsx scripts/mcp/call-iris-mcp.ts evaluate nfl-predictor

  # Check for drift
  npx tsx scripts/mcp/call-iris-mcp.ts drift sentiment-analyzer v2

  # Get consensus lineage
  npx tsx scripts/mcp/call-iris-mcp.ts lineage consensus-abc123

  # Query reflexions with filters
  npx tsx scripts/mcp/call-iris-mcp.ts reflexions category:behavioral confidence:0.8

  # Get metrics for last 7 days
  npx tsx scripts/mcp/call-iris-mcp.ts metrics 7d

  # Discover behavioral patterns
  npx tsx scripts/mcp/call-iris-mcp.ts patterns behavioral

  # Submit telemetry
  npx tsx scripts/mcp/call-iris-mcp.ts telemetry type:query expert:sentiment status:success

  # List all available tools
  npx tsx scripts/mcp/call-iris-mcp.ts list

ENVIRONMENT:
  DEBUG=1                           Enable debug logging to stderr

OUTPUT:
  Results are formatted for Claude's context and written to stdout.
  Progress messages go to stderr for easy piping.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
