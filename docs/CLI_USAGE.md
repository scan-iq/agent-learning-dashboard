# IRIS CLI Usage Guide

Complete guide for using the IRIS MCP wrapper generator CLI.

## Installation

The CLI is automatically available after installing dependencies:

```bash
npm install
```

## Available Commands

### 1. Generate MCP Wrappers

```bash
# Generate wrappers for all MCP servers
npm run generate:wrappers

# Generate with specific options
npm run iris generate wrappers -- --servers iris-prime,supabase --force

# Use enhanced template with caching and retry
npm run iris generate wrappers -- --template enhanced

# Custom output directory
npm run iris generate wrappers -- --output ./my-servers
```

**Options:**
- `--servers <list>` - Comma-separated server names
- `--output <dir>` - Output directory (default: `./servers`)
- `--force` - Overwrite existing files
- `--template <name>` - `standard` or `enhanced` (default: `standard`)

### 2. List MCP Servers

```bash
npm run mcp:list
```

Output:
```
🔍 Detecting MCP servers...

Found 2 MCP servers:

📦 iris-prime
   Command: npx
   Args: iris-prime mcp start

📦 supabase
   Command: npx
   Args: @supabase/mcp mcp start
```

### 3. Introspect Server

```bash
npm run iris introspect iris-prime
```

Output:
```
🔍 Introspecting iris-prime...

Found 6 tools:

🔧 evaluateProject
   Evaluate project against expert consensus
   Parameters:
     - projectId: string (required)
       Project identifier
     - expertId: string (optional)
       Expert signature ID
     - version: string (optional)
       Project version

🔧 detectDrift
   Detect drift between current and expert state
   Parameters:
     - expertId: string (required)
       Expert signature ID
     - version: string (required)
       Current version
     - threshold: number (optional)
       Drift threshold (0-1)
```

### 4. Check Integration Status

```bash
npm run mcp:status
```

Output:
```
📊 IRIS Integration Status

MCP Servers:
  IRIS: ✅ Configured
  Supabase: ✅ Configured

Generated Wrappers:
  Status: ✅ Available
  Wrappers: iris-prime, supabase

Recommendations:
  ✅ All systems operational
```

## Usage Examples

### Interactive Generation

```bash
$ npm run generate:wrappers

🚀 IRIS MCP Wrapper Generator

Found 2 MCP servers:
  - iris-prime
  - supabase

Generating wrappers in ./servers...

🔍 Introspecting iris-prime...
✅ Found 6 tools in iris-prime
✅ Generated 6 wrappers for iris-prime

🔍 Introspecting supabase...
✅ Found 2 tools in supabase
✅ Generated 2 wrappers for supabase

✨ Generation complete!

Wrappers available in: ./servers

Usage:
  import { evaluateProject } from './servers/iris-prime';
  const result = await evaluateProject('project-id');
```

### Selective Generation

```bash
# Generate only IRIS wrappers
npm run iris generate wrappers -- --servers iris-prime

# Generate only Supabase wrappers
npm run iris generate wrappers -- --servers supabase

# Generate multiple specific servers
npm run iris generate wrappers -- --servers iris-prime,claude-flow
```

### Force Regeneration

```bash
# Overwrite existing wrappers
npm run iris generate wrappers -- --force

# Useful when:
# - MCP server schema changes
# - You want to switch templates
# - Fixing corrupted wrappers
```

## Generated Files

After running generation, you'll have:

```
servers/
├── README.md                    # Usage documentation
├── iris-prime/
│   ├── client.ts               # MCP client wrapper
│   ├── index.ts                # Public exports
│   ├── evaluateProject.ts      # Tool wrapper
│   ├── detectDrift.ts          # Tool wrapper
│   ├── getConsensus.ts         # Tool wrapper
│   ├── queryReflexions.ts      # Tool wrapper
│   ├── getMetrics.ts           # Tool wrapper
│   └── findPatterns.ts         # Tool wrapper
└── supabase/
    ├── client.ts               # MCP client wrapper
    ├── index.ts                # Public exports
    ├── query.ts                # Tool wrapper
    └── subscribe.ts            # Tool wrapper
```

## Using Generated Wrappers

### Basic Import

```typescript
import { evaluateProject } from './servers/iris-prime';

const result = await evaluateProject('my-project-id');
console.log(result);
```

### With Options (Enhanced Template)

```typescript
import { evaluateProject } from './servers/iris-prime';

const result = await evaluateProject('my-project-id', {
  cache: true,  // Enable 5-minute cache
  retry: 3,     // Retry up to 3 times
});
```

### Batch Operations

```typescript
import { batchCallMCPTools } from './servers/iris-prime/client';

const results = await batchCallMCPTools([
  { toolName: 'evaluateProject', args: { projectId: 'project-1' } },
  { toolName: 'evaluateProject', args: { projectId: 'project-2' } },
  { toolName: 'getMetrics', args: { timeRange: '24h' } },
]);
```

### Format for Claude Context

```typescript
import {
  evaluateProject,
  formatEvaluateProjectForContext
} from './servers/iris-prime';

const result = await evaluateProject('project-id');
const formatted = formatEvaluateProjectForContext(result);

console.log(formatted);
// ## Evaluate project against expert consensus
//
// {
//   "score": 0.92,
//   ...
// }
//
// (loaded into model context)
```

## CLI Architecture

```
scripts/mcp/
├── cli.ts                      # Main CLI entry point
│   └── Commands:
│       ├── generate wrappers   # Generate TypeScript wrappers
│       ├── list                # List MCP servers
│       ├── introspect <server> # Show server tools
│       └── status              # Integration status
│
├── generate-wrappers.ts        # Core generation logic
│   └── Functions:
│       ├── detectMCPServers()  # Find Claude MCP config
│       ├── introspectMCPServer() # Get tool schemas
│       ├── generateToolWrapper() # Create tool wrapper
│       └── generateClientWrapper() # Create client wrapper
│
└── wrapper-templates.ts        # Template definitions
    └── Templates:
        ├── standard            # Basic wrappers
        └── enhanced            # With caching/retry
```

## Troubleshooting

### Error: No MCP Servers Found

**Problem:**
```
❌ No MCP servers found in Claude config.
```

**Solution:**
```bash
# Add IRIS MCP server
claude mcp add iris-prime npx iris-prime mcp start

# Add Supabase MCP server
claude mcp add supabase npx @supabase/mcp mcp start

# Verify
npm run mcp:list
```

### Error: Server Not Found

**Problem:**
```
❌ Server not found: my-server
```

**Solution:**
```bash
# List available servers
npm run mcp:list

# Use exact server name from list
npm run iris generate wrappers -- --servers iris-prime
```

### Error: Permission Denied

**Problem:**
```
Error: EACCES: permission denied, mkdir './servers'
```

**Solution:**
```bash
# Create directory first
mkdir -p servers

# Or use custom output directory you own
npm run iris generate wrappers -- --output ~/my-servers
```

### Error: Cannot Find Module

**Problem:**
```
Cannot find module './servers/iris-prime'
```

**Solution:**
```bash
# Generate wrappers first
npm run generate:wrappers

# Verify files exist
ls -la servers/iris-prime/
```

### Wrappers Out of Date

**Problem:** MCP server added new tools

**Solution:**
```bash
# Regenerate with force
npm run iris generate wrappers -- --force
```

## Advanced Usage

### Adding Custom Templates

Edit `/home/iris/code/experimental/iris-prime-console/scripts/mcp/wrapper-templates.ts`:

```typescript
export const myCustomTemplate: WrapperTemplate = {
  name: 'custom',
  description: 'My custom wrapper template',

  clientTemplate: (serverName) => `
    // Custom client code
  `,

  toolTemplate: (serverName, toolName, schema) => `
    // Custom tool wrapper code
  `,

  indexTemplate: (serverName, tools) => `
    // Custom index exports
  `,
};

// Add to exports
export const templates = {
  standard: standardTemplate,
  enhanced: enhancedTemplate,
  custom: myCustomTemplate,
};
```

Then use it:
```bash
npm run iris generate wrappers -- --template custom
```

### CI/CD Integration

```yaml
# .github/workflows/generate-wrappers.yml
name: Generate MCP Wrappers

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Generate wrappers
        run: npm run generate:wrappers -- --force

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add servers/
          git commit -m "chore: regenerate MCP wrappers" || true
          git push
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Regenerate wrappers if MCP config changed
if git diff --cached --name-only | grep -q "\.claude/mcp\.json"; then
  echo "MCP config changed, regenerating wrappers..."
  npm run generate:wrappers -- --force
  git add servers/
fi
```

## Performance Tips

### Use Enhanced Template

```bash
npm run iris generate wrappers -- --template enhanced
```

Benefits:
- 5-minute response caching
- Automatic retry with backoff
- Batch operation support
- Connection pooling

### Cache Frequently-Used Data

```typescript
// Good: Enable caching
const metrics = await getMetrics('24h', { cache: true });

// Better: Explicitly manage cache
import { callMCPTool } from './servers/iris-prime/client';

const cached = await callMCPTool('iris-prime', 'getMetrics',
  { timeRange: '24h' },
  { cache: true, retry: 3 }
);
```

### Batch Related Operations

```typescript
// Bad: Sequential calls
const eval1 = await evaluateProject('project-1');
const eval2 = await evaluateProject('project-2');
const eval3 = await evaluateProject('project-3');

// Good: Parallel calls
const results = await Promise.all([
  evaluateProject('project-1'),
  evaluateProject('project-2'),
  evaluateProject('project-3'),
]);

// Best: Batch API (enhanced template)
const results = await batchCallMCPTools([
  { toolName: 'evaluateProject', args: { projectId: 'project-1' } },
  { toolName: 'evaluateProject', args: { projectId: 'project-2' } },
  { toolName: 'evaluateProject', args: { projectId: 'project-3' } },
]);
```

## Next Steps

1. **Generate wrappers:**
   ```bash
   npm run generate:wrappers
   ```

2. **Check the examples:**
   ```bash
   cat examples/use-generated-wrappers.ts
   ```

3. **Start using in your code:**
   ```typescript
   import { evaluateProject } from './servers/iris-prime';
   const result = await evaluateProject('my-project');
   ```

4. **Set up monitoring:**
   ```bash
   npm run mcp:status
   ```

## Related Documentation

- [MCP Wrapper Generator Guide](/home/iris/code/experimental/iris-prime-console/docs/MCP_WRAPPER_GENERATOR.md)
- [IRIS Integration](/home/iris/code/experimental/iris-prime-console/docs/IRIS_PRIME_SUPABASE_INTEGRATION.md)
- [Supabase Integration](/home/iris/code/experimental/iris-prime-console/docs/SUPABASE_HELPERS_REVIEW.md)

---

**Questions or Issues?**
Open an issue on GitHub or check the troubleshooting section above.
