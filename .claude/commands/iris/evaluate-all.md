# iris-evaluate-all

Run comprehensive cross-project evaluation across all expert models in the IRIS system.

## Usage

```bash
/iris-evaluate-all [--threshold <value>] [--parallel] [--export <format>]
```

## Options

- `--threshold` - Minimum performance threshold (0-1, default: 0.85)
- `--parallel` - Run evaluations in parallel for speed
- `--export` - Export results (json, csv, markdown, html)
- `--compare` - Include cross-project comparisons
- `--drift-only` - Show only projects with detected drift

## Examples

### Evaluate all projects
```bash
/iris-evaluate-all
```

### Parallel evaluation with export
```bash
/iris-evaluate-all --parallel --export markdown
```

### Find drifting projects
```bash
/iris-evaluate-all --drift-only --threshold 0.90
```

### Full comparison report
```bash
/iris-evaluate-all --compare --export html
```

## What This Does

1. **Discovers Experts**: Scans Supabase for all registered expert models
2. **Parallel Evaluation**: Runs evaluations concurrently across projects
3. **Cross-Analysis**: Compares performance across different domains
4. **Pattern Detection**: Identifies common patterns and anti-patterns
5. **Drift Identification**: Flags projects needing retraining
6. **Ranking**: Ranks projects by performance and health

The evaluation provides:
- **Per-Project Metrics**: Individual performance scores
- **Comparative Analysis**: How projects compare to each other
- **Pattern Transfer**: Which patterns work across projects
- **Drift Detection**: Projects showing performance degradation
- **Recommendations**: Prioritized actions for improvement

## When to Use

- **Weekly Reviews**: Regular health check of entire system
- **Before Major Releases**: Ensure all experts are performing well
- **After System Changes**: Validate that updates didn't break experts
- **Capacity Planning**: Understand which experts need resources
- **Knowledge Transfer**: Identify successful patterns to share
- **Executive Reporting**: Generate system-wide intelligence reports

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ IRIS Cross-Project Evaluation Report                        ║
╠══════════════════════════════════════════════════════════════╣
║ Total Experts: 12                                            ║
║ Evaluation Time: 2025-11-17 14:30:00                        ║
║ Duration: 4.2s (parallel)                                    ║
╠══════════════════════════════════════════════════════════════╣
║ SYSTEM HEALTH: GOOD ✓                                        ║
╠══════════════════════════════════════════════════════════════╣
║ Healthy:  10 (83.3%)                                         ║
║ Warning:   1 (8.3%)  - Minor drift detected                 ║
║ Critical:  1 (8.3%)  - Retraining needed                    ║
╠══════════════════════════════════════════════════════════════╣
║ TOP PERFORMING EXPERTS                                       ║
╠══════════════════════════════════════════════════════════════╣
║ 1. iris-prime-console      96.2% ⭐                          ║
║ 2. agent-learning-core      94.8% ⭐                          ║
║ 3. claude-flow             93.1% ⭐                          ║
║ 4. flow-nexus              91.7%                             ║
║ 5. supabase-integration    90.3%                             ║
╠══════════════════════════════════════════════════════════════╣
║ PROJECTS NEEDING ATTENTION                                   ║
╠══════════════════════════════════════════════════════════════╣
║ ⚠️  legacy-api (82.1%) - Minor drift, retrain in 7 days     ║
║ 🔴 old-frontend (76.4%) - Critical drift, retrain now       ║
╠══════════════════════════════════════════════════════════════╣
║ CROSS-PROJECT INSIGHTS                                       ║
╠══════════════════════════════════════════════════════════════╣
║ • Supabase batching pattern successful across 8 projects    ║
║ • Concurrent operations improved avg speed by 32%           ║
║ • Error recovery pattern reduced failures by 45%            ║
║ • Token efficiency averaged 89.2% system-wide               ║
╠══════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS                                              ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Retrain 'old-frontend' expert immediately                ║
║ 2. Schedule 'legacy-api' retraining next week               ║
║ 3. Transfer Supabase patterns to remaining 4 projects       ║
║ 4. Increase monitoring on projects below 90%                ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/iris-evaluate` - Evaluate single project
- `/iris-auto-retrain` - Auto-retrain drifting experts
- `/iris-health` - System health overview
- `/iris-patterns` - Pattern analysis
- `/iris-drift` - Detailed drift analysis
- `/iris-report` - Generate full intelligence report
