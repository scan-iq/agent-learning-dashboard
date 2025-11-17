# iris-auto-retrain

Automatically detect and retrain experts showing performance drift across all projects.

## Usage

```bash
/iris-auto-retrain [--threshold <value>] [--max-concurrent <num>] [--dry-run]
```

## Options

- `--threshold` - Drift threshold for triggering retrain (default: 0.25)
- `--max-concurrent` - Max experts to retrain in parallel (default: 3)
- `--dry-run` - Show what would be retrained without doing it
- `--schedule` - Schedule retraining instead of immediate execution
- `--priority` - Retrain priority order: drift, usage, critical (default: drift)

## Examples

### Auto-retrain drifting experts
```bash
/iris-auto-retrain
```

### Conservative retraining with lower threshold
```bash
/iris-auto-retrain --threshold 0.15 --max-concurrent 2
```

### Preview what would be retrained
```bash
/iris-auto-retrain --dry-run
```

### Schedule nightly retraining
```bash
/iris-auto-retrain --schedule nightly --threshold 0.20
```

## What This Does

1. **System Scan**: Evaluates all registered experts across projects
2. **Drift Detection**: Identifies experts exceeding drift threshold
3. **Prioritization**: Ranks experts by:
   - Drift severity (how far from baseline)
   - Usage frequency (high-traffic projects first)
   - Critical status (mission-critical experts)
4. **Parallel Retraining**: Retrains multiple experts concurrently
5. **Validation**: Ensures retrained experts meet quality standards
6. **Monitoring**: Tracks retraining progress and results
7. **Notification**: Sends alerts on completion or failures

The auto-retraining system:
- **Detects drift automatically** using statistical analysis
- **Learns optimal retraining strategies** per project
- **Transfers successful patterns** between experts
- **Validates improvements** before deployment
- **Maintains system stability** during retraining
- **Creates audit trail** of all changes

## When to Use

- **Scheduled Maintenance**: Daily/weekly automated health checks
- **Continuous Improvement**: Keep system performing optimally
- **After System Updates**: Retrain affected experts automatically
- **Resource Optimization**: Batch retrain during low-traffic periods
- **Emergency Response**: Quickly address widespread drift
- **DevOps Automation**: Integrate into CI/CD pipelines

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ IRIS Auto-Retrain: System-Wide Intelligence Update          ║
╠══════════════════════════════════════════════════════════════╣
║ Started: 2025-11-17 15:00:00                                ║
║ Drift Threshold: 0.25                                        ║
║ Max Concurrent: 3                                            ║
╠══════════════════════════════════════════════════════════════╣

[Phase 1] Scanning Expert Models...
  ✓ Found 12 experts across all projects
  ✓ Evaluated performance metrics
  ✓ Calculated drift scores

╠══════════════════════════════════════════════════════════════╣
║ DRIFT DETECTION RESULTS                                      ║
╠══════════════════════════════════════════════════════════════╣
║ Healthy:     9 experts (drift < 0.25)                        ║
║ Needs Work:  3 experts (drift >= 0.25)                       ║
╠══════════════════════════════════════════════════════════════╣
║ RETRAINING QUEUE (Priority Order)                            ║
╠══════════════════════════════════════════════════════════════╣
║ 1. 🔴 old-frontend       Drift: 0.48 | Usage: High          ║
║ 2. 🟡 legacy-api         Drift: 0.31 | Usage: Medium        ║
║ 3. 🟡 mobile-app         Drift: 0.27 | Usage: Low           ║
╠══════════════════════════════════════════════════════════════╣

[Phase 2] Parallel Retraining (Batch 1: 3 experts)...

  [Expert 1/3] old-frontend
    ✓ Data collected (342 reflexions, 2.1k events)
    ✓ Training complete (3m 12s)
    ✓ Validation passed (94.2% → 97.1%)
    ✓ Deployed version 3.1.0

  [Expert 2/3] legacy-api
    ✓ Data collected (189 reflexions, 1.4k events)
    ✓ Training complete (2m 48s)
    ✓ Validation passed (88.3% → 93.8%)
    ✓ Deployed version 2.8.0

  [Expert 3/3] mobile-app
    ✓ Data collected (156 reflexions, 987 events)
    ✓ Training complete (2m 21s)
    ✓ Validation passed (89.1% → 92.4%)
    ✓ Deployed version 1.9.0

╠══════════════════════════════════════════════════════════════╣
║ AUTO-RETRAIN SUMMARY                                         ║
╠══════════════════════════════════════════════════════════════╣
║ Experts Retrained:    3/3 (100% success)                     ║
║ Total Time:           3m 45s                                 ║
║ Avg Improvement:      +5.8%                                  ║
║                                                              ║
║ Performance Gains:                                           ║
║   • Accuracy:    +5.8% average                               ║
║   • Efficiency:  +8.2% tokens saved                          ║
║   • Speed:       -12% latency                                ║
║   • Reliability: -43% error rate                             ║
╠══════════════════════════════════════════════════════════════╣
║ PATTERN TRANSFERS                                            ║
╠══════════════════════════════════════════════════════════════╣
║ • Concurrent ops pattern → 3 experts                         ║
║ • Error recovery pattern → 2 experts                         ║
║ • Supabase batching → 3 experts                              ║
╠══════════════════════════════════════════════════════════════╣
║ NEXT SCHEDULED RUN                                           ║
╠══════════════════════════════════════════════════════════════╣
║ 2025-11-24 15:00:00 (7 days)                                ║
║ or when drift threshold exceeded                             ║
╚══════════════════════════════════════════════════════════════╝

✅ Auto-retrain complete! All experts performing optimally.
📧 Report sent to: iris-admin@example.com
📊 Full report: /reports/auto-retrain-2025-11-17.html
```

## Related Commands

- `/iris-retrain` - Manually retrain specific expert
- `/iris-evaluate-all` - Evaluate all experts
- `/iris-drift` - Detailed drift analysis
- `/iris-health` - System health overview
- `/iris-patterns` - View transferable patterns
