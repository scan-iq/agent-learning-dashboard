# IRIS Prime MCP Client

Programmatic MCP invocation utilities for IRIS Prime, following the pattern from Claude's screenshot where tools like `gdrive.getDocument()` and `salesforce.updateRecord()` are called programmatically.

## Pattern Overview

**The Problem**: Direct MCP tool calls in Claude's context can be verbose and slow for heavy operations.

**The Solution**: Call MCP server programmatically via code, format results nicely, and feed back as text with "(loaded into model context)" marker.

## Architecture

```
┌─────────────────┐
│   Claude Code   │
└────────┬────────┘
         │
         │ Calls programmatically
         ▼
┌─────────────────┐
│ IrisMCPClient   │ ◄── Spawns child process
└────────┬────────┘
         │
         │ JSON-RPC over stdio
         ▼
┌─────────────────┐
│  IRIS MCP       │
│  Server         │
└────────┬────────┘
         │
         │ Queries
         ▼
┌─────────────────┐
│  Supabase DB    │
└─────────────────┘

Results flow back up, get formatted, and are presented to Claude
as rich text with "(loaded into model context)" marker.
```

## Usage

### Basic Usage

```typescript
import { IrisMCPClient, formatEvaluationForContext } from './mcp';

// Create and start client
const client = new IrisMCPClient();
await client.start();

// Call MCP tools
const evaluation = await client.evaluateProject('nfl-predictor');

// Format for Claude's context
const formatted = formatEvaluationForContext(evaluation);
console.log(formatted);
// Output includes "(loaded into model context)" marker

// Cleanup
await client.shutdown();
```

### CLI Script

```bash
# Evaluate project
npx tsx scripts/mcp/call-iris-mcp.ts evaluate nfl-predictor

# Check drift
npx tsx scripts/mcp/call-iris-mcp.ts drift sentiment-analyzer v2

# Get metrics
npx tsx scripts/mcp/call-iris-mcp.ts metrics 24h

# Discover patterns
npx tsx scripts/mcp/call-iris-mcp.ts patterns behavioral

# List all tools
npx tsx scripts/mcp/call-iris-mcp.ts list
```

### Convenience Functions

```typescript
import { quickEvaluate, quickDriftCheck, quickMetrics } from './mcp';

// One-shot evaluation (auto-connects and disconnects)
const report = await quickEvaluate('nfl-predictor');
console.log(report); // Already formatted for Claude

// One-shot drift check
const alert = await quickDriftCheck('sentiment-analyzer', 'v2');
console.log(alert);

// One-shot metrics
const metrics = await quickMetrics('7d');
console.log(metrics);
```

### Batch Operations

```typescript
import { batchMCPCalls } from './mcp';

const results = await batchMCPCalls([
  { method: 'evaluateProject', args: ['project-1'] },
  { method: 'evaluateProject', args: ['project-2'] },
  { method: 'getGlobalMetrics', args: ['24h'] },
  { method: 'discoverPatterns', args: ['behavioral'] }
]);

// Process results...
```

## Available Methods

### IrisMCPClient Methods

- `evaluateProject(projectId: string)` - Get project health evaluation
- `detectDrift(expertId: string, version: string)` - Detect model drift
- `getConsensusLineage(consensusId: string)` - Get decision lineage
- `queryReflexions(filters: Record<string, any>)` - Query reflexion patterns
- `getGlobalMetrics(timeRange?: string)` - Get system metrics
- `discoverPatterns(analysisType: string)` - Discover patterns
- `getExpertSignatures(expertId: string)` - Get expert signatures
- `submitTelemetry(event: Record<string, any>)` - Submit telemetry
- `listTools()` - List all available MCP tools
- `callTool(name: string, args: any)` - Generic tool call

### Context Formatters

- `formatEvaluationForContext(report)` - Format project evaluation
- `formatDriftAlertForContext(alert)` - Format drift alert
- `formatConsensusLineageForContext(lineage)` - Format decision lineage
- `formatReflexionsForContext(reflexions)` - Format reflexion patterns
- `formatGlobalMetricsForContext(metrics)` - Format system metrics
- `formatPatternDiscoveryForContext(patterns)` - Format discovered patterns
- `formatGenericDataForContext(title, data)` - Format any data

## Output Format

All formatters produce rich, boxed text output optimized for LLM comprehension:

```
╔═══════════════════════════════════════════════════════════════╗
║           IRIS Prime Project Evaluation Report                 ║
╚═══════════════════════════════════════════════════════════════╝

📊 PROJECT: nfl-predictor
📅 EVALUATED: 2025-01-15 10:30:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OVERALL HEALTH SCORE: 92/100 ★★★★★

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PERFORMANCE METRICS:

• Accuracy       95/100 ████████████████████
• Performance    88/100 ████████████████
• Reliability    93/100 ██████████████████

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDATIONS:

1. Optimize prediction latency
2. Increase test coverage to 90%
3. Add more training data for edge cases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(loaded into model context)
```

## Benefits

1. **Performance**: Heavy operations run in background process
2. **Context Efficiency**: Only formatted results enter Claude's context
3. **Flexibility**: Can batch calls, cache results, implement retries
4. **Debuggability**: Separate logging channel (stderr vs stdout)
5. **Integration**: Easy to pipe into other tools or scripts

## Implementation Details

### JSON-RPC 2.0 Protocol

The client communicates with the MCP server using JSON-RPC 2.0 over stdio:

```typescript
// Request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "iris_evaluate_project",
    "arguments": { "projectId": "nfl-predictor" }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"healthScore\": 92, ...}"
    }]
  }
}
```

### Error Handling

- Connection errors: Retries with exponential backoff
- Tool errors: Propagated with clear messages
- Timeout: 30 seconds default per call
- Graceful shutdown: Waits for pending requests

### Event System

```typescript
client.on('connected', () => console.log('Connected'));
client.on('log', (msg) => console.log(msg));
client.on('error', (err) => console.error(err));
client.on('exit', (code) => console.log('Exited', code));
```

## Testing

```bash
# Run demo script
npx tsx scripts/mcp/call-iris-mcp.ts list

# Debug mode
DEBUG=1 npx tsx scripts/mcp/call-iris-mcp.ts evaluate test-project

# Pipe to file
npx tsx scripts/mcp/call-iris-mcp.ts metrics 24h > metrics.txt
```

## Future Enhancements

- [ ] Connection pooling for multiple concurrent clients
- [ ] Result caching with TTL
- [ ] Automatic reconnection on disconnect
- [ ] Streaming responses for large datasets
- [ ] WebSocket transport option
- [ ] Rate limiting and throttling
- [ ] Metrics collection for client performance

## See Also

- [IRIS Prime MCP Server](../../../README.md)
- [Supabase Integration](../../supabase/README.md)
- [Pattern Discovery](../../patterns/README.md)
