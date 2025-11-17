# iris-drift

Detect and analyze performance drift across expert models.

## Usage

```bash
/iris-drift [--expert <id>] [--threshold <value>] [--detailed]
```

## Options

- `--expert` - Specific expert ID (default: all)
- `--threshold` - Drift threshold (default: 0.25)
- `--detailed` - Show detailed drift analysis
- `--auto-fix` - Automatically retrain drifting experts

## Examples

### Check all experts for drift
```bash
/iris-drift
```

### Detailed drift analysis
```bash
/iris-drift --expert iris-prime-console --detailed
```

### Auto-fix drifting experts
```bash
/iris-drift --threshold 0.20 --auto-fix
```

## What This Does

Analyzes performance drift using:
- Historical baselines
- Recent performance metrics
- Statistical significance testing
- Trend analysis

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Drift Detection Analysis                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Experts Analyzed: 12                                         ║
║ Drift Threshold: 0.25                                        ║
╠══════════════════════════════════════════════════════════════╣

🟢 HEALTHY EXPERTS (10)
  • iris-prime-console: 0.08 drift
  • agent-learning-core: 0.12 drift
  ... [8 more]

🟡 WARNING DRIFT (1)
  • legacy-api: 0.31 drift (exceeds threshold)
    Recommendation: Retrain within 5 days

🔴 CRITICAL DRIFT (1)
  • old-frontend: 0.48 drift (critical)
    Recommendation: Retrain immediately

╔══════════════════════════════════════════════════════════════╗
║ ACTIONS REQUIRED                                             ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Retrain old-frontend immediately                          ║
║ 2. Schedule legacy-api retrain next week                     ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/iris-auto-retrain` - Auto-retrain drifting experts
- `/telemetry-drift` - Telemetry-based drift detection
- `/iris-evaluate` - Detailed performance evaluation
