# telemetry-drift

Detect and analyze performance drift from telemetry data.

## Usage

```bash
/telemetry-drift [--metric <type>] [--threshold <value>] [--project <name>]
```

## Options

- `--metric` - Metric to analyze: accuracy, latency, errors, tokens, all
- `--threshold` - Drift threshold (default: 0.15)
- `--project` - Target project (default: current)
- `--baseline` - Baseline period for comparison (default: 30 days ago)
- `--window` - Analysis window (default: 7 days)

## Examples

### Check all metrics for drift
```bash
/telemetry-drift
```

### Specific metric analysis
```bash
/telemetry-drift --metric latency --threshold 0.20
```

### Project-specific drift
```bash
/telemetry-drift --project iris-prime-console --metric accuracy
```

## What This Does

1. **Baseline Calculation**: Computes historical baseline metrics
2. **Current Analysis**: Measures recent performance
3. **Drift Detection**: Identifies significant deviations
4. **Statistical Analysis**: Uses t-tests and variance analysis
5. **Alert Generation**: Flags concerning drift patterns
6. **Recommendations**: Suggests corrective actions

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Performance Drift Analysis                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Project: iris-prime-console                                  ║
║ Analysis Window: Last 7 days vs 30-day baseline             ║
║ Threshold: ±15%                                              ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ DRIFT STATUS: WARNING ⚠️                                     ║
╠══════════════════════════════════════════════════════════════╣
║ 2 metrics showing significant drift                          ║
║ 3 metrics stable                                             ║
╠══════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────┐
│ ⚠️  ACCURACY DRIFT DETECTED                                  │
├──────────────────────────────────────────────────────────────┤
│ Baseline (30d avg):  94.2%                                   │
│ Current (7d avg):    87.8%                                   │
│ Drift:               -6.4% (exceeds -15% threshold)          │
│ Confidence:          95.3% (statistically significant)       │
├──────────────────────────────────────────────────────────────┤
│ Trend: Declining over past 7 days                           │
│ Severity: MEDIUM                                             │
│ Recommendation: Schedule retraining within 5 days            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ⚠️  LATENCY DRIFT DETECTED                                   │
├──────────────────────────────────────────────────────────────┤
│ Baseline (30d avg):  187ms                                   │
│ Current (7d avg):    245ms                                   │
│ Drift:               +31% (exceeds +15% threshold)           │
│ Confidence:          92.1% (statistically significant)       │
├──────────────────────────────────────────────────────────────┤
│ Trend: Gradual increase                                      │
│ Severity: LOW                                                │
│ Recommendation: Investigate performance bottlenecks          │
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║ STABLE METRICS ✓                                             ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Error Rate:     1.2% (baseline: 1.4%, -14%)              ║
║ ✅ Token Usage:    539 avg (baseline: 547, -1.5%)           ║
║ ✅ Success Rate:   87.3% (baseline: 89.1%, -2%)             ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ ROOT CAUSE ANALYSIS                                          ║
╠══════════════════════════════════════════════════════════════╣
║ Possible causes for drift:                                   ║
║ • Accuracy decline may indicate:                             ║
║   - New task types not in training data                      ║
║   - Changed requirements or patterns                         ║
║   - Insufficient recent retraining                           ║
║                                                              ║
║ • Latency increase may indicate:                             ║
║   - Increased data volume                                    ║
║   - API rate limiting                                        ║
║   - Network congestion                                       ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RECOMMENDED ACTIONS                                          ║
╠══════════════════════════════════════════════════════════════╣
║ Priority 1 (Do Now):                                         ║
║ 1. Review recent failed tasks for patterns                   ║
║ 2. Check for environmental changes                           ║
║                                                              ║
║ Priority 2 (This Week):                                      ║
║ 3. Schedule expert retraining (/iris-retrain)               ║
║ 4. Investigate latency with performance profiling            ║
║ 5. Review recent code changes                                ║
║                                                              ║
║ Priority 3 (Next Week):                                      ║
║ 6. Update training data with recent patterns                 ║
║ 7. Optimize high-latency operations                          ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/iris-auto-retrain` - Fix drifting experts
- `/telemetry-stats` - View detailed statistics
- `/iris-evaluate` - Evaluate expert performance
- `/iris-health` - Overall system health
