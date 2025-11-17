# consensus-lineage

Track and visualize expert version lineage, evolution, and decision history.

## Usage

```bash
/consensus-lineage [project] [--format <type>] [--depth <num>]
```

## Options

- `project` - Project/expert identifier (default: current)
- `--format` - Output format: tree, graph, timeline, json
- `--depth` - Version history depth (default: all)
- `--metrics` - Include performance metrics per version
- `--decisions` - Show key decisions per version

## Examples

### View lineage for current project
```bash
/consensus-lineage
```

### Detailed lineage with metrics
```bash
/consensus-lineage iris-prime-console --format tree --metrics
```

### Timeline view of evolution
```bash
/consensus-lineage iris-prime-console --format timeline --depth 10
```

## What This Does

1. **Version Tracking**: Shows complete expert evolution
2. **Decision Linking**: Connects versions to consensus decisions
3. **Performance History**: Tracks metrics across versions
4. **Branching**: Shows when experts diverged/merged
5. **Ancestry**: Traces expert origins and influences

## When to Use

- **Version Analysis**: Understand expert evolution
- **Regression Debugging**: Find when performance degraded
- **Audit Trail**: Track decision history
- **Knowledge Transfer**: See what experts learned when

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Expert Lineage: iris-prime-console                          ║
╠══════════════════════════════════════════════════════════════╣

v1.0.0 (2025-09-15) - Initial Release
│ Performance: 78.3%
│ Decisions: 12 consensus records
│ Learning: Baseline patterns
│
├─ v1.1.0 (2025-09-22) - Error Handling Improvements
│  │ Performance: 82.1% (+3.8%)
│  │ Decisions: 8 consensus records
│  │ Key Change: Added retry logic patterns
│  │
│  ├─ v1.2.0 (2025-09-29) - Supabase Integration
│  │  Performance: 85.4% (+3.3%)
│  │  Decisions: 15 consensus records
│  │  Key Change: Batch operations learned
│  │
│  └─ v2.0.0 (2025-10-15) - Major Architecture Refactor
│     │ Performance: 91.2% (+5.8%)
│     │ Decisions: 23 consensus records
│     │ Key Change: Concurrent patterns transferred
│     │
│     ├─ v2.1.0 (2025-10-28) - Performance Optimization
│     │  Performance: 93.6% (+2.4%)
│     │  Decisions: 18 consensus records
│     │
│     └─ v2.3.1 (2025-11-17) - Current ⭐
│        Performance: 96.2% (+2.6%)
│        Decisions: 31 consensus records
│        Key Change: Advanced pattern discovery

╠══════════════════════════════════════════════════════════════╣
║ LINEAGE STATISTICS                                           ║
╠══════════════════════════════════════════════════════════════╣
║ Total Versions: 6                                            ║
║ Lifetime: 63 days                                            ║
║ Total Decisions: 107 consensus records                       ║
║ Performance Gain: +17.9% (78.3% → 96.2%)                    ║
║ Avg Version Duration: 10.5 days                              ║
╠══════════════════════════════════════════════════════════════╣
║ KEY MILESTONES                                               ║
╠══════════════════════════════════════════════════════════════╣
║ 🎯 v1.2.0 - First Supabase integration                      ║
║ 🚀 v2.0.0 - Crossed 90% performance threshold               ║
║ ⭐ v2.3.1 - Current top performer (96.2%)                   ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/consensus-record` - Record new decisions
- `/iris-retrain` - Create new expert version
- `/iris-evaluate` - Evaluate version performance
- `/consensus-search` - Search historical decisions
