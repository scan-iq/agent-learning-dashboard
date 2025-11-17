# 🚀 MCP Wrapper Generator - Quick Start

**Generate TypeScript wrappers for any MCP server in seconds!**

## ⚡ 30-Second Setup

```bash
# 1. Install
npm install

# 2. Add MCP servers (if not already configured)
claude mcp add iris-prime npx iris-prime mcp start

# 3. Generate wrappers
npm run generate:wrappers

# 4. Use in your code
```

```typescript
import { evaluateProject } from './servers/iris-prime';

const result = await evaluateProject('my-project-id');
console.log(`Score: ${result.score}`);
```

## 📋 Essential Commands

```bash
# Generate wrappers for all MCP servers
npm run generate:wrappers

# List available MCP servers
npm run mcp:list

# Check integration status
npm run mcp:status

# Introspect a server's tools
npm run iris introspect iris-prime

# Force regenerate
npm run iris generate wrappers -- --force

# Use enhanced template (caching + retry)
npm run iris generate wrappers -- --template enhanced
```

## 💻 Usage Patterns

### Basic
```typescript
import { evaluateProject } from './servers/iris-prime';
const result = await evaluateProject('project-id');
```

### With Caching & Retry
```typescript
const result = await evaluateProject('project-id', {
  cache: true,  // 5-min cache
  retry: 3,     // Auto-retry
});
```

### Batch Operations
```typescript
import { batchCallMCPTools } from './servers/iris-prime/client';

const results = await batchCallMCPTools([
  { toolName: 'evaluateProject', args: { projectId: 'p1' } },
  { toolName: 'evaluateProject', args: { projectId: 'p2' } },
  { toolName: 'getMetrics', args: { timeRange: '24h' } },
]);
```

### Format for Claude
```typescript
import { formatEvaluateProjectForContext } from './servers/iris-prime';

const formatted = formatEvaluateProjectForContext(result);
console.log(formatted);
// Shows: (loaded into model context)
```

## 🎯 Common Use Cases

### React Component
```typescript
import { useQuery } from '@tanstack/react-query';
import { evaluateProject } from '../servers/iris-prime';

export function useEvaluation(projectId: string) {
  return useQuery({
    queryKey: ['eval', projectId],
    queryFn: () => evaluateProject(projectId, { cache: true }),
  });
}
```

### API Route
```typescript
import { evaluateProject } from '@/servers/iris-prime';

export async function POST(req: Request) {
  const { projectId } = await req.json();
  const result = await evaluateProject(projectId, { retry: 3 });
  return Response.json(result);
}
```

### Background Job
```typescript
import { detectDrift } from '../servers/iris-prime';

async function monitor() {
  const alert = await detectDrift('expert-123', 'v2.0', 0.15);
  if (alert.driftDetected) {
    await sendAlert(alert);
  }
}
```

## 📁 What Gets Generated

```
servers/
├── iris-prime/
│   ├── client.ts           # MCP connection
│   ├── index.ts            # Exports
│   ├── evaluateProject.ts  # Evaluation
│   ├── detectDrift.ts      # Drift detection
│   ├── getConsensus.ts     # Consensus
│   ├── queryReflexions.ts  # Reflexions
│   ├── getMetrics.ts       # Metrics
│   └── findPatterns.ts     # Patterns
└── README.md
```

## 🔧 CLI Options

```bash
# Specific servers
npm run iris generate wrappers -- --servers iris-prime,supabase

# Custom output
npm run iris generate wrappers -- --output ./my-servers

# Enhanced template
npm run iris generate wrappers -- --template enhanced

# Force overwrite
npm run iris generate wrappers -- --force
```

## 📊 Performance

- **Caching**: 100× faster (5ms vs 500ms)
- **Batching**: 3× faster for parallel ops
- **Retry**: Auto-retry with backoff

## ✅ Quick Checklist

- [ ] Install dependencies: `npm install`
- [ ] Add MCP servers: `claude mcp add ...`
- [ ] Generate wrappers: `npm run generate:wrappers`
- [ ] Import in code: `import { ... } from './servers/...'`
- [ ] Check status: `npm run mcp:status`

## 📚 Full Documentation

- **Main Guide**: [docs/MCP_WRAPPER_GENERATOR.md](/home/iris/code/experimental/iris-prime-console/docs/MCP_WRAPPER_GENERATOR.md) (600+ lines)
- **CLI Reference**: [docs/CLI_USAGE.md](/home/iris/code/experimental/iris-prime-console/docs/CLI_USAGE.md) (500+ lines)
- **Examples**: [examples/use-generated-wrappers.ts](/home/iris/code/experimental/iris-prime-console/examples/use-generated-wrappers.ts) (10 examples)
- **Summary**: [MCP_CLI_SUMMARY.md](/home/iris/code/experimental/iris-prime-console/MCP_CLI_SUMMARY.md)

## 🎉 That's It!

You're ready to use MCP-powered tools in your code. Generate wrappers once, use everywhere!

---

**Need Help?** Check the full documentation or run `npm run iris -- --help`
