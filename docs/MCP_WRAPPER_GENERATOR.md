# MCP Wrapper Generator

Automatically generate TypeScript wrappers for MCP servers to enable programmatic invocation without Claude's direct MCP context.

## Overview

The MCP Wrapper Generator creates type-safe TypeScript wrappers for any MCP server, allowing you to:

- **Call MCP tools programmatically** from your codebase
- **Keep heavy operations OUT of Claude's context** while providing formatted results
- **Enable batch operations** and caching for efficiency
- **Work with any MCP server** - IRIS, Supabase, Claude Flow, etc.

## Installation

```bash
# Install dependencies
npm install

# Install commander and tsx if not already installed
npm install -D commander tsx
```

## Quick Start

### 1. List Available MCP Servers

```bash
npm run mcp:list
```

Output:
```
📦 iris-prime
   Command: npx
   Args: iris-prime mcp start

📦 supabase
   Command: npx
   Args: @supabase/mcp mcp start
```

### 2. Generate Wrappers

```bash
# Generate wrappers for all detected MCP servers
npm run generate:wrappers

# Generate wrappers for specific servers
npm run iris generate wrappers -- --servers iris-prime,supabase

# Custom output directory
npm run iris generate wrappers -- --output ./my-servers

# Force overwrite existing wrappers
npm run iris generate wrappers -- --force
```

### 3. Use Generated Wrappers

```typescript
import { evaluateProject } from './servers/iris-prime';

// Simple usage
const evaluation = await evaluateProject('my-nfl-predictor');
console.log(evaluation);

// With options (enhanced template)
const result = await evaluateProject('my-project', {
  cache: true,  // Enable caching
  retry: 3,     // Retry on failure
});
```

## CLI Commands

### Generate Wrappers

```bash
# Interactive (default)
npm run iris generate wrappers

# With options
npm run iris generate wrappers -- \
  --servers iris-prime,supabase \
  --output ./servers \
  --force \
  --template enhanced
```

**Options:**
- `--servers <list>` - Comma-separated list of MCP servers to wrap
- `--output <dir>` - Output directory (default: `./servers`)
- `--force` - Overwrite existing files
- `--template <name>` - Template to use (`standard` or `enhanced`)

### List Servers

```bash
npm run mcp:list
```

Shows all MCP servers configured in Claude.

### Introspect Server

```bash
npm run iris introspect iris-prime
```

Shows all available tools for a server with their parameters.

### Check Status

```bash
npm run mcp:status
```

Shows integration status and recommendations.

## Generated Structure

```
servers/
├── README.md
├── iris-prime/
│   ├── client.ts
│   ├── evaluateProject.ts
│   ├── detectDrift.ts
│   ├── getConsensus.ts
│   ├── queryReflexions.ts
│   ├── getMetrics.ts
│   ├── findPatterns.ts
│   └── index.ts
└── supabase/
    ├── client.ts
    ├── query.ts
    ├── subscribe.ts
    └── index.ts
```

## Usage Examples

### Basic Project Evaluation

```typescript
import { evaluateProject, formatEvaluateProjectForContext } from './servers/iris-prime';

const result = await evaluateProject('nfl-predictor');

// Format for Claude's context
const formatted = formatEvaluateProjectForContext(result);
console.log(formatted);
// Outputs:
// ## Evaluate project against expert consensus
//
// {
//   "score": 0.92,
//   "drift": 0.08,
//   "recommendations": [...]
// }
//
// (loaded into model context)
```

### Drift Detection

```typescript
import { detectDrift } from './servers/iris-prime';

const alert = await detectDrift('expert-123', 'v2.0.0', 0.15);

if (alert.driftDetected) {
  console.log(`⚠️ Drift detected: ${alert.driftScore}`);
  console.log(`Recommendations: ${alert.recommendations.join(', ')}`);
}
```

### Consensus Tracking

```typescript
import { getConsensus } from './servers/iris-prime';

const lineage = await getConsensus('decision-456', 'expert-123');

console.log(`Decision confidence: ${lineage.confidence}`);
console.log(`Participating experts: ${lineage.expertIds.length}`);
```

### Batch Operations (Enhanced Template)

```typescript
import { batchCallMCPTools } from './servers/iris-prime/client';

const results = await batchCallMCPTools([
  { toolName: 'evaluateProject', args: { projectId: 'project-1' } },
  { toolName: 'evaluateProject', args: { projectId: 'project-2' } },
  { toolName: 'getMetrics', args: { timeRange: '24h' } },
]);

console.log('All evaluations:', results);
```

### Caching (Enhanced Template)

```typescript
import { evaluateProject } from './servers/iris-prime';

// First call - hits MCP server
const result1 = await evaluateProject('project-1', { cache: true });

// Second call - returns cached result (within 5 minutes)
const result2 = await evaluateProject('project-1', { cache: true });

// Force fresh data
const result3 = await evaluateProject('project-1', { cache: false });
```

### Error Handling with Retry

```typescript
import { evaluateProject } from './servers/iris-prime';

try {
  const result = await evaluateProject('project-1', {
    retry: 5,  // Retry up to 5 times
  });
  console.log('Success:', result);
} catch (error) {
  console.error('Failed after 5 retries:', error);
}
```

## Templates

### Standard Template

Basic functionality with no caching or retry logic.

```bash
npm run iris generate wrappers -- --template standard
```

**Features:**
- Simple MCP tool wrappers
- Basic client connection
- Context formatters

### Enhanced Template

Advanced features for production use.

```bash
npm run iris generate wrappers -- --template enhanced
```

**Features:**
- ✅ Automatic response caching (5-minute TTL)
- ✅ Retry logic with exponential backoff
- ✅ Batch operations
- ✅ Connection pooling
- ✅ Enhanced error handling

## Integration Patterns

### React Integration

```typescript
// hooks/useIRISEvaluation.ts
import { useQuery } from '@tanstack/react-query';
import { evaluateProject } from '../servers/iris-prime';

export function useIRISEvaluation(projectId: string) {
  return useQuery({
    queryKey: ['iris-evaluation', projectId],
    queryFn: () => evaluateProject(projectId, { cache: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Component
function ProjectStatus({ projectId }: { projectId: string }) {
  const { data, isLoading } = useIRISEvaluation(projectId);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>Evaluation Score: {data.score}</h2>
      <p>Drift: {data.drift}</p>
    </div>
  );
}
```

### API Route Integration (Next.js)

```typescript
// app/api/evaluate/route.ts
import { evaluateProject } from '@/servers/iris-prime';

export async function POST(request: Request) {
  const { projectId } = await request.json();

  const result = await evaluateProject(projectId, {
    cache: true,
    retry: 3,
  });

  return Response.json(result);
}
```

### Background Job Integration

```typescript
// jobs/drift-monitor.ts
import { detectDrift } from '../servers/iris-prime';

async function monitorDrift() {
  const projects = await getActiveProjects();

  for (const project of projects) {
    const alert = await detectDrift(
      project.expertId,
      project.version,
      0.15 // threshold
    );

    if (alert.driftDetected) {
      await sendAlert({
        project: project.id,
        drift: alert.driftScore,
        recommendations: alert.recommendations,
      });
    }
  }
}

// Run every hour
setInterval(monitorDrift, 60 * 60 * 1000);
```

## Advanced Usage

### Custom MCP Server

To add support for a new MCP server:

1. **Install the MCP server:**
   ```bash
   claude mcp add my-server npx my-server mcp start
   ```

2. **Generate wrappers:**
   ```bash
   npm run iris generate wrappers -- --servers my-server
   ```

3. **Use the wrappers:**
   ```typescript
   import { myTool } from './servers/my-server';
   const result = await myTool('arg1', 'arg2');
   ```

### Extending Generated Wrappers

You can extend generated wrappers with custom logic:

```typescript
// servers/iris-prime/custom.ts
import { evaluateProject } from './evaluateProject';

export async function evaluateProjectWithNotification(projectId: string) {
  const result = await evaluateProject(projectId);

  if (result.score < 0.7) {
    await sendSlackNotification({
      message: `Low score for ${projectId}: ${result.score}`,
    });
  }

  return result;
}
```

## Troubleshooting

### No MCP Servers Found

```bash
# Check Claude config
cat ~/.claude/mcp.json

# Add missing servers
claude mcp add iris-prime npx iris-prime mcp start
```

### Connection Errors

```typescript
// Ensure client is started
import { startClient, shutdownClient } from './servers/iris-prime/client';

try {
  await startClient();
  const result = await evaluateProject('project-1');
} finally {
  await shutdownClient();
}
```

### Type Errors

```bash
# Regenerate wrappers with latest schemas
npm run iris generate wrappers -- --force
```

## Best Practices

1. **Use caching for read-heavy operations**
   ```typescript
   const result = await evaluateProject(id, { cache: true });
   ```

2. **Batch related operations**
   ```typescript
   const results = await batchCallMCPTools([...]);
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     const result = await evaluateProject(id, { retry: 3 });
   } catch (error) {
     console.error('Evaluation failed:', error);
   }
   ```

4. **Close connections when done**
   ```typescript
   await shutdownClient();
   ```

5. **Format results for Claude**
   ```typescript
   const formatted = formatEvaluateProjectForContext(result);
   console.log(formatted); // Shows "(loaded into model context)"
   ```

## Performance

### Caching Benefits (Enhanced Template)

- **First call**: ~500ms (MCP server invocation)
- **Cached call**: ~5ms (memory lookup)
- **Cache TTL**: 5 minutes (configurable)

### Batch Operations

- **Sequential**: 3 calls × 500ms = 1500ms
- **Batched**: 1 call × 500ms = 500ms (3× faster)

### Retry Logic

- **Default retries**: 3
- **Backoff**: Exponential (1s, 2s, 3s)
- **Total max time**: ~6 seconds for 3 retries

## Contributing

To add new templates or features:

1. Edit `/home/iris/code/experimental/iris-prime-console/scripts/mcp/wrapper-templates.ts`
2. Add your template to the `templates` export
3. Regenerate wrappers to test

## Related Documentation

- [IRIS MCP Client](/home/iris/code/experimental/iris-prime-console/src/mcp/README.md)
- [Supabase Integration](/home/iris/code/experimental/iris-prime-console/docs/IRIS_PRIME_SUPABASE_INTEGRATION.md)
- [Global Metrics](/home/iris/code/experimental/iris-prime-console/docs/GLOBAL_METRICS_SUPABASE_INTEGRATION.md)

---

**Generated by IRIS MCP Wrapper Generator**
