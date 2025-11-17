# reflexion-analyze

Deep analysis of reflexion trajectories to discover patterns and insights.

## Usage

```bash
/reflexion-analyze [--type <analysis>] [--period <timeframe>]
```

## Options

- `--type` - Analysis type: patterns, failures, performance, all (default: all)
- `--period` - Time period: weekly, monthly, all (default: monthly)
- `--export` - Export format: json, markdown, html
- `--cluster` - Cluster similar trajectories

## Examples

### Comprehensive analysis
```bash
/reflexion-analyze
```

### Failure pattern analysis
```bash
/reflexion-analyze --type failures --period all
```

### Cluster similar trajectories
```bash
/reflexion-analyze --cluster --export markdown
```

## What This Does

Performs deep analysis including:
- Pattern clustering
- Failure mode identification
- Success factor analysis
- Trajectory complexity analysis
- Time-to-completion patterns

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Reflexion Deep Analysis - Last 30 Days                       ║
╠══════════════════════════════════════════════════════════════╣

PATTERN CLUSTERS (5 discovered)

Cluster #1: Supabase Integration (76 trajectories)
  Common steps: Setup → Schema → Batch ops → Testing
  Avg success: 94.7%
  Avg duration: 2h 15m
  Key insight: Batch operations critical for performance

Cluster #2: API Development (42 trajectories)
  Common steps: Design → Auth → Endpoints → Testing
  Avg success: 89.3%
  Avg duration: 3h 30m
  Key insight: Authentication planning reduces failures

... [3 more clusters]

FAILURE ANALYSIS
  Common failure point: Step 3-4 of complex trajectories
  Main causes:
    1. Insufficient error handling (42%)
    2. Complex dependencies (28%)
    3. Performance issues (18%)
  Recovery rate: 76% (failures later resolved)

SUCCESS FACTORS
  • Early testing (+23% success rate)
  • Pattern reuse (+31% efficiency)
  • Incremental approach (+18% reliability)
```

## Related Commands

- `/reflexion-stats` - Statistical overview
- `/patterns-discover` - Pattern discovery
- `/iris-patterns` - View patterns
