# iris-evaluate

Evaluate a single project's expert performance against current metrics and objectives.

## Usage

```bash
/iris-evaluate [project-name] [--metrics <metric-list>] [--baseline <version>]
```

## Options

- `project-name` - Target project identifier (defaults to current project)
- `--metrics` - Specific metrics to evaluate (comma-separated)
- `--baseline` - Compare against specific version/baseline
- `--verbose` - Show detailed evaluation breakdown
- `--save` - Save evaluation results to Supabase

## Examples

### Evaluate current project
```bash
/iris-evaluate
```

### Evaluate specific project with custom metrics
```bash
/iris-evaluate iris-prime-console --metrics accuracy,latency,cost
```

### Compare against baseline
```bash
/iris-evaluate --baseline v1.0.0 --verbose
```

### Full evaluation with save
```bash
/iris-evaluate iris-prime-console --metrics all --save
```

## What This Does

1. **Loads Expert Model**: Retrieves the trained expert for the specified project
2. **Collects Metrics**: Gathers current performance data from telemetry
3. **Runs Evaluation**: Compares current performance against:
   - Historical baselines
   - Expected performance targets
   - Cross-project benchmarks
4. **Analyzes Drift**: Detects any performance degradation or drift
5. **Generates Report**: Creates detailed evaluation with recommendations

The evaluation covers:
- **Accuracy Metrics**: Task completion, error rates, success ratios
- **Performance Metrics**: Latency, throughput, resource usage
- **Cost Metrics**: Token usage, API costs, efficiency
- **Quality Metrics**: Code quality, test coverage, patterns used

## When to Use

- **After Major Changes**: Validate that refactoring didn't degrade performance
- **Before Deployment**: Ensure expert meets quality thresholds
- **Regular Health Checks**: Weekly/monthly performance reviews
- **Debugging Issues**: Understand why performance changed
- **Baseline Creation**: Establish new performance baselines

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ IRIS Evaluation Report: iris-prime-console                  ║
╠══════════════════════════════════════════════════════════════╣
║ Expert Version: 2.3.1                                        ║
║ Evaluation Time: 2025-11-17 14:23:15                        ║
║ Baseline: v2.0.0                                             ║
╠══════════════════════════════════════════════════════════════╣
║ PERFORMANCE METRICS                                          ║
╠══════════════════════════════════════════════════════════════╣
║ Accuracy:        94.2% (↑ 2.1% from baseline)               ║
║ Avg Latency:     245ms (↓ 15ms from baseline)               ║
║ Token Efficiency: 87.3% (↑ 5.2% from baseline)              ║
║ Error Rate:      1.2% (↓ 0.8% from baseline)                ║
╠══════════════════════════════════════════════════════════════╣
║ DRIFT ANALYSIS                                               ║
╠══════════════════════════════════════════════════════════════╣
║ Status: HEALTHY ✓                                            ║
║ Drift Score: 0.12 (threshold: 0.25)                         ║
║ Recommendation: No immediate retraining needed               ║
╠══════════════════════════════════════════════════════════════╣
║ TOP PATTERNS LEARNED                                         ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Concurrent file operations (+12% efficiency)             ║
║ 2. Supabase batching (+8% speed)                            ║
║ 3. Error recovery patterns (+5% reliability)                ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/iris-evaluate-all` - Evaluate all projects
- `/iris-auto-retrain` - Auto-retrain if drift detected
- `/iris-health` - Overall system health
- `/iris-drift` - Detailed drift analysis
- `/telemetry-stats` - View raw telemetry data
