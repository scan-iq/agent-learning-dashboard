# iris-patterns

Discover, analyze, and manage transferable patterns across all expert models.

## Usage

```bash
/iris-patterns [action] [--domain <name>] [--threshold <value>] [--export]
```

## Options

- `action` - Action to perform: discover, list, transfer, analyze (default: list)
- `--domain` - Filter by domain (e.g., supabase, api, frontend)
- `--threshold` - Success threshold for pattern discovery (default: 0.80)
- `--export` - Export patterns (json, markdown, code-snippets)
- `--transferable-only` - Show only cross-domain transferable patterns

## Examples

### List all discovered patterns
```bash
/iris-patterns list
```

### Discover new patterns from recent data
```bash
/iris-patterns discover --threshold 0.85
```

### Analyze Supabase-related patterns
```bash
/iris-patterns analyze --domain supabase
```

### Export transferable patterns as code snippets
```bash
/iris-patterns list --transferable-only --export code-snippets
```

## What This Does

1. **Pattern Discovery**: Analyzes successful trajectories to find recurring patterns
2. **Pattern Validation**: Tests patterns across multiple contexts
3. **Transferability Analysis**: Determines which patterns work cross-domain
4. **Impact Measurement**: Quantifies pattern effectiveness
5. **Knowledge Graph**: Builds relationships between patterns
6. **Auto-Transfer**: Suggests or applies patterns to other experts

Pattern types discovered:
- **Code Patterns**: Reusable code structures and algorithms
- **Workflow Patterns**: Successful task execution sequences
- **Architecture Patterns**: Effective system design approaches
- **Error Handling**: Robust error recovery strategies
- **Optimization Patterns**: Performance improvement techniques
- **Integration Patterns**: Best practices for API/service integration

## When to Use

- **Knowledge Sharing**: Transfer expertise between projects
- **New Project Setup**: Apply proven patterns to new work
- **Performance Tuning**: Find optimization opportunities
- **Training**: Teach new experts from successful patterns
- **Code Review**: Validate against known best practices
- **Documentation**: Generate pattern libraries

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ IRIS Pattern Discovery & Analysis                           ║
╠══════════════════════════════════════════════════════════════╣
║ Total Patterns: 67                                           ║
║ Domains: 8                                                   ║
║ Transferable: 34 (50.7%)                                     ║
║ Last Updated: 2025-11-17 15:15:00                           ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ TOP TRANSFERABLE PATTERNS                                    ║
╠══════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────┐
│ Pattern #1: Concurrent File Operations                      │
├──────────────────────────────────────────────────────────────┤
│ Domain:        File I/O, System Operations                   │
│ Success Rate:  96.3% across 8 projects                       │
│ Impact:        +32% speed, +12% efficiency                   │
│ Transferable:  ⭐⭐⭐⭐⭐ (Highly transferable)               │
├──────────────────────────────────────────────────────────────┤
│ Description:                                                 │
│ Batch file operations (read/write/edit) in parallel within  │
│ single message to maximize Claude Code's concurrent         │
│ execution capabilities.                                      │
├──────────────────────────────────────────────────────────────┤
│ Code Example:                                                │
│   // Instead of sequential:                                  │
│   Read("file1.ts")                                           │
│   Read("file2.ts")  // New message                           │
│                                                              │
│   // Do parallel in ONE message:                             │
│   Read("file1.ts") + Read("file2.ts") + Read("file3.ts")    │
├──────────────────────────────────────────────────────────────┤
│ Applied To: iris-prime-console, agent-learning-core,        │
│             claude-flow, flow-nexus, 4 others                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Pattern #2: Supabase Batch Operations                       │
├──────────────────────────────────────────────────────────────┤
│ Domain:        Database, Supabase Integration               │
│ Success Rate:  94.1% across 6 projects                       │
│ Impact:        +45% speed, -18% API calls                    │
│ Transferable:  ⭐⭐⭐⭐ (Very transferable)                   │
├──────────────────────────────────────────────────────────────┤
│ Description:                                                 │
│ Use Supabase batch insert/update/upsert operations instead  │
│ of individual calls to reduce round trips and improve        │
│ performance.                                                 │
├──────────────────────────────────────────────────────────────┤
│ Code Example:                                                │
│   // Instead of loops:                                       │
│   for (item of items) {                                      │
│     await supabase.from('table').insert(item)                │
│   }                                                          │
│                                                              │
│   // Use batch:                                              │
│   await supabase.from('table').insert(items)                 │
├──────────────────────────────────────────────────────────────┤
│ Applied To: iris-prime-console, consensus-tracker,          │
│             reflexion-monitor, 3 others                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Pattern #3: Error Recovery with Exponential Backoff         │
├──────────────────────────────────────────────────────────────┤
│ Domain:        Error Handling, Reliability                   │
│ Success Rate:  91.8% across 10 projects                      │
│ Impact:        -67% failures, +23% reliability               │
│ Transferable:  ⭐⭐⭐⭐⭐ (Universal)                         │
├──────────────────────────────────────────────────────────────┤
│ Description:                                                 │
│ Implement retry logic with exponential backoff for          │
│ transient failures in API calls, database operations,       │
│ and network requests.                                        │
├──────────────────────────────────────────────────────────────┤
│ Applied To: All 10 active projects                          │
└──────────────────────────────────────────────────────────────┘

╠══════════════════════════════════════════════════════════════╣
║ DOMAIN BREAKDOWN                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Supabase Integration:  12 patterns (8 transferable)         ║
║ File Operations:        9 patterns (7 transferable)         ║
║ Error Handling:         8 patterns (8 transferable)         ║
║ API Design:             7 patterns (4 transferable)         ║
║ Performance:            6 patterns (5 transferable)         ║
║ Testing:                5 patterns (2 transferable)         ║
║ Architecture:           4 patterns (0 transferable)         ║
║ Misc:                  16 patterns (0 transferable)         ║
╠══════════════════════════════════════════════════════════════╣
║ TRANSFER RECOMMENDATIONS                                     ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Apply "Concurrent Operations" to: new-project-x          ║
║ 2. Apply "Supabase Batching" to: legacy-dashboard           ║
║ 3. Apply "Error Recovery" to: mobile-app, api-gateway       ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/iris-transfer` - Transfer patterns between experts
- `/iris-evaluate` - See pattern impact on performance
- `/patterns-discover` - Deep pattern discovery
- `/patterns-learn` - Learn from pattern library
- `/reflexion-search` - Find patterns in reflexions
